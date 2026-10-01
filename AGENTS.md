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
   - 소스 파일이 추가/수정/삭제될 때마다 [CHANGELOG_KHMA.md](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm/CHANGELOG_KHMA.md)에 상대 경로와 작업 내역을 빠짐없이 누적 기록합니다.

---

## 4. VDI 화면 촬영 사진 코드 비교 및 반영 원칙 (필수)

VDI 내부망 코드를 카메라로 촬영하여 전달받는 경우, 단순 OCR 판독으로 인한 문법/식별자 왜곡을 원천 방지하기 위해 다음 원칙을 엄격히 준수합니다.

1. **단순 문자 판독 금지 및 로컬 소스/문맥 100% 교차 검증**
   * 모니터 촬영 특성상 언더스코어(`_`), 쉼표(`,`), 마침표(`.`), 작은따옴표(`'`), 큰따옴표(`"`), 세미콜론(`;`) 등이 공백으로 오인식되거나 뭉개지기 쉽습니다.
   * 사진의 글자만 그대로 긁어오지 않고, **로컬 프로젝트의 실제 소스코드 구조, 변수명 명명규칙, DB 컬럼명, Java 및 SQL 문법 정합성과 교차 검증하여 완벽히 복원**해야 합니다.
2. **모호한 기호 및 변경점의 사전 안내**
   * 사진상 빛 번짐 등으로 기호 판별이 모호한 경우 임의로 단정하지 않고, 로컬 소스와의 비교 결과 및 복원 근거를 사용자에게 명확히 설명 후 작업합니다.

---

## 5. 개발 작업 및 구동 프로세스 원칙 (안티그래비티 수정 -> 이클립스/VDI 구동)

본 프로젝트의 실제 개발 및 운영 사이클은 다음과 같은 명확한 역할 분담을 따릅니다:

1. **소스 코드 분석 및 수정 전담 (안티그래비티)**
   * 모든 소스 코드의 신규 작성, 분석, 수정, 리팩토링, 디버깅은 안티그래비티 환경에서 전담하여 수행합니다.
   * 프로젝트 폴더 내부에 불필요한 IDE 설정 파일(`.vscode`, `jsconfig.json` 등)을 추가하여 프로젝트를 오염시키지 않습니다.

2. **서버 구동 및 런타임 검증 전담 (이클립스 Tomcat 9 / JDK 11)**
   * 톰캣 서버 구동, 빌드 및 화면 동작 테스트는 이클립스에서 전담합니다.
   * 로컬 이클립스에서는 안티그래비티에서 파일 저장 후 이클립스 프로젝트 새로고침(`F5`)으로 즉시 반영하여 구동합니다.
   * VDI 내부망 반영 시에는 [CHANGELOG_KHMA.md](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm/CHANGELOG_KHMA.md)에 기록된 파일만 정확히 선별하여 복사-붙여넣기합니다.

---

## 6. SERICEO CRM (MonArch 8.2.0) 시스템 아키텍처 상세 요약

*(전체 기술 명세서는 [ARCHITECTURE.md](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm/ARCHITECTURE.md) 참조)*

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
