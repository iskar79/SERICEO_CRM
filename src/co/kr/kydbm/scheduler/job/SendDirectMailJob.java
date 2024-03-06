package co.kr.kydbm.scheduler.job;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.quartz.QuartzJobBean;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.QueryGenerator;
import co.kr.kydbm.mail.MailServiceController;

public class SendDirectMailJob extends QuartzJobBean   {
	
	Logger log = Logger.getLogger(SendDirectMailJob.class.getName());
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	private static final String DEFAULT_PROC_UNIT = "100";
	private static final String PROC_UNIT = prop.getProperty("email.indv.unit");  //파라메터 취득 키: 처리건수
	
	@Override
	protected void executeInternal(JobExecutionContext param)
			throws JobExecutionException {
		// TODO 다이렉트 메일 발송 잡을 실행한다.
		String jobName = param.getJobDetail().getName(); //실행 job의 명칭 취득
		log.info("■■■■■■ " +jobName + " Start ■■■■■■");
		try {
			sendDirectMail();
		} catch (DataAccessException e) {
			log.error("["+jobName + "]타겟 목록 취득 중 에러 발생", e);
			e.printStackTrace();
		} catch (Exception e) {
			log.error("["+jobName + "]예상치 못한 에러 발생", e);
			e.printStackTrace();
		}
		log.info("■■■■■■ " +jobName + " End ■■■■■■");
	}

	/**
	 * 다이렉트 메일 처리
	 * @return
	 * @throws Exception 
	 * @throws DataAccessException 
	 */
	private boolean sendDirectMail() throws DataAccessException, Exception {
		MonArchDaoImpl monArchDaoImpl = new MonArchDaoImpl();
		//TODO 타켓메일 정보 취득
		String targetListQry = getTarketListQry();
		List<Map<String, Object>> targetMailList = monArchDaoImpl.exeRead(targetListQry, null);
		//TODO 취득 건수 분 반복하며 메일송신 처리 (상태업데이트처리 포함) 
		MailServiceController mc = new MailServiceController();
		Map<String, String> param = new HashMap<String, String>();
		for (Map<String, Object> targetMail : targetMailList) {
			param.clear();
			List<Map<String,  Object>>  attcFileList = new java.util.LinkedList<Map<String,Object>>();
			String strAttcFiles = ""; 
			if(null != targetMail.get("ATTC_FILE")){
				//첨부파일 정보 취득
				param.put("FILE_SEARCH_KEY", targetMail.get("ATTC_FILE").toString());
				attcFileList = monArchDaoImpl.exeRead(getAttachFileListQry(), param);
			}
			//타겟정보와 첨부파일목록을 파라메터로 설정
			//첨부파일은 데이터가 존재하지 않아도 무관함
			mc.sendDirectMail(targetMail, attcFileList);
			//처리 결과값true 성공시 타켓 정보 01로 갱신
			//처리 결과값false 실패시 타켓 정보 90로 갱신
			
		}


		return false;
	}

	/**
	 * 다이렉트 메일 타켓 쿼리 생성
	 * @return
	 */
	private String getTarketListQry() {
		
		String procUnit = DEFAULT_PROC_UNIT;
		if(StringUtils.isNotEmpty(PROC_UNIT) && StringUtils.isNumeric(PROC_UNIT)){
			procUnit = PROC_UNIT;
		}

		StringBuffer sb = new StringBuffer();
		if(DB_TYPE.equals(CommonConst.DB_TYPE.ORACLE.getVal())){
			sb.append(" SELECT * FROM ( SELECT ROWNUM AS RN,  ");
		}else{
			sb.append(" SELECT ");
		}
		
		if(DB_TYPE.equals(CommonConst.DB_TYPE.MSSQL.getVal())){
			sb.append(" TOP " + procUnit);
		}
		sb.append(" MC_INDV_EMAIL_NO ");
		sb.append(" ,M_USITE_NO ");
		sb.append(" ,SEND_NAME ");
		sb.append(" ,SEND_EMAIL ");
		sb.append(" ,CONT_SUBJECT ");
		sb.append(" ,RSRV_SEND_DATE ");
		sb.append(" ,INDV_STATE ");
		sb.append(" ,SYNC_FLAG ");
		sb.append(" ,ATTC_FILE ");
		sb.append(" ,CONT_BODY ");
		sb.append(" ,EXPIRE_DATE ");
		sb.append(" ,RECV_NAME ");
		sb.append(" ,RECV_EMAIL_TO ");
		sb.append(" ,RECV_EMAIL_CC ");
		sb.append(" ,RECV_EMAIL_BCC ");
		sb.append(" ,M_CUST_NO ");
		sb.append(" ,M_CMPN_EXEC_CUST_NO ");
		sb.append(" ,REG_DATE ");
		sb.append(" ,REG_USER ");
		sb.append(" ,UPD_DATE ");
		sb.append(" ,UPD_USER ");
		sb.append(" FROM ");
		sb.append(" MC_INDV_EMAIL ");
		sb.append(" WHERE ");
		sb.append(" INDV_STATE = '00' ");
		sb.append(" AND (RSRV_SEND_DATE IS NULL ");
		sb.append(" OR RSRV_SEND_DATE <= " + QueryGenerator.genSysDate(DB_TYPE, false) + ") ");
		sb.append(" ORDER BY REG_DATE ");
		
		if(DB_TYPE.equals(CommonConst.DB_TYPE.MARIADB.getVal() ) || DB_TYPE.equals(CommonConst.DB_TYPE.MYSQL.getVal() )){
			sb.append(" LIMIT 100 ");
		}
		
		if(DB_TYPE.equals(CommonConst.DB_TYPE.ORACLE.getVal())){
			sb.append(" ) ");
			sb.append(" WHERE RN <= " + procUnit);
		}
		return sb.toString();
	}
	
	/**
	 * 첨부파일 목록 취득 쿼리
	 * @return
	 */
	private String getAttachFileListQry() {
		
		StringBuffer sb = new StringBuffer();
		sb.append(" SELECT ");
		sb.append(" M_FILE_MGMT_NO ");
		sb.append(" ,M_USITE_NO ");
		sb.append(" ,FILE_PATH ");
		sb.append(" ,FILE_NAME ");
		sb.append(" ,FILE_SIZE ");
		sb.append(" ,REG_DATE ");
		sb.append(" ,UPD_DATE ");
		sb.append(" ,REG_USER ");
		sb.append(" ,UPD_USER ");
		sb.append(" ,JOB_TYPE ");
		sb.append(" ,JOB_KEY ");
		sb.append(" ,FILE_SEARCH_KEY ");
		sb.append(" ,USE_FLAG ");
		sb.append(" FROM ");
		sb.append(" M_FILE_MGMT ");
		sb.append(" WHERE ");
		sb.append("  FILE_SEARCH_KEY = @FILE_SEARCH_KEY@");
		sb.append(" AND USE_FLAG = '1' ");
		
		return sb.toString();
	}
}
