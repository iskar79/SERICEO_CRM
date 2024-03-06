package co.kr.kydbm.core.utils;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.bean.FilterGeneratorBean;
import co.kr.kydbm.core.bean.UserInfo;

/**
 * 각 DB종류에 따른 쿼리 제너레이터 클래스
 * 
 * @author KyoungHo_Ma
 * @version 1.0.0 2013-11-07
 * @since version 1.0.0
 */

public class QueryGenerator {
	private static final String STRING_SEP_ORA = "||";
	private static final String STRING_SEP_PGSQL = "||";
	private static final String STRING_SEP_MSSQL = "+";
	private static final String STRING_SEP_MARIADB = ",";
	
	/**
	 * 시퀀스 호출문 제너레이터
	 * 
	 * @param dbtype
	 * @param seqName
	 * @return
	 */
	public static String genSequenceStmt(String dbtype, String seqName,
			boolean commaFlg) {
		String rstStmt="";
		
		if ((CommonConst.DB_TYPE.ORACLE.getVal()).equals(dbtype)) {
			rstStmt = seqName + ".NEXTVAL ";
		} else if ((CommonConst.DB_TYPE.POSTGRESQL.getVal()).equals(dbtype)) {
			rstStmt = " NEXTVAL('" + seqName + "') ";
		} else if ((CommonConst.DB_TYPE.MSSQL.getVal()).equals(dbtype)) {
			// MSSQL에는 NEXTVAL이 존재하지 않음.
		} else {
			// todo
		}

		rstStmt = settingComma(rstStmt, commaFlg); //콤마처리
		return rstStmt;
	}
	
	/**
	 * 시퀀스 컬럼명 제너레이터
	 * 
	 * @param dbtype
	 * @param seqName
	 * @return
	 */
	public static String genSequenceCol(String dbtype, String colName,
			boolean commaFlg) {
		String rstStmt="";
		
		if ((CommonConst.DB_TYPE.ORACLE.getVal()).equals(dbtype)) {
			rstStmt = colName;
		} else if ((CommonConst.DB_TYPE.POSTGRESQL.getVal()).equals(dbtype)) {
			rstStmt = colName;
		} else if ((CommonConst.DB_TYPE.MSSQL.getVal()).equals(dbtype)) {
			// MSSQL에는 NEXTVAL이 존재하지 않음.
		} else if ((CommonConst.DB_TYPE.MARIADB.getVal()).equals(dbtype)
				|| (CommonConst.DB_TYPE.MYSQL.getVal()).equals(dbtype)) {
			// MARIADB에는 NEXTVAL이 존재하지 않음.
		} else {
			// todo
		}
		
		rstStmt = settingComma(rstStmt, commaFlg); //콤마처리
		return rstStmt;
	}

	/**
	 * NVL(is null) 호출문 제너레이터
	 * @param dbtype
	 * @param colName
	 * @param exchangeVal
	 * @param commaFlg
	 * @return
	 */
	public static String genNvlStmt(String dbtype, String colName,
			String exchangeVal, String colType, boolean commaFlg) {

		String rstStmt = "";
		String fnName = "";

		if ((CommonConst.DB_TYPE.ORACLE.getVal()).equals(dbtype)) {
			fnName = "NVL";
		} else if ((CommonConst.DB_TYPE.POSTGRESQL.getVal()).equals(dbtype)) {
			fnName = "COALESCE";
		} else if ((CommonConst.DB_TYPE.MSSQL.getVal()).equals(dbtype)) {
			fnName = "ISNULL";
		}  else if ((CommonConst.DB_TYPE.MARIADB.getVal()).equals(dbtype)
				|| (CommonConst.DB_TYPE.MYSQL.getVal()).equals(dbtype)) {
			// MARIADB
			fnName = "IFNULL";
		} else {
			// 디폴트는 오라클
			fnName = "NVL";
		}
		rstStmt += fnName + "(" + colName +",";
		if(null != colType && !colType.equals("int")){
			rstStmt +="'" + exchangeVal  + "'";
		}else{
			rstStmt +=exchangeVal;
		}
		rstStmt += ")";

		rstStmt = settingComma(rstStmt, commaFlg); //콤마처리
		return rstStmt;
	}
	
	/**
	 * Sysdate 호출문 제너레이터
	 * @param dbtype
	 * @param commaFlg
	 * @return
	 */
	public static String genSysDate(String dbtype, boolean commaFlg) {

		String rstStmt = "";

		if ((CommonConst.DB_TYPE.ORACLE.getVal()).equals(dbtype)) {
			rstStmt = " SYSDATE ";
		} else if ((CommonConst.DB_TYPE.POSTGRESQL.getVal()).equals(dbtype)) {
			rstStmt = " CURRENT_TIMESTAMP(0) ";
		} else if ((CommonConst.DB_TYPE.MSSQL.getVal()).equals(dbtype)) {
			rstStmt = " GETDATE() ";
		} else if ((CommonConst.DB_TYPE.MARIADB.getVal()).equals(dbtype)
				|| (CommonConst.DB_TYPE.MYSQL.getVal()).equals(dbtype)) {
			rstStmt = " CURRENT_TIMESTAMP() ";
		} else {
			// 디폴트는 오라클
		}
		
		rstStmt = settingComma(rstStmt, commaFlg); //콤마처리
		return rstStmt;
	}
	
	/**
	 * 문자열 조합 기호 gen (||, +  등 db에 따라 다른내용)
	 * @param dbtype
	 * @return
	 */
	public static String genStrSeperator(String dbtype) {
		String rstStmt = "";
		if ((CommonConst.DB_TYPE.ORACLE.getVal()).equals(dbtype)) {
			rstStmt = STRING_SEP_ORA;
		} else if ((CommonConst.DB_TYPE.POSTGRESQL.getVal()).equals(dbtype)) {
			rstStmt = STRING_SEP_PGSQL;
		} else if ((CommonConst.DB_TYPE.MSSQL.getVal()).equals(dbtype)) {
			// MSSQL에는 NEXTVAL이 존재하지 않음.
			rstStmt = STRING_SEP_MSSQL;
		} else if ((CommonConst.DB_TYPE.MARIADB.getVal()).equals(dbtype)
				|| (CommonConst.DB_TYPE.MYSQL.getVal()).equals(dbtype)) {
			// MSSQL에는 NEXTVAL이 존재하지 않음.
			rstStmt = STRING_SEP_MARIADB;
		} else {
			// 디폴트는 오라클
		}
		
		return rstStmt;
	}
	
	
	public static String getPagingQry(String dbtype, String SqlCmd, String orderStr, int viewPage, int pageCnt){
		String sqlCommand =SqlCmd;
		
		int rowFrom = pageCnt * (viewPage-1);
	    int rowTo = pageCnt * (viewPage);

	    if ((CommonConst.DB_TYPE.ORACLE.getVal()).equals(dbtype)) {
	    	//ORACLE
	    	sqlCommand = sqlCommand.replace("/* ORDER */", " ORDER BY " + orderStr );
	    	sqlCommand = "SELECT * FROM ( SELECT ROWNUM AS RNUM, B.RCOUNT,A.* "
								+  "FROM (" 
								+ sqlCommand 
								+ ") A "
								+", (SELECT count(*) as RCOUNT FROM (" + sqlCommand + ")) B"
								+") WHERE RNUM <="+ rowTo + " AND RNUM >"+rowFrom;
								//+" WHERE 1 = 1 AND ROWNUM <= "+ rowTo + " AND ROWNUM > "+rowFrom+")";
								//+" WHERE 1 = 1 AND RNUM <= "+ rowTo + " AND RNUM > "+rowFrom+")";
	    	
		} else  if ((CommonConst.DB_TYPE.MARIADB.getVal()).equals(dbtype) 
				|| (CommonConst.DB_TYPE.MYSQL.getVal()).equals(dbtype)) {
	    	//MARIADB
//	    	sqlCommand = sqlCommand.replace("/* ORDER */", " ORDER BY " + orderStr );
	    	boolean orderbyFlg = false;
	    	if( 0 <= sqlCommand.indexOf("/* ORDER */")){
	    		orderbyFlg = true;
	    		sqlCommand = sqlCommand.replace("/* ORDER */", ""); //mysql은 orderby가 서브쿼리에서 실행이 되지 않는다...
	    	}
	    	
	    	sqlCommand = " SELECT * FROM ("
	    						+" SELECT @RNUM:=@RNUM+1 AS RNUM, A.* "
								+  "FROM ( SELECT @RNUM:=0) R, (("
								+ " SELECT * FROM "
								+ " ( " + sqlCommand + ") A1, "
								+ " ( SELECT COUNT(1) AS RCOUNT FROM ( " + sqlCommand + ") A2) B2) A)"
								+") B ";
	    	
			if(orderbyFlg && StringUtils.isNotEmpty(orderStr)){
				sqlCommand += " ORDER BY " + orderStr; 
			}
			sqlCommand += " LIMIT "+rowFrom + "," + pageCnt; 
	    	
		} else if ((CommonConst.DB_TYPE.POSTGRESQL.getVal()).equals(dbtype)) {
			// POSTGRESQL			
			rowFrom  = rowFrom + 1;
			sqlCommand = SqlCmd.replace("/* ORDER */", " ROW_NUMBER() OVER (ORDER BY " + orderStr + ") AS ROWNUM, "); 
			sqlCommand = " WITH TBL_PAGELIST AS ("; 
			sqlCommand +=	sqlCommand;
			sqlCommand += ")";
			sqlCommand += " SELECT *, (SELECT COUNT(*) FROM TBL_PAGELIST) AS RCOUNT FROM TBL_PAGELIST ";
			sqlCommand += " WHERE ROWNUM BETWEEN " + rowFrom + " AND " + rowTo;

		} else if ((CommonConst.DB_TYPE.MSSQL.getVal()).equals(dbtype)) {
			// mssql
			rowFrom  = rowFrom + 1;
			sqlCommand = " SET NOCOUNT ON; "; 
			sqlCommand = " SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; "; 
			sqlCommand = SqlCmd.replace("/* ORDER */", " ROW_NUMBER() OVER (ORDER BY " + orderStr + ") AS ROWNUM, "); 
			sqlCommand = " WITH TBL_PAGELIST AS ("; 
			sqlCommand +=	sqlCommand;
			sqlCommand += ")";
			sqlCommand += " SELECT *, (SELECT COUNT(*) FROM TBL_PAGELIST) AS RCOUNT FROM TBL_PAGELIST ";
			sqlCommand += " WHERE ROWNUM BETWEEN " + rowFrom + " AND " + rowTo;
			
		} else {
			// 디폴트는 오라클
		}
		return sqlCommand;
	}
	
	/**
	 * fotter에 콤마를 붙여주는 함수
	 * @param stmt
	 * @param commaFlg
	 * @return
	 */
	public static String settingComma(String stmt, boolean commaFlg){
		String rstStmt = stmt;
		if (commaFlg && StringUtils.isNotBlank(stmt)) { // 콤마 처리
			rstStmt += ",";
		}
		return rstStmt;
	}
	
	 /**
	  * 해당 텍스트를 SALT적용하여 SHA256으로 암호화시켜서 반환 메소드
	  * @param containsKey
	  * @param userInfo
	  * @return
	 * @throws NoSuchAlgorithmException 
	 * @throws UnsupportedEncodingException 
	  */
	public static String encryptPw(String pw, String siteCode, String userId) throws NoSuchAlgorithmException, UnsupportedEncodingException {
		String salt = siteCode;
		
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		digest.reset();
		digest.update(salt.getBytes());
		byte[] hash =digest.digest(pw.getBytes());
		
		StringBuffer sb = new StringBuffer(); 
		for(int i = 0 ; i < hash.length ; i++){
			sb.append(Integer.toString((hash[i]&0xff) + 0x100, 16).substring(1));
		}
		
		return sb.toString();
	}
}
