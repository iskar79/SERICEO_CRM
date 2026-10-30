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

## 1. 현재까지 완료된 작업 요약 (2026.10.30 12:08 기준)

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
   - **`MonArch800.js` 레거시 주석 전수 정리 완료**: 2020년 이전 과거 주석 및 사장된 주석 블록 225줄 완전 제거, JDK 11 컴파일 파싱 검증 완료 (`SYNTAX VALIDATION: SUCCESSFUL! NO SYNTAX ERRORS!`).

---

## 2. 다른 PC에서 이어서 착수할 작업 (Next Actions)

1. **`MON_COM_사용자정보POPUP_TBL` 구조체 비밀번호 검증 연동**:
   - **구조체 위치**: 오라클 DB `M_STRUCTURE` 테이블 (`STRUCTURE_NAME = 'MON_COM_사용자정보POPUP_TBL'`)
   - **연동 방식**:
     - *옵션 1 (DB)*: `M_STRUCTURE`의 구조체 JSON에 `"beforeSaveCallBack": "validatePassword"` 및 새 비밀번호 필드에 `"type": "passwordcheck"` 설정.
     - *옵션 2 (프론트엔드)*: `superContaner.js` 108라인 `opticon-config` 클릭 이벤트에서 `beforeSaveCallBack = "validatePassword"` 자동 주입.
2. **Step 2-1 ~ Step 2-5: Apache POI 4.1.2 업그레이드 및 엑셀 다운로드 보안 적용**:
   - **Step 2-1**: 구형 POI 3.8 백업 및 `POI 4.1.2 신규 라이브러리/` 7종 배치
   - **Step 2-2**: `CommonExcelUtil.java` CellType 문법 보정
   - **Step 2-3**: `superContaner.js` DownXls 4단 보안 모달 연동
   - **Step 2-4 & 2-5**: `UploadController.java` & `ExcelDownload.java` AES 암호화 워크북 생성 및 스트림 처리

---

## 3. 전체 작업 Tasklist 및 2단계 검증 대장 (`로컬 수정` ➡️ `VDI 붙여넣기 확인`)

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
| **Step 2-1** | `WebContent/WEB-INF/lib/` | 구형 POI 3.8 `_20261029` 백업 후 `POI 4.1.2 신규 라이브러리/` 7종 배치 | `[ ]` | `[ ]` | 차주 착수 |
| **Step 2-2** | `src/co/kr/kydbm/common/CommonExcelUtil.java` | POI 4.1.2 호환을 위한 `CellType` Enum 문법 수정 | `[ ]` | `[ ]` | 대기 |
| **Step 2-3** | `WebContent/js/jquery.kdb.superContaner.js` | `DownXls` 함수 블록 내 4단 보안 모달 팝업 및 감사로그 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-4** | `src/co/kr/kydbm/core/filecontrol/UploadController.java` | 엑셀 비밀번호(`excelPassword`) 파라미터 수신 연동 | `[ ]` | `[ ]` | 대기 |
| **Step 2-5** | `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java` | POI 4.1.2 Agile AES 암호화 워크북 생성 및 스트림 방출 엔진 | `[ ]` | `[ ]` | 대기 |
| **Step 3** | `MonArchDaoImpl.java`, `FilterGenerator.java`, 프로시저/배치 등 | KSign SecureDB 개인정보 암복호화 공통 모듈 및 프로시저/엑셀업로드 적용 | `[ ]` | `[ ]` | 대기 |
