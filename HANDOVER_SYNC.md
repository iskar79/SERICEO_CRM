# 다중 PC 안티그래비티(Antigravity) 실시간 작업 공유 및 인수인계서

> **🔄 양방향 PC 동기화 및 VDI 반영 확인 게이트(Gate) 규칙 (필독)**
> 1. **작업 시작 시 (`PC A` 또는 `PC B`에서 안티그래비티를 열었을 때)**:
>    * 반드시 가장 먼저 **`git pull github master`**를 실행하여 상대방 PC에서 작업한 최신 코드와 본 문서(`HANDOVER_SYNC.md`), `AGENTS.md`, `CHANGELOG_KHMA.md`를 내려받습니다.
>    * 아래 **[3. 전체 작업 Tasklist 및 2단계 검증 대장 (`로컬 수정` vs `VDI 붙여넣기 확인`)]**을 확인하고 중단된 지점부터 정확히 이어서 진행합니다.
> 2. **🚨 VDI 실제 붙여넣기 확인 게이트 (가장 중요)**:
>    * 로컬 안티그래비티에서 파일을 수정했다고 해서 해당 스텝이 끝난 것이 아닙니다!
>    * 안티그래비티가 로컬 파일을 수정하면 먼저 **`[로컬 수정: 완료(x)] / [VDI 붙여넣기 확인: 대기( )]`** 상태로 두고, VDI 복사·붙여넣기 가이드를 안내합니다.
>    * 이후 **사용자가 실제로 VDI 이클립스에 복사·붙여넣기(`Ctrl+V`)를 완료하고 동작 이상 유무를 확인해 주었을 때만** 비로소 **`[VDI 붙여넣기 확인: 완료(x)]`**로 변경하고 다음 스텝으로 넘어갑니다.
> 3. **단일 스텝(Step) 작업 완료 또는 PC 이동 시**:
>    * 작업한 내역을 본 문서(`HANDOVER_SYNC.md`), `AGENTS.md`(7번 섹션), `CHANGELOG_KHMA.md`에 최신 상태로 업데이트한 뒤 **`git add -A && git commit -m "..." && git push github master`**를 실행합니다.

---

## 1. 현재까지 완료된 작업 요약 (Step 0 완료)

1. **운영 최신 소스 100% 동기화 및 정리 완료**:
   - 운영 백업본(`sericrm_20261021`) 기준으로 `src/` 및 `WebContent/` 전체를 100% 동기화 완료했습니다.
   - 운영 DB 테이블/프로시저 쿼리 12종은 `운영쿼리정보/` 폴더로 이관 보존했고, 불필요한 대용량 설치/첨부파일 및 중복 백업 파일을 모두 정리했습니다.
2. **Step 1 & Step 2 업그레이드용 라이브러리 사전 반입 완료**:
   - `WebContent/WEB-INF/lib/Spring 4.3.30 신규 라이브러리/`: Spring `4.3.30.RELEASE` 18종 + `commons-fileupload-1.5.jar` + `commons-io-2.15.1.jar` (총 20개 JAR)
   - `WebContent/js/jquery-1.12.4.min.js`: jQuery 1.12.4
   - `WebContent/WEB-INF/lib/POI 4.1.2 신규 라이브러리/`: POI 4.1.2 및 의존성 7종
3. **VDI 최초 반입 및 베이스라인 구동 성공 (완료 - 2026.10.29)**:
   - `sericeo_crm_VDI반입용_20261029.zip`(68.90MB)을 VDI 이클립스에 반입하고, **Default output folder를 `WebContent/WEB-INF/classes`로 설정**, **Java Compiler `1.7` 설정으로 현재 운영 베이스라인 톰캣 9 서버가 정상 구동되는 것까지 확인 완료**했습니다. (로컬 `.classpath` 및 `.settings/*`도 동일하게 동기화 완료)
   - ⚠️ **VDI 오라클 DB 접속 주소 유의**: 운영 서버(`26.2.51.37:1622`)와 달리 **VDI 내부에서 오라클 DB 접속 주소는 `70.2.251.122:4034` (`jdbc:oracle:thin:@70.2.251.122:4034:MICRODB`)**이며, VDI 이클립스의 `src/properties/jdbc.properties`에 이미 반영되어 있으므로 향후 VDI 파일 복사 시 `jdbc.properties`를 덮어쓰지 않도록 주의합니다.

---

## 2. 절대 준수해야 할 작업 원칙 (필수 리마인드)

1. **완전한 Step-by-Step 진행 및 VDI 붙여넣기 확인 게이트**:
   - 여러 파일을 한꺼번에 수정하지 말고 **반드시 단일 스텝 단위로 로컬 수정 ➡️ 로컬 이클립스 에러 확인 ➡️ 사용자 VDI 복사·붙여넣기 반영 확인 ➡️ VDI 동작 확인** 순서로 진행합니다.
2. **외부 PC ➡️ VDI 클립보드 텍스트 복사·붙여넣기(`Ctrl+C` ➡️ `Ctrl+V`) 가이드 제공**:
   - 중소형 파일은 전체 덮어쓰기(`Ctrl+A` ➡️ `Ctrl+V`), 대형 파일(`superContaner.js`, `MonArch800.js` 등)은 이클립스 `Ctrl+L`(라인 이동) 기준 `[시작 라인 ~ 끝 라인]`, `[기존 코드 블록]`, `[교체할 khma 주석 포함 코드 블록]`을 정확히 안내합니다.
3. **기존 코드 삭제 절대 금지 & `khma` 주석 표준 엄수**:
   - 기존 코드는 절대 지우지 않고 주석(`/* ... */`, `//`, `<!-- ... -->`)으로 보존하며, 모든 주석은 `[날짜] [khma]` 순서(`// 20261029 khma Start : ...` ~ `End`)로 작성합니다.
4. **AI 작업 흔적 절대 금지**:
   - 코드, 주석, 문서 어디에도 AI 관련 단어나 영문 태그(`Why:`, `What:` 등)를 절대 남기지 않고 사내 `khma` 개발자 스타일과 100% 일치시킵니다.

---

## 3. 전체 작업 Tasklist 및 2단계 검증 대장 (`로컬 수정` ➡️ `VDI 붙여넣기 확인`)

| 스텝 | 대상 파일 경로 | 작업 내용 요약 | ① 로컬 수정 | ② VDI 붙여넣기/구동확인 | 현재 상태 |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Step 0-1** | `.project`, `.classpath`, `.settings/*` | 구형 VJET 제거, 출력경로(`WEB-INF/classes`) 및 컴파일러 `1.7` 설정 | `[x]` | `[x]` | **완료** |
| **Step 0-2** | `sericeo_crm_VDI반입용_20261029.zip` | 운영 소스 100% 동기화본 + 신규 JAR 반입 및 VDI 베이스라인 기동 확인 | `[x]` | `[x]` | **완료** |
| **Step 1-1** | `WebContent/WEB-INF/lib/` | 구형 Spring 3.1.1(21개) & Commons(2개) `_20261029` 백업 후 신규 JAR 20종 배치 | `[ ]` | `[ ]` | 👉 **최우선 착수 대기** |
| **Step 1-2** | `WebContent/WEB-INF/Monarch820-servlet.xml` | 상단 Spring XML 스키마(`xsd`) `3.0` ➡️ `4.3` 상향 (`khma` 주석 적용) | `[ ]` | `[ ]` | 대기 |
| **Step 1-3** | `WebContent/ui/monform.jsp`, `login.jsp`, `loginProcess.jsp`, `logoutProcess.jsp` | jQuery `1.10.2` ➡️ `1.12.4` 스크립트 경로 변경 (JSP 4개) | `[ ]` | `[ ]` | 대기 |
| **Step 1-4** | `WebContent/js/jquery.kdb.MonArch800.js` | 로그인 화면 아이디 저장 체크박스(`#chk-save`) 활성화 및 쿠키(`SAVE_ID`) 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-1** | `WebContent/WEB-INF/lib/` | 구형 POI 3.8 `_20261029` 백업 후 `POI 4.1.2 신규 라이브러리/` 7종 배치 | `[ ]` | `[ ]` | 대기 |
| **Step 2-2** | `src/co/kr/kydbm/common/CommonExcelUtil.java` | POI 4.1.2 호환을 위한 `CellType` Enum 문법 수정 | `[ ]` | `[ ]` | 대기 |
| **Step 2-3** | `WebContent/js/jquery.kdb.superContaner.js` | `DownXls` 함수 블록 내 4단 보안 모달 팝업 및 감사로그 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | 엑셀 비밀번호(`excelPassword`) 파라미터 수신 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-5** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | POI 4.1.2 Agile AES 암호화 워크북 생성 및 스트림 방출 엔진 | `[ ]` | `[ ]` | 대기 |
| **Step 3** | `MonArchDaoImpl.java`, `FilterGenerator.java`, 프로시저/배치 등 | KSign SecureDB 개인정보 암복호화 공통 모듈 및 프로시저/엑셀업로드 적용 | `[ ]` | `[ ]` | 대기 |
| **Step 4** | `WebContent/js/jquery.kdb.MonArch800.js` | `validatePassword` 비밀번호 검증 로직 단일 통합 (고객사 승인 대기) | `[ ]` | `[ ]` | 승인대기 |
