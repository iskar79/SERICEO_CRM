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
	/**
	 * 대용량 엑셀/CSV 스트리밍 조회를 위한 List 서비스 실행 인터페이스
	 * 10만 건 이상의 대용량 데이터 추출 시 전체 조회 결과를 List<Map>으로 WAS 메모리에 일괄 적재하지 않고,
	 * Spring RowCallbackHandler를 통해 DB 커서에서 1행씩 읽어 즉시 파일 스트림으로 배출하도록 처리하여
	 * 메모리 점유율을 최소화하고 Full GC 및 OutOfMemoryError(OOM)를 원천 방지한다.
	 * 
	 * @param SqlCommand 실행할 기본 SQL 명령문
	 * @param parameters 화면에서 전달된 바인딩 검색 조건 파라미터 맵
	 * @param orderStr 정렬 컬럼 문자열 (ORDER BY 절)
	 * @param viewpage 요청 페이지 번호 (대용량 다운로드 시 1)
	 * @param pagecnt 페이지당 행 수 (대용량 다운로드 시 전체 조회를 위해 99,999,999 설정)
	 * @param arrExtFilters 동적 검색 확장 필터 목록 (/* EXTFILTERS *\/ 치환용)
	 * @param rch 행 단위 스트리밍 출력 및 카운팅을 수행할 Spring RowCallbackHandler 콜백 객체
	 * @throws DataAccessException 데이터베이스 접근 예외 발생 시
	 * @throws Exception SQL 구문 분석 및 파라미터 치환 오류 발생 시
	 * 
	 * 20261105 khma : 대용량 10만건 이상 엑셀/CSV 스트리밍 처리를 위한 exeListStream 선언
	 */
	public void exeListStream(String SqlCommand, Map<String, String> parameters, String orderStr,
			int viewpage, int pagecnt, java.util.ArrayList<Map<String, Object>> arrExtFilters,
			org.springframework.jdbc.core.RowCallbackHandler rch) throws DataAccessException, Exception;
	public int insertNP(String SqlCommand, Map<String, String> parameters)	throws DataAccessException;
	public  int insertNP2(String SqlCommand, Map<String, Object> parameters) throws DataAccessException;
	public int uploadFile(String SqlCommand, Map<String, String> parameters, MultipartFile file)	throws DataAccessException, IOException;
	public Map<String, Object> downloadFile(String SqlCommand, String fileKey) throws DataAccessException, IOException;
	public List<Map<String, Object>> exeReadProcedure(String sql,Map<String, String> obj) throws Exception;
	public int exeBatchForUpdate(String sqlComm, List<Map<String, Object>> parameters) throws DataAccessException;
	public int exeBatchForUpdate(String sqlComm, LinkedList<Map<String, String>> parameters) throws DataAccessException;
	
	public UserInfo exeLoginProcess(Map<String, Object> userInfo);
}
