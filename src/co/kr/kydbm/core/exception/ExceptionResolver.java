package co.kr.kydbm.core.exception;

import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.bean.ResultInfo;

/**
 * 오류가 발생했을 시에 사용
 * @author noh
 *
 */
public class ExceptionResolver implements HandlerExceptionResolver {
	
	private Logger logger = Logger.getLogger(this.getClass());

	public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response,
                                                 Object handler, Exception exception ) {
		logger.info("ExceptionResolver: resolveException() start [" + exception.getClass().getName() + "]");
		ModelAndView mav = new ModelAndView();
		exception.printStackTrace();

		if ( exception instanceof AuthException ) {
			
			ResultInfo resultInfo = new ResultInfo();
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E1000");
			resultInfo.setMessage(exception.getMessage());

			// 오류코드 401
			response.setStatus(401);

			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			mav.setViewName("logoutProcess");
			mav.addObject(CommonConst.RESULT_INFO, resultInfo);
			mav.addObject("message", "인증 실패");
			
			// 세션 끊기
			invalidateSession(request.getSession());
			
			logger.info("Message[" + exception.getMessage() + "]");
		}
		else if ( exception instanceof LoginException ) {

			ResultInfo resultInfo = new ResultInfo();
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001"); // 로그인 오류 코드 발생시켜야 함
			resultInfo.setMessage(exception.getMessage());

			// 오류코드 401
			response.setStatus(401);

			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			mav.setViewName("loginProcess");
			mav.addObject("resultInfo", resultInfo);
			
			// 세션 끊기
			invalidateSession(request.getSession());
			
			logger.info("Message[" + exception.getMessage() + "]");
		}
		return mav;
	}
	
	/**
	 * 세션 지우기
	 * @param session
	 */
	public void invalidateSession(HttpSession session) {
		try {
			Enumeration<String> attrNames = session.getAttributeNames();
			
			while(attrNames.hasMoreElements()) {
				String attrName = attrNames.nextElement();
				session.removeAttribute(attrName);
			}
			session.invalidate();
		}
		catch ( Exception e ) {
			e.printStackTrace();
		}
	}
}
