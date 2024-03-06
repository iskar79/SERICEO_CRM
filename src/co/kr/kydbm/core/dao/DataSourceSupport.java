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
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.web.multipart.MultipartFile;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.utils.ConfigProperties;

/**
 *  모나크DataSourceSetting클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class DataSourceSupport {
		
//		private static final String REGEX_PARAM = "@+[ a-zA-Z0-9가-힣-_ ]*@";
//		private static final Object RETURN_PROCEDURE_KEY = "RT_DATA";
		protected static DataSource datasource;
		private static DataSource monOraDataSource;
		// TODO 데이터소스 객체수만큼 추가(1)
//		private static DataSource testDataSource;
		
		protected static JdbcTemplate jdbcTemplate;
		protected static NamedParameterJdbcTemplate namedParameterJdbcTemplate;
		private static JdbcTemplate extJdbcTemplate;
		private static NamedParameterJdbcTemplate extNamedParameterJdbcTemplate;;
		protected static SimpleJdbcCall simpleJdbcCall;
		protected static SimpleJdbcCall extSimpleJdbcCall;
		private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
		protected static final String DB_TYPE = prop.getProperty("monarch.db.type");
		
		/* DATASOURCE 상수 */
		private static final String DEFAULT = "DEFAULT";
		private static final String MON_ORA = "MON_ORA";
		
		public void setMonOraDataSource(DataSource ds) {
			if (!(monOraDataSource instanceof DataSource)) {
				monOraDataSource = ds;
			}
		}
		//TODO 데이터소스 객체가 추가되면 set프로퍼트 추가(2)
//		public void setTestDataSource(DataSource ds) {
//			if (!(testDataSource instanceof DataSource)) {
//				testDataSource = ds;
//			}
//		}
		
		
		public void setDataSource(DataSource ds) {

			if (!(datasource instanceof DataSource)) {
				datasource = ds;
			}
			if (!(jdbcTemplate instanceof JdbcTemplate)) {
				jdbcTemplate = new JdbcTemplate(ds);
			}
			if (!(namedParameterJdbcTemplate instanceof NamedParameterJdbcTemplate)) {
				namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(ds);
			}
			
			if (!(simpleJdbcCall instanceof SimpleJdbcCall)) { //20140117
				simpleJdbcCall = new SimpleJdbcCall(ds);
			}
			
		}
		
		/**
		 * 생성처리시 타겟데이터소스를 취득하여 jdbc템플릿을 설정.
		 * @param targetDatasource
		 */
		public void setDS(String targetDatasource){
			
			if(!StringUtils.isEmpty( targetDatasource) && targetDatasource.equals(MON_ORA) ){
				extJdbcTemplate = new JdbcTemplate(monOraDataSource);
				extNamedParameterJdbcTemplate = new NamedParameterJdbcTemplate(monOraDataSource);
				extSimpleJdbcCall = new SimpleJdbcCall(monOraDataSource);
			}
			//TODO  데이터소스가 늘어나는만큼 추가할것. (3)
//			else if(!StringUtils.isEmpty( targetDatasource) && targetDatasource.equals("TEST") ){
//				extJdbcTemplate = new JdbcTemplate(testDataSource);
//				extNamedParameterJdbcTemplate = new NamedParameterJdbcTemplate(testDataSource);
//				extSimpleJdbcCall = new SimpleJdbcCall(testDataSource);
//			}
		}
		
		public String getDbType(String targetDatasource){
			//TODO  데이터소스가 늘어나는만큼 추가할것. (4)
//			if(!StringUtils.isEmpty( targetDatasource) && targetDatasource.equals("TEST") ){
//				return CommonConst.DB_TYPE.ORACLE.getVal();
//			} 
			if(!StringUtils.isEmpty( targetDatasource) && targetDatasource.equals(MON_ORA) ){
				return CommonConst.DB_TYPE.ORACLE.getVal();
			} else {
				return DB_TYPE;
			}
		}
		
		
		public JdbcTemplate getExtJdbcTemplate(String targetDatasource) {
			 if(!StringUtils.isEmpty( targetDatasource ) && !targetDatasource.equals(DEFAULT) ){
				 setDS(targetDatasource);
				 return extJdbcTemplate;
			 }else{
				 return jdbcTemplate;
			 }
		}
		
		public SimpleJdbcCall getExtSimpleJdbcCall(String targetDatasource) {
			if(!StringUtils.isEmpty( targetDatasource ) && !targetDatasource.equals(DEFAULT) ){
				setDS(targetDatasource);
				return extSimpleJdbcCall;
			}else{
				return simpleJdbcCall;
			}
		}

		public NamedParameterJdbcTemplate getExtNamedParameterJdbcTemplate(String targetDatasource) {
			 if(!StringUtils.isEmpty( targetDatasource ) && !targetDatasource.equals(DEFAULT) ){
				 setDS(targetDatasource);
				 return extNamedParameterJdbcTemplate;
			 }else{
				 return namedParameterJdbcTemplate;
			 }
		}

}
