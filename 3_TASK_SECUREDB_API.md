# SecureDB 적용 방안 2: Java API 및 NTS 검색 토큰 기반 마이그레이션 가이드

본 문서는 SERICEO CRM 시스템에 개인정보 암호화를 적용할 때, DB 스키마를 변경하고 **Java WAS 메모리 상에서 API를 통해 암복호화 및 NTS(검색 토큰)를 처리하는 2안(가이드 정석)**의 세부 작업 가이드입니다.

---

## 1. 개요 및 아키텍처 원칙
* **개념**: DB는 암호문과 검색 해시 토큰만 저장하며, Java 코어 엔진(`MonArchDaoImpl`)이 데이터를 밀어넣기 전과 꺼낸 직후에 `SecureDB Java API V2`를 호출하여 처리하는 방식.
* **필요 라이브러리**: 멀티캠퍼스 보안팀(SecureDB 벤더사)으로부터 **`SecureDB Java API V2.jar`** 파일을 반드시 별도로 제공받아 프로젝트의 `WEB-INF/lib` 경로에 추가해야만 개발이 가능합니다.
* **적용 대상**: 전체 CRM 시스템 아키텍처 코어 엔진 및 데이터베이스 스키마.
* **장점**: 인덱스를 타는 초고속 검색(NTS)이 가능하여 DB 성능 저하가 전혀 없는 완벽한 아키텍처.
* **단점**: 공통 쿼리 모듈을 확장 및 연동해야 하므로 개발 난이도와 통합 테스트 부담이 매우 큼.

## 2. 세부 액션 플랜 (To-Do List)

### ① DB 스키마(테이블) 변경 및 데이터 마이그레이션
부분 검색(`LIKE`)이 필요한 암호화 대상 컬럼에 대해 NTS 전용 컬럼을 물리적으로 추가합니다.
* **대상 테이블**: `M_CUST`, `M_USER` 등
* **스키마 추가**: `CSTNAME_NTS` (고객명 검색 토큰), `EMAIL_NTS` (이메일 검색 토큰) 컬럼 추가.
* **초기 데이터 이행**: 기존 데이터를 Java API 배치 또는 DB 프로시저를 통해 암호화 및 NTS 토큰 생성 후 적재.

### ② Java 공통 쿼리 엔진(`MonArchDaoImpl.java`) 확장 및 연동 가이드
경로: `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java`

**1. 파라미터 암호화 (INSERT/UPDATE 전처리)**
`SvcCRUD`에서 넘어온 파라미터 맵을 가로채서 API를 태웁니다.
```java
// [추가할 코드] 파라미터 Map 루프 돌며 암호화 대상 컬럼 찾기
for (Map.Entry<String, Object> entry : paramMap.entrySet()) {
    String key = entry.getKey();
    String value = (String) entry.getValue();
    
    // 이메일이나 이름이면 암호화
    if (key.equals("EMAIL") || key.equals("CSTNAME")) {
        String encryptedValue = SecureDbApi.encrypt(value, "AES256_DEV");
        paramMap.put(key, encryptedValue);
    }
}
```

**2. 결과 복호화 (SELECT 후처리)**
DB에서 리턴받은 `ResultSet`에서 데이터를 뽑을 때 평문으로 바꿉니다.
```java
// [추가할 코드] ResultSet 추출 시
String email = rs.getString("EMAIL");
if (email != null && !email.equals("")) {
    email = SecureDbApi.decrypt(email, "AES256_DEV");
    resultMap.put("EMAIL", email);
}
```

### ③ Java 동적 검색 필터 엔진(`FilterGenerator.java`) 확장 및 연동 가이드
경로: `src/co/kr/kydbm/core/dao/FilterGenerator.java`

사용자가 검색창에 키워드를 입력했을 때, 해시 토큰으로 변환하는 로직입니다.
```java
// [추가할 코드] 동적 WHERE 검색 조건 생성 시
if (fieldName.equals("CSTNAME") || fieldName.equals("EMAIL")) {
    // 1. 일반 검색어를 NTS 검색 해시 토큰으로 변환
    String ntsToken = SecureDbApi.nts_bsh(searchValue);
    
    // 2. 검색 대상 컬럼명을 NTS 컬럼명으로 강제 변경
    String ntsColumnName = fieldName + "_NTS"; 
    
    // 3. 기존 LIKE 구문 대신 NTS 토큰 검색 구문으로 대체하여 반환
    whereClause.append(" AND " + ntsColumnName + " = '" + ntsToken + "' ");
}
```

### ④ 핵심: 쿼리 원문(M_SERVICE) 무수정 런타임 치환 기법
2안(API)의 최대 장점인 **"기존 DB 쿼리(M_SERVICE) 원본을 1건도 수정하지 않는다"**는 원칙을 지키기 위해, 동적 필터가 아닌 하드코딩된 쿼리의 경우 `MonArchDaoImpl.java`에서 DB로 쿼리를 날리기 직전에 메모리 상에서 정규식(Regex)으로 SQL을 가로채어 변환합니다.

```java
// MonArchDaoImpl.java 내 쿼리 실행 직전 로직
// 기존 쿼리에 하드코딩된 LIKE 구문을 NTS 토큰 일치 구문으로 런타임에 동적 치환 (DB 수정 제로화)
if (query.contains("CSTNAME") || query.contains("EMAIL")) {
    query = query.replaceAll(
        "(?i)UPPER\\(\\w+\\.CSTNAME\\)\\s*LIKE\\s*'%('\\s*\\|\\|\\s*UPPER\\(@CSTNAME@\\)\\s*\\|\\|\\s*')%'", 
        "CSTNAME_NTS = @CSTNAME_NTS@"
    );
    // email 등 다른 컬럼도 동일하게 정규식 치환
}
```

## 3. 테스트 및 검증 계획
* **쿼리 무수정 원칙 검증**: `M_SERVICE` 테이블을 단 1건도 업데이트하지 않은 상태에서, Java 코어 엔진의 치환만으로 NTS 토큰 검색이 정상 수행되는지 전수 테스트.
* 기존 `FilterGenerator` 로직에 영향을 주어 개인정보가 아닌 일반 검색(예: 부서명 검색)이 오작동하지 않는지 회귀 테스트(Regression Test) 필수.
* `ExcelDownload` 등 대용량 데이터 추출 시 Java API 병목 현상(메모리 누수 등) 점검.
