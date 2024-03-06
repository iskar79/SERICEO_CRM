package co.kr.kydbm.core.utils;

import java.security.Security;

import javax.crypto.Cipher;

//import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.salt.RandomSaltGenerator;

public class PEBEncrytor {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		StandardPBEStringEncryptor pbeEnc = new StandardPBEStringEncryptor();
	    pbeEnc.setPassword("kydbmJasyptPass"); // PBE 값(Monarch815-servlet.xml XML PASSWORD설정)
	   // pbeEnc.setAlgorithm("PBEWithMD5AndTripleDES");
//	    String url = pbeEnc.encrypt("jdbc:mysql://218.151.225.146:3306/monarch815?allowMultiQueries=true");
//	    String url = pbeEnc.encrypt("jdbc:oracle:thin:@218.151.225.146:1521:MON");
	    String url = pbeEnc.encrypt("jdbc:oracle:thin:@182.198.77.11:1621:MICRODEV");
//	    String username = pbeEnc.encrypt("monarch_core");
	    String username = pbeEnc.encrypt("crm");
	    //String password = pbeEnc.encrypt("kydbm7206828");
	    String password = pbeEnc.encrypt("crm00db");

	    System.out.println(url);
	    System.out.println(username);
	    System.out.println(password);
	}
	

}
