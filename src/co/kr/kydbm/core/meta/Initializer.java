package co.kr.kydbm.core.meta;

import org.apache.log4j.Logger;


/**
 *  서버 초기 처리 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class Initializer {
	
	private Logger log = Logger.getLogger(Initializer.class.getName());
		/**
		 * 공통코드 정보를 메모리에 적재하는 처리
		 */
		public  void init() {
		log.info("***** 서버 Init 처리 시작 *****");
		try{

			//공통코드 메모리 적재
			MetaCommCode.init();
			//공통코드 라벨 적재
			MetaCommLabel.init();
			//공통코드 메세지 적재
			MetaCommMsg.init();
		
		}catch(Exception ex){
			ex.printStackTrace();
			log.error( "***** 서버 Init 처리 오류 발생 *****");
		}finally{
			log.info( "***** 서버 Init 처리 종료 *****");
		}
	}
}
