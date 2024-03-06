package co.kr.kydbm.core.dao;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.bean.ExcelImportBean;
import co.kr.kydbm.core.utils.ConfigProperties;

/**
 *  데이터 업로드 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
//@Component
public class DataUploadDaoImpl  extends MonArchDaoImpl implements DataUploadDao  {
//	public class MonArchDaoImpl  extends NamedParameterJdbcDaoSupport implements MonArchDao {
//	private  DataSource dataSource;
	private static JdbcTemplate jdbcTemplate;
	private static NamedParameterJdbcTemplate namedParameterJdbcTemplate;
	private static DataSource datasource;
	private static DataSourceTransactionManager transactionManager;
	
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	Logger log =  Logger.getLogger(DataUploadDaoImpl.class.getName());
	
	public void setDataSource(DataSource ds) {
		if (!(datasource instanceof DataSource)) {
			datasource = ds;
			this.transactionManager = new DataSourceTransactionManager(ds);
		}
	}
	

	/**
	 * 데이터 업로드시 공통적으로 사용할수 있는 메소드(기본처리) 트랜젝션 사용.
	 * @param inputDataList
	 * @param sql
	 * @param exBean
	 * @return
	 * @throws Exception
	 */
	public int exeDataUpload(List<Map<String, String>> inputDataList, String sql, ExcelImportBean exBean, ArrayList<String> hdColsNameList) 
			throws Exception {
		//트렌젝션 시작
		DefaultTransactionDefinition txDef = new DefaultTransactionDefinition();
		txDef.setIsolationLevel(TransactionDefinition.ISOLATION_DEFAULT);
		TransactionStatus txStatus =transactionManager.getTransaction(txDef);
		namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(datasource);
		int rstCnt = 0;
		int size = inputDataList.size();
		Map[] mapParams = null;
//		Map[] mapUpdateParams = null;
//		Map[] mapUpdateParams = null;
		String keyColName = null;
		if(null != exBean.getKeyCols() && exBean.getKeyCols().size()>0){
			keyColName = exBean.getKeyCols().get(0).get("name");
		}
		
		String insertqry = exBean.getCreateSql(DB_TYPE);
		String updateQry =exBean.getUpdateSql(DB_TYPE);
		String targetQry;
		insertqry = CommonUtil.replaceNameTemplateType(insertqry, hdColsNameList);
		updateQry = CommonUtil.replaceNameTemplateType(updateQry, hdColsNameList);
		
		try {
			//대상건수가 1건이상일때 처리함.
			if(size > 0){
				mapParams = new HashMap[size];
				for (int i = 0; i < inputDataList.size() ; i++) {
					mapParams[i] = inputDataList.get(i);
					
					if(StringUtils.isNotEmpty(keyColName) && ( null == mapParams[i].get(keyColName) ||  StringUtils.isEmpty( mapParams[i].get(keyColName).toString()))){
						targetQry = insertqry;
					}else{
						targetQry = updateQry;
					}
					int rst = namedParameterJdbcTemplate.update(targetQry, mapParams[i]);
					if(rst>0){
						rstCnt++;
					}
					
				}
//				int[] rst =  namedParameterJdbcTemplate.batchUpdate(sql, mapParams);	
//				rstCnt = rst.length;
				transactionManager.commit(txStatus);
			}else{
				return rstCnt;
			}

		} catch (DuplicateKeyException e) {
			e.printStackTrace();
			transactionManager.rollback(txStatus);
			throw new DuplicateKeyException(e.getMessage(), e);
		} 
		catch (Exception e) {
			e.printStackTrace();
			transactionManager.rollback(txStatus);
			throw new Exception("데이터 업로드 처리중 예상치 못한 에러가 발생하였습니다.",e);
		}
		
		
		return rstCnt;
		
	}
	
	/**
	 * 데이터 업로드시 공통적으로 사용할수 있는 메소드(기본처리) 트랜젝션 사용.
	 * @param untreatedList
	 * @param excelDataList
	 * @param sql
	 * @return
	 * @throws Exception
	 */
	public int exeDataUploadForMonQuery(List<Map<String, String>> inputDataList, String sql) throws Exception{
		
		//트렌젝션 시작
		DefaultTransactionDefinition txDef = new DefaultTransactionDefinition();
		txDef.setIsolationLevel(TransactionDefinition.ISOLATION_DEFAULT);
		TransactionStatus txStatus =transactionManager.getTransaction(txDef);
		namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(datasource);
		int rstCnt = 0;
		int size = inputDataList.size();
		Map[] mapParams = null;
		try {
			//대상건수가 1건이상일때 처리함.
			if(size > 0){
				mapParams = new HashMap[size];
				for (int i = 0; i < inputDataList.size() ; i++) {
					mapParams[i] = inputDataList.get(i);
				}
				
				int[] rst =  namedParameterJdbcTemplate.batchUpdate(sql, mapParams);	
				rstCnt = rst.length;
				transactionManager.commit(txStatus);
			}else{
				return rstCnt;
			}

		} catch (Exception e) {
			e.printStackTrace();
			transactionManager.rollback(txStatus);
			throw new Exception("데이터 업로드 처리중 예상치 못한 에러가 발생하였습니다.",e);
		}
		
		
		return rstCnt;
		
	}
	
	/**
	 * 헤더정보로 멥핑
	 * @param SqlCommand
	 * @param mapParam
	 * @return
	 */
	public String replaceNameTemplateType(String SqlCommand,
			ArrayList<String> hdColsNameList) {
		String rstSql = SqlCommand;
		for (String colName : hdColsNameList) {
	        rstSql =  rstSql.replace("@" + colName + "@", ":" + colName);
		}
		rstSql =  rstSql.replace("@UID@", ":UID" );
		rstSql =  rstSql.replace("@ULID@", ":ULID");
		rstSql =  rstSql.replace("@USITE@", ":USITE");
		return rstSql;
	}
}
