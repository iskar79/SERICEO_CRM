# VDI 내부망 소스 동기화 및 코드 수정 규칙 (필수 준수 사항)

이 프로젝트는 VDI 내부망 Git 저장소에서 복사해 온 소스이며, 수정 후 다시 VDI 환경으로 덮어써야 합니다.
고객사 소스이므로 모든 소스 코드 수정 시 **반드시 아래 규칙을 엄격히 준수**해야 합니다.

---

## 1. 코드 수정/삭제/추가 시 필수 주석 규칙

1. **직접 삭제 금지 (기존 소스 보존)**
   - 기존 코드를 완전히 삭제하는 것은 절대 금지됩니다.
   - 코드를 제거하거나 변경해야 할 경우, **기존 코드는 주석 처리(`//` 또는 `/* ... */`, JSP/XML 주석 등)**하여 보존해야 합니다.

2. **주석 기본 순서 원칙: [날짜] [작성자(khma)] 최우선 배치**
   - 모든 주석은 예외 없이 **`날짜`가 가장 먼저, 그 다음 `khma`가 위치**해야 합니다.
   - 순서: `[날짜] [khma] : [사유 및 내용]` (또는 필요 시 Start / End)
   - 불필요한 영문 태그(`Why:`, `What:`, `[START-DEPRECATED]` 등)는 AI 티가 나므로 절대 사용하지 않습니다.

3. **AI 흔적 절대 금지 (사내 개발자 khma 스타일 100% 일치)**
   - 주석, 커밋, 문서, 코드 어디에도 'AI', 'ChatGPT', 'Gemini', 'LLM', 'Assistant', '자동생성' 등의 단어가 일절 포함되어서는 안 됩니다.
   - 프로젝트 소스 내 기존 `khma` 작성 스타일을 그대로 따릅니다.

---

## 2. 실제 프로젝트 주석 스타일 (날짜 > khma 최우선 표준)

모든 주석은 **`날짜` -> `khma`** 순서로 시작합니다.

### ① 코드 변경 시 (기존 코드 보존 + 신규 코드)
```java
// 20261001 khma : {수정 사유 및 변경 내용}
/*
기존코드();
*/
신규코드();
```

### ② 단일 라인 수정 / 추가 시
```java
// 20261001 khma {사유 및 내용}
String realPath = defaultFilePath + "/" + uploadFolder;
```
또는 라인 끝 주석:
```java
String realPath = defaultFilePath + "/" + uploadFolder; // 20261001 khma {사유 및 내용}
```

### ③ 기존 코드 제외 / 삭제 처리 시
```java
// 20261001 khma 제외 처리 : {사유}
/*
제외할_기존코드();
*/
```

### ④ 블록 단위 신규 추가 / 수정 시 (Start / End)
```java
// 20261001 khma Start : {기능/수정내용}
신규_메서드_또는_로직();
// 20261001 khma End : {기능/수정내용}
```

### XML / JSP / Properties 파일
각 파일 문법에 맞는 주석(`<!-- ... -->`, `# ...`)에서도 동일하게 **날짜 > khma** 순서를 적용합니다.
* XML/JSP: `<!-- 20261001 khma : 수정 내용 -->`
* Properties: `# 20261001 khma : 설정 변경`

---

## 3. VDI 반영 대상 파일 목록 보고 및 이력 관리 (필수)

사용자가 VDI 내부망으로 해당 소스를 그대로 복사-붙여넣기 할 수 있어야 하므로, **어떤 파일이 변경되었는지 100% 명확히 파악**되어야 합니다.

1. **답변 시 VDI 복사 대상 파일 목록 필수 제공**
   - 코드 작업 완료 후, 사용자 답변 마지막에 **"VDI 반영 대상 파일 목록(프로젝트 기준 상대 경로)"**을 체크리스트 형태로 빠짐없이 제공해야 합니다.
   - 예시:
     * `[ ] src/com/sericeo/crm/member/service/MemberService.java`
     * `[ ] WebContent/WEB-INF/jsp/member/memberList.jsp`

2. **CHANGELOG_KHMA.md 자동 갱신**
   - 소스 파일이 추가/수정/삭제될 때마다 [CHANGELOG_KHMA.md](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm_origin/CHANGELOG_KHMA.md)에 상대 경로와 작업 내역을 빠짐없이 누적 기록합니다.

---

## 4. VDI 화면 촬영 사진 코드 비교 및 반영 원칙 (필수)

VDI 내부망 코드를 카메라로 촬영하여 전달받는 경우, 단순 OCR 판독으로 인한 문법/식별자 왜곡을 원천 방지하기 위해 다음 원칙을 엄격히 준수합니다.

1. **단순 문자 판독 금지 및 로컬 소스/문맥 100% 교차 검증**
   * 모니터 촬영 특성상 언더스코어(`_`), 쉼표(`,`), 마침표(`.`), 작은따옴표(`'`), 큰따옴표(`"`), 세미콜론(`;`) 등이 공백으로 오인식되거나 뭉개지기 쉽습니다.
   * 사진의 글자만 그대로 긁어오지 않고, **로컬 프로젝트의 실제 소스코드 구조, 변수명 명명규칙, DB 컬럼명, Java 및 SQL 문법 정합성과 교차 검증하여 완벽히 복원**해야 합니다.
2. **모호한 기호 및 변경점의 사전 안내**
   * 사진상 빛 번짐 등으로 기호 판별이 모호한 경우 임의로 단정하지 않고, 로컬 소스와의 비교 결과 및 복원 근거를 사용자에게 명확히 설명 후 작업합니다.

---

## 5. 개발 작업 및 구동 프로세스 원칙 (안티그래비티 수정 -> 로컬 이클립스 에러 확인 -> VDI 이클립스 구동)

본 프로젝트의 실제 개발 및 운영 사이클은 다음과 같은 명확한 역할 분담을 따릅니다:

1. **로컬 안티그래비티: 소스 코드 분석 및 수정 전담**
   * 모든 소스 코드의 신규 작성, 분석, 수정, 리팩토링 및 Git 버전 관리는 로컬 안티그래비티에서 전담하여 수행합니다.
   * 프로젝트 폴더 내부에 불필요한 IDE 설정 파일(`.vscode`, `jsconfig.json` 등)을 추가하여 프로젝트를 오염시키지 않습니다.

2. **로컬 이클립스: 파일 확인 및 컴파일 에러 사전 점검용**
   * 로컬 PC에 설치된 이클립스는 VDI로 소스를 넘기기 전, 안티그래비티에서 수정/저장한 파일(`F5` 새로고침)의 **컴파일 에러 여부(`Problems` 탭) 및 파일 상태를 사전 확인하는 용도**로 활용합니다.

3. **VDI 내부망 이클립스 (Tomcat 9 / JDK 11): 실제 서버 구동 및 런타임 검증 전담**
   * 사내 DB 및 내부망과 연결된 실제 톰캣 서버 구동과 화면 동작 테스트는 **VDI 내부망 안의 이클립스**에서 수행합니다.
   * 로컬 안티그래비티 작업 및 로컬 이클립스 에러 확인이 끝나면, 프로젝트(또는 [CHANGELOG_KHMA.md](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm_origin/CHANGELOG_KHMA.md)에 기록된 변경 파일)를 VDI로 복사 반입하여 VDI 이클립스에서 구동합니다.

4. **완전한 Step-by-Step 개발 및 외부 ➡️ VDI 텍스트 복사·붙여넣기(`Ctrl+C` ➡️ `Ctrl+V`) 원칙 (필수)**
   * **최초 1회 압축 반입 및 베이스라인 구동 확인**:
     - 최초 반입용 `sericeo_crm_VDI반입용_20261029.zip` 내부에 이미 Step 1(`WEB-INF/lib/Spring 4.3.30 신규 라이브러리/`, `js/jquery-1.12.4.min.js`) 및 Step 2(`WEB-INF/lib/POI 4.1.2 신규 라이브러리/`)용 바이너리 파일이 모두 포함되어 있으므로 추가 파일 반입 결재가 불필요합니다.
     - VDI에서 압축 해제 후 코드 수정 전 **현재 운영 상태 그대로 먼저 톰캣 서버를 기동하여 이상 유무를 확인**합니다.
   * **한 번에 하나씩(One-by-One) Step-by-Step 진행**:
     - 여러 파일을 한꺼번에 수정하지 않고, **반드시 단일 파일(또는 단일 함수 블록) 단위로 수정 ➡️ 로컬 이클립스 에러 확인 ➡️ VDI 복사·붙여넣기 반영 ➡️ VDI 동작 확인** 순서로 한 단계씩 진행합니다.
   * **외부 PC ➡️ VDI 내부 클립보드 텍스트 복사·붙여넣기(`Ctrl+C` ➡️ `Ctrl+V`) 가이드 제공**:
     - 외부에서 VDI 내부로 텍스트 복사·붙여넣기가 가능하므로, 모든 소스 수정(`.java`, `.js`, `.jsp`, `.xml`, `.properties`) 시 다음 2가지 방식을 명확히 안내합니다:
       1. **파일 전체 덮어쓰기 (`Ctrl+A` ➡️ `Ctrl+V`)**: `CommonExcelUtil.java`, `UploadController.java`, `ExcelDownload.java`, `web.xml`, `monform.jsp` 등 중소형 단일 파일은 로컬 파일 전체를 복사(`Ctrl+A` ➡️ `Ctrl+C`)하여 VDI 이클립스 해당 파일에 전체 붙여넣기(`Ctrl+A` ➡️ `Ctrl+V`)하도록 안내하여 라인 밀림·오타를 원천 방지합니다.
       2. **특정 블록 핀포인트 붙여넣기 (이클립스 `Ctrl+L` 라인 이동 활용)**: `jquery.kdb.superContaner.js` 등 대용량 파일은 VDI 이클립스에서 `Ctrl+L`로 즉시 찾아갈 수 있도록 **[정확한 시작 라인 ~ 끝 라인]**, **[교체 전 기존 코드 블록]**, **[교체 후 `khma` 주석(`Start`/`End`) 포함 코드 블록]**을 1:1로 제시합니다.

5. **운영 서버 최신 소스 동기화 완료 및 운영 쿼리 정보 폴더 (`운영쿼리정보/`) 활용**
   * 운영 톰캣(Tomcat) 서버에서 구동 중이던 `sericrm_20261021`(`ROOT.war` 압축 해제 원본)을 기준으로 프로젝트 메인 소스(`src/`, `WebContent/`)를 **100% 동기화 완료**한 후, 이클립스 중복 검색 방지를 위해 중복 백업 폴더는 제거하였습니다.
   * 운영 백업본 내부에 있던 주요 테이블 스키마 및 스토어드 프로시저 원문 스크립트(12종)는 프로젝트 루트 하위 **`운영쿼리정보/`** 폴더(`a_user.txt`, `A_CONT.txt`, `USP_M_CONT_USE_STATUS.txt` 등)에 별도 보존되어 있으므로, DB 테이블 구조나 프로시저 로직 확인 시 참조합니다.

---

## 6. SERICEO CRM (MonArch 8.2.0) 시스템 아키텍처 상세 요약

*(전체 기술 명세서는 [ARCHITECTURE.md](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm_origin/ARCHITECTURE.md) 참조)*

1. **환경 및 런타임 스펙**
   - WAS / Runtime: Apache Tomcat 9 / JDK 11
   - Framework: Spring MVC 3.1.1 (DispatcherServlet `Monarch820`, URL: `*.mon`, `*.json`)
   - DB / DBCP: Oracle (기본) / Apache Commons DBCP / Jasypt 패스워드 암호화 / Multi-DB 지원
   - Batch / Scheduler: Quartz Scheduler 1.8.3 (`SendDirectMailJob`, `MonarchCommonJob`)

2. **요청/응답 라이프사이클 (Request Lifecycle)**
   - 브라우저(`jquery.kdb.MonArch800.js`) ➡️ 통신 관문 `jquery.kdb.soap.2.0.js` (`JSONClientParameters` 직렬화 및 `PostJsonData`)
   - ➡️ AJAX POST `/DATACRUD.json` (`{service, method, params, UID, USITE, MENUID}`)
   - ➡️ `LoginCheckInterceptor` 세션 유효성 검증 (`UserInfo` 확인)
   - ➡️ `SvcCRUD.java` 컨트롤러: DB/메모리에서 `ServiceInfo` 메타데이터 취득
   - ➡️ `FilterGenerator` & `QueryGenerator`: 동적 검색 WHERE 절 및 DB별 페이징/날짜 함수 생성
   - ➡️ `MonArchDaoImpl`: `@PARAM_NAME@` 정규식 바인딩 및 SQL 실행
   - ➡️ `ResultInfo` 빌드 ➡️ `MappingJacksonJsonViewEx` JSON 응답

3. **프론트엔드 4대 핵심 엔진 & SPA 구조**
   - `Resource.js`: 최상위 전역 환경 및 메타 정의서 (`_M` 객체, 24종 UI 데이터타입, 백엔드 서비스 URL 맵)
   - `jquery.kdb.MonArch800.js`: 공통 유틸리티, 쿠키, 포맷팅, 기본 UI 베이스 라이브러리
   - `jquery.kdb.superContaner.js`: CRM 화면 총괄 렌더링 엔진 (`SuperTable` 그리드, 동적 폼 생성, 9대 분할 레이아웃 제어)
   - `jquery.kdb.soap.2.0.js`: 프론트-백엔드 간 핵심 통신 브릿지 (`JSONClientParameters`, `PostJsonData`, ORA-20000 에러 및 세션 만료 E1000 감지)
   - `WebContent/ui/monform.jsp`: 단일 SPA 메인 컨테이너 (`$(window).hashchange` 히스토리 제어)
   - `MonArch.js`: 전역 네비게이션 관리 및 테마 변경 (`Theme_CEO.css`)

4. **백엔드 핵심 8대 컨트롤러**
   - `SvcCRUD.java`: 공통 메타데이터 동적 CRUD 처리 엔진 (`/DATACRUD.json`, `/extSvc`)
   - `LoginController.java` / `SsoLoginService.java`: 사용자 인증, 세션(`UserInfo`), SSO 연동
   - `MailServiceController.java`: 메일 개별 발송 및 상태 관리 (`/sendIndvEmail.json`)
   - `UploadController.java` / `UploadDataController.java`: 첨부파일 및 엑셀 데이터 대량 업로드
   - `ExcelDownload.java` / `ExcelDownload2.java`: POI 기반 엑셀 파일 다운로드

5. **서버 초기화 및 캐싱 (`Initializer.java`)**
   - WAS 기동 시 공통코드(`MetaCommCode`), 라벨(`MetaCommLabel`), 메시지(`MetaCommMsg`) 메모리 적재

---

## 7. 다중 PC 간 Git 공유 및 실시간 작업 진행 상태 (`HANDOVER_SYNC.md` 양방향 동기화 필수)

> **중요**: 본 프로젝트는 두 대 이상의 외부 PC에서 안티그래비티(Antigravity)를 통해 번갈아 작업합니다. `AGENTS.md`는 안티그래비티 실행 시 자동으로 시스템 규칙(`<user_rules>`)에 로드됩니다.
> 1. **작업 시작 시 (`PC A` ↔ `PC B` 전환 후 시작할 때)**: 가장 먼저 **`git pull github master`**를 실행하고 **`HANDOVER_SYNC.md`**와 `CHANGELOG_KHMA.md`를 읽어 다른 PC에서 진행된 최신 내역을 동기화합니다.
> 2. **단일 스텝 완료 또는 작업 종료 시**: 반드시 **`HANDOVER_SYNC.md`**, 본 **`AGENTS.md`(7번 섹션)**, **`CHANGELOG_KHMA.md`**를 최신 진행 상태로 갱신한 뒤 **`git push github master`**를 수행하여 상대방 PC에서도 즉시 이어받을 수 있도록 합니다.

### 1) Git 원격 저장소(Remote) 구성 및 동기화 명령어
* **외부 PC 간 공유용 GitHub (`github`)**: `https://github.com/iskar79/SERICEO_CRM.git` (브랜치: `master`)
  * 작업 시작 전 최신화: `git pull github master`
  * 스텝 완료 후 반영: `git add -A && git commit -m "..." && git push github master`
* **사내 내부망 GitLab (`origin`)**: `http://gitlab.multicampus.com/sericeo_crm/sericeo_crm` (외부망 PC에서는 접속 불가하므로 반드시 `github` 리모트를 사용할 것)

### 2) 현재까지 완료된 작업 상태 (Last Updated: 2026-10-29)
* **[완료] Step 0-1 (운영 최신 소스 100% 동기화 및 경량화)**:
  * 운영 백업본(`sericrm_20261021`) 기준 `src/`, `WebContent/` 100% 동기화 완료.
  * 운영 DB 테이블/프로시저 스크립트 12종은 `운영쿼리정보/` 폴더로 분리 보존하고, 불필요 설치파일/테스트 첨부파일(96MB) 및 중복 백업 파일 제거 완료.
* **[완료] Step 0-2 (Step 1 & Step 2 업그레이드용 라이브러리 사전 반입)**:
  * `WebContent/WEB-INF/lib/Spring 4.3.30 신규 라이브러리/`: Spring `4.3.30.RELEASE` 18종 + `commons-fileupload-1.5.jar` + `commons-io-2.15.1.jar` (총 20개 JAR) 배치 완료.
  * `WebContent/js/jquery-1.12.4.min.js`: jQuery 1.12.4 배치 완료.
  * `WebContent/WEB-INF/lib/POI 4.1.2 신규 라이브러리/`: POI 4.1.2 및 의존성 7종 배치 완료.
* **[완료] Step 0-3 (VDI 최초 반입 및 베이스라인 톰캣 구동 검증 완료)**:
  * `sericeo_crm_VDI반입용_20261029.zip`(68.90MB, Git 포함)을 VDI 이클립스에 반입 완료.
  * VDI 이클립스에서 **Java Compiler `1.7`** 설정으로 현재 운영 베이스라인 톰캣 9 서버가 에러 없이 정상 구동됨을 확인 완료 (2026-10-29).

### 3) 지금 바로 착수할 다음 스텝 (Next Action)
`1_TASK_SYSTEM_UPGRADE.md`에 따라 **Step 1 (시스템 버전 업그레이드)**을 아래 3개의 세부 스텝으로 나누어 **한 번에 하나씩(Step-by-Step)** 진행합니다:
* 👉 **[진행 대기 - 최우선 착수 대상] Step 1-1**:
  * `WebContent/WEB-INF/lib/` 내 구형 Spring `3.1.1` JAR 및 구형 `commons-fileupload-1.3.1.jar`, `commons-io-2.2.jar` 파일명 뒤에 `_20261029`를 붙여 백업 보존(삭제 금지)하고, `WebContent/WEB-INF/lib/Spring 4.3.30 신규 라이브러리/` 안의 신규 JAR 20종을 `WebContent/WEB-INF/lib/` 직하위로 배치.
* **[대기] Step 1-2**:
  * `WebContent/WEB-INF/Monarch820-servlet.xml` 상단 Spring XML 스키마(`xsd`) `3.0` ➡️ `4.3` 상향 (`khma` 주석 적용 및 VDI 클립보드 복사·붙여넣기 가이드 제시).
* **[대기] Step 1-3**:
  * `WebContent/ui/monform.jsp` 내 jQuery `1.10.2` ➡️ `1.12.4` 스크립트 경로 변경 (`khma` 주석 적용 및 VDI 클립보드 복사·붙여넣기 가이드 제시) 후 VDI 톰캣 재기동 테스트.
