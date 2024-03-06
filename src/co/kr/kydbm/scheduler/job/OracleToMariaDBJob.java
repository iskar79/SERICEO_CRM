package co.kr.kydbm.scheduler.job;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.quartz.QuartzJobBean;

import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;

/**
 * Oracle에서 MAriaDB로 인터페이스 샘플 클래스
 * @author KyoungHo_Ma
 *
 */
public class OracleToMariaDBJob extends QuartzJobBean   {
	
	Logger log = Logger.getLogger(OracleToMariaDBJob.class.getName());
	
	@Override
	protected void executeInternal(JobExecutionContext arg0)
			throws JobExecutionException {
		// TODO 파라메터로 서비스/메소드명을 취득하여 해당 쿼리를 실행하도록 처리
		JobDataMap jobDataMap = arg0.getMergedJobDataMap();
		String jobName = arg0.getJobDetail().getName(); //실행 job의 명칭 취득

		log.info("■■■■■■ OracleToMariaDBJob  Start ■■■■■■");
		
		MonArchDaoImpl monArchDaoImpl = new MonArchDaoImpl();
		String exeListQry =makeOracleUserListQry();
		String exeInsertQry =makeMariaDbInsertUserQry();
		try {
			
			List<Map<String, Object>> oraList  = monArchDaoImpl.exeRead("SELECT * FROM M_USER", null, monArchDaoImpl.getExtNamedParameterJdbcTemplate("MON_ORA"));
			
			//취득한 정보를 파라메터로 지정하여 배치포업데이터 처리 호출
			int rstCnt = monArchDaoImpl.exeBatchForUpdate(makeMariaDbInsertUserQry(), oraList);
			
		} catch (DataAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		log.info("■■■■■■ OracleToMariaDBJob End ■■■■■■");
		
	}

	/**
	 * 오라클에서의 사용자  정보 취득 쿼리
	 * @return
	 */
	private String makeOracleUserListQry() {
		StringBuffer sb = new StringBuffer();
		
		sb.append(" SELECT ");
		sb.append(" * ");
		sb.append(" FROM M_USER ");
		
		return sb.toString();
	}
	
	/**
	 * MariaDB에 사용자 정보 입력 쿼리
	 * @return
	 */
	private String makeMariaDbInsertUserQry() {
	StringBuffer sb = new StringBuffer();
		
	sb.append(" INSERT INTO M_USER_TEST ( ");
	sb.append(" USER_CODE ");
	sb.append(" ,USER_PASSWORD ");
	sb.append(" ,USER_NAME ");
	sb.append(" ,USE_FLAG ");
	sb.append(" ,M_USITE_NO ");
	sb.append(" ,REG_DATE ");
	sb.append(" ,UPD_DATE ");
	sb.append(" ,REG_USER ");
	sb.append(" ,UPD_USER ");
	sb.append(" ,USER_LANG ");
	sb.append(" ) VALUES ( ");
	sb.append(" :USER_CODE ");
	sb.append(" ,:USER_PASSWORD ");
	sb.append(" ,:USER_NAME ");
	sb.append(" ,'1' ");
	sb.append(" ,'13' ");
	sb.append(" ,CURRENT_TIMESTAMP() ");
	sb.append(" ,CURRENT_TIMESTAMP() ");
	sb.append(" ,:REG_USER ");
	sb.append(" ,:UPD_USER ");
	sb.append(" ,'ko' ");
	sb.append(" ) ");
		
		return sb.toString();
	}
	
}
