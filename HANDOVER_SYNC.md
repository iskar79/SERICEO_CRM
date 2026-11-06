# 다중 PC 안티그래비티(Antigravity) 실시간 작업 공유 및 인수인계서

> **🔄 양방향 PC 동기화 및 VDI 반영 확인 게이트(Gate) 규칙 (필독)**
> 1. **작업 시작 시 (`PC A` 또는 `PC B`에서 안티그래비티를 열었을 때)**:
>    * 반드시 가장 먼저 **`git pull github master`**를 실행하여 상대방 PC에서 작업한 최신 코드와 본 문서(`HANDOVER_SYNC.md`), `AGENTS.md`, `CHANGELOG_KHMA.md`를 내려받습니다.
>    * 아래 **[2. 전체 작업 Tasklist 및 2단계 검증 대장 (`로컬 수정` vs `VDI 붙여넣기 확인`)]**을 확인하고 중단된 지점부터 정확히 이어서 진행합니다.
> 2. **🚨 VDI 실제 붙여넣기 확인 게이트 (가장 중요)**:
>    * 로컬 안티그래비티에서 파일을 수정했다고 해서 해당 스텝이 끝난 것이 아닙니다!
>    * 안티그래비티가 로컬 파일을 수정하면 먼저 **`[로컬 수정: 완료(x)] / [VDI 붙여넣기 확인: 대기( )]`** 상태로 두고, VDI 복사·붙여넣기 가이드를 안내합니다.
>    * 이후 **사용자가 실제로 VDI 이클립스에 복사·붙여넣기(`Ctrl+V`)를 완료하고 동작 이상 유무를 확인해 주었을 때만** 비로소 **`[VDI 붙여넣기 확인: 완료(x)]`**로 변경하고 다음 스텝으로 넘어갑니다.
> 3. **단일 스텝(Step) 작업 완료 또는 PC 이동 시**:
>    * 작업한 내역을 본 문서(`HANDOVER_SYNC.md`), `AGENTS.md`(7번 섹션), `CHANGELOG_KHMA.md`에 최신 상태로 업데이트한 뒤 **`git add -A && git commit -m "..." && git push github master`**를 실행합니다.

---

## 1. 현재까지 완료된 작업 요약 (2026.10.30 16:30 기준)

1. **Step 0: 운영 최신 소스 100% 동기화 및 베이스라인 구동 검증 완료**:
   - 운영 백업본(`sericrm_20261021`) 기준으로 `src/` 및 `WebContent/` 전체 100% 동기화 완료.
   - VDI 환경에서 Default output folder(`WebContent/WEB-INF/classes`) 및 Compiler `1.7` 설정으로 베이스라인 톰캣 정상 구동 확인 완료.
   - ⚠️ **VDI 오라클 DB 접속 주소 유의**: VDI 내부에서는 `70.2.251.122:4034` (`jdbc:oracle:thin:@70.2.251.122:4034:MICRODB`)로 접속하며 VDI 이클립스의 `src/properties/jdbc.properties`에 이미 반영되어 있으므로 덮어쓰지 않도록 주의합니다.

2. **Step 1-1 ~ Step 1-2: Spring 4.3.30 업그레이드 완료 및 VDI 톰캣 정상 기동 성공**:
   - `WebContent/WEB-INF/lib/`: 구형 Spring 3.1.1(22개) 및 Commons(2개) `_20261029` 백업 보존 후 Spring 4.3.30 신규 JAR 20종 배치 완료.
   - `src/co/kr/kydbm/core/utils/MappingJacksonJsonViewEx.java`: `AbstractView` 상속 전환 및 Jackson 1.x 호환성 유지.
   - `WebContent/WEB-INF/Monarch820-servlet.xml`: XML 스키마 `4.3.xsd` 상향, `ContentNegotiationManager` 적용, `<mvc:annotation-driven />` 표준 적용, 미사용 Quartz 스케줄러 빈 비활성화.
   - `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java`: Spring 4.3 및 Java 1.8 제네릭 `UserInfo` 형변환 보정 (1015 라인).
   - **VDI 톰캣 9 정상 기동 확인 완료 (2026-10-29 16:00)**.

3. **Step 1-3: jQuery 1.12.4 보안 패치 (4개 JSP) 완료 및 VDI 반영**:
   - `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp` 스크립트 경로 교체 완료.

4. **Step 1-4 & Step 4: 아이디 저장 및 비밀번호 복잡도 통합 검증 완료 및 VDI 반영**:
   - `login.jsp` 및 `MonArch800.js`: `#chk-save` 체크박스 및 `SAVE_ID` 쿠키 연동 완료.
   - `MonArch800.js`: `validatePassword` 다형성 통합 함수(폼객체, 3개인자, 단일문자열) 적용 완료.
   - `MonArch800.js` 레거시 주석 전수 정리 완료, JDK 11 컴파일 파싱 검증 완료.

| **Step 2-1** | WebContent/WEB-INF/lib/ | POI 4.1.2 7종 + 의존 JAR 3종(commons-math3, SparseBitSet, curvesapi) 배치 | [x] | [ ] | **로컬완료 (VDI 반영 대기)** |
   - `WebContent/WEB-INF/lib/`: 구형 POI 3.8 JAR 7종 `_20261030` 접미사로 백업, POI 4.1.2 JAR 7종 배치 완료 (VDI 확인 완료).
   - `src/co/kr/kydbm/common/CommonExcelUtil.java`: POI 4.1.2 호환 `CellType` Enum 및 `DateUtil` 적용, 컴파일 에러 0건 (VDI 확인 완료).

6. **Step 2-3 (jobButton.js): 권한 체크 분기 추가 및 레거시 주석 정리 완료 (VDI 확인 완료)**:
   - `WebContent/js/jquery.kdb.jobButton.js`: Line 43 `DownXlsNew` 권한 체크 포함, 사장된 주석 64줄 정리, 표준 헤더 및 Javadoc 적용 완료 (VDI 반영 완료).

7. **미사용 파일 정리: ExcelDownload2.java 완전 삭제 완료 (VDI 확인 완료)**:
   - `src/co/kr/kydbm/core/filecontrol/ExcelDownload2.java` 및 클래스 파일 전수 삭제 완료.

| **Step 2-4** | src/co/kr/kydbm/core/filecontrol/UploadController.java | 엑셀 파라미터 수신, return null; 보정, Throwable 로깅 보강 | [x] | [ ] | **로컬완료 (VDI 반영 대기)** |
   - `UploadController.java`: `excelUsage`, `excelTarget`, `excelReason`, `excelPassword` 파라미터 취득 및 `ExcelDownload.downExcel`에 전달. 표준 헤더 주석 적용, 사장된 레거시 주석 전수 정리, 깨진 한글 Javadoc 복원, 상세 설명 보강 완료.
   - `ExcelDownload.java`: 기존 7개 파라미터 `downExcel` 하위호환 유지, 8개 오버로딩 `downExcel` 추가. POI 4.1.2 Agile AES 암호화 워크북(`SXSSFWorkbook` 100행 스트리밍) 및 `POIFSFileSystem` 암호화 스트림 방출 구현. 표준 헤더 및 Javadoc 완비.

9. **Step 2-3 (superContaner.js): `DownXlsNew` 신규 메서드 구현 완료 (로컬 완료)**:
   - 공통코드 그룹 ID(`XLS_PURPOSE`, `XLS_TARGET`) `$.SvcGetCodes` 동적 로딩 + Fallback 기본값 연동.
   - 2단계 순차 팝업 (1단계: 용도/대상/목적 10자 이상 ➡️ 2단계: 엑셀 열람 암호 4자 이상 필수).

10. **Step 5 (차세대 파일 시스템): `singleFileNew`, `multiFileNew` Drag & Drop 및 백엔드 3종 엔드포인트 구축 완료 (VDI 런타임 검증 완료)**:
   - `UploadController.java`: `/uploadFileNew`, `/downloadFileNew`, `/deleteFileSafe` 3종 엔드포인트 구현 및 D: 드라이브 미존재 VDI 환경 대응 `getBaseUploadPath` 자동 Fallback 구현 완료.
   - `superContaner.js`: HTML5 Drag & Drop 드롭존, 클라이언트 지연 업로드, 20MB 검증, `singleFileNew` 1개 파일 제한 및 기존 파일 자동 교체 안내 문구/`confirm` 확인창 추가 완료.
   - `Resource.js`, `Monarch820-servlet.xml`: URL 맵 등록 및 세션 인터셉터 매핑 완료.

---

## 2. 전체 작업 Tasklist 및 2단계 검증 대장 (`로컬 수정` ➡️ `VDI 붙여넣기 확인`)

| 스텝 | 대상 파일 경로 | 작업 내용 요약 | ① 로컬 수정 | ② VDI 붙여넣기/구동확인 | 현재 상태 |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Step 0-1** | `.project`, `.classpath`, `.settings/*` | 구형 VJET 제거, 출력경로(`WEB-INF/classes`) 및 컴파일러 `1.7` 설정 | `[x]` | `[x]` | **완료** |
| **Step 0-2** | `sericeo_crm_VDI반입용_20261029.zip` | 운영 소스 100% 동기화본 + 신규 JAR 반입 및 VDI 베이스라인 기동 확인 | `[x]` | `[x]` | **완료** |
| **Step 1-1** | `WebContent/WEB-INF/lib/` | 구형 Spring 3.1.1(22개) & Commons(2개) `_20261029` 백업 후 신규 JAR 20종 배치 | `[x]` | `[x]` | **완료** |
| **Step 1-1b**| `src/co/kr/kydbm/core/utils/MappingJacksonJsonViewEx.java` | Spring 4.3.30 호환을 위해 `AbstractView` 상속 전환 (Jackson 1.x 유지) | `[x]` | `[x]` | **완료** |
| **Step 1-2** | `WebContent/WEB-INF/Monarch820-servlet.xml` | XML 스키마 `4.3`, `ContentNegotiationManager`, `mvc:annotation-driven` 적용 | `[x]` | `[x]` | **완료** |
| **Step 1-2b**| `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | Spring 4.3 / Java 1.8 제네릭 `UserInfo` 형변환 보정 (1015라인) | `[x]` | `[x]` | **완료** |
| **Step 1-3** | `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp` | jQuery `1.10.2` ➡️ `1.12.4` 스크립트 경로 변경 (JSP 4개) | `[x]` | `[x]` | **완료** |
| **Step 1-4** | `WebContent/js/jquery.kdb.MonArch800.js` | 로그인 화면 아이디 저장 체크박스(`#chk-save`) 활성화 및 쿠키(`SAVE_ID`) 연동 | `[x]` | `[x]` | **완료** |
| **Step 4** | `WebContent/js/jquery.kdb.MonArch800.js` | `validatePassword` 비밀번호 검증 로직 단일 통합 및 레거시 주석 전수 정리 | `[x]` | `[x]` | **완료** |
| **Step 2-1** | `WebContent/WEB-INF/lib/` | POI 4.1.2 7종 + 의존 JAR 3종(commons-math3, SparseBitSet, curvesapi) 배치 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-2** | `src/co/kr/kydbm/common/CommonExcelUtil.java` | POI 4.1.2 호환을 위한 `CellType` Enum 및 `DateUtil` 문법 수정 | `[x]` | `[x]` | **완료** |
| **Step 2-3** | `WebContent/js/jquery.kdb.jobButton.js` | `DownXlsNew` 권한 체크 분기 추가 및 레거시 주석 정리 (Line 43) | `[x]` | `[x]` | **완료** |
| **Step 2-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | 엑셀 파라미터 수신, return null; 보정, Throwable 로깅 보강 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-5** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | Agile AES 암호화 워크북 생성, getBrowser NPE 방어, Throwable 처리 | `[x]` | `[x]` | **완료 (VDI 정상구동 확인)** |
| **Step 2-6** | `운영쿼리정보/M_EXCEL_DOWN_LOG.sql` | 엑셀 다운로드 보안 감사 및 사유 이력 테이블 DDL 초경량 13개 컬럼 정비 (CRM.M_EXCEL_DOWN_LOG) | `[x]` | `[x]` | **완료 (VDI 테이블 생성/정비 완료)** |
| **Step 2-7** | `WebContent/js/jquery.kdb.superContaner.js` | XLS_REASON_POPUP 동적로드, DownXlsNew 타깃 서비스명/메소드명/파일명 정밀 추출 및 실제 다운로드 파일명 타임스탬프 일치화, IP 다중 추출 보정 | `[x]` | `[x]` | **완료 (VDI 정상동작 확인)** |
| **Step 2-8** | `운영쿼리정보/M_COMM_CODE_XLS_SEC_COLS.sql`, `superContaner.js` | 정보성/홍보용 엑셀 추출 보안 컬럼(xlsOption.secCols 동적옵션) DB 공통코드 연동 및 DownXlsNew DOWNCOLS 추출 구현 | `[x]` | `[x]` | **완료 (VDI 반영 완료)** |
| **Step 2-9** | src/co/kr/kydbm/core/filecontrol/UploadController.java | 실제 엑셀 조회 데이터 건수(ds.size())로 M_EXCEL_DOWN_LOG.DOWN_CNT 정밀 갱신 로직 구현 | [x] | [x] | **완료 (VDI 반영 확인)** |
| **Step 2-10**| superContaner.js, UploadController.java, M_COMM_CODE_XLS_SEC_COLS.sql | 엑셀 암호(excelPassword) 평문 마스킹, 감사 실패 시 다운로드 차단, 하얀화면 방어 및 DB오류로깅, 사이트('44') 삭제 조건 보강 | [x] | [x] | **완료 (VDI 반영 확인)** |
| **Step 5-1** | `UploadController.java`, `Resource.js`, `Monarch820-servlet.xml` | 차세대 파일 백엔드 독립 엔드포인트 3종(/uploadFileNew, /downloadFileNew, /deleteFileSafe) 및 세션 인터셉터 매핑 | `[x]` | `[x]` | **완료 (VDI 톰캣 정상 기동 확인)** |
| **Step 5-2** | `WebContent/js/jquery.kdb.superContaner.js` | singleFileNew, multiFileNew Drag&Drop, 클라이언트 지연 업로드, 20MB 검증, 교체대기/취소복원 | `[x]` | `[x]` | **완료 (VDI 정상동작 확인)** |
| **Step 5-3** | src/co/kr/kydbm/core/filecontrol/UploadController.java | 파일당 20MB 백엔드 강제 검증, Path Traversal 방어, 세션(userInfo) 식별자 취득, 휴지통 이동 검증 및 DB 소프트 삭제(USE_YN='N', DEL_DATE=SYSDATE) | [x] | [x] | **완료 (VDI 반영 확인)** |
| **Step 2-11**| `superContaner.js`, `UploadController.java` | 엑셀 다운로드 폼(xlsForm) 전송 시 UID/USITE 명시적 추가, 백엔드 세션 Fallback 및 모나크 동적 주석 문법 연동으로 DOWN_CNT 100% 정합성 보장 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 5-4** | `UploadController.java` | M_IMAGE_GAL.FILE_PATH에 원본 파일명 제외하고 순수 타임스탬프(YYYY/MM/타임스탬프)만 저장(기존 CRM 표준 유지) 및 다운로드/삭제 레거시 파일 호환 탐색 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-1** | `WebContent/js/jquery.kdb.soap.2.0.js` | soap 통신 관문 4대 고도화 (PostJsonData 직렬화 사전격리/JSON안전파싱/콜백격리/E1000보장, GetJsonServer 동기안전파싱, _serialize null방어, Json2Str 문자열이스케이프) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-2** | `src/co/kr/kydbm/core/exception/ExceptionResolver.java` | 전역 예외 처리 표준화 (미처리 예외 표준 ResultInfo 응답 생성, AJAX jsonView 매핑/동기 redirect 분기, ORA-20000 보존 및 SQL 은닉, printStackTrace 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-3** | `src/co/kr/kydbm/core/service/SvcCRUD.java` | parsingForJonType 파싱 try-catch 내부 이동, @ExceptionHandler ResultInfo 표준 JSON 뷰 통일(SC_OK 200 유지), printStackTrace 전면 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | @ExceptionHandler(Exception.class) 표준 ResultInfo 등록, downExcel/downloadFileNew 응답 커밋 검증 및 브라우저 alert 안내, 내부정보 노출 차단, 스트림/Writer null-safe close, printStackTrace 제거 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-5** | `soap.2.0.js`, `MonArch800.js` | PostJsonData null/비객체 응답 에러 격리, stale 메뉴 응답 무시, MonArch800.js $.Json2Str 최신 직렬화 동기화, GetJsonServer eval 복원 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-6** | `WebContent/js/MonArchResource.js`, `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.superContaner.js` | Java Spring 단일 환경 기준 미사용 .NET ASMX/응답 포장/날짜 분기 정리 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 6-7** | `WebContent/js/MonArch.js`, `WebContent/js/jquery.kdb.soap.2.0.js` | 잔여 .NET 분기 100% 완전 정리 (`MonArch.js` getUserInfo ASMX 제거 및 `getUserInfo.json` 단일화, `soap.2.0.js` GETJSON2/GETJSONREMOTE/GETHTML toXml 및 .d 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 7** | `WebContent/js/jquery.kdb.superCalendar.js`, `superContaner.js`, `MonArch.js` | 달력 컴포넌트(superCalendar 17개 메서드, 900줄) 모듈 독립 분리 및 후로드 디스패처 핀포인트 연동 (작업 트리에 superContaner.js_20261030 백업 보존) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 8** | `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.superContaner.js` | 화면 설정(GETJSON) 로딩 실패 시 캐시 오염 방어 및 SetPageContaner 실패 안내 + [다시 시도] 복구 UX 구현 | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-12**| `UploadController.java`, `superContaner.js` | M_EXCEL_DOWN_LOG DOWN_CNT 정합성 보강 (REGDATE 오라클 컬럼명 일치, 사용자 Fallback 갱신 및 superContaner _records 연동) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-13**| `MonArchDao.java`, `MonArchDaoImpl.java`, `ExcelDownload.java`, `UploadController.java` | 대용량 10만건 이상 엑셀/CSV 스트리밍 다운로드 파이프라인 이식 (RowCallbackHandler, SXSSFWorkbook(100) 디스크압축, OpenCSV 스트리밍, 구형 JXL 65,536행 한계 및 WAS 힙 일괄적재 제거) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-14**| `UploadController.java`, `ExcelDownload.java`, `MonArch800.js`, `superContaner.js` | 엑셀 다운로드 연타 방지 및 비침해적 인라인 상태 안내 UX 연동 (클릭 즉시 버튼 잠금 + 안내 배지 노출, response.reset() 직후 fileDownloadToken 쿠키 주입, 응답 시작 시 자동 원복, 120초 타임아웃 재요청) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 2-15**| `UploadController.java`, `MonArch800.js`, `superContaner.js` | 일반 엑셀 자동 INSERT와 보안 엑셀 UPDATE 분기 정밀 격리(기존 로그 덮어쓰기 간섭 원천 차단), DownXlsNew 2단계 선행잠금 재진입(Re-entry) 허용 및 실패 시 CleanUp 복원 보완 | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 9** | `WebContent/js/jquery.kdb.superContaner.js` | 그리드 컬럼 마스킹 엔진 구현 (`colModel`의 `mask: "name"`, `"phone"`, `"email"` 등 속성 연동, 마우스 오버 `title` 툴팁 원본 데이터 유지) | `[x]` | `[x]` | **완료 (VDI 반영 확인)** |
| **Step 10-1**| `WebContent/js/core/jquery.kdb.core.superCalendar.js`, `WebContent/js/MonArch.js` | Mon_LinkCRM_Maven 표준 구조 적용 (js/core 폴더 생성 및 superCalendar 이관, MonArch.js 로드 경로 갱신) | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 1-2c**| `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` | exeLoginProcess 로그인 쿼리 내 미사용 '거래처' 테이블 서브쿼리 제거 (ORA-00942 오류 원천 방어 및 NULL 처리) | `[x]` | `[ ]` | **로컬 수정 완료 (VDI 반영 대기)** |
| **Step 3** | `MonArchDaoImpl.java`, `FilterGenerator.java`, 프로시저/배치 등 | KSign SecureDB 개인정보 암복호화 (DB UDF 쿼리 함수 우선 적용 방식) | `[ ]` | `[ ]` | **최종 마지막 단계로 진행 예정 (보류)** |

## 운영 WAR 생성 전 필수 확인 알림

> 20261103 khma : 사용자가 운영 WAR 생성·배포를 시작한다고 하면 아래 두 항목을 먼저 상기시키고, 운영용 설정과 생성될 WAR에서 반영 여부를 확인한다.

- [ ] **운영 DB 정보 암호화**: 로컬 개발용 JDBC 설정과 운영 접속 정보가 다르므로, 운영용 URL·계정을 적용하고 비밀번호를 `ENC(...)`로 변환한 뒤 WAR에 평문 운영 비밀번호가 포함되지 않았는지 확인한다. 운영 Tomcat의 Jasypt 복호화 키가 해당 ENC 값과 일치하는지도 확인한다.
- [ ] **SQL 파라미터 로깅 레벨**: `WebContent/WEB-INF/log4j.properties`의 `JdbcTemplate` 및 `NamedParameterJdbcTemplate` DEBUG 설정을 운영 WAR 생성 전에 검토하고, 운영용 로그 레벨로 조정했는지 확인한다.
