package co.kr.kydbm.core.filecontrol;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.MultipartFile;

/**
 *  데이터 업로드 인터페이스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public interface UploadDataService {

	public DataUploadResultBean execute(MultipartFile FileName, HttpServletRequest request, HttpServletResponse response) throws Exception; //업로드 데이터 서비스 실행 메소드
}
