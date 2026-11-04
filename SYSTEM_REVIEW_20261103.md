# SERICEO CRM 시스템 정적 점검 보고서

- 점검일: 2026-11-03
- 범위: 저장소 문서, Java 소스, Spring 설정, 운영 쿼리·프로시저 원문, 프로젝트 내 설정 파일
- 방식: 정적 코드 및 설정 검토
- 상태: 분석 산출물

## 요약

현재 자료만으로 시스템 전체가 문제없다고 판정할 수는 없습니다. 저장소 정적 검토에서 확인이 필요한 설정·구조적 위험과 SecureDB 적용 문서의 설계 정리가 필요한 부분이 있습니다. DB·메일 자격 증명은 사용자 설명에 따라 로컬 개발용 설정으로 취급하며, 이 보고서에서는 운영 비밀값 노출 결함으로 단정하지 않습니다. 운영 DB와 VDI 런타임에 접속해 동작을 검증하지 않았으므로 이 보고서는 정적 검토 결과입니다.

## 주요 확인 사항

| 우선순위 | 항목 | 근거와 영향 | 권장 확인 |
|---|---|---|---|
| 운영 배포 전 필수 | 운영 DB 정보로 `ENC(...)` 적용 | 사용자 설명에 따라 저장소의 평문 DB 정보는 로컬 개발용이며, 운영 DB 접속 정보는 다릅니다. 운영 반영 전에 운영 접속 정보를 `ENC(...)`로 설정하는 절차가 필요합니다. | 운영용 JDBC 설정에 실제 운영 URL·계정 정보를 반영하고 `ENC(...)` 변환 후, WAR에 평문 운영 비밀번호가 남지 않았는지 확인하십시오. 로컬 개발 설정과 운영 설정을 혼동하지 않도록 산출물 생성 절차를 점검하십시오. |
| 높음 | SQL 실행 파라미터 로깅이 DEBUG로 켜져 있음 | `WebContent/WEB-INF/log4j.properties`에서 Spring `JdbcTemplate` 및 `NamedParameterJdbcTemplate` 로거가 DEBUG로 설정되어 있습니다. 바인딩 값 로깅 여부와 운영 로그 접근권한에 따라 개인정보·인증정보가 로그에 남을 수 있습니다. | 운영 배포 설정의 실제 로그 레벨과 바인드 값 출력 여부를 확인하고, 개인정보가 포함된 쿼리에 대해 로그 샘플·보존·접근 권한을 점검하십시오. |
| 높음 | SecureDB 적용 가이드가 검토 순서를 명확히 반영하지 않음 | 현재 검토 방향은 DB 쿼리에서 SecureDB ENC/DEC 함수를 우선 적용하고, 쿼리 수정만으로 해결하기 어렵거나 문제가 확인될 때 Java API 도입을 대안으로 검토하는 것입니다. 하지만 `3_TASK_SECUREDB_API.md`는 Java API + NTS를 표준 권장안으로 설명하고 런타임 SQL 치환·프로시저 수정도 혼합해 안내합니다. | Step 3 가이드에 쿼리 우선 검토와 API 대안 전환 기준을 반영하십시오. 실제 함수명·스키마·정책명·권한·입력/출력 형식은 DBA/보안팀 제공 사양에 맞춰 검증하십시오. |
| 확인 필요 | Jasypt 복호화 키 설정 출처 확인 | `Monarch820-servlet.xml`에는 `APP_ENCRYPTION_PASSWORD` 환경변수 기반 설정과 별도 직접 지정된 Jasypt 키 설정이 함께 존재합니다. 운영용 `ENC(...)` 값을 복호화할 때 실제로 어떤 설정값이 사용되는지 배포 환경 기준으로 확인해야 합니다. | 운영 Tomcat의 환경변수와 Spring/Jasypt 설정 조합이 운영 JDBC 값의 `ENC(...)` 암호화에 사용한 키와 일치하는지 확인하고, WAR 기동 시 복호화되는지 검증하십시오. |
| 중간 | SecureDB 가이드 예시의 오류 시 평문 통과 설계는 데이터 보호를 우회할 수 있음 | `3_TASK_SECUREDB_API.md` 예제 `CryptoService`는 API 초기화·암호화·NTS 생성 실패 시 원문 값을 반환합니다. 장애가 암호화 없이 저장 또는 검색으로 이어질 수 있습니다. | 운영 정책상 보호 대상 데이터는 실패 시 저장·검색을 거부하는 방식으로 설계하고, 장애 알림·복구·기존 평문 데이터 처리 정책을 정하십시오. |
| 중간 | NTS 검색 컬럼과 부분 검색 의미가 스키마·쿼리에서 확인되지 않음 | 가이드는 `NAME_NTS` 같은 토큰 컬럼과 BSH/FSH 변환을 제안하지만, 저장소 내 운영 스키마 파일에서 해당 컬럼 정의나 인덱스 구성을 확인하지 못했습니다. 예제 설명 중 접두/접미 검색 명칭도 혼동 소지가 있습니다. | 실제 DB DDL, 인덱스, UDF 사양 및 검색 시나리오(완전·접두·포함·접미)를 DBA와 대조하십시오. 저장소만으로 컬럼 미존재를 단정할 수는 없습니다. |
| 높음 | Oracle 일배치도 개인정보 흐름에 포함됨 | 사용자가 Oracle에서 일배치가 실행 중이라고 확인했습니다. 저장소의 `운영쿼리정보/USP_M_CONT_DAILY_BATCH.txt`는 `USP_M_CONT_USE_STATUS`를 호출하고, 해당 프로시저는 `A_USER` 등에서 데이터를 읽어 집계 테이블을 처리합니다. Spring Quartz 비활성화와 무관한 DB 측 배치 실행 경로입니다. | 실제 실행 중인 Oracle 프로시저·스케줄과 개인정보 대상 컬럼을 확인하고, 쿼리 우선 ENC/DEC 적용 검토 범위에 포함하십시오. 집계 대상·출력 테이블 영향도 DBA와 확인하십시오. |
| 참고 | 내부 프로그램의 HTTP 운영 조건 | 사용자 설명에 따라 이 프로그램은 내부망에서 HTTP로 운영됩니다. `WebContent/WEB-INF/web.xml`의 세션 쿠키 `secure=false`는 현재 전송 조건과 일치하므로, 이를 단독으로 설정 오류로 판정하지 않습니다. HTTP 전송 구간의 기밀성은 HTTPS가 제공하지 않으므로 내부망 경계·접근 통제가 운영 전제입니다. | 내부망 경계와 접근 통제가 실제 배포 환경에서도 적용되는지 운영 정책 범위에서 확인하십시오. |
| 참고 | 사용자 미커밋 변경이 있는 상태 | 점검 시 `src/co/kr/kydbm/core/filecontrol/UploadController.java`에 로컬 수정이 있었습니다. 보고서 작성 중 이 소스 파일은 수정하지 않았습니다. | 현재 로컬 변경을 보존하십시오. 변경 내용은 별도 검토·커밋하기 전까지 분석 대상 기준본과 구분하십시오. |

## 확인한 흐름과 범위

1. `SvcCRUD`는 메타데이터에서 읽은 SQL을 `MonArchDaoImpl`의 `exeRead`, `exeUpdate`, `exeList` 계열로 전달합니다. 개인정보 처리를 특정 DAO 경로에만 추가하면 다른 DAO 직접 호출이나 프로시저 경로가 누락될 수 있습니다.
2. `FilterGenerator`는 동적 필터 SQL을 구성합니다. 검색 토큰 방식은 필드명, 입력 파라미터, 토큰 컬럼 및 인덱스가 서로 같은 규칙을 사용해야 하며, 일반 `LIKE` 검색과 정렬·내보내기 동작 영향도 점검해야 합니다.
3. 저장소의 `운영쿼리정보/`에는 회원·법인·콘텐츠 스키마 설명 및 프로시저 원문이 존재합니다. 사용자는 Oracle에서 일배치가 실행 중이라고 확인했습니다. Spring Quartz 스케줄러가 비활성화되어 있어도 Oracle 측 일배치는 별도 실행 경로이며, `USP_M_CONT_DAILY_BATCH`와 `USP_M_CONT_USE_STATUS`의 실제 운영 정의·스케줄을 SecureDB 데이터 흐름 점검에 포함해야 합니다.
4. 프로젝트에는 Jasypt 설정과 별도로 로그인 비밀번호 해시 처리 코드가 있습니다. SecureDB 적용 범위는 개인정보 컬럼과 비밀번호 정책을 구분해 정의해야 합니다.

## Step 3 설계 검토 방향

현재 검토 방향은 **DB 쿼리에서 SecureDB 함수를 호출해 ENC/DEC 처리하는 방식을 먼저 검토하고, 쿼리 수정만으로 해결하기 어렵거나 문제가 확인되면 Java API 도입을 대안으로 검토**하는 것입니다. 따라서 현재 `3_TASK_SECUREDB_API.md`의 Java API + NTS 기본안은 이 우선순위와 전환 조건을 반영하지 않습니다. 이 보고서에는 사용자 설명을 반영했으며, 계획 문서 자체는 수정하지 않았습니다.

`3_TASK_SECUREDB_API.md`를 쿼리 함수 우선 검토 흐름으로 정리할 필요가 있습니다. 먼저 암호화 대상 컬럼과 DML/SELECT별 적용 함수, 실제 스키마 접두어·정책명·권한, 기존 평문과 암호문 공존 처리, 검색·정렬 제약, 프로시저·배치·엑셀 업로드, 실패 처리, 데이터 마이그레이션 및 롤백을 점검합니다. 쿼리 방식의 구체적 한계가 확인된 경우에만 해당 한계와 Java API 대안의 영향·전환 조건을 함께 평가합니다. 함수명과 인자 순서는 DBA/보안팀의 실제 사양으로 확인해야 하며, 현재 가이드의 예시를 운영 사양으로 간주하면 안 됩니다.

## 다음 점검 순서

1. 운영 WAR 생성 전 운영 DB URL·계정 정보를 반영하고 비밀번호를 `ENC(...)`로 변환한 뒤, 평문 운영 비밀번호가 WAR에 포함되지 않았는지 확인합니다.
2. 운영 Tomcat의 Jasypt 복호화 키 설정이 해당 `ENC(...)` 변환에 사용한 키와 일치하는지 확인하고 배포 기동을 검증합니다.
3. 운영·VDI의 로그 레벨, DB 계정 권한, SecureDB 에이전트·정책·UDF 상태를 운영 담당자와 확인합니다.
4. Step 3의 쿼리 우선 적용 및 API 대안 검토 흐름에 따라 실제 DDL·프로시저·서비스 SQL의 개인정보 흐름 매핑표를 만듭니다.
5. 기존/신규 데이터 혼재, 장애 시 처리, 검색 정확도, 엑셀 다운로드·업로드, Oracle 일배치 출력 검증 및 롤백을 포함한 검증 시나리오를 작성합니다.
6. 로컬 빌드·정적 검토 후 VDI에서 단일 경로씩 구동 확인합니다. 이 저장소 점검만으로 VDI 반영이나 운영 안정성을 확인한 것은 아닙니다.

## 한계

- Oracle 운영 DB 접속, Oracle 일배치 스케줄·실행 정의 조회, KSign SecureDB 에이전트/API/UDF 실행, VDI 톰캣 구동은 수행하지 않았습니다. Oracle 일배치 실행 중이라는 상태는 사용자 확인을 반영했습니다.
- 전체 `M_SERVICE` 메타데이터와 외부 연계 시스템·배치 스케줄의 최신 원본을 확보하지 못해 모든 쿼리와 데이터 흐름을 완전 열거하지 않았습니다.
- 이 보고서는 코드 수정이나 배포 지시가 아니라 저장소 기반 정적 점검 기록입니다.

## 2026년 11월 수정 파일 추가 정적 검토

Git 이력에서 2026-11-02~03 변경분을 확인했습니다. 소스는 실행하지 않았고 diff와 호출 흐름만 검토했습니다.

| 우선순위 | 대상 | 확인 내용 | 판단 |
|---|---|---|---|
| 긴급 | `WebContent/js/jquery.kdb.superContaner.js` Step 2-8 감사 `REQ_DOC` 구성 (현재 7547~7548, 7673~7689행) | 다운로드 암호를 `pl`에 담은 뒤 `pl.toJson()` 전체를 `REQ_DOC`에 복사해 감사 로그 요청에 넣습니다. 이 직렬화 결과에 `excelPassword`가 포함됩니다. | 엑셀 열람 암호가 감사 DB에 평문 또는 URL 인코딩된 값으로 저장될 수 있습니다. 요청 전문을 기록하기 전에 비밀번호 필드를 제거·마스킹해야 합니다. 이번 Task 변경분에서 가장 먼저 보완할 항목입니다. |
| 높음 | `src/co/kr/kydbm/core/filecontrol/UploadController.java` Step 2-8/2-9 다운로드 흐름 (현재 967~982행) | 다운로드 로그 INSERT의 성공·실패 콜백 모두 `fnDoDownload()`를 실행합니다. 감사 로그 저장에 실패해도 엑셀 다운로드가 진행됩니다. | 사유·대상 기록이 필수 통제라면 로그 장애 시 다운로드를 허용하는 fail-open 동작입니다. 실패 시 차단할지, 운영상 예외 허용과 별도 감사 경보를 둘지 보안 요구사항을 명시해야 합니다. |
| 높음 | `src/co/kr/kydbm/core/filecontrol/UploadController.java` Step 2-8 DOWNCOLS 처리 (현재 938~950행) | 맞게도 `DOWNCOLS`는 원본 SQL의 WHERE/FROM을 직접 바꾸지 않고, 원본 SELECT를 감싼 바깥 쿼리의 `SELECT ... FROM (원본 SQL) A` 컬럼 목록에 삽입됩니다. 다만 요청값을 서버 허용목록 없이 사용하므로 클라이언트가 `*` 또는 다른 SELECT 표현식으로 의도한 컬럼 제한을 바꿀 수 있습니다. | 임의의 다중 SQL 문장을 실행하는 형태로 단정하지 않습니다. 실제 위험은 엑셀 추출 컬럼 제한 우회와 바깥 SELECT 표현식 삽입 가능성입니다. 보안 추출 기능이라면 서버에서 공통코드 허용 컬럼 및 원본 조회 결과 컬럼과 대조하고 `*`, 괄호·연산자·서브쿼리 등 허용하지 않을 표현을 거부해야 합니다. |
| 높음 | `운영쿼리정보/M_COMM_CODE_XLS_SEC_COLS.sql` (9행) | `DELETE FROM M_COMM_CODE WHERE CODE_GRP = 'XLS_SEC_COLS'`는 `M_USITE_NO` 등 사이트 조건 없이 해당 그룹의 모든 행을 삭제합니다. 아래 INSERT는 `M_USITE_NO='44'`만 등록합니다. | 다중 사이트 공통코드라면 다른 사이트 값까지 지울 수 있습니다. 실제 운영 실행 전 대상 사이트 범위를 확인하고, 필요한 경우 삭제 조건을 제한하거나 MERGE/정확한 키 기반 정비로 바꿔야 합니다. |
| 중간 | `src/co/kr/kydbm/core/filecontrol/UploadController.java` Step 2-9 DOWN_CNT 갱신 (현재 969~980행) | 로그 행을 고유 키가 아닌 `FILE_NAME`으로 찾아 갱신합니다. 파일명은 메소드명과 초 단위 타임스탬프로 생성되므로, 같은 초에 같은 메소드로 요청이 겹치거나 파일명이 재사용되면 여러 로그 행의 `DOWN_CNT`가 함께 바뀔 수 있습니다. | JS의 이력 INSERT가 완료된 후 다운로드를 시작하는 순서는 확인됩니다. 다만 파일명 조건은 행 단위 식별을 보장하지 않습니다. 생성 시 받은 `LOG_NO` 또는 별도 요청 식별자를 후속 갱신까지 전달하는 방식이 더 안전합니다. |
| 높음 | `src/co/kr/kydbm/core/filecontrol/UploadController.java` Step 5-1 다운로드·삭제 경로 (현재 1344~1502행) | `downloadFileNew`와 `deleteFileSafe`는 요청의 상대 `filePath`를 직접 받으며 기본 업로드 경로와 결합한 뒤 canonical root 포함 여부를 검사하지 않습니다. `fid` 조회도 사이트·업무 권한을 조건으로 제한하지 않고, 삭제 API는 `fid`가 아닌 `filePath`로도 물리 파일을 이동할 수 있습니다. | 로그인 세션만으로 다른 파일을 열람·이동하거나 경로 조작으로 업로드 루트 밖 파일에 접근할 위험이 있습니다. `fid` 기준으로 DB 경로를 조회하고 사용자·사이트·업무 권한 및 canonical path root를 서버에서 검증해야 합니다. |
| 높음 | `src/co/kr/kydbm/core/filecontrol/UploadController.java` Step 5-1 업로드 메타데이터 (현재 1215~1311행) | `uploadFileNew`는 로그인 인터셉터를 거치지만 `UID`, `USITE`를 요청 파라미터로 수신하고 기본값 `1`, `44`를 DB 등록자·사이트 값으로 사용합니다. 세션 사용자와 일치하는지 확인하지 않습니다. | 요청을 조작하면 다른 사용자/사이트로 등록 메타데이터를 기록할 수 있습니다. UID·사이트는 인증된 세션의 `UserInfo`에서 취득하고 접근 가능한 사이트인지 확인해야 합니다. |
| 높음 | `src/co/kr/kydbm/core/filecontrol/UploadController.java` Step 5-2 삭제 처리 (현재 1484~1502행) | 파일은 trash 폴더로 `renameTo`를 시도하지만 반환값을 확인하지 않고, DB 행은 `DELETE`로 완전 삭제합니다. Task 설계는 파일 휴지통 보존, DB 소프트 삭제와 삭제일 기록을 요구합니다. | DB에서 파일 참조가 사라져 복구·90일 보존 추적이 어렵고, 물리 이동 실패 여부와 무관하게 성공 응답 및 DB 삭제가 진행될 수 있습니다. 이동 성공 확인 후 DB soft delete를 수행하고 실패 시 정합성 보상 절차가 필요합니다. |
| 중간 | `WebContent/WEB-INF/Monarch820-servlet.xml` 및 `UploadController.java` Step 5 업로드 제한 | UI는 파일당 20MB를 검사하지만 백엔드의 `Filename.getSize()`에는 20MB 단위 제한이 없고, Spring multipart 한도는 요청 전체 30,000,000바이트입니다. | 클라이언트 검사는 우회 가능하며, 다중 파일 업로드에서 파일당 제한과 요청 전체 제한이 서로 다른 규칙입니다. 서버에서 파일별 제한을 검증하고 전체 요청 한도와 UI 안내를 맞춰야 합니다. |
| 확인 결과 | `운영쿼리정보/A_USER_DMINFO.txt`, `M_COMM_CODE_XLS_SEC_COLS.sql` | 전화 동의 컬럼은 최신 문서에서 `TELYN`으로 바로잡혔습니다. XLS_SEC_COLS의 한글 CODE_VAL은 다운로드 SQL의 실제 한글 별칭과 맞추려는 변경 이력으로 보입니다. | 로컬 스키마·쿼리 텍스트만으로는 의미상 오류라고 판단할 근거를 찾지 못했습니다. |

## 수정 전 우선순위

1. 감사 요청 전문 `REQ_DOC`에서 `excelPassword`가 제외되도록 하고, 기존 로그에 암호 값이 들어갔는지 확인합니다.
2. 다운로드 이력 저장 실패 때 다운로드를 차단할지 정책을 확정합니다.
3. 서버의 `DOWNCOLS` 허용목록 검증 여부와 `exeList` 실행 전 SQL 구성 경로를 확인합니다.
4. 파일 다운로드·삭제 API의 파일 소유/사이트 권한, canonical path 검사, DB soft delete 및 물리 파일 이동 성공 처리를 보완합니다.
5. 업로드 사용자·사이트 값을 세션에서 취득하고 파일별 서버 크기 한도를 강제합니다.
6. `XLS_SEC_COLS` 등록 SQL의 사이트 범위와 실제 공통코드 조회 필터를 DBA와 대조합니다.
7. `DOWN_CNT` 갱신이 단 하나의 감사 로그 행만 바꾸도록 로그 키 전달 방식을 검토합니다.

이 세 항목은 이번 달 변경분에서 발견한 정적 위험입니다. 변경 전에 영향 범위와 VDI에서의 검증 절차를 정해야 하며, 이 검토 과정에서 코드는 수정하지 않았습니다.

## 운영 WAR 생성 전 사용자 리마인드

사용자가 운영 WAR 생성 또는 배포를 시작한다고 하면 다음 두 가지를 먼저 확인하도록 상기합니다.

- [ ] 운영 DB 연결 정보가 로컬 개발용과 분리되어 있고, 운영 비밀번호가 `ENC(...)`로 설정되었으며, 운영 Tomcat의 Jasypt 복호화 키와 일치하는지 확인합니다.
- [ ] `WebContent/WEB-INF/log4j.properties`의 Spring JDBC 로거 DEBUG 설정을 운영 배포 전에 검토·조정했는지, 완성 WAR 안의 설정도 확인합니다.

## 2026-11-03 용도·수신대상 SQL 필터 초안 검토

사용자가 제시한 `XLS_PURPOSE` / `XLS_TARGET` 조건을 로컬 Task 매트릭스와 저장된 스키마 설명에 대조했습니다. 구조는 작성 가능하지만, 현재 형태를 바로 운영 M_SERVICE 쿼리에 넣기 전에 아래 사항을 수정·확인해야 합니다.

1. **전화 동의 컬럼명 오타**: 초안의 `DM.TELLYN`은 저장소 스키마 `운영쿼리정보/A_USER_DMINFO.txt`에 기록된 실제 컬럼 `TELYN`과 다릅니다. 두 곳 모두 `DM.TELYN`을 사용해야 합니다.
2. **정보성 수신동의 원본 반영**: 사용자는 이메일·SMS·전화 수신 동의(`EMAILYN`, `SMSYN`, `TELYN`)를 모두 `A_USER_DMINFO`에서 확인하며, 조회 SELECT의 표시값은 `GBN='CLASS'`로 가져온다고 설명했습니다. 따라서 WHERE의 정보성 수신동의도 `A_USER_DMINFO`에서 확인하고 `GBN='CLASS'`를 적용합니다. 같은 SELECT 레벨의 WHERE에서 `EMAIL_YN` 등 SELECT 별칭을 직접 참조하지 말고, `EXISTS` 조건으로 검사해야 합니다. 저장소 스키마의 실제 전화 동의 컬럼명은 `TELYN`입니다.
3. **ALL 대상의 동의 범위 결정**: 초안은 `XLS_TARGET='ALL'`이면 정보성의 이메일·SMS·전화 동의 조건과 홍보용 DMINFO 채널 동의 조건을 모두 건너뜁니다. 화면 표는 채널별 조건만 보여 주며 ALL의 의미를 정의하지 않습니다. ALL을 ‘동의와 무관한 전체’로 할지 ‘하나 이상의 수신 동의가 있는 전체’로 할지 보안/업무 담당자와 확정해야 합니다. 홍보 목적에서 수신동의 필터를 생략해도 되는지 특히 확인이 필요합니다.
4. **기본 개인정보 필터가 바깥 조건에 보이지 않음**: 홍보용 공통 조건표에는 `A.SITE=@GSITE@`, `A.CORP IS NULL`, `A.USEYN='Y'`도 있습니다. 초안의 세 블록에는 기간과 동의 조건만 있으므로, 이 조건들이 원본 M_SERVICE 쿼리에 이미 적용되는지 확인해야 합니다. 없으면 각 목적의 결과 범위가 과도하게 넓어질 수 있습니다.
5. **원본 SQL 별칭 전제**: 초안은 회원 테이블을 `A` 별칭으로 참조합니다. 실제 M_SERVICE 엑셀 쿼리가 `FROM A_USER A` 형태인지 확인해야 합니다. 다른 별칭 또는 복수 조인이면 `A.SERVSTIME`, `A.USEQ` 등에서 SQL 오류 또는 잘못된 컬럼 참조가 발생합니다.
6. **동적 바인딩 기본값**: `NVL(@XLS_PURPOSE@,'ETC')`는 SQL에 해당 바인드가 존재하고 NULL로 전달될 때의 기본값입니다. MonArch DAO는 파라미터가 아예 누락되거나 빈 문자열이면 바인드 이름을 SQL에서 제거하지 않고 바인딩 맵에도 넣지 않는 경로가 있어, 누락 요청이 NVL 기본값으로 자동 처리된다고 보장할 수 없습니다. 서버에서 두 코드를 허용목록으로 검증하고 누락 시 명시적으로 기본값을 바인딩해야 합니다.
7. **Oracle 일배치의 A_ACT_LOG 의미**: `EXISTS ... STATUS='Y'`는 조건을 만족하는 동의 이력이 한 건이라도 있으면 참입니다. A_ACT_LOG가 변경 이력을 누적하는 방식이라면 이전 Y 기록이 이후 철회 기록과 함께 남는지, `USEYN='Y'`가 현재 유효한 레코드 하나만 표시하는지 DBA와 확인해야 합니다.

따라서 초안은 **DM.TELLYN을 DM.TELYN으로 수정**, **INFO의 EMAILYN/SMSYN/TELYN을 A_USER_DMINFO의 GBN='CLASS' 행에서 확인**, **같은 레벨 SELECT 별칭 대신 WHERE의 EXISTS 사용**, **ALL의 수신 동의 의미 확정**, **M_SERVICE 원본 별칭·공통 조건 확인**, **서버 측 파라미터 검증** 후 최종 적용하는 것이 안전합니다. 이 검토에서는 소스나 SQL 템플릿을 변경하지 않았습니다.

## 2026-11-03 기존 보완 항목 재확인

현재 작업 트리의 구현과 SQL 스크립트를 다시 읽어 확인했습니다. 아래 상태는 저장소 파일 기준이며, Oracle/VDI 적용 여부는 별도 확인이 필요합니다.

2026-11-03 추가 재확인: 아래 항목은 이후 로컬 소스 변경을 반영해 다시 판정했습니다. 앞선 표보다 이 추가 확인 결과를 우선합니다.

| 항목 | 최신 재확인 결과 |
|---|---|
| 감사 `REQ_DOC` 암호 | 개선됨. `savedParams.REQ_DOC` 덮어쓰기 뒤에도 클라이언트에서 재마스킹하고, 서버 `사용로그()`에서도 마스킹합니다. 저장된 과거 로그에 암호가 있었는지는 DB 확인이 필요합니다. |
| 감사 실패 시 다운로드 | 개선됨. 성공 콜백에서 `FAIL`/`ERROR` 응답을 검사하고 실패·통신 오류에서 다운로드를 중단합니다. 실제 응답 형식이 이 판정값을 사용하는지는 VDI에서 확인해야 합니다. |
| `DOWNCOLS` | 개선됨. 서버의 고정 허용 컬럼 목록 13개와 대조합니다. 목록과 `XLS_SEC_COLS` 공통코드가 자동 연동되는 구조는 아니므로 두 목록의 동기화는 확인 대상입니다. |
| `XLS_SEC_COLS` 삭제 범위 | 로컬 SQL은 사이트 `44`로 제한됨. Oracle 실행 여부는 미확인입니다. |
| `DOWN_CNT` | 일부 개선. `MAX(LOG_NO)` 한 건을 갱신하지만 파일명·사용자·최근 5분 기준이라 같은 조건 동시 요청에서 요청별 로그를 정확히 매칭하지 못할 수 있습니다. |
| 파일 다운로드·삭제 접근 | 개선됨. `fid` 필수, 세션 확인, 사이트 번호 비교, canonical 경로 검사가 추가됐습니다. 단, 소유자/업무 권한은 별도로 제한하지 않고, 경로 접두 비교는 경로 구분자 경계를 확인하지 않습니다. 다운로드의 대체 WebRoot 경로도 동일한 canonical 검사 여부를 확인해야 합니다. |
| 업로드 UID·USITE | 해결됨(정적 확인). `userInfo` 세션에서 UID·사이트를 취득하고 세션이 없으면 업로드를 거부합니다. |
| 파일 소프트 삭제 | 개선됨. DB soft delete 전 물리 이동 성공을 요구하고 실패 시 처리를 중단합니다. `M_IMAGE_GAL`의 `USE_YN`, `DEL_DATE`, `DEL_USER` 컬럼 존재 여부 및 Oracle 적용은 미확인입니다. |
| 업로드 크기 | 파일당 20 MiB 서버 검증 적용. multipart 전체 요청은 30,000,000 bytes 제한으로 별도 유지됩니다. 다중 파일 총량 요구와 일치 여부는 확인 대상입니다. |

따라서 앞선 재확인에서 미해결로 분류했던 세션 키 불일치와 삭제 이동 실패 처리 문제는 현재 로컬 코드에서 보완된 것을 확인했습니다. 접근권한의 업무 소유자 범위, 경로 경계 비교, 요청별 다운로드 로그 식별, 운영 DB 반영은 여전히 추가 확인이 필요합니다.

## 2026-11-04 재확인

2026-11-04 현재 작업 트리에서 위 코드와 SQL을 다시 검색했습니다. 앞선 추가 재확인 이후 관련 코드 변경은 발견되지 않았고, 당시 기록한 판정이 현재 파일과 일치합니다. 특히 `REQ_DOC` 덮어쓰기 이후 재마스킹, 세션 `userInfo`에서 UID·사이트 취득, 다운로드·삭제 시 `fid`와 사이트 비교, 파일 이동 실패 시 DB 처리 중단을 확인했습니다. 반면 업무별 파일 소유권 검증, canonical 경로 비교의 경계 처리 및 대체 WebRoot 파일 경로 검증, `DOWN_CNT`의 요청별 로그 ID 전달은 여전히 확인·보완 대상입니다. Oracle 실행 결과와 VDI 구동 여부는 확인하지 않았습니다.

| 항목 | 현재 상태 | 재확인 결과 |
|---|---|---|
| 감사 `REQ_DOC`의 엑셀 암호 | 일부 반영 | 직렬화 후 `excelPassword`를 마스킹하는 처리가 추가됐습니다. 다만 `savedParams.REQ_DOC`가 마스킹 다음에 덮어쓸 수 있고, 백엔드 검증도 없습니다. 암호가 어떤 경로로든 `REQ_DOC`에 남지 않도록 서버에서도 제외해야 합니다. |
| 감사 저장 실패 시 다운로드 | 일부 반영 | AJAX 오류 콜백과 동기 예외에서 다운로드를 중단합니다. 성공 콜백은 응답 본문을 검사하지 않고 다운로드하므로, HTTP 성공 안에 업무상 저장 실패가 담겨 오는 경우까지 차단되는지는 확인되지 않았습니다. |
| `DOWNCOLS` 제한 | 일부 반영 | 허용 문자 정규식이 추가되어 `*`, 괄호, 연산자 및 일반적인 서브쿼리 문자는 차단됩니다. 그러나 허용된 문자만으로 임의의 유효 컬럼명을 보낼 수 있으므로 `XLS_SEC_COLS` 또는 서버 측 컬럼 허용목록과의 대조는 여전히 없습니다. |
| `XLS_SEC_COLS` 삭제 범위 | 코드 수정 완료, DB 적용 미확인 | 등록 스크립트가 `M_USITE_NO='44'` 조건으로 삭제 범위를 제한하도록 수정됐습니다. 실제 Oracle에서 스크립트를 실행했는지, 기존 다른 사이트 값이 보존됐는지는 이 저장소에서 확인할 수 없습니다. |
| 다운로드 건수 갱신 대상 | 일부 반영 | `MAX(LOG_NO)` 및 파일명·REGUSER 조건으로 갱신 범위를 한 행으로 줄였습니다. 같은 사용자·파일명으로 동시 요청이 발생하면 각 요청이 자기 로그가 아닌 가장 최신 행을 갱신할 수 있어, 요청별 LOG_NO 전달이 보장되지는 않습니다. |
| 파일 경로·접근 권한 | 일부 반영 | 다운로드·삭제에 `..`, `./`, `.\\` 문자열 차단이 추가됐습니다. canonical path를 업로드 루트와 비교하지 않고, `filePath` 요청 경로 대체 입력도 남아 있습니다. `fid` 조회·삭제에 사이트/업무 소유권 검사가 보이지 않아 접근 통제는 해결되지 않았습니다. |
| 업로드 UID·USITE 신뢰성 | 미해결 | 신규 코드는 세션에서 `UserInfo`를 읽으려 하지만 실제 로그인/인터셉터가 사용하는 세션 키는 소문자 `userInfo`입니다. 대문자 키 조회는 실패하고 코드가 요청 파라미터 UID/USITE로 대체하므로, 사용자 조작 방어가 작동하지 않습니다. |
| 파일 삭제 소프트 삭제 | 일부 반영 | DB `DELETE`는 `USE_YN`, `DEL_DATE`, `DEL_USER` 갱신으로 바뀌었고 `renameTo` 결과도 확인합니다. 그러나 이동 실패 시 경고만 남기고 DB 소프트 삭제를 계속합니다. 또한 운영 `M_IMAGE_GAL`에 해당 컬럼이 있는지 확인할 DDL/DB 결과가 저장소에 없습니다. |
| 업로드 파일 크기 제한 | 파일별 제한 반영, 요청 전체 제한은 별도 | `uploadFileNew`에서 파일당 20 MiB 검사가 추가됐습니다. Spring multipart 요청 전체 제한은 30,000,000 bytes로 남아 다중 파일 총량은 별도 제한을 받습니다. 다중 업로드 요구와 총 요청 한도가 맞는지 확인해야 합니다. |

### 재확인 결론

완료로 판단 가능한 것은 로컬 `M_COMM_CODE_XLS_SEC_COLS.sql`의 사이트별 DELETE 조건 변경과 `uploadFileNew`의 파일당 크기 검증입니다. 나머지는 보완이 일부 들어갔거나 운영 DB·VDI 확인이 필요합니다. 특히 세션 키 불일치로 UID/USITE 검증이 실제 작동하지 않는 점, 파일 API의 소유권 검사 부재, 삭제 이동 실패 후 DB 상태만 비활성화되는 점은 추가 조치 대상입니다. 이번 재확인에서도 코드 실행이나 VDI/DB 검증은 수행하지 않았습니다.

## 2026-11-04 표 항목별 코드 경로 검증 결과

아래 결과는 현재 워킹트리와 `M_EXCEL_DOWN_LOG.sql`, 프런트엔드 호출부를 함께 확인한 판정입니다. 특히 직전 표의 `DOWNCOLS` 허용목록 반영 판정은 최신 커밋에서 고정 목록이 제거된 상태를 반영하지 못했으므로 정정합니다.

| 항목 | 현재 판정 | 검증 내용 |
|---|---|---|
| 감사 `REQ_DOC` 엑셀 암호 | 정상 UI 경로는 마스킹, 서버 강제 검증은 미완료 | JS가 `savedParams.REQ_DOC` 반영 후 다시 마스킹합니다. `UploadController`의 M_USE_LOG 감사 경로도 마스킹합니다. 다만 M_EXCEL_DOWN_LOG의 일반 `INSERT_EXCEL_DOWN_LOG` 서비스에는 서버 측 REQ_DOC 마스킹이 없으므로 직접 호출/변조 요청까지 보장하지 않습니다. 과거 DB 로그 확인도 미수행입니다. |
| 감사 실패 시 다운로드 | 프레임워크 실패 응답은 차단 | `PostJsonData`는 `resultInfo.result != SUCCESS`이면 제공된 오류 콜백으로 전달하고, JS 오류 콜백은 다운로드를 실행하지 않습니다. 서버 예외도 SvcCRUD에서 FAIL 응답을 반환합니다. 다만 JS 성공 콜백의 `res.result` 등 검사는 실제 응답 구조(`res.resultInfo.result`)와 맞지 않아 중복 검사는 효력이 없습니다. 실제 INSERT 성공 여부/DB 응답은 VDI에서 확인해야 합니다. |
| `DOWNCOLS` | 미해결, 서버 허용목록 검증 없음 | UI는 `_M.Codes[targetSecGrp]`에서 공통코드를 읽어 `DOWNCOLS`를 구성하지만, `UploadController`는 이를 바깥 SELECT 절에 그대로 붙여 실행하며 서버에서 검증하지 않습니다. 클라이언트 요청값은 변경 가능하고, 코드 목록이 비었거나 `targetSecGrp`가 `NONE`이면 제한 컬럼을 보내지 않아 원래 그리드 전체 컬럼 경로로 갈 수 있습니다. 최근 커밋에서 고정 목록도 제거됐으며 XLS_SEC_COLS SQL은 서버 검증에 연결되지 않습니다. |
| `XLS_SEC_COLS` 삭제 범위 | 로컬 SQL 범위 수정 완료, DB 미확인 | DELETE는 CODE_GRP와 M_USITE_NO='44'로 제한됩니다. 스크립트에 13개 등록값이 있으나 Oracle 반영 여부는 확인할 수 없습니다. |
| `DOWN_CNT` | 현재 DDL 기준 갱신 실패 가능성이 매우 높음 | 코드가 `REG_DATE`를 조건으로 쓰지만 제공된 DDL 컬럼은 `REGDATE`입니다. 예외를 잡고 다운로드를 계속하므로 이 DDL 그대로라면 DOWN_CNT 갱신은 실패하고 초기값이 남습니다. 파일명·REGUSER·최근 5분의 MAX(LOG_NO) 방식도 동시 요청 식별을 보장하지 않습니다. |
| 파일 경로·접근 권한 | 일부 보완, 기능 회귀 및 접근통제 잔여 | 신규 API는 로그인, fid, 사이트 비교, canonical 경로 검사를 추가했습니다. 단 사이트 비교는 세션/파일 사이트 중 하나라도 빈 값이면 통과하며 업무 소유자 검증은 없습니다. canonical startsWith는 경로 구분자 경계를 검사하지 않고, 다운로드 대체 WebRoot 파일은 별도 canonical 검사 없이 사용합니다. 더불어 현재 singleFileNew 화면은 다운로드에 filePath, 교체 삭제에도 filePath만 보내지만 서버는 fid 필수로 거부하므로 해당 다운로드/기존 파일 삭제 경로가 동작하지 않습니다. |
| 업로드 UID·USITE | 요청값 변조 방어는 적용, 세션값 기본처리는 잔여 | 업로드 메타데이터는 요청 UID/USITE 대신 세션 userInfo 값을 씁니다. 세션이 없으면 거부합니다. 다만 사용자번호가 비어 있으면 userCode, 사이트번호가 비어 있으면 '44'를 사용하므로 운영 정책상 이 대체값이 허용되는지 확인해야 합니다. |
| 파일 삭제 소프트 삭제 | 파일 이동 실패 차단은 적용, DB 정합성·스키마 미확인 | 물리 파일 이동이 실패하면 DB UPDATE 전에 FAIL 처리합니다. 이동 후 DB UPDATE가 실패하면 파일은 휴지통으로 이동했지만 DB 행은 활성 상태로 남을 수 있습니다. FILE_PATH가 비어 있으면 UPDATE 없이 OK 응답합니다. 운영 M_IMAGE_GAL의 USE_YN/DEL_DATE/DEL_USER 컬럼은 로컬 스키마에서 확인되지 않았습니다. |
| 업로드 파일 크기 | 현재 단일 파일 요청 흐름은 제한 정합 | 서버에서 파일당 20 MiB를 검사하고 multipart 요청 전체는 30,000,000 bytes로 제한합니다. 현재 multiFileNew는 파일마다 동기 AJAX 요청을 별도로 보내므로 정상 UI 경로에서 여러 파일의 합계가 단일 요청 한도에 누적되지는 않습니다. 다른 호출자가 한 요청에 여러 파트를 보내거나 큰 부가 파라미터를 더하는 경우는 별도 제한 영향을 받습니다. |

이 검증은 저장소의 정적 코드·DDL·화면 호출부를 대조한 결과입니다. Oracle 반영, 실제 감사 INSERT, 파일 업/다운로드의 VDI 실행 검증은 포함하지 않습니다.

## 2026-11-04 Mon_LinkCRM_Maven 기준 개선 검토

비교 대상은 `C:\Users\khma7\git\Mon_LinkCRM_Maven`의 현재 로컬 파일과 이 저장소의 코드입니다. Maven 프로젝트 문서의 아키텍처 설명을 그대로 사실로 간주하지 않고, 관련 Java/XML/POM 구현을 확인했습니다. 비교용 프로젝트는 Java 17, Spring 5.3.38을 지정하지만 현재 sericeo_crm의 VDI 반입/기동 계획은 Tomcat 9/JDK 11과 기존 Eclipse 배포 구조이므로 전체 런타임이나 라이브러리 묶음을 바로 교체하는 것은 범위 밖입니다.

| 우선순위 | 개선 방향 | Maven 프로젝트에서 본 참고점 | sericeo_crm 적용 판단 |
|---|---|---|---|
| 최우선 | 신규 파일 API 계약과 화면 호출을 일치시킴 | `FileApiController`는 목록/업로드/확정/다운로드/삭제를 파일 ID 및 REST 경로로 나눕니다. | 현재는 서버가 `fid`를 요구하는데 `singleFileNew` 화면의 다운로드와 기존 파일 삭제는 `filePath`만 보내므로 단일 파일 경로가 깨질 수 있습니다. 먼저 화면과 API 파라미터를 같은 식별자 계약으로 맞추고 VDI에서 회귀 확인해야 합니다. |
| 최우선 | 파일 권한을 파일 레코드와 업무 부모 레코드까지 연결 | Maven은 파일 로직을 `FileService`로 분리해 컨트롤러 책임을 줄였습니다. | 분리 구조는 참고할 만하지만 Maven의 현재 구현은 다운로드/삭제 SQL에서 사이트·업무 소유권을 확인하지 않고, `fileSearchKey` 기반 목록 조회도 세션 소유자와 묶지 않습니다. sericeo_crm에서는 세션 사용자·사이트뿐 아니라 `UPPER_KEY`/`UPPER_INFO`의 업무 권한까지 서버에서 검증해야 합니다. |
| 최우선 | 서버에서 `DOWNCOLS` 허용 컬럼 강제 | Maven 코드에서 sericeo_crm에 적용 가능한 검증 근거는 확인하지 못했습니다. | sericeo_crm 화면은 공통코드에서 컬럼을 가져오지만 클라이언트가 요청을 바꿀 수 있고 서버는 SELECT 절에 그대로 삽입합니다. `XLS_SEC_COLS`를 서버에서 취득해 실제 결과 컬럼과 비교하고, 목록 누락 시 전체 컬럼 다운로드로 열리지 않도록 실패 폐쇄해야 합니다. |
| 높음 | 파일 임시 저장과 업무 저장의 실패 복구 | Maven `FileService`는 임시 폴더와 확정 이동 절차를 분리합니다. | 현재 sericeo_crm도 브라우저 Staging은 있지만 저장 확정 시 파일과 메타데이터를 먼저 기록하고 본 업무 저장과 함께 롤백되는 DB 트랜잭션은 확인되지 않습니다. 확정 실패·DB 오류·세션 이탈 후 남은 파일을 정리하는 보상/정리 작업과 재시도 규칙을 설계할 가치가 있습니다. Maven 코드도 이동 후 INSERT 실패 시 파일 보상 처리를 하지 않아 그대로 복사하면 안 됩니다. |
| 높음 | 예외 응답 형식과 HTTP 상태 표준화 | `FileApiController`는 `ResponseEntity`와 JSON DTO로 API 응답을 구성합니다. | `UploadController`는 일부 경로에서 HTML 스크립트, 일부에서 JSON 문자열을 직접 응답합니다. 기존 MonArch 응답과 호환되는 범위에서 신규 파일 API의 성공/실패 응답을 한 JSON 구조로 통일하면 화면의 성공 오판과 장애 처리가 쉬워집니다. |
| 높음 | 웹 보안 응답 헤더 보강 | Maven `SecurityHeadersFilter`가 `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`를 넣고, 세션 쿠키는 HttpOnly로 설정합니다. | sericeo_crm `web.xml`에서 HttpOnly는 확인되지만 동등한 보안 헤더 필터는 확인되지 않았습니다. HTTP 내부 운영이므로 HSTS는 적용하지 않고, 우선 MIME sniffing·클릭재킹·Referrer 헤더를 기존 화면/iframe 동작과 검증해 적용할 수 있습니다. Maven의 `X-XSS-Protection`은 오래된 브라우저 기능이므로 그대로 추가할 필요는 없습니다. |
| 중간 | 빌드·의존성 재현성 확보 | Maven POM은 WAR 패키징과 라이브러리 버전을 선언합니다. | 현재 sericeo_crm은 Eclipse/WAR와 수동 JAR 구성에 의존합니다. 배포 산출물 재현을 위해 장기적으로 버전 목록, 중복 JAR 점검, WAR 구성 검증 자동화를 고려할 수 있습니다. 다만 Maven POM의 Java 17/Spring 5.3.38을 현재 Tomcat 9/JDK 11 운영선에 바로 적용하면 호환성 문제가 있으므로 별도 업그레이드 단계와 VDI 검증이 필요합니다. |
| 중간 | 핵심 회귀 검증 추가 | Maven POM에는 `spring-test`가 있으나 이번 정적 탐색에서는 실제 테스트 클래스는 찾지 못했습니다. | 의존성 존재만으로 테스트 체계가 있다고 볼 수 없습니다. sericeo_crm의 `DOWNCOLS`, 파일 API fid/사이트 권한, 업로드 크기, audit FAIL 응답, WAR 내 설정 포함 여부를 확인하는 최소 검증 항목부터 문서화하고 자동화 가능성을 검토할 수 있습니다. |
| 참고 | 인증·SSO 방식 | Maven은 별도 `CrossAuthenticationFilter`로 refresh token 쿠키를 조회해 세션을 승계합니다. | 이는 두 애플리케이션 간 SSO라는 별도 요구에 묶인 기능입니다. 현재 내부 HTTP 운영의 sericeo_crm에 이 필터나 토큰 DB 연계를 그대로 옮기는 것은 권하지 않습니다. 도입하려면 토큰 만료·회전·폐기·CSRF·쿠키 범위를 별도 설계해야 합니다. |

### Maven 구현에서 그대로 가져오지 말아야 할 사항

- Maven `FileApiController`는 세션 정보가 있어도 요청의 `userNo`/`usiteNo`가 전달되면 그 값을 그대로 서비스에 넘길 수 있습니다. sericeo_crm의 현재 업로드 코드처럼 인증 세션 값을 신뢰 원천으로 삼고 요청값은 감사/표시 외 용도로 신뢰하지 않는 편이 안전합니다.
- Maven `FileService.getFileForDownload()`는 파일 ID로 경로를 읽고 기본 경로와 결합하지만 canonical root 검사와 소유자/사이트 검사가 없습니다. `deleteFile()`도 ID만으로 상태를 갱신합니다. REST 형태만 가져오고 이 권한 처리는 복사하면 안 됩니다.
- Maven 업로드는 차단 확장자 목록과 전체 multipart 한도 중심이며 파일별 20 MiB 제한은 보이지 않습니다. sericeo_crm의 현재 파일별 서버 제한을 약화시키지 않아야 합니다.
- Maven POM은 Java 17을 release 대상으로 지정합니다. 현재 VDI 배포 규칙 및 JDK 11과 다르므로 라이브러리/API 호환성 검증 없이 소스 전체를 이식하지 않습니다.

이 비교는 두 로컬 소스 트리의 정적 분석입니다. Maven WAR 빌드, sericeo_crm WAR 빌드, 실제 Oracle/VDI 동작은 수행하지 않았습니다.

## 2026-11-04 프론트·백엔드 예외 처리 점검

현재 소스에서 예외 처리 경로를 정적으로 확인했습니다. 결론은 **일부 주요 업무 경로는 처리하지만 시스템 전반의 예외 처리가 일관되거나 완결됐다고 보기는 어렵다**입니다.

| 영역 | 현재 확인 | 영향 |
|---|---|---|
| Spring 전역 예외 리졸버 | `ExceptionResolver`는 `AuthException`과 `LoginException`만 응답 모델로 변환합니다. 그 밖의 예외에는 빈 `ModelAndView`를 반환하고, 예외를 `printStackTrace()`로 출력합니다. | SvcCRUD 밖에서 처리되지 않은 예외는 화면/API별로 응답이 비거나 일관되지 않을 수 있습니다. 로그도 표준 애플리케이션 로거로 모이지 않습니다. |
| DATACRUD 업무 예외 | `SvcCRUD.dataCRUD()` 안에서는 `DataAccessException`과 `Exception`을 잡아 `resultInfo`의 FAIL 코드로 반환합니다. DB 예외는 대부분 사용자 메시지를 일반화하지만 ORA-20000 업무 메시지는 추출해 전달합니다. | 핵심 CRUD 경로는 비교적 처리돼 있으나, 응답 HTTP 상태는 보통 성공 상태로 남고 프런트엔드가 본문 계약에 의존합니다. `parsingForJonType(XmlParms)`는 try 블록보다 앞이라 그 단계 예외는 내부 catch 대상이 아닙니다. |
| 컨트롤러 전용 예외 핸들러 | `SvcCRUD`의 `@ExceptionHandler(Exception.class)`는 `errorMessage`만 담은 HTTP 400 응답을 반환합니다. 공통 프런트엔드가 기대하는 `resultInfo` 구조와 다릅니다. `UploadController.handleException()`은 `@ExceptionHandler` 표기가 없어 Spring 예외 핸들러로 등록되지 않습니다. | 동일한 실패도 컨트롤러에 따라 응답 구조가 달라지고, 오류 표시·후속 동작이 달라질 수 있습니다. |
| 공통 AJAX `PostJsonData` | 정상 업무 성공은 `resultInfo.result`로 판정합니다. 하지만 오류 응답을 항상 JSON으로 가정해 무조건 파싱하고, `ErCallBack`이 전달되지 않아도 직접 호출합니다. 일부 Oracle 사용자 예외·세션 예외는 오류 콜백 없이 alert/로그아웃만 실행합니다. | 서버가 HTML/JSP 오류 화면을 반환하거나 응답이 비정상 JSON이면 오류 처리 도중 파싱 예외가 날 수 있습니다. 호출부가 오류 콜백을 생략한 경우 후속 `TypeError`가 추가될 수 있습니다. 전역 `ajaxError`/일반 JS 오류 수집 경로는 확인되지 않았습니다. |
| 엑셀 다운로드 | `UploadController`의 엑셀 처리 catch는 사용자 안내를 시도하고 로그를 남깁니다. 반면 `downloadFileNew()`는 예외를 로그만 남기고 HTTP 오류 상태나 표준 오류 본문을 설정하지 않습니다. 스트림이 시작된 뒤 오류가 나면 정상 파일처럼 보이는 부분 파일이 생길 수 있습니다. | 경로마다 브라우저가 받는 오류 표시가 다르며, 파일 다운로드 오류를 호출 UI가 판별하기 어렵습니다. |
| 신규 업로드/삭제 API | 업로드·삭제 예외를 JSON FAIL로 변환하지만 일부 응답에 `e.getMessage()`를 그대로 포함합니다. 업로드는 finally에서 JSON 쓰기/닫기를 수행합니다. | 내부 경로·DB 오류 문구가 사용자에게 노출될 수 있습니다. 응답 쓰기 자체가 실패하면 예외를 다시 표준 응답으로 바꾸기 어렵습니다. |
| 레거시 파일 API | 일부 메서드는 예외를 로그만 남기고 응답을 끝내며, 일부 `finally`에서 스트림을 null 확인 없이 닫습니다. 여러 메서드에서 `printStackTrace()`도 사용합니다. | 예외가 원래 오류를 가리거나 빈 응답으로 끝날 수 있고 운영 로그의 추적성이 낮습니다. |

### 우선 보완 권고

1. 인증·권한 실패와 일반 서버 오류를 포함하는 공통 예외 응답 규격을 먼저 정합니다. MonArch 프런트엔드 호환을 위해 `resultInfo.result`, `errorCode`, 사용자 메시지, 요청 추적 ID를 일관되게 반환합니다.
2. Spring 전역 예외 처리기에서 미처리 예외를 반드시 로깅하고, API는 JSON FAIL, 화면 요청은 공통 오류 화면으로 분기합니다. 현재 전역 `ExceptionResolver`의 기타 예외 빈 응답 경로를 없앱니다.
3. `PostJsonData`는 응답 파싱 실패, HTTP 오류, 업무 FAIL을 분리하고, 오류 콜백 선택 호출을 안전하게 처리합니다. HTML 오류 본문도 파싱 예외로 끝나지 않도록 공통 안내와 추적 ID를 남깁니다.
4. 파일·엑셀 스트림 API는 응답이 커밋되기 전 검증을 완료하고, 전송 중 오류는 서버 로그와 클라이언트 다운로드 실패가 식별되도록 처리합니다. 예외 메시지 원문은 사용자 응답에 넣지 않습니다.
5. `printStackTrace()`와 빈 catch를 업무 코드에서 정리하고 구조화된 로거와 요청/사용자/서비스 식별자를 사용합니다. 개인정보·비밀번호·SQL 바인드 값은 로그에서 제외합니다.
6. 우선 DATACRUD JSON 실패, 세션 만료, SQL 오류, 엑셀 감사 INSERT 실패, 파일 업로드/다운로드/삭제 실패를 대상으로 프런트·백엔드 응답 계약 검증을 수행합니다.

이 점검은 소스 코드의 정적 경로 분석이며, 각 오류를 실제 발생시켜 VDI에서 브라우저 동작·HTTP 상태·로그를 검증한 것은 아닙니다.

## 2026-11-04 법인계약 저장 ORA-02055 제보

사용자가 법인계약 메뉴 저장 중 ORA-02055가 발생했다고 알려왔습니다. Oracle 공식 설명은 `distributed update operation failed; rollback required`이며, 분산 갱신 일부가 실패해 사이트 간 데이터가 불일치할 수 있으므로 savepoint 또는 트랜잭션 전체 rollback 후 재시도해야 한다고 안내합니다. 실제 원인 제약조건/원격 DB 장애/트리거 등은 ORA-02055 전후의 전체 Oracle 오류 스택과 실행 SQL을 확인해야 합니다.

현재 저장소에는 법인계약 화면의 M_SERVICE 저장 SQL 원문이 없어 어느 SQL, 트리거, 프로시저 또는 DB 링크가 분산 갱신을 발생시켰는지 특정할 수 없습니다. 저장소의 다른 프로시저에 `@DBL_CEO` DB 링크 참조가 있으나 해당 화면 저장과 연결됐다는 근거는 없습니다. `SvcCRUD`의 `DataAccessException` 경로는 오류를 기록하고 `E00003` 일반 실패 응답을 반환하지만, 이 경로의 명시적 rollback/savepoint 실행은 확인되지 않았습니다. DataSourceTransactionManager 및 TransactionTemplate 정의만 있고, DATACRUD의 저장 호출에서 해당 템플릿을 쓰는 것은 확인되지 않았습니다.

운영/VDI에서 확인할 사항: 화면에 표시된 전체 오류 문자열과 시간, Tomcat 로그의 ORA-02055 직전 최초 ORA 오류, 실제 M_SERVICE 서비스/메소드와 저장 SQL, SQL이 호출하는 트리거·프로시저의 DB 링크 사용, 동일 세션에서 이어진 ORA-02067 발생 여부를 확보합니다. ORA-02055가 난 동일 세션/트랜잭션에서 추가 DML을 계속하거나 자동 재시도하지 말고 DBA 확인 후 rollback 여부를 결정합니다. 이는 로그/SQL을 확보하기 전까지의 진단 방향이며 원인 확정은 아닙니다.

## 2026-11-04 `jquery.kdb.soap.2.0.js` 통신·예외 처리 검토

현재 파일에는 2026-11-04자 보완이 이미 들어 있어 `PostJsonData()`의 응답 파싱은 try/catch로 보호되고, 선택 오류 콜백은 함수 여부를 검사합니다. 아래는 이 보완을 전제로 한 잔여 검토입니다.

| 우선순위 | 위치 | 확인 내용 | 개선 방향 |
|---|---|---|---|
| 높음 | `GETJSON()` / `GetJsonServer()` (254~321행) | `GETJSON()`은 여러 화면에서 사용됩니다. `GetJsonServer()`는 `_M.aSync.sync=false`로 동기 AJAX를 실행하고, `responseText`를 try/catch 없이 `parseJSON()`합니다. 네트워크/401/HTML 응답이나 빈 응답이면 초기 화면 구성 중 동기 예외가 발생할 수 있습니다. | 현재 동기 호출 순서를 깨지 않도록 먼저 오류 응답 파싱과 공통 오류 반환을 안전하게 하고, 화면에서 undefined 설정을 소비하지 않도록 처리합니다. 비동기 전환은 별도 영향 분석 후 진행합니다. |
| 높음 | `JSONClientParameters._serialize()` 및 `PostJsonData()` 요청 생성 (67~75, 628~720행) | `typeof null === 'object'`인데 `_serialize()`는 `o.constructor`를 읽어 null에서 예외가 납니다. 이 예외는 `pi.toJson()` 평가 시 AJAX 진입 전에 발생하며 `PostJsonData()`의 success/error 콜백으로 전달되지 않습니다. | null·배열 요소 null·지원하지 않는 타입의 호환 직렬화 규칙을 먼저 정하고, 요청 직렬화 실패도 공통 오류 콜백/로그로 전달합니다. 기존 Java/NET 전송 형식은 회귀 확인합니다. |
| 중간 | `PostJsonData()`의 resultInfo 없는 성공 응답 (111~116행) | 파싱 결과가 null이거나 표준 `resultInfo`가 없어도 성공 콜백으로 전달합니다. 잘못된 JSON은 앞서 걸러지지만 JSON `null` 및 계약이 잘못된 객체는 성공 처리될 수 있습니다. | 표준 MonArch 응답과 의도된 raw JSON 응답을 구분합니다. null/원시값/형식 오류는 프로토콜 실패로 보고하고, 합법적인 raw 객체 호출만 호환하도록 callsite를 확인합니다. |
| 중간 | 메뉴 ID 불일치 성공 응답 (123~128행) | 현재 메뉴와 응답 메뉴가 다르면 성공·오류 콜백 모두 호출하지 않습니다. 오래된 응답이 화면을 덮는 것은 막지만 호출부의 로딩 표시나 버튼 잠금 해제가 남을 수 있습니다. | stale 응답 억제 동작은 유지하면서 호출 완료/정리 처리가 누락되지 않게 합니다. 오류로 오인해 사용자 알림을 띄우지 않도록 완료 처리와 업무 오류 콜백을 구분합니다. |
| 중간 | 실패 알림과 콜백 순서 (129~170, 187~194행) | 공통 함수가 먼저 alert하고 오류 콜백도 실행하므로, 콜백에서 다시 alert하는 호출부는 중복 알림이 생길 수 있습니다. E1000에서 오류 콜백이 예외를 던지면 이후 로그아웃 트리거가 실행되지 않을 수 있습니다. | 알림 책임을 공통 함수 또는 호출부 중 한쪽에 명확히 두고, E1000 로그아웃은 콜백 예외와 관계없이 수행되도록 보장합니다. |
| 중간 | `PostJsonData2()` (229~253행) | `aSync` 선택 결과를 선언하지 않은 전역 `_async`에 대입합니다. 성공/오류 응답도 표준 함수처럼 검증하지 않고 원문을 전달합니다. 현재 1차 코드에서 호출은 검색되지 않았습니다. | 미사용 여부를 확인하고 호출 계약을 기록합니다. 유지할 경우 지역 변수로 바꾸되 사용처를 찾기 전 표준 `PostJsonData()`와 동작을 섞지 않습니다. |
| 낮음/호출 여부 확인 | `GETJSON2`, `GETJSONREMOTE`, `GETHTML`, `JSON_Serialized` (323~440행) | 직접 응답 파싱이 보호되지 않은 보조 함수들이 있습니다. `JSON_Serialized()`의 문자열 처리 경로는 인자 `jsonString` 대신 설정되지 않은 `_data`를 파싱합니다. 현재 1차 코드 호출은 검색되지 않았습니다. | 사용 여부를 저장소 전체에서 확인한 뒤 호출이 없으면 단계적 폐기 후보, 호출이 있으면 해당 응답 형식별로 별도 보완합니다. |
| 낮음/호출부 직렬화 | `$.Json2Str()` (442~458행) | 객체를 직접 문자열 결합하므로 따옴표·역슬래시·개행이 포함된 문자열에서 유효 JSON이 되지 않을 수 있습니다. `campaignWorkflow.js`에서 문서 객체 저장 시 사용합니다. | 단순히 JSON.stringify로 교체하지 말고 서버가 기대하는 저장 형식을 확인한 뒤 해당 저장 흐름 회귀 검증과 함께 개선합니다. |

### 안티그래비티 작업 권고 범위

먼저 `GETJSON/GetJsonServer`와 `JSONClientParameters._serialize`를 작은 단위로 조사·수정하고, 이어서 `PostJsonData`의 응답 계약·콜백·E1000 처리 정책을 정리합니다. 호출이 확인되지 않은 보조 함수는 같은 변경에 묶지 않습니다. 각 단계에서 실제 호출부 영향을 정적으로 확인하고 로컬 Eclipse 오류를 점검한 뒤 다음 파일/블록으로 넘어갑니다. 수정 코드는 작성하지 않았으며 VDI 구동 검증도 하지 않았습니다.

## 2026-11-04 예외 처리 보완 Step 6-1 & Step 6-1b 완료 (jquery.kdb.soap.2.0.js 4대 영역 종합 고도화)

- 대상 파일: `WebContent/js/jquery.kdb.soap.2.0.js`
- 내용:
  1. **요청 직렬화 사전 예외 격리 (`PostJsonData`)**:
     - `pi.toJson()` 실행 전 `try-catch`로 사전 격리하여 직렬화 단계에서 예외 발생 시 스크립트 중단을 방어하고 사용자 안내 및 `ErCallBack` 안전 통지.
  2. **동기 통신 관문 안전화 (`GETJSON` / `GetJsonServer`)**:
     - 기존 동기 호출 순서(`async: _M.aSync.sync`)를 100% 엄격 유지하면서 `responseText` 파싱에 `try-catch` 안전 JSON 파싱 적용.
     - HTTP 에러 및 빈 응답 시 화면 먹통 방어, `E1000` 외 일반 `FAIL` 응답 시에도 사용자 alert 안내 후 안전하게 `undefined` 반환.
     - `STRUCTURE_CONT` 파싱 시 구형 `eval` 대신 표준 `JSON.parse` 우선 적용 및 파싱 실패 방어.
  3. **직렬화 엔진 예외 원천 차단 (`JSONClientParameters._serialize`)**:
     - `null`/`undefined` 입력 시 `o.constructor` 접근 TypeError 방어 (`""` 반환).
     - 배열 원소 순회 시 `null`/`undefined` 요소에 대한 `<string></string>` 안전 직렬화 처리.
     - 지원하지 않는 타입 수신 시 `throw new Error`로 중단하던 문제를 제거하고 `String(o)` 안전 변환.
     - `toXml`, `toJson`, `toGetString` 내 `_M.UserInfo` 및 `_M.PrevActGbn` Null-Safe 방어 적용.
  4. **응답 및 콜백 안정성 강화 (`PostJsonData`)**:
     - `ErCallBack` 호출 시 `try-catch`로 감싸 콜백 내부 예외가 공통 로직을 중단시키지 않도록 격리.
     - `E1000` 세션 만료 시 `ErCallBack` 오류 여부와 무관하게 로그아웃(`$(".opticon-logout").trigger("click")`) 완수 보장.
     - `rawResponse`에 서버 내부 HTML 오류 페이지가 전달되지 않도록 정리.
  5. **문서 저장 payload 깨짐 방어 (`$.Json2Str`)**:
     - `campaignWorkflow.js` 등에서 호출하는 `$.Json2Str`에 `JSON.stringify` 표준 우선 사용 및 문자열 따옴표/역슬래시/개행 정규식 이스케이프 보강으로 JSON 깨짐 방어.

## 2026-11-04 예외 처리 보완 Step 6-2 완료 (ExceptionResolver 전역 리졸버 표준화)

- 대상 파일: `src/co/kr/kydbm/core/exception/ExceptionResolver.java`
- 내용:
  1. **전역 예외 응답 형식 표준화 (빈 ModelAndView 반환 결함 해결)**:
     - `AuthException`/`LoginException` 외의 모든 미처리 예외(DB 오류, 시스템 런타임 예외 등) 발생 시 빈 `ModelAndView`를 반환하던 문제를 전면 개편하여 `ResultInfo(result="FAIL", errorCode, message)` 표준 응답 구조 생성.
  2. **요청 프로토콜별 자동 분기 (AJAX/JSON vs 동기 브라우저 요청)**:
     - `isJsonRequest(request)` 판별 로직 추가 (`.json`, `X-Requested-With`, `application/json`).
     - AJAX/JSON 요청 시 `MappingJacksonJsonViewEx`를 통해 MonArch 표준 규격(HTTP 200 + `resultInfo.result=FAIL`) JSON 응답 반환으로 클라이언트 화면 먹통 및 파싱 실패 원천 방어.
     - 동기 브라우저 요청 시 `redirect:/error.htm`으로 안전 리다이렉트 처리하여 화이트스크린 방지.
  3. **내부 시스템 및 DB 상세 정보 은닉화**:
     - DB 예외(`SQLException`, `DataAccessException`) 시 테이블명/SQL 구문 노출을 방지하고 `"데이터베이스 처리 중 오류가 발생하였습니다."`로 은닉.
     - 단, Oracle `ORA-20000` / `SQL state [20000]` 사용자 정의 비즈니스 예외는 기존 CRM 프론트 파싱 계약을 그대로 유지하여 화면 안내문구 정상 표출.
  4. **보안 로깅 표준화 (`printStackTrace()` 전면 제거)**:
     - `exception.printStackTrace()` 및 `e.printStackTrace()`를 완전히 제거하고 Log4j 프로젝트 표준 로거(`logger.error(...)`, `logger.warn(...)`)로 안전하게 전환.
     - `invalidateSession(request.getSession(false))`로 불필요한 신규 세션 생성 방어.

## 2026-11-04 예외 처리 보완 Step 6-3 완료 (SvcCRUD 파싱 try-catch 보호 및 @ExceptionHandler 표준화)

- 대상 파일: `src/co/kr/kydbm/core/service/SvcCRUD.java`
- 내용:
  1. **요청 파라미터 파싱 사전 예외 격리 (`parsingForJonType`)**:
     - `dataCRUD`(`/DATACRUD`), `getJson`(`/GetJs`), `getCode`(`/GetCode`)에서 `parsingForJonType(XmlParms)` 호출부를 `try-catch` 내부로 이동.
     - 파라미터 null 또는 URL 디코딩 오류 발생 시 컨트롤러가 튕기지 않고 `ResultInfo(FAIL, E00004)`를 안정적으로 반환하도록 보장.
     - `parsingForJonType` 내 `xmlParams == null` Null-Safe 방어 코드 추가.
  2. **컨트롤러 레벨 `@ExceptionHandler` 응답 계약 표준화**:
     - 기존에 단순 `{"errorMessage": ...}`와 HTTP 400(SC_BAD_REQUEST)을 반환하여 공통 AJAX(`soap.2.0.js`)에서 `resultInfo` 프로퍼티 부재 및 파싱 불일치를 일으키던 결함 수정.
     - `response.setStatus(HttpServletResponse.SC_OK)`(200) 유지 및 `rstMap.put(CommonConst.RESULT_INFO, resultInfo)` 매핑으로 클라이언트 화면 화이트스크린 방어 및 에러 콜백 정상 연동 보장.
     - 하위 호환성을 위해 기존 `errorMessage` 키도 함께 보존.
  3. **콘솔 덤프 `printStackTrace()` 전면 제거**:
     - `dataCRUD`, `getJson`, `getCode`, `initMetaCode`, `initMetaLabel`, `getUserInfo` 전반에서 `e.printStackTrace()`를 완전히 제거하고 `log.error(..., e)`로 안전하게 기록.

## 2026-11-04 예외 처리 보완 Step 6-4 완료 (UploadController 예외 처리 및 스트림 안전성 보강)

- 대상 파일: `src/co/kr/kydbm/core/filecontrol/UploadController.java`
- 내용:
  1. **컨트롤러 공통 예외 처리기 `@ExceptionHandler` 어노테이션 누락 복원 및 ResultInfo 표준화**:
     - `handleException`에 누락되어 있던 `@ExceptionHandler(Exception.class)`를 명시하여 Spring MVC 예외 인터셉트 정상화.
     - HTTP 상태 코드를 `SC_OK`(200)으로 설정하고 `ResultInfo(result="FAIL", errorCode="E00004", message=COMM_ERROR_MESSAGE)` 및 `mappingJacksonJsonView`를 반환하여 통신 브릿지(`jquery.kdb.soap.2.0.js`)와의 응답 계약 100% 일치.
  2. **엑셀 및 파일 다운로드 응답 커밋 검증 (`response.isCommitted()`) 및 브라우저 안내**:
     - `downExcel` 및 `downloadFileNew`에서 예외 발생 시 `if (!response.isCommitted())` 사전 검증을 통해 `response.reset()` 시의 `IllegalStateException`을 원천 방어.
     - `downloadFileNew` 실패 시 빈 응답으로 브라우저가 무한 대기하는 결함을 수정하고, alert 안내 스크립트 출력 후 `history.back()` 복귀 처리.
  3. **내부 시스템 및 파일 경로 정보 노출 차단**:
     - `uploadFileNew`, `deleteFileSafe`, `downExcel`에서 클라이언트로 직접 전달되던 `e.getMessage()`를 사용자 친화적인 안전 문구("파일 업로드/삭제/다운로드 처리 중 오류가 발생하였습니다.")로 은닉화.
  4. **스트림 및 출력 객체 자원 누수 방지 (Null-Safe `close()`)**:
     - `multiFileUpload`, `signFileUpload`, `uploadFileNew`, `deleteFileSafe`의 `PrintWriter out`에 대해 `if (out != null) out.close();` null-safe 닫기 적용.
     - `fileDownload`, `signFileDownload`, `zipFileDownload`, `download`, `downloadFileNew`의 `FileInputStream`, `OutputStream`, `ZipOutputStream` 객체에 대해 `finally` 블록 내 null 검증 및 안전 종료 완비.
  5. **보안 로깅 표준화 및 콘솔 덤프 제거**:
     - `multiFileUpload`, `signFileUpload`, `fileRename`, `downExcel`, `writeFile` 등 전반의 `e.printStackTrace()` 및 `System.out.println`을 전면 제거하고 Log4j `log.error(..., e)`로 일원화.

## 2026-11-04 `jquery.kdb.soap.2.0.js` 수정분 재검토

작업 트리의 `WebContent/js/jquery.kdb.soap.2.0.js`와 저장소 내 정적 호출부를 다시 확인했습니다. 현재 HEAD에는 Step 6-1 변경이 포함되어 있고 작업 트리에는 미커밋 변경이 없습니다. 이 검토에서는 소스 변경 및 테스트 실행을 하지 않았습니다.

| 우선순위 | 위치 | 재검토 결과 | 후속 조치 |
|---|---|---|---|
| 높음 | `PostJsonData()` 응답 계약 (133~140행) | 파싱된 `null` 또는 `resultInfo`가 없는 객체도 `ScCallBack`으로 전달합니다. 기존 리뷰의 “raw JSON 호출 여부 확인 후 계약 구분”이 해결되지 않았습니다. 저장소의 일반 호출부는 `PostJsonData()`의 데이터 테이블 응답을 주로 소비하지만, 실제 서버 응답 전체를 추적해 raw 응답이 없음을 확정하지 않은 상태라 일괄 차단하면 안 됩니다. | 호출별 응답 형태를 대조한 뒤 표준 `resultInfo` 응답과 명시적으로 허용한 raw 응답을 구분하고, JSON `null`/잘못된 계약은 실패 경로로 전달합니다. |
| 높음 | 메뉴 ID stale 응답 (147~153행) | `menuId` 불일치 시 성공 콜백을 호출하지 않고 오류/완료 콜백도 없습니다. 따라서 기존 화면 갱신 억제는 유지되지만, spinner·버튼 잠금 정리는 호출부에 따라 남을 수 있습니다. | 현재 메뉴에 영향을 주지 않는 별도 완료 정리 경로가 필요합니다. 오류 콜백 재사용은 사용자 알림 중복을 만들 수 있으므로 호출부별 정리 로직을 먼저 확인합니다. |
| 높음 | `GetJsonServer()` NET 응답 경로 (368~370행) | Java 응답은 `resultInfo`의 SUCCESS/FAIL을 확인하지만, NET 경로는 `rlt.d`를 보호 없이 `eval`하고 FAIL 계약을 검사하지 않습니다. HTML/빈 `d`/서버 오류 응답은 예외 또는 잘못된 설정값으로 이어질 수 있습니다. | 동기 호출 유지 조건은 충족했으나, Java와 NET의 응답 포장 형식을 구분해 파싱을 보호하고 NET 업무 FAIL도 `undefined` 반환 및 안내 경로로 통일해야 합니다. |
| 중간 | `GetJsonServer()` HTTP 실패 처리 (314~342행) | 동기 AJAX의 `responseText`를 파싱하는 보호는 추가됐습니다. 다만 AJAX에 `error` 콜백이 없어 HTTP 상태와 본문을 분리해 처리하지 않으며, HTTP 실패가 빈 본문/HTML이면 일반 파싱 실패로만 안내됩니다. 동기 방식은 기존대로 유지됩니다. | HTTP status와 응답 본문을 함께 확인해 401/E1000 및 일반 통신 오류를 구분하되 화면별 동기 초기화 순서는 그대로 둡니다. |
| 중간 | 오류 알림 책임 (116~119, 164~194, 210~237행) | 공통 alert 후 `ErCallBack`을 실행합니다. 저장소의 많은 호출부가 오류 콜백에서 다시 `alert(response.Message)`를 호출하므로 같은 실패가 두 번 표시될 수 있습니다. 콜백에서 spinner를 제거하는 사례도 있어 콜백 자체를 생략할 수는 없습니다. | 공통 alert와 호출부 alert를 호출 단위로 분류하고, 한쪽만 사용자 알림을 담당하게 합니다. 현재는 정리되지 않았습니다. |
| 중간 | `PostJsonData()` 오류 내용·콜백 예외 | HTTP 오류의 raw 본문은 callback에 직접 전달되지 않는 점이 확인됩니다. 다만 업무 FAIL `resultInfo.message`와 일부 서버 메시지는 공통 alert 및 오류 콜백으로 전달되어 내용의 안전성은 서버 계약에 의존합니다. 성공 콜백의 예외도 격리되지 않습니다. | 서버 내부 정보가 포함될 수 있는 메시지는 서버에서 정제하고, 프런트에는 사용자용 문구/추적 ID만 전달하도록 계약을 정합니다. 성공 콜백 예외는 통신 예외와 구분해 화면 오류 수집 정책으로 다룹니다. |
| 중간 | `_serialize()` null/지원하지 않는 타입 (722~794행) | `null`/`undefined`는 빈 문자열, 배열 내 null은 `<string></string>`, 기타 지원하지 않는 타입은 `String(o)`로 처리하도록 바뀌었습니다. 이는 null에서 예외를 막지만 실제 Java/NET 서버가 이 세 표현을 어떤 값으로 해석하는지는 소스만으로 확인되지 않았습니다. | 기존 직렬화 규칙이 서버에서 기대하는 빈 문자열·빈 XML 요소와 일치하는지 양쪽 파서 기준으로 확인해야 합니다. 문자열 포맷이나 payload 계약은 추가 변경하지 않습니다. |
| 낮음 | 보조 함수 호출 여부 | `PostJsonData2`, `GETJSON2`, `GETJSONREMOTE`, `GETHTML`, `JSON_Serialized`는 비압축 JS/JSP를 대상으로 직접 호출 검색 결과가 없습니다. `JSON_Serialized`의 `jsonString` 미사용 결함은 남아 있습니다. | 현 활성 경로와 섞지 않고 별도 미사용 코드 정리 후보로 유지합니다. |
| 확인 완료 | `$.Json2Str()` 사용처 | `jquery.kdb.campaignWorkflow.js` 885행에서 문서 저장 payload 생성에 실제 사용됩니다. 새 구현은 `JSON.stringify`를 우선 사용해 일반 문자열의 따옴표·역슬래시·개행을 JSON 규칙대로 escape합니다. 모바일·MonArch 기본 JS에도 별도 `$.Json2Str` 재정의가 있어 실제 로딩 순서/최종 함수는 정적 검색만으로 확정하지 못했습니다. | 실제 페이지의 script 로딩 순서와 서버 저장 후 재조회 결과로 적용 구현 및 payload 호환성을 확인합니다. |

## 2026-11-04 예외 처리 보완 Step 6-5 완료 (프론트 통신 관문 3대 핀포인트 보완)

- 대상 파일: `WebContent/js/jquery.kdb.soap.2.0.js`, `WebContent/js/jquery.kdb.MonArch800.js`
- 내용:
  1. **`PostJsonData()` null 및 비객체 응답 격리 (`soap.2.0.js`)**:
     - 서버 응답 파싱 결과가 `_result === null` 또는 객체가 아닌 경우, 성공 콜백(`ScCallBack`)으로 넘기지 않고 `ErCallBack({ resultInfo: { result: "FAIL", errorCode: "E9998" } })`으로 안전하게 에러 격리.
     - 콜백 내부에서 `data.field` 접근 시 발생하던 `TypeError`를 원천 방어.
     - `resultInfo` 프로퍼티가 없는 일반 JSON 객체는 기존처럼 성공 콜백으로 전달하여 모나크 외 커스텀 응답과의 하위 호환성 100% 보존.
  2. **메뉴 변경 후 stale 응답 시 UI 락(`$.unblockUI`) 안전 해제 (`soap.2.0.js`)**:
     - `menuId`가 현재 메뉴(`_M.PrevActGbn.currMenuId`)와 달라 응답을 무시할 때, 기존 화면을 덮어쓰는 콜백은 억제하되 `if (window.$ && typeof $.unblockUI === "function") $.unblockUI();`를 1회 안전 실행.
     - 비동기 처리 중 다른 메뉴로 이동하더라도 전체 화면이 딤드(Dimmed)된 채로 굳어버리는 UI 먹통 결함을 완벽히 해결.
  3. **`MonArch800.js`의 `$.Json2Str` 최신 표준 동기화 (`MonArch800.js`)**:
     - `monform.jsp`의 스크립트 로딩 순서상 `MonArch800.js`가 `soap.2.0.js` 이후에 로드되어 구형 함수가 덮어써지던 문제를 해결.
     - `MonArch800.js`(Line 1283)의 `$.Json2Str`에도 `JSON.stringify` 우선 사용 및 문자열 따옴표/역슬래시/개행 정규식 이스케이프 처리를 1:1로 동일하게 적용하여 캠페인 워크플로우 문서 저장 payload 깨짐을 원천 방어.

### 재검토 범위 및 환경 확인

- `GETJSON()`은 대시보드, 캠페인 워크플로, `superContaner` 및 보조 플러그인에서 실제 사용됩니다. 실패 시 `undefined` 반환은 맞지만 여러 호출부가 곧바로 `option` 속성을 읽으므로 화면별 초기화 중단 가능성은 남습니다.
- `GetJsonServer()`의 동기 설정은 유지되어 비동기 전환은 확인되지 않았습니다.
- 요청 직렬화 예외를 `PostJsonData()`에서 잡아 실패 콜백으로 전달하는 경로는 추가됐습니다. 단, 오류 콜백 없는 호출은 alert만 받으므로 화면 상태 복원까지 보장하지 않습니다.
- `E1000`은 오류 콜백 예외를 catch한 뒤 로그아웃 트리거를 실행하도록 되어 있습니다.
- Eclipse GUI의 Problems 탭은 이 세션에서 열람하지 못했습니다. 테스트 코드 추가나 테스트 실행도 하지 않았습니다. 따라서 Eclipse 컴파일/Problems 확인은 미검증입니다.

## 2026-11-04 통신 예외 보완 후속 검토 (Step 6-5 반영본)

앞 절의 재검토 뒤 HEAD가 갱신되어 `jquery.kdb.soap.2.0.js` 및 `jquery.kdb.MonArch800.js`의 현재 내용을 다시 대조했습니다. 현재 HEAD 기준으로 stale 응답, null 응답, `$.Json2Str()`에 추가 변경이 들어 있습니다. 다음 판단은 앞 절에서 해당 기능을 미반영으로 적은 내용을 대체합니다.

| 항목 | 현재 판단 | 남은 검토 |
|---|---|---|
| stale 응답 UI 잠금 | `PostJsonData()`의 메뉴 불일치 성공 분기에 `$.unblockUI()`가 추가되어 전역 딤 화면이 남는 경우를 줄이려는 조치는 반영됐습니다. 단, `$.unblockUI()`는 특정 AJAX 요청 소유 잠금만 해제하는 API가 아니라 화면 전체 blockUI를 해제합니다. 겹쳐 실행된 현재 메뉴 요청, 저장 중 잠금, 테마 팝업 등 다른 화면 잠금도 조기 해제할 수 있습니다. | 이 코드를 “완벽한 방어”로 간주하지 않습니다. 통신 공통부의 무조건 전역 해제보다 잠금 소유자/요청 토큰을 구분하거나, 실제 잠금을 획득한 호출부가 stale 완료를 정리하도록 하는 방식이 안전합니다. 실제 화면에서 요청 중복 및 메뉴 전환 시나리오 검증이 필요합니다. |
| `PostJsonData()` null 응답 | 현재는 `_result === null` 또는 object가 아닌 응답을 성공 콜백에 넘기지 않고 실패 콜백으로 보냅니다. `resultInfo`가 없는 정상 객체는 기존처럼 성공 콜백으로 전달해 호환성을 보존합니다. `resultInfo`가 있으면 `SUCCESS`만 성공이고 그 외 값은 업무 실패 분기로 처리됩니다. | 제안된 처리 방향과 일치합니다. 단, 오류 콜백이 없는 호출은 공통 alert로 알리고 끝나므로 해당 호출부의 로딩 정리 필요 여부는 별도 영향 확인이 필요합니다. |
| `$.Json2Str()` 재정의·로딩 순서 | `MonArch800.js`에 JSON.stringify 우선 구현이 있고, 직후 구형 구현은 주석 블록 안에 있습니다. `monform.jsp`는 `MonArch800.js`를 로드하고 `MonArch.js`도 포함하며, `MonArch.js`가 `soap.2.0.js`를 `document.writeln`으로 추가합니다. 따라서 확인한 두 정의 모두 최신 구현입니다. | `campaignWorkflow.js` 저장 경로에서 문자 escape는 보강됐습니다. 다른 진입 HTML/모바일 화면도 해당 구현을 로드하는지 전체 화면별 런타임 검증은 별도입니다. |
| .NET `GetJsonServer()` 경로 | `Resource.js`의 현재 `Webtype`은 `Java`이며 프로젝트 런타임도 Spring/Tomcat이므로 현재 기본 CRM 구성에서 .NET 분기는 실행되지 않는 레거시 경로라는 판단은 타당합니다. | 다중 시스템 공용 배포나 향후 `Webtype` 변경이 없다면 현 작업의 우선 수정 대상에서는 제외할 수 있습니다. |
| 공통 alert와 호출부 alert | 공통 alert를 유지해야 오류 콜백을 전달하지 않는 호출부에서도 사용자에게 오류가 전달된다는 설명은 타당합니다. 반면 오류 콜백이 자체 alert를 띄우는 일부 호출에서는 중복될 수 있습니다. | 공통 alert를 일괄 제거하지 않습니다. 활성 호출부에서 이중 alert가 실제로 발생하는 경우에만 호출별 중복 책임을 정리합니다. |
| `_serialize(null)` 호환성 | 원본은 null에서 `constructor` 접근 예외로 직렬화가 중단됐고, 현재 구현은 null/undefined를 빈 문자열로 직렬화하여 해당 통신 중단은 막습니다. Java 컨트롤러는 문자열 요청을 Jackson `ObjectMapper`로 Map에 읽으므로 JSON 자체의 구문 수용과 null 방어 방향은 합리적입니다. | 빈 문자열은 null과 의미가 다를 수 있으므로 nullable 업무 필드의 서버 기본값/쿼리 바인딩 동작까지 동일하다고 단정하지 않습니다. null을 보내는 실제 활성 요청이 있는지 확인하고 의미상 회귀가 우려되는 필드만 검토합니다. |

현재 정적 검토에서는 Step 6-5 변경을 반영해 null 응답 처리와 `Json2Str` 중복 정의 문제는 해결된 것으로 판단합니다. stale 응답의 무조건 `$.unblockUI()`는 효과가 있으나 전역 잠금 간섭 위험이 남아 있어 “안전하게 완료”된 것으로 판정하지 않습니다. 이 후속 검토에서도 소스 수정, 테스트 실행, Eclipse GUI Problems 확인은 하지 않았습니다.
