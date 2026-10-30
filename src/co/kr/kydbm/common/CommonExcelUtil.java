package co.kr.kydbm.common;

import java.text.SimpleDateFormat;
import java.util.Date;

// 20261030 khma : POI 4.1.2 업그레이드에 따른 CellType Enum 및 DateUtil 표준 적용
/*
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
*/
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Workbook;

/**
 * 공통 엑셀 유틸 클래스
 * 
 * @author Ma KyoungHo
 * @version 2.0 2026-10-30
 * @since version 1.0.0
 */
public class CommonExcelUtil {

	/**
	 * 엑셀의 셀 형식을 판별하여 문자열(String) 형태로 변환 반환하는 공통 메서드
	 * 
	 * @param cell 엑셀 셀 객체
	 * @return 셀 데이터 문자열 (공백/오류 시 null 또는 빈 문자열)
	 */
	public static String getCellData(Cell cell) {
		String value = null;
		if (cell != null) {
			// 20261030 khma Start : POI 4.1.2 switch-case CellType Enum 매핑 적용 (기존 HSSFCell.CELL_TYPE_* 상수 대체)
			/*
			switch (cell.getCellType()) {
				case HSSFCell.CELL_TYPE_BOOLEAN:
					if(cell.getBooleanCellValue()){
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
					 if (HSSFDateUtil.isCellDateFormatted(cell) == true) {
					        Date date = cell.getDateCellValue();
					        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					        value = sdf.format(date);
					 }else if (HSSFDateUtil.isCellInternalDateFormatted(cell) == true) {
					        Date date = cell.getDateCellValue();
					        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
					        value = sdf.format(date);
					 }else {
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
			*/
			switch (cell.getCellType()) {
				case BOOLEAN:
					// TRUE이면 1, FALSE이면 0 반환
					value = cell.getBooleanCellValue() ? "1" : "0";
					break;
				case BLANK:
					value = null;
					break;
				case ERROR:
					value = null;
					break;
				case FORMULA:
					// 수식 셀은 수식 계산기(FormulaEvaluator)를 통해 계산된 결과값을 재귀 취득
					Workbook wb = cell.getSheet().getWorkbook();
					CreationHelper crateHelper = wb.getCreationHelper();
					FormulaEvaluator evaluator = crateHelper.createFormulaEvaluator();
					value = getCellData(evaluator.evaluateInCell(cell));
					break;
				case NUMERIC:
					// 날짜 타입 셀인 경우 yyyy-MM-dd 포맷으로 변환 (HSSFDateUtil -> DateUtil 표준 전환)
					if (DateUtil.isCellDateFormatted(cell) || DateUtil.isCellInternalDateFormatted(cell)) {
						Date date = cell.getDateCellValue();
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
						value = sdf.format(date);
					} else {
						// 숫자일 경우 소수점이 0이면 정수형으로 변환하여 불필요한 .0 방지
						double numericVal = cell.getNumericCellValue();
						double fp = numericVal - (int) numericVal;
						if (fp == 0) {
							value = String.valueOf((int) numericVal);
						} else {
							value = String.valueOf(numericVal);
						}
					}
					break;
				case STRING:
					value = cell.getStringCellValue();
					break;
				default:
					value = "";
					break;
			}
			// 20261030 khma End : POI 4.1.2 switch-case CellType Enum 매핑 적용
		} else {
			value = "";
		}
		return value;
	}

}
