package co.kr.kydbm.core.dao;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.sql.DataSource;

import org.apache.commons.lang.StringUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.multipart.MultipartFile;

import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;

/**
 *  모나크외부DB접속용확장Dao 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class MonArchExtDaoImpl   extends MonArchDaoImpl{
		
//		private static final String REGEX_PARAM = "@+[ a-zA-Z0-9가-힣-_ ]*@";
//		private static final Object RETURN_PROCEDURE_KEY = "RT_DATA";
		private static DataSource monOraDataSource;
		private static JdbcTemplate extJdbcTemplate;
		private static NamedParameterJdbcTemplate extNamedParameterJdbcTemplate;;
		/**
		 * 모나크820 테스트 외부 데이터소스 연동
		 * @param ds
		 */
		public void setMonOraDataSource(DataSource ds) {
			if (!(monOraDataSource instanceof DataSource)) {
				monOraDataSource = ds;
			}
		}
		
		/**
		 * 생성처리시 타겟데이터소스를 취득하여 jdbc템플릿을 설정.
		 * @param targetDatasource
		 */
		public void setDS(String targetDatasource){
			
			if(!StringUtils.isEmpty( targetDatasource) && targetDatasource.equals("MON_ORA") ){
				extJdbcTemplate = new JdbcTemplate(monOraDataSource);
				extNamedParameterJdbcTemplate = new NamedParameterJdbcTemplate(monOraDataSource);
			}
		}
		
		

	
}
