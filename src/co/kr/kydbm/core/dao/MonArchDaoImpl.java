package co.kr.kydbm.core.dao;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.xmlbeans.impl.xb.xsdschema.Public;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.jdbc.support.lob.LobHandler;
import org.springframework.web.multipart.MultipartFile;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.bean.UserInfo;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.FilterGenerator;
import co.kr.kydbm.core.utils.MonarchSecurity;
import co.kr.kydbm.core.utils.QueryGenerator;

/**
 *  모나크Dao 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
//@Component
public class MonArchDaoImpl   extends DataSourceSupport{
	private static final String REGEX_PARAM = "@+[ a-zA-Z0-9가-힣-_ ]*@";
	private static final Object RETURN_PROCEDURE_KEY = "RT_DATA";
//	protected static JdbcTemplate jdbcTemplate;
//	protected static NamedParameterJdbcTemplate namedParameterJdbcTemplate; //20140117
//	private static DataSource datasource;
	Logger log =  Logger.getLogger(MonArchDaoImpl.class.getName());
	private static LobHandler lobHandler;
	public LobHandler getLobHandler() { return lobHandler; }

	ConfigProperties prop = ConfigProperties.getInstance(); //속성정의 정보 취득
//	private String DB_TYPE = prop.getProperty(CommonConst.PROP_DB_TYPE);
	
	public void setLobHandler(LobHandler lh) { 
    	lobHandler = lh;
    	}
    
	/**
	 * 쿼리를 읽어오는 메소드
	 * 
	 * @param service
	 * @param method
	 * @param usite
	 * @return
	 */
	public ServiceInfo ReadQuery(String service, String method, String usite) {
		
		ServiceInfo si = new ServiceInfo(); // 반환객체
		StringBuffer sb = new StringBuffer(""); // 쿼리작성용 버퍼
		String sqlCommand = ""; // 실행쿼리
		// 파라메터 작성
		Map<String, String> paramMap = new HashMap<String, String>();
		//해당하는 서비스와 메소드 회원사번호로 쿼리를 읽어옴
		if ( CommonConst.MON_COMMON.equals(service)) { //서비스가 MON_COMMON일 경우는 모나크 공통서비스 이용을 위한 처리임
			usite ="44";  // MON_COMMON일때에는 [1] 모나크프레임워크 공통서비스 이용
		} 
		
		paramMap.put("service", service);
		paramMap.put("method", method);
		paramMap.put("usite", usite);
		
		
		// 2013-12-17 khma : db분기처리 필요
		// 쿼리작성
		sb.append("SELECT ");
		sb.append(" a.M_SERVICE_NO, a.QUERY_NAME, a.SERVICE_NAME, a.METHOD_NAME, a.EXEC_TYPE ");
//		sb.append(" ,a.QUERY_STMT, NVL(a.QUERY_DESC,' ') as QUERY_DESC, a.USE_FLAG ");
		sb.append(" ,a.QUERY_STMT, ");
		sb.append( QueryGenerator.genNvlStmt(DB_TYPE, "a.QUERY_DESC"," ","string", false) + " as QUERY_DESC ");
		sb.append(" , a.USE_FLAG ");
		sb.append(" ,a.REG_DATE, a.UPD_DATE, a.REG_USER, a.UPD_USER, " +
				QueryGenerator.genNvlStmt(DB_TYPE, "a.TABLE_NAME"," ","string", false) + " as TABLE_NAME ,"
				+ QueryGenerator.genNvlStmt(DB_TYPE, "a.DS_NAME", " ","string", false) +  " as DS_NAME " );
		sb.append(" FROM M_SERVICE a");
		if(DB_TYPE.equals(CommonConst.DB_TYPE.ORACLE.getVal()) 
				|| DB_TYPE.equals(CommonConst.DB_TYPE.MSSQL.getVal()) 
				|| DB_TYPE.equals(CommonConst.DB_TYPE.MARIADB.getVal())){
			sb.append(" WHERE a.SERVICE_NAME = :service and UPPER(a.METHOD_NAME) = UPPER(:method) and a.M_USITE_NO = :usite");
		}else{
			//TODO PostgreSQL
			sb.append(" WHERE a.SERVICE_NAME = :service and UPPER(a.METHOD_NAME) = UPPER(:method) and a.M_USITE_NO::text = :usite");
		}
		sqlCommand = sb.toString();

		// 쿼리실행
		Map<String,Object> rstMap = null;
		try {
			rstMap = namedParameterJdbcTemplate.queryForMap(sqlCommand, paramMap);
		} catch(EmptyResultDataAccessException e){
			log.warn("데이터가 존재하지 않습니다.", e);
		}
		
		if(null != rstMap) {
		 si.setSvcID(rstMap.get("METHOD_NAME").toString());
		 si.setSvcDesc(rstMap.get("QUERY_DESC").toString());
		 si.setJobType(rstMap.get("EXEC_TYPE").toString());
		 si.setConn(rstMap.get("EXEC_TYPE").toString());
		 si.setSql(rstMap.get("QUERY_STMT").toString());
		 si.setTbName(rstMap.get("TABLE_NAME").toString());
		 si.setTargetDatasource(StringUtils.trim(rstMap.get("DS_NAME").toString()));
		}
		return si;
	}

//	@Override
	public Map<String, Object> readJs(String sqlCommand,
			Map<String, String> paramMap) throws DataAccessException, Exception {
		
		Map<String,Object> rstMap = namedParameterJdbcTemplate.queryForMap(sqlCommand, paramMap);
//		Map<String,Object> rstMap = getNamedParameterJdbcTemplate().queryForMap(sqlCommand, paramMap);
		
		return rstMap;
	}

	// @Override
//	 public Map<String, Object> getSvcRead(String strQry)  //미사용으로 사료되어 주석처리함
//	 throws DataAccessException {
//		 String qry = "SELECT * FROM T_회원 WHERE 회원번호 = :회원번호";
//		 Map<String,String> p = new HashMap<String, String>();
//	 return namedParameterJdbcTemplate.queryForMap(qry, p);
//	 return getNamedParameterJdbcTemplate().queryForMap(qry, p);
//	 }

//	@Override
	public int exeQuery(String SqlCommand, Map<String, String> parameters
			, NamedParameterJdbcTemplate namedParameterJdbcTemplate )
			throws DataAccessException {

		int rCnt = 0;

		Pattern rows = Pattern.compile("\\/[\\*](.*?)[@](.*?)[\\*]\\/",Pattern.MULTILINE);
		Matcher matchRows = rows.matcher(SqlCommand);

		while (matchRows.find()) {

			String strRow = matchRows.group(0);
			Pattern params = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
			Matcher matchCol = params.matcher(strRow);
			while (matchCol.find()) {
//				String para = matchCol.group(0).replace("@", "").trim();
				try {
					SqlCommand = SqlCommand.replace(strRow,
							strRow.replace("/*", "").replace("*/", ""));
				} catch (Exception e) {
					SqlCommand = SqlCommand.replace(strRow, "");
				}
			}
		}
		rCnt = exeCreate(SqlCommand, parameters, namedParameterJdbcTemplate);

		return rCnt;
	}
	
	public int exeQuery(String SqlCommand, Map<String, String> parameters)
			throws DataAccessException {
		return exeQuery(SqlCommand, parameters, namedParameterJdbcTemplate);
	}
	
	
	
	public int exeCreate(String SqlCommand, Map<String, String> parameters
			, NamedParameterJdbcTemplate namedParameterJdbcTemplate) throws DataAccessException {
		
		int rCnt = 0;
		Pattern regs = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = regs.matcher(SqlCommand);
		Map<String, String> mapParam = new HashMap<String, String>();
		
		while (matchCol.find()) {
			String para = matchCol.group(0).replace("@", "").trim();
			try {
				String _data = parameters.get(para);
				mapParam.put(para, _data);
				
			} catch (Exception e1) {
				mapParam.put(para, "null");
			}
		}
		
		SqlCommand = replaceNameTemplateType(SqlCommand, mapParam);
		rCnt = namedParameterJdbcTemplate.update(SqlCommand, mapParam);
//		rCnt = getNamedParameterJdbcTemplate().update(SqlCommand, mapParam);
		return rCnt;
	}
	
	public int exeCreate(String SqlCommand, Map<String, String> parameters) throws DataAccessException {
		return exeCreate(SqlCommand, parameters, namedParameterJdbcTemplate);
	}
	
	

//	@Override
	public int exeCreateIdentity(String SqlCommand,
			String seqTbName, Map<String, String> parameters, 
			NamedParameterJdbcTemplate namedParameterJdbcTemplate, String dsName)
			throws DataAccessException {
		int rltKey = 0;
		int rCnt = 0;
		Pattern regs = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = regs.matcher(SqlCommand);
		Map<String, String> mapParam = new HashMap<String, String>();

		while (matchCol.find()) {
			String para = matchCol.group(0).replace("@", "").trim();
			try {
				String _data = parameters.get(para);
				mapParam.put(para, _data);

			} catch (Exception e1) {
				mapParam.put(para, "null");
			}
		}
		
		SqlCommand = replaceNameTemplateType(SqlCommand, mapParam);
		// nextVal로 시퀀스키를 먼저 취득한다.
		String dbType = getDbType(dsName);
		if(dbType.equals(CommonConst.DB_TYPE.MYSQL.getVal())
				|| dbType.equals(CommonConst.DB_TYPE.MARIADB.getVal())) {		
//		if(DB_TYPE.equals(CommonConst.DB_TYPE.MSSQL.getVal())
//				|| DB_TYPE.equals(CommonConst.DB_TYPE.MARIADB.getVal())) {
			//TODO MSSQL 2013-12-17 khma : db분기처리 필요(MSSQL인 경우에는 시퀀스키를 리턴형태로 바로 내려받음)
			//MARIADB는 AUTOINCREMENT사용하므로 시퀀스처리 필요없음
//			Map<String, Object> rstList = namedParameterJdbcTemplate.queryForMap(SqlCommand, mapParam);			
			rCnt = namedParameterJdbcTemplate.update(SqlCommand, mapParam);		
//			Map<String, Object> rstList = namedParameterJdbcTemplate.queryForMap(SqlCommand, mapParam);
			if( rCnt > 0 ) {
				String strQry = "SELECT LAST_INSERT_ID() AS RLT_KEY";
				Map<String, Object> seqRst = namedParameterJdbcTemplate.queryForMap(strQry, new HashMap<String, Object>());;
				rltKey = Integer.parseInt(seqRst.get("RLT_KEY").toString()) ;
			}
		}else{
			// ORACLE
			//POSTGRESQL
			rltKey = getSeqKey(seqTbName);
			if (rltKey != 0) {
				// 0이면 키취득 실패 0이 아니면 인서트 처리
//				SqlCommand = replaceNameTemplateType(SqlCommand, mapParam);
				mapParam.put(seqTbName + "_NO",  String.valueOf(rltKey));
			}
			rCnt = namedParameterJdbcTemplate.update(SqlCommand, mapParam);
		}
		return rltKey;
	}
	public int exeCreateIdentity(String SqlCommand, String seqTbName, Map<String, String> parameters) 
			throws DataAccessException {
		return exeCreateIdentity(SqlCommand, seqTbName, parameters, namedParameterJdbcTemplate, DB_TYPE);
	}
	
	
	
	
	/**
	 * Read 쿼리의 확장필터입력 없을때
	 * @param sqlCommand
	 * @param parameters
	 * @return
	 */
	public List<Map<String, Object>> exeRead(String sqlCommand,	Map<String, String> parameters) throws DataAccessException,
	Exception {
		// TODO Auto-generated method stub
		ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String,Object>>(); 
		return exeRead(sqlCommand, parameters, arrExtFilters, namedParameterJdbcTemplate);
	}
	public List<Map<String, Object>> exeRead(String sqlCommand,	Map<String, String> parameters,ArrayList<Map<String, Object>> arrExtFilters) throws DataAccessException,
	Exception {
		return exeRead(sqlCommand, parameters, arrExtFilters, namedParameterJdbcTemplate);
	}
	public List<Map<String, Object>> exeRead(String sqlCommand,	Map<String, String> parameters,
			NamedParameterJdbcTemplate namedParameterJdbcTemplate) throws DataAccessException,
	Exception {
		ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String,Object>>(); 
		return exeRead(sqlCommand, parameters, arrExtFilters, namedParameterJdbcTemplate);
	}
	
	
	/**
	 * Read 쿼리 메소드
	 * @param SqlCommand
	 * @param parameters
	 * @param arrExtFilters
	 * @return
	 * @throws DataAccessException
	 * @throws Exception
	 */
	public List<Map<String, Object>> exeRead(String SqlCommand,
			Map<String, String> parameters,
			ArrayList<Map<String, Object>> arrExtFilters,
			NamedParameterJdbcTemplate namedParameterJdbcTemplate
			) throws DataAccessException,
			Exception {

		//다이나믹 쿼리 처리
		String execSqlCmd = setDynamicQuery(SqlCommand, parameters);
		Pattern regs = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = regs.matcher(execSqlCmd);
		Map<String, String> mapParam = new HashMap<String, String>();
		List<Map<String, Object>> rstMapList = new ArrayList<Map<String, Object>>();

		while (matchCol.find()) {
			String para = matchCol.group(0).replace("@", "").trim();
			try {
				String _data = parameters.get(para);
				//data가 존재하지 않으면 행을 삭제
				if(StringUtils.isEmpty(_data)){ //jdk1.5
				//if(_data.isEmpty()){ //jdk 1.6 					
//					SqlCommand = SqlCommand.replace(oldChar, newChar);
				}else{
					mapParam.put(para, _data);
				}

			} catch (Exception e1) {
				String _msg = "MonArch[CRUD :Read ] READ SQL에서 검색할 키["
						+ para
						+ "]값이 검색조건 변수로 전달되지 않았습니다. 구조체의 keyName에 해당변수가 전달되었는지 혹은 공백이 없는지 확인하세요. Sql : "
						+ execSqlCmd + " / " + e1.getMessage();
				// TODO 예외처리
				throw new Exception(_msg);
			}
		}
		
		//확장필드가 존자해면 아래의 처리를 행한다.
		 if (arrExtFilters != null && arrExtFilters.size() > 0){
			 //parameter에 확장필드 파라메터 추가
			 mapParam = FilterGenerator.getExtFilterParams(mapParam ,arrExtFilters, parameters);
			 //필터 옵션에 따른 Sql제너레이터 작성후 /* EXTFILTERS */ 로 replace시킴
			 String strExtFilters = FilterGenerator.getFilterQuery(arrExtFilters);
			 execSqlCmd = SqlCommand.replace("/* EXTFILTERS */", strExtFilters);
			 
         }
		execSqlCmd = replaceNameTemplateType(execSqlCmd, mapParam);
		rstMapList = namedParameterJdbcTemplate.queryForList(execSqlCmd, mapParam);

		return rstMapList;
	}

	public Map<String, Object> exeGetFirstRow(String SqlCommand,
			Map<String, String> parameters, NamedParameterJdbcTemplate namedParameterJdbcTemplate) throws DataAccessException,
			Exception {
		
		Pattern regs = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = regs.matcher(SqlCommand);
		Map<String, String> mapParam = new HashMap<String, String>();
		List<Map<String, Object>> rstMapList;
		
		while (matchCol.find()) {
			String para = matchCol.group(0).replace("@", "").trim();
			try {
				String _data = parameters.get(para);
				//data가 존재하지 않으면 행을 삭제
				if(StringUtils.isEmpty(_data)){ //jdk1.5
					//if(_data.isEmpty()){ //jdk 1.6 
					
//					SqlCommand = SqlCommand.replace(oldChar, newChar);
				}else{
					mapParam.put(para, _data);
				}
				
			} catch (Exception e1) {
				String _msg = "MonArch[CRUD :Read ] READ SQL에서 검색할 키["
						+ para
						+ "]값이 검색조건 변수로 전달되지 않았습니다. 구조체의 keyName에 해당변수가 전달되었는지 혹은 공백이 없는지 확인하세요. Sql : "
						+ SqlCommand + " / " + e1.getMessage();
				// TODO 예외처리
				throw new Exception(_msg);
			}
		}
		
		SqlCommand = replaceNameTemplateType(SqlCommand, mapParam);
		rstMapList = namedParameterJdbcTemplate.queryForList(SqlCommand, mapParam);
		Map<String, Object> rstMap = new HashMap<String, Object>();
		if(rstMapList.size() > 0) rstMap =rstMapList.get(0);
		
		return rstMap;
	}
	
	public Map<String, Object> exeGetFirstRow(String SqlCommand,
			Map<String, String> parameters) throws DataAccessException,
			Exception {
		return exeGetFirstRow(SqlCommand, parameters, namedParameterJdbcTemplate);
	}
	
	
	
//	@Override
	public int exeUpdate(String SqlCommand, Map<String, String> parameters, 
			NamedParameterJdbcTemplate namedParameterJdbcTemplate)
			throws DataAccessException {

		int rCnt = 0;
		Pattern rows = Pattern.compile("\\/[\\*](.*?)[@](.*?)[\\*]\\/",Pattern.MULTILINE);
		Matcher matchRows = rows.matcher(SqlCommand);

		while (matchRows.find()) {

			String strRow = matchRows.group(0);
			Pattern params = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
			Matcher matchCol = params.matcher(strRow);
			while (matchCol.find()) {
				String para = matchCol.group(0).replace("@", "").trim();
				if(null == parameters.get(para)){
//					if(null == parameters.get(para) || "".equals(parameters.get(para))){
					SqlCommand = SqlCommand.replace(strRow, "");
				}else{
					try {
						SqlCommand = SqlCommand.replace(strRow,
								strRow.replace("/*", "").replace("*/", ""));
					} catch (Exception e) {
						SqlCommand = SqlCommand.replace(strRow, "");
					}
				}
			}
		}
		rCnt = exeCreate(SqlCommand, parameters, namedParameterJdbcTemplate);
		return rCnt;
	}
	
	public int exeUpdate(String SqlCommand, Map<String, String> parameters )
			throws DataAccessException {
		return exeUpdate(SqlCommand, parameters, namedParameterJdbcTemplate);
	}

//	@Override
	public int exeDelete(String SqlCommand, Map<String, String> parameters,
			NamedParameterJdbcTemplate namedParameterJdbcTemplate)
			throws DataAccessException {

		int rCnt = 0;
		Pattern regs = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = regs.matcher(SqlCommand);
		Map<String, String> mapParam = new HashMap<String, String>();

		while (matchCol.find()) {
			String para = matchCol.group(0).replace("@", "").trim();
			
			try {
				String _data = parameters.get(para);
				mapParam.put(para, _data);

			} catch (Exception e1) {
				mapParam.put(para, "null");
			}
		}
		SqlCommand = replaceNameTemplateType(SqlCommand, mapParam);
		rCnt = namedParameterJdbcTemplate.update(SqlCommand, mapParam);
//		rCnt = getNamedParameterJdbcTemplate().update(SqlCommand, mapParam);
		return rCnt;
	}
	public int exeDelete(String SqlCommand, Map<String, String> parameters)
			throws DataAccessException {
		return exeDelete(SqlCommand, parameters, namedParameterJdbcTemplate);
	}
	

	/**
	 * List 쿼리의 확장필터입력 없을때
	 * @param sql
	 * @param obj
	 * @param orderStr
	 * @param viewpage
	 * @param pagecnt
	 * @return
	 */
	public List<Map<String, Object>> exeList(String sql,
			Map<String, String> obj, String orderStr, int viewpage,
			int pagecnt) throws DataAccessException,
			Exception {
		// TODO Auto-generated method stub
		ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String,Object>>(); 
		
		return exeList(sql, obj, orderStr, viewpage, pagecnt, arrExtFilters);
	}
	
	public List<Map<String, Object>> exeList(String sql,
			Map<String, String> obj, String orderStr, int viewpage,
			int pagecnt,ArrayList<Map<String, Object>> arrExtFilters) throws DataAccessException,
			Exception {
		// TODO Auto-generated method stub
		return exeList(sql, obj, orderStr, viewpage, pagecnt, arrExtFilters, namedParameterJdbcTemplate, DB_TYPE);
	}
	
	public List<Map<String, Object>> exeList(String sql,
			Map<String, String> obj, String orderStr, int viewpage,
			int pagecnt,ArrayList<Map<String, Object>> arrExtFilters,NamedParameterJdbcTemplate namedParameterJdbcTemplate) throws DataAccessException,
			Exception {
		// TODO Auto-generated method stub
		return exeList(sql, obj, orderStr, viewpage, pagecnt, arrExtFilters, namedParameterJdbcTemplate, DB_TYPE);
	}
	
	/**
	 *  List 서비스 실행 메소드 
	 * @param SqlCommand
	 * @param parameters
	 * @param orderStr
	 * @param viewpage
	 * @param pagecnt
	 * @param arrExtFilters
	 * @return
	 * @throws DataAccessException
	 * @throws Exception
	 */
	public List<Map<String, Object>> exeList(String SqlCommand, Map<String, String> parameters,
			String orderStr, int viewpage, int pagecnt, ArrayList<Map<String, Object>> arrExtFilters,
			NamedParameterJdbcTemplate namedParameterJdbcTemplate
			,String dbType)
					 throws DataAccessException,
						Exception {

//다이나믹 쿼리 셋팅 처리 함수화 함. 그리고 현 메소드는 exeRead함수 호출시 실행되므로 여기선 실행안함.
//		Pattern rows = Pattern.compile("\\/[\\*](.*?)[@](.*?)[\\*]\\/",Pattern.MULTILINE);
//		Matcher matchRows = rows.matcher(SqlCommand);
//		
//		//다이나믹쿼리가 존재할때에는 다이나믹 쿼리처리를 해줘야함.
//		boolean dqryFlag = false; 
//		dqryFlag =  parameters.containsKey("DQryParams");
//		String dqryParams[] =null;;
//		if( dqryFlag ){
//			// 콤마로 분류하여 동적쿼리 갯수만큼 치환작업을 한다.
//			// 1.. 콤마로 잘라 배열로 취득
//			dqryParams = parameters.get("DQryParams").toString().split(",");
//			
//		}
//		
//		while (matchRows.find()) {
//
//			String strRow = matchRows.group(0);
//			Pattern params = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
//			Matcher matchCol = params.matcher(strRow);
//			while (matchCol.find()) {
//				String para = matchCol.group(0).replace("@", "").trim();
//				if(null == parameters.get(para) || "".equals(parameters.get(para))){
//					SqlCommand = SqlCommand.replace(strRow, "");
//				}else{
//					try {
//						SqlCommand = SqlCommand.replace(strRow,strRow.replace("/*", "").replace("*/", ""));
//						//동적쿼리가 있으면 동적쿼리 수만큼 반복하여 같은 이름이 있는지 확인하여 있으면 치환한다.
//						if(dqryFlag){
//							//TODO 2. 배열 수만 큼 반복처리
//							for (String paramName : dqryParams) {
//								//TODO 3. 쿼리에서 동적쿼리파라메터명과 동일한 문장을 치환.
//								if( para.equals(paramName) ){
//									SqlCommand = SqlCommand.replaceAll("@" + para + "@" , parameters.get(paramName).toString());
//								}
//							}
//						}
//					} catch (Exception e) {
//						SqlCommand = SqlCommand.replace(strRow, "");
//					}
//				}
//			}
//		}
		 /* -------------------------------------  */
        /* 최종실행이 되는 문장만 실행시킴 */
        /* -------------------------------------   */
		int RowFrom = pagecnt * (viewpage-1);
	    int RowTo = pagecnt * (viewpage);
		//2013-12-17 khma : db분기처리 필요
//		SqlCommand = SqlCommand.replace("/* ORDER */", " ORDER BY " + orderStr );
//		
//		SqlCommand = "SELECT * FROM ( SELECT ROWNUM AS RNUM, B.RCOUNT,A.* "
//							+  "FROM (" 
//							+ SqlCommand 
//							+ ") A "
//							+", (SELECT count(*) as RCOUNT FROM (" + SqlCommand + ")) B"
//							+")WHERE RNUM <="+ RowTo + " AND RNUM >"+RowFrom;
		 SqlCommand = QueryGenerator.getPagingQry(dbType, SqlCommand, orderStr, viewpage, pagecnt);
		List<Map<String, Object>> ds = exeRead(SqlCommand, parameters, arrExtFilters, namedParameterJdbcTemplate);
		 
		return ds;
	}

	

	//	@Override
	public int insertNP(String SqlCommand, Map<String, String> parameters)
			throws DataAccessException {
		int rCnt;
		rCnt = namedParameterJdbcTemplate.update(SqlCommand, parameters);
		return rCnt;
	}
	public  int insertNP2(String SqlCommand, Map<String, Object> parameters)
			throws DataAccessException {
		int rCnt;
		rCnt = namedParameterJdbcTemplate.update(SqlCommand, parameters);
		return rCnt;
	}
	
	
	public String replaceNameTemplateType(String SqlCommand,
			Map<String, String> mapParam) {
		String rstSql = SqlCommand;
		Iterator<String> iterator = mapParam.keySet().iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			rstSql =  rstSql.replace("@" + key + "@", ":" + key);
		}
		
		return rstSql;
	}

	private int getSeqKey(String tbName) {
		
		int rltKey = 0;
		
		// 해당하는 테이블의 identity키값을 취득함.(nextval())
		//2013-12-17 khma : db분기처리 필요
		String seqName = MonarchSecurity.makeSecureString(tbName, 30) + "_seq";
		String strQry = "SELECT " + QueryGenerator.genSequenceStmt(DB_TYPE, seqName, false) + " as seqKey FROM dual";

		Map<String, Object> rstMap;
		try {
			rstMap = jdbcTemplate.queryForMap(strQry);
//			rstMap = getJdbcTemplate().queryForMap(strQry);
			
			if (!rstMap.isEmpty()) {
				rltKey = Integer.parseInt(rstMap.get("seqKey").toString());
			}

		} catch (Exception e) {
			return rltKey;
		}

		return rltKey;
	}
	
//	@Override
	public int uploadFile(String SqlCommand, final Map<String, String> parameters,
			final MultipartFile file) throws DataAccessException, IOException {
			 
			 int rCnt = 0;
			 rCnt =jdbcTemplate.update(SqlCommand, new PreparedStatementSetter() {
				 public void setValues(PreparedStatement ps) throws SQLException
				 {
					 ps.setString(1, parameters.get("FILE_NAME")); //파일명1
					 ps.setString(2, parameters.get("FILE_SIZE")); //크기2
					 ps.setString(3, parameters.get("FILE_CONTENT_TYPE")); //타입3
					 ps.setString(4, parameters.get("FILE_TYPE_CODE")); //유형4
					 ps.setString(5, parameters.get("LINK_URL")); //경로5
					 ps.setString(6, parameters.get("FILE_DESC")); //요약설명6
//					 ps.setString(7, parameters.get("상위정보")); //상위정보7
//					 ps.setString(8, parameters.get("상위키")); //상위키8
//					 ps.setString(9, parameters.get("폴더경로")); //폴더경로9
					 ps.setString(7, parameters.get("REG_USER")); //등록자10
					 ps.setString(8, parameters.get("UPD_USER")); //수정자11
					 ps.setString(10, parameters.get("M_USITE_NO")); //회원사번호
					 //유형이 경로이외일때만 데이터를 입력.
					 
					 InputStream fileAsStream = null;
					 try {
						 if("LINK_URL".equals(parameters.get("FILE_TYPE_CODE"))){
							 ps.setString(9, null); //내용12
						 } else if(DB_TYPE.equals("mariadb")){
							 //ps.setBinaryStream(9, CommonUtil.getByteArray(fileAsStream).toString()); //내용12
							fileAsStream = file.getInputStream();
//							 ps.setBinaryStream(9, fileAsStream, fileAsStream.toString().getBytes().length);
//							 ps.setBlob(9, fileAsStream);
//							 ps.setBlob(9, fileAsStream, fileAsStream.toString().getBytes().length);
							 ps.setBytes(9, file.getBytes());
						 } else{
							 fileAsStream = file.getInputStream();
							 lobHandler.getLobCreator().setBlobAsBinaryStream(ps, 9, fileAsStream,
									 fileAsStream.toString().getBytes().length);//내용12
						 }
					 } catch (IOException e) {
						e.printStackTrace();
					 } finally {
						 try {
//							 ps.close();
							fileAsStream.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					 }
				 }
				 
			 });
		return rCnt;
	}
	
	/**
	 * 파일다운로드 처리를 위한 DAO
	 */
//	@Override
	public Map<String, Object>  downloadFile(String SqlCommand, String fileKey ) throws DataAccessException, IOException {
		 
			Map<String, Object> rstMap =  jdbcTemplate.queryForMap(SqlCommand,fileKey);
		
		return rstMap;
	}
	/**
	 * Zip파일다운로드 처리를 위한 DAO
	 */
	public List<Map<String, Object>>  downloadZipFile(String sqlCommand, String fileKey ) throws DataAccessException, IOException {
		
		List<Map<String, Object>> rstMapList =  jdbcTemplate.queryForList(sqlCommand,fileKey);
		
		return rstMapList;
	}
	
	/**
	 * 프로시져 실행 후 셀렉트정보를 반환함
	 * @throws Exception 
	 */
//	@Override
	public List<Map<String,Object>> exeReadProcedure(String procedureCmd,
			Map<String, String> parameters,
			SimpleJdbcCall simpleJdbcCall) throws Exception {
		
		Pattern regs = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = regs.matcher(procedureCmd);
		Map<String, String> mapParam = new HashMap<String, String>();
		List<Map<String, Object>> rstMapList;
		//1. @프로시져명@
		//2. ,@파라메터1@
		//2. ,@파라메터2@
		//2. ,@파라메터3@
		//2. ,@파라메터X@
		int cnt = 0;
		String procedureName= "";
		//프로시져 정보 격납하기위한 리스트맵
		List<Map<String,Object>> procedureInfo =null;
				
				
		while (matchCol.find()) {
			String para = matchCol.group(0).replace("@", "").trim();
			try {
				if( 0 == cnt ) {
					//TODO 0번째 데이터는 프로시져명
					procedureName = para;
					//프로시져명을 검색키로 프로시져 정보를 취득한다.
					procedureInfo= getProcedureParamInfo(procedureName);
				}else{
					//TODO 프로시져파라메터 입력
					String _mapKey = getProcedureParamName(procedureInfo, cnt);
					String _data = parameters.get(para);
					//data가 존재하지 않으면 행을 삭제
					if(!StringUtils.isEmpty( _data )){
//						if(!_data.isEmpty()){
						mapParam.put(_mapKey, _data);
					}
				}
			} catch (Exception e1) {
				String _msg = "MonArch[CRUD :Read ] READ SQL에서 검색할 키["
						+ para
						+ "]값이 검색조건 변수로 전달되지 않았습니다. 구조체의 keyName에 해당변수가 전달되었는지 혹은 공백이 없는지 확인하세요. Sql : "
						+ procedureCmd + " / " + e1.getMessage();
				// TODO 예외처리
				throw new Exception(_msg);
			}
			cnt++;
		}
		
		//프로시져명을 셋팅
		simpleJdbcCall = simpleJdbcCall.withProcedureName(procedureName);
//		simpleJdbcCall.setProcedureName(procedureName);
		
		Map<String,Object> rstMap =  simpleJdbcCall.execute(mapParam);
		
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> listMap = new LinkedList<Map<String,Object>>();
		listMap = (List<Map<String, Object>>) rstMap.get(RETURN_PROCEDURE_KEY);
		
		return listMap;
	}
	
	public List<Map<String,Object>> exeReadProcedure(String procedureCmd,
			Map<String, String> parameters) throws Exception {
		return exeReadProcedure(procedureCmd, parameters, simpleJdbcCall);
	}
	
	
	
	/**
	 * 취득한 프로시져의 순번으로 프로시져의 파라메터명을 취득하는 메소드
	 * @param procedureInfo
	 * @param cnt
	 * @return
	 */
	private String getProcedureParamName(
			List<Map<String, Object>> procedureInfo, int cnt) {
		String parameterName = "";
		//TODO prciedureInfo에서 RN이 cnt와 동일한 데이터의 이름정보를 취득
		for (Map<String, Object> map : procedureInfo) {
			if(Integer.parseInt(map.get("RN").toString()) == cnt){
				parameterName = map.get("PARAMNAME").toString();
				break;
			}
		}
		return parameterName;
	}
	
	/**
	 * 프로시져명을 검색키로 프로시져 파라메터정보를 취득하는 메소드
	 * @param procedureName
	 * @return
	 */
	private List<Map<String,Object>> getProcedureParamInfo(String procedureName) {
		
		//원하는 프로시져나 함수의 파라메터를 구하기 위한 SQL
		//TODO 2013-12-17 khma : db분기처리 필요
		String sqlCommand = "SELECT ROWNUM AS RN ,OBJECT_NAME AS PNAME ,ARGUMENT_NAME AS PARAMNAME ,IN_OUT AS INOUT, POSITION " +
				"FROM ( SELECT UA.* " +
								"FROM USER_ARGUMENTS UA " +
								"WHERE OBJECT_NAME = :OBJECT_NAME AND IN_OUT = 'IN' ORDER BY POSITION)";
		Map<String,String> param = new HashMap<String, String>();
		List<Map<String,Object>> rst;
		param.put("OBJECT_NAME", procedureName);
		rst= namedParameterJdbcTemplate.queryForList(sqlCommand, param);
		
		return rst;
	}
	
	
	/**
	 * 배치처리를 위한 업데이트(springJDBC 오리지널)
	 * @param sqlComm
	 * @param parameters
	 * @return
	 */
	public int exeBatchForUpdate(String sqlComm, LinkedList<Map<String, String>> parameters){
		int rstCnt = 0;
		int size = parameters.size();
		Map[] mapParams = null;
		
		//대상건수가 1건이상일때 처리함.
		if(size > 0){
			mapParams = new HashMap[size];
			for (int i = 0; i < parameters.size() ; i++) {
				mapParams[i] = parameters.get(i);
			}
			
			int[] rst =  namedParameterJdbcTemplate.batchUpdate(sqlComm, mapParams);	
			rstCnt = rst.length;
		}else{
			return rstCnt;
		}
		return rstCnt;
	}

	public int exeBatchForUpdate(String sqlComm, List<Map<String, Object>> parameters){
		int rstCnt = 0;
		int size = parameters.size();
		Map[] mapParams = null;
		
		//대상건수가 1건이상일때 처리함.
		if(size > 0){
			mapParams = new HashMap[size];
			for (int i = 0; i < parameters.size() ; i++) {
				mapParams[i] = parameters.get(i);
			}
			
			int[] rst =  namedParameterJdbcTemplate.batchUpdate(sqlComm, mapParams);	
			rstCnt = rst.length;
		}else{
			return rstCnt;
		}
		return rstCnt;
	}
	
	

	/**
	 * 다이나믹 쿼리 셋팅 메소드 (파라메터에 DQryParams를 키로 데이터가 들어왔을경우)
	 * @param SqlCommand
	 * @param parameters
	 * @return
	 */
	public String setDynamicQuery(String SqlCommand, Map<String, String> parameters) {
		String rstSqlCommand = SqlCommand;
		Pattern rows = Pattern.compile("\\/[\\*](.*?)[@](.*?)[\\*]\\/",Pattern.MULTILINE);
		Matcher matchRows = rows.matcher(rstSqlCommand);
		
		//다이나믹쿼리가 존재할때에는 다이나믹 쿼리처리를 해줘야함.
		boolean dqryFlag = false; 
		if(null != parameters) {
			dqryFlag =  parameters.containsKey("DQryParams");
			String dqryParams[] =null;;
			if( dqryFlag ){
				// 콤마로 분류하여 동적쿼리 갯수만큼 치환작업을 한다.
				// 1.. 콤마로 잘라 배열로 취득
				dqryParams = parameters.get("DQryParams").toString().split(",");
				
			}
			
			while (matchRows.find()) {
				
				String strRow = matchRows.group(0);
				Pattern params = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
				Matcher matchCol = params.matcher(strRow);
				while (matchCol.find()) {
					String para = matchCol.group(0).replace("@", "").trim();
					if(null == parameters.get(para) || "".equals(parameters.get(para))){
						rstSqlCommand = rstSqlCommand.replace(strRow, "");
					}else{
						try {
							rstSqlCommand = rstSqlCommand.replace(strRow,strRow.replace("/*", "").replace("*/", ""));
							//동적쿼리가 있으면 동적쿼리 수만큼 반복하여 같은 이름이 있는지 확인하여 있으면 치환한다.
							if(dqryFlag){
								//TODO 2. 배열 수만 큼 반복처리
								for (String paramName : dqryParams) {
									//TODO 3. 쿼리에서 동적쿼리파라메터명과 동일한 문장을 치환.
									if( para.equals(paramName) ){
										rstSqlCommand = rstSqlCommand.replaceAll("@" + para + "@" , parameters.get(paramName).toString());
									}
								}
							}
						} catch (Exception e) {
							rstSqlCommand = rstSqlCommand.replace(strRow, "");
						}
					}
				}
			}
		}
		return rstSqlCommand;
	}
	
	
	public int exeUpdateSpringJdbcNameTemplate(String sql, Map<String, String> paramMap){
		return namedParameterJdbcTemplate.update(sql, paramMap);
	}
	
	public Map<String, Object> queryForMap(String sql, Map<String, String> paramMap){
		return namedParameterJdbcTemplate.queryForMap(sql, paramMap);
	}

	/**
	 * 로그인 시에 사용자 정보를 가져온다.
	 * @param userInfo : 로그인 정보를 담은 Map 형식의  인스턴스
	 *        [id]		사용자 ID
	 *        [pass]	사용자 비밀번호
	 *        [scode]	사이트 코드
	 * @return 사용자 정보를 담은 UserInfo 객체
	 * @throws UnsupportedEncodingException 
	 * @throws NoSuchAlgorithmException 
	 */
	public UserInfo exeLoginProcess(Map<String, Object> userInfo) throws NoSuchAlgorithmException, UnsupportedEncodingException {
		StringBuffer sb = new StringBuffer();
		
		sb.append("SELECT ")
		.append("  U.M_USER_NO AS USER_NO")
		.append(", U.USER_CODE")
		.append(", U.USER_NAME")
		.append(", "+ QueryGenerator.genNvlStmt(DB_TYPE, "U.CONN_DUR", "15", "int", false) + " AS AUTHTIME")
		.append(", "+ QueryGenerator.genNvlStmt(DB_TYPE, "U.MULTIPLE_LOGIN_FLAG", "0", null, false) + " AS DUPL_LOGIN_YN")
		.append(", NVL(U.MULTIPLE_LOGIN_FLAG,0) AS DUPL_LOGIN_YN")
		.append(", U.USER_LANG")
		.append(", S.SITE_LOGO")
		.append(", "+ QueryGenerator.genNvlStmt(DB_TYPE, "U.SITE", "'CEO'", null, false) + " AS GSITE")
		.append(", S.THEME")
		.append(", U.M_DEPT_NO AS DEPT_NO")
		.append(", D.DEPT_NAME")
		.append(", U.M_USITE_NO AS USITE_NO ")
		.append(", S.USITE_CODE AS USITE_CODE ")
		.append(", "+ QueryGenerator.genNvlStmt(DB_TYPE, "U.CONN_DUR", "60", "int", false) + " AS CONN_DUR")
		.append(", S.MENU_POSITION ")
		.append(", U.PW_UPD_DATE")
		.append(", CASE WHEN " + QueryGenerator.genNvlStmt(DB_TYPE, "R.M_ROLE_USER_NO", "0", null, false) + " = 0 THEN '0' ELSE '1' END AS DV_LEVEL ")
		//SeriCEO용 추가항목 CORP,CORP_NAME,TCORP,TCORP_NAME
		.append(", U.CORP ")
		.append(", (SELECT 거래처명 FROM 거래처 B WHERE B.거래처번호 = U.CORP) AS CORPNM ")
		.append(", U.TCORP ")
		.append(", (SELECT 거래처명 FROM 거래처 B WHERE B.거래처번호 = U.TCORP) AS TCORPNM ")
		.append(", FN_DVL_CONFIRM(U.M_USER_NO) AS dvLevel ")
		.append(", FN_EXCEL_AUTH(U.M_USER_NO) AS excelAuth ")
		.append("FROM   M_USER U")
		.append("       INNER JOIN M_USITE S")
		.append("       ON    S.M_USITE_NO = U.M_USITE_NO")
		.append("       LEFT  OUTER JOIN M_DEPT D")
		.append("       ON    D.M_DEPT_NO = U.M_DEPT_NO ")
		.append("       LEFT  OUTER JOIN M_ROLE_USER R ")
		.append("       ON    R.M_USER_NO = U.M_USER_NO ")
		.append("       AND   R.M_ROLE_NO = '2' ")
		.append("WHERE  U.USER_CODE = :id ")
		.append("AND    U.USER_PASSWORD = :MON_ENCRYPTED_PW ")
		.append("AND    S.USITE_CODE = :scode ")
		;
		
		//MON_ENCRYPTED_PW
		String pw = userInfo.get("pass").toString();
		String siteCode = userInfo.get("scode").toString();
		String userId = userInfo.get("id").toString();
		
		
		String enCryptedPw;
		enCryptedPw = QueryGenerator.encryptPw(pw, siteCode, userId);
		userInfo.put("MON_ENCRYPTED_PW",enCryptedPw);
		
		log.debug("★★★★★★★★★★：" + enCryptedPw);
		

		//UserInfo ui = namedParameterJdbcTemplate.queryForObject(sb.toString(), userInfo, new BeanPropertyRowMapper(UserInfo.class));
		UserInfo ui = namedParameterJdbcTemplate.queryForObject(sb.toString(), userInfo, new BeanPropertyRowMapper(UserInfo.class));
		return ui;
	}
	
	/**
	 * 로그인 실패 횟수를 세고 상태 값을 반환한다.
	 * @param userInfo
	 * @return [0] 실패 [1] 성공
	 * @throws Exception
	 */
	public int getFailedCount(Map<String, Object> userInfo) throws Exception {
		StringBuffer sb = new StringBuffer();
		sb.append("SELECT TO_CHAR(NVL(U.LOGIN_FAIL_CNT, 0)) AS FAIL_CNT ")
		.append(" , TO_CHAR(FLOOR((sysdate - U.UPD_DATE)*(24*60))) AS DIFF ")
		.append(" FROM   M_USER U ")
		.append(" INNER JOIN M_USITE S ")
		.append(" ON    S.M_USITE_NO = U.M_USITE_NO ")
		.append(" AND   S.USITE_CODE = :scode ")
		.append(" WHERE  U.USER_CODE = :id ")
		;
		
		Map<String, Object> resultMap = namedParameterJdbcTemplate.queryForMap(sb.toString(), userInfo);
		Integer failCnt = Integer.parseInt((String)resultMap.get("FAIL_CNT"));
		Integer diff = Integer.parseInt((String)resultMap.get("DIFF"));
		
		int result = 1;
		// 실패 횟수가 5회 이상이고 시간이 10분을 넘지 않을 경우 실패 값을 반환한다.
		if ( failCnt >= 5 && diff < 10 ) {
			result = 0;
		}
		else if ( diff >= 10 ) {
			updateFailedCount(userInfo, "0");
		}
		return result;
	}
	
	/**
	 * 로그인 실패 횟수를 수정한다.
	 * @param userInfo
	 * @param failCnt
	 * @return
	 * @throws Exception
	 */
	public int updateFailedCount(Map<String, Object> userInfo, String failCnt) throws Exception {
		StringBuffer sb = new StringBuffer();
		sb.append( "UPDATE M_USER ")
		.append( " SET UPD_DATE = SYSDATE ");
		if ( failCnt == null || failCnt.equals("") ) {
			// 로그인 실패 횟수를 1 증가시킨다.
			sb.append( " , LOGIN_FAIL_CNT = LOGIN_FAIL_CNT + 1 ");
		}
		else {
			// 로그인 실패 횟수를 지정한 값으로 바꾼다.
			sb.append( " , LOGIN_FAIL_CNT = " + failCnt + " ");
		}
		sb.append( " WHERE USER_CODE = :id ")
//		.append( " AND M_USITE_NO = ( SELECT M_USITE_NO FROM M_USITE WHERE USITE_CODE = :scode ) ")
		;
		
		// 로그인 실패 횟수 컬럼을 수정한다.
		int result = namedParameterJdbcTemplate.update(sb.toString(), userInfo);
		return result;
	}
}

