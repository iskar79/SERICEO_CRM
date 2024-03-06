package co.kr.kydbm.core.dao;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.dao.DataAccessException;

/**
 *  모나크확장Dao 인터페이스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public interface MonArchExtDao {
	public void setTenYearsDataSource(DataSource dataSource) ;
	
//	public List<Map<String,Object>> exeList(String SqlCommand, Map<String,String> parameters, String orderStr, int viewpage, int pagecnt)  throws Exception;
//	public List<Map<String,Object>> exeRead(String SqlCommand, Map<String,String> parameters)  throws DataAccessException ,Exception;

}
