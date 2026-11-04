package co.kr.kydbm.core.exception;

import java.sql.SQLException;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.bean.ResultInfo;
import co.kr.kydbm.core.utils.MappingJacksonJsonViewEx;

/**
 * SERICEO CRM 전역 예외 처리 리졸버 (Spring HandlerExceptionResolver 구현체)
 * - 컨트롤러 및 인터셉터에서 처리되지 않은 런타임 예외를 가로채어 표준 실패 응답 생성
 * - AJAX/JSON 요청과 일반 브라우저(JSP/HTML) 요청을 자동 분기하여 MonArch 표준 ResultInfo 형식 보장
 * - 내부 SQL 구문, 스택트레이스, DB 테이블명 등 민감 정보 노출 방지 및 프로젝트 로거로 안전한 에러 기록
 * 
 * @author Ma KyoungHo
 * @version 2.0 2026-11-04
 */
public class ExceptionResolver implements HandlerExceptionResolver {
	
	private Logger logger = Logger.getLogger(this.getClass());

	// 20261104 khma : JSON 응답 렌더링을 위한 Jackson View 인스턴스
	private MappingJacksonJsonViewEx jsonView = new MappingJacksonJsonViewEx();

	/**
	 * 컨트롤러 및 인터셉터 실행 중 발생한 예외를 처리하여 적절한 ModelAndView 반환
	 */
	public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response,
                                                 Object handler, Exception exception ) {
		logger.info("ExceptionResolver: resolveException() start [" + (exception != null ? exception.getClass().getName() : "null") + "]");
		ModelAndView mav = new ModelAndView();

		// 20261104 khma : printStackTrace() 제거 및 Log4j 프로젝트 표준 로거로 안전한 에러 기록
		/*
		exception.printStackTrace();
		*/
		if (exception != null) {
			logger.error("ExceptionResolver 처리 중 예외 발생 [URI: " + (request != null ? request.getRequestURI() : "null") + "]: " + exception.getMessage(), exception);
		}

		// 요청 유형 판별 (AJAX JSON 요청 여부)
		boolean isJson = isJsonRequest(request);

		// -------------------------------------------------------------
		// 1. 인증 만료 예외 (AuthException) - 세션 만료 및 권한 없음
		// -------------------------------------------------------------
		if ( exception instanceof AuthException ) {
			
			ResultInfo resultInfo = new ResultInfo();
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E1000");
			resultInfo.setMessage(exception.getMessage());

			// 오류코드 401
			response.setStatus(401);

			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			mav.addObject(CommonConst.RESULT_INFO, resultInfo);
			mav.addObject("message", "인증 실패");

			// 20261104 khma Start : AJAX JSON 요청 시 jsonView 직접 매핑으로 표준 ResultInfo JSON 응답 보장
			/*
			mav.setViewName("logoutProcess");
			*/
			if (isJson) {
				mav.setView(jsonView);
			} else {
				mav.setViewName("logoutProcess");
			}
			// 20261104 khma End : AJAX JSON 요청 시 jsonView 직접 매핑으로 표준 ResultInfo JSON 응답 보장
			
			// 세션 끊기
			invalidateSession(request.getSession(false));
			
			logger.info("AuthException 처리 완료 - Message[" + exception.getMessage() + "]");
		}
		// -------------------------------------------------------------
		// 2. 로그인 처리 예외 (LoginException) - 비밀번호 불일치 및 로그인 실패
		// -------------------------------------------------------------
		else if ( exception instanceof LoginException ) {

			ResultInfo resultInfo = new ResultInfo();
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode("E0001"); // 로그인 오류 코드 발생시켜야 함
			resultInfo.setMessage(exception.getMessage());

			// 오류코드 401
			response.setStatus(401);

			request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
			mav.addObject("resultInfo", resultInfo);
			mav.addObject(CommonConst.RESULT_INFO, resultInfo);

			// 20261104 khma Start : AJAX JSON 요청 시 jsonView 직접 매핑
			/*
			mav.setViewName("loginProcess");
			*/
			if (isJson) {
				mav.setView(jsonView);
			} else {
				mav.setViewName("loginProcess");
			}
			// 20261104 khma End : AJAX JSON 요청 시 jsonView 직접 매핑
			
			// 세션 끊기
			invalidateSession(request.getSession(false));
			
			logger.info("LoginException 처리 완료 - Message[" + exception.getMessage() + "]");
		}
		// -------------------------------------------------------------
		// 20261104 khma Start : 3. 기타 DB 업무 예외 및 시스템 일반 예외 표준화 처리
		// 기존에 빈 ModelAndView()를 반환하여 화이트스크린이나 비정상 응답이 발생하던 문제 해결
		// -------------------------------------------------------------
		else {
			String errorCode = "E9999";
			String userMessage = "시스템 처리 중 오류가 발생하였습니다.";

			if (exception instanceof SQLException || exception instanceof DataAccessException) {
				errorCode = "E9000";
				String exMsg = (exception.getMessage() != null) ? exception.getMessage() : "";
				// Oracle ORA-20000 사용자 정의 비즈니스 에러 메시지 프론트 파싱 계약 유지
				if (exMsg.indexOf("ORA-20000") > -1 || exMsg.indexOf("SQL state [20000]") > -1) {
					userMessage = exMsg;
				} else {
					// 일반 DB 에러는 보안을 위해 테이블명/SQL 구문 은닉화
					userMessage = "데이터베이스 처리 중 오류가 발생하였습니다.";
				}
			} else if (exception instanceof IllegalArgumentException) {
				errorCode = "E9001";
				userMessage = "요청 파라미터가 유효하지 않습니다.";
			} else if (exception != null && exception.getMessage() != null && !exception.getMessage().trim().isEmpty()) {
				// 내부 시스템 상세 정보(클래스명, 파일경로 등)는 제외하고 일반 안전 문구 제공
				userMessage = "시스템 처리 중 오류가 발생하였습니다.";
			}

			ResultInfo resultInfo = new ResultInfo();
			resultInfo.setResult(CommonConst.FAIL);
			resultInfo.setErrorCode(errorCode);
			resultInfo.setMessage(userMessage);

			if (isJson) {
				// AJAX 요청의 경우 기존 MonArch 프로토콜 규격(HTTP 200 + resultInfo.result=FAIL) 준수
				mav.addObject(CommonConst.RESULT_INFO, resultInfo);
				mav.setView(jsonView);
			} else {
				// 일반 브라우저 동기 페이지 요청 시 에러 페이지로 안전 리다이렉트
				request.setAttribute(CommonConst.RESULT_INFO, resultInfo);
				mav.addObject(CommonConst.RESULT_INFO, resultInfo);
				mav.addObject("message", userMessage);
				mav.setViewName("redirect:/error.htm");
			}

			logger.info("일반 예외 처리 완료 - ErrorCode[" + errorCode + "], Message[" + userMessage + "]");
		}
		// 20261104 khma End : 3. 기타 DB 업무 예외 및 시스템 일반 예외 표준화 처리

		return mav;
	}
	
	/**
	 * 요청이 AJAX 또는 JSON 데이터 요청인지 판별
	 * 
	 * @param request HttpServletRequest 객체
	 * @return JSON/AJAX 요청 여부
	 */
	private boolean isJsonRequest(HttpServletRequest request) {
		if (request == null) {
			return false;
		}
		String uri = request.getRequestURI();
		if (uri != null && uri.endsWith(".json")) {
			return true;
		}
		String xRequestedWith = request.getHeader("X-Requested-With");
		if ("XMLHttpRequest".equalsIgnoreCase(xRequestedWith)) {
			return true;
		}
		String accept = request.getHeader("Accept");
		if (accept != null && accept.indexOf("application/json") > -1) {
			return true;
		}
		String contentType = request.getContentType();
		if (contentType != null && contentType.indexOf("application/json") > -1) {
			return true;
		}
		return false;
	}

	/**
	 * 세션 지우기
	 * @param session
	 */
	public void invalidateSession(HttpSession session) {
		if (session == null) {
			return;
		}
		try {
			Enumeration<String> attrNames = session.getAttributeNames();
			
			while(attrNames.hasMoreElements()) {
				String attrName = attrNames.nextElement();
				session.removeAttribute(attrName);
			}
			session.invalidate();
		}
		catch ( Exception e ) {
			// 20261104 khma : printStackTrace() 제거 및 로거 기록
			/*
			e.printStackTrace();
			*/
			logger.warn("세션 만료 처리 중 예외 발생: " + e.getMessage());
		}
	}
}
