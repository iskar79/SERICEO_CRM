package co.kr.kydbm.core.utils;

import java.util.ArrayList;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.bean.FilterGeneratorBean;

/**
 * 확장필터(검색조건) 쿼리 제너레이터 클래스
 * 
 * @author KyoungHo_Ma
 * @version 1.0.0 2013-11-07
 * @since version 1.0.0
 */

public class FilterGenerator {
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	private static String strSep = QueryGenerator.genStrSeperator(DB_TYPE);
	/**
	 * 확장필드용 쿼리를 취득하는 메소드
	 * 
	 * @param arrExtFilters
	 * @return
	 */
	public static String getFilterQuery(
			ArrayList<Map<String, Object>> arrExtFilters) {
		String rstFltQry = "";
		// type에 따라 Generator 처리를 분기함.
		for (Map<String, Object> ef : arrExtFilters) {
			String genQry = filterGenController(ef);
			if (genQry != null && genQry != "") {
				rstFltQry += " AND " + genQry;
			}
		}
		return rstFltQry;
	}

	/**
	 * 타입에 따른 필드 제너레이터 메소드를 호출하기 위한 콘트롤러 메소드
	 * 
	 * @param ef
	 * @return
	 */
	private static String filterGenController(Map<String, Object> filter) {

		String rstQry = "";

		// 확장필터 정보를 사용하기 푠하도록 ExtFilterBean에 담는다.

		FilterGeneratorBean ef = new FilterGeneratorBean();
		if (filter.containsKey("label"))
			ef.setLabel(filter.get("label").toString());
		if (filter.containsKey("field"))
			ef.setField(filter.get("field").toString());
		if (filter.containsKey("type"))
			ef.setType(filter.get("type").toString());
		if (filter.containsKey("operator"))
			ef.setOperators(filter.get("operator").toString());
		if (filter.containsKey("values"))
			ef.setValues(filter.get("values").toString());
		if (filter.containsKey("codes"))
			ef.setCodes(filter.get("codes").toString());

		if (("text").equals(ef.getType())) {
			rstQry = makeTextQry(ef);
		} else if (("select").equals(ef.getType())) {
			rstQry = makeSelectQry(ef);
		} else if (("boolean").equals(ef.getType())) {
			rstQry = makeBooleanQry(ef);
		} else if (("number").equals(ef.getType())) {
			rstQry = makeNumberQry(ef);
		} else if (("date").equals(ef.getType())) {
			rstQry = makeDateQry(ef);
		} else if (("linkkey").equals(ef.getType())) {
			rstQry = makeLinkKeyQry(ef);
		} else if (("user").equals(ef.getType())) {
			rstQry = makeLinkKeyQry(ef);
		} else if (("dept").equals(ef.getType())) {
			rstQry = makeLinkKeyQry(ef);
		}

		return rstQry;
	}

	/**
	 * Text 타입의 필터 쿼리 작성 메소드
	 * 
	 * @param ef
	 * @return
	 */
	private static String makeTextQry(FilterGeneratorBean ef) {
		String rstQry = "";
		/*
		 * 이다 = 포함되는 키워드 ~ 아니다 ! 포함하지 않는 키워드 !~ 모두 * 없음 !*
		 */
		rstQry += ef.getField(); // 필드명
		
		//2013-12-17 khma : db분기처리 필요
		if (ef.getOperators().equals("=")) {
			rstQry += " = @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals("~")) {
			// 포함되는키워드
			if(CommonConst.DB_TYPE.MARIADB.getVal().equals(DB_TYPE)){
				rstQry += " LIKE CONCAT('%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%' ) ";
			}else{
				rstQry += " LIKE '%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%' ";
			}
		} else if (ef.getOperators().equals("!")) {
			// 아니다
			rstQry += " <> @" + ef.getField() + "@";
		} else if (ef.getOperators().equals("!~")) {
			// 포함하지 않는 키워드
			if(CommonConst.DB_TYPE.MARIADB.getVal().equals(DB_TYPE)){
				rstQry += " NOT LIKE CONCAT('%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%') ";
			}else{
				rstQry += " NOT LIKE '%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%' ";
			}
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		}

		return rstQry;
	}

	/**
	 * select 타입의 필터 쿼리 작성 메소드
	 * 
	 * @param ef
	 * @return
	 */
	private static String makeSelectQry(FilterGeneratorBean ef) {
		String rstQry = "";

		/*
		 * 이다 = 아니다 ! 모두 *
		 */
		rstQry += ef.getField(); // 필드명

		String[] values = ef.getValues().split(",");

		String strVals = "";

		for (int i = 0; i < values.length; i++) {
			if (i > 0) {
				strVals += ",";
			}
			strVals += "'" + values[i] + "'";
		}
		
		//TODO 2013-12-17 khma : db분기처리 필요
		if (ef.getOperators().equals("=")) {
			// 이다
			rstQry += " IN ( " + strVals + " )";
		} else if (ef.getOperators().equals("!")) {
			// 아니다
			rstQry += " NOT IN ( " + strVals + " )";
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		}

		return rstQry;
	}

	/**
	 * boolean 타입의 필터 쿼리 작성 메소드
	 * 
	 * @param ef
	 * @return
	 */
	private static String makeBooleanQry(FilterGeneratorBean ef) {
		String rstQry = "";

		/*
		 * 예 1 / 아니오 0
		 */
		rstQry += ef.getField(); // 필드명
		rstQry += " = '" + ef.getOperators() + "'";

		return rstQry;
	}

	/**
	 * number 타입의 필터 쿼리 작성 메소드
	 * 
	 * @param ef
	 * @return
	 */
	private static String makeNumberQry(FilterGeneratorBean ef) {
		String rstQry = "";
		/*
		 * 이다 = 포함되는 키워드 ~ 아니다 ! 포함하지 않는 키워드 !~ 모두 *
		 */
		rstQry += ef.getField(); // 필드명
		
		//TODO 2013-12-17 khma : db분기처리 필요
		if (ef.getOperators().equals("=")) {
			// 이다
			rstQry += " = @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals(">=")) {
			// >=
			rstQry += " >= @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals("<=")) {
			// <=
			rstQry += " <= @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals("><")) {
			// 사이 bettween
			String vals = ef.getValues();
			int seperatorIdx = vals.indexOf(",");
			String val01 = vals.substring(0,seperatorIdx);
			String val02 = vals.substring(seperatorIdx + 1);
			if (StringUtils.isEmpty(val01) && StringUtils.isNotEmpty(val02)) {
				rstQry += " <= @" + ef.getField() + "@ ";
			} else if (StringUtils.isNotEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " >= @" + ef.getField() + "@ ";
			} else {
				rstQry += " >= @" + ef.getField() + "01@ ";
				rstQry += " AND " + ef.getField() + " <= @" + ef.getField()
						+ "02@ ";
			}

		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		}

		return rstQry;
	}

	/**
	 * date 타입의 필터 쿼리 작성 메소드
	 **/
	private static String makeDateQry(FilterGeneratorBean ef) {
		String rstQry = "";
		/*
		 * 이다 = 포함되는 키워드 ~ 아니다 ! 포함하지 않는 키워드 !~ 모두 *
		 */
		if(CommonConst.DB_TYPE.ORACLE.getVal().equals(DB_TYPE)){
			rstQry = makeDateQryForOracle(ef);
		} else if(CommonConst.DB_TYPE.POSTGRESQL.getVal().equals(DB_TYPE)){
			rstQry = makeDateQryForPostgreSql(ef);
		} else if(CommonConst.DB_TYPE.MSSQL.getVal().equals(DB_TYPE)){
			rstQry = makeDateQryForMssql(ef);
		} else  if(CommonConst.DB_TYPE.MARIADB.getVal().equals(DB_TYPE)){
			rstQry = makeDateQryForMariaDB(ef);
		}
		return rstQry;
	}
	
	/**
	 * DB가 Postgresql일때 날짜 검색 쿼리 작성 메소드
	 * @param ef
	 * @return
	 */
	private static String makeDateQryForPostgreSql(FilterGeneratorBean ef) {
		String rstQry = "";
		rstQry += ef.getField(); // 필드명
		
		//TODO 2013-12-17 khma : db분기처리 필요
		if( ef.getValues().equals(",") ){	
			rstQry = "";
		} else if (ef.getOperators().equals("=")) {
			// 이다
			 rstQry += " = @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals(">=")) {
			// >=
			rstQry += " >= TO_DATE(@" + ef.getField() + "@) ";
		} else if (ef.getOperators().equals("<=")) {
			// >=
			rstQry += " < TO_DATE(@" + ef.getField() + "@) + 1";
		} else if (ef.getOperators().equals("><") && !ef.getValues().equals(",")) {
			// 사이 between
			String vals = ef.getValues();
			int seperatorIdx = vals.indexOf(",");
			String val01 = vals.substring(0,seperatorIdx);
			String val02 = vals.substring(seperatorIdx + 1);
			
			if (StringUtils.isEmpty(val01) && StringUtils.isNotEmpty(val02)) {
				rstQry += " < TO_DATE(@" + ef.getField() + "@) + 1";
			} else if (StringUtils.isNotEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " >= TO_DATE(@" + ef.getField() + "@) ";
			} else if (StringUtils.isEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " = '' ";
			} else {
				rstQry += " >= TO_DATE(@" + ef.getField() + "01@) ";
				rstQry += " AND " + ef.getField() + " < TO_DATE(@"
						+ ef.getField() + "02@) +1 ";
			}

		} else if (ef.getOperators().equals("t")) {
			// t 오늘
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(sysdate , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals("ld")) {
			// ld 어제
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(sysdate-1 , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals("w")) {
			// w 이번 주
			rstQry += " >= TRUNC(SYSDATE,'d') "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d')+7 ";
		} else if (ef.getOperators().equals("lw")) {
			// lw 지난주
			rstQry += " >= TRUNC(SYSDATE,'d') - 7 "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d') ";
		} else if (ef.getOperators().equals("l2w")) {
			// 최근 2 주
			rstQry += " >= TRUNC(SYSDATE,'d') - 7 "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d') + 7 ";
		} else if (ef.getOperators().equals("m")) {
			// 이번 달
			rstQry += " >= TRUNC(SYSDATE,'MM') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,1),'MM') ";
		} else if (ef.getOperators().equals("lm")) {
			// 지난 달
			rstQry += " >= TRUNC(SYSDATE-1,'MM') "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'MM')-1 ";
		} else if (ef.getOperators().equals("nm")) {
			// 다음 달
			rstQry += " >= TRUNC(ADD_MONTHS(SYSDATE,1),'MM') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,2),'MM') ";
		} else if (ef.getOperators().equals("y")) {
			// 올해
			rstQry += " >= TRUNC(SYSDATE,'YEAR') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,1*12),'YEAR') ";
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		}
		
		return rstQry;
	}
	
	/**
	 * DB가 오라클일때 날짜 검색 쿼리 작성 메소드
	 * @param ef
	 * @return
	 */
	private static String makeDateQryForOracle(FilterGeneratorBean ef) {
		String rstQry = "";
		rstQry += ef.getField(); // 필드명
		
		//TODO 2013-12-17 khma : db분기처리 필요
		if( ef.getValues().equals(",") ){	
			rstQry = "";
		} else if (ef.getOperators().equals("=")) {
			// 이다
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(TO_DATE(@" + ef.getField() + "@) , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals(">=")) {
			// >=
			rstQry += " >= TO_DATE(@" + ef.getField() + "@) ";
		} else if (ef.getOperators().equals("<=")) {
			// >=
			rstQry += " < TO_DATE(@" + ef.getField() + "@) + 1";
		} else if (ef.getOperators().equals("><") && !ef.getValues().equals(",")) {
			// 사이 between
			String vals = ef.getValues();
			int seperatorIdx = vals.indexOf(",");
			String val01 = vals.substring(0,seperatorIdx);
			String val02 = vals.substring(seperatorIdx + 1);
			
			if (StringUtils.isEmpty(val01) && StringUtils.isNotEmpty(val02)) {
				rstQry += " < TO_DATE(@" + ef.getField() + "@) + 1";
			} else if (StringUtils.isNotEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " >= TO_DATE(@" + ef.getField() + "@) ";
			} else if (StringUtils.isEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " = '' ";
			} else {
				rstQry += " >= TO_DATE(@" + ef.getField() + "01@) ";
				rstQry += " AND " + ef.getField() + " < TO_DATE(@"
						+ ef.getField() + "02@) +1 ";
			}
			
		} else if (ef.getOperators().equals("t")) {
			// t 오늘
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(sysdate , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals("ld")) {
			// ld 어제
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(sysdate-1 , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals("w")) {
			// w 이번 주
			rstQry += " >= TRUNC(SYSDATE,'d') "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d')+7 ";
		} else if (ef.getOperators().equals("lw")) {
			// lw 지난주
			rstQry += " >= TRUNC(SYSDATE,'d') - 7 "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d') ";
		} else if (ef.getOperators().equals("l2w")) {
			// 최근 2 주
			rstQry += " >= TRUNC(SYSDATE,'d') - 7 "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d') + 7 ";
		} else if (ef.getOperators().equals("m")) {
			// 이번 달
			rstQry += " >= TRUNC(SYSDATE,'MM') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,1),'MM') ";
		} else if (ef.getOperators().equals("lm")) {
			// 지난 달
			rstQry += " >= TRUNC(SYSDATE-1,'MM') "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'MM')-1 ";
		} else if (ef.getOperators().equals("nm")) {
			// 다음 달
			rstQry += " >= TRUNC(ADD_MONTHS(SYSDATE,1),'MM') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,2),'MM') ";
		} else if (ef.getOperators().equals("y")) {
			// 올해
			rstQry += " >= TRUNC(SYSDATE,'YEAR') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,1*12),'YEAR') ";
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		}
		
		return rstQry;
	}
	
	/**
	 * DB가 MsSql일때 날짜 검색 쿼리 작성 메소드
	 * @param ef
	 * @return
	 */
	private static String makeDateQryForMssql(FilterGeneratorBean ef) {
		String rstQry = "";
		rstQry += ef.getField(); // 필드명
		
		//2013-12-17 khma : db분기처리 필요
		if( ef.getValues().equals(",") ){	
			rstQry = "";
		} else if (ef.getOperators().equals("=")) {
			// 이다
			// rstQry += " = @" + ef.getField() + "@ ";
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(TO_DATE(@" + ef.getField() + "@) , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals(">=")) {
			// >=
			rstQry += " >= TO_DATE(@" + ef.getField() + "@) ";
		} else if (ef.getOperators().equals("<=")) {
			// >=
			rstQry += " < TO_DATE(@" + ef.getField() + "@) + 1";
		} else if (ef.getOperators().equals("><") && !ef.getValues().equals(",")) {
			// 사이 between
			String vals = ef.getValues();
			int seperatorIdx = vals.indexOf(",");
			String val01 = vals.substring(0,seperatorIdx);
			String val02 = vals.substring(seperatorIdx + 1);
			
			if (StringUtils.isEmpty(val01) && StringUtils.isNotEmpty(val02)) {
				rstQry += " < TO_DATE(@" + ef.getField() + "@) + 1";
			} else if (StringUtils.isNotEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " >= TO_DATE(@" + ef.getField() + "@) ";
			} else if (StringUtils.isEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " = '' ";
			} else {
				rstQry += " >= TO_DATE(@" + ef.getField() + "01@) ";
				rstQry += " AND " + ef.getField() + " < TO_DATE(@"
						+ ef.getField() + "02@) +1 ";
			}
			
		} else if (ef.getOperators().equals("t")) {
			// t 오늘
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(sysdate , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals("ld")) {
			// ld 어제
			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
			rstQry += " = TO_CHAR(sysdate-1 , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals("w")) {
			// w 이번 주
			rstQry += " >= TRUNC(SYSDATE,'d') "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d')+7 ";
		} else if (ef.getOperators().equals("lw")) {
			// lw 지난주
			rstQry += " >= TRUNC(SYSDATE,'d') - 7 "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d') ";
		} else if (ef.getOperators().equals("l2w")) {
			// 최근 2 주
			rstQry += " >= TRUNC(SYSDATE,'d') - 7 "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'d') + 7 ";
		} else if (ef.getOperators().equals("m")) {
			// 이번 달
			rstQry += " >= TRUNC(SYSDATE,'MM') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,1),'MM') ";
		} else if (ef.getOperators().equals("lm")) {
			// 지난 달
			rstQry += " >= TRUNC(SYSDATE-1,'MM') "; // 필드명
			rstQry += "AND " + ef.getField() + " < TRUNC(SYSDATE,'MM')-1 ";
		} else if (ef.getOperators().equals("nm")) {
			// 다음 달
			rstQry += " >= TRUNC(ADD_MONTHS(SYSDATE,1),'MM') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,2),'MM') ";
		} else if (ef.getOperators().equals("y")) {
			// 올해
			rstQry += " >= TRUNC(SYSDATE,'YEAR') "; // 필드명
			rstQry += "AND " + ef.getField()
					+ " < TRUNC(ADD_MONTHS(SYSDATE,1*12),'YEAR') ";
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		}
		
		return rstQry;
	}

	/**
	 * DB가 MariaDB일때 날짜 검색 쿼리 작성 메소드
	 * @param ef
	 * @return
	 */
	private static String makeDateQryForMariaDB(FilterGeneratorBean ef) {
		String rstQry = "";
		//rstQry += ef.getField(); // 필드명
		rstQry = " DATE(" +ef.getField() + ") ";
		
		//2013-12-17 khma : db분기처리 필요
		if( ef.getValues().equals(",") ){	
			rstQry = "";
		} else if (ef.getOperators().equals("=")) {
			// 이다
			 rstQry += " = @" + ef.getField() + "@ ";
//			rstQry = "TO_CHAR(" + ef.getField() + ", 'YYYYMMDD')"; // 필드명
//			rstQry += " = TO_CHAR(TO_DATE(@" + ef.getField() + "@) , 'YYYYMMDD') ";
		} else if (ef.getOperators().equals(">=")) {
			// >=
			rstQry += " >= @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals("<=")) {
			// >=
			rstQry += " <= @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals("><") && !ef.getValues().equals(",")) {
			// 사이 between
			String vals = ef.getValues();
			int seperatorIdx = vals.indexOf(",");
			String val01 = vals.substring(0,seperatorIdx);
			String val02 = vals.substring(seperatorIdx + 1);
			
			if (StringUtils.isEmpty(val01) && StringUtils.isNotEmpty(val02)) {
				rstQry += " <= @" + ef.getField() + "@ ";
			} else if (StringUtils.isNotEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " >= @" + ef.getField() + "@  ";
			} else if (StringUtils.isEmpty(val01)
					&& StringUtils.isEmpty(val02)) {
				rstQry += " = '' ";
			} else {
				rstQry += " >= @" + ef.getField() + "01@ ";
				rstQry += " AND " + ef.getField() + " <=@"+ ef.getField() + "02@ ";
			}
			
		} else if (ef.getOperators().equals("t")) {
			// t 오늘
			rstQry += " = CURRENT_DATE() ";
		} else if (ef.getOperators().equals("ld")) {
			// ld 어제
			rstQry += " = CURRENT_DATE() - INTERVAL 1 DAY ";
		} else if (ef.getOperators().equals("w")) {
			// w 이번 주
			rstQry += " >= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFWEEK(CURRENT_DATE())) DAY) "; // 필드명
			rstQry += "AND DATE(" + ef.getField() + ") <= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFWEEK(CURRENT_DATE())) +6 DAY) ";
		} else if (ef.getOperators().equals("lw")) {
			// lw 지난주
			rstQry += " >= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFWEEK(CURRENT_DATE())) -7 DAY) "; // 필드명
			rstQry += "AND DATE(" + ef.getField() + ") <= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFWEEK(CURRENT_DATE())) -1 DAY) ";
		} else if (ef.getOperators().equals("l2w")) {
			// 최근 2 주
			rstQry += " >= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFWEEK(CURRENT_DATE())) -7 DAY) "; // 필드명
			rstQry += "AND DATE(" + ef.getField() + ") <= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFWEEK(CURRENT_DATE())) +6 DAY) ";
		} else if (ef.getOperators().equals("m")) {
			// 이번 달
			rstQry += " >= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFMONTH(CURRENT_DATE())) DAY) "; // 필드명
			rstQry += "AND DATE(" + ef.getField() + ") <= LAST_DAY(CURRENT_DATE()) ";
		} else if (ef.getOperators().equals("lm")) {
			// 지난 달
			rstQry += " >= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFMONTH(CURRENT_DATE())) DAY) - INTERVAL 1 MONTH "; // 필드명
			rstQry += "AND DATE(" + ef.getField() + ") <= LAST_DAY(DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFMONTH(CURRENT_DATE())) DAY) - INTERVAL 1 MONTH) ";
		} else if (ef.getOperators().equals("nm")) {
			// 다음 달
			rstQry += " >= DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFMONTH(CURRENT_DATE())) DAY) + INTERVAL 1 MONTH "; // 필드명
			rstQry += "AND DATE(" + ef.getField() + ") <= LAST_DAY(DATE_ADD(CURRENT_DATE(), INTERVAL(1-DAYOFMONTH(CURRENT_DATE())) DAY) + INTERVAL 1 MONTH) ";
		} else if (ef.getOperators().equals("y")) {
			// 올해
			rstQry = " YEAR(" +ef.getField()+ ") ";
			rstQry += " = YEAR(CURRENT_DATE()) "; // 필드명
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry = ef.getField();
			rstQry += " is null ";
		}
		
		return rstQry;
	}
	
	/**
	 * link (user/ dept) 타입의 필터 쿼리 작성 메소드
	 * 
	 * @param ef
	 * @return
	 */
	private static String makeLinkKeyQry(FilterGeneratorBean ef) {
		String rstQry = "";
		/*
		 * 이다 = 포함되는 키워드 ~ 아니다 ! 포함하지 않는 키워드 !~ 모두 * 없음 !* 나만 me
		 */
		rstQry += ef.getField(); // 필드명
		
		//TODO 2013-12-17 khma : db분기처리 필요
		if (ef.getOperators().equals("=")) {
			rstQry += " = @" + ef.getField() + "@ ";
		} else if (ef.getOperators().equals("~")) {
			// 포함되는키워드
			if(CommonConst.DB_TYPE.MARIADB.getVal().equals(DB_TYPE)){
				rstQry += " LIKE CONCAT('%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%') ";
			}else{
				rstQry += " LIKE '%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%' ";
			}
		} else if (ef.getOperators().equals("!")) {
			// 아니다
			rstQry += " <> @" + ef.getField() + "@";
		} else if (ef.getOperators().equals("!~")) {
			// 포함하지 않는 키워드
			if(CommonConst.DB_TYPE.MARIADB.getVal().equals(DB_TYPE)){
				rstQry += " NOT LIKE CONCAT('%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%') ";
			}else{
				rstQry += " NOT LIKE '%' "+ strSep +" @" + ef.getField() + "@ "+ strSep +" '%' ";
			}
		} else if (ef.getOperators().equals("*")) {
			// 모두일때는 검색조건을 반환하지 않는다.
			rstQry = "";
		} else if (ef.getOperators().equals("!*")) {
			// 없음일때에는 isnull / 공백인것 취득쿼리
			rstQry += " is null ";
		} else if (ef.getOperators().equals("me")) {
			// userid
			rstQry += " = @UID@ ";
		} else if (ef.getOperators().equals("md")) {
			// udept
			rstQry += " = @UDEPT@ ";
		}

		return rstQry;
	}

	/**
	 * 해당 쿼리에 필요한 파라메터를 추가하는 메소드
	 * 
	 * @param mapParam
	 *            기본 파라메터 맵
	 * @param arrExtFilters
	 *            확장필터 정보리스트
	 */
	public static Map<String, String> getExtFilterParams(
			Map<String, String> mapParam,
			ArrayList<Map<String, Object>> arrExtFilters,
			Map<String, String> parameters) {

		for (Map<String, Object> extFilter : arrExtFilters) {
			String key = extFilter.get("field").toString();
			String val = extFilter.get("values").toString();
			String op = extFilter.get("operator").toString();
			String type = extFilter.get("type").toString();

			if (!op.equals("*") && !op.equals("!*") && !type.equals("select")
					&& !type.equals("boolean") && !op.equals("t")
					&& !op.equals("ld") && !op.equals("w") && !op.equals("lw")
					&& !op.equals("l2w") && !op.equals("m") && !op.equals("lm")
					&& !op.equals("nm") && !op.equals("y")) {
				// 파라메터셋팅이 필요없는 오퍼레이터들이 아닐경우에만 셋팅

				if (type.equals("number") || type.equals("date")) {
					if(op.equals("><") &&  !val.equals(",")){
						// 타입이 number or date 이고 오퍼레이터가 >< (사이) 인경우에는 from - to형태의
						// 두개의 파라메터가 생성된다.
						int seperatorIdx = val.indexOf(",");
						String val01 = val.substring(0,seperatorIdx);
						String val02 = val.substring(seperatorIdx+1);
						

						// from값이 없고 to값이 있을경우
						if (StringUtils.isNotEmpty(val01) && StringUtils.isEmpty(val02)) {
							mapParam.put(key, val01.replaceAll("-",""));
						} else if (StringUtils.isEmpty(val01) && StringUtils.isNotEmpty(val02)) {
							mapParam.put(key,  val02.replaceAll("-",""));
						} else {
							mapParam.put(key+"01",  val01.replaceAll("-",""));
							mapParam.put(key+"02",  val02.replaceAll("-",""));
						}
					} else{
						mapParam.put(key, val.replaceAll("-", ""));
					}
				} else if (type.equals("user") && op.equals("me")) {
					// type이 user 이고 operator가 me 인경우
					mapParam.put("UID", parameters.get("UID").toString());
				} else if (type.equals("dept") && op.equals("md")) {
					// type이 dept 이고 operator가 md 인경우
					mapParam.put("UDEPT", parameters.get("UDEPT").toString());
				} else {
					mapParam.put(key, val);
				}
			}
		}

		return mapParam;

	}

}
