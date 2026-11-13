# SERICEO CRM (MonArch 8.2.0) 시스템 고도화 및 보안 강화 전체 작업 내역서

> 작성일: 2026-11-13  
> 작성자: khma (KYDBM)  
> 대상 시스템: SERICEO CRM (Apache Tomcat 9 / JDK 11 / Spring MVC 4.3.30 / Oracle)

본 문서는 운영 소스 동기화(Step 0)부터 프레임워크 업그레이드(Step 1), 엑셀 보안·대용량 스트리밍(Step 2), SecureDB 개인정보 암호화(Step 3), 차세대 파일 시스템(Step 5), 예외/통신 표준화(Step 6), 프론트엔드 모듈화·UI/성능 최적화(Step 7~11)까지 전체 작업 내역을 요약한 공식 보고 및 인수인계 문서입니다.

---

## 1. 전체 작업 영역 요약

| 단계 | 작업 영역 | 핵심 성과 |
| :--- | :--- | :--- |
| **Step 0** | 운영 소스 동기화 및 베이스라인 검증 | 운영 서버(`sericrm_20261021`) 100% 동기화, 이클립스 빌드 경로 정비 및 VDI 톰캣 9 베이스라인 정상 기동 |
| **Step 1 / 4** | 프레임워크·라이브러리 및 인증 고도화 | Spring 3.1.1 ➡️ **4.3.30**, jQuery 1.10.2 ➡️ **1.12.4** 상향, 아이디 저장 및 비밀번호 복잡도 통합 검증 |
| **Step 2** | 엑셀 보안 및 대용량 스트리밍 구축 | POI 3.8 ➡️ **4.1.2** 교체, 2단계 사유/암호 팝업, 감사 로그(`M_EXCEL_DOWN_LOG`), **10만건 이상 스트리밍 다운로드** |
| **Step 3** | SecureDB Agentless 개인정보 암호화 | Agentless HTTPS 연동, `*_ENC`/`*_HASH` 네이밍 컨벤션 기반 전구간 자동 암복호화·NTS 검색·엑셀 복호화 |
| **Step 5** | 차세대 파일 업로드/다운로드 시스템 | Drag & Drop, 지연 업로드, 20MB 이중 검증, Path Traversal 방어, 휴지통 소프트 삭제(`CRM.M_FILE_MGMT`) |
| **Step 6** | 통신/예외 표준화 및 .NET 분기 정리 | AJAX/컨트롤러 표준 `ResultInfo` JSON 통일, `printStackTrace()` 제거, 미사용 `.NET ASMX` 레거시 분기 제거 |
| **Step 7~11** | 프론트엔드 모듈화·UI/성능 최적화 | Core 모듈 5종 `js/core/` 분리, 그리드 마스킹, 탑바 UI 리팩토링, DOM/정규식 성능 최적화 및 모달 버그 수정 |

---

## 2. 단계별 상세 작업 내역

### Step 0. 운영 소스 동기화 및 베이스라인 정립
- **운영 소스 동기화**: 운영 WAS 배포본(`sericrm_20261021`) 기준으로 `src/`, `WebContent/` 100% 동기화 및 불필요 테스트 첨부/중복 백업 정리, DB 테이블/프로시저 스크립트(12종) `운영쿼리정보/` 폴더 분리 보존
- **이클립스 프로젝트 정비**: `.project`, `.classpath`, `.settings/*` 구형 VJET 설정 제거, Default output folder(`WebContent/WEB-INF/classes`) 및 컴파일러 설정 통일
- **VDI 베이스라인 기동 확인**: 최초 반입본(`sericeo_crm_VDI반입용_20261029.zip`) 기준 VDI Tomcat 9 정상 기동 확인 완료

---

### Step 1 & Step 4. 프레임워크·라이브러리 업그레이드 및 로그인 보안 강화
- **Spring 4.3.30.RELEASE 업그레이드**:
  - `WebContent/WEB-INF/lib/`: 구형 Spring 3.1.1(22종) 및 Commons(2종) `_20261029` 백업 후 Spring `4.3.30.RELEASE` 18종 + `commons-fileupload-1.5.jar` + `commons-io-2.15.1.jar` 배치
  - `MappingJacksonJsonViewEx.java`: Spring 4.3 호환을 위해 `AbstractView` 상속 전환 (Jackson 1.x 호환 유지)
  - `WebContent/WEB-INF/Monarch820-servlet.xml`: XML 스키마 `4.3` 상향, `ContentNegotiationManager` 및 `<mvc:annotation-driven />` 적용, 미사용 Quartz 스케줄러 빈 비활성화
  - `MonArchDaoImpl.java`: Java 1.8/Spring 4.3 제네릭 `UserInfo` 형변환 보정 및 `exeLoginProcess` 내 미사용 '거래처' 테이블 서브쿼리 제거(ORA-00942 방어)
- **jQuery 1.12.4 보안 패치**:
  - `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp`, `SurveyAnsform.htm` 내 jQuery 경로를 `1.10.2` ➡️ `1.12.4`로 상향
- **로그인 편의성 및 비밀번호 복잡도 통합 검증 (Step 4)**:
  - `WebContent/js/jquery.kdb.MonArch800.js`: 아이디 저장 체크박스(`#chk-save`) 및 `SAVE_ID` 쿠키 연동, `validatePassword` 다형성 통합 검증 함수 적용

---

### Step 2. 엑셀 다운로드 보안 및 대용량 스트리밍 고도화
- **Apache POI 4.1.2 라이브러리 교체**:
  - `WebContent/WEB-INF/lib/`: 구형 POI 3.8(7종) `_20261030` 백업 후 POI 4.1.2(7종) + 암호화 의존 JAR 3종(`commons-math3-3.6.1.jar`, `SparseBitSet-1.2.jar`, `curvesapi-1.06.jar`) 배치
  - `CommonExcelUtil.java`: POI 4.1.2 `CellType` Enum 및 `DateUtil` 문법 보정
  - 미사용 구형 `ExcelDownload2.java` 정리 삭제
- **보안 다운로드(`DownXlsNew`) 및 사유/암호 2단계 팝업**:
  - `jquery.kdb.jobButton.js`: `DownXlsNew` 권한 체크 분기 추가
  - `jquery.kdb.superContaner.js`: 공통코드(`XLS_PURPOSE`, `XLS_TARGET`, `XLS_REASON_POPUP`) 동적 로딩 기반 2단계 팝업(사유 10자 이상 ➡️ 열람 암호 4자 이상), 보안 컬럼(`xlsOption.secCols` / `DOWNCOLS`) 추출, 다운로드 파일명 타임스탬프 일치화
  - `UploadController.java` & `ExcelDownload.java`: POI 4.1.2 Agile AES 암호화 워크북 생성, `getBrowser` NPE 방어, `excelPassword` 평문 마스킹, 감사 실패 시 다운로드 차단
- **보안 감사 이력 테이블 (`CRM.M_EXCEL_DOWN_LOG`)**:
  - `운영쿼리정보/M_EXCEL_DOWN_LOG.sql`, `M_COMM_CODE_XLS_SEC_COLS.sql` 작성 및 적용
  - 실제 조회 건수(`ds.size()`) 기반 `DOWN_CNT` 정밀 갱신, 일반 자동 로그(INSERT)와 보안 로그(UPDATE) 분기 격리
- **대용량 10만건 이상 엑셀/CSV 스트리밍 및 연타 방지 UX**:
  - `MonArchDao.java`, `MonArchDaoImpl.java`, `ExcelDownload.java`, `UploadController.java`: `RowCallbackHandler` + `SXSSFWorkbook(100)` 디스크 압축 + OpenCSV 스트리밍 적용(구형 JXL 65,536행 한계 및 WAS 힙 메모리 일괄 적재 해소)
  - 연타 방지: 클릭 즉시 버튼 잠금 + 인라인 상태 배지 노출, `response.reset()` 직후 `fileDownloadToken` 쿠키 주입을 통한 응답 시작 자동 원복(120초 타임아웃)

---

### Step 3. KSign SecureDB Agentless 개인정보 암호화 및 NTS 검색 연동
*(상세 기술 구조 및 시나리오는 [SECUREDB_GUIDE.md](SECUREDB_GUIDE.md) 참조)*
- **API 및 공통 엔진 구축**:
  - `WebContent/WEB-INF/lib/SDBAgentlessAPIforJava-V3.7.3-2.0.4.jar` 적용
  - `src/co/kr/kydbm/common/crypto/CryptoService.java`: `AgentlessApiFactory` / `SDBAgentlessApi` 싱글턴 관리, `encrypt()`, `decrypt()`, `getNts()`, `getNtsBsh()`, `close()` 및 장애 시 Fallback 방어
- **환경별 설정 분리 (`src/monarch.properties`, `src/properties/jdbc.properties`)**:
  - `[1] VDI 로컬 테스트용` / `[2] 개발서버(112.106.119.13)` / `[3] 운영서버(112.106.119.183)` 블록 및 `D:\CRM` WAR 배포 안내 주석 정리
- **네이밍 컨벤션(`*_ENC`, `*_HASH`) 기반 전구간 자동 연동**:
  - `MonArchDaoImpl.java`: 등록/수정 시 `*_ENC` 자동 암호화 및 SQL 내 `@*_HASH@` 존재 시 NTS 토큰 자동 주입(`injectPrivacyParams`), 조회 시 `"$."` 접두어 `*_ENC` 자동 복호화(`decryptRow`), 일반 검색 파라미터 NTS 변환(`convertHashSearchParam`), `ReadQuery` 진단 로그 보강
  - `FilterGenerator.java`: SQL 내 `_HASH` 포함 여부 동적 판별 후 확장필터(`extFilters`) `=` / `LIKE` 조건을 `getNts()` / `getNtsBsh()` 검색으로 자동 변환
  - `ExcelDownload.java`: 스트리밍 엑셀(XLSX)/CSV `RowCallbackHandler` 내 `*_ENC` 컬럼 자동 복호화(`decryptIfEncCell`)

---

### Step 5. 차세대 파일 업로드/다운로드/삭제 시스템 구축
- **백엔드 독립 엔드포인트 및 보안 검증**:
  - `UploadController.java`, `MonArchResource.js`, `Monarch820-servlet.xml`: `/uploadFileNew`, `/downloadFileNew`, `/deleteFileSafe` 엔드포인트 및 세션 인터셉터 매핑
  - 파일당 20MB 백엔드 강제 검증, Path Traversal 경로 조작 방어, D: 드라이브 미존재 환경 자동 Fallback(`getBaseUploadPath`), 휴지통 이동 및 DB 소프트 삭제(`USE_YN='N'`, `DEL_DATE=SYSDATE`)
- **DB 메타 일원화 (`CRM.M_FILE_MGMT`)**:
  - `운영쿼리정보/M_FILE_MGMT.sql`: 테이블/트리거/인덱스 DDL 작성 및 `singleFileNew`, `multiFileNew` 모두 `M_FILE_MGMT`(`FILE_SEARCH_KEY`, `MULTIFILE_LIST`)로 일원화
- **프론트엔드 UI/UX (`jquery.kdb.superContaner.js`)**:
  - HTML5 Drag & Drop 드롭존, 클라이언트 지연 업로드(저장 시점 전송), 20MB 사전 검증, `singleFileNew` 1개 파일 제한 및 교체 대기/취소 복원 기능 구현

---

### Step 6. 통신·예외 처리 표준화 및 레거시 .NET 분기 정리
- **프론트엔드 통신 관문 고도화 (`jquery.kdb.soap.2.0.js`, `jquery.kdb.MonArch800.js`)**:
  - `PostJsonData` 직렬화 사전 격리, JSON 안전 파싱, null/비객체 응답 에러 격리, stale 메뉴 응답 무시, `_serialize` null 방어, `$.Json2Str` 특수문자 이스케이프 동기화
- **백엔드 전역·컨트롤러 예외 처리 표준화**:
  - `ExceptionResolver.java`, `SvcCRUD.java`, `UploadController.java`: 미처리 예외 시 표준 `ResultInfo` JSON 응답(`SC_OK 200` 유지) 통일, `ORA-20000` 사용자 정의 메시지 보존 및 SQL/내부정보 외부 노출 차단, `printStackTrace()` 전면 제거 및 Log4j/DB(`M_ERROR_LOG`) 일원화, `SvcCRUD` 실행타입 미존재 시 `[service, method, usite, jobType]` 진단 로그 보강
- **미사용 .NET 레거시 분기 완전 제거**:
  - `MonArchResource.js`, `MonArch.js`, `soap.2.0.js`, `superContaner.js`: Java Spring 단일 환경에 불필요한 `.NET ASMX`, `toXml`, `.d` 응답 포장 분기 정리

---

### Step 7 ~ Step 11. 프론트엔드 모듈화, UI/UX 개선 및 성능 최적화
- **Core 모듈 독립 분리 (`WebContent/js/core/`)**:
  - `superContaner.js`에서 `superCalendar`(17개 메서드), `superTree`(4개 메서드), `superChart`(3개 메서드), `superMap`(11개 메서드), `SuperAnswer`(5개 메서드) 5종을 `WebContent/js/core/jquery.kdb.core.*.js`로 분리 및 후로드 디스패처(`MonArch.js`, `MonArch_Simple.js`) 연동
- **화면 설정 로딩 실패 복구 UX (Step 8)**:
  - `GETJSON` 로딩 실패 시 캐시 오염 방어 및 `SetPageContaner` 실패 안내 + `[다시 시도]` 버튼 제공
- **그리드 개인정보 마스킹 엔진 (Step 9)**:
  - `superContaner.js`: `colModel`의 `mask: "name" | "phone" | "email"` 등 속성 연동 및 마우스 오버 `title` 툴팁 원본 유지
- **헤더 탑바 UI 리팩토링 및 캐시/404 해소 (Step 10-2)**:
  - `Common.css`, `Theme_*.css`, `MonArchResource.js`, `monform.jsp`, `favicon.ico`: 사이트(CEO/MS/PRO) 클래스 직결 배경색 적용, 정적 리소스 캐시 파쇄(`?v=`), 파비콘 404 제거
- **렌더링 성능 및 모달 버그 수정 (Step 11)**:
  - `superContaner.js`: 그리드 렌더링(`tableShowData`) 시 `colMetaList` 1회 사전 캐싱으로 반복 DOM `.attr()` 조회 제거 (Step 11-1)
  - `MonArch800.js`: `$.decHTML` 변환 대상 미포함 문자열 조기 반환(Early Return) 최적화 (Step 11-2)
  - `superContaner.js`: `getJson` 구조체 모달 호출 시 전체 `.ui-widget-overlay` z-index 일괄 변경 제거로 부모 모달 클릭 차단 버그 수정 (Step 11-3)

---

## 3. 개발/운영 서버 WAR 배포 전 최종 확인 체크리스트 (`D:\CRM`)

1. **환경 설정 전환**: `src/monarch.properties` 및 `src/properties/jdbc.properties`에서 배포 대상 서버(`[2] 개발서버: 112.106.119.13` 또는 `[3] 운영서버: 112.106.119.183`) 블록만 주석(`#`) 해제
2. **DB 비밀번호 암호화**: 운영 WAR 생성 시 `jdbc.properties` 운영 계정 비밀번호 `ENC(...)` 적용 및 Tomcat Jasypt 키 일치 확인
3. **SecureDB 인증서 및 방화벽**: 대상 서버 `C:\SecureDB\` 경로에 환경별 인증서(`ca_dev.pem` 또는 `ca.pem`, `rootca.pem`) 배치 및 정책서버 `8090` 포트 통신 허용 확인
4. **로그 레벨 점검**: `WebContent/WEB-INF/log4j.properties` 내 `JdbcTemplate` / `NamedParameterJdbcTemplate` DEBUG 로그 운영 레벨 조정 확인
5. **WAR 배포**: 생성된 WAR 파일을 대상 서버 `D:\CRM` 경로에 배포 후 Tomcat 기동 및 주요 화면·검색·엑셀·암호화 동작 점검
