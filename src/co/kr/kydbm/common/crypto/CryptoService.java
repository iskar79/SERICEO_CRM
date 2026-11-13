package co.kr.kydbm.common.crypto;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

import com.ksign.sdb.api.KSException;
import com.ksign.sdb.api.agentless.AgentlessApiFactory;
import com.ksign.sdb.api.config.AgentlessApiConfig;
import com.ksign.sdb.api.config.CertificateSource;
import com.ksign.sdb.api.config.TrustedCertificates;
import com.ksign.sdb.api.security.SDBAgentlessApi;

import co.kr.kydbm.core.utils.ConfigProperties;

/**
 * 20261113 khma : KSign SecureDB Agentless Java API V2 공통 암복호화 서비스 클래스
 * - AgentlessApiFactory 기반 SDBAgentlessApi 싱글턴 인스턴스 재사용 및 종료 시 리소스 정리(close)
 * - 대칭키 암호화(AES256_DEV), 복호화('$.' 접두어 방어), 단방향 HASH NTS 색인 검색 토큰 생성
 * - VDI/서버 네트워크 및 인증서 미구성 로컬 개발 환경 대응 Fallback(Bypass) 안전장치 내장
 */
public class CryptoService {

    private static final Logger log = Logger.getLogger(CryptoService.class);
    private static CryptoService instance = null;

    private SDBAgentlessApi sdbApi = null;
    private boolean isAvailable = false;

    // 기본 정책명 (properties 설정값 우선, 미설정 시 Fallback 기본값)
    private String policyCipher = "AES256_DEV";
    private String policyHash = "SHA512_DEV";

    /**
     * 기본 생성자: 프로퍼티 설정을 로드하고 SecureDB Agentless API 인스턴스를 초기화한다.
     */
    private CryptoService() {
        init();
        // 20261113 khma : WAS 종료 시 AutoCloseable 리소스 정상 해제
        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
            @Override
            public void run() {
                close();
            }
        }));
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
     * 20261113 khma : SecureDB Agentless Java API V2 초기화
     */
    private void init() {
        try {
            ConfigProperties prop = ConfigProperties.getInstance();

            String urlsProp   = prop.getProperty("securedb.agentless.urls");
            String shuffle    = prop.getProperty("securedb.agentless.shuffle");
            String apiToken   = prop.getProperty("securedb.agentless.token");
            String logLevel   = prop.getProperty("securedb.agentless.log.level");
            String caPath     = prop.getProperty("securedb.agentless.ca.path");
            String rootCaPath = prop.getProperty("securedb.agentless.rootca.path");
            String confCipher = prop.getProperty("securedb.policy.cipher");
            String confHash   = prop.getProperty("securedb.policy.hash");

            if (confCipher != null && !confCipher.trim().isEmpty()) {
                this.policyCipher = confCipher.trim();
            }
            if (confHash != null && !confHash.trim().isEmpty()) {
                this.policyHash = confHash.trim();
            }

            if (urlsProp == null || urlsProp.trim().isEmpty() || apiToken == null || apiToken.trim().isEmpty()) {
                this.isAvailable = false;
                this.sdbApi = null;
                log.warn("20261113 khma : SecureDB Agentless URL 또는 토큰 설정이 비어있어 Fallback 모드로 동작합니다.");
                return;
            }

            List<String> serverUrls = new ArrayList<String>();
            for (String u : urlsProp.split(",")) {
                if (u != null && !u.trim().isEmpty()) {
                    serverUrls.add(u.trim());
                }
            }

            boolean shuffleUrls = "true".equalsIgnoreCase(shuffle != null ? shuffle.trim() : "");
            String level = (logLevel != null && !logLevel.trim().isEmpty()) ? logLevel.trim() : "INFO";

            boolean hasCa = (caPath != null && !caPath.trim().isEmpty());
            boolean hasRootCa = (rootCaPath != null && !rootCaPath.trim().isEmpty());
            TrustedCertificates trustedCerts = null;
            if (hasCa && hasRootCa) {
                trustedCerts = TrustedCertificates.builder()
                        .ca(CertificateSource.path(caPath.trim()))
                        .rootCa(CertificateSource.path(rootCaPath.trim()))
                        .build();
            } else if (hasCa) {
                trustedCerts = TrustedCertificates.builder()
                        .ca(CertificateSource.path(caPath.trim()))
                        .build();
            } else if (hasRootCa) {
                trustedCerts = TrustedCertificates.builder()
                        .rootCa(CertificateSource.path(rootCaPath.trim()))
                        .build();
            }

            AgentlessApiConfig config = (trustedCerts != null)
                    ? AgentlessApiConfig.builder()
                            .serverUrls(serverUrls)
                            .shuffleServerUrls(shuffleUrls)
                            .apiToken(apiToken.trim())
                            .logLevel(level)
                            .trustedCertificates(trustedCerts)
                            .build()
                    : AgentlessApiConfig.builder()
                            .serverUrls(serverUrls)
                            .shuffleServerUrls(shuffleUrls)
                            .apiToken(apiToken.trim())
                            .logLevel(level)
                            .build();

            // 1. SDBAgentlessApi 싱글턴 인스턴스 생성
            this.sdbApi = AgentlessApiFactory.create(config);

            // 2. 정책 로드 상태 점검
            if (this.sdbApi != null) {
                String status = this.sdbApi.checkAgent();
                log.info("20261113 khma : SecureDB Agentless API 초기화 완료. 상태: " + status);
                this.isAvailable = true;
            }

        } catch (Throwable t) {
            // 네트워크 미연결 또는 인증서 미배치 환경 대응 Fallback
            this.isAvailable = false;
            this.sdbApi = null;
            log.warn("20261113 khma : SecureDB Agentless API 연결 실패 (Fallback 모드로 동작합니다): " + t.getMessage());
        }
    }

    /**
     * 20261113 khma : SDBAgentlessApi 리소스를 안전하게 해제한다.
     */
    public synchronized void close() {
        if (this.sdbApi != null) {
            try {
                this.sdbApi.close();
                log.info("20261113 khma : SecureDB Agentless API 리소스 해제 완료");
            } catch (Exception e) {
                log.warn("20261113 khma : SecureDB Agentless API 리소스 해제 중 오류: " + e.getMessage());
            } finally {
                this.sdbApi = null;
                this.isAvailable = false;
            }
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
