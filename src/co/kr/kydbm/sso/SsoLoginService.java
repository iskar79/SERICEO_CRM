package co.kr.kydbm.sso;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

/**
 * SSO로그인 처리 클래스 (미사용클래스)
 * @author kim jungwon
 * @version 1.0
 * @since 2012.07.19
 */
@Controller
public class SsoLoginService {
	
//	@RequestMapping(value="/ssologin" ,method = RequestMethod.GET)
//		public ModelAndView LoginSSO(HttpServletRequest request ,HttpServletResponse response) throws Exception  {
		//타프로젝트용으로 생성한 처리이므로 주석처리함
		
//		String ssoLoginId ="";
//		 
//		if(null != request.getParameter("userId")){
//			ssoLoginId = request.getParameter("userId").toString();
//			
////			sso로그인아이디가 넘어왔을때 쿠키에다 저장한다.
//			response.addCookie(new Cookie("ssoUID",ssoLoginId));
//		}
//		
//		String redirectURL= "redirect:monform.htm?popgbn=false";
//		
//		if(null != request.getParameter("menu")){
//			redirectURL += "&menu=" + request.getParameter("menu").toString();
//		}ㄴ
//		
//		ModelAndView mv = new ModelAndView(redirectURL); 
//	    return mv;
//	}
	
//	@RequestMapping(value="/tiptoplogin" ,method = RequestMethod.GET)
//	public ModelAndView LoginTiptopSSO(HttpServletRequest request ,HttpServletResponse response) throws Exception  {
//	
//		//InitechEamUID 팁탑SSO로그인
//		 Cookie[] cookies = request.getCookies();
//		 
//		  if (cookies == null || cookies.length == 0) {
//		   return null;
//		  }
//	
//		  Cookie cookie = null;
//		  for(int i = 0; i < cookies.length; i++) {
//		   cookie = cookies[i];
//		   
//		   if (cookie.getName().equals("InitechEamUID") == true) {
//			   
//			   response.addCookie(new Cookie("ssoUID",cookie.getValue()));
//		   }
//		  }
//		String redirectURL= "redirect:monform.htm?popgbn=false";
//		
//		if(null != request.getParameter("menu")){
//			redirectURL += "&menu=" + request.getParameter("menu").toString();
//		}
//		
//		ModelAndView mv = new ModelAndView(redirectURL); 
//	    return mv;
//	}
}
