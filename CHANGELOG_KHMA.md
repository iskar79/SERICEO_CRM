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
| **Step 2-1** | `WebContent/WEB-INF/lib/` | POI 4.1.2 7종 + 의존 JAR 3종(commons-math3, SparseBitSet, curvesapi) 배치 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-2** | `src/co/kr/kydbm/common/CommonExcelUtil.java` | POI 4.1.2 호환을 위한 `CellType` Enum 및 `DateUtil` 문법 수정 | `[x]` | `[x]` | **완료** |
| **Step 2-3** | `WebContent/js/jquery.kdb.jobButton.js` | `DownXlsNew` 권한 체크 분기 추가 및 레거시 주석 정리 (Line 43) | `[x]` | `[x]` | **완료** |
| **Step 2-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | 엑셀 파라미터 수신, return null; 보정, Throwable 로깅 보강 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-5** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | Agile AES 암호화 워크북 생성, getBrowser NPE 방어, Throwable 처리 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-6** | `운영쿼리정보/M_EXCEL_DOWN_LOG.sql` | 엑셀 다운로드 보안 감사 및 사유 이력 테이블 DDL 초경량 13개 컬럼 정비 (CRM.M_EXCEL_DOWN_LOG) | `[x]` | `[x]` | **완료 (VDI 테이블 정비 완료)** |
| **Step 2-7** | `WebContent/js/jquery.kdb.superContaner.js` | XLS_REASON_POPUP 동적로드, DownXlsNew 타깃 서비스명/메소드명/파일명 정밀 추출 및 실제 다운로드 파일명 타임스탬프 일치화, IP 다중 추출 보정 | `[x]` | `[x]` | **완료 (VDI 정상동작 확인)** |
| **Step 2-8** | `운영쿼리정보/M_COMM_CODE_XLS_SEC_COLS.sql`, `superContaner.js` | 정보성/홍보용 엑셀 추출 보안 컬럼(xlsOption.secCols 동적옵션) DB 공통코드 연동 및 DownXlsNew DOWNCOLS 추출 구현 | `[x]` | `[x]` | **완료 (VDI 반영 완료)** |
| **Step 2-9** | src/co/kr/kydbm/core/filecontrol/UploadController.java | 실제 엑셀 조회 데이터 건수(ds.size())로 M_EXCEL_DOWN_LOG.DOWN_CNT 정밀 갱신 로직 구현 | [x] | [x] | **완료 (VDI 반영 확인)** |
| **Step 2-11**| `superContaner.js`, `UploadController.java` | 엑셀 다운로드 폼(xlsForm) 전송 시 UID/USITE 명시적 추가, 백엔드 세션 Fallback 및 모나크 동적 주석 문법 연동으로 DOWN_CNT 100% 정합성 보장 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 5-4** | `UploadController.java` | M_IMAGE_GAL.FILE_PATH에 원본 파일명 제외하고 순수 타임스탬프(YYYY/MM/타임스탬프)만 저장(기존 CRM 표준 유지) 및 다운로드/삭제 레거시 파일 호환 탐색 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-1** | `WebContent/js/jquery.kdb.soap.2.0.js` | soap 통신 관문 4대 고도화 (PostJsonData 직렬화 사전격리/JSON안전파싱/콜백격리/E1000보장, GetJsonServer 동기안전파싱, _serialize null방어, Json2Str 문자열이스케이프) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-2** | `src/co/kr/kydbm/core/exception/ExceptionResolver.java` | 전역 예외 처리 표준화 (미처리 예외 표준 ResultInfo 응답 생성, AJAX jsonView 매핑/동기 redirect 분기, ORA-20000 보존 및 SQL 은닉, printStackTrace 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-3** | `src/co/kr/kydbm/core/service/SvcCRUD.java` | parsingForJonType 파싱 try-catch 내부 이동, @ExceptionHandler ResultInfo 표준 JSON 뷰 통일(SC_OK 200 유지), printStackTrace 전면 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | @ExceptionHandler(Exception.class) 표준 ResultInfo 등록, downExcel/downloadFileNew 응답 커밋 검증 및 브라우저 alert 안내, 내부정보 노출 차단, 스트림/Writer null-safe close, printStackTrace 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-5** | `soap.2.0.js`, `MonArch800.js` | PostJsonData null/비객체 응답 에러 격리, stale 메뉴 응답 무시, MonArch800.js $.Json2Str 최신 직렬화 동기화, GetJsonServer eval 복원 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-6** | `WebContent/js/MonArchResource.js`, `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.superContaner.js` | Java Spring 단일 환경 기준으로 미사용 .NET ASMX/응답 포장/날짜 직렬화 분기 정리 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-7** | `WebContent/js/MonArch.js`, `WebContent/js/jquery.kdb.soap.2.0.js` | 잔여 .NET 분기 100% 완전 정리 (`MonArch.js` getUserInfo ASMX 제거 및 `getUserInfo.json` 단일화, `soap.2.0.js` GETJSON2/GETJSONREMOTE/GETHTML toXml 및 .d 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 7** | `WebContent/js/jquery.kdb.superCalendar.js`, `superContaner.js`, `MonArch.js` | 달력 컴포넌트(superCalendar 17개 메서드, 900줄) 모듈 독립 분리 및 후로드 디스패처 핀포인트 연동 (작업 트리에 superContaner.js_20261030 백업 보존) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 8** | `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.superContaner.js` | 화면 설정(GETJSON) 로딩 실패 시 캐시 오염 방어 및 SetPageContaner 실패 안내 + [다시 시도] 복구 UX 구현 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-12**| `UploadController.java`, `superContaner.js` | M_EXCEL_DOWN_LOG DOWN_CNT 정합성 보강 (REGDATE 오라클 컬럼명 일치, 사용자 Fallback 갱신 및 superContaner _records 연동) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-13**| `MonArchDao.java`, `MonArchDaoImpl.java`, `ExcelDownload.java`, `UploadController.java` | 대용량 10만건 이상 엑셀/CSV 스트리밍 다운로드 파이프라인 이식 (RowCallbackHandler, SXSSFWorkbook(100) 디스크압축, OpenCSV 스트리밍, 구형 JXL 65,536행 한계 및 WAS 힙 일괄적재 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-14**| `UploadController.java`, `ExcelDownload.java`, `MonArch800.js`, `superContaner.js` | 엑셀 다운로드 연타 방지 및 비침해적 인라인 상태 안내 UX 연동 (클릭 즉시 버튼 잠금 + 안내 배지 노출, response.reset() 직후 fileDownloadToken 쿠키 주입, 응답 시작 시 자동 원복, 120초 타임아웃 재요청) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-15**| `UploadController.java`, `MonArch800.js`, `superContaner.js` | 일반 엑셀 자동 INSERT와 보안 엑셀 UPDATE 분기 정밀 격리(기존 로그 덮어쓰기 간섭 원천 차단), DownXlsNew 2단계 선행잠금 재진입(Re-entry) 허용 및 실패 시 CleanUp 복원 보완 | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 9** | `WebContent/js/jquery.kdb.superContaner.js` | 그리드 컬럼 마스킹 엔진 구현 (`colModel`의 `mask: "name"`, `"phone"`, `"email"` 등 속성 연동, 마우스 오버 `title` 툴팁 원본 데이터 유지) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 10-1**| `WebContent/js/core/jquery.kdb.core.superCalendar.js`, `WebContent/js/MonArch.js` (구형 `js/jquery.kdb.superCalendar.js` 정리 삭제) | Mon_LinkCRM_Maven 표준 구조 적용 (js/core 폴더 생성 및 superCalendar 이관, 구형 파일 정리 삭제, MonArch.js 로드 경로 갱신) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 1-2c**| `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | exeLoginProcess 로그인 쿼리 내 미사용 '거래처' 테이블 서브쿼리 제거 (ORA-00942 오류 원천 방어 및 NULL 처리) | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 10-2**| `WebContent/css/Common.css`, `Theme_*.css`, `MonArchResource.js`, `monform.jsp`, `favicon.ico` | 헤더 상단 탑바(사이트선택/법인검색/저장버튼) UI 리팩토링 및 사이트별(CEO/MS/PRO) 클래스 직결 배경색/캐시파쇄(?v=)/파비콘 404 해결 | `[x]` | `[x]` | **완료 (VDI 반영 및 정상동작 확인)** |
| **Step 10-3**| `WebContent/js/core/jquery.kdb.core.superTree.js`, `superChart.js`, `superContaner.js`, `MonArch.js` | superTree(4개 메서드) 및 superChart(3개 메서드) js/core 모듈 독립 분리 및 디스패처 연동 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 5-5** | `운영쿼리정보/M_FILE_MGMT.sql`, `UploadController.java`, `superContaner.js`, `Resource.js`, `Monarch820-servlet.xml` | CRM.M_FILE_MGMT 테이블/트리거/인덱스 DDL 작성, singleFileNew 및 multiFileNew 모두 M_FILE_MGMT(FILE_SEARCH_KEY 및 MULTIFILE_LIST)로 일원화, 데이터 수정 이력 서비스명(M_DATA_HIST) 변경 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 11-1**| `WebContent/js/jquery.kdb.superContaner.js` | 그리드 렌더링(tableShowData) 시 템플릿 행(TrData)에서 컬럼별 메타데이터(colMetaList) 1회 사전 캐싱으로 매 행·셀 반복 DOM .attr() 조회 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 11-2**| `WebContent/js/jquery.kdb.MonArch800.js` | `$.decHTML` 함수에서 변환 대상 엔티티(`&`) 및 `<br>` 태그가 없는 일반 문자열 조기 반환(Early Return) 처리로 불필요한 정규식 체인 실행 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 10-4**| `WebContent/js/core/jquery.kdb.core.superMap.js`, `jquery.kdb.core.superAnswer.js`, `superTree.js`, `superChart.js`, `superCalendar.js`, `superContaner.js`, `MonArch.js`, `MonArch_Simple.js`, `SurveyAnsform.htm` | superMap(11개)·SuperAnswer(5개) 모듈 분리, core 5종 상세 Javadoc/단계별 주석 보강, MonArch_Simple.js 모듈 로드/SurveyAnsform.htm jQuery 1.12.4 상향 및 dspmode == 1 버그 수정 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 11-3**| `WebContent/js/jquery.kdb.superContaner.js` | getJson 구조체 모달 호출 시 전체 .ui-widget-overlay z-index 일괄 변경 제거 (구조체 모달 닫힌 후 부모 모달 overlay 클릭 차단/비활성화 버그 수정) | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 3-1** | `src/monarch.properties` | SecureDB Agent 데몬 접속 설정(IP/Port 9909) 및 정책명(AES256_DEV/SHA512_DEV) 추가 | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 3-2** | `src/co/kr/kydbm/common/crypto/CryptoService.java` | KSign SecureDB Java API V2 공통 암복호화 서비스 클래스 신규 작성 (Sample.java 패턴 준수, 싱글턴, 10분 DEK 동기화, 로컬 Mock Fallback 내장) | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 3-3** | `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | 개인정보 10개 컬럼 INSERT/UPDATE 파라미터 암호화(_ENC) 및 NTS 토큰(_HASH) 자동 주입, SELECT 복호화(decryptRow) 연동 | `[ ]` | `[ ]` | 착수 대기 |
| **Step 3-4** | `src/co/kr/kydbm/core/utils/FilterGenerator.java` | 개인정보 10개 컬럼 검색 시 기존 LIKE 대신 NTS 토큰(_HASH = nts_bsh) 인덱스 일치 검색 자동 변환 | `[ ]` | `[ ]` | 착수 대기 |

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
| **Step 2-1** | `WebContent/WEB-INF/lib/` | POI 4.1.2 7종 + 의존 JAR 3종(commons-math3, SparseBitSet, curvesapi) 배치 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-2** | `src/co/kr/kydbm/common/CommonExcelUtil.java` | POI 4.1.2 호환을 위한 `CellType` Enum 및 `DateUtil` 문법 수정 | `[x]` | `[x]` | **완료** |
| **Step 2-3** | `WebContent/js/jquery.kdb.jobButton.js` | `DownXlsNew` 권한 체크 분기 추가 및 레거시 주석 정리 (Line 43) | `[x]` | `[x]` | **완료** |
| **Step 2-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | 엑셀 파라미터 수신, return null; 보정, Throwable 로깅 보강 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-5** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | Agile AES 암호화 워크북 생성, getBrowser NPE 방어, Throwable 처리 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-6** | `운영쿼리정보/M_EXCEL_DOWN_LOG.sql` | 엑셀 다운로드 보안 감사 및 사유 이력 테이블 DDL 초경량 13개 컬럼 정비 (CRM.M_EXCEL_DOWN_LOG) | `[x]` | `[x]` | **완료 (VDI 테이블 정비 완료)** |
| **Step 2-7** | `WebContent/js/jquery.kdb.superContaner.js` | XLS_REASON_POPUP 동적로드, DownXlsNew 타깃 서비스명/메소드명/파일명 정밀 추출 및 실제 다운로드 파일명 타임스탬프 일치화, IP 다중 추출 보정 | `[x]` | `[x]` | **완료 (VDI 정상동작 확인)** |
| **Step 2-8** | `운영쿼리정보/M_COMM_CODE_XLS_SEC_COLS.sql`, `superContaner.js` | 정보성/홍보용 엑셀 추출 보안 컬럼(xlsOption.secCols 동적옵션) DB 공통코드 연동 및 DownXlsNew DOWNCOLS 추출 구현 | `[x]` | `[x]` | **완료 (VDI 반영 완료)** |
| **Step 2-9** | src/co/kr/kydbm/core/filecontrol/UploadController.java | 실제 엑셀 조회 데이터 건수(ds.size())로 M_EXCEL_DOWN_LOG.DOWN_CNT 정밀 갱신 로직 구현 | [x] | [x] | **완료 (VDI 반영 확인)** |
| **Step 2-11**| `superContaner.js`, `UploadController.java` | 엑셀 다운로드 폼(xlsForm) 전송 시 UID/USITE 명시적 추가, 백엔드 세션 Fallback 및 모나크 동적 주석 문법 연동으로 DOWN_CNT 100% 정합성 보장 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 5-4** | `UploadController.java` | M_IMAGE_GAL.FILE_PATH에 원본 파일명 제외하고 순수 타임스탬프(YYYY/MM/타임스탬프)만 저장(기존 CRM 표준 유지) 및 다운로드/삭제 레거시 파일 호환 탐색 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-1** | `WebContent/js/jquery.kdb.soap.2.0.js` | soap 통신 관문 4대 고도화 (PostJsonData 직렬화 사전격리/JSON안전파싱/콜백격리/E1000보장, GetJsonServer 동기안전파싱, _serialize null방어, Json2Str 문자열이스케이프) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-2** | `src/co/kr/kydbm/core/exception/ExceptionResolver.java` | 전역 예외 처리 표준화 (미처리 예외 표준 ResultInfo 응답 생성, AJAX jsonView 매핑/동기 redirect 분기, ORA-20000 보존 및 SQL 은닉, printStackTrace 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-3** | `src/co/kr/kydbm/core/service/SvcCRUD.java` | parsingForJonType 파싱 try-catch 내부 이동, @ExceptionHandler ResultInfo 표준 JSON 뷰 통일(SC_OK 200 유지), printStackTrace 전면 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | @ExceptionHandler(Exception.class) 표준 ResultInfo 등록, downExcel/downloadFileNew 응답 커밋 검증 및 브라우저 alert 안내, 내부정보 노출 차단, 스트림/Writer null-safe close, printStackTrace 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-5** | `soap.2.0.js`, `MonArch800.js` | PostJsonData null/비객체 응답 에러 격리, stale 메뉴 응답 무시, MonArch800.js $.Json2Str 최신 직렬화 동기화, GetJsonServer eval 복원 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-6** | `WebContent/js/MonArchResource.js`, `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.superContaner.js` | Java Spring 단일 환경 기준으로 미사용 .NET ASMX/응답 포장/날짜 직렬화 분기 정리 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-7** | `WebContent/js/MonArch.js`, `WebContent/js/jquery.kdb.soap.2.0.js` | 잔여 .NET 분기 100% 완전 정리 (`MonArch.js` getUserInfo ASMX 제거 및 `getUserInfo.json` 단일화, `soap.2.0.js` GETJSON2/GETJSONREMOTE/GETHTML toXml 및 .d 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 7** | `WebContent/js/jquery.kdb.superCalendar.js`, `superContaner.js`, `MonArch.js` | 달력 컴포넌트(superCalendar 17개 메서드, 900줄) 모듈 독립 분리 및 후로드 디스패처 핀포인트 연동 (작업 트리에 superContaner.js_20261030 백업 보존) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 8** | `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.superContaner.js` | 화면 설정(GETJSON) 로딩 실패 시 캐시 오염 방어 및 SetPageContaner 실패 안내 + [다시 시도] 복구 UX 구현 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-12**| `UploadController.java`, `superContaner.js` | M_EXCEL_DOWN_LOG DOWN_CNT 정합성 보강 (REGDATE 오라클 컬럼명 일치, 사용자 Fallback 갱신 및 superContaner _records 연동) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-13**| `MonArchDao.java`, `MonArchDaoImpl.java`, `ExcelDownload.java`, `UploadController.java` | 대용량 10만건 이상 엑셀/CSV 스트리밍 다운로드 파이프라인 이식 (RowCallbackHandler, SXSSFWorkbook(100) 디스크압축, OpenCSV 스트리밍, 구형 JXL 65,536행 한계 및 WAS 힙 일괄적재 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-14**| `UploadController.java`, `ExcelDownload.java`, `MonArch800.js`, `superContaner.js` | 엑셀 다운로드 연타 방지 및 비침해적 인라인 상태 안내 UX 연동 (클릭 즉시 버튼 잠금 + 안내 배지 노출, response.reset() 직후 fileDownloadToken 쿠키 주입, 응답 시작 시 자동 원복, 120초 타임아웃 재요청) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-15**| `UploadController.java`, `MonArch800.js`, `superContaner.js` | 일반 엑셀 자동 INSERT와 보안 엑셀 UPDATE 분기 정밀 격리(기존 로그 덮어쓰기 간섭 원천 차단), DownXlsNew 2단계 선행잠금 재진입(Re-entry) 허용 및 실패 시 CleanUp 복원 보완 | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 9** | `WebContent/js/jquery.kdb.superContaner.js` | 그리드 컬럼 마스킹 엔진 구현 (`colModel`의 `mask: "name"`, `"phone"`, `"email"` 등 속성 연동, 마우스 오버 `title` 툴팁 원본 데이터 유지) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 10-1**| `WebContent/js/core/jquery.kdb.core.superCalendar.js`, `WebContent/js/MonArch.js` (구형 `js/jquery.kdb.superCalendar.js` 정리 삭제) | Mon_LinkCRM_Maven 표준 구조 적용 (js/core 폴더 생성 및 superCalendar 이관, 구형 파일 정리 삭제, MonArch.js 로드 경로 갱신) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 1-2c**| `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | exeLoginProcess 로그인 쿼리 내 미사용 '거래처' 테이블 서브쿼리 제거 (ORA-00942 오류 원천 방어 및 NULL 처리) | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 10-2**| `WebContent/css/Common.css`, `Theme_*.css`, `MonArchResource.js`, `monform.jsp`, `favicon.ico` | 헤더 상단 탑바(사이트선택/법인검색/저장버튼) UI 리팩토링 및 사이트별(CEO/MS/PRO) 클래스 직결 배경색/캐시파쇄(?v=)/파비콘 404 해결 | `[x]` | `[x]` | **완료 (VDI 반영 및 정상동작 확인)** |
| **Step 10-3**| `WebContent/js/core/jquery.kdb.core.superTree.js`, `superChart.js`, `superContaner.js`, `MonArch.js` | superTree(4개 메서드) 및 superChart(3개 메서드) js/core 모듈 독립 분리 및 디스패처 연동 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
