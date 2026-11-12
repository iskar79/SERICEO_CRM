package co.kr.kydbm.common.crypto;

import org.apache.log4j.Logger;

import com.ksign.sdb.api.KSSecurityFactory;
import com.ksign.sdb.api.SDBApi;
import com.ksign.sdb.api.config.APIConfig;
import com.ksign.sdb.api.KSException;
import com.ksign.sdb.common.util.Data;

import co.kr.kydbm.core.utils.ConfigProperties;

/**
 * 20261112 khma : KSign SecureDB Java API V2 공통 암복호화 서비스 클래스 신규 작성
 * - SecureDB Java API V2 개발자 가이드 및 공식 Sample.java 표준 패턴 100% 준수
 * - KSSecurityFactory 기반 SDBApi 싱글턴 인스턴스 관리 및 DEK 주기적 자동 동기화
 * - 대칭키 암호화(AES256_DEV), 복호화('$.' 접두어 방어), 단방향 HASH NTS 색인 검색 토큰 생성
 * - KSign Agent 미기동 로컬 개발/테스트 환경 대응 Fallback(Bypass) 안전장치 내장
 */
public class CryptoService {

    private static final Logger log = Logger.getLogger(CryptoService.class);
    private static CryptoService instance = null;

    private SDBApi sdbApi = null;
    private boolean isAvailable = false;

    // 기본 정책명 (properties 설정값 우선, 미설정 시 Fallback 기본값)
    private String policyCipher = "AES256_DEV";
    private String policyHash = "SHA512_DEV";

    /**
     * 기본 생성자: 프로퍼티 설정을 로드하고 SecureDB 에이전트를 초기화한다.
     */
    private CryptoService() {
        init();
    }

    /**
     * CryptoService 싱글턴 인스턴스를 반환한다.
     * @return CryptoService 인스턴스
     */
    public static synchronized CryptoService getInstance() {
        if (instance == null) {
            instance = new CryptoService();
        }
        return instance;
    }

    /**
     * 20261112 khma : SecureDB Java API V2 에이전트 초기화 (공식 Sample.java 패턴 준수)
     */
    private void init() {
        try {
            ConfigProperties prop = ConfigProperties.getInstance();

            String agentHome  = prop.getProperty("securedb.agent.home");
            String agentIp    = prop.getProperty("securedb.agent.ip");
            String agentPort  = prop.getProperty("securedb.agent.port");
            String confCipher = prop.getProperty("securedb.policy.cipher");
            String confHash   = prop.getProperty("securedb.policy.hash");
            String interval   = prop.getProperty("securedb.sync.interval");

            if (confCipher != null && !confCipher.trim().isEmpty()) {
                this.policyCipher = confCipher.trim();
            }
            if (confHash != null && !confHash.trim().isEmpty()) {
                this.policyHash = confHash.trim();
            }

            int port = 9909;
            if (agentPort != null && !agentPort.trim().isEmpty()) {
                try {
                    port = Integer.parseInt(agentPort.trim());
                } catch (NumberFormatException e) {
                    port = 9909;
                }
            }

            int syncInterval = 10;
            if (interval != null && !interval.trim().isEmpty()) {
                try {
                    syncInterval = Integer.parseInt(interval.trim());
                } catch (NumberFormatException e) {
                    syncInterval = 10;
                }
            }

            // 1. APIConfig 설정 (Sample.java 기준)
            APIConfig config = APIConfig.getInstance();
            if (Data.isEmpty(config.getAppHome())) {
                config.setAgentHome(agentHome != null && !agentHome.trim().isEmpty() ? agentHome.trim() : "../");
            }
            if (config.getFirstPort() < 1) {
                config.setFirstPort(port);
            }
            if (agentIp != null && !agentIp.trim().isEmpty()) {
                config.setFirstIp(agentIp.trim());
            }

            // 2. 주기적 DEK 키 자동 동기화 설정 (기본 10분)
            config.setIntervalValue(syncInterval);
            config.setIntervalUnit("MINUTES");

            // 3. SDBApi 싱글턴 인스턴스 취득
            this.sdbApi = KSSecurityFactory.getInstance(config);

            // 4. 에이전트 상태 점검 및 헬스체크
            if (this.sdbApi != null) {
                String status = this.sdbApi.checkAgent();
                log.info("20261112 khma : SecureDB Agent 초기화 완료. 상태: " + status);
                this.isAvailable = true;
            }

        } catch (Throwable t) {
            // 에이전트 미기동 또는 로컬 개발 환경 대응 Fallback
            this.isAvailable = false;
            this.sdbApi = null;
            log.warn("20261112 khma : SecureDB Agent 연결 실패 (로컬 Fallback 모드로 동작합니다): " + t.getMessage());
        }
    }

    /**
     * SecureDB 에이전트 가용 여부를 반환한다.
     * @return 가용 상태 (true: 정상 연동, false: Fallback 모드)
     */
    public boolean isAvailable() {
        return this.isAvailable && this.sdbApi != null;
    }

    /**
     * 20261112 khma : 평문 문자열 대칭키 암호화 (기본 정책 사용)
     * @param plainText 평문 문자열
     * @return 암호문 문자열 ('$.' 접두어 포함)
     */
    public String encrypt(String plainText) {
        return encrypt(plainText, this.policyCipher);
    }

    /**
     * 20261112 khma : 평문 문자열 대칭키 암호화 (정책명 지정)
     * @param plainText 평문 문자열
     * @param policy 정책명
     * @return 암호문 문자열
     */
    public String encrypt(String plainText, String policy) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        // 이미 SecureDB 암호문('$.')인 경우 중복 암호화 방지
        if (plainText.startsWith("$.")) {
            return plainText;
        }
        if (isAvailable()) {
            try {
                String cipherText = this.sdbApi.encrypt(plainText, policy != null ? policy : this.policyCipher);
                if (cipherText != null && !cipherText.isEmpty()) {
                    return cipherText;
                }
            } catch (KSException e) {
                log.error("20261112 khma : SecureDB 암호화 처리 중 오류 발생 (원문 반환)", e);
            }
        }
        return plainText;
    }

    /**
     * 20261112 khma : 감사 정보(IP, 사용자식별자)를 포함한 대칭키 암호화
     * @param plainText 평문 문자열
     * @param clientIp 요청자 IP
     * @param userId 사용자 ID
     * @return 암호문 문자열
     */
    public String encrypt(String plainText, String clientIp, String userId) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        if (plainText.startsWith("$.")) {
            return plainText;
        }
        if (isAvailable()) {
            try {
                String ip = (clientIp != null && !clientIp.isEmpty()) ? clientIp : "127.0.0.1";
                String user = (userId != null && !userId.isEmpty()) ? userId : "SYSTEM";
                String cipherText = this.sdbApi.encrypt(plainText, this.policyCipher, ip, user, "SERICEO_CRM");
                if (cipherText != null && !cipherText.isEmpty()) {
                    return cipherText;
                }
            } catch (KSException e) {
                log.error("20261112 khma : SecureDB 감사정보 암호화 처리 중 오류 발생 (원문 반환)", e);
            }
        }
        return plainText;
    }

    /**
     * 20261112 khma : 암호문 문자열 대칭키 복호화 (기본 정책 사용)
     * @param cipherText 암호문 문자열 ('$.' 로 시작해야 복호화 대상)
     * @return 복호화된 평문 문자열
     */
    public String decrypt(String cipherText) {
        return decrypt(cipherText, this.policyCipher);
    }

    /**
     * 20261112 khma : 암호문 문자열 대칭키 복호화 (정책명 지정)
     * @param cipherText 암호문 문자열
     * @param policy 정책명
     * @return 복호화된 평문 문자열
     */
    public String decrypt(String cipherText, String policy) {
        if (cipherText == null || cipherText.isEmpty()) {
            return cipherText;
        }
        // SecureDB 표준 암호문 식별자 '$.' 로 시작하지 않으면 이미 평문이므로 그대로 반환 (평문/암호문 혼재 방어)
        if (!cipherText.startsWith("$.")) {
            return cipherText;
        }
        if (isAvailable()) {
            try {
                String restoredText = this.sdbApi.decrypt(cipherText, policy != null ? policy : this.policyCipher);
                if (restoredText != null) {
                    return restoredText;
                }
            } catch (KSException e) {
                log.error("20261112 khma : SecureDB 복호화 처리 중 오류 발생 (원문 반환)", e);
            }
        }
        return cipherText;
    }

    /**
     * 20261112 khma : 감사 정보(IP, 사용자식별자)를 포함한 대칭키 복호화
     * @param cipherText 암호문 문자열
     * @param clientIp 요청자 IP
     * @param userId 사용자 ID
     * @return 복호화된 평문 문자열
     */
    public String decrypt(String cipherText, String clientIp, String userId) {
        if (cipherText == null || cipherText.isEmpty()) {
            return cipherText;
        }
        if (!cipherText.startsWith("$.")) {
            return cipherText;
        }
        if (isAvailable()) {
            try {
                String ip = (clientIp != null && !clientIp.isEmpty()) ? clientIp : "127.0.0.1";
                String user = (userId != null && !userId.isEmpty()) ? userId : "SYSTEM";
                String restoredText = this.sdbApi.decrypt(cipherText, this.policyCipher, ip, user, "SERICEO_CRM");
                if (restoredText != null) {
                    return restoredText;
                }
            } catch (KSException e) {
                log.error("20261112 khma : SecureDB 감사정보 복호화 처리 중 오류 발생 (원문 반환)", e);
            }
        }
        return cipherText;
    }

    /**
     * 20261112 khma : 단방향 HASH 완전 일치 NTS 색인 검색 토큰 생성 (_HASH 컬럼 저장 및 = 검색용)
     * @param plainText 평문 검색어/데이터
     * @return NTS 해시 토큰 문자열
     */
    public String getNts(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        if (isAvailable()) {
            try {
                return this.sdbApi.nts(this.policyHash, plainText, "UTF-8");
            } catch (Throwable t) {
                log.error("20261112 khma : NTS 토큰 생성 실패", t);
            }
        }
        return plainText;
    }

    /**
     * 20261112 khma : 전방(접두) 검색용 NTS 패턴 토큰 생성 (LIKE '홍%')
     * @param prefix 검색 접두어
     * @return NTS_BSH 패턴 토큰 문자열
     */
    public String getNtsBsh(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            return prefix;
        }
        if (isAvailable()) {
            try {
                return this.sdbApi.nts_bsh(this.policyHash, prefix, "UTF-8");
            } catch (Throwable t) {
                log.error("20261112 khma : NTS_BSH 패턴 토큰 생성 실패", t);
            }
        }
        return prefix;
    }

    /**
     * 20261112 khma : 후방(접미) 검색용 NTS 패턴 토큰 생성 (LIKE '%동')
     * @param suffix 검색 접미어
     * @return NTS_FSH 패턴 토큰 문자열
     */
    public String getNtsFsh(String suffix) {
        if (suffix == null || suffix.isEmpty()) {
            return suffix;
        }
        if (isAvailable()) {
            try {
                return this.sdbApi.nts_fsh(this.policyHash, suffix, "UTF-8");
            } catch (Throwable t) {
                log.error("20261112 khma : NTS_FSH 패턴 토큰 생성 실패", t);
            }
        }
        return suffix;
    }

    /**
     * 암호화 정책명을 반환한다.
     * @return 대칭키 정책명
     */
    public String getPolicyCipher() {
        return this.policyCipher;
    }

    /**
     * HASH / NTS 정책명을 반환한다.
     * @return 단방향 해시 정책명
     */
    public String getPolicyHash() {
        return this.policyHash;
    }
}
