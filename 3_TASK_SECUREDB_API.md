# SecureDB 적용 방안 2: Java API 및 NTS 검색 토큰 기반 마이그레이션 가이드

본 문서는 SERICEO CRM 시스템에 개인정보 암호화를 적용할 때, DB 스키마를 보완하고 **Java WAS 메모리 상에서 API를 통해 암복호화 및 NTS(검색 토큰)를 처리하는 2안(표준 권장)**의 세부 실무 작업 가이드입니다.

---

## 1. 개요 및 아키텍처 원칙
* **개념**: DB는 암호문과 검색 색인 토큰(NTS)을 보관하며, Java 코어 엔진(`MonArchDaoImpl`, `SvcCRUD`, `FilterGenerator`)이 데이터를 밀어넣기 전과 꺼낸 직후에 **`KSign SecureDB Java API V2`**를 호출하여 암/복호화 및 NTS 토큰 변환을 수행하는 방식입니다.
* **필요 라이브러리**:
  * `WebContent/WEB-INF/lib/` 경로에 벤더사 제공 **`ksign-sdb-api-v2.x.x.jar`** 배치.
* **핵심 장점**: 인덱스를 타는 초고속 검색(NTS 토큰)이 가능하여 DB 부하가 없고, WAS 계층에서 처리하므로 기간계 연계(CEODB)와의 암호화 키/정책 일치도가 완벽합니다.

---

## 2. [Step 1] 환경 설정 추가 (`src/monarch.properties`)

환경(개발/운영)에 따라 암호화 정책명이 달라지므로 `src/monarch.properties` 하단에 설정을 추가합니다:

```properties
####### KSign SecureDB 연동 설정 (20261001 khma) #######
# SecureDB Agent 데몬 접속 정보
securedb.agent.home = /opt/SecureDBAgent
securedb.agent.ip = 127.0.0.1
securedb.agent.port = 9909

# 암호화 정책명 (개발: AES256_DEV / 운영: AES256_PRD)
securedb.policy.cipher = AES256_DEV

# HASH 및 NTS 검색 정책명 (개발: SHA512_DEV / 운영: SHA512_PRD)
securedb.policy.hash = SHA512_DEV

# DEK 주기적 동기화 주기 (단위: MINUTES)
securedb.sync.interval = 10
#######################################################
```

---

## 3. [Step 2] 공통 암호화 서비스 클래스 신규 작성 (`CryptoService.java`)

WAS 기동 시 KSign SecureDB 인스턴스를 단 1회 안전하게 초기화하고, 싱글턴으로 암/복호화 및 NTS 검색 토큰을 손쉽게 호출하는 공통 유틸 클래스를 생성합니다.

* **대상 파일 (신규)**: `src/co/kr/kydbm/common/crypto/CryptoService.java`

```java
package co.kr.kydbm.common.crypto;

import org.apache.log4j.Logger;
import com.ksign.sdb.api.KSSecurityFactory;
import com.ksign.sdb.api.SDBApi;
import com.ksign.sdb.api.config.APIConfig;
import com.ksign.sdb.api.KSException;
import co.kr.kydbm.core.utils.ConfigProperties;

/**
 * 20261001 khma : SecureDB Java API V2 공통 암복호화 서비스 클래스 신규 작성
 * KSign SecureDB Agent 싱글턴 인스턴스 관리 및 NTS 검색 토큰 연동
 */
public class CryptoService {

    private static final Logger log = Logger.getLogger(CryptoService.class);
    private static CryptoService instance = null;
    private SDBApi sdbApi = null;

    private String policyCipher = "AES256_DEV";
    private String policyHash = "SHA512_DEV";

    private CryptoService() {
        init();
    }

    public static synchronized CryptoService getInstance() {
        if (instance == null) {
            instance = new CryptoService();
        }
        return instance;
    }

    /**
     * 20261001 khma : SecureDB 에이전트 초기화
     */
    private void init() {
        try {
            ConfigProperties prop = ConfigProperties.getInstance();
            String agentHome = prop.getProperty("securedb.agent.home");
            String agentIp   = prop.getProperty("securedb.agent.ip");
            String agentPort = prop.getProperty("securedb.agent.port");

            String confCipher = prop.getProperty("securedb.policy.cipher");
            String confHash   = prop.getProperty("securedb.policy.hash");

            if (confCipher != null && !"".equals(confCipher.trim())) {
                this.policyCipher = confCipher.trim();
            }
            if (confHash != null && !"".equals(confHash.trim())) {
                this.policyHash = confHash.trim();
            }

            int port = 9909;
            if (agentPort != null && !"".equals(agentPort.trim())) {
                port = Integer.parseInt(agentPort.trim());
            }

            // 1. 에이전트 환경 설정
            APIConfig config = APIConfig.getInstance();
            if (agentHome != null && !"".equals(agentHome.trim())) {
                config.setAgentHome(agentHome);
            }
            config.setFirstIp(agentIp != null ? agentIp : "127.0.0.1");
            config.setFirstPort(port);

            // 2. 주기적 DEK 동기화 설정 (10분 간격)
            config.setIntervalValue(10);
            config.setIntervalUnit("MINUTES");

            // 3. 싱글턴 API 취득
            this.sdbApi = KSSecurityFactory.getInstance(config);

            // 4. 에이전트 헬스체크
            String agentStatus = this.sdbApi.checkAgent();
            log.info("20261001 khma : SecureDB 에이전트 초기화 완료. 상태: " + agentStatus);

        } catch (Exception e) {
            log.error("20261001 khma : SecureDB 초기화 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 20261001 khma : 평문 문자열 암호화
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            if (sdbApi != null) {
                return sdbApi.encrypt(plainText, this.policyCipher);
            }
        } catch (KSException e) {
            log.error("20261001 khma : 암호화 실패: " + e.getMessage(), e);
        }
        return plainText;
    }

    /**
     * 20261001 khma : 암호문 문자열 복호화
     */
    public String decrypt(String cipherText) {
        if (cipherText == null || cipherText.isEmpty()) {
            return cipherText;
        }
        // SecureDB 암호문 식별자 '$.' 로 시작하지 않으면 이미 평문이거나 미암호화 데이터로 간주
        if (!cipherText.startsWith("$.")) {
            return cipherText;
        }
        try {
            if (sdbApi != null) {
                return sdbApi.decrypt(cipherText, this.policyCipher);
            }
        } catch (KSException e) {
            log.error("20261001 khma : 복호화 실패: " + e.getMessage(), e);
        }
        return cipherText;
    }

    /**
     * 20261001 khma : 단방향 HASH 완전일치 색인 토큰 생성
     */
    public String getNts(String data) {
        if (data == null || data.isEmpty()) return data;
        try {
            if (sdbApi != null) {
                return sdbApi.nts(this.policyHash, data, "UTF-8");
            }
        } catch (Exception e) {
            log.error("20261001 khma : NTS 토큰 생성 실패: " + e.getMessage(), e);
        }
        return data;
    }

    /**
     * 20261001 khma : 후방 검색(LIKE '값%') 패턴 토큰 생성 (BSH)
     */
    public String getNtsBsh(String prefix) {
        if (prefix == null || prefix.isEmpty()) return prefix;
        try {
            if (sdbApi != null) {
                return sdbApi.nts_bsh(this.policyHash, prefix, "UTF-8");
            }
        } catch (Exception e) {
            log.error("20261001 khma : NTS_BSH 패턴 생성 실패: " + e.getMessage(), e);
        }
        return prefix;
    }

    /**
     * 20261001 khma : 전방 검색(LIKE '%값') 패턴 토큰 생성 (FSH)
     */
    public String getNtsFsh(String suffix) {
        if (suffix == null || suffix.isEmpty()) return suffix;
        try {
            if (sdbApi != null) {
                return sdbApi.nts_fsh(this.policyHash, suffix, "UTF-8");
            }
        } catch (Exception e) {
            log.error("20261001 khma : NTS_FSH 패턴 생성 실패: " + e.getMessage(), e);
        }
        return suffix;
    }
}
```

---

## 4. [Step 3] Java 공통 쿼리 엔진(`MonArchDaoImpl.java`) 확장

* **대상 파일**: `src/co/kr/kydbm/core/dao/MonArchDaoImpl.java`

### 1) 파라미터 암호화 (INSERT/UPDATE 전처리)
`SvcCRUD`에서 전달된 파라미터 Map 중 개인정보 대상 컬럼을 가로채 암호화합니다:
```java
// 20261001 khma : 개인정보 컬럼 암호화 전처리
for (Map.Entry<String, Object> entry : paramMap.entrySet()) {
    String key = entry.getKey();
    Object val = entry.getValue();
    if (val instanceof String) {
        String strVal = (String) val;
        if ("EMAIL".equalsIgnoreCase(key) || "CSTNAME".equalsIgnoreCase(key) || "HP_NO".equalsIgnoreCase(key) || "TEL_NO".equalsIgnoreCase(key)) {
            paramMap.put(key, CryptoService.getInstance().encrypt(strVal));
        }
    }
}
```

### 2) 결과 복호화 (SELECT 후처리)
DB에서 반환된 `ResultSet` 또는 List<Map>에서 데이터를 추출할 때 복호화합니다:
```java
// 20261001 khma : 개인정보 컬럼 복호화 후처리
public Map<String, Object> decryptRow(Map<String, Object> rowMap) {
    if (rowMap == null) return null;
    String[] privacyCols = {"EMAIL", "CSTNAME", "HP_NO", "TEL_NO", "USER_NAME"};
    for (String col : privacyCols) {
        if (rowMap.containsKey(col) && rowMap.get(col) != null) {
            String cipherVal = rowMap.get(col).toString();
            rowMap.put(col, CryptoService.getInstance().decrypt(cipherVal));
        }
    }
    return rowMap;
}
```

---

## 5. [Step 4] 동적 검색 필터 엔진(`FilterGenerator.java`) NTS 토큰 연동

* **대상 파일**: `src/co/kr/kydbm/core/utils/FilterGenerator.java`

사용자가 그리드 상단 검색창에 검색어를 입력했을 때, 암호화 대상 컬럼에 대해 NTS 토큰 색인 검색 조건으로 자동 변환합니다:

```java
// 20261001 khma : 개인정보 검색 필터 NTS 토큰 변환 적용
if ("CSTNAME".equalsIgnoreCase(fieldName) || "EMAIL".equalsIgnoreCase(fieldName) || "HP_NO".equalsIgnoreCase(fieldName)) {
    // 1. 일반 검색어를 NTS 검색 해시 토큰으로 변환 (후방일치 BSH 또는 완전일치 NTS)
    String ntsToken = CryptoService.getInstance().getNtsBsh(searchValue);
    
    // 2. 검색 대상 컬럼명을 NTS 토큰 컬럼명으로 변경
    String ntsColumnName = fieldName + "_NTS"; 
    
    // 3. 인덱스를 타는 일치 검색 조건으로 변환
    whereClause.append(" AND ").append(ntsColumnName).append(" = '").append(ntsToken).append("' ");
}
```

---

## 6. [Step 5] 핵심: 쿼리 원문(`M_SERVICE`) 무수정 런타임 치환 기법

2안(API)의 최대 장점인 **"기존 DB 쿼리(M_SERVICE) 원본을 1건도 수정하지 않는다"**는 원칙을 위해, 하드코딩된 쿼리의 경우 `MonArchDaoImpl.java`에서 DB 실행 직전 메모리 상에서 정규식(Regex)으로 SQL을 가로채 변환합니다:

```java
// 20261001 khma : 기존 M_SERVICE LIKE 쿼리를 NTS 일치 검색으로 런타임 치환
if (query.contains("CSTNAME") || query.contains("EMAIL")) {
    query = query.replaceAll(
        "(?i)UPPER\\(\\w+\\.CSTNAME\\)\\s*LIKE\\s*'%('\\s*\\|\\|\\s*UPPER\\(@CSTNAME@\\)\\s*\\|\\|\\s*')%'", 
        "CSTNAME_NTS = @CSTNAME_NTS@"
    );
}
```

---

## 7. 테스트 및 검증 체크리스트

1. **에이전트 헬스체크 검증**:
   - WAS 기동 시 로그에 `SecureDB 에이전트 초기화 완료. 상태: OK` 출력 확인.
2. **평문/암호문 혼재 방어 검증**:
   - 이미 복호화된 데이터나 구형 평문 데이터가 들어와도 `$.` 접두어 체크로 인해 데이터 깨짐(Garbage)이 발생하지 않는지 확인.
3. **NTS 색인 검색 속도 검증**:
   - 고객 이름 및 연락처 검색 시 Full Table Scan 없이 인덱스를 타고 0.1초 내외로 반환되는지 확인.
4. **회귀 테스트**:
   - 개인정보가 아닌 일반 컬럼(부서명, 사번 등)의 기존 검색 기능이 정상 동작하는지 확인.
