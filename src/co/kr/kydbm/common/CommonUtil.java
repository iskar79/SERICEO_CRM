package co.kr.kydbm.common;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;

import co.kr.kydbm.core.utils.MonarchSecurity;

/**
 * 공통 유틸 클래스
 * 
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */

public class CommonUtil {
	public static Object nvl(Object inValue, Object defaultValue) {
		if (inValue == null) {
			return defaultValue;
		}
		return inValue;
	}

	public static String nvl(String inValue, String defaultValue) {
		if (inValue == null) {
			if (null == defaultValue) {
				return "";
			} else {
				return defaultValue;
			}
		}

		return inValue;
	}

	public static String parsingForJonType(String xmlParams) {
		String rstData = xmlParams;
		rstData = rstData.replaceAll("\\n", "\\\\n");
		rstData = rstData.replaceAll("\\t", "\\\\t");
		return rstData;
	}

	/**
	 * 바이트로 계산하여 subString을 하는 메소드
	 * 
	 * @param str
	 * @param startIndex
	 * @param length
	 * @return
	 */
	public static String subString(String str, int stPoint, int length) {
		// TODO Auto-generated method stub
		char[] arrChar = str.toCharArray();
		int kor2ByteCnt = 0;
		int kor3ByteCnt = 0;
		int edPoint = length;
		int realStPoint = 0;
		int realEdPoint = 0;
		int byteLen = str.getBytes().length;
		for (int j = 0; j < arrChar.length; j++) {
			char c = arrChar[j];
			int size = String.valueOf(c).getBytes().length;

			if (size > 1) {
				kor2ByteCnt += 2;
				kor3ByteCnt += size;
			} else {
				kor2ByteCnt++;
				kor3ByteCnt++;
			}

			// 바이트가 1보다 크면 한글로 간주2바이트로 계산한다.
			if (kor2ByteCnt == stPoint) {
				realStPoint = kor3ByteCnt;
				break;
			}
		}
		String clipStr = new String(str.getBytes(), realStPoint, byteLen
				- realStPoint);
		arrChar = clipStr.toCharArray();
		kor2ByteCnt = 0;
		kor3ByteCnt = 0;
		for (int j = 0; j < arrChar.length; j++) {

			char c = arrChar[j];
			int size = String.valueOf(c).getBytes().length;
			// 바이트가 1보다 크면 한글로 간주2바이트로 계산한다.
			if (size > 1) {
				kor2ByteCnt += 2;
				kor3ByteCnt += size;
			} else {
				kor2ByteCnt++;
				kor3ByteCnt++;
			}

			if (kor2ByteCnt == edPoint) {
				realEdPoint = kor3ByteCnt;
				break;
			}
		}

		return new String(clipStr.getBytes(), 0, realEdPoint);
	}

	/**
	 * 파일의 확장자를 취득하는 메소드
	 * 
	 * @param fileName
	 * @return
	 */
	public static String getSuffix(String fileName) {
		if (fileName == null)
			return null;
		int point = fileName.lastIndexOf(".");
		if (point != -1) {
			return fileName.substring(point + 1);
		}
		return fileName;
	}

	public static String getDisposition(String filename, String browser)
			throws Exception {
		String dispositionPrefix = "attachment;filename=";
		String encodedFileName = null;

		if (browser.equals("MSIE")) {
			encodedFileName = URLEncoder.encode(filename, "UTF-8").replaceAll(
					"\\+", "%20");
		} else if (browser.equals("FireFox")) {
			encodedFileName = "\""
					+ new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Opera")) {
			encodedFileName = "\""
					+ new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Chrome")) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < filename.length(); i++) {
				encodedFileName = "\""
						+ new String(filename.getBytes("UTF-8"), "ISO-8859-1")
						+ "\"";

			}
		} else {
			throw new RuntimeException("Not Supported browser");
		}

		return dispositionPrefix + encodedFileName;
	}

	public static String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.indexOf("MSIE") > -1) {
			return "MSIE";
		} else if (header.indexOf("Chrome") > -1) {
			return "Chrome";
		} else if (header.indexOf("Opera") > -1) {
			return "Opera";
		}
		return "FireFox";
	}

	/**
	 * OrderBy의 치환처리시 첫공백까지 잘라냄
	 * 
	 * @param targetOrdserStr
	 * @param versionType
	 *            {order: 구버전, sort: 신버전}
	 * @return
	 */
	public static String getOrderByStatement(String targetOrdserStr) {
		String orderStr = "";
		
		if(StringUtils.isNotEmpty(targetOrdserStr)){
			
			String[] arrOrder = targetOrdserStr.split("/");
			String name;
			String sorting;
			int spacePoint = -1; // -1보다 크면 공백이 존재하는 포인트
			for (int i = 0; i < arrOrder.length; i++) {
				String[] prop = arrOrder[i].split(",");
				name = prop[0].split(":")[1];
				spacePoint = name.indexOf(" ");
				if (-1 < spacePoint) {
					name = name.substring(0, spacePoint);
				}
				// 불필요한 명령어와 연산자를 정규식 등으로 걸러낸다. 주로 공격하는 명령어 : HAVING, UNION, INSERT
				String regex = "[^\\p{Alnum}_]|having|HAVING|union|UNION|insert|INSERT|delete|DELETE";
				name = MonarchSecurity.makeSecureString(name, name.length(), /*정규식*/regex);
				sorting = prop[1].split(":")[1];
				orderStr += name + " ";
				if ("D".equals(sorting)) {
					orderStr += "DESC";
				} else {
					orderStr += "ASC";
				}
				if (i != arrOrder.length - 1) {
					orderStr += ",";
				}
			}
			
		} else {
			orderStr = targetOrdserStr;
		}

		return orderStr;
	}

	/**
	 * 현재메소드명 취득하기
	 * 
	 * @return
	 */
	public static String getClassMethodName(int index) {
		StackTraceElement[] ste = new Throwable().getStackTrace();
		// return ste[2].getClassName() + "." + ste[2].getMethodName();
		return ste[2].getMethodName();
	}

	/**
	 * InputStream을 바이트배열로 변환
	 * 
	 * @param is
	 * @return byte[]
	 * @since 2013-12-31
	 * @author KyoungHo_Ma
	 */
	public static byte[] getByteArray(InputStream is) {
		ByteArrayOutputStream b = new ByteArrayOutputStream();
		OutputStream os = new BufferedOutputStream(b);
		int c;
		try {
			while ((c = is.read()) != -1) {
				os.write(c);
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (os != null) {
				try {
					os.flush();
					os.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return b.toByteArray();
	}

	/**
	 * 확장자 체크
	 * 
	 * @param fileName
	 * @param whiteList
	 * @return
	 */
	public static boolean checkExtender(String fileName, String[] whiteList) {
		String targetExt = CommonUtil.getSuffix(fileName);
		boolean rst = false;
		for (String extender : whiteList) {
			
			if ((extender.toUpperCase()).equals(targetExt.toUpperCase())) {
				rst = true;
			}
		}
		return rst;
	}

	public static Map<String, Object> JsonToMap(String json)
			throws JsonParseException, JsonMappingException, IOException {
		ObjectMapper om = new ObjectMapper();
		Map<String, Object> obj;
		// om.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		// om.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER,true);
		om.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
		obj = om.readValue(json, new TypeReference<Map<String, Object>>() {
		}); // 맵으로 가져옴
		return obj;
	}

	/**
	 * 헤더정보로 멥핑
	 * 
	 * @param SqlCommand
	 * @param mapParam
	 * @return
	 */
	public static String replaceNameTemplateType(String SqlCommand,
			ArrayList<String> hdColsNameList) {
		String rstSql = SqlCommand;
		for (String colName : hdColsNameList) {
			rstSql = rstSql.replace("@" + colName + "@", ":" + colName);
		}
		rstSql = rstSql.replace("@UID@", ":UID");
		rstSql = rstSql.replace("@ULID@", ":ULID");
		rstSql = rstSql.replace("@USITE@", ":USITE");
		return rstSql;
	}

	/**
	 * 받은 인자값이 숫자 형식인지 구분한다.
	 * @param data
	 * @return
	 */
	public static boolean isNumber(Object data) {
		//todo 첫번째문자가 0이고 소수점형식의 숫자타입이 아닐때는 false
		if (NumberUtils.isNumber(data.toString())) {
			if ( data.toString().matches("0.+")) {
				if ( !data.toString().matches("^0(\\.[0-9]+)") ) {
					return false;
				}
			}
			return true;
		}
		else {
			return false;
		}
	}
	
	/**
	 * 확장클래스 명이 존재하는지 확인
	 * @param classes
	 * @param targetClassName
	 */
	public static boolean checkExtClass(String[] classes, String targetClassName) {
		
		boolean checkRst = false;
		
		for (String clsName : classes) {
			if(clsName.equals(targetClassName)) {
				checkRst  =true;
				break;
			}
		}
		
		return checkRst;
	}
}
