package co.kr.kydbm.core.service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonParser.Feature;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.bean.ResultInfo;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.bean.UserInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.meta.MetaCommCode;
import co.kr.kydbm.core.meta.MetaCommLabel;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.LanguageExchanger;
import co.kr.kydbm.core.utils.QueryGenerator;
/**
 *  모나크 메인 서비스 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */

@Controller
public class SvcCRUD {

	private static final String CREATE = "CREATE";
	private static final String CREATEIDENTITY = "CREATEIDENTITY";
	private static final String READ = "READ";
	private static final String UPDATE = "UPDATE";
	private static final String DELETE = "DELETE";
	private static final String LIST = "LIST";
	private static final String QUERY = "QUERY";
	private static final String EXCEL = "EXCEL";
	private static final String PROCEDURE_READ = "P_READ";
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	Logger log = Logger.getLogger(SvcCRUD.class);
//	MonArchExtDaoImpl monArchExtDaoImpl; 20140117
	

	
	/**
	 * DATACRUD를 외부로 접속하기 위한 메소드(차후 보완예정)
	 * @param XmlParms
	 * @return Object
	 * @throws Exception 
	 * @throws IOException 
	 * @throws JsonProcessingException 
	 */
	 @RequestMapping("/extSvc")
	 public ModelAndView extSvc( @RequestBody  String XmlParms, HttpServletRequest request, HttpSession session) throws Exception  {
		 return dataCRUD(XmlParms, request, session, true);
	 }
	
	/**
	 * DATACRUD
	 * @param XmlParms
	 * @return Object
	 * @throws Exception 
	 * @throws IOException 
	 * @throws JsonProcessingException 
	 */
	 @RequestMapping("/DATACRUD")
	  public ModelAndView dataCRUD( @RequestBody  String XmlParms, HttpServletRequest request, HttpSession session, boolean extOpt) throws Exception  {
		
		ResultInfo resultInfo = new ResultInfo(); //결과정보 
		//String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		String xmlParams  = parsingForJonType(XmlParms);
		List<Map<String,Object>> ds = null;
		//json스트링을 객체로 전환
        String sqlComm = "";
//        String rlt = "";
        int nRlt = 0;
        String service = "";
        String method  = "";
        String uId = "";
        String uSite = "";
        String gSite = "";
        String key = "";
        //20130312 khma SCODE추가 
        String uSiteCode = null;
        //20121025 khma 추가 로그용 
        String MENUID = "";
        String STEPMENU = "";
        String ACTIONNAME = "";
        String KeyString = "";
        long 서비스시작시간 = System.currentTimeMillis();//서비스시작시간
        
        
		//json 데이터를 읽어서 타입변경하기
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		ServiceInfo  si= null;
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
//		monArchExtDaoImpl =new MonArchExtDaoImpl(); //20140117
		try{
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			service = obj.get("service");
			method = obj.get("method");
			uId = obj.get("UID");
			
			if(StringUtils.isNotEmpty(obj.get("USITE"))){
				uSite = obj.get("USITE");
			}else{
				uSite = "44";
			}

			if(StringUtils.isNotEmpty(obj.get("GSITE"))){
				gSite = obj.get("GSITE");
			}else{
				gSite = "CEO";
			}
			
			MENUID = obj.get("MENUID");
			STEPMENU = obj.get("STEPMENU");
			ACTIONNAME = obj.get("ACTIONNAME");
             /*인증시작*/
			// 이전 방식 사용자 인증 : UKEY를 가지고 procedure()를 이용, 사용자 정보를 가져온다. 
//            if (("").equals(obj.get("UKEY"))) {
//            	//파라메터로 UKEY를 셋팅
//            	Map<String, String> mapAuthParam = new HashMap<String, String>();
//            	mapAuthParam.put("V_KEY", obj.get("UKEY"));
//                //SQL 로그인 인증 프로시져 호출을 위한 쿼리 작성
//                String SqlCommand = "@USP_LOGINAUTH@, @V_KEY@";
//                //호출 및 결과 반환
//                List<Map<String, Object>> authInfo = monArchDao.exeReadProcedure(SqlCommand, mapAuthParam);
//                //결과 확인후 처리
//                if ("0".equals(authInfo.get(0).get("MESSAGE_CODE").toString())) {
//                    uId = authInfo.get(0).get("M_USER_NO").toString();
//                    uSite = authInfo.get(0).get("M_USITE_NO").toString();
//                } else {
//                	resultInfo.setResult(CommonConst.FAIL);
//                	resultInfo.setErrorCode("E00001");
//                	resultInfo.setMessage("인증실패");
//                	//resultInfo.setExceptionMsg(exceptionMsg);
//                	return new ModelAndView("", CommonConst.RESULT_INFO, resultInfo);
//                }
//            } else if (method == "정보" || method == "정보테스트") {
//                Map<String, String> mapAuthParam = new HashMap<String, String>();
//            	mapAuthParam.put("V_KEY", obj.get("USER_AUTH_KEY"));
//            	String SqlCommand = "@USP_LOGINAUTH@, @V_KEY@";
//            	List<Map<String, Object>> authInfo = monArchDao.exeReadProcedure(SqlCommand, mapAuthParam);
//            	 if ("0".equals(authInfo.get(0).get("MESSAGE_CODE").toString())) {
//                     uId = authInfo.get(0).get("M_USER_NO").toString();
//                     uSite = authInfo.get(0).get("M_USITE_NO").toString();
//                 } else {
////                 	throw new Exception("인증실패");
//                 	resultInfo.setResult(CommonConst.FAIL);
//                 	resultInfo.setErrorCode("E00001");
//                 	resultInfo.setMessage("인증실패");
//                 	//resultInfo.setExceptionMsg(exceptionMsg);
//                	 return new ModelAndView("", CommonConst.RESULT_INFO, resultInfo);
//                 }
//
//            }
            //인증종료*/

			// 세션에서 사용자 정보 가져오기
			String sAuthValue = (String)session.getAttribute("authValue");
			String mAuthValue = obj.get("UKEY");
			if ( !sAuthValue.equals(mAuthValue) ) {
                String _msg = "인증 오류가 발생하였습니다.";
                log.error( _msg);
            	resultInfo.setResult(CommonConst.FAIL);
            	resultInfo.setErrorCode("E00011");
            	resultInfo.setMessage(_msg);
            	//resultInfo.setExceptionMsg(exceptionMsg);
                return new ModelAndView("", CommonConst.RESULT_INFO, resultInfo);
			}
			UserInfo userInfo = (UserInfo)session.getAttribute("userInfo");
        	// 세션에서 가져온 유저 정보를 가지고 uid와 usite에 넣어준다.
			
			if(!extOpt){
	        	uId = userInfo.getUserNo();
	        	uSite = userInfo.getUsiteNo();
	        	gSite = userInfo.getGSite();
			}else {
				//extOpt가 아니면 uSite는 
			}
			
			try{
				key = obj.get("key");
			}catch (Exception e) {
				key = "0";
			}
			
			//해당하는 서비스와 메소드 회원사번호로 쿼리를 읽어옴
			if ( CommonConst.MON_COMMON.equals(service)) { //서비스가 MON_COMMON일 경우는 모나크 공통서비스 이용을 위한 처리임
				si = monArchDao.ReadQuery(service,method,"44");  // MON_COMMON일때에는 [1] 모나크프레임워크 공통서비스 이용
				
				if(method.equals("USER_CREATE") || method.equals("USER_UPDATE") ){
					//TODO 해당 서비스 일때에는 패스워드 필드를 솔트적용하여 해싱화 SHA256  시킴
					// USER_CREATE =>@USER_PASSWORD@
					if(obj.containsKey("USER_PASSWORD")) {
						String encryptedPw = QueryGenerator.encryptPw(obj.get("USER_PASSWORD"), userInfo.getUsiteCode(),obj.get("USER_CODE"));
						obj.put("MON_ENCRYPTED_NEW_PW", encryptedPw);
					}
					
				} else if (method.equals("MYINFO_UPDATE")){
					//TODO 해당 서비스 일때에는 패스워드 필드를 솔트적용하여 해싱화 SHA256  시킴
					//MYINFO_UPDATE || USER_UPDATE => @NEW_USER_PASSWORD@
					// TODO @ENCRYPTED_PASSWORD@ 를 강제로 파라메터로 추가하여 사용
					if(obj.containsKey("NEW_USER_PASSWORD")) {
						String encryptedNewPw = QueryGenerator.encryptPw(obj.get("NEW_USER_PASSWORD"),  userInfo.getUsiteCode(), userInfo.getUserCode());
						String encryptedCurrPw = QueryGenerator.encryptPw(obj.get("USER_PASSWORD"), userInfo.getUsiteCode(), userInfo.getUserCode());
						obj.put("MON_ENCRYPTED_NEW_PW", encryptedNewPw);
						obj.put("MON_ENCRYPTED_CURR_PW", encryptedCurrPw);
					}
				} 
				
			} else {
				si = monArchDao.ReadQuery(service,method,uSite);
			}
			
			if(si == null && method.equals("EXCEL")){
                si = monArchDao.ReadQuery(service, "LIST", uSite);
                if (si == null)
                {
                	si = ReadSvc(service, "LIST");
                }
                si.setJobType("EXCEL");
			}
			
			if (si == null)
            {
                si = ReadSvc(service, method);
            }
			
            if (si == null)
            {
                String _msg = "MonArch[CRUD Service] : " + service + " - " + method + "에 해당되는 서비스쿼리를 찾을수 없습니다.";
                log.error( _msg);
            	resultInfo.setResult(CommonConst.FAIL);
            	resultInfo.setErrorCode("E00002");
            	resultInfo.setMessage(_msg);
            	//resultInfo.setExceptionMsg(exceptionMsg);
                return new ModelAndView("", CommonConst.RESULT_INFO, resultInfo);
            }
            
            resultInfo.setJobType(si.getJobType()); //resultInfo에 실행하는 실행타입을 셋팅
            
//        	log.debug("해당 사용자가 서비스[" + si.getSvcID() + ":" + si.getJobType() + "] 이용 " + userInfo.toString());
            
            if(CREATE.equals(si.getJobType()) ){
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
                if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource()); //20140117
//            		nRlt = monArchExtDaoImpl.exeCreate(si.getSql(), obj); //20140117
                	nRlt = monArchDao.exeCreate(si.getSql(), obj, monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource())); //20140117
            	}else{
            		nRlt = monArchDao.exeCreate(si.getSql(), obj);
            	}
                
//				String tempSql = "'rlt':'CREATE', 'RltCount':{0} ";
//                rlt = "{"+MessageFormat.format(tempSql, new Object[]{nRlt}) + "}";
//                Map<String, Object> rltMap = new HashMap<String, Object>();
//                rltMap.put("rlt", "CREATE");
//                rltMap.put("RltCount", nRlt);
//                ds = new ArrayList<Map<String,Object>>();
//                ds.add(rltMap);
                
            }else if(CREATEIDENTITY.equals(si.getJobType()) ){
            	
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
                if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource());	//20140117
//            		nRlt = monArchExtDaoImpl.exeCreateIdentity(si.getSql(), si.getTbName(),obj); //20140117
                	nRlt = monArchDao.exeCreateIdentity(si.getSql(), si.getTbName(),obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()),si.getTargetDatasource()); //20140117
            	}else{
            		nRlt = monArchDao.exeCreateIdentity(si.getSql(), si.getTbName(),obj);
            	}
                
//                rlt = "{"+MessageFormat.format(tempSql, new Object[]{nRlt}) + "}";
                Map<String, Object> rltMap = new HashMap<String, Object>();
//                rltMap.put("rlt", "CREATEIDENTITY");
//                rltMap.put("RltCount", nRlt);
                rltMap.put("rltKey", nRlt); //시퀀스 키
                ds = new ArrayList<Map<String,Object>>();
                ds.add(rltMap);
                
            }else if(READ.equals(si.getJobType()) ){
            	
            	//데이터 취득하고 JSON형태로 변환
//            	List<Map<String,Object>> ds = monArchDao.exeRead(si.getSql(), obj);
            	
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
            	if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource()); //20140117
//            		ds = monArchExtDaoImpl.exeRead(si.getSql(), obj); //20140117
            		ds = monArchDao.exeRead(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource())); //20140117);
            	}else{
            		ds = monArchDao.exeRead(si.getSql(), obj);
            	}
            	
            }else if(UPDATE.equals(si.getJobType()) ){
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
                if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource()); //20140117
//            		nRlt = monArchExtDaoImpl.exeUpdate(si.getSql(), obj); //20140117
                	nRlt = monArchDao.exeUpdate(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource())); //20140117);
            	}else{
            		nRlt = monArchDao.exeUpdate(si.getSql(), obj);
            	}
                
//                String tempSql = "'rlt':'UPDATE', 'RltCount':{0} ";
//                rlt = "{"+MessageFormat.format(tempSql, new Object[]{nRlt}) + "}";
//                Map<String, Object> rltMap = new HashMap<String, Object>();
//                rltMap.put("rlt", "CREATE");
//                rltMap.put("RltCount", nRlt);
//                ds = new ArrayList<Map<String,Object>>();
//                ds.add(rltMap);
                
            }else if(DELETE.equals(si.getJobType()) ){
            	
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
            	if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource());  //20140117
//            		nRlt = monArchExtDaoImpl.exeUpdate(si.getSql(), obj); //20140117
            		nRlt = monArchDao.exeUpdate(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource())); //20140117);
            	}else{
            		nRlt = monArchDao.exeUpdate(si.getSql(), obj);
            	}
            	
//                String tempSql = "'rlt':'DELETE', 'RltCount':{0} ";
//                rlt = "{"+MessageFormat.format(tempSql, new Object[]{nRlt}) + "}";
//                Map<String, Object> rltMap = new HashMap<String, Object>();
//                rltMap.put("rlt", "DELETE");
//                rltMap.put("RltCount", nRlt);
//                ds = new ArrayList<Map<String,Object>>();
//                ds.add(rltMap);
            }else if(LIST.equals(si.getJobType()) ){
            	
            	//orderby에 대한 SQL injection방지에 대해서... 20130124 jwkim Start
            	String prevOrderType = obj.get("_order");
            	String newOrderType = obj.get("_sort");
            	String OrderStr = prevOrderType;
            	if(StringUtils.isNotEmpty(newOrderType)){
            		OrderStr = CommonUtil.getOrderByStatement(newOrderType);
            	}
            	//orderby에 대한 SQL injection방지에 대해서... 20130124 jwkim End

            	
            	int viewpage =  Integer.parseInt(obj.get("_viewpage"));
            	int pagecnt =  Integer.parseInt(obj.get("_pagecnt"));
            	
            	 //확장필드 처리 Start 2011107 khma
            	String extFilterObj = obj.get("extFilters");
            	//extFilterObj = parsingForJonType(extFilterObj);
            	Map<String, Object> extFilters = new HashMap<String,Object>();
            	ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String,Object>>();
            	if( StringUtils.isNotEmpty(extFilterObj)){
            		om.configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            		extFilters = om.readValue(extFilterObj, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
            		arrExtFilters = (ArrayList<Map<String, Object>>) extFilters.get("extFilters");
            	}
                //확장필드 처리 End 20131107 khma
                
            	
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
            	if(!StringUtils.isEmpty(si.getTargetDatasource()) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource()); //20140117
//            		ds  = monArchExtDaoImpl.exeList(si.getSql(), obj, OrderStr, viewpage , pagecnt, arrExtFilters); //20140117
            		ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, viewpage , pagecnt, arrExtFilters,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()),monArchDao.getDbType(si.getTargetDatasource())); //20140117);
            	}else{
            		ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, viewpage , pagecnt, arrExtFilters);
            	}
            	
//            	rlt = om.writeValueAsString(ds);
            	
            }else if(QUERY.equals(si.getJobType()) ){
            	
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
            	if(!StringUtils.isEmpty(si.getTargetDatasource()) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource());  //20140117
//            		nRlt = monArchExtDaoImpl.exeQuery(si.getSql(), obj);  //20140117
            		nRlt = monArchDao.exeQuery(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource())); //20140117);
            	}else{
            		nRlt = monArchDao.exeQuery(si.getSql(), obj);
            	}
            	
            }else  if(EXCEL.equals(si.getJobType()) ){
//                String exOrderStr =  obj.get("_viewpage");
//                int exviewpage = 1;
//                int expagecnt = 99999999;
//                String OrderStr = obj.get("_order");
//                //EXCEL처리
//                //1. 데이터 취득
//                ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, exviewpage , expagecnt);
//                //TODO 2. 액셀다운로드 처리 
//                ExcelDownload excelDownload = new ExcelDownload();
//                excelDownload.downExcel(ds, Service, si.getJobType());
////                rlt = "{" + string.Format(@"'rlt':'EXCEL', 'RltCount':{0}", "0") + "}";
//                String tempSql = "{'rlt':'EXCEL', 'RltCount':{0}}";
//                rlt =  java.text.MessageFormat.format(tempSql, String.valueOf(ds.size()));
                
            }else if(PROCEDURE_READ.equals(si.getJobType())){
            	//TODO 프로시져 처리후 SELECT를 반환할때
            	//데이터 취득하고 
//            	ds = monArchDao.exeReadProcedure(si.getSql(), obj);
            	//외부커넥션인지 코어커넥션인지 구분하여 처리
            	if(!StringUtils.isEmpty(si.getTargetDatasource()) && !si.getTargetDatasource().equals("DEFAULT") ){
//            		monArchExtDaoImpl.setDS(si.getTargetDatasource());  //20140117
//            		ds = monArchExtDaoImpl.exeReadProcedure(si.getSql(), obj);  //20140117
            		ds = monArchDao.exeReadProcedure(si.getSql(), obj,monArchDao.getExtSimpleJdbcCall(si.getTargetDatasource())); //20140117);
            	}else{
            		ds = monArchDao.exeReadProcedure(si.getSql(), obj);
            	}
            }else{
            	throw new Exception("존재하지 않는 실행타입입니다.");
            }
            
            log.info("[svcCRUD] " + service + ", " + method + ", " + MENUID);
            resultInfo.setMenuId(MENUID);
            resultInfo.setMessage("[Service] " + service + ", " + "[Method] " + method);
            resultInfo.setResult(CommonConst.SUCCESS); //처리 성공
            long 서비스종료시간 = System.currentTimeMillis();//서비스종료시간
			long 서비스소요시간 = 서비스종료시간 - 서비스시작시간;
			사용로그(service, method, key, xmlParams, uSite, uId, 서비스소요시간, MENUID, STEPMENU, ACTIONNAME);
		}
		catch (DataAccessException e) {
			//데이터엑세스 예외처리
			e.printStackTrace();
			String sqlCommand = "";
			String outputMsg =  CommonConst.COMM_ERROR_MESSAGE;
//			errmsg.match(new RegExp("\\${(.*?)}\\$", "gim"))
			//ORA - 2000 번 이상일때는 RAISE 에러로 발생시킨 오류이므로 해당 오류 메시지를 강제로 출력한다.
			String exceptionMsg = e.getMostSpecificCause().getMessage();
			if(exceptionMsg.indexOf("ORA-20000") >= 0) {
				String ORA_REGEX_PARAM = "\\$\\{.*\\}\\$";
				Pattern params = Pattern.compile(ORA_REGEX_PARAM, Pattern.MULTILINE);
				Matcher matchStr = params.matcher(exceptionMsg);
				
				while (matchStr.find()) {
					outputMsg = matchStr.group(0).replace("${", "").trim();
					outputMsg = outputMsg.replace("}$", "").trim();
				}
			}
			
			if(null != si ) sqlCommand = si.getSql();
			
			String msg = "MonArch[CRUD Service] : " + e.getMessage() + "\r\r ----------------- \r Service = " + service + "\r Method = " + method;
			//String msg = "예상치 못한 에러가 발생하였습니다. \r 관리자에게 문의하여 주십시요.";
			log.error(msg, e);
			Log("DATACRUD", sqlCommand, msg, uSite, uId);
			
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00003", outputMsg));
//			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00001", MetaCommMsg.getMessage("E00001", "ja", "test", "test") ,e.getMessage()));
		}
		catch (Exception e) {
			//그외 예외처리
			e.printStackTrace();
			
			String sqlCommand = "";
			if(null != si ) sqlCommand = si.getSql();
			
			String msg = e.getMessage();
			log.error(msg, e);
			Log("DATACRUD", sqlCommand, msg, uSite, uId);
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00004", CommonConst.COMM_ERROR_MESSAGE));
		}
		ModelAndView mav = new ModelAndView("", CommonConst.RESULT_DATA, ds);
//		mav.addObject(new ResultInfo(CommonConst.SUCCESS));
		mav.addObject(resultInfo);
		return mav;
	 }

	private String parsingForJonType(String xmlParams) throws UnsupportedEncodingException {
		String rstData = xmlParams;
		rstData = URLDecoder.decode(xmlParams, "UTF-8");
		rstData = rstData.replaceAll("\\n", "\\\\n");
		rstData = rstData.replaceAll("\\t", "\\\\t");
		return rstData;
	}
	
	/**
	 * 구조체 취득 메소드(외부)
	 * @return
	 * @throws Exception 
	 */
	@RequestMapping("/getExtJs")
	  public ModelAndView getExtJson(@RequestBody  String XmlParms) throws Exception  {
		return getJson(XmlParms);
	}
	
	/**
	 * 구조체 취득 메소드
	 * @return
	 * @throws Exception 
	 */
	@RequestMapping("/GetJs")
	  public ModelAndView getJson(@RequestBody  String XmlParms) throws Exception  {
		
		//String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		//xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
		String xmlParams = parsingForJonType(XmlParms);
//		String JsName, String UID, String UNM, String USITE
		//JsName = System.Web.HttpUtility.UrlDecode(JsName); //URL에 넘어온 데이터를 디코딩함
        String SqlCommand = ""; //sql문
        String rlt = ""; //결과
        String JsName;
    	String UID="";
    	String UNM="";
    	String USITE="";
    	String GSITE="";
    	String srcType = "json";
    	String USER_LANG = "ko";
    	String MENUID = "";
    	
        Map<String, String> obj;
    	Map<String, Object> rstMap = null;
		ObjectMapper om = new ObjectMapper();
//			JsonNode root = om.readTree(detailParms); //노드트리 방식으로 가져옴
		
		ResultInfo resultInfo = null;
        try
        {
        	resultInfo = new ResultInfo();
        	
        	obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
        	JsName = obj.get("JsName");
        	UID = obj.get("UID");
        	UNM = obj.get("UNM");
        	USITE = obj.get("USITE");
        	GSITE = obj.get("GSITE");
        	if(null != obj.get("ULANG")){
        		USER_LANG = obj.get("ULANG").toString();
        	}
        	MENUID = obj.get("MENUID");
        	
        	if( null != obj.get("srcType") ){
        		srcType = obj.get("srcType");
        	}
    		//2013-12-17 khma : db분기처리 쿼리구조상 처리가 필요없음.
        	SqlCommand = "SELECT " ;
        	if("html".equals(srcType)){
        		SqlCommand += "a.HTML_CONT " ;
        	}else{
        	SqlCommand += 	"a.STRUCTURE_CONT ";
        	}
        	SqlCommand += " FROM M_STRUCTURE  a WHERE a.STRUCTURE_NAME = :STRUCTURE_NAME and a.M_USITE_NO = :M_USITE_NO";

//        	SqlCommand = "SELECT a.구조체내용 FROM 구조체  a WHERE a.구조체명 = :구조체명 and a.회원사번호 = :회원사번호";
        	Map<String, String> namedParameters = new HashMap<String,String>(); 
        	namedParameters.put("STRUCTURE_NAME", obj.get("JsName"));
        	namedParameters.put("M_USITE_NO", USITE);
        	
        	MonArchDaoImpl monArchDao = new MonArchDaoImpl();
        	rstMap = monArchDao.readJs(SqlCommand, namedParameters);
        	if("html".equals(srcType)){
        		//HTML라벨을 치환후  HTML내용의 맵을 변경
        		String replacedHtml = "";
        		LanguageExchanger languageExchanger = new LanguageExchanger();
        		replacedHtml = languageExchanger.jsonToHtml(rstMap.get("HTML_CONT").toString(),USER_LANG);
        		rstMap.remove("HTML_CONT");
        		rstMap.put("HTML_CONT", replacedHtml);
        	}
        	
        	resultInfo.setMenuId(MENUID);
        	resultInfo.setResult(CommonConst.SUCCESS);
        }
        catch (DataAccessException e) {
			//데이터엑세스 예외처리
			e.printStackTrace();

			String sqlCommand = "";
//			if(null != si ) sqlCommand = si.getSql();
			String msg = "MonArch[CRUD Service] : " + e.getMessage();
			log.error(msg,e);
			Log("GetJs", SqlCommand, msg, USITE, UID);
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00004", CommonConst.COMM_ERROR_MESSAGE));
		}catch (Exception e) {
			//그외 예외처리
			e.printStackTrace();
			log.error(CommonConst.COMM_ERROR_MESSAGE, e);
			Log("GetJs", SqlCommand, CommonConst.COMM_ERROR_MESSAGE, USITE, UID);
//			throw new Exception(msg);
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00004", CommonConst.COMM_ERROR_MESSAGE));
		}
        
//		ModelAndView mav = new ModelAndView("", "Rows", rstMap);
		ModelAndView mav = new ModelAndView("", CommonConst.RESULT_DATA, rstMap);
		mav.addObject(resultInfo);
		return mav;
	}
	
	
	@RequestMapping("/GetCode")
	  public ModelAndView getCode(@RequestBody  
			  String XmlParms) throws Exception  {
		
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		
		xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
    	
        Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		List<Map<String,Object>> ds = null;
		ResultInfo rstInfo = null;

        try
        {
        	obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
        	String key = "";
        	String userLang = "ko"; //default는 ko
        	String usite = "44"; // 공통 코드는 1 usite데이터가 존재하지 않을때에는 1로 셋팅하여 검색함.
        	String gsite = "CEO"; // 공통 코드는 CEO gsite데이터가 존재하지 않을때에는 CEO로 셋팅하여 검색함.
        	if(null != obj.get("CODE_GRP")){
        		key = obj.get("CODE_GRP");
        		
        		if(null != obj.get("ULANG")){ //유저별 언어 정보를 취득하여 셋팅함
        			userLang = obj.get("ULANG"); 
        		}
        		if(null != obj.get("USITE")){ //유저별 언어 정보를 취득하여 셋팅함
        			usite = obj.get("USITE"); 
        		}
        		if(null != obj.get("GSITE")){ //유저별 언어 정보를 취득하여 셋팅함
        			gsite = obj.get("GSITE"); 
        		}
        		
    			ds = MetaCommCode.getCodeList(key, userLang, usite);
        	}
    		rstInfo = new ResultInfo(CommonConst.SUCCESS);
    		rstInfo.setMenuId(obj.get("MENUID"));
        }catch (Exception e) {
			//그외 예외처리
			e.printStackTrace();
			String msg = "공통코드 취득중 에러가 발생하였습니다.";
			 log.error(msg,e);
			
			rstInfo =  new ResultInfo(CommonConst.FAIL, "E00004", msg);
		}
        	if(null == ds){
        		ds = new ArrayList<Map<String,Object>>();
        	}
        	ModelAndView mav = new ModelAndView("", CommonConst.RESULT_DATA, ds);
    		mav.addObject(rstInfo);
        	return mav;
	}
	
	@RequestMapping("/GetCodes")
	public ModelAndView GetCodes(@RequestBody String XmlParms) throws Exception  {
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		List<Map<String,Object>> ds = null;
		ResultInfo rstInfo = null;
		
		try {
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			//String key = "";
        	String userLang = "ko"; //default는 ko
        	String usite = "44"; // 공통 코드는 1 usite데이터가 존재하지 않을때에는 1로 셋팅하여 검색함.
        	
			if ( null != obj.get("CODE_GRP") ) {
				ds = new ArrayList<Map<String,Object>>();
				String[] key = obj.get("CODE_GRP").split(",");

        		if(null != obj.get("ULANG")){ //유저별 언어 정보를 취득하여 셋팅함
        			userLang = obj.get("ULANG"); 
        		}
        		if(null != obj.get("USITE")){ //유저별 언어 정보를 취득하여 셋팅함
        			usite = obj.get("USITE"); 
        		}
        		
        		for ( String codeGrp : key ) {
        			ds.addAll(MetaCommCode.getCodeList(codeGrp, userLang, usite));
        		}
        		//ds = MetaCommCode.getCodeList(key, userLang, usite);
			}
    		rstInfo = new ResultInfo(CommonConst.SUCCESS);
    		rstInfo.setMenuId(obj.get("MENUID"));
		}
		catch ( Exception e ) {
			//그외 예외처리
			e.printStackTrace();
			String msg = "공통코드 취득중 에러가 발생하였습니다.";
			log.error(msg,e);
			
			rstInfo =  new ResultInfo(CommonConst.FAIL, "E00004", msg);
		}
		
    	ModelAndView mav = new ModelAndView("", CommonConst.RESULT_DATA, ds);
		mav.addObject(rstInfo);
    	return mav;
	}
	
	/**
	 * 지정한 서비스의 쿼리에서 컬럼리스트를 추출하는 메소드
	 * @param XmlParms
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/GeSqltColList")
	  public ModelAndView getSqlColList(@RequestBody  String XmlParms) throws Exception  {
		
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
  	
      Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		List<Map<String,Object>> ds = null;

      try
      {
      	obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
      	//TODO
      	
      	
      }catch (Exception e) {
			//그외 예외처리
			String msg = "컬럼 목록을 취득하는 중 예기지 못한 에러가 발생하였습니다.";
			 log.error( msg,e);
			throw new Exception(msg, e);
		}
      	if(null == ds){
      		ds = new ArrayList<Map<String,Object>>();
      	}
      	ModelAndView mav = new ModelAndView("", "Rows", ds);
      	return mav;
	}
	
	/**
	 * 공통코드 초기화 요청 메소드
	 * @param XmlParms
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/initMetaCode")
	public ModelAndView initMetaCode(@RequestBody  String XmlParms) throws Exception  {
		ResultInfo rstInfo= null;
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		try
		{
			xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
			
			log.info("[xmlParams] " + xmlParams);
			Map<String, String> obj;
			ObjectMapper om = new ObjectMapper();
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			
			MetaCommCode.init();
			rstInfo = new ResultInfo(CommonConst.SUCCESS);
			rstInfo.setMenuId(obj.get("MENUID"));
		}catch (Exception e) {
			//그외 예외처리
			e.printStackTrace();
			log.error(e.getMessage(), e);
			rstInfo = new ResultInfo(CommonConst.FAIL,"","공통코드 적용 실패", "공통코드를 적용중 예기치못한 에러가 발생하였습니다.");
		}
		//6, 처리결과값 리턴
		ModelAndView mav = new ModelAndView("", CommonConst.RESULT_INFO, rstInfo);
		return mav;
	}
	
	/**
	 * 공통라벨 초기화 요청 메소드
	 * @param XmlParms
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/initMetaLabel")
	public ModelAndView initMetaLabel(@RequestBody  String XmlParms) throws Exception  {
		ResultInfo rstInfo= null;
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		try
		{
			xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
			
			log.info("[xmlParams] " + xmlParams);
			Map<String, String> obj;
			ObjectMapper om = new ObjectMapper();
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			
			MetaCommLabel.init();
			rstInfo = new ResultInfo(CommonConst.SUCCESS);
			rstInfo.setMenuId(obj.get("MENUID"));
		}catch (Exception e) {
			//그외 예외처리
			e.printStackTrace();
			log.error(e.getMessage() ,e);
			rstInfo = new ResultInfo(CommonConst.FAIL,"","공통라벨 적용 실패", "공통라벨을 적용중 예기치못한 에러가 발생하였습니다.");
		}
		//6, 처리결과값 리턴
		ModelAndView mav = new ModelAndView("", CommonConst.RESULT_INFO, rstInfo);
		return mav;
	}
	
	/**
	 * 오류내용 기록 로그
	 * @param 구분
	 * @param 실행명령
	 * @param 오류내용
	 * @param 회원사번호
	 * @param 등록자
	 */
	public void Log (String serviceCallName, String execQuery, String errorMessage, String mUsiteNo, String regUser){

		Map<String,String> logParam = new HashMap();
		if(StringUtils.isEmpty(regUser)) regUser = "1";
		if(StringUtils.isEmpty(mUsiteNo)) mUsiteNo = "44";
		logParam.put("SERVICE_CALL_NAME", serviceCallName);
		logParam.put("EXEC_QUERY", execQuery);
		logParam.put("ERROR_MESSAGE", errorMessage);
		logParam.put("M_USITE_NO", mUsiteNo);
		logParam.put("REG_USER", regUser);
		
		//2013-12-17 khma : db분기처리 
		String sqlCommand = "";
		String seqCol = "";
		String seqNo = "";
		
		sqlCommand =" INSERT INTO M_ERROR_LOG ( " 
					+QueryGenerator.genSequenceCol(DB_TYPE, "M_ERROR_LOG_NO", true) 
					+"OCCUR_DATE, " +
					"SERVICE_CALL_NAME,EXEC_QUERY,ERROR_MESSAGE,M_USITE_NO,REG_USER ,UPD_USER,REG_DATE,UPD_DATE"
				    +") VALUES ("
					+ QueryGenerator.genSequenceStmt(DB_TYPE, "M_ERROR_LOG_SEQ", true)
					+ QueryGenerator.genSysDate(DB_TYPE, true)
					+" @SERVICE_CALL_NAME@, @EXEC_QUERY@, @ERROR_MESSAGE@, @M_USITE_NO@," 
					+ QueryGenerator.genNvlStmt(DB_TYPE, "@REG_USER@", "1","string",true) 
					+ QueryGenerator.genNvlStmt(DB_TYPE, "@UPD_USER@", "1", "string",true) 
					+ QueryGenerator.genSysDate(DB_TYPE, true)
					+ QueryGenerator.genSysDate(DB_TYPE, false)
					+ ")";
		
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		monArchDao.exeCreate(sqlCommand, logParam);
	}
	
	/**
	 *사용 기록 로그
	 * @param 서비스
	 * @param 메소드
	 * @param KEY
	 * @param 요청문서
	 * @param 회원사번호
	 * @param 사용자
	 * @param 소요시간
	 */
	public void 사용로그(String serviceName, String methodName, String keyValue, String reqDoc, String mUsiteNo, String mUserNo, long 소요시간,
			String MENUID, String STEPMENU, String ACTIONNAME ){
		
		if(StringUtils.isNotEmpty(reqDoc) && reqDoc.length() > 2000 ) reqDoc = reqDoc.substring(0, 2000);
		if(StringUtils.isEmpty(mUserNo)) mUserNo = "1";
		if(StringUtils.isEmpty(mUsiteNo)) mUsiteNo = "44";
		
		Map<String,String> uselogParam = new HashMap();
		
		uselogParam.put("M_USITE_NO", mUsiteNo);
		uselogParam.put("M_USER_NO", mUserNo);
		uselogParam.put("SERVICE_NAME", serviceName);
		uselogParam.put("METHOD_NAME", methodName);
		uselogParam.put("REQ_DOC", reqDoc);
		uselogParam.put("ELAPSED_TIME", String.valueOf(소요시간));
		uselogParam.put("KEY_VALUE", keyValue);
		uselogParam.put("MENU_MGMT_NO", MENUID);
		uselogParam.put("STEP_MENU", STEPMENU);
		uselogParam.put("ACTION_NAME", ACTIONNAME);
		
		//2013-12-17 khma : db분기처리
		String sqlCommand = "";
		sqlCommand =" INSERT INTO M_USE_LOG ( " 
					+ QueryGenerator.genSequenceCol(DB_TYPE, "M_USE_LOG_NO", true)
					+ "M_USITE_NO,M_USER_NO,SERVICE_NAME,METHOD_NAME,REQ_DOC,ELAPSED_TIME,KEY_VALUE, MENU_MGMT_NO, STEP_MENU, ACTION_NAME"
				    + ") VALUES ("
				    + QueryGenerator.genSequenceStmt(DB_TYPE, "M_USE_LOG_SEQ", true)
					+ "@M_USITE_NO@, @M_USER_NO@, @SERVICE_NAME@, @METHOD_NAME@,@REQ_DOC@ ,@ELAPSED_TIME@,@KEY_VALUE@,@MENU_MGMT_NO@,@STEP_MENU@, @ACTION_NAME@)";
		
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		monArchDao.exeCreate(sqlCommand, uselogParam);
	}
	

	
	/**
	 * XML형식의 구조체를 읽어오는 메소드(미작성)
	 * @param service
	 * @param method
	 * @return
	 */
	public ServiceInfo ReadSvc(String service, String method) {
		//TODO ReadSvc
		ServiceInfo si = null; //반환객체
		//TODO XML형식의 구조체를 읽어오는 메소드???
		return si;
	}
	
	
	// Exception 처리 메소드 
	@ExceptionHandler(Exception.class)
	public ModelAndView handleException(Exception e, HttpServletResponse response){
		// 구현
		// e 객체에 익셉션에러 들어있음
		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		Map<String, Object> rstMap = new HashMap<String, Object>();
		//rstMap.put("errorMessage", e.getMessage());
		rstMap.put("errorMessage", CommonConst.COMM_ERROR_MESSAGE);
		ModelAndView mav = new ModelAndView("", rstMap);
		return mav;
	}

	/**
	 * 사용자 정보를 가져와 초기화하는 서비스
	 * @param XmlParms
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/getUserInfo")
	public ModelAndView getUserInfo(HttpSession session) throws Exception  {
		ModelAndView mav = new ModelAndView();
		ResultInfo rstInfo = null;
		
		try {
			UserInfo userInfo = (UserInfo)session.getAttribute("userInfo");
			
			if ( userInfo != null ) {
				rstInfo = new ResultInfo(CommonConst.SUCCESS);
				rstInfo.setMessage("사용자 정보" + userInfo.toString());
				mav.addObject("userInfo", userInfo);
			}
			else {
				rstInfo = new ResultInfo(CommonConst.FAIL, "", "사용자 정보 가져오기 실패", CommonConst.COMM_ERROR_MESSAGE);
				mav.addObject(CommonConst.RESULT_INFO, rstInfo);
				mav.setViewName("/index.jsp");
			}
		}
		catch (Exception e) {
			//그외 예외처리
			e.printStackTrace();
			log.error(e.getMessage(), e);
			rstInfo = new ResultInfo(CommonConst.FAIL, "", "사용자 정보 가져오기 실패", CommonConst.COMM_ERROR_MESSAGE);
			mav.addObject(CommonConst.RESULT_INFO, rstInfo);
			mav.setViewName("/index.jsp");
			return mav;
		}

		mav.addObject("resultInfo", rstInfo);
		return mav;
	}
	
	
}
