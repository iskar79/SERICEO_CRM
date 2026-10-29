# khma 소스 변경 및 VDI 동기화 관리대장

본 문서는 로컬 PC에서 개발/수정한 소스 코드를 **VDI 내부망(운영/개발 서버)으로 안전하게 이관(복사-붙여넣기)하기 위한 실무 관리 대장**입니다.  
`0_MASTER_EXECUTION_PLAN.md`의 **[Step 0 ➡️ Step 1 ➡️ Step 2 ➡️ Step 3]** 작업 순서와 1:1로 정확하게 일치하도록 구성되어 있어, 초급 개발자도 순서대로 따라가며 누락 없이 작업할 수 있습니다.

---

## 💡 초급 개발자를 위한 VDI 동기화 가이드 (필독)

1. **왜 이 순서(Step 0 ➡️ Step 3)대로 해야 하나요?**
   * 라이브러리 의존성 때문입니다. Spring과 POI 등 기초 공사(Step 1)가 끝나지 않은 상태에서 엑셀(Step 2)이나 암호화(Step 3)를 먼저 개발하면 컴파일 에러가 발생해 원인 추적이 불가능해집니다.
   * 반드시 **Step 0 ➡️ Step 1 ➡️ Step 2 ➡️ Step 3** 순서대로 작업하고 VDI에 반영해야 합니다.

2. **코드 수정 시 반드시 지켜야 할 사내 표준 규칙 (매우 중요)**
   * **기존 코드 완전 삭제 절대 금지**: 기존 코드는 절대 지우지 말고 반드시 주석(`/* ... */`) 처리하여 보존합니다.
   * **주석 기본 순서 원칙**: `[날짜] [작성자(khma)] : [수정 내용]` 형식을 엄격히 준수합니다.
     ```java
     // 20261001 khma : POI 4.1.2 암호화 다운로드 지원
     /*
     기존_메서드_호출();
     */
     신규_메서드_호출();
     ```
   * **AI 흔적 절대 금지**: 주석이나 코드에 AI 관련 단어(ChatGPT, LLM 등)를 일절 남기지 않습니다.

3. **작업 완료 후 동기화 순서**:
   * ① 소스 수정 완료 후, 본 문서 1번 체크리스트에서 해당 파일에 `[x]` 표시를 합니다.
   * ② 본 문서 2번 표와 3번 세부 내역에 작업 날짜, 대상 파일, 수정한 메서드/내용을 기록합니다.
   * ③ 기록된 파일만 정확히 선별하여 VDI 내부망 프로젝트의 동일한 폴더 경로에 덮어씁니다.

---

## 📌 1. VDI 반영 대상 파일 체크리스트 (작업 순서 100% 일치)

`0_MASTER_EXECUTION_PLAN.md`에 명시된 필수 작업 순서에 따라 단계별로 진행하며 완료 시 `[x]`로 체크합니다.

### 📖 Step 0. 사전 환경 정상화 및 아키텍처 숙지
> 📘 관련 문서: `ARCHITECTURE.md`, `AGENTS.md`, `0_MASTER_EXECUTION_PLAN.md`
* [ ] `0_MASTER_EXECUTION_PLAN.md` ➡️ [Step 0] 전체 작업 순서를 강제하는 최상위 마스터 실행 계획서 (작업 착수 전 필독)
* [ ] `ARCHITECTURE.md` ➡️ [Step 0] CRM 전체 아키텍처 및 소스 디렉토리/파일 트리 구조 정의서
* [ ] `AGENTS.md` ➡️ [Step 0] 소스 수정 원칙 및 주석 작성 표준 규칙서
* [ ] `.project` ➡️ [Step 0-1] 구형 VJET 찌꺼기 제거로 이클립스 프로젝트 정상 오픈 조치 (VDI에 최우선 덮어쓰기)
* [ ] `WebContent/js/jquery.kdb.superContaner.js` ➡️ [Step 0-2 사전검증] 기존 20241115 운영 소스 보존 상태 확인 (덮어쓰기 금지, 대조만 수행)

### 🥇 Step 1. 시스템 버전 업그레이드 (기초 공사)
> 📘 참조 가이드: `1_TASK_SYSTEM_UPGRADE.md`
* [ ] `WebContent/WEB-INF/lib/` ➡️ Spring 4.3.30 JAR 17개 반입 및 구형 3.1.1 JAR 백업/제외
* [ ] `WebContent/WEB-INF/web.xml` ➡️ Spring 스키마(xmlns) 버전 상향 (`3.1` ➡️ `4.3`)
* [ ] `WebContent/WEB-INF/dispatcher-servlet.xml` ➡️ Spring 스키마(xmlns) 버전 상향 (`3.1` ➡️ `4.3`)
* [ ] `WebContent/ui/monform.jsp` ➡️ jQuery 라이브러리 스크립트 경로 상향 (`1.10.2` ➡️ `1.12.4`)

### 🥈 Step 2. 엑셀 다운로드 보안 적용 (기능 개발)
> 📘 참조 가이드: `2_TASK_EXCEL_DOWNLOAD_PWD.md`
* [ ] `WebContent/WEB-INF/lib/POI 4.1.2 신규 라이브러리.zip` ➡️ POI 4.1.2 및 의존성 7종 반입 (압축 해제 후 `lib/` 직하위 배치)
* [ ] `src/co/kr/kydbm/common/CommonExcelUtil.java` ➡️ POI 4.1.2 호환을 위한 `CellType` Enum 문법 수정
* [ ] `WebContent/js/jquery.kdb.superContaner.js` ➡️ `DownXls` 함수 블록 내 비밀번호 모달 팝업 추가 (⚠️ 주의: DownXls 함수 블록만 선별 복사!)
* [ ] `src/co/kr/kydbm/core/filecontrol/UploadController.java` ➡️ 엑셀 비밀번호(`excelPassword`) 파라미터 수신 연동
* [ ] `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` ➡️ POI 4.1.2 Agile AES 암호화 워크북 생성 및 스트림 방출 엔진

### 🥉 Step 3. 개인정보 암호화 (공통 모듈 확장 적용)
> 📘 참조 가이드: `3_TASK_SECUREDB_API.md` (또는 `3_ALT_SECUREDB_UDF.md`)
* [ ] `WebContent/WEB-INF/lib/ksign-sdb-api-v2.x.x.jar` ➡️ KSign 보안 벤더사 API 라이브러리 반입 (API 방식 적용 시)
* [ ] `src/monarch.properties` ➡️ SecureDB Agent 데몬 접속 IP/Port 및 암호화 정책명 설정
* [ ] `src/co/kr/kydbm/common/crypto/CryptoService.java` ➡️ 신규 작성할 KSign 암복호화 공통 싱글턴 서비스 클래스
* [ ] `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` ➡️ DB 조회 데이터 개인정보 복호화 후처리 로직
* [ ] `src/co/kr/kydbm/core/utils/FilterGenerator.java` ➡️ 그리드 조건 검색 시 NTS 토큰 변환 쿼리 연동 로직

### ⏳ Step 4. 비밀번호 검증 로직 단일 통합 (고객사 승인 대기)
> 📘 참조 가이드: `4_TASK_PASSWORD_VALIDATION_UNIFICATION.md`
* [ ] `WebContent/js/jquery.kdb.MonArch800.js` ➡️ `validatePassword` 통합 함수(폼/다중인자/단일복잡도 다형성 지원) 교체 적용 (고객사 승인 후 작업 예정)

---

## 📋 2. 소스 변경 이력 상세 요약 (작업 로그)

실제 시스템 소스 코드(Java, JSP, JS, XML 등)를 수정했을 때 아래 표에 최신순으로 한 줄씩 기록합니다.

| 일자 | 작업자 | 대상 파일 경로 | 구분 | 위치 (메서드/라인) | 변경 내용 요약 (초급자도 이해할 수 있게 명확히 작성) |
| :---: | :---: | :--- | :---: | :--- | :--- |
| 20261029 | khma | `ARCHITECTURE.md`, `3_TASK_SECUREDB_API.md`, `3_ALT_SECUREDB_UDF.md` | 보강 | 8장 테이블/프로시저 명세 외 | `운영쿼리정보/` 실제 운영 테이블(7종+`A_FAMILY`/`US_USER`) 및 프로시저(5종) 스키마/암호화 대상 컬럼 매핑 및 배치·엑셀업로드 영향도 반영 |
| 20261029 | khma | `운영쿼리정보/` (구 `sericrm_20261021/q`) | 정리 | 프로젝트 루트 | 운영 DB 테이블/프로시저 쿼리 텍스트 12종을 `운영쿼리정보/`로 이관 후 중복 백업 폴더(`sericrm_20261021`) 삭제 |
| 20261029 | khma | `WebContent/js/jquery.kdb.superContaner.js` | 동기화 | 6693L, 10185L, 14610L 등 | 운영 백업본(`sericrm_20261021`) 기준 DownCsv 확장, 다음 주소 API 오프라인 주석(20250528 khma), 에디터 이슈 수정(20250529 khma) 100% 동기화 |
| 20261029 | khma | `WebContent/js/MonArch.js` | 동기화 | 57L, 113L | 운영 백업본(`sericrm_20261021`) 기준 오프라인 다음 주소 API 로딩 주석 처리(20250528 khma) 동기화 |
| 20261029 | khma | `WebContent/Resource.js` | 동기화 | 155L~315L (`WordOption`) | 운영 백업본(`sericrm_20261021`) 기준 tinymce WordOption 설정 및 에디터 수정(20250529 khma) 동기화 |
| 20261029 | khma | `WebContent/js/jquery.kdb.resizingCell.js` | 동기화 | 73L~102L | 운영 백업본(`sericrm_20261021`) 기준 tinymce 테이블 리사이즈 이슈 주석 처리(20250626 khma) 동기화 |
| 20261029 | khma | `WebContent/js/thirdparties/tinymce4/tinymce.min.js`, `content.min.css` | 동기화 | 10653L / 21L~90L | 운영 백업본(`sericrm_20261021`) 기준 tinymce4 테이블 기본 보더 및 클래스 제외 동기화 |
| 20261029 | khma | `WebContent/WEB-INF/Monarch820-servlet.xml` | 동기화 | 64L~73L (`dataSource`) | 운영 백업본(`sericrm_20261021`) 기준 DBCP validationQuery 및 NLS_DATE_FORMAT 초기화 설정 동기화 |
| 20261029 | khma | `WebContent/WEB-INF/log4j.properties` | 동기화 | 1L~23L | 운영 백업본(`sericrm_20261021`) 기준 로그 용량 관리 정책(INFO 레벨, 20250609 khma) 동기화 |
| 20261029 | khma | `src/monarch.properties`, `src/properties/jdbc.properties` | 동기화 | 전체 | 운영 백업본(`sericrm_20261021/WEB-INF/classes`) 기준 운영 URL 및 신규 DB 접속 설정 동기화 |
| 20261029 | khma | `WebContent/WEB-INF/lib/ojdbc8.jar` 외 템플릿/HTML | 동기화 | `WEB-INF/lib`, `FileData/template`, `ui/popup` | 운영 백업본(`sericrm_20261021`) 기준 `ojdbc8.jar`(기존 `ojdbc6.jar_20261029` 백업), POI 3.8 원본 복원, 엑셀 업로드 서식 및 HTML 파비콘 주석 100% 일치화 |
| 20261029 | khma | `AGENTS.md`, `ARCHITECTURE.md`, `CHANGELOG_KHMA.md` | 보강 | 디렉토리/원칙 | 운영 서버 백업 폴더(`sericrm_20261021/`) 구조 및 대조/보존 기준 명세 추가 |
| 20261014 | khma | `2_TASK_EXCEL_DOWNLOAD_PWD.md` | 최신화 | Step 2, Step 3 | 고객사 확정 4단 모달 팝업(용도/대상/목적10자/암호), 감사로그 DDL, 3page 타겟추출 SQL 매트릭스 반영 |
| 20261014 | khma | `3_TASK_SECUREDB_API.md` | 최신화 | 1장 개요 | 고객사 SecureDB 모듈 세팅 완료 및 실증 쿼리(AES256_DEV, SHA512_DEV, nts/bsh/fsh) 반영 |
| 20261008 | khma | `4_TASK_PASSWORD_VALIDATION_UNIFICATION.md` | 신규 | 전체 | 비밀번호 복잡도 및 변경 검증 로직 단일 통합 실행 가이드 수립 (고객사 승인 대기) |
| 20261007 | khma | `WebContent/js/MonArchResource.js` | 동기화 | 250L, 252L | 운영 백업본 기준 gCorp, gCorpNm 변수 할당 오타 교정 동기화 |
| 20261007 | khma | `WebContent/js/jquery.kdb.jobButton.js` | 동기화 | 89L | 운영 백업본 기준 xlsOption 속성 동적 바인딩 로직 동기화 (20240404 khma 작성분) |
| 20261007 | khma | `WebContent/js/jquery.kdb.MonArch800.js` | 동기화 | 3226L | 운영 백업본 기준 사용자정보 팝업 닫기 dialog('close') 정리 동기화 |
| 20261007 | khma | `WebContent/ui/login.jsp` | 동기화 | 18L, 21L | 운영 백업본 기준 X-FRAME-OPTIONS 및 favicon 주석 처리 동기화 |
| 20261007 | khma | `WebContent/ui/loginProcess.jsp` | 동기화 | 18L, 21L | 운영 백업본 기준 X-FRAME-OPTIONS 및 favicon 주석 처리 동기화 |
| 20261007 | khma | `WebContent/css/Theme_CEO.css` | 동기화 | 13L | 운영 백업본 기준 내부망 공유 경로 오타 문자열 제거 동기화 |
| 20261007 | khma | `WebContent/Resource.js` | 동기화 | 66L, 290L, 381L | 운영 백업본(ROOT_20250228) 기준 signFileDelete 및 날짜 파싱(fy/fm) 동기화 |
| 20261007 | khma | `WebContent/WEB-INF/Monarch820-servlet.xml` | 동기화 | 139L | 운영 백업본 기준 doUploadDataFileOld.mon 로그인 체크 인터셉터 매핑 추가 |
| 20261007 | khma | `WebContent/ui/monform.jsp` | 동기화 | 17L | 운영 백업본 기준 파비콘(favicon) 링크 주석 처리 동기화 |
| 20261006 | khma | `1_TASK_SYSTEM_UPGRADE.md` | 보강 | 1, 2장 | 물리적 삭제 금지 원칙 반영 (기존 .project XML 주석 보존 및 구형 JAR 백업 규칙 명문화) |
| 20261006 | khma | `ARCHITECTURE.md` 등 | 보강 | 2장 | 프로젝트 디렉토리 트리 구조도 및 마이그레이션 기술 가이드라인 최종 완비 |
| 20261002 | khma | `jquery.kdb.superContaner.js` | 사전점검 | 218L, 12053L | 기존 운영 소스(20241115 페이지 볼드 및 _logOld 수정) 보존 상태 대조 확인 |
| 20261001 | khma | `.project` | 수정 | 빌더/네이처 | 최신 이클립스 호환성을 위한 구형 VJET 및 JSDT 찌꺼기 플러그인 설정 제거 |

> 📝 **새로운 작업 작성 예시**:  
> `| 20261007 | khma | src/co/kr/kydbm/common/CommonExcelUtil.java | 수정 | getCellData() | POI 4.1.2 CellType Enum 마이그레이션 적용 |`

---

## 🔍 3. 작업 건별 세부 변경 내역 (Diff 요약)

실제 코드 변경이 발생했을 때, 어떤 코드가 어떻게 바뀌었는지 Before / After 또는 작업 내용을 아래에 상세히 기록합니다.

### [최신 운영 원본 100% 동기화] khma - 운영 백업본(`sericrm_20261021/`) 기준 전수 대조 및 1:1 동기화 완료
* **대상 파일**:
  * **핵심 JS/CSS/설정 (8종)**:
    * `WebContent/js/jquery.kdb.superContaner.js` (DownCsv 확장, 20250528 다음 주소 API 주석, 20250529 에디터 수정)
    * `WebContent/js/MonArch.js` (20250528 다음 주소 API 로딩 주석)
    * `WebContent/Resource.js` (WordOption 및 20250529 에디터 설정)
    * `WebContent/js/jquery.kdb.resizingCell.js` (20250626 tinymce 테이블 리사이즈 주석)
    * `WebContent/js/thirdparties/tinymce4/tinymce.min.js`
    * `WebContent/js/thirdparties/tinymce4/skins/lightgray/content.min.css`
    * `WebContent/WEB-INF/Monarch820-servlet.xml` (DBCP `validationQuery` 및 `NLS_DATE_FORMAT` 초기화 설정)
    * `WebContent/WEB-INF/log4j.properties` (20250609 로그 레벨 INFO 전환)
  * **백엔드 프로퍼티 (2종)**:
    * `src/monarch.properties`, `src/properties/jdbc.properties`
  * **정적 HTML/CSS 및 리소스/라이브러리**:
    * `WebContent/CustSearchlocal.html`, `WebContent/SurveyAnsform.htm`, `WebContent/error.htm`, `WebContent/testFilter.html`
    * `WebContent/ui/popup/CustSearch.html`, `ReportView.html`, `ReportViewDt.html`, `ReportViewDt - 복사본.html`, `testCust.html`
    * `WebContent/css/Common.css`, `WebContent/js/jquery.kdb.filter.js`, `WebContent/image/block_loading.gif`
    * `WebContent/FileData/template/*` (운영 최신 엑셀 업로드 양식 일괄 반영)
    * `WebContent/WEB-INF/lib/ojdbc8.jar` (기존 `ojdbc6.jar` ➡️ `ojdbc6.jar_20261029` 백업 보존) 및 POI 3.8 원본 JAR 복원
* **작업 구분**: **운영 최신 원본 소스 100% 일치화 (기능 작업 착수 전 베이스라인 확립)**
* **상세 내용**:
  * `sericrm_20261021` 운영 백업본과 `WebContent/` 전체 파일 간 MD5 해시 불일치 건수 **0건** 달성 확인

### [운영 백업 소스 기준 정립] khma - 운영 백업 폴더(`sericrm_20261021/`) 기준 명세 반영
* **대상 파일**: `AGENTS.md`, `ARCHITECTURE.md`, `CHANGELOG_KHMA.md`
* **작업 구분**: 운영 백업 원본 경로 및 기준점 문서화
* **상세 내용**:
  * 프로젝트 루트 하위 `sericrm_20261021/` 폴더를 **운영 톰캣에서 `ROOT.war`가 풀린 폴더 통째로 zip 압축해 가져온 실운영 배포 원본**으로 정의하고 아키텍처 트리 및 작업 규칙서에 반영
  * `WebContent/`와 1:1 대응되는 정적 리소스(JS/JSP/CSS/XML/JAR) 및 `WEB-INF/classes/` 내 운영 `.class` 바이트코드/프로퍼티 대조 시 `sericrm_20261021/` 폴더를 최우선 기준(Baseline)으로 활용하며 원본 보존을 위해 직접 수정 금지 원칙 명시

### [기획 확정 및 실증 반영] khma - 엑셀 타겟 추출(4단 팝업) 및 SecureDB 실증 쿼리 최신화
* **대상 파일**: `2_TASK_EXCEL_DOWNLOAD_PWD.md`, `3_TASK_SECUREDB_API.md`
* **작업 구분**: 실행 가이드 최신화
* **상세 내용**:
  * 고객사 기획서([CRM 메일/문자/전화 타겟 추출 건 추가 요청]) 기반 4단 모달 팝업(용도/대상/목적 10자 이상/파일 패스워드) 전사 공통 연동 코드 보강
  * 엑셀 다운로드 감사 로그 신규 테이블(`A_EXCEL_DOWN_LOG`) DDL 설계안 및 백엔드 파라미터 수신 로직 수록
  * 회원관리 타겟 추출 SQL 매트릭스(정보성/오프라인홍보용/광고성홍보용 및 수신동의 테이블 `a_act_log`, `a_user_dminfo` 조인) 명세 완비
  * MonArch 코어 정규식(`\/\*(.*?)[@](.*?)\*\/`) 주석 해제 메커니즘 분석 및 `@CHK_SERV@`, `@DM_GBN@`, `@SMS_YN@` 등 파라미터 기반 다이나믹 쿼리 템플릿 표준 확립
  * 고객사 DB 실증 검증 쿼리(`dbsecnew.sdb_crypto.encrypt/decrypt`, `sdb_crypto.nts/nts_bsh/nts_fsh`) 및 확정 정책명(`AES256_DEV`, `SHA512_DEV`) 가이드 반영

### [사전 가이드] khma - 비밀번호 검증 로직 단일 통합 가이드(Task 4) 수립
* **대상 파일**: `4_TASK_PASSWORD_VALIDATION_UNIFICATION.md`, `0_MASTER_EXECUTION_PLAN.md`
* **작업 구분**: 실행 가이드 수립 (고객사 승인 대기)
* **상세 내용**:
  * `MonArch800.js`의 `validatePassword` 함수를 단일 통합 진입점으로 일원화하기 위한 가이드 작성
  * 폼 객체 전달(`isFormMode`), 3개 암호 인자 전달(`isTripleMode`), 단일 문자열 전달(기존 복잡도 호환) 다형성 지원 로직 및 교체 코드 수록
  * 기존 코드 100% 보존 주석 원칙 및 `[날짜] khma` 주석 표준 명시 완료

### [운영 소스 원본 동기화] khma - 20250228 운영 백업본(`ROOT_20250228`) 기준 100% 원본 동기화
* **대상 파일**: 
  * `WebContent/js/MonArchResource.js`
  * `WebContent/js/jquery.kdb.jobButton.js`
  * `WebContent/js/jquery.kdb.MonArch800.js`
  * `WebContent/ui/login.jsp`, `WebContent/ui/loginProcess.jsp`
  * `WebContent/css/Theme_CEO.css`
  * `WebContent/Resource.js`
  * `WebContent/WEB-INF/Monarch820-servlet.xml`
  * `WebContent/ui/monform.jsp`
* **작업 구분**: **운영 원본 소스 동기화 (기능 수정 아님)**
* **상세 내용**:
  * 운영 서버 실배포 백업본(`ROOT_20250228\ROOT`)의 최신 정상 소스와 로컬 소스 간의 차이점을 운영 원본 기준으로 1:1 동기화하여 파일 해시(MD5)까지 100% 완벽 일치 완료
  * 소스 내부에 불필요한 수정 주석 없이 운영 원본 소스 코드 자체로 일치화 완료

### [사전 준비] khma - 마이그레이션 마스터 플랜 및 기술 가이드라인 수립
* **대상 파일**: `0_MASTER_EXECUTION_PLAN.md`, `1_TASK_SYSTEM_UPGRADE.md`, `2_TASK_EXCEL_DOWNLOAD_PWD.md`, `3_TASK_SECUREDB_API.md`, `ARCHITECTURE.md`, `AGENTS.md`
* **작업 구분**: 마이그레이션 설계 및 사전 기술 가이드 완비
* **상세 내용**:
  * Step 0 ~ Step 3 단계별 작업 순서 마스터 플랜 수립 (순서 준수 필수)
  * Spring 4.3.30 및 POI 4.1.2 라이브러리 교체 명세 및 POI 신규 JAR 7종 사전 수집 완료
  * Apache POI 4.1.2 Agile AES 암호화 풀 소스코드 및 프론트엔드 비밀번호 모달 팝업 가이드라인 완비
  * KSign SecureDB Java API(CryptoService) 및 DB UDF 방식 비교 분석 및 구현 코드 완비
  * 전체 프로젝트 디렉토리 및 핵심 파일 트리 구조도 명세 수립

### [사전 점검] khma - VDI 기존 소스(superContaner.js) 보존 상태 확인
* **대상 파일**: `WebContent/js/jquery.kdb.superContaner.js`
* **작업 구분**: 기존 운영 소스 수정 이력 대조 및 보존
* **상세 내용**:
  * 218라인 `//페이지 볼드처리 추가 20241115 khma` 및 12,053라인 `_logOld` 취득 로직 보존 확인
  * 16,500줄짜리 화면 엔진을 통째로 덮어쓰지 않고 향후 Step 2 반영 시 `DownXls` 함수 블록만 정밀 병합하도록 원칙 확립
