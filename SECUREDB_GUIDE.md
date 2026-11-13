# SERICEO CRM 개인정보 암호화(KSign SecureDB Agentless) 적용 구조 및 동작 설명서

> 작성일: 2026-11-13  
> 작성자: khma (KYDBM)

본 문서는 SERICEO CRM(MonArch 8.2.0)에 적용된 **KSign SecureDB Java API V2 (Agentless HTTPS 방식)**의 전체 동작 원리, 소스 코드 위치별 역할, 업무 시나리오별 처리 흐름 및 배포 환경 구성을 고객 설명 및 운영 인수인계 목적으로 정리한 가이드입니다.

---

## 1. 전체 연동 구조 개요

### 1.1 Agentless HTTPS 방식 채택 배경
- **별도 로컬 데몬/네이티브 모듈 불필요**: WAS 서버에 C/JNI 기반 에이전트나 OS 데몬을 별도로 설치하지 않고, 순수 Java 라이브러리(`SDBAgentlessAPIforJava-V3.7.3-2.0.4.jar`)만 애플리케이션에 포함하여 동작합니다.
- **HTTPS + 인증서 기반 통신**: WAS와 SecureDB 정책서버 간 통신은 HTTPS(TLS) 및 서버 인증서(`ca_dev.pem` / `ca.pem`, `rootca.pem`)와 API 토큰(`securedb.agentless.token`)으로 인증합니다.
- **환경 이식성**: Java 소스나 JAR 파일 수정 없이 `src/monarch.properties` 설정과 인증서 파일 배치만으로 VDI 로컬 테스트, 개발서버(`112.106.119.13`), 운영서버(`112.106.119.183`) 환경을 동일하게 전환할 수 있습니다.

### 1.2 핵심 설계 원칙 (네이밍 컨벤션 기반 공통 자동화)
- **특정 테이블/컬럼 하드코딩 배제**: 화면이나 테이블마다 개별 암복호화 Java 코드를 작성하지 않습니다.
- **컬럼/파라미터 네이밍 규칙 자동 처리**:
  - `*_ENC`: 대칭키 암호화 저장 및 자동 복호화 대상 컬럼/파라미터
  - `*_HASH`: 암호화된 데이터의 색인 검색을 위한 NTS(Non-Tokenizing Search) 해시 토큰 컬럼/파라미터
- **점진적 전환 및 기존 로직 호환**: 기존 평문 컬럼(`NAME` 등)과 암호화 컬럼(`NAME_ENC` 등)을 병행하거나 SQL만 단계적으로 전환해도 공통 백엔드 엔진이 자동으로 처리합니다.

---

## 2. 관련 파일 및 핵심 메서드 위치

| 구분 | 파일 경로 | 핵심 메서드 / 설정 키 | 담당 역할 |
| :--- | :--- | :--- | :--- |
| **라이브러리** | `WebContent/WEB-INF/lib/SDBAgentlessAPIforJava-V3.7.3-2.0.4.jar` | `AgentlessApiFactory`, `SDBAgentlessApi` | KSign SecureDB Agentless Java API V2 공식 라이브러리 |
| **환경설정** | `src/monarch.properties` | `securedb.agentless.*`, `securedb.policy.*` | 환경별(`[1] VDI / [2] 개발 / [3] 운영`) 정책서버 URL, 토큰, 인증서 경로, 정책명(`AES256_*`, `SHA512_*`) 관리 |
| **암복호화 엔진** | `src/co/kr/kydbm/common/crypto/CryptoService.java` | `getInstance()`, `isAvailable()`, `encrypt()`, `decrypt()`, `getNts()`, `getNtsBsh()`, `close()` | `SDBAgentlessApi` 싱글턴 관리, 암복호화 및 NTS 토큰 생성, JVM 종료 시 리소스 정리, 통신 장애 시 Fallback 방어 |
| **공통 DAO** | `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | `injectPrivacyParams()`, `decryptRow()`, `convertHashSearchParam()` | SQL 실행 전 파라미터 자동 암호화/토큰 생성(`*_ENC`, `@*_HASH@`), 조회 결과 `*_ENC` 자동 복호화, 검색 파라미터 NTS 변환 |
| **확장 검색 필터** | `src/co/kr/kydbm/core/utils/FilterGenerator.java` | `isNtsTargetQuery()`, `isHashField()`, `makeTextQry()`, `getExtFilterParams()` | 그리드 동적 확장 필터(`extFilters`)에서 `_HASH` 쿼리 판별 및 `=` / `LIKE` 조건 NTS 변환 |
| **엑셀 다운로드** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | `downStream()`, `RowCallbackHandler.processRow()`, `decryptIfEncCell()` | 대용량 엑셀(XLSX)/CSV 스트리밍 조회 시 `*_ENC` 컬럼 자동 복호화 출력 |

---

## 3. 업무 흐름별 상세 동작

### 3.1 데이터 등록 및 수정 (`CREATE`, `UPDATE`)
1. 화면에서 `SvcCRUD.java` (`/DATACRUD.json`)를 거쳐 `MonArchDaoImpl.java`의 `exeCreate` / `exeCreateIdentity` / `exeUpdate` / `exeQuery`가 호출됩니다.
2. SQL 실행 직전 `injectPrivacyParams(sqlCmd, parameters)`가 동작합니다.
   - **일반 평문 파라미터**(`@NAME@` 등): 변경 없이 그대로 유지합니다.
   - **`*_ENC` 파라미터**(`@NAME_ENC@` 등): `CryptoService.encrypt()`를 호출하여 `"$."` 접두어가 붙은 암호문으로 변환합니다. (값이 이미 `"$."`로 시작하면 중복 암호화하지 않습니다.)
   - **`@*_HASH@` 파라미터**: 실행할 SQL 문 안에 `@*_HASH@` 바인딩 변수가 실제로 존재하는 경우에만 원문 값으로부터 `CryptoService.getNts()` 색인 토큰을 생성해 자동 주입합니다.

### 3.2 목록 및 상세 조회 (`LIST`, `READ`)
1. `MonArchDaoImpl.java`의 `exeList`, `exeRead`, `exeGetFirstRow` 등에서 DB 조회 결과를 반환받습니다.
2. 각 결과 Row마다 `decryptRow(rowMap)`이 동작합니다.
   - 컬럼명이 `*_ENC`로 끝나고, DB 값이 `"$."`로 시작하는 암호문인 경우에만 `CryptoService.decrypt()`를 호출해 평문으로 복호화합니다.
   - 아직 암호화되지 않은 과거 평문 데이터가 섞여 있더라도 `"$."` 접두어 판별을 통해 오류 없이 그대로 출력됩니다.

### 3.3 검색 조회 (일반 조건 검색 + 그리드 확장 필터)
암호화된 컬럼은 DB에서 일반 `LIKE '%검색어%'` 검색이나 인덱스 조회가 불가능하므로, `*_HASH` 컬럼과 SecureDB NTS 토큰을 결합해 검색합니다.

1. **일반 SQL 파라미터 검색 (`MonArchDaoImpl.convertHashSearchParam`)**
   - SQL 내 `@*_HASH@` 바인딩 파라미터의 사용 패턴을 판별해 검색어를 자동 변환합니다.
   - `LIKE @*_HASH@` 형태(전방일치): `CryptoService.getNtsBsh()` 호출
   - `=` 또는 `LIKE '%' || @*_HASH@ || '%'` 형태(일치/부분검색): `CryptoService.getNts()` 호출
   - 일반 `@NAME@`, `@NAME_ENC@` 조건은 별도 변환 없이 그대로 유지합니다.
2. **그리드 확장 필터 검색 (`FilterGenerator.java`)**
   - `isNtsTargetQuery()`가 실행 대상 SQL에 `_HASH`가 포함되어 있는지 동적으로 확인합니다.
   - `isHashField()`에 해당하는 검색 조건이 들어오면 `=` 조건은 `getNts()`, `LIKE` 조건은 `getNtsBsh()`로 변환하여 WHERE 절을 생성합니다.

### 3.4 대용량 엑셀 / CSV 다운로드 (`ExcelDownload.java`)
1. 엑셀 다운로드 요청 시 `ExcelDownload.downStream()`이 `MonArchDaoImpl.exeListStream()`을 통해 DB 데이터를 스트리밍 방식으로 읽어들입니다.
2. `RowCallbackHandler.processRow()` 최초 1회 실행 시 ResultSet 메타데이터에서 각 컬럼의 `*_ENC` 여부를 `encColFlags[]` 배열에 캐싱합니다.
3. 행을 출력할 때 `decryptIfEncCell()`이 `encColFlags[i]`가 `true`이고 셀 값이 `"$."`로 시작하면 `CryptoService.decrypt()`로 복호화하여 XLSX/CSV 파일에 평문으로 기록합니다.

---

## 4. 환경별 설정 및 배포 체크리스트

### 4.1 환경별 접속 구성 (`src/monarch.properties`)

| 구분 | 대상 서버 | SecureDB 정책서버 URL | 인증서 경로 (`ca.path` / `rootca.path`) | 정책명 (`cipher` / `hash`) |
| :--- | :--- | :--- | :--- | :--- |
| `[1]` | **VDI 로컬 테스트** | `https://70.2.243.122:8090` | `C:/SecureDB/ca_dev.pem` | `AES256_DEV` / `SHA512_DEV` |
| `[2]` | **개발서버 (`112.106.119.13`)** | `https://26.2.37.28:8090` | `C:/SecureDB/ca_dev.pem` | `AES256_DEV` / `SHA512_DEV` |
| `[3]` | **운영서버 (`112.106.119.183`)** | `https://26.2.37.24:8090,https://26.2.37.25:8090` | `C:/SecureDB/ca.pem`, `C:/SecureDB/rootca.pem` | `AES256_PRD` / `SHA512_PRD` |

### 4.2 WAR 생성 및 서버 배포 절차 (`D:\CRM`)
1. 배포 대상 환경에 맞춰 `src/monarch.properties`와 `src/properties/jdbc.properties`에서 해당 환경 번호(`[1]`, `[2]`, `[3]`) 1개 블록만 주석(`#`)을 해제하고 나머지는 주석 처리합니다.
2. 대상 서버(`112.106.119.13` 또는 `112.106.119.183`)의 `C:\SecureDB\` 경로에 해당 환경 인증서 파일이 복사되어 있는지 확인합니다.
3. 정책서버 포트(`8090`) 방화벽/통신 허용 여부를 확인한 뒤 WAR 파일을 생성하여 `D:\CRM` 경로에 배포합니다.
