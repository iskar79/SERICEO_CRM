package co.kr.kydbm.core.filecontrol;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *  확장 액셀다운 인터페이스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public interface ExtExcelService {
	public Boolean downExcel(List<Map<String, Object>> ds, String filename, String type, HttpServletRequest request, HttpServletResponse response) throws Exception;
}
