# SecureDB 적용 방안 1: DB UDF(Plugin) 중심 마이그레이션 가이드

본 문서는 SERICEO CRM 시스템에 개인정보 암호화를 적용할 때, Java 코어 프레임워크의 수정을 최소화하고 **DB 함수(UDF)를 활용하여 SQL 레벨에서 암복호화를 처리하는 1안**의 세부 작업 가이드입니다.

---

## 1. 개요 및 아키텍처 원칙
* **개념**: DB에 저장된 `M_SERVICE` 쿼리 템플릿과 Java 소스 내 하드코딩된 쿼리에 암호화(`encrypt`), 복호화(`decrypt`) DB 함수를 직접 Wrapping하는 방식.
* **적용 대상**: 고객 정보(이름, 이메일, 전화번호 등)를 조회/수정/삽입하는 모든 서비스.
* **장점**: Java 코어 엔진(`MonArchDaoImpl`, `SvcCRUD`)을 수정할 필요가 없어 시스템 크리티컬 오류(사이드 이펙트) 발생 위험이 낮음.
* **단점**: 부분 검색(`LIKE`) 시 인덱스를 타지 못해 Full Table Scan이 발생하여 DB 부하가 있을 수 있음 (단, 데이터가 10만 건 미만일 경우 감수 가능한 수준).

## 2. 세부 액션 플랜 (To-Do List)

### ① DB 메타데이터(`M_SERVICE`) 마이그레이션 가이드 (DBA 작업)
CRM 데이터베이스의 `M_SERVICE` 테이블에 저장된 SQL 템플릿들을 전수 조사하여 복사/붙여넣기 형태로 함수를 감싸야 합니다.

**[예제 1] SELECT 절 (조회 화면 복호화 - 운영 `A_USER` / `US_USER` 기준)**
* **수정 대상**: DB의 `M_SERVICE` 테이블 (서비스명이 회원조회/회원리스트인 레코드)
```sql
-- [기존 쿼리] (운영 A_USER 테이블 기준)
SELECT USEQ, LOGINID, NAME, EMAIL, SUBEMAIL, TELNO, MTELNO, ADDRESS1, ADDRESS2
FROM A_USER
WHERE SITE = @SITE@ AND USEQ = @USEQ@

-- [수정 쿼리] (성명, 이메일, 전화번호, 상세주소를 평문으로 보여주기 위해 복호화 UDF 래핑)
SELECT 
    USEQ,
    LOGINID,
    dbsecnew.sdb_crypto.decrypt(NAME, 'AES256_DEV') AS NAME, 
    dbsecnew.sdb_crypto.decrypt(EMAIL, 'AES256_DEV') AS EMAIL,
    dbsecnew.sdb_crypto.decrypt(SUBEMAIL, 'AES256_DEV') AS SUBEMAIL,
    dbsecnew.sdb_crypto.decrypt(TELNO, 'AES256_DEV') AS TELNO,
    dbsecnew.sdb_crypto.decrypt(MTELNO, 'AES256_DEV') AS MTELNO,
    ADDRESS1,
    dbsecnew.sdb_crypto.decrypt(ADDRESS2, 'AES256_DEV') AS ADDRESS2
FROM A_USER
WHERE SITE = @SITE@ AND USEQ = @USEQ@
```

**[예제 2] INSERT / UPDATE 절 (저장 화면 암호화 - 운영 `A_USER` / `A_FAMILY` 기준)**
* **수정 대상**: DB의 `M_SERVICE` 테이블 및 엑셀 업로드 프로시저(`USP_USER_UPDATE_EXUPLOAD`, `USP_USER_EXUPLOAD`)
```sql
-- [기존 쿼리]
UPDATE A_USER SET EMAIL = @EMAIL@, MTELNO = @MTELNO@ WHERE USEQ = @USEQ@

-- [수정 쿼리] (화면에서 넘어온 개인정보 데이터를 암호화해서 DB에 반영)
UPDATE A_USER SET 
    EMAIL = dbsecnew.sdb_crypto.encrypt(@EMAIL@, 'AES256_DEV'),
    MTELNO = dbsecnew.sdb_crypto.encrypt(@MTELNO@, 'AES256_DEV')
WHERE USEQ = @USEQ@
```

**[예제 3] WHERE 절 (조건 검색)**
* **수정 대상**: DB의 `M_SERVICE` 테이블 (서비스명이 회원리스트인 레코드)
```sql
-- [기존 쿼리]
AND NAME LIKE '%' || @NAME@ || '%'
-- [수정 쿼리] (암호화된 컬럼을 복호화해서 LIKE 검색 - 성능 이슈 주의, NTS 토큰 병행 권장)
AND dbsecnew.sdb_crypto.decrypt(NAME, 'AES256_DEV') LIKE '%' || @NAME@ || '%'
```

### ③ 운영 스토어드 프로시저(`운영쿼리정보/`) 내 UDF 적용 가이드 (DBA/개발 공동 작업)
1. **엑셀 회원 일괄수정/대량업로드 프로시저 (`USP_USER_UPDATE_EXUPLOAD`, `USP_USER_EXUPLOAD`)**:
   * `M_EXUP_TEMP`에서 값을 읽어 `REGEXP_REPLACE` 등으로 전화번호/성명 정제 직후 `A_USER` 및 `A_FAMILY`(`SEC`, `TAX`, `REC`)에 `UPDATE`/`INSERT` 할 때 `dbsecnew.sdb_crypto.encrypt(v_휴대전화번호, 'AES256_DEV')` 함수를 적용해야 합니다.
2. **일일 마트 집계 프로시저 (`USP_M_CONT_USE_STATUS`)**:
   * `A_USER`와 `A_FAMILY`의 암호화된 컬럼이 `US_USER` 테이블로 그대로 이관되므로, `US_USER`를 조회하는 `M_SERVICE` 쿼리에서도 `A_USER`와 동일하게 `decrypt` UDF를 적용해야 합니다.

### ② Java 내부 하드코딩 쿼리 추적 및 수정 가이드 (Java 개발)
`M_SERVICE`를 타지 않고 Java 코드 내에 문자열로 직접 쿼리를 박아둔 소스들을 찾아 수정해야 합니다. 
아래 경로의 소스 파일을 열어서 `SELECT` 또는 `INSERT` 문자열 내부에 UDF 함수를 직접 타이핑해 넣으세요.

1. **메일 발송 서버 모듈 (`MailServiceController.java`)**
   * **수정 대상 파일**: `src/co/kr/kydbm/mail/MailServiceController.java` (약 405라인 부근 `INSERT` 문자열)
   * 작업 내용: 메일 발송 큐(`MC_INDV_EMAIL`)에 수신자 이메일 주소를 `INSERT` 하는 부분에 `dbsecnew.sdb_crypto.encrypt` 적용.
2. **로그인 세션 인증 모듈 (`MonArchDaoImpl.java`)**
   * **수정 대상 파일**: `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java` (약 962라인 부근 `SELECT` 문자열)
   * 작업 내용: 유저 정보를 쿼리하는 `SELECT ... FROM 회원` 문자열에 사용자 이름 등을 `dbsecnew.sdb_crypto.decrypt` 적용.

## 3. 테스트 및 검증 계획
* DB 데이터 수동 암호화(초기 이행) 후, CRM 로그인 및 메인 화면 그리드 조회가 정상적으로 복호화되어 표시되는지 확인.
* 특정 고객 이름으로 '검색'을 수행하여 검색 지연 시간(Latency) 및 DB CPU 사용량 모니터링.
* 메일 발송 시 암호화된 이메일 주소가 정상적으로 복호화되어 발송되는지 테스트.
