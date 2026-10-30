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

3. **Step-by-Step 개발 및 외부 ➡️ VDI 클립보드 텍스트 복사·붙여넣기(`Ctrl+C` ➡️ `Ctrl+V`) 순서**:
   * ① 최초 VDI 반입은 `sericeo_crm_VDI반입용_20261029.zip`(Step 1·Step 2 신규 JAR 및 jQuery 1.12.4 포함) 1회 압축 해제로 완료하고, **코드 수정 전 기존 운영 상태 그대로 VDI 톰캣 서버가 정상 구동되는지 먼저 확인**합니다.
   * ② 모든 소스 작업은 여러 파일을 한꺼번에 고치지 않고 **단일 파일(또는 단일 함수 블록) 단위로 하나씩 Step-by-Step 진행**합니다.
   * ③ 외부 PC에서 VDI 내부로는 **클립보드 텍스트 복사·붙여넣기(`Ctrl+C` ➡️ `Ctrl+V`)가 가능**하므로, 파일 크기에 따라 다음 두 가지 방식으로 VDI 이클립스에 즉시 반영합니다:
     - **중소형 파일 전체 덮어쓰기**: 로컬 파일에서 `Ctrl+A` ➡️ `Ctrl+C` 후, VDI 이클립스 해당 파일에서 `Ctrl+A` ➡️ `Ctrl+V`
     - **대용량 파일(`superContaner.js` 등) 핀포인트 붙여넣기**: VDI 이클립스에서 `Ctrl+L`(라인 이동)로 해당 라인에 이동한 뒤, `// YYYYMMDD khma Start` ~ `End` 주석이 포함된 수정 블록만 정확히 덮어쓰기
   * ④ **🚨 2단계 검증 게이트(`① 로컬 수정` vs `② VDI 붙여넣기 확인`)**:
     - 로컬 안티그래비티에서 파일을 수정한 직후에는 **`[① 로컬 수정: O / ② VDI 반영: 대기]`** 상태로 기록합니다.
     - 이후 사용자가 실제로 VDI 이클립스에 붙여넣기(`Ctrl+V`)를 완료하고 동작을 확인해 주었을 때만 **`[② VDI 반영: O]`** 최종 완료 처리 후 다음 스텝으로 넘어갑니다.

---

## 📌 1. 전체 작업 Tasklist 및 2단계 검증 대장 (`① 로컬 수정` ➡️ `② VDI 붙여넣기 확인`)

| 스텝 | 대상 파일 경로 | 작업 내용 요약 | ① 로컬 수정 | ② VDI 붙여넣기/구동확인 | 최종 상태 |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Step 0-1** | `.project`, `.classpath`, `.settings/*` | 구형 VJET 제거, 출력경로(`WEB-INF/classes`) 및 컴파일러 `1.7` 설정 | `[x]` | `[x]` | **완료** |
| **Step 0-2** | `sericeo_crm_VDI반입용_20261029.zip` | 운영 소스 100% 동기화본 + 신규 JAR 포함 반입 및 VDI 베이스라인 기동 확인 | `[x]` | `[x]` | **완료** |
| **Step 1-1** | `WebContent/WEB-INF/lib/` | 구형 Spring 3.1.1(22개) & Commons(2개) `_20261029` 백업 후 신규 JAR 20종 배치 | `[x]` | `[x]` | **완료** |
| **Step 1-1b**| `src/co/kr/kydbm/core/utils/MappingJacksonJsonViewEx.java` | Spring 4.3.30 호환을 위해 `AbstractView` 상속 전환 (Jackson 1.x 유지) | `[x]` | `[x]` | **완료** |
| **Step 1-2** | `WebContent/WEB-INF/Monarch820-servlet.xml` | XML 스키마 `4.3`, `ContentNegotiationManager`, `mvc:annotation-driven` 적용 | `[x]` | `[x]` | **완료** |
| **Step 1-2b**| `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | Spring 4.3 / Java 1.8 제네릭 `UserInfo` 형변환 보정 (1015라인) | `[x]` | `[x]` | **완료** |
| **Step 1-3** | `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp` | jQuery 스크립트 경로 상향 (`1.10.2` ➡️ `1.12.4`, 4개 JSP) | `[x]` | `[x]` | **완료** |
| **Step 1-4** | `WebContent/js/jquery.kdb.MonArch800.js` | 로그인 화면 아이디 저장 체크박스(`#chk-save`) 활성화 및 쿠키(`SAVE_ID`) 연동 | `[x]` | `[x]` | **완료** |
| **Step 4** | `WebContent/js/jquery.kdb.MonArch800.js` | `validatePassword` 비밀번호 검증 로직 단일 통합 (폼/다중인자/단일복잡도 다형성 지원) | `[x]` | `[x]` | **완료** |
| **Step 2-1** | `WebContent/WEB-INF/lib/` | 구형 POI 3.8 `_20261029` 백업 후 `POI 4.1.2 신규 라이브러리/` 7종 배치 | `[ ]` | `[ ]` | 차주 착수 |
| **Step 2-2** | `src/co/kr/kydbm/common/CommonExcelUtil.java` | POI 4.1.2 호환을 위한 `CellType` Enum 문법 수정 | `[ ]` | `[ ]` | 대기 |
| **Step 2-3** | `WebContent/js/jquery.kdb.superContaner.js` | `DownXls` 함수 블록 내 4단 보안 모달 팝업 및 감사로그 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | 엑셀 비밀번호(`excelPassword`) 파라미터 수신 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-5** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | POI 4.1.2 Agile AES 암호화 워크북 생성 및 스트림 방출 엔진 | `[ ]` | `[ ]` | 대기 |
| **Step 3** | `MonArchDaoImpl.java`, `FilterGenerator.java`, 프로시저/배치 등 | KSign SecureDB 개인정보 암복호화 공통 모듈 및 프로시저/엑셀업로드 적용 | `[ ]` | `[ ]` | 대기 |

### 📖 Step 0. 사전 환경 정상화 및 아키텍처 숙지 (완료)
> 📘 관련 문서: `ARCHITECTURE.md`, `AGENTS.md`, `0_MASTER_EXECUTION_PLAN.md`
* [x] `0_MASTER_EXECUTION_PLAN.md` ➡️ [Step 0] 전체 작업 순서를 강제하는 최상위 마스터 실행 계획서 (작업 착수 전 필독)
* [x] `ARCHITECTURE.md` ➡️ [Step 0] CRM 전체 아키텍처 및 소스 디렉토리/파일 트리 구조 정의서
* [x] `AGENTS.md` ➡️ [Step 0] 소스 수정 원칙 및 주석 작성 표준 규칙서
* [x] `.project` ➡️ [Step 0-1] 구형 VJET 찌꺼기 제거로 이클립스 프로젝트 정상 오픈 조치 완료
* [x] `sericeo_crm_VDI반입용_20261029.zip` ➡️ [Step 0-2] VDI 반입 및 Java Compiler `1.7` 설정으로 **VDI 베이스라인 톰캣 정상 구동 확인 완료 (2026.10.29)**

### 🥇 Step 1. 시스템 버전 업그레이드 (기초 공사)
> 📘 참조 가이드: `1_TASK_SYSTEM_UPGRADE.md`
* [x] `WebContent/WEB-INF/lib/Spring 4.3.30 신규 라이브러리/` ➡️ Spring 4.3.30.RELEASE JAR 18종 + `commons-fileupload-1.5.jar`, `commons-io-2.15.1.jar` 사전 반입 완료
* [x] `WebContent/js/jquery-1.12.4.min.js` ➡️ jQuery 1.12.4 파일 사전 반입 완료
* [x] **[Step 1-1]** `WebContent/WEB-INF/lib/` ➡️ 구형 Spring 3.1.1(22개) & Commons(2개) `_20261029` 백업 후 신규 JAR 20종 `lib/` 직하위 배치 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
* [x] **[Step 1-1b]** `src/co/kr/kydbm/core/utils/MappingJacksonJsonViewEx.java` ➡️ Spring 4.3.30 호환 `AbstractView` 상속 전환 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
* [x] **[Step 1-2]** `WebContent/WEB-INF/Monarch820-servlet.xml` ➡️ Spring 스키마(`xsd`) `4.3`, `ContentNegotiationManager`, `mvc:annotation-driven` 적용 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
* [x] **[Step 1-2b]** `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` ➡️ Spring 4.3 / Java 1.8 제네릭 `UserInfo` 형변환 보정 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
* [x] **[Step 1-3]** `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp` ➡️ jQuery 스크립트 경로 상향 (`1.10.2` ➡️ `1.12.4`) (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
* [x] **[Step 1-4]** `WebContent/js/jquery.kdb.MonArch800.js` ➡️ 로그인 화면 아이디 저장 체크박스(`#chk-save`) 활성화 및 쿠키(`SAVE_ID`) 연동 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)

### 🥈 Step 2. 엑셀 다운로드 보안 적용 (기능 개발)
> 📘 참조 가이드: `2_TASK_EXCEL_DOWNLOAD_PWD.md`
* [x] `WebContent/WEB-INF/lib/POI 4.1.2 신규 라이브러리/` ➡️ POI 4.1.2 및 의존성 7종 사전 반입 완료
* [ ] **[Step 2-1]** `WebContent/WEB-INF/lib/` ➡️ 구형 POI 3.8 백업 후 POI 4.1.2 7종 `lib/` 직하위 배치 (`[① 로컬: 대기 / ② VDI: 대기]`)
* [ ] **[Step 2-2]** `src/co/kr/kydbm/common/CommonExcelUtil.java` ➡️ POI 4.1.2 호환을 위한 `CellType` Enum 문법 수정 (`[① 로컬: 대기 / ② VDI: 대기]`)
* [ ] **[Step 2-3]** `WebContent/js/jquery.kdb.superContaner.js` ➡️ `DownXls` 함수 블록 내 비밀번호 모달 팝업 추가 (`[① 로컬: 대기 / ② VDI: 대기]`)
* [ ] **[Step 2-4]** `src/co/kr/kydbm/core/filecontrol/UploadController.java` ➡️ 엑셀 비밀번호(`excelPassword`) 파라미터 수신 연동 (`[① 로컬: 대기 / ② VDI: 대기]`)
* [ ] **[Step 2-5]** `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` ➡️ POI 4.1.2 Agile AES 암호화 워크북 생성 및 스트림 방출 엔진 (`[① 로컬: 대기 / ② VDI: 대기]`)

### 🥉 Step 3. 개인정보 암호화 (공통 모듈 확장 적용)
> 📘 참조 가이드: `3_TASK_SECUREDB_API.md` (또는 `3_ALT_SECUREDB_UDF.md`)
* [ ] `WebContent/WEB-INF/lib/ksign-sdb-api-v2.x.x.jar` ➡️ KSign 보안 벤더사 API 라이브러리 반입 (API 방식 적용 시)
* [ ] `src/monarch.properties` ➡️ SecureDB Agent 데몬 접속 IP/Port 및 암호화 정책명 설정
* [ ] `src/co/kr/kydbm/common/crypto/CryptoService.java` ➡️ 신규 작성할 KSign 암복호화 공통 싱글턴 서비스 클래스
* [ ] `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` ➡️ DB 조회 데이터 개인정보 복호화 후처리 로직
* [ ] `src/co/kr/kydbm/core/utils/FilterGenerator.java` ➡️ 그리드 조건 검색 시 NTS 토큰 변환 쿼리 연동 로직

### ⏳ Step 4. 비밀번호 검증 로직 단일 통합 (고객사 승인 대기)
> 📘 참조 가이드: `4_TASK_PASSWORD_VALIDATION_UNIFICATION.md`
* [x] **[Step 4]** `WebContent/js/jquery.kdb.MonArch800.js` ➡️ `validatePassword` 비밀번호 복잡도 및 폼 전체 통합 검증 함수 교체 적용 완료 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)

---

## 📋 2. 소스 변경 이력 상세 요약 (작업 로그)

실제 시스템 소스 코드(Java, JSP, JS, XML 등)를 수정했을 때 아래 표에 최신순으로 한 줄씩 기록합니다.

| 일자 | 작업자 | 대상 파일 경로 | 구분 | 위치 (메서드/라인) | 변경 내용 요약 (초급자도 이해할 수 있게 명확히 작성) |
| :---: | :---: | :--- | :---: | :--- | :--- |
| 20261030 | khma | `WebContent/js/jquery.kdb.MonArch800.js` | 수정 | 4347L~4462L (`validatePassword`) | 비밀번호 복잡도 및 변경 검증 로직 단일 함수 통합 (폼/다중인자/단일복잡도 다형성 지원, 기존 코드 주석 보존) |
| 20261030 | khma | `WebContent/js/jquery.kdb.MonArch800.js` | 수정 | 3907L, 3928L (`$.Login`) | 로그인 화면 아이디 저장 체크박스(`#chk-save`) 활성화 및 쿠키(`SAVE_ID`) 저장/복원 연동 |
| 20261030 | khma | `WebContent/ui/monform.jsp` 외 3개 JSP | 수정 | `<head>` script src | 보안 취약점 개선을 위해 jQuery 1.10.2 -> 1.12.4 업그레이드 경로 교체 (기존 태그 주석 보존) |
| 20261029 | khma | `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | 수정 | 1015L (`getUserInfo`) | Spring 4.3 및 Java 1.8 제네릭 강화에 따른 `UserInfo` 반환값 형변환 보정 (기존 코드 주석 보존) |
| 20261029 | khma | `WebContent/WEB-INF/Monarch820-servlet.xml` | 수정 | 섹션 3, 섹션 5 | Spring 4.3.xsd 스키마 상향, `ContentNegotiationManager` 적용, `<mvc:annotation-driven />` 적용 및 미사용 Quartz 스케줄러 비활성화 주석 보존 |
| 20261029 | khma | `src/co/kr/kydbm/core/utils/MappingJacksonJsonViewEx.java` | 수정 | 전체 클래스 | Spring 4.3.30 호환을 위해 `AbstractView` 직접 상속 및 Jackson 1.x 직렬화 호환성 100% 자체 구현 (기존 코드 주석 보존) |
| 20261029 | khma | `WebContent/WEB-INF/lib/` | 수정 | `WEB-INF/lib/` | 구형 Spring 3.1.1(22종), Commons Fileupload 1.3.1, IO 2.2 `_20261029` 백업 보존 후 Spring 4.3.30 20종 JAR 배치 |
| 20261029 | khma | `.classpath`, `.settings/*` | 수정 | `output` 경로 및 컴파일 타깃 | VDI 이클립스 설정과 동일하게 클래스 출력 경로(`WebContent/WEB-INF/classes`) 및 컴파일 타깃(`1.7`/`1.8`) 일원화 |
| 20261029 | khma | `WebContent/WEB-INF/lib/Spring 4.3.30 신규 라이브러리/`, `WebContent/js/jquery-1.12.4.min.js` | 추가 | `WEB-INF/lib/`, `js/` | Step 1 업그레이드용 Spring 4.3.30.RELEASE(18종), Commons Fileupload 1.5/IO 2.15.1, jQuery 1.12.4 사전 다운로드 및 반입 |
| 20261029 | khma | `WebContent/FileData/`, `WebContent/WEB-INF/lib/` | 정리 | 첨부/백업파일 | 불필요 테스트 첨부/구형 설치파일(96MB) 및 중복 백업 파일(`*_20260922` 등) 정리로 VDI 반입 용량 경량화 |
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

---

## 🔍 3. 작업 건별 세부 변경 내역 (Diff 요약)

### [2026.10.30] jQuery 1.12.4 보안 패치, 아이디 저장, 비밀번호 통합 검증 및 레거시 주석 전수 정리 (Step 1-3, Step 1-4, Step 4)
* **대상 파일**:
  * `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp` (jQuery 1.12.4 경로 교체)
  * `WebContent/js/jquery.kdb.MonArch800.js` (`$.Login` 내 `#chk-save` 아이디 저장 및 `validatePassword` 통합 검증 적용)
  * `WebContent/js/jquery.kdb.MonArch800.js` (2020년 이전 레거시 주석 225줄 전수 제거 및 JDK 11 컴파일 파싱 검증 완료)
* **작업 결과**:
  * 4개 JSP 및 `MonArch800.js` VDI 이클립스 반영 완료 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
  * `MON_COM_사용자정보POPUP_TBL` 구조체 연동 방안 분석 완료 (`M_STRUCTURE` DB 테이블 `beforeSaveCallBack: "validatePassword"` 연동)

### [2026.10.29] Spring 4.3.30 업그레이드 완료 (Step 1-1 ~ Step 1-2)
* **대상 파일**:
  * `WebContent/WEB-INF/lib/` (Spring 4.3.30 JAR 20종 배치, 구형 3.1.1 `_20261029` 백업 보존)
  * `src/co/kr/kydbm/core/utils/MappingJacksonJsonViewEx.java` (`AbstractView` 상속 전환)
  * `WebContent/WEB-INF/Monarch820-servlet.xml` (Spring 4.3 xsd, `ContentNegotiationManager`, `mvc:annotation-driven` 적용)
  * `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` (Java 1.8 제네릭 `UserInfo` 형변환 보정)
* **작업 결과**: **VDI 톰캣 9 서버 에러 없이 정상 기동 성공 확인 완료 (2026.10.29)**

### [2026.10.30] Apache POI 4.1.2 업그레이드 및 보안 엑셀 다운로드 (Agile AES 암호화, Step 2-1 ~ Step 2-5)
* **대상 파일**:
  * `WebContent/WEB-INF/lib/` (구형 POI 3.8 JAR 7종 `_20261030` 백업, 신규 POI 4.1.2 JAR 7종 배치 완료)
  * `src/co/kr/kydbm/common/CommonExcelUtil.java` (POI 4.1.2 `CellType` Enum 및 `DateUtil` 문법 보정, 컴파일 에러 0건 완료)
  * `WebContent/js/jquery.kdb.jobButton.js` (43라인 `DownXlsNew` 권한 분기 추가)
  * `WebContent/js/jquery.kdb.superContaner.js` (신규 `DownXlsNew` 메서드 추가: 공통코드 `XLS_PURPOSE`/`XLS_TARGET` 동적 로딩, 1단계 사유입력 -> 2단계 파일암호 4자 이상 필수)
  * `src/co/kr/kydbm/core/filecontrol/UploadController.java` (`downExcel` 내 `excelUsage`, `excelTarget`, `excelReason`, `excelPassword` 파라미터 취득 및 전달)
  * `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` (8개 파라미터 오버로딩 `downExcel` 추가, `excelPassword` 전달 시 POI 4.1.2 `SXSSFWorkbook` 스트리밍 및 `POIFSFileSystem` Agile AES 암호화 다운로드 구현)
* **작업 결과**:
  * Step 2-1 & 2-2: VDI 이클립스 반영 및 구동 확인 완료 (`[① 로컬: 완료(x) / ② VDI: 완료(x)]`)
  * Step 2-3 ~ 2-5: 로컬 안티그래비티 작업 및 JDK 11 컴파일 검증 완료 (0 ERRORS, VDI 반영 대기)
