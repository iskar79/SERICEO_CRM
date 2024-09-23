package co.kr.kydbm.core.filecontrol;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jxl.Workbook;
import jxl.biff.FontRecord;
import jxl.format.Alignment;
import jxl.format.BorderLineStyle;
import jxl.format.Colour;
import jxl.write.WritableCellFormat;
import jxl.write.WritableFont;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.biff.RowsExceededException;
import jxl.write.biff.WritableFontRecord;
import jxl.write.biff.WritableFonts;

import org.apache.commons.io.output.FileWriterWithEncoding;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.apache.poi.util.StringUtil;
import org.springframework.stereotype.Controller;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonUtil;
import au.com.bytecode.opencsv.CSVWriter;

/**
 * EXCEL처리를 담당하는 클래스
 * 
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
@Controller
public class ExcelDownload {
	Logger log = Logger.getLogger(ExcelDownload.class.getName());

//	public Boolean downExcel(List<Map<String, Object>> ds, String service,
//			String type, HttpServletRequest request,
//			HttpServletResponse response) throws Exception {
//
//		String fileName = service;
//		String fullFilePath = "";
//		String filePath = "";
//
//		// 액셀 임시 폴더가 없을때에는 직접 생성한다.
//		File fpath = new File(request.getSession().getServletContext()
//				.getRealPath("/FileData/excelTemp/"));
//		if (!fpath.isDirectory()) {
//			fpath.mkdir();
//		}
//
//		if ("CSV".equals(StringUtils.upperCase(type))) {
//			/* CSV형식으로 다운르도 함 */
//			// 파일 실제경로 취득하여 파일명 설정
//			filePath = request.getSession().getServletContext()
//					.getRealPath("/FileData/excelTemp/")
//					+ System.getProperty("file.separator") + fileName + ".csv";
//			String disposition = getDisposition(fileName + ".csv",
//					getBrowser(request));
//			FileInputStream fis = null;
//			OutputStream os = null;
//			try {
//
//				if (makeCSV(filePath, service, ds)) {
//
//					File file = new File(filePath);
//					int ifilesize = (int) file.length();
//					byte b[] = new byte[ifilesize];
//					fis = new FileInputStream(file);
//					os = response.getOutputStream();
//					response.setContentLength(ifilesize);
//					response.reset();
//					response.setContentType("application/vnd.msexcel");
//					response.setHeader("content", "text/html; charset=utf-8");
//					// response.setHeader("Content-Disposition",
//					// "attachment; filename=\"" + new
//					// String(fileName.getBytes("UTF-8"), "ISO-8859-1")+".csv" +
//					// "\"");
//					response.setHeader("Content-Disposition", disposition
//							+ ".xls");
//					response.setHeader("Content-Length", "" + ifilesize);
//					response.setHeader("Content-Transfer-Encoding", "binary;");
//					response.setHeader("Pragma", "no-cache;");
//					response.setHeader("Expires", "-1;");
//					if (ifilesize > 0 && file.isFile()) {
//						int read = 0;
//						byte bom[] = { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF }; // UTF-8
//																				// BOM형식으로
//																				// 사용하기위해
//						os.write(bom);
//						while ((read = fis.read(b)) != -1) {
//							os.write(b, 0, read);
//						}
//					}
//					os.flush();
//				}
//
//			} catch (IOException e) {
//				throw new Exception("CSV 다운로드 처리중 에러가 발생하였습니다. ");
//			} finally {
//
//				os.close();
//				fis.close();
//			}
//
//		} else {
//			/* EXCEL형식으로 다운르도 함 */
//
//			// 파일 실제경로 취득하여 파일명 설정
//			filePath = request.getSession().getServletContext()
//					.getRealPath("/FileData/excelTemp/");
//			fullFilePath = filePath + System.getProperty("file.separator")
//					+ fileName + ".xls";
//			String disposition = getDisposition(fileName + ".xls",
//					getBrowser(request));
//
//			FileInputStream fis = null;
//			OutputStream os = null;
//			try {
//
//				if (makeExcel(filePath, fileName, ds)) {
//
//					File file = new File(fullFilePath);
//					int ifilesize = (int) file.length();
//					byte b[] = new byte[ifilesize];
//					fis = new FileInputStream(file);
//					os = response.getOutputStream();
//					response.setContentLength(ifilesize);
//					response.reset();
//					response.setContentType("application/vnd.msexcel");
//					response.setHeader("content", "text/html; charset=utf-8");
//					// response.setHeader("Content-Disposition",
//					// "attachment; filename=\"" + new
//					// String(fileName.getBytes("UTF-8"), "ISO-8859-1")+".xls" +
//					// "\"");
//					response.setHeader("Content-Disposition", disposition);
//					response.setHeader("Content-Length", "" + ifilesize);
//					response.setHeader("Content-Transfer-Encoding", "binary;");
//					response.setHeader("Pragma", "no-cache;");
//					response.setHeader("Expires", "-1;");
//					if (ifilesize > 0 && file.isFile()) {
//						int read = 0;
//						while ((read = fis.read(b)) != -1) {
//							os.write(b, 0, read);
//						}
//					}
//					os.flush();
//				}
//			} catch (IOException e) {
//				throw new Exception("액셀 다운로드 처리중 에러가 발생하였습니다. ");
//			} finally {
//				os.close();
//				fis.close();
//			}
//		}
//		return true;
//	}

	public boolean downExcel(List<Map<String, Object>> ds, String service,
			String type, HttpServletRequest request,
			HttpServletResponse response,
			ArrayList<Map<String, Object>> arrHeaderInfo,
			String xlsType) throws Exception {
		String fileName = service;
		String fullFilePath = "";
		String filePath = "";

		// 액셀 임시 폴더가 없을때에는 직접 생성한다.
		File fpath = new File(request.getSession().getServletContext().getRealPath("/FileData/excelTemp/"));
		if (!fpath.isDirectory()) {
			fpath.mkdir();
		}

		if ("CSV".equals(StringUtils.upperCase(type))) {
			/* CSV형식으로 다운르도 함 */
			// 파일 실제경로 취득하여 파일명 설정
			filePath = request.getSession().getServletContext()
					.getRealPath("/FileData/excelTemp/")
					+ System.getProperty("file.separator") + fileName + ".csv";
			String disposition = getDisposition(fileName + ".csv",
					getBrowser(request));
			FileInputStream fis = null;
			OutputStream os = null;
			try {

				if (makeCSV(filePath, service, ds)) {
					//TODO CSV에 대한  확인 분석 필요..
					File file = new File(filePath);
					int ifilesize = (int) file.length();
					byte b[] = new byte[ifilesize];
					fis = new FileInputStream(file);
					os = response.getOutputStream();
					response.setContentLength(ifilesize);
					response.reset();
					response.setContentType("application/vnd.msexcel");
					response.setHeader("content", "text/html; charset=utf-8");
					// response.setHeader("Content-Disposition",
					// "attachment; filename=\"" + new
					// String(fileName.getBytes("UTF-8"), "ISO-8859-1")+".csv" +
					// "\"");
					response.setHeader("Content-Disposition", disposition
							+ ".xls");
					response.setHeader("Content-Length", "" + ifilesize);
					response.setHeader("Content-Transfer-Encoding", "binary;");
					response.setHeader("Pragma", "no-cache;");
					response.setHeader("Expires", "-1;");
					if (ifilesize > 0 && file.isFile()) {
						int read = 0;
						byte bom[] = { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF }; // UTF-8
																				// BOM형식으로
																				// 사용하기위해
						os.write(bom);
						while ((read = fis.read(b)) != -1) {
							os.write(b, 0, read);
						}
					}
					os.flush();
				}

			} catch (IOException e) {
				throw new Exception("CSV 다운로드 처리중 에러가 발생하였습니다. ");
			} finally {

				os.close();
				fis.close();
			}

		} else {
			/* EXCEL형식으로 다운르도 함 */

			// 파일 실제경로 취득하여 파일명 설정
			filePath = request.getSession().getServletContext().getRealPath("/FileData/excelTemp/");
			fullFilePath = filePath + System.getProperty("file.separator") + fileName + ".xls";
			String disposition = getDisposition(fileName + ".xls", getBrowser(request));

			FileInputStream fis = null;
			OutputStream os = null;
			try {

				if (makeExcel(filePath, fileName, ds, arrHeaderInfo, xlsType)) {

					File file = new File(fullFilePath);
					int ifilesize = (int) file.length();
					byte b[] = new byte[ifilesize];
					fis = new FileInputStream(file);
					os = response.getOutputStream();
					response.setContentLength(ifilesize);
					response.reset();
					response.setContentType("application/vnd.msexcel");
					response.setHeader("content", "text/html; charset=utf-8");
					// response.setHeader("Content-Disposition",
					// "attachment; filename=\"" + new
					// String(fileName.getBytes("UTF-8"), "ISO-8859-1")+".xls" +
					// "\"");
					response.setHeader("Content-Disposition", disposition);
					response.setHeader("Content-Length", "" + ifilesize);
					response.setHeader("Content-Transfer-Encoding", "binary;");
					response.setHeader("Pragma", "no-cache;");
					response.setHeader("Expires", "-1;");
					if (ifilesize > 0 && file.isFile()) {
						int read = 0;
						while ((read = fis.read(b)) != -1) {
							os.write(b, 0, read);
						}
					}
					os.flush();
				}
			} catch (IOException e) {
				throw new Exception("액셀 다운로드 처리중 에러가 발생하였습니다. ");
			} finally {
				os.close();
				fis.close();
			}
		}
		return true;
		
	}
	
	private boolean makeCSV(String filePath, String service,
			List<Map<String, Object>> showDataList) {

		CSVWriter cw = null;
		try {
			cw = new CSVWriter(new FileWriterWithEncoding(filePath, "UTF-8"),
					',');
			Object[] keys = showDataList.get(0).keySet().toArray();
			String keyName = "";
			String[] s;
			int arrayCnt = keys.length;
			int colNum = 0; // RNUM과 RCOUNT칼럼제거 하기위한 카운트

			s = new String[arrayCnt];
			for (int i = 0; i < keys.length; i++) {
				String data = " ";
				keyName = keys[i].toString();
				if (!"RNUM".equals(keyName) && !"RCOUNT".equals(keyName)) { // RNUM과
																			// RCOUNT칼럼제거
					if (null != keyName) {
						data = keyName;
					}
					s[i - colNum] = data;
				} else {
					colNum++;
				}
			}
			cw.writeNext(s);

			for (int i = 0; i < showDataList.size(); i++) {
				s = new String[arrayCnt];
				colNum = 0;
				for (int j = 0; j < keys.length; j++) {
					String data = " ";
					keyName = keys[j].toString();
					if (!"RNUM".equals(keyName) && !"RCOUNT".equals(keyName)) { // RNUM과
																				// RCOUNT칼럼제거
						if (null != showDataList.get(i).get(keyName)) {
							data = showDataList.get(i).get(keyName).toString();
						}
						s[j - colNum] = data;
					} else {
						colNum++;
					}
				}
				cw.writeNext(s);
			}
		} catch (IOException e1) {
			e1.printStackTrace();
			log.error("CSV파일 다운로드중 오류가 발생하였습니다.", e1);
			return false;
		} finally {
			try {
				cw.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return true;
	}

	/**
	 * 액셀파일을 생성하는 메소드
	 * 
	 * @param filePath
	 * @return
	 * @throws IOException
	 * @throws WriteException
	 */
	private boolean makeExcel(String filePath, String fileName,
			List<Map<String, Object>> showDataList, 
			ArrayList<Map<String, Object>> arrHeaderInfo, String xlsType) {


		log.debug("makeExcel ==> khma");
		
		// 액셀파일 저장루트 설정(다운로드를 위한 temp폴더에 저장하여 파일을 내림)
		WritableWorkbook workbook = null;
		try {

			File fpath = new File(filePath);
			if (!fpath.isDirectory()) {
				fpath.mkdirs();
			}

			workbook = Workbook.createWorkbook(new File(fpath + System.getProperty("file.separator") + fileName + ".xls"));

			// 액셀시트를 생성 : 시트명과 시트번호를 셋팅
			WritableSheet sheet = workbook.createSheet(fileName, 0);

			// 예제코드

			// 셀 포멧 서식 설정
			jxl.write.WritableCellFormat notiFormat = new WritableCellFormat();
			jxl.write.WritableCellFormat headerFormat = new WritableCellFormat();
			jxl.write.WritableCellFormat dataFormat = new WritableCellFormat();
			setCellFormat(notiFormat, jxl.format.Colour.WHITE, jxl.format.BorderLineStyle.NONE, jxl.format.Alignment.LEFT); // 공지셀 포멧
			setCellFormat(headerFormat, jxl.format.Colour.YELLOW, jxl.format.BorderLineStyle.THIN, jxl.format.Alignment.CENTRE); // 헤더셀 포멧
			setCellFormat(dataFormat, jxl.format.Colour.WHITE, jxl.format.BorderLineStyle.THIN, null); // 데이터셀 포멧
			// 각 셀칼럼의 사이즈
			// sheet.setColumnView(0,8);

			// 헤더를 그린다.
			if (arrHeaderInfo.size() > 0) {
				//기존의 엑셀다운로드 방식 사용
				if(showDataList.size() > 0) {
					setExcelHeaderOld(sheet, headerFormat, showDataList);
					setExcelDataOld(sheet, dataFormat, showDataList);
				} else {
					setExcelHeaderEmpty(sheet, headerFormat, arrHeaderInfo);
				}
				//신규 엑셀다운로드 방식 미사용
			//	setExcelHeader(sheet, headerFormat, notiFormat, showDataList, arrHeaderInfo, xlsType);
			}
			// 데이터를 그린다.
//			if (showDataList.size() > 0) {
//				//기존의 엑셀다운로드 방식 사용
//				setExcelDataOld(sheet, dataFormat, showDataList);
//				//신규 엑셀다운로드 방식 미사용
//			//	setExcelData(sheet, dataFormat, showDataList, arrHeaderInfo, xlsType);
//			}
			workbook.write();
		} catch (Exception e) {
			e.printStackTrace();
			log.error("Excel파일 다운로드중 오류가 발생하였습니다.", e);
			return false;
		} finally {
			try {
				workbook.close();
			} catch (WriteException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return true;
	}
	
	/**
	    * 액셀의 헤더부분을 그리는 메소드
	    * @param sheet
	    * @param headerFormat
	    * @param ds
	 * @throws WriteException 
	 * @throws RowsExceededException 
	    */
	   private void setExcelHeaderOld(WritableSheet sheet, WritableCellFormat cellFormat, List<Map<String, Object>> ds) throws RowsExceededException, WriteException {
			// TODO Auto-generated method stub
			Object[] keys = ds.get(0).keySet().toArray();
			jxl.write.Label label =null;
			//		jxl.write.Blank blank=null;
			String keyName="";
			int colSize = 10;
			int colNum = 0; //RNUM과 RCOUNT칼럼제거 하기위한 카운트
			
			for (int i = 0; i < keys.length; i++) {
				keyName = keys[i].toString();
				if ( "RNUM".equals(keyName) || "RCOUNT".equals(keyName)) { //RNUM과 RCOUNT칼럼제거	
					colNum++;
				}else{
					label = new jxl.write.Label(i-colNum, 0, keyName, cellFormat);
					sheet.addCell(label);
//						if(!keyName.isEmpty()) colSize = keyName.length()*3 ;  //jdk1.6
					if(!StringUtils.isEmpty(keyName)) colSize = keyName.length()*3 ; //jdk.15
					sheet.setColumnView(i-colNum, colSize);
				}
			}
	   }

	   private void setExcelHeaderEmpty(WritableSheet sheet, WritableCellFormat cellFormat, List<Map<String, Object>> ds) throws RowsExceededException, WriteException {
			// TODO Auto-generated method stub
			jxl.write.Label label =null;
			String keyName = "";
			
			int colSize = 10;
			int colNum = 0; //RNUM과 RCOUNT칼럼제거 하기위한 카운트		
			
			for (int i = 0; i < ds.size(); i++) {
				keyName = ds.get(i).values().toArray()[1].toString();
				label = new jxl.write.Label(i, 0, keyName, cellFormat);
				sheet.addCell(label);
				if(!StringUtils.isEmpty(keyName)) colSize = keyName.length()*3 ; //jdk.15
				sheet.setColumnView(i, colSize);
			}
		}

	/**
	 * 액셀의 헤더부분을 그리는 메소드
	 * 
	 * @param sheet
	 * @param headerFormat
	 * @param ds
	 * @throws WriteException
	 * @throws RowsExceededException
	 */
	private void setExcelHeader(WritableSheet sheet, WritableCellFormat headerCellFormat, WritableCellFormat notiCellFormat,  List<Map<String, Object>> ds, ArrayList<Map<String, Object>> arrCols, String xlsType ) throws RowsExceededException, WriteException {
		int colSize = 10;
		int colPos = 0; //report타입 기본 0 data타입은 표시 위치만큼 지정할것. 
		int rowPos = 0;
		if(CommonConst.XLS_TYPE.DATA.getVal().equals(xlsType)){
//			colPos = colPos + 1;
		}
		
		jxl.write.Label noti = null;
		jxl.write.Label label = null;
		jxl.write.Label field = null;
		// jxl.write.Blank blank=null;
		
		if(CommonConst.XLS_TYPE.DATA.getVal().equals(xlsType)){
			//todo 데이터의 1번째 데이터를 헤더정보로 설정 2행
			//todo 데이터의 2번째 데이터를 field컬럼명로 설정 1행
			Object[] fieldKeys = ds.get(0).keySet().toArray();
			String keyName = "";
			String labelName = "";
			
			int colNum = 0; // RNUM과 RCOUNT칼럼제거 하기위한 카운트
			//todo 최상위 주의사항 기록
			noti = new jxl.write.Label(0, 0, "※A열은 절대 수정하지 마십시요.", notiCellFormat);
			sheet.addCell(noti);
			
			
			for (int i = 0; i < fieldKeys.length; i++) {
				keyName = fieldKeys[i].toString();
				labelName = ds.get(0).get(keyName).toString();
				
//				if(i == 0){
//					labelName ="데이터키"; //첫번째 컬럼은 무조건 데이터키로 셋팅한다.
//				}
				
				if ("RNUM".equals(keyName) || "RCOUNT".equals(keyName) ||   "SORT".equals(keyName)) { // RNUM과
					// RCOUNT칼럼제거
					colNum++;
				} else {
					field = new jxl.write.Label(i - colNum, 1, keyName, headerCellFormat);
					label = new jxl.write.Label(i - colNum, 2, labelName, headerCellFormat);
					sheet.addCell(field);
					sheet.addCell(label);
					// if(!keyName.isEmpty()) colSize = keyName.length()*3 ;
					// //jdk1.6
//					if (!StringUtils.isEmpty(keyName)){
//						colSize = keyName.length() * 2; // jdk.15
//					}
					if (!StringUtils.isEmpty(labelName)){
						if(keyName.length() < labelName.length()){
							colSize = labelName.length() * 3; // jdk.15
						}
					}
					
					sheet.setColumnView(i - colNum, colSize);
				}
			}
		}else{
			//todo client에서 취득한 헤더정보 건수로 데이터를 처리함.
			for (int i = 0; i < arrCols.size(); i++) {
				
				String strLabel = arrCols.get(i).get("label").toString();
				String strField = arrCols.get(i).get("field").toString();
				int iColNo =  Integer.parseInt(arrCols.get(i).get("colNo").toString());
				
				if(CommonConst.XLS_TYPE.DATA.getVal().equals(xlsType)){
					field = new jxl.write.Label(iColNo + colPos , rowPos ,strField, headerCellFormat);
					label = new jxl.write.Label(iColNo + colPos , rowPos+1 ,strLabel, headerCellFormat);
					sheet.addCell(field);
					sheet.addCell(label);
				}else{
					label = new jxl.write.Label(iColNo + colPos , rowPos ,strLabel, headerCellFormat);
					sheet.addCell(label);
				}
				
				// if(!keyName.isEmpty()) colSize = keyName.length()*3 ;
				// //jdk1.6
				if (!StringUtils.isEmpty(strLabel))
					colSize = strLabel.length() * 3; // jdk.15
				sheet.setColumnView(iColNo + colPos, colSize);
			}
		}
	}
//	/**
//	 * 액셀의 헤더부분을 그리는 메소드
//	 * 
//	 * @param sheet
//	 * @param headerFormat
//	 * @param ds
//	 * @throws WriteException
//	 * @throws RowsExceededException
//	 */
//	private void setExcelHeader(WritableSheet sheet,
//			WritableCellFormat cellFormat, List<Map<String, Object>> ds)
//					throws RowsExceededException, WriteException {
//		
//		Object[] keys = ds.get(0).keySet().toArray();
//		jxl.write.Label label = null;
//		// jxl.write.Blank blank=null;
//		String keyName = "";
//		int colSize = 10;
//		int colNum = 0; // RNUM과 RCOUNT칼럼제거 하기위한 카운트
//		
//		for (int i = 0; i < keys.length; i++) {
//			keyName = keys[i].toString();
//			if ("RNUM".equals(keyName) || "RCOUNT".equals(keyName)) { // RNUM과
//				// RCOUNT칼럼제거
//				colNum++;
//			} else {
//				label = new jxl.write.Label(i - colNum, 0, keyName, cellFormat);
//				sheet.addCell(label);
//				// if(!keyName.isEmpty()) colSize = keyName.length()*3 ;
//				// //jdk1.6
//				if (!StringUtils.isEmpty(keyName))
//					colSize = keyName.length() * 3; // jdk.15
//				sheet.setColumnView(i - colNum, colSize);
//			}
//		}
//	}

	/**
	 * 액셀의 데이터 부분을 그리는 메소드
	 * 
	 * @param sheet
	 * @param headerFormat
	 * @param ds
	 * @throws WriteException
	 * @throws RowsExceededException
	 */
//	private void setExcelData(WritableSheet sheet,
//			WritableCellFormat cellFormat, List<Map<String, Object>> ds,
//			String xlsType )
//			throws RowsExceededException, WriteException {
//
//		Object[] keys = ds.get(0).keySet().toArray();
//		jxl.write.Label label = null;
//		jxl.write.Number number = null;
//		// jxl.write.Blank blank=null;
//		String keyName = "";
//
//		for (int i = 0; i < ds.size(); i++) {
//			int colNum = 0; // RNUM과 RCOUNT칼럼제거 하기위한 카운트
//
//			for (int j = 0; j < keys.length; j++) {
//				String data = " ";
//
//				keyName = keys[j].toString();
//				if ("RNUM".equals(keyName) || "RCOUNT".equals(keyName)) { // RNUM과 RCOUNT칼럼제거
//					colNum++;
//				} else {
//					if (null != ds.get(i).get(keyName))
//						data = ds.get(i).get(keyName).toString();
//					if (NumberUtils.isNumber(data)) {
//						try {
//							number = new jxl.write.Number(j - colNum, i + 1,
//									Double.parseDouble(data), cellFormat);
//							sheet.addCell(number);
//
//						} catch (NumberFormatException e) {
//							// 정상적인 넘버 포멧형태가 아니므로 라벨로 표시함
//							label = new jxl.write.Label(j - colNum, i + 1,
//									data, cellFormat);
//							sheet.addCell(label);
//						}
//					} else {
//						label = new jxl.write.Label(j - colNum, i + 1, data,
//								cellFormat);
//						sheet.addCell(label);
//					}
//
//				}
//			}
//		}
//	}

	   
	/**
	* 액셀의 데이터 부분을 그리는 메소드
	* @param sheet
	* @param headerFormat
	* @param ds
	* @throws WriteException 
	* @throws RowsExceededException 
	*/
	private void setExcelDataOld(WritableSheet sheet, 
		   		WritableCellFormat cellFormat, 
		   		List<Map<String, Object>> ds) throws RowsExceededException, WriteException {

		Object[] keys = ds.get(0).keySet().toArray();
		jxl.write.Label label =null;
		jxl.write.Number number =null;
//		jxl.write.Blank blank=null;
		String keyName="";
		jxl.write.WritableCellFormat dataFormat= new WritableCellFormat();
		for (int i = 0; i < ds.size(); i++) {
			int colNum = 0; //RNUM과 RCOUNT칼럼제거 하기위한 카운트
			
			for (int j = 0; j < keys.length; j++) {
				String data = " ";
				
				keyName = keys[j].toString();
				if ( "RNUM".equals(keyName) || "RCOUNT".equals(keyName)) {			 //RNUM과 RCOUNT칼럼제거	
					colNum++;
				}else{
					if (null != ds.get(i).get(keyName)) data = ds.get(i).get(keyName).toString();
					if(NumberUtils.isNumber(data) && !data.substring(0,1).equals("0")){ 	//id에 첫글자가 0이포함되어있어도 표기하깅위해 뒷부분 추가
						
						try{
							number = new jxl.write.Number(j-colNum, i+1, Double.parseDouble(data), cellFormat);
							sheet.addCell(number);
							
						}catch(NumberFormatException e){
							//정상적인 넘버 포멧형태가 아니므로 라벨로 표시함
							label = new jxl.write.Label(j-colNum, i+1, data, cellFormat);
							sheet.addCell(label);
						}
					}else{
						label = new jxl.write.Label(j-colNum, i+1, data, cellFormat);
						sheet.addCell(label);
					}
					
				}
			}
		}
	}
	
	private void setExcelData(WritableSheet sheet,
			WritableCellFormat cellFormat, 
			List<Map<String, Object>> ds, 
			ArrayList<Map<String, Object>> dispCols,
			String xlsType)
					throws RowsExceededException, WriteException {
		
		Object[] keys = ds.get(0).keySet().toArray();
		jxl.write.Label label = null;
		jxl.write.Number number = null;
		// jxl.write.Blank blank=null;
		String keyName = "";
		
		if(CommonConst.XLS_TYPE.DATA.getVal().equals(xlsType)){
			
			for (int i = 1; i < ds.size(); i++) {
				int colNum = 0;
				for (int j = 0; j < keys.length; j++) {
//					String data = " ";
					String data = null; //20140116 khma
					keyName = keys[j].toString();
					if ("RNUM".equals(keyName) || "RCOUNT".equals(keyName)  || "SORT".equals(keyName)) { // RNUM과 RCOUNT칼럼제거
						colNum++;
					} else {
						
						if (null != ds.get(i).get(keyName)){
							data = ds.get(i).get(keyName).toString();
						}
						
						if (NumberUtils.isNumber(data)) {
							try {
								number = new jxl.write.Number(j - colNum, i + 2,
										Double.parseDouble(data), cellFormat);
								sheet.addCell(number);
			
							} catch (NumberFormatException e) {
								// 정상적인 넘버 포멧형태가 아니므로 라벨로 표시함
								label = new jxl.write.Label(j - colNum, i + 2,
										data, cellFormat);
								sheet.addCell(label);
							}
						} else {
							label = new jxl.write.Label(j - colNum, i + 2, data,
									cellFormat);
							sheet.addCell(label);
						}
			
					}
				}
			}
		}else{
			for (int i = 0; i < ds.size(); i++) {
				int colPos = 0; //report타입 기본 0 data타입은 표시 위치만큼 지정할것. 
				int rowPos = 1; //report타입 기본 0 data타입은 표시 위치만큼 지정할것.
				
				if(CommonConst.XLS_TYPE.DATA.getVal().equals(xlsType)){
					rowPos = rowPos + 1;
				}
				
				for (int j = 0; j < keys.length; j++) {
//					String data = " ";
					String data = null; //20140116 khma
					keyName = keys[j].toString();
					
					int targetColNo = 0;
					String strTargetColNo = getTargetColNo( dispCols,  keyName); //데이터셋팅의 컬럼 위치 정보 취득;
					if(StringUtils.isEmpty(strTargetColNo)){
						
					}else{
						targetColNo = Integer.parseInt(strTargetColNo);
						
						if (null != ds.get(i).get(keyName))
						data = ds.get(i).get(keyName).toString();
						if (CommonUtil.isNumber(data)) {
							try {
								number = new jxl.write.Number(targetColNo + colPos, i + rowPos,
										Double.parseDouble(data), cellFormat);
								sheet.addCell(number);
								
							} catch (NumberFormatException e) {
								// 정상적인 넘버 포멧형태가 아니므로 라벨로 표시함
								label = new jxl.write.Label(targetColNo + colPos, i + rowPos,
										data, cellFormat);
								sheet.addCell(label);
							}
						} else {
							label = new jxl.write.Label(targetColNo + colPos, i + rowPos, data,
									cellFormat);
							sheet.addCell(label);
						}
					
					}
				}
			}
		}
	}

	/**
	 * 컬럼목록으로부터 데이터 필드의 셋팅컬럼 위치를 취득한다.
	 * @param dispCols
	 * @param keyName
	 */
	private String getTargetColNo(ArrayList<Map<String, Object>> dispCols,
			String keyName) {

		String rstColNo= null ;
		for (Map<String, Object> map : dispCols) {
			String fieldName = map.get("field").toString();
			if(keyName.equals(fieldName)){
				//같으면 해당하는 번호를 취득
				rstColNo = map.get("colNo").toString();
			}
		}
		return rstColNo;
	}

	/**
	 * 엑셀 포멧설정
	 * 
	 * @param headerFormat
	 * @param gray25
	 * @param all
	 * @param thin
	 * @param cENTRE
	 * @throws WriteException
	 */
	private void setCellFormat(WritableCellFormat tFormat, Colour bgColor,
			BorderLineStyle borderLine, Alignment align) throws WriteException {

		if (null != bgColor) {
			tFormat.setBackground(bgColor);
		} else {
			tFormat.setBackground(jxl.format.Colour.GRAY_25);
		}
		if (null != borderLine) {
			tFormat.setBorder(jxl.format.Border.ALL, borderLine);
		} else {
			tFormat.setBorder(jxl.format.Border.ALL,
					jxl.format.BorderLineStyle.THIN);
		}
		if (null != align) {
			tFormat.setAlignment(align);
		}
	}

	private String getDisposition(String filename, String browser)
			throws Exception {
		String dispositionPrefix = "attachment;filename=";
		String encodedFileName = null;

		if (browser.equals("MSIE")) {
			encodedFileName = URLEncoder.encode(filename, "UTF-8").replaceAll(
					"\\+", "%20");
		} else if (browser.equals("FireFox")) {
			encodedFileName = "\""
					+ new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Opera")) {
			encodedFileName = "\""
					+ new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Chrome")) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < filename.length(); i++) {
				encodedFileName = "\""
						+ new String(filename.getBytes("UTF-8"), "ISO-8859-1")
						+ "\"";

			}
		} else {
			throw new RuntimeException("Not Supported browser");
		}

		return dispositionPrefix + encodedFileName;
	}

	private String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.indexOf("MSIE") > -1 || header.indexOf("rv:11.0") > -1) {
			return "MSIE";
		} else if (header.indexOf("Chrome") > -1) {
			return "Chrome";
		} else if (header.indexOf("Opera") > -1) {
			return "Opera";
		}
		return "FireFox";
	}

}
