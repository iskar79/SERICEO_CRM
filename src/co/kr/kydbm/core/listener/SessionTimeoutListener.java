package co.kr.kydbm.core.listener;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import co.kr.kydbm.core.bean.UserInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.QueryGenerator;

/**
 * 세션 타임아웃 만료 시 자동 로그아웃 이력을 M_USE_LOG 테이블에 기록하는 서블릿 세션 리스너
 *
 * [동작 원리]
 * - 명시적 로그아웃(/logoutProcess) 및 재로그인(/login, /index) 시 LoginController가
 *   session.invalidate() 호출 전에 세션에서 "userInfo" 속성을 먼저 제거한다.
 * - 반면 미사용 시간(M_USER.CONN_DUR, 기본 60분) 경과로 톰캣이 세션을 자동 만료시킬 때는
 *   "userInfo" 속성이 그대로 남아 있는 상태로 sessionDestroyed()가 호출되므로,
 *   타임아웃 만료 이벤트만 정확히 구분하여 M_USE_LOG(SERVICE_NAME='LOGIN', METHOD_NAME='SESSION_TIMEOUT')에 기록한다.
 *
 * @author Ma KyoungHo
 * @company KYDBM
 * @version 2.0 2026-11-19
 * @since 2026.11.19
 */
public class SessionTimeoutListener implements HttpSessionListener {

	private static final Logger log = Logger.getLogger(SessionTimeoutListener.class);
	private static ConfigProperties prop = ConfigProperties.getInstance();
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");

	@Override
	public void sessionCreated(HttpSessionEvent se) {
		// 세션 생성 시점에는 미인증 상태이므로 별도 이력 저장 없음 (로그인 성공 시 LoginController에서 기록)
	}

	/**
	 * 20261119 khma : 세션 소멸(타임아웃 만료) 시 userInfo가 남아 있으면 자동 로그아웃 이력을 M_USE_LOG에 기록한다.
	 */
	@Override
	public void sessionDestroyed(HttpSessionEvent se) {
		if (se == null) {
			return;
		}
		HttpSession session = se.getSession();
		if (session == null) {
			return;
		}

		try {
			Object userObj = session.getAttribute("userInfo");
			if (!(userObj instanceof UserInfo)) {
				return;
			}
			UserInfo userInfo = (UserInfo) userObj;
			if (StringUtils.isEmpty(userInfo.getUserNo())) {
				return;
			}

			String mUsiteNo = StringUtils.isNotEmpty(userInfo.getUsiteNo()) ? userInfo.getUsiteNo() : "44";
			String mUserNo = userInfo.getUserNo();
			String userCode = userInfo.getUserCode() != null ? userInfo.getUserCode() : "";
			String userName = userInfo.getUserName() != null ? userInfo.getUserName() : "";
			Object ipObj = session.getAttribute("loginClientIp");
			String clientIp = (ipObj != null) ? ipObj.toString() : "";

			StringBuilder reqDocSb = new StringBuilder();
			reqDocSb.append("{\"userId\":\"").append(userCode).append("\"");
			if (StringUtils.isNotEmpty(userName)) {
				reqDocSb.append(",\"userName\":\"").append(userName).append("\"");
			}
			reqDocSb.append(",\"clientIp\":\"").append(clientIp).append("\"");
			reqDocSb.append(",\"status\":\"세션 타임아웃 자동 로그아웃\"}");
			String reqDoc = reqDocSb.toString();
			if (reqDoc.length() > 2000) {
				reqDoc = reqDoc.substring(0, 2000);
			}

			Map<String, String> uselogParam = new HashMap<String, String>();
			uselogParam.put("M_USITE_NO", mUsiteNo);
			uselogParam.put("M_USER_NO", mUserNo);
			uselogParam.put("SERVICE_NAME", "LOGIN");
			uselogParam.put("METHOD_NAME", "SESSION_TIMEOUT");
			uselogParam.put("REQ_DOC", reqDoc);
			uselogParam.put("ELAPSED_TIME", "0");
			uselogParam.put("KEY_VALUE", userCode);
			uselogParam.put("MENU_MGMT_NO", "0");
			uselogParam.put("STEP_MENU", "LOGIN");
			uselogParam.put("ACTION_NAME", "세션 타임아웃 만료");

			String sqlCommand = " INSERT INTO M_USE_LOG ( "
					+ QueryGenerator.genSequenceCol(DB_TYPE, "M_USE_LOG_NO", true)
					+ "M_USITE_NO,M_USER_NO,SERVICE_NAME,METHOD_NAME,REQ_DOC,ELAPSED_TIME,KEY_VALUE, MENU_MGMT_NO, STEP_MENU, ACTION_NAME"
					+ ") VALUES ("
					+ QueryGenerator.genSequenceStmt(DB_TYPE, "M_USE_LOG_SEQ", true)
					+ "@M_USITE_NO@, @M_USER_NO@, @SERVICE_NAME@, @METHOD_NAME@, @REQ_DOC@, @ELAPSED_TIME@, @KEY_VALUE@, @MENU_MGMT_NO@, @STEP_MENU@, @ACTION_NAME@)";

			MonArchDaoImpl monArchDao = new MonArchDaoImpl();
			monArchDao.exeCreate(sqlCommand, uselogParam);
			log.info("세션 타임아웃 만료 이력(M_USE_LOG) 저장 완료 [userId=" + userCode + ", clientIp=" + clientIp + "]");
		} catch (Exception e) {
			// WAS 종료 시점 등 DB 컨텍스트 해제 상태에서 예외가 발생해도 컨테이너 종료에 영향을 주지 않도록 격리
			log.error("세션 타임아웃 이력(M_USE_LOG) 저장 중 오류 발생 : " + e.getMessage(), e);
		}
	}
}
