package co.kr.kydbm.core.service;

import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.bean.ResultInfo;
import co.kr.kydbm.core.bean.UserInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.QueryGenerator;

import javax.servlet.http.HttpSession;

/**
 * 세션 로그인·로그아웃 및 접속 이력(M_USE_LOG) 관리 컨트롤러
 * 
 * @author Ma KyoungHo
 * @company KYDBM
 * @version 2.0 2026-11-18
 * @since 2012.07.19
 */
@Controller
public class LoginController {
	
	private Logger log = Logger.getLogger(LoginController.class);
	// 20261118 khma : 접속 이력(M_USE_LOG) 저장 시 DB 유형별 시퀀스 구문 생성을 위한 설정 참조
	private static ConfigProperties prop = ConfigProperties.getInstance();
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	
	/**
	 * index 페이지에서 화면 이동 처리 - 세션 유무에 따라 화면이 달라진다.
	 * @param request
	 * @param response
	 * @param session
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/index")
	public ModelAndView indexPageProcess(HttpServletRequest request, HttpServletResponse response, HttpSession session)
			throws Exception  {
		
		ResultInfo resultInfo = null;

		try {
			response.setHeader("Set-Cookie", "name=value; HttpOnly");

			resultInfo = new ResultInfo(); //결과정보 

			UserInfo userInfo = (UserInfo)session.getAttribute("userInfo");
			
			String redirectUrl = "";
			if ( userInfo == null ) {
				log.info("UserInfo is nothing in Session.");
				
				resultInfo.setResult(CommonConst.FAIL);
				resultInfo.setErrorCode("E0009");
				redirectUrl = "loginProcess";
			}
			else if ( !userInfo.getUserNo().equals("") ) {
				log.info("UserInfo is already.");

				// 세션 정보 invalid
				Enumeration<String> attrNames = session.getAttributeNames();
				while(attrNames.hasMoreElements()) {
					String attrName = attrNames.nextElement();
					session.removeAttribute(attrName);
				}
				session.invalidate();
				
				// 새로운 세션 생성
				session = request.getSession();
				// 사용자 정보 속성 추가
				session.setAttribute("userInfo", userInfo);
				session.setMaxInactiveInterval((userInfo.getConnDur()*60));
				
				UUID uid = UUID.randomUUID();
				String strRand = "";
				MessageDigest md = MessageDigest.getInstance("SHA-256");
				md.update(uid.toString().getBytes());
				byte byteData[] = md.digest();
				StringBuffer sb = new StringBuffer();
				for ( byte dByte : byteData ) {
					sb.append(Integer.toString((dByte&0xff) + 0x100, 16).toString());
				}
				strRand = sb.toString();
				
				session.setAttribute("authValue", strRand);
				
				// 결과 세팅 : 이미 로그인이 되어있기 때문에 메인 화면으로 넘겨준다.
				resultInfo.setResult(CommonConst.SUCCESS);
				resultInfo.setMessage("사용자 정보 : " + userInfo.toString());
				redirectUrl = "middle";
			}
			else {
				resultInfo.setResult(CommonConst.FAIL);
				resultInfo.setErrorCode("E0001");
				resultInfo.setMessage("UserInfo is incorrected.");
				redirectUrl = "loginProcess";
			}
			
			ModelAndView mv = new ModelAndView(redirectUrl);
			mv.addObject(CommonConst.RESULT_INFO, resultInfo);
			return mv;
		}
		catch (Exception e) {
			// 20261118 khma : printStackTrace() 제거 및 Log4j 에러 로깅 적용
			/*
			e.printStackTrace();
			log.debug(e.getMessage());
			*/
			log.error("indexPageProcess 처리 중 오류 발생 : " + e.getMessage(), e);
			
			session.invalidate();
			
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001");
			resultInfo.setMessage(CommonConst.COMM_ERROR_MESSAGE);
			return new ModelAndView("loginProcess", CommonConst.RESULT_INFO, resultInfo);
		}
	}
	
	/**
	 * 모나크 메인 화면으로 이동 시에 거치는 처리
	 * @param request
	 * @param response
	 * @param session
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/main")
	public ModelAndView mainPageProcess(HttpServletRequest request, HttpServletResponse response, HttpSession session)
			throws Exception  {
		ResultInfo resultInfo = new ResultInfo();
		
		try {
			resultInfo.setResult(CommonConst.SUCCESS);
			resultInfo.setMessage("메인 화면으로 이동");
			
			// TODO as moved display
			
			ModelAndView mv = new ModelAndView("monform");
			mv.addObject(CommonConst.RESULT_INFO, resultInfo);
			return mv;
		}
		catch ( Exception e ) {
			// 20261118 khma : printStackTrace() 제거 및 Log4j 에러 로깅 적용
			/*
			e.printStackTrace();
			*/
			log.error("mainPageProcess 처리 중 오류 발생 : " + e.getMessage(), e);
			
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001");
			resultInfo.setMessage("메인 화면 접근 불가");
			
			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			return new ModelAndView("loginProcess").addObject(CommonConst.RESULT_INFO, resultInfo);
		}
	}
	
	/**
	 * 세션 정보 입력 & 로그인 처리 및 접속 이력(M_USE_LOG) 기록
	 * @param data
	 * @param request
	 * @param response
	 * @param session
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="/login", method={RequestMethod.POST})
	public ModelAndView loginPageProcess(@RequestParam Map<String, Object> data
			, HttpServletRequest request, HttpServletResponse response, HttpSession session)
			throws Exception  {
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		
		ResultInfo resultInfo = null;
		// 20261118 khma : 로그인 처리 소요시간 측정 및 접속 이력 기록용 시작 시각
		long startTime = System.currentTimeMillis();
		String reqUserId = (data != null && data.get("id") != null) ? data.get("id").toString() : "";

		try {
			resultInfo = new ResultInfo(); //결과정보 
			
			// 로그인 실패 횟수 체크
			int result = monArchDao.getFailedCount(data);
			// 결과가 0일 경우 더 이상 로그인할 수 없는 상태이므로 경고 메세지를 보여준다.
			if ( result == 0 ) {
				resultInfo.setResult(CommonConst.FAIL);
				resultInfo.setErrorCode("E0002");
				resultInfo.setMessage("로그인 실패 횟수가 5회를 넘었습니다. 10분 뒤에 시도해주십시오.");
				
				// 20261118 khma : 로그인 5회 실패 차단 이력을 M_USE_LOG에 기록
				insertLoginUseLog(monArchDao, request, "44", "0", "LOGIN", "LOGIN_LOCKED",
						reqUserId, "로그인 차단(5회 초과)",
						buildLoginReqDoc(request, reqUserId, "", "로그인 실패 5회 초과(10분 차단)"),
						System.currentTimeMillis() - startTime);
				
				request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
				
				return new ModelAndView("loginProcess").addObject(CommonConst.RESULT_INFO, resultInfo);
			}
			
			// 사용자 정보를 가져온다.
			UserInfo userInfo = monArchDao.exeLoginProcess(data);
			
			if ( userInfo != null ) {
				// 로그인 실패 횟수를 초기화한다.
				monArchDao.updateFailedCount(data, "0");
				
				// 세션 정보 invalid
				Enumeration<String> attrNames = session.getAttributeNames();
				while(attrNames.hasMoreElements()) {
					String attrName = attrNames.nextElement();
					session.removeAttribute(attrName);
				}
				session.invalidate();

				// 새로운 세션을 생성한다.
				session = request.getSession();
				session.setAttribute("userInfo", userInfo);
				session.setMaxInactiveInterval((userInfo.getConnDur()*60));
				
				UUID uid = UUID.randomUUID();
				String strRand = "";
				MessageDigest md = MessageDigest.getInstance("SHA-256");
				md.update(uid.toString().getBytes());
				byte byteData[] = md.digest();
				StringBuffer sb = new StringBuffer();
				for ( byte dByte : byteData ) {
					sb.append(Integer.toString((dByte&0xff) + 0x100, 16).toString());
				}
				strRand = sb.toString();
				
				session.setAttribute("authValue", strRand);
				
				// 20261118 khma : 로그인 성공 접속 이력을 M_USE_LOG에 기록
				insertLoginUseLog(monArchDao, request, userInfo.getUsiteNo(), userInfo.getUserNo(),
						"LOGIN", "LOGIN_SUCCESS", userInfo.getUserCode(), "로그인 성공",
						buildLoginReqDoc(request, userInfo.getUserCode(), userInfo.getUserName(), "로그인 성공"),
						System.currentTimeMillis() - startTime);
			}
			else {
				new Exception("Login Process SQL error");
			}
			
			resultInfo.setResult(CommonConst.SUCCESS);
			resultInfo.setMessage("사용자 정보 : " + userInfo.toString());
			
			ModelAndView mv = new ModelAndView("middle");
			mv.addObject(CommonConst.RESULT_INFO, resultInfo);
			return mv;
		}
		catch (Exception e) {
			// 20261118 khma : printStackTrace() 제거 및 Log4j 로깅 전환
			/*
			e.printStackTrace();
			*/
			log.warn("로그인 인증 실패 [id=" + reqUserId + "] : " + e.getMessage());

			// submit으로 들어올 경우 alert 창을 띄울 수 없으므로 이동하지 않게 수정한 후에 오류 메세지를 띄움 
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001");
			resultInfo.setMessage("아이디 또는 비밀번호를 잘못 입력하셨습니다.");
			
			// 로그인 실패 횟수를 1 증가시킨다.
			try {
				monArchDao.updateFailedCount(data, "");
			}
			catch ( Exception ex ) {
				// 20261118 khma : printStackTrace() 제거 및 Log4j 에러 로깅 적용
				/*
				ex.printStackTrace();
				*/
				log.error("로그인 실패 횟수 갱신 중 오류 발생 : " + ex.getMessage(), ex);
				resultInfo.setErrorCode("E0003");
			}
			
			// 20261118 khma : 로그인 실패 접속 이력을 M_USE_LOG에 기록
			insertLoginUseLog(monArchDao, request, "44", "0", "LOGIN", "LOGIN_FAIL",
					reqUserId, "로그인 실패",
					buildLoginReqDoc(request, reqUserId, "", "아이디 또는 비밀번호 불일치"),
					System.currentTimeMillis() - startTime);
			
			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			
			return new ModelAndView("loginProcess").addObject(CommonConst.RESULT_INFO, resultInfo);
		}
	}
	
	/**
	 * 세션 지우기 & 로그아웃 처리 및 로그아웃 이력(M_USE_LOG) 기록
	 * @param request
	 * @param session
	 */
	@RequestMapping(value="/logoutProcess")
	// 20261118 khma : 로그아웃 시 클라이언트 IP 추출 및 M_USE_LOG 기록을 위해 HttpServletRequest 인자 추가
	/*
	public ModelAndView logoutPageProcess(HttpSession session) {
	*/
	public ModelAndView logoutPageProcess(HttpServletRequest request, HttpSession session) {
		ResultInfo resultInfo = null;
		long startTime = System.currentTimeMillis();
		
		try {
			resultInfo = new ResultInfo(); //결과정보 
			
			// 20261118 khma Start : 세션 무효화 전 로그인 사용자 정보를 추출하여 M_USE_LOG에 로그아웃 이력 기록
			UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
			if (userInfo != null && StringUtils.isNotEmpty(userInfo.getUserNo())) {
				MonArchDaoImpl monArchDao = new MonArchDaoImpl();
				insertLoginUseLog(monArchDao, request, userInfo.getUsiteNo(), userInfo.getUserNo(),
						"LOGOUT", "LOGOUT", userInfo.getUserCode(), "로그아웃",
						buildLoginReqDoc(request, userInfo.getUserCode(), userInfo.getUserName(), "로그아웃"),
						System.currentTimeMillis() - startTime);
			}
			// 20261118 khma End : 세션 무효화 전 로그인 사용자 정보를 추출하여 M_USE_LOG에 로그아웃 이력 기록
			
			Enumeration<String> attrNames = session.getAttributeNames();
			
			while(attrNames.hasMoreElements()) {
				String attrName = attrNames.nextElement();
				session.removeAttribute(attrName);
			}
			session.invalidate();
			resultInfo.setResult(CommonConst.SUCCESS);
	
			ModelAndView mv = new ModelAndView();
			mv.addObject(CommonConst.RESULT_INFO, resultInfo);
			mv.setViewName("loginProcess");
			return mv;
		}
		catch ( Exception e ) {
			// 20261118 khma : printStackTrace() 제거 및 Log4j 에러 로깅 적용
			/*
			e.printStackTrace();
			log.debug(e.getMessage());
			*/
			log.error("logoutPageProcess 처리 중 오류 발생 : " + e.getMessage(), e);
			
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E00001");
			resultInfo.setMessage(CommonConst.COMM_ERROR_MESSAGE);
			return new ModelAndView("loginProcess", CommonConst.RESULT_INFO, resultInfo);
		}
	}

	// 20261118 khma Start : 로그인/로그아웃 접속 이력을 기존 M_USE_LOG 테이블에 기록하는 헬퍼 메서드
	/**
	 * 로그인 성공/실패/차단 및 로그아웃 접속 이력을 M_USE_LOG 테이블에 저장한다.
	 * - 이력 저장 중 예기치 않은 DB 오류가 발생하더라도 본래 로그인/로그아웃 흐름에 영향을 주지 않도록 내부 예외 격리 처리
	 * 
	 * @param monArchDao MonArchDaoImpl 인스턴스
	 * @param request HttpServletRequest 요청 객체
	 * @param mUsiteNo 사이트 식별 번호 (기본값 "44")
	 * @param mUserNo 사용자 번호 (미인증/실패 시 "0")
	 * @param serviceName 서비스 구분명 ("LOGIN" 또는 "LOGOUT")
	 * @param methodName 상세 구분명 ("LOGIN_SUCCESS", "LOGIN_FAIL", "LOGIN_LOCKED", "LOGOUT")
	 * @param keyValue 로그인 시도 아이디 (USER_CODE)
	 * @param actionName 한글 액션 설명 ("로그인 성공", "로그인 실패", "로그인 차단(5회 초과)", "로그아웃")
	 * @param reqDoc 접속 IP 및 브라우저 정보 등이 담긴 상세 문자열 (최대 2000자)
	 * @param elapsedTime 처리 소요 시간 (ms)
	 */
	private void insertLoginUseLog(MonArchDaoImpl monArchDao, HttpServletRequest request,
			String mUsiteNo, String mUserNo, String serviceName, String methodName,
			String keyValue, String actionName, String reqDoc, long elapsedTime) {
		try {
			if (StringUtils.isEmpty(mUsiteNo)) {
				mUsiteNo = "44";
			}
			if (StringUtils.isEmpty(mUserNo)) {
				mUserNo = "0";
			}
			if (StringUtils.isNotEmpty(reqDoc) && reqDoc.length() > 2000) {
				reqDoc = reqDoc.substring(0, 2000);
			}

			Map<String, String> uselogParam = new HashMap<String, String>();
			uselogParam.put("M_USITE_NO", mUsiteNo);
			uselogParam.put("M_USER_NO", mUserNo);
			uselogParam.put("SERVICE_NAME", serviceName);
			uselogParam.put("METHOD_NAME", methodName);
			uselogParam.put("REQ_DOC", reqDoc != null ? reqDoc : "");
			uselogParam.put("ELAPSED_TIME", String.valueOf(elapsedTime));
			uselogParam.put("KEY_VALUE", keyValue != null ? keyValue : "");
			uselogParam.put("MENU_MGMT_NO", "0");
			uselogParam.put("STEP_MENU", serviceName);
			uselogParam.put("ACTION_NAME", actionName != null ? actionName : "");

			String sqlCommand = " INSERT INTO M_USE_LOG ( "
					+ QueryGenerator.genSequenceCol(DB_TYPE, "M_USE_LOG_NO", true)
					+ "M_USITE_NO,M_USER_NO,SERVICE_NAME,METHOD_NAME,REQ_DOC,ELAPSED_TIME,KEY_VALUE, MENU_MGMT_NO, STEP_MENU, ACTION_NAME"
					+ ") VALUES ("
					+ QueryGenerator.genSequenceStmt(DB_TYPE, "M_USE_LOG_SEQ", true)
					+ "@M_USITE_NO@, @M_USER_NO@, @SERVICE_NAME@, @METHOD_NAME@, @REQ_DOC@, @ELAPSED_TIME@, @KEY_VALUE@, @MENU_MGMT_NO@, @STEP_MENU@, @ACTION_NAME@)";

			monArchDao.exeCreate(sqlCommand, uselogParam);
		} catch (Exception e) {
			log.error("접속 이력(M_USE_LOG) 저장 중 오류 발생 [service=" + serviceName + ", method=" + methodName + ", userId=" + keyValue + "] : " + e.getMessage(), e);
		}
	}

	/**
	 * 접속 이력(REQ_DOC) 저장용 클라이언트 접속 정보(IP, User-Agent, 사용자ID/성명, 결과) 문자열을 생성한다.
	 * 
	 * @param request HttpServletRequest 요청 객체
	 * @param userId 로그인 시도 아이디 (USER_CODE)
	 * @param userName 사용자 성명 (성공/로그아웃 시)
	 * @param statusDesc 처리 상태 설명
	 * @return JSON 형태의 접속 메타 문자열
	 */
	private String buildLoginReqDoc(HttpServletRequest request, String userId, String userName, String statusDesc) {
		String clientIp = getClientIp(request);
		String userAgent = (request != null && request.getHeader("User-Agent") != null)
				? request.getHeader("User-Agent").replace("\"", "'")
				: "";
		StringBuilder sb = new StringBuilder();
		sb.append("{\"userId\":\"").append(userId != null ? userId : "").append("\"");
		if (StringUtils.isNotEmpty(userName)) {
			sb.append(",\"userName\":\"").append(userName).append("\"");
		}
		sb.append(",\"clientIp\":\"").append(clientIp).append("\"");
		sb.append(",\"status\":\"").append(statusDesc != null ? statusDesc : "").append("\"");
		sb.append(",\"userAgent\":\"").append(userAgent).append("\"}");
		return sb.toString();
	}

	/**
	 * 프록시/로드밸런서 환경을 고려하여 요청자의 실제 클라이언트 IP 주소를 추출한다.
	 * 
	 * @param request HttpServletRequest 요청 객체
	 * @return 클라이언트 IP 문자열
	 */
	private String getClientIp(HttpServletRequest request) {
		if (request == null) {
			return "";
		}
		String ip = request.getHeader("X-Forwarded-For");
		if (ip != null && ip.contains(",")) {
			ip = ip.split(",")[0].trim();
		}
		if (StringUtils.isEmpty(ip) || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (StringUtils.isEmpty(ip) || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (StringUtils.isEmpty(ip) || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		return ip != null ? ip : "";
	}
	// 20261118 khma End : 로그인/로그아웃 접속 이력을 기존 M_USE_LOG 테이블에 기록하는 헬퍼 메서드
}
