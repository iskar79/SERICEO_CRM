package co.kr.kydbm.common;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Workbook;

/**
 *  공통 액셀 유틸 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class CommonExcelUtil {
	 /**
	  * 액셀의 셀형식을 읽어 스트링으로 반환하는 공통메소드
	 * String
	 * @param cell
	 * @return
	 */
	public static String getCellData(Cell cell) {
		
		String value = null;
		if(cell != null) {
			switch (cell.getCellType()) {
				case HSSFCell.CELL_TYPE_BOOLEAN:
					if(cell.getBooleanCellValue()){
						//TRUE이면 1, FALSE이면 0을 반환. 
						value = "1";
					}else{
						value = "0";
					}
					break;
				case HSSFCell.CELL_TYPE_BLANK:
					value = null;
					break;
				case HSSFCell.CELL_TYPE_ERROR:
					value = null;
					break;
				case HSSFCell.CELL_TYPE_FORMULA:
					Workbook wb =  cell.getSheet().getWorkbook();
				    CreationHelper crateHelper = wb.getCreationHelper();
				    FormulaEvaluator evaluator = crateHelper.createFormulaEvaluator();
				    value = getCellData(evaluator.evaluateInCell(cell));
					break;
				case HSSFCell.CELL_TYPE_NUMERIC:
					//날자타입일경우
					 if (HSSFDateUtil.isCellDateFormatted(cell) == true) {
					        Date date = cell.getDateCellValue();
					        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					        value = sdf.format(date);
					 }else if (HSSFDateUtil.isCellInternalDateFormatted(cell) == true) {
					        Date date = cell.getDateCellValue();
					        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					        value = sdf.format(date);
					 }else {
							 //숫자일경우 소수점이 있으면 소수점이하가 0일때는 소숫점 앞자리만 취득
							value = String.valueOf(cell.getNumericCellValue());
							double fp = cell.getNumericCellValue() - (int)cell.getNumericCellValue();
							if(fp == 0 ){
								 value = String.valueOf((int)cell.getNumericCellValue());
							}
					   }
					break;
				case HSSFCell.CELL_TYPE_STRING:
					value = cell.getStringCellValue();
					break;
			}
		} else {
			value="";
		}
		return value;
	}
	
}
