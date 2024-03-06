package co.kr.kydbm.core.service;

import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

import javax.servlet.http.HttpSession;

/**
 * 세션 로그인 처리 클래스
 * @author kyoungho Ma
 * @version 1.0
 * @since 2012.07.19
 */
@Controller
public class LoginController {
	
	private Logger log = Logger.getLogger(LoginController.class);
	
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
			e.printStackTrace();
			log.debug(e.getMessage());
			
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
			e.printStackTrace();
			
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001");
			resultInfo.setMessage("메인 화면 접근 불가");
			
			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			return new ModelAndView("loginProcess").addObject(CommonConst.RESULT_INFO, resultInfo);
		}
	}
	
	/**
	 * 세션 정보 입력 & 로그인 처리
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

		try {
			resultInfo = new ResultInfo(); //결과정보 
			
			// 로그인 실패 횟수 체크
			int result = monArchDao.getFailedCount(data);
			// 결과가 0일 경우 더 이상 로그인할 수 없는 상태이므로 경고 메세지를 보여준다.
			if ( result == 0 ) {
				resultInfo.setResult(CommonConst.FAIL);
				resultInfo.setErrorCode("E0002");
				resultInfo.setMessage("로그인 실패 횟수가 5회를 넘었습니다. 10분 뒤에 시도해주십시오.");
				
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
			e.printStackTrace();

			// submit으로 들어올 경우 alert 창을 띄울 수 없으므로 이동하지 않게 수정한 후에 오류 메세지를 띄움 
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001");
			resultInfo.setMessage("아이디 또는 비밀번호를 잘못 입력하셨습니다.");
			
			// 로그인 실패 횟수를 1 증가시킨다.
			try {
				monArchDao.updateFailedCount(data, "");
			}
			catch ( Exception ex ) {
				ex.printStackTrace();
				resultInfo.setErrorCode("E0003");
			}
			
			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			
			return new ModelAndView("loginProcess").addObject(CommonConst.RESULT_INFO, resultInfo);
		}
	}
	
	/**
	 * 세션 지우기 & 로그아웃 처리
	 * @param session
	 */
	@RequestMapping(value="/logoutProcess")
	public ModelAndView logoutPageProcess(HttpSession session) {
		ResultInfo resultInfo = null;
		
		try {
			resultInfo = new ResultInfo(); //결과정보 
			
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
			e.printStackTrace();
			log.debug(e.getMessage());
			
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E00001");
			resultInfo.setMessage(CommonConst.COMM_ERROR_MESSAGE);
			return new ModelAndView("loginProcess", CommonConst.RESULT_INFO, resultInfo);
		}
	}
}
