package co.kr.kydbm.scheduler.job;

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
 * 모나크 공통 스케쥴러 잡 클래스(usite지정해야되므로 사이트에서만 사용 권장. )
 * @author KyoungHo_Ma
 *
 */
public class MonarchCommonJob extends QuartzJobBean   {
	
	Logger log = Logger.getLogger(MonarchCommonJob.class.getName());
	
	@Override
	protected void executeInternal(JobExecutionContext arg0)
			throws JobExecutionException {
		// TODO 파라메터로 서비스/메소드명을 취득하여 해당 쿼리를 실행하도록 처리
		JobDataMap jobDataMap = arg0.getMergedJobDataMap();
		String jobName = arg0.getJobDetail().getName(); //실행 job의 명칭 취득
		String mUsiteNo = (String) arg0.getMergedJobDataMap().get("usite");
		String serviceName = (String) jobDataMap.get("serviceName");
		String methodName = (String) jobDataMap.get("methodName");

		log.info("■■■■■■ " +jobName + " Start ■■■■■■");
//		System.out.println("■실행서비스: " + arg0.getMergedJobDataMap().get("serviceName"));
//		System.out.println("■실행메소드: " + arg0.getMergedJobDataMap().get("methodName"));

		// xml설정에서 파라메터 값 취득
		
		
		
		MonArchDaoImpl monArchDaoImpl = new MonArchDaoImpl();
		//서비스 메소드 정보 취득
		ServiceInfo serviceInfo = monArchDaoImpl.ReadQuery(serviceName, methodName, mUsiteNo);
		
		System.out.println(serviceInfo.getSql());
		//서비스가 존재하는 경우는 처리를 계속하여 실행
		if(StringUtils.isEmpty(serviceInfo.getSql())){
			log.error(jobName + "의 지정된 실행 쿼리가 존재하지 않습니다.");
		}else{
			//todo 취득 쿼리 정보 실행
			if(StringUtils.isEmpty( serviceInfo.getTargetDatasource())){
				//TODO 디폴트
				try {
//					List<Map<String, Object>> oraList  = monArchDaoImpl.exeRead("SELECT * FROM M_USER", null, monArchDaoImpl.getExtNamedParameterJdbcTemplate("MON_ORA"));
//					System.out.println("오라클에서 " + oraList.size() + "건 취득하였습니다. ");
//					List<Map<String, Object>> mariaList  = monArchDaoImpl.exeRead("SELECT * FROM M_USER", null);
//					System.out.println("마리아DB에서 " + mariaList.size() + "건 취득하였습니다. ");
				} catch (DataAccessException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}else{
				//실행할 데이터소스 지정
			}
		}
		
		
		log.info("■■■■■■ " +jobName + " End ■■■■■■");
		
	}


}
