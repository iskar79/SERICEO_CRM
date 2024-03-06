package co.kr.kydbm.core.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import co.kr.kydbm.core.bean.ExcelImportBean;

/**
 *  데이터 업로드 인터페이스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public interface DataUploadDao {
	public int exeDataUpload(List<Map<String, String>> inputDataList, String sql, ExcelImportBean exBean, ArrayList<String> hdColsNameList) throws Exception;
}
