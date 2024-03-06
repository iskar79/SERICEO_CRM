package co.kr.kydbm.core.dao;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.dao.DataAccessException;
import org.springframework.web.multipart.MultipartFile;

import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.bean.UserInfo;

/**
 *  모나크Dao 인터페이스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public interface MonArchDao {
	
	public void setDataSource(DataSource dataSource) ;
	
	public ServiceInfo ReadQuery(String service, String method, String usite) throws DataAccessException;
//	public Map<String, Object> getSvcRead(String sqlstr) throws DataAccessException;
 	public Map<String, Object> readJs(String strQry, Map<String, String> omParam) throws DataAccessException, Exception;
	public int exeQuery(String SqlCommand, Map<String,String> parameters) throws DataAccessException;
	public int exeCreate(String SqlCommand, Map<String,String> parameters)  throws DataAccessException;
	public int exeCreateIdentity(String SqlCommand, String seqTbName, Map<String,String> parameters)  throws DataAccessException;
	public List<Map<String,Object>> exeRead(String SqlCommand, Map<String,String> parameters)  throws DataAccessException ,Exception;
	public Map<String,Object> exeGetFirstRow(String SqlCommand, Map<String,String> parameters)  throws DataAccessException ,Exception;
	public int exeUpdate(String SqlCommand, Map<String,String> parameters)  throws DataAccessException;
	public int exeDelete(String SqlCommand, Map<String,String> parameters)  throws DataAccessException;
	public List<Map<String,Object>> exeList(String SqlCommand, Map<String,String> parameters, String orderStr, int viewpage, int pagecnt)  throws Exception;
	public int insertNP(String SqlCommand, Map<String, String> parameters)	throws DataAccessException;
	public  int insertNP2(String SqlCommand, Map<String, Object> parameters) throws DataAccessException;
	public int uploadFile(String SqlCommand, Map<String, String> parameters, MultipartFile file)	throws DataAccessException, IOException;
	public Map<String, Object> downloadFile(String SqlCommand, String fileKey) throws DataAccessException, IOException;
	public List<Map<String, Object>> exeReadProcedure(String sql,Map<String, String> obj) throws Exception;
	public int exeBatchForUpdate(String sqlComm, List<Map<String, Object>> parameters) throws DataAccessException;
	public int exeBatchForUpdate(String sqlComm, LinkedList<Map<String, String>> parameters) throws DataAccessException;
	
	public UserInfo exeLoginProcess(Map<String, Object> userInfo);
}
