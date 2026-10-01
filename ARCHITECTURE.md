# SERICEO CRM (MonArch 8.2.0) 시스템 아키텍처 상세 정의서

본 문서는 SERICEO CRM 시스템의 백엔드, 프론트엔드, 메타데이터 동적 SQL 엔진, 데이터 통신 및 배치/보안 구조를 상세히 정의한 기술 아키텍처 명세서입니다.

---

## 1. 시스템 개요 및 런타임 스펙

* **시스템 명칭**: SERICEO CRM
* **엔진 프레임워크**: MonArch 8.2.0 (Custom Enterprise CRM Framework)
* **WAS / Runtime**: Apache Tomcat 9 / JDK 11
* **핵심 라이브러리 (AS-IS 및 TO-BE 고도화 목표)**:
  * Spring Framework `3.1.1.RELEASE` ➡️ **(Task 3: `4.3.30.RELEASE` 업그레이드 예정)**
  * Apache Commons DBCP 1.3 / Commons Pool 1.6
  * Jackson JSON 1.9.7 (`MappingJacksonJsonViewEx`)
  * Apache POI `3.8` ➡️ **(Task 2, 3: 엑셀 다운로드 암호화 및 보안 강화를 위해 `4.1.2` 세트로 교체 권장)**
  * Quartz Scheduler 1.8.3 (배치 및 다이렉트 메일 발송)
  * Jasypt 1.9.1 (데이터베이스 접속 암호화)
  * Log4j 1.2.16 (코드 수정 리스크가 커서 **업그레이드 금지**)
  * 보안/암호화 (신규): **(Task 1: SecureDB Java API V2 모듈이 `MonArchDaoImpl`에 통합 적용될 예정)**
* **프론트엔드 (AS-IS 및 TO-BE)**:
  * jQuery `1.10.2` ➡️ **(Task 3: 화면 렌더링 호환성 유지를 위해 `1.12.4`로 업그레이드 예정)**
* **데이터베이스**: Oracle (메인 운영 DB) / Multi-DB 지원 구조 (MariaDB, PostgreSQL, MSSQL 분기 지원)

---

## 2. 전체 요청 / 응답 라이프사이클 (Request Lifecycle)

```
[클라이언트 브라우저 (jQuery 1.10.2)]
       │
       │ 1. AJAX 통신 (URL: /DATACRUD.json, HTTP POST)
       │    페이로드: { service: "...", method: "LIST", params: { ... }, UID: "...", USITE: "..." }
       ▼
[DispatcherServlet ("Monarch820", web.xml)]
       │
       │ 2. 인터셉터 검증
       ▼
[LoginCheckInterceptor]
       │  - 세션 내 UserInfo 존재 여부 체크
       │  - 세션 만료 시 AuthException ("로그아웃 되었습니다.") 반환
       ▼
[SvcCRUD Controller (@RequestMapping("/DATACRUD"))]
       │
       │ 3. 메타데이터 조회 (M_SERVICE, M_STRUCTURE)
       ├─► [DB] M_SERVICE 테이블에서 SQL 쿼리 및 실행 메타데이터(ServiceInfo) 취득
       ├─► [DB] M_STRUCTURE 테이블에서 화면 구조체(UI JSON) 메타데이터 취득 (프론트 렌더링용)
       │
       │ 4. 동적 SQL 및 필터 조립
       ├─► FilterGenerator : 그리드 검색 조건 및 멀티 필터 WHERE 절 생성
       ├─► QueryGenerator : DB 종류별 문법(Oracle ROWNUM 페이징, SYSDATE 등) 조립
       │
       │ 5. 파라미터 매핑 및 SQL 실행
       ▼
[MonArchDaoImpl (extends DataSourceSupport)]
       │  - 정규식(@+[ a-zA-Z0-9가-힣-_ ]*@)을 통해 @PARAM@ 토큰 추출
       │  - NamedParameterJdbcTemplate 또는 PreparedStatement 파라미터 바인딩
       │  - Oracle LOB 처리 (OracleLobHandler)
       ▼
[Oracle Database]
       │
       │ 6. 결과 셋 반환
       ▼
[ResultInfo Bean 조립]
       │
       ▼
[MappingJacksonJsonViewEx] ──► 클라이언트로 JSON 응답 반환
```

---

## 3. 프론트엔드 아키텍처 (`WebContent/`)

### ① SPA 기반 메인 컨테이너 (`WebContent/ui/monform.jsp`)
* 단일 JSP 화면 안에서 전체 CRM 뷰가 전환되는 **SPA(Single Page Application) 컨테이너 구조**.
* **해시 네비게이션**: `$(window).hashchange(...)` 이벤트를 감지하여 브라우저 히스토리(뒤로가기/앞으로가기) 및 서브 뷰 전환(`historyBackProc()`).
* **테마 시스템**: `Theme_CEO.css`, `Common.css` 등을 동적으로 스위칭하는 테마 엔진 내장.
* **컴포넌트 블로킹**: `$.blockUI`, `qtip` 등을 활용한 로딩 처리 및 팝업 툴팁 관리.

### ② 프론트엔드 4대 핵심 엔진 파일 구조 및 역할

```
[1. Resource.js] (최상위 전역 환경 & 메타 정의)
       │ - _M 전역 객체 선언 (UI 데이터타입, 세션 스키마, 백엔드 서비스 URL 맵)
       ▼
[2. jquery.kdb.MonArch800.js] (공통 기반 유틸리티 & 베이스 UI)
       │ - 쿠키($.cookie), 숫자/날짜 포맷팅, 기본 유틸리티, 팝업/다이얼로그 기본 베이스
       ▼
[3. jquery.kdb.superContaner.js] (화면 렌더링 & 컴포넌트 총괄 엔진 - 16,515줄)
       │ - SuperTable (고급 동적 데이터 그리드: 정렬, 페이징, 멀티 체크박스, 컬럼 리사이징)
       │ - 동적 폼 생성기 (JSON 스키마 기반 CREATE/READ/UPDATE 입력폼 자동 렌더링)
       │ - 9대 분할 레이아웃 총괄 (Flowtop, LeftMainList, MainList, MainView 등 윈도우 관리)
       │ - 액션 디스패처 (.ActionCmd, jobClick 이벤트 수집)
       ▼
[4. jquery.kdb.soap.2.0.js] (백엔드 전담 통신 관문 - Communication Bridge)
       │ - JSONClientParameters (세션 정보 + 폼 데이터 단일 JSON 직렬화)
       │ - PostJsonData() (백엔드 /DATACRUD.json 으로 AJAX POST 전송)
       │ - 공통 에러 파싱 (오라클 ORA-20000 커스텀 예외 메시지 추출, E1000 세션 만료 자동 로그아웃)
       ▼
[백엔드 관문 : SvcCRUD.java]
```

#### 상세 모듈별 기능 명세:
1. **`Resource.js` (전역 메타 정의서)**:
   - 시스템 전역 객체인 `_M` 선언.
   - 24종 UI 데이터타입 규격화 (`_M.DataType`: text, date, money, multicombo, popup, zip 등).
   - Java 백엔드 서비스 URL 매핑 (`_M.svcUrl.Java`: `crudUrl: "DATACRUD.json"`, `fileUpload: "fileupload.mon"`, `exceldown: "exceldown.mon"` 등).
2. **`jquery.kdb.MonArch800.js` (기반 공통 라이브러리)**:
   - `$.cookie` 쿠키 관리, `$.number_format` 금액/수치 콤마 처리, 날짜 유효성 검사, 공통 문자열 변환.
3. **`jquery.kdb.superContaner.js` (화면/컴포넌트 총괄 엔진)**:
   - **`SuperTable` 그리드**: 대용량 레코드 렌더링, 컬럼 헤더 클릭 정렬(`thClick`), 행 클릭(`trClick`) 및 더블클릭(`trDblClick`) 상세 연동, 전체선택(`trChkAll`).
   - **동적 폼 렌더링**: 메타데이터 기반 입력필드, 콤보박스, 팝업 셀렉터, 캘린더 위젯 조립.
   - **9개 작업 영역 제어**: `Flowtop`, `LeftTopList`, `LeftMainList`, `LeftMainView`, `LeftBottomView`, `TopList`, `MainList`, `MainView`, `BottomView`.
4. **`jquery.kdb.soap.2.0.js` (통신 관문)**:
   - 과거 SOAP 명칭 유지, 실질적으로는 순수 JSON AJAX 통신 전담.
   - `JSONClientParameters`로 `UID`, `USITE`, `GSITE`, `MENUID`, `STEPMENU`, `ACTIONNAME`을 패키징하여 `/DATACRUD.json`으로 POST 전송.
   - `ORA-20000` 오라클 예외 및 `E1000` 세션 끊김 자동 처리.

---

## 4. 백엔드 메타데이터 동적 CRUD 엔진 (`SvcCRUD`)

일반적인 웹 프로젝트처럼 화면마다 Controller-Service-DAO를 일일이 개발하는 방식이 아니라, **DB 메타데이터(`M_SERVICE`, `M_STRUCTURE`)에 SQL 및 화면 구조를 등록해두고 단일 컨트롤러가 동적으로 실행하는 아키텍처**입니다.

### ① 지원 메서드 타입 (`method`)
1. **`LIST`**: 목록 조회 (페이징, 정렬, 조건 검색 필터 자동 적용)
2. **`READ`**: 단건 상세 조회 (PK 기반 단일 레코드 조회)
3. **`CREATE`**: 신규 데이터 삽입
4. **`CREATEIDENTITY`**: 시퀀스/자동증가 키를 반환받으며 데이터 삽입
5. **`UPDATE`**: 데이터 수정 (변경된 컬럼만 동적 업데이트)
6. **`DELETE`**: 데이터 삭제
7. **`QUERY`**: 복합 커스텀 SQL 실행
8. **`EXCEL`**: 대용량 데이터 엑셀 추출용 쿼리 실행
9. **`P_READ`**: 오라클 프로시저 호출

### ② 파라미터 바인딩 원리
* SQL 템플릿 예시:
  ```sql
  SELECT USER_ID, USER_NAME, EMAIL
    FROM TB_MEMBER
   WHERE COMP_CODE = @USITE@
     AND USER_ID = @USER_ID@
  ```
* `MonArchDaoImpl`에서 `@PARAM@` 정규식 파싱을 통해 세션 변수(`@USITE@`, `@UID@`) 및 클라이언트 전달 파라미터를 자동 바인딩합니다.

---

## 5. 백엔드 컨트롤러 8대 구성 목록

| 컨트롤러 | 물리 파일 경로 | 요청 엔드포인트 | 상세 역할 |
| :--- | :--- | :--- | :--- |
| **SvcCRUD** | `src/.../core/service/SvcCRUD.java` | `/DATACRUD.json`, `/extSvc` | 공통 메타데이터 기반 동적 CRUD 실행 엔진 |
| **LoginController** | `src/.../core/service/LoginController.java` | `/login.mon`, `/logout.mon` | 사용자 인증, 세션(`UserInfo`) 생성 및 비밀번호 검증 |
| **SsoLoginService** | `src/.../sso/SsoLoginService.java` | `/ssoLogin.mon` | 그룹웨어/외부 연동 SSO 토큰 검증 로그인 |
| **MailServiceController** | `src/.../mail/MailServiceController.java` | `/sendIndvEmail.json` | 개별 다이렉트 이메일 발송 및 발송 상태(`MAIL_MGMT`) 갱신 |
| **UploadController** | `src/.../core/filecontrol/UploadController.java` | `/upload.mon`, `/fileupload.mon`, `/filedownload.mon` | 공통 첨부파일 업로드/다운로드 처리 |
| **UploadDataController** | `src/.../core/filecontrol/UploadDataController.java` | `/doUploadDataFile.mon` | 엑셀/CSV 데이터 대량 일괄 적재(`DataUploadDaoImpl`) |
| **ExcelDownload** | `src/.../core/filecontrol/ExcelDownload.java` | `/exceldown.mon`, `/exceldownOld.mon` | POI 기반 그리드 데이터 엑셀 파일 변환 다운로드 |
| **ExcelDownload2** | `src/.../core/filecontrol/ExcelDownload2.java` | `/exceldown2.mon` | POI 대용량 최적화 엑셀 다운로드 (2차 버전) |

---

## 6. 서버 기동 및 캐싱 (`Initializer.java`)

WAS(Tomcat) 구동 시 `Monarch820-servlet.xml`의 `init-method="init"`에 의해 [`Initializer`](file:///c:/Users/khma7/eclipse-workspace/sericeo_crm/src/co/kr/kydbm/core/meta/Initializer.java)가 실행되어 다음 항목을 메모리에 사전 캐싱합니다:

1. **`MetaCommCode.init()`**: 시스템 공통 코드 전체 메모리 로드
2. **`MetaCommLabel.init()`**: 화면 다국어 및 라벨 텍스트 메모리 로드
3. **`MetaCommMsg.init()`**: 시스템 메시지 및 알림 텍스트 메모리 로드

---

## 7. 스케줄러 및 배치 엔진 (`co.kr.kydbm.scheduler`)

* **엔진**: Quartz Scheduler (`org.springframework.scheduling.quartz.SchedulerFactoryBean`)
* **메일 발송 배치 (`SendDirectMailJob`)**:
  * `0/30 * * * * ?` (30초 주기 실행)
  * `MAIL_MGMT` 테이블에서 발송 대기 상태인 메일을 조회하여 JavaMail을 통해 100건(`email.indv.unit`) 단위 분할 전송 후 상태 코드 갱신.
* **공통 배치 (`MonarchCommonJob`)**:
  * 부서 동기화 등 주기적인 ERP/외부 시스템 연동 배치 수행.
