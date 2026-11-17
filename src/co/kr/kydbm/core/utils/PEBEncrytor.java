package co.kr.kydbm.core.utils;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

/**
 * 20261117 khma : 프로퍼티(jdbc.properties 등) Jasypt ENC(...) 암호화 문자열 생성 및 복호화 검증 유틸리티
 *
 * - 적용 대상: WebContent/WEB-INF/Monarch820-servlet.xml 의 configurationEncryptor 빈과 동일한 알고리즘(PBEWithMD5AndDES) 및 키(kydbmJasyptPass) 사용
 * - 실행 방법: 이클립스에서 본 파일 우클릭 -> [Run As] -> [Java Application] 실행
 * - 적용 방법: Console에 출력된 암호문을 jdbc.properties 에 ENC(출력값) 형태로 입력
 * - 참고 사항: Jasypt는 매 실행 시 랜덤 솔트(Salt)를 사용하므로 동일 평문이라도 실행할 때마다 출력 암호문이 달라지나, 복호화 결과는 동일함
 *
 * @author Ma KyoungHo
 * @company KYDBM
 */
public class PEBEncrytor {

	/**
	 * JDBC 접속 정보(URL, 계정, 비밀번호) Jasypt 암호화 및 복호화 검증 메인 메서드
	 * @param args 실행 인자 (미사용)
	 */
	public static void main(String[] args) {
		// 1. Monarch820-servlet.xml 과 동일한 Jasypt 암호화기 및 패스워드 설정
		StandardPBEStringEncryptor pbeEnc = new StandardPBEStringEncryptor();
		pbeEnc.setAlgorithm("PBEWithMD5AndDES");
		pbeEnc.setPassword("kydbmJasyptPass");

		// 2. 암호화할 운영 DB 접속 정보 입력 후 실행 (필요 시 개발/타 환경 URL로 변경하여 사용)
		String plainUrl = "jdbc:oracle:thin:@26.2.51.37:1622:MICRODB";
		String plainUser = "crm";
		String plainPass = "crm00db";

		// 3. 암호화 수행 및 복호화 검증
		String encUrl = pbeEnc.encrypt(plainUrl);
		String decUrl = pbeEnc.decrypt(encUrl);
		String encUser = pbeEnc.encrypt(plainUser);
		String encPass = pbeEnc.encrypt(plainPass);

		// 4. Console 출력 결과를 jdbc.properties 에 ENC(...) 형식으로 반영
		System.out.println("jdbc.url=ENC(" + encUrl + ")");
		System.out.println("복호화 검증(URL): " + decUrl);
		System.out.println("jdbc.username=ENC(" + encUser + ")");
		System.out.println("jdbc.password=ENC(" + encPass + ")");
	}
}
