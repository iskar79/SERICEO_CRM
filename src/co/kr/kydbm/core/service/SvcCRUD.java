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
 * SERICEO CRM MonArch 8.2.0 메인 동적 CRUD 트랜잭션 서비스 컨트롤러
 * 
 * [시스템 역할 및 요청 라이프사이클]
 * - 프론트엔드 통신 관문(jquery.kdb.soap.2.0.js)의 AJAX POST 요청(/DATACRUD.json, /GetJs, /GetCode, /extSvc)을 수신
 * - 수신된 JSON 페이로드 파싱, 세션 인증 유효성 검증(authValue, userInfo) 및 권한 주입
 * - 서비스 메타데이터(ServiceInfo) 조회 후 FilterGenerator / QueryGenerator를 통한 동적 SQL 및 페이징 구문 생성
 * - MonArchDaoImpl을 통한 데이터베이스 트랜잭션 실행(LIST, READ, CREATE, UPDATE, DELETE, P_READ)
 * - 처리 결과를 ResultInfo 및 ResultData 모델에 적재하여 MappingJacksonJsonViewEx를 통해 JSON으로 반환
 * - Oracle ORA-20000 사용자 정의 비즈니스 예외 파싱(${...}$) 및 시스템 에러 표준화 처리
 * 
 * @author Ma KyoungHo
 * @company KYDBM
 * @version 2.0 2026-11-04
 * @since version 1.0.0 2012-12-01
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
	

	
	/**
	 * 외부 시스템 연동용 DATACRUD 서비스 진입점 (/extSvc)
	 * 
	 * @param XmlParms JSON 포맷의 요청 파라미터 문자열
	 * @param request HttpServletRequest 요청 객체
	 * @param session HttpSession 세션 객체
	 * @return 실행 결과 및 ResultInfo가 포함된 ModelAndView 객체
	 * @throws Exception 데이터 처리 중 발생 가능한 예외
	 */
	 @RequestMapping("/extSvc")
	 public ModelAndView extSvc( @RequestBody  String XmlParms, HttpServletRequest request, HttpSession session) throws Exception  {
		 return dataCRUD(XmlParms, request, session, true);
	 }
	
	/**
	 * MonArch 공통 데이터 CRUD 핵심 디스패처 메서드 (/DATACRUD)
	 * 
	 * [주요 처리 흐름]
	 * 1. 요청 파라미터 안전 디코딩 (parsingForJonType) 및 Jackson ObjectMapper를 통한 맵 역직렬화
	 * 2. 세션 인증 토큰(authValue)과 요청 토큰(UKEY) 비교 검증 및 UserInfo 세션 객체 취득
	 * 3. 서비스명(service), 메소드명(method), 사이트번호(uSite) 기반의 ServiceInfo 메타데이터 취득
	 * 4. 쿼리 유형(LIST, READ, CREATE, UPDATE, DELETE 등)에 따른 동적 파라미터 바인딩 및 DAO 실행
	 * 5. DB 예외(DataAccessException) 발생 시 ORA-20000 비즈니스 에러 메시지 추출 및 로깅
	 * 6. 정상/실패 결과를 MonArch 표준 규격인 ResultInfo(SUCCESS/FAIL) 및 RESULT_DATA로 반환
	 * 
	 * @param XmlParms 클라이언트에서 전송된 JSON 형태의 CRUD 요청 파라미터
	 * @param request HttpServletRequest 요청 객체
	 * @param session HttpSession 세션 객체
	 * @param extOpt 외부 서비스 호출 여부 플래그
	 * @return 결과 데이터셋(ds) 및 ResultInfo가 바인딩된 ModelAndView
	 * @throws Exception 데이터 처리 중 발생하는 예외
	 */
	 @RequestMapping("/DATACRUD")
	  public ModelAndView dataCRUD( @RequestBody  String XmlParms, HttpServletRequest request, HttpSession session, boolean extOpt) throws Exception  {
		
		ResultInfo resultInfo = new ResultInfo();
		// 20261104 khma : parsingForJonType을 try 블록 내부로 이동하여 파싱 예외 시에도 FAIL ResultInfo 응답 반환 보장
		String xmlParams = "";
		List<Map<String,Object>> ds = null;
        String sqlComm = "";
        int nRlt = 0;
        String service = "";
        String method  = "";
        String uId = "";
        String uSite = "";
        String gSite = "";
        String key = "";
        String uSiteCode = null;
        String MENUID = "";
        String STEPMENU = "";
        String ACTIONNAME = "";
        String KeyString = "";
        long 서비스시작시간 = System.currentTimeMillis();
        
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		ServiceInfo  si= null;
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		try{
			// 20261113 khma : 1) 요청 JSON 파라미터 디코딩 및 서비스/메뉴 기본 정보 추출
			xmlParams = parsingForJonType(XmlParms);
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){});
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

			// 20261113 khma : 2) 세션 인증 토큰(authValue vs 요청 UKEY) 검증 및 세션 사용자(UserInfo) 반영
			String sAuthValue = (String)session.getAttribute("authValue");
			String mAuthValue = obj.get("UKEY");
			if ( !sAuthValue.equals(mAuthValue) ) {
                String _msg = "인증 오류가 발생하였습니다.";
                log.error( _msg);
            	resultInfo.setResult(CommonConst.FAIL);
            	resultInfo.setErrorCode("E00011");
            	resultInfo.setMessage(_msg);
                return new ModelAndView("", CommonConst.RESULT_INFO, resultInfo);
			}
			UserInfo userInfo = (UserInfo)session.getAttribute("userInfo");
			
			// 외부 호출(extOpt=true)이 아닌 경우 세션 사용자 정보 기준으로 UID/USITE/GSITE 강제 세팅
			if(!extOpt){
	        	uId = userInfo.getUserNo();
	        	uSite = userInfo.getUsiteNo();
	        	gSite = userInfo.getGSite();
			}
			
			try{
				key = obj.get("key");
			}catch (Exception e) {
				key = "0";
			}
			
			// 20261113 khma : 3) 서비스 메타데이터(ServiceInfo) 조회 (MON_COMMON은 공통 사이트 "44" 기준)
			if ( CommonConst.MON_COMMON.equals(service)) {
				si = monArchDao.ReadQuery(service,method,"44");
				
				// 사용자 생성/수정 시 비밀번호 평문을 솔트 적용 SHA-256 해시로 변환하여 파라미터에 주입
				if(method.equals("USER_CREATE") || method.equals("USER_UPDATE") ){
					if(obj.containsKey("USER_PASSWORD")) {
						String encryptedPw = QueryGenerator.encryptPw(obj.get("USER_PASSWORD"), userInfo.getUsiteCode(),obj.get("USER_CODE"));
						obj.put("MON_ENCRYPTED_NEW_PW", encryptedPw);
					}
					
				} else if (method.equals("MYINFO_UPDATE")){
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
			
			// EXCEL 요청 시 전용 서비스가 없으면 동일 서비스의 LIST 쿼리를 대체 조회
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
                return new ModelAndView("", CommonConst.RESULT_INFO, resultInfo);
            }
            
            resultInfo.setJobType(si.getJobType());
            
            // 20261113 khma : 4) JobType(CREATE/CREATEIDENTITY/READ/UPDATE/DELETE/LIST/QUERY/P_READ)별 DAO 실행
            if(CREATE.equals(si.getJobType()) ){
                if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
                	nRlt = monArchDao.exeCreate(si.getSql(), obj, monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()));
            	}else{
            		nRlt = monArchDao.exeCreate(si.getSql(), obj);
            	}
                
            }else if(CREATEIDENTITY.equals(si.getJobType()) ){
                if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
                	nRlt = monArchDao.exeCreateIdentity(si.getSql(), si.getTbName(),obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()),si.getTargetDatasource());
            	}else{
            		nRlt = monArchDao.exeCreateIdentity(si.getSql(), si.getTbName(),obj);
            	}
                
                // 채번된 시퀀스 키(rltKey)를 결과 리스트에 담아 반환
                Map<String, Object> rltMap = new HashMap<String, Object>();
                rltMap.put("rltKey", nRlt);
                ds = new ArrayList<Map<String,Object>>();
                ds.add(rltMap);
                
            }else if(READ.equals(si.getJobType()) ){
            	if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
            		ds = monArchDao.exeRead(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()));
            	}else{
            		ds = monArchDao.exeRead(si.getSql(), obj);
            	}
            	
            }else if(UPDATE.equals(si.getJobType()) ){
                if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
                	nRlt = monArchDao.exeUpdate(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()));
            	}else{
            		nRlt = monArchDao.exeUpdate(si.getSql(), obj);
            	}
                
            }else if(DELETE.equals(si.getJobType()) ){
            	if(!StringUtils.isEmpty( si.getTargetDatasource() ) && !si.getTargetDatasource().equals("DEFAULT") ){
            		nRlt = monArchDao.exeUpdate(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()));
            	}else{
            		nRlt = monArchDao.exeUpdate(si.getSql(), obj);
            	}
            }else if(LIST.equals(si.getJobType()) ){
            	// 정렬 파라미터(_sort) SQL 인젝션 방어용 화이트리스트 정제
            	String prevOrderType = obj.get("_order");
            	String newOrderType = obj.get("_sort");
            	String OrderStr = prevOrderType;
            	if(StringUtils.isNotEmpty(newOrderType)){
            		OrderStr = CommonUtil.getOrderByStatement(newOrderType);
            	}

            	int viewpage =  Integer.parseInt(obj.get("_viewpage"));
            	int pagecnt =  Integer.parseInt(obj.get("_pagecnt"));
            	
            	// 확장 검색 필터(extFilters) JSON 배열 파싱
            	String extFilterObj = obj.get("extFilters");
            	Map<String, Object> extFilters = new HashMap<String,Object>();
            	ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String,Object>>();
            	if( StringUtils.isNotEmpty(extFilterObj)){
            		om.configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            		extFilters = om.readValue(extFilterObj, new TypeReference<Map<String, Object>>(){});
            		arrExtFilters = (ArrayList<Map<String, Object>>) extFilters.get("extFilters");
            	}
                
            	if(!StringUtils.isEmpty(si.getTargetDatasource()) && !si.getTargetDatasource().equals("DEFAULT") ){
            		ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, viewpage , pagecnt, arrExtFilters,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()),monArchDao.getDbType(si.getTargetDatasource()));
            	}else{
            		ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, viewpage , pagecnt, arrExtFilters);
            	}
            	
            }else if(QUERY.equals(si.getJobType()) ){
            	if(!StringUtils.isEmpty(si.getTargetDatasource()) && !si.getTargetDatasource().equals("DEFAULT") ){
            		nRlt = monArchDao.exeQuery(si.getSql(), obj,monArchDao.getExtNamedParameterJdbcTemplate(si.getTargetDatasource()));
            	}else{
            		nRlt = monArchDao.exeQuery(si.getSql(), obj);
            	}
            	
            }else if(EXCEL.equals(si.getJobType()) ){
                // 엑셀 다운로드는 UploadController(/downExcel.json) 및 ExcelDownload에서 별도 스트리밍 처리
                
            }else if(PROCEDURE_READ.equals(si.getJobType())){
            	// 저장 프로시저 호출 및 결과셋 반환
            	if(!StringUtils.isEmpty(si.getTargetDatasource()) && !si.getTargetDatasource().equals("DEFAULT") ){
            		ds = monArchDao.exeReadProcedure(si.getSql(), obj,monArchDao.getExtSimpleJdbcCall(si.getTargetDatasource()));
            	}else{
            		ds = monArchDao.exeReadProcedure(si.getSql(), obj);
            	}
            }else{
            	// 20261113 khma : 실행타입 미존재 시 원인 파악을 위해 service/method/usite/jobType 정보 함께 기록
            	throw new Exception("존재하지 않는 실행타입입니다. [service=" + service + ", method=" + method + ", usite=" + uSite + ", jobType=" + (si != null ? si.getJobType() : "null") + "]");
            }
            
            // 20261113 khma : 5) 실행 성공 ResultInfo 설정 및 사용 이력(M_USE_LOG) 저장
            log.info("[svcCRUD] " + service + ", " + method + ", " + MENUID);
            resultInfo.setMenuId(MENUID);
            resultInfo.setMessage("[Service] " + service + ", " + "[Method] " + method);
            resultInfo.setResult(CommonConst.SUCCESS);
            long 서비스종료시간 = System.currentTimeMillis();
			long 서비스소요시간 = 서비스종료시간 - 서비스시작시간;
			사용로그(service, method, key, xmlParams, uSite, uId, 서비스소요시간, MENUID, STEPMENU, ACTIONNAME);
		}
		catch (DataAccessException e) {
			// 20261104 khma : DB 예외 발생 시 printStackTrace 대신 Log4j 및 M_ERROR_LOG에 기록하고 ORA-20000 사용자 메시지 추출
			String sqlCommand = "";
			String outputMsg =  CommonConst.COMM_ERROR_MESSAGE;
			// 오라클 프로시저/트리거 RAISE_APPLICATION_ERROR(ORA-20000)의 ${메시지}$ 패턴 추출
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
			log.error(msg, e);
			Log("DATACRUD", sqlCommand, msg, uSite, uId);
			
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00003", outputMsg));
		}
		catch (Exception e) {
			// 20261104 khma : 일반 예외 발생 시 printStackTrace 제거 및 Log4j/M_ERROR_LOG 기록
			String sqlCommand = "";
			if(null != si ) sqlCommand = si.getSql();
			
			String msg = e.getMessage();
			log.error(msg, e);
			Log("DATACRUD", sqlCommand, msg, uSite, uId);
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00004", CommonConst.COMM_ERROR_MESSAGE));
		}
		ModelAndView mav = new ModelAndView("", CommonConst.RESULT_DATA, ds);
		mav.addObject(resultInfo);
		return mav;
	 }

	/**
	 * 클라이언트 전송 JSON 파라미터 디코딩 및 특수문자 이스케이프 보정 메서드
	 * 
	 * - null 파라미터 수신 시 안전하게 빈 문자열("") 반환 (NullPointerException 방어)
	 * - URL UTF-8 디코딩 수행
	 * - 문자열 내 줄바꿈(\n) 및 탭(\t) 문자를 JSON 파서가 올바르게 인식하도록 이스케이프(\\n, \\t) 처리
	 * 
	 * @param xmlParams 원본 인코딩 문자열
	 * @return 정제된 디코딩 JSON 문자열
	 * @throws UnsupportedEncodingException 인코딩 미지원 시 발생
	 */
	// 20261104 khma : null 파라미터 방어 및 특수문자 안전 치환
	private String parsingForJonType(String xmlParams) throws UnsupportedEncodingException {
		if (xmlParams == null) {
			return "";
		}
		String rstData = xmlParams;
		rstData = URLDecoder.decode(xmlParams, "UTF-8");
		rstData = rstData.replaceAll("\\n", "\\\\n");
		rstData = rstData.replaceAll("\\t", "\\\\t");
		return rstData;
	}
	
	/**
	 * 외부 시스템 연동용 화면 구조체 취득 메서드 (/getExtJs)
	 * 
	 * @param XmlParms 구조체 요청 파라미터 JSON 문자열
	 * @return 구조체 데이터 및 ResultInfo가 바인딩된 ModelAndView
	 * @throws Exception 구조체 조회 예외
	 */
	@RequestMapping("/getExtJs")
	  public ModelAndView getExtJson(@RequestBody  String XmlParms) throws Exception  {
		return getJson(XmlParms);
	}
	
	/**
	 * 모나크 동적 화면 레이아웃 및 그리드 구조체(M_STRUCTURE) 취득 메서드 (/GetJs)
	 * 
	 * [주요 처리 흐름]
	 * 1. 파라미터 안전 디코딩 (parsingForJonType) 및 구조체명(JsName), 사이트번호(USITE) 취득
	 * 2. M_STRUCTURE 테이블에서 구조체 정의(STRUCTURE_CONT, HTML_CONT) 동적 조회
	 * 3. HTML 모드(srcType == "html")인 경우 LanguageExchanger를 통한 다국어 라벨 치환
	 * 4. 조회 실패 시 에러 ResultInfo(FAIL, E00004) 및 SQL 에러 로그 기록
	 * 
	 * @param XmlParms 구조체 요청 파라미터 (JsName, UID, USITE, srcType, ULANG 등)
	 * @return 구조체 데이터 맵(rstMap) 및 ResultInfo가 포함된 ModelAndView
	 * @throws Exception 구조체 조회 처리 예외
	 */
	@RequestMapping("/GetJs")
	  public ModelAndView getJson(@RequestBody  String XmlParms) throws Exception  {
		
		// 20261104 khma : parsingForJonType을 try 블록 내부로 이동
		/*
		String xmlParams = parsingForJonType(XmlParms);
		*/
		String xmlParams = "";
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
        	xmlParams = parsingForJonType(XmlParms);
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
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/

			String sqlCommand = "";
//			if(null != si ) sqlCommand = si.getSql();
			String msg = "MonArch[CRUD Service] : " + e.getMessage();
			log.error(msg,e);
			Log("GetJs", SqlCommand, msg, USITE, UID);
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL, "E00004", CommonConst.COMM_ERROR_MESSAGE));
		}catch (Exception e) {
			//그외 예외처리
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/
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
	
	
	/**
	 * 공통코드 그룹(CODE_GRP) 단건 조회 메서드 (/GetCode)
	 * 
	 * - 클라이언트에서 요청한 CODE_GRP에 해당하는 공통코드 목록을 MetaCommCode 메모리 캐시에서 조회
	 * - 사이트별(USITE) 및 사용자 언어별(ULANG) 다국어 코드명 매핑
	 * 
	 * @param XmlParms 공통코드 요청 파라미터 JSON 문자열
	 * @return 공통코드 리스트(ds) 및 ResultInfo가 바인딩된 ModelAndView
	 * @throws Exception 공통코드 취득 예외
	 */
	@RequestMapping("/GetCode")
	  public ModelAndView getCode(@RequestBody  
			  String XmlParms) throws Exception  {
		
		// 20261104 khma : URL 디코딩을 try 블록 내부로 이동하여 안전성 보강
		/*
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
		*/
		String xmlParams = "";
    	
        Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		List<Map<String,Object>> ds = null;
		ResultInfo rstInfo = null;

        try
        {
        	xmlParams = parsingForJonType(XmlParms);
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
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/
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
	
	/**
	 * 복수 공통코드 그룹(CODE_GRP 쉼표 구분) 다건 일괄 조회 메서드 (/GetCodes)
	 * 
	 * - 여러 공통코드 그룹(예: "USER_TYPE,STATUS,DEPT")을 쉼표로 분리하여 한 번에 조회
	 * - 화면 초기 렌더링 시 통신 횟수를 최소화하기 위한 일괄 조회 API
	 * 
	 * @param XmlParms 공통코드 그룹 리스트가 포함된 JSON 요청 파라미터
	 * @return 병합된 공통코드 데이터셋(ds) 및 ResultInfo가 바인딩된 ModelAndView
	 * @throws Exception 코드 취득 처리 예외
	 */
	@RequestMapping("/GetCodes")
	public ModelAndView GetCodes(@RequestBody String XmlParms) throws Exception  {
		// 20261104 khma : URL 디코딩을 try 블록 내부로 이동하여 안전성 보강
		/*
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = xmlParams.replaceAll("\\n", "\\\\n");
		*/
		String xmlParams = "";
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		List<Map<String,Object>> ds = null;
		ResultInfo rstInfo = null;
		
		try {
			xmlParams = parsingForJonType(XmlParms);
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
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/
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
	 * 공통코드(MetaCommCode) 메모리 캐시 강제 재적재/초기화 메서드 (/initMetaCode)
	 * - 관리자 화면 또는 공통코드 관리에서 변경 사항 발생 시 서버 메모리 캐시를 즉시 갱신
	 * 
	 * @param XmlParms 초기화 요청 파라미터 JSON 문자열
	 * @return 처리 결과 ResultInfo가 포함된 ModelAndView
	 * @throws Exception 초기화 처리 중 발생하는 예외
	 */
	@RequestMapping("/initMetaCode")
	public ModelAndView initMetaCode(@RequestBody  String XmlParms) throws Exception  {
		ResultInfo rstInfo= null;
		// 20261104 khma : URL 디코딩을 try 블록 내부로 이동하여 안전성 보강
		/*
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		*/
		String xmlParams = "";
		try
		{
			xmlParams = parsingForJonType(XmlParms);
			log.info("[initMetaCode xmlParams] " + xmlParams);
			Map<String, String> obj;
			ObjectMapper om = new ObjectMapper();
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			
			MetaCommCode.init();
			rstInfo = new ResultInfo(CommonConst.SUCCESS);
			rstInfo.setMenuId(obj.get("MENUID"));
		}catch (Exception e) {
			//그외 예외처리
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/
			log.error(e.getMessage(), e);
			rstInfo = new ResultInfo(CommonConst.FAIL,"","공통코드 적용 실패", "공통코드를 적용중 예기치못한 에러가 발생하였습니다.");
		}
		//6, 처리결과값 리턴
		ModelAndView mav = new ModelAndView("", CommonConst.RESULT_INFO, rstInfo);
		return mav;
	}
	
	/**
	 * 공통라벨(MetaCommLabel) 메모리 캐시 강제 재적재/초기화 메서드 (/initMetaLabel)
	 * - 화면 다국어 라벨 정보 변경 시 서버 메모리 캐시를 즉시 갱신
	 * 
	 * @param XmlParms 초기화 요청 파라미터 JSON 문자열
	 * @return 처리 결과 ResultInfo가 포함된 ModelAndView
	 * @throws Exception 초기화 처리 중 발생하는 예외
	 */
	@RequestMapping("/initMetaLabel")
	public ModelAndView initMetaLabel(@RequestBody  String XmlParms) throws Exception  {
		ResultInfo rstInfo= null;
		// 20261104 khma : URL 디코딩을 try 블록 내부로 이동하여 안전성 보강
		/*
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		*/
		String xmlParams = "";
		try
		{
			xmlParams = parsingForJonType(XmlParms);
			log.info("[initMetaLabel xmlParams] " + xmlParams);
			Map<String, String> obj;
			ObjectMapper om = new ObjectMapper();
			obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			
			MetaCommLabel.init();
			rstInfo = new ResultInfo(CommonConst.SUCCESS);
			rstInfo.setMenuId(obj.get("MENUID"));
		}catch (Exception e) {
			//그외 예외처리
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/
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
	
	
	// 20261104 khma Start : @ExceptionHandler 표준 ResultInfo JSON 응답 구조 통일 및 보안 로거 적용
	/**
	 * SvcCRUD 컨트롤러 예외 처리 핸들러
	 * - 컨트롤러 내부에서 미처리된 예외 발생 시 표준 ResultInfo(FAIL, E00004) JSON 모델 반환
	 * - 기존 errorMessage 단일 문자열 반환 결함을 개선하여 공통 AJAX(soap.2.0.js) 표준 규격과 100% 일치화
	 * - HTTP 200(SC_OK)를 유지하여 jQuery AJAX 성공/실패 핸들러 계약 및 화면 화이트스크린 방어
	 * 
	 * @param e 발생한 예외 객체
	 * @param request HttpServletRequest 객체
	 * @param response HttpServletResponse 객체
	 * @return 표준 ResultInfo가 포함된 ModelAndView
	 */
	@ExceptionHandler(Exception.class)
	public ModelAndView handleException(Exception e, HttpServletRequest request, HttpServletResponse response){
		log.error("SvcCRUD 미처리 예외 발생 [URI: " + (request != null ? request.getRequestURI() : "") + "] : " + e.getMessage(), e);
		
		response.setStatus(HttpServletResponse.SC_OK);
		
		ResultInfo resultInfo = new ResultInfo();
		resultInfo.setResult(CommonConst.FAIL);
		resultInfo.setErrorCode("E00004");
		resultInfo.setMessage(CommonConst.COMM_ERROR_MESSAGE);
		
		Map<String, Object> rstMap = new HashMap<String, Object>();
		rstMap.put(CommonConst.RESULT_INFO, resultInfo);
		rstMap.put("errorMessage", CommonConst.COMM_ERROR_MESSAGE); // 구형 레거시 호출 호환성 유지
		
		ModelAndView mav = new ModelAndView("", rstMap);
		return mav;
	}
	// 20261104 khma End : @ExceptionHandler 표준 ResultInfo JSON 응답 구조 통일 및 보안 로거 적용

	/**
	 * 세션 내 사용자 정보(UserInfo) 취득 및 화면 초기화 메서드 (/getUserInfo)
	 * 
	 * @param session HttpSession 세션 객체
	 * @return UserInfo 및 ResultInfo가 바인딩된 ModelAndView
	 * @throws Exception 사용자 정보 취득 예외
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
			// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 로거로 에러 기록
			/*
			e.printStackTrace();
			*/
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
