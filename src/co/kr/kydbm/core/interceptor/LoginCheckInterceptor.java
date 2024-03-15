package co.kr.kydbm.core.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import co.kr.kydbm.core.bean.UserInfo;
import co.kr.kydbm.core.exception.AuthException;
import co.kr.kydbm.core.exception.LoginException;

public class LoginCheckInterceptor extends HandlerInterceptorAdapter{
	
	private Logger logger = Logger.getLogger(this.getClass());
	
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws AuthException, Exception {
		boolean result = false;
		//if ( !CheckReferer(request) ) {
		//	throw new LoginException("URL 직접 호출 오류");
		//}
		logger.debug("LoginCheckInterceptor: preHandle() start");
		HttpSession session = request.getSession();
		if ( session.getAttribute("userInfo") != null ) {
			UserInfo userInfo = (UserInfo)session.getAttribute("userInfo");
			//logger.debug("사용자 정보: " + userInfo.toString());
			result = true;
		}
		//else { // UserInfo is nothing in Session
		//	throw new AuthException("세션 정보가 없습니다.");
		//}
		logger.debug("LoginCheckInterceptor: preHandle() end");
		return result;
	}
	
	private boolean CheckReferer(HttpServletRequest request) throws Exception {
		
		try {
			String referer = request.getHeader("REFERER");
			if ( referer != null && referer.length() > 0 ) {
				return true;
			}
			else {
				return false;
			}
		}
		catch ( Exception e ) {
			e.printStackTrace();
			return false;
		}
	}
}