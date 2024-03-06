package co.kr.kydbm.core.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Monarch에 시큐어코딩 시 사용하는 클래스
 * 
 * @author KIM JUNGWON
 * 
 */
public class MonarchSecurity {

	private final static String UNSECURED_CHAR_REGULAR_EXPRESSION = "select|delete|update|insert|create|alter|drop";

	// private final static String UNSECURED_CHAR_REGULAR_EXPRESSION =
	// "[^\\p{Alnum}]|select|delete|update|insert|create|alter|drop";

	/**
	 * 입력값을 정규식을 이용해 필터링한 후 의심되는 부분을 없앤다.
	 * 
	 * @param str
	 * @param maxLength
	 * @return
	 */
	public static String makeSecureString(final String str, int maxLength, String regex) {

		Pattern unsecuredCharPattern = Pattern.compile(
				regex, Pattern.CASE_INSENSITIVE);

		String secureStr = str;
		if (0 < maxLength && str.length() > maxLength) {
			str.substring(0, maxLength);
		}
		Matcher matcher = unsecuredCharPattern.matcher(secureStr);
		return matcher.replaceAll("");
		
	}
	
	public static String makeSecureString(final String str, int maxLength) {
		return makeSecureString(str, maxLength, UNSECURED_CHAR_REGULAR_EXPRESSION) ;
	}
	

	/**
	 * XSS대응을 위한 위험요소문자들 변환 메소드
	 * 
	 * @param str
	 * @return
	 */
	public static String escapeHTML(String val) {
		if (val == null)
			return "";
		val = val.replaceAll("&", "&amp;");
		val = val.replaceAll("<", "&lt;");
		val = val.replaceAll(">", "&gt;");
		val = val.replaceAll("\"", "&quot;");
		val = val.replaceAll("'", "&apos;");
		return val;
	}

}
