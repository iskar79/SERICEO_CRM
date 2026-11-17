# SERICEO CRM 시스템 인프라 · DB · 개인정보 암호화 기준 정리서

> 작성일: 2026-11-17  
> 작성자: khma (KYDBM)  
> 용도: Confluence 프로젝트 기준 문서(시스템 정보, DB TNS, SecureDB 정책, 암호화 대상 테이블, 운영 결재 기준) 통합 참조용

---

## 1. 서버 및 WAS 구성 정보

### 1.1 CRM 주요 서버 (Windows Server)

| 구분 | HOST명 | 내부 IP | 공인 IP | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **개발 WAS (`dev`)** | `g-dseri-msweb2` | `182.198.77.13` | `112.106.119.13` | CRM 개발서버 (JDK 11, Tomcat 9 `8080`, `D:\CRM\ROOT.war`) |
| **운영 CRM WAS** | `g-pseri-adm1` | `182.198.77.183` | `112.106.119.183` | CRM 운영서버 (`D:\CRM\ROOT.war`) |
| **배치 / VDI 통합어드민** | `g-pseri-adm2` | `182.198.77.184` | `112.106.119.184` | - |
| **콘텐츠 관리 어드민** | `g-pseri-adm3` | `182.198.77.185` | `112.106.119.185` | - |

### 1.2 서버 접근 제어 (HIWARE)
- 접속 URL: `https://70.2.243.100:8443` (에이전트 및 Google OTP 로그인)
- 개발업무용 VDI: 개발/품질 서버 접근 가능
- 시스템운영/개인정보처리용 VDI: 운영서버 접근 가능

---

## 2. Oracle DB 접속 정보 (`tnsnames.ora` 기준)

| 환경 | SID / Service Name | 서버 내부 접속 정보 | SDS VDI 접속 정보 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **개발 CEO DB** | `CEODEV` | `26.2.52.34:1621` | `182.198.77.35:1621` *(포트포워딩 `70.2.251.122:4031`)* | `A_USER`, `A_FAMILY` 등 원본 스키마 |
| **개발 MICRO DB** | `MICRODEV` | `26.2.52.34:1622` | `182.198.77.35:1622` *(포트포워딩 `70.2.251.122:4032`)* | CRM 개발 메인 DB (`jdbc.properties_개발서버`/`개발VDI`) |
| **운영 CEO DB** | `CEODB` | `26.2.51.36:1621` | `70.2.251.122:4033` | 운영 `CEO` 스키마 (`@DBL_CEO` 시노님 참조) |
| **운영 MICRO DB** | `MICRODB` | `26.2.51.37:1622` | `70.2.251.122:4034` | CRM 운영 메인 DB (`jdbc.properties_운영서버`) |

---

## 3. KSign SecureDB 연동 규격 및 정책

### 3.1 Agentless Java API V2 구성 (`SDBAgentlessAPIforJava-V3.7.3-2.0.4.jar`)
- **개발계 정책서버 URL**:
  - 서버 내부 (`112.106.119.13` 등): `https://26.2.37.28:8090`
  - VDI 테스트: `https://70.2.243.122:8090`
- **운영계 정책서버 URL**: `https://26.2.37.24:8090,https://26.2.37.25:8090`
- **인증서 파일**: 개발 `C:/SecureDB/ca_dev.pem` / 운영 `C:/SecureDB/ca.pem`, `C:/SecureDB/rootca.pem`
- **개발계 API 토큰**: `sdbpat-5c4d5b22f94c4e6ae97e5af77e6d7b34f7e0ed76b5cc3344af165a9ea137bedb`
- **운영계 API 토큰**: 운영 배포 전 최종 발급 토큰 확인 필수 (`monarch.properties_운영서버`)

### 3.2 암호화 / HASH 정책명 및 규격
- **개발계**: 대칭키 `AES256_DEV` / 단방향 HASH `SHA512_DEV`
- **운영/품질계**: 대칭키 `AES256_PRD` / 단방향 HASH `SHA512_PRD`
- **단방향 HASH(NTS) 규격**:
  - `nts(policy, text)`: 전체 일치 검색 (`=`)
  - `nts_bsh(policy, prefix)`: 전방 일치 검색 (`LIKE '값%'`)
  - `nts_fsh(policy, suffix)`: 후방 일치 검색 (`LIKE '%값'`)
  - 해시 변환 길이: **1글자당 44바이트** (예: `VARCHAR2(2200)` = 최대 50자, `VARCHAR2(2640)` = 최대 60자)
- **운영 가이드 확인 사항 (10/06 KSign 미팅)**:
  - `SDBAgentlessApi` 인스턴스는 WAS 기동 시 싱글턴으로 1회 생성 후 재사용 (`CryptoService`)
  - `readTimeoutMillis` 기본값(65초)은 정책 변경 체크용이므로 기본값 유지 권장

---

## 4. 개인정보 암호화 대상 테이블 및 컬럼 범위

### 4.1 `CEO` 스키마 (`CRM`에서 `@DBL_CEO` 시노님 참조)
- **`A_USER` (10개)**: `NAME`, `BIRTHDAY`, `MTELNO`, `TELNO`, `EMAIL`, `SUBEMAIL`, `ADDRESS1`, `ADDRESS2`, `SUBADDRESS1`, `SUBADDRESS2` (`*_ENC` / 검색 대상 `*_HASH`)
  - 원본 컬럼 축소 기준: `NAME` 60 byte, `EMAIL`/`MTELNO`/`TELNO` 50 byte
- **`A_FAMILY` (4개)**: `NAME`, `TELNO`, `MTELNO`, `EMAIL` (`NAME_ENC/HASH`, `TELNO_ENC/HASH`, `MTELNO_ENC/HASH`, `EMAIL_ENC`)
- **`A_*` 시노님 13개**: `A_ACT_LOG`, `A_CONT`, `A_CONT_LMS`, `A_CONT_NLMS`, `A_CONT_SERV`, `A_CORP`, `A_EMP`, `A_FAMILY`, `A_ORDER`, `A_PNT`, `A_SIGN`, `A_SIGN_USER`, `A_USER` *(+ `A_USER_DMINFO`)*

### 4.2 `CRM` 스키마 (`MICRO` 소유)
- **`US_USER` (집계 테이블, 7개 증설)**: `NAME_ENC`, `NAME_HASH`, `MTELNO_ENC`, `MTELNO_HASH`, `EMAIL_ENC`, `EMAIL_HASH`, `BIRTHDAY_ENC` (`USP_M_CONT_USE_STATUS` 일배치 매핑)
- **기타 사용 중 테이블 (개발DB 기준 최근 데이터 존재)**: `키맨`, `VOC접수`, `M_USER`, `사용자`, `M_EXUP_TEMP`, `TBALSONG`, `접촉관리`, `거래처` 등
- **삭제 금지 주의 테이블**: `M_USITE`, `M_DEPT` (Java `MonArchDaoImpl` 로그인/사용자 조회에서 직접 `JOIN` 참조)

---

## 5. 운영 반영 및 자료 추출 보안 기준 (`CRM(SERI)`)
- **Jira 결재 필수**: `CRM(SERI)` 대상 데이터 변경, 프로그램 변경, 권한 신청 시 Jira 결재 필수
- **개인정보 포함 자료 추출 시**:
  - 암호화 압축/파일 비밀번호 최소 **6자리 이상** (일련번호·동일문자 제외) 권장
  - 비밀번호는 요청 Jira 댓글 또는 메일 본문에 직접 기재하지 않고 별도 전달
