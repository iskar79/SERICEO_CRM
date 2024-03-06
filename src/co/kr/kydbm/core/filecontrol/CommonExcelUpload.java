package co.kr.kydbm.core.filecontrol;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonExcelUtil;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.filecontrol.DataUploadResultBean;
import co.kr.kydbm.core.filecontrol.UploadDataService;
import co.kr.kydbm.core.utils.QueryGenerator;
import co.kr.kydbm.core.bean.ExcelImportBean;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.DataUploadDaoImpl;
import co.kr.kydbm.core.dao.MonArchDaoImpl;

/**
 * 공통 데이터 업로드 처리 클래스
 * @author 김정원
 * @since 20130422
 */
public class CommonExcelUpload implements UploadDataService{

	Logger logger =  Logger.getLogger(CommonExcelUpload.class.getName());
	
	public DataUploadResultBean execute(MultipartFile FileName,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		
		logger.info("■CommonExcel데이터 파일 업로드 처리 Start");
		//처리 결과값 정보를 반환
		DataUploadResultBean resultBean = new DataUploadResultBean();

		String xmlParams  =request.getParameter("jsonParam");
		xmlParams = URLDecoder.decode(xmlParams, "UTF-8");
		String service = request.getParameter("service");
		String exeMethod = request.getParameter("exeMethod");
		ObjectMapper om = new ObjectMapper();
		Map<String, String> obj;
		String fileName = FileName.getOriginalFilename();
		om.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		//om.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);
		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
		try{
				resultBean = exeExcepUpload(FileName, obj, service, exeMethod);
		}catch (Exception e) {
			resultBean.setRESULT(CommonConst.FAIL);
			resultBean.setMESSAGE(e.getMessage());
			logger.error("["+ fileName +"] 데이터 업로드중 예기치 못한 오류 발생",e);
			return resultBean;
			
		} finally{
			logger.info("■CommonExcel데이터 파일 업로드 처리 End");
	}
		return resultBean;
	}
	
	/**
	 * 실제 액셀파일을 읽어들여 업로드 하는 메소드
	 * @param fileName
	 * @param exeMethod 
	 * @param service 
	 * @param request
	 * @return
	 * @throws Exception 
	 */
	private DataUploadResultBean exeExcepUpload(MultipartFile fileName,
			Map<String, String> reqParam, String service, String exeMethod) throws Exception {
		logger.debug("[StartMethod]: exeExcepUpload");
		// TODO Auto-generated method stub
		
		DataUploadResultBean resultBean = new DataUploadResultBean();
		
		String uSite = reqParam.get("USITE");
		String uId = reqParam.get("UID");
		String uLid = reqParam.get("ULID");
		String execQry = "";
		//확장자 확인
		try {
			
			//TODO SQL쿼리 취득
			MonArchDaoImpl monArchDao = new MonArchDaoImpl();
			ServiceInfo si = new ServiceInfo();
			//해당하는 서비스와 메소드 회원사번호로 쿼리를 읽어옴
			if ( CommonConst.MON_COMMON.equals(service)) { //서비스가 MON_COMMON일 경우는 모나크 공통서비스 이용을 위한 처리임
				si = monArchDao.ReadQuery(service,exeMethod,"44");  // MON_COMMON일때에는 [1] 모나크프레임워크 공통서비스 이용
			} else {
				si = monArchDao.ReadQuery(service,exeMethod,reqParam.get("USITE").toString());
			}
			 if (si == null) {
				//업로드 대상파일이 아님
				logger.error("["+fileName.getOriginalFilename()+"]: "+ service + " - " + exeMethod + "에 해당되는 서비스쿼리를 찾을수 없습니다.");
				resultBean.setRESULT(CommonConst.FAIL);
				resultBean.setMESSAGE("해당 서비스쿼리를 찾을수 없습니다. ");
				return resultBean;
            }
			String fname = fileName.getOriginalFilename();
			String extender = CommonUtil.getSuffix(fname);
			
			//확장자 체크
			boolean ExtenderCheck = CommonUtil.checkExtender(fname, CommonConst.XLS_UPLOAD_WHITE_LIST);
			
			if(ExtenderCheck = false){
				//업로드 대상파일이 아님
				logger.error("["+fname+"] 대상파일이 액셀파일의 확장자가 아님.");
				resultBean.setRESULT(CommonConst.FAIL);
				resultBean.setMESSAGE("대상파일은 액셀형식의 확장자를 가진 파일만 업로드 가능합니다. ");
				return resultBean;
				
			}

			ExcelImportBean excelImportBean = new ExcelImportBean();
			if(si.getJobType().equals(CommonConst.QUERY_TYPE.EXCEL_IMPORT.name())){
				//TODO 액셀실행타입이 EXCEL_IMPORT인 경우에는 구조체형태의 데이터정보를 취득한다.
				Map<String, Object> excelQryInfo = CommonUtil.JsonToMap(si.getSql());
				
				excelImportBean.setAllowError(excelQryInfo.get("allowError").toString());
				excelImportBean.setCreateCols((ArrayList<Map<String, String>>) excelQryInfo.get("createCols"));
				excelImportBean.setAllowError(excelQryInfo.get("allowError").toString());
				excelImportBean.setExecRowCount(excelQryInfo.get("execRowCount").toString());
				excelImportBean.setKeyCols((ArrayList<Map<String, String>>) excelQryInfo.get("keyCols"));
				excelImportBean.setUpdateCols((ArrayList<Map<String, String>>) excelQryInfo.get("updateCols"));
				excelImportBean.setUpdateCols((ArrayList<Map<String, String>>) excelQryInfo.get("updateCols"));
				excelImportBean.setTableName(excelQryInfo.get("tableName").toString());
				
				
			}else {
				//TODO 액셀실행타입잉 EXCEL_IMPORT가 아닌경우에는 기존의 처리를 실행한다.
				
			}
			
			 Sheet sheet = null;
			 
			 //checkExtender(extender);
			 //인수에 지정한 인풋스트림으로부터 워크북을 읽어들인다.
			InputStream ins;
			ins = fileName.getInputStream();
				
			if("XLS".equals(StringUtils.upperCase(extender))){
	
				Workbook workbook = WorkbookFactory.create(ins);
				 sheet = workbook.createSheet();
				 sheet = workbook.getSheetAt(0);
			}else if("XLSX".equals(StringUtils.upperCase(extender))){
				XSSFWorkbook workbook = new XSSFWorkbook(ins);
			
		        sheet = workbook.createSheet();
		        sheet = workbook.getSheetAt(0);
			}else{
				//업로드 대상파일이 아님
				logger.error("["+fname+"] 대상파일이 액셀파일의 확장자가 아님.");
				resultBean.setRESULT(CommonConst.FAIL);
				resultBean.setMESSAGE("대상파일은 액셀형식의 확장자를 가진 파일만 업로드 가능합니다. ");
				ins.close(); //20140113 khma 추가
				return resultBean;
			}
			ins.close();
			
			//1행부터 한행씩 분석하며 입력값을 LISTMAP에 저장한다.
			LinkedList<Map<String, String>> parameters = new LinkedList<Map<String,String>>();
			String ulid = reqParam.get("ULID");
			//수식셀의 값취득을 위한 처리
			Workbook wb =  sheet.getWorkbook();
		    CreationHelper crateHelper = wb.getCreationHelper();
		    FormulaEvaluator evaluator = crateHelper.createFormulaEvaluator();
		    
		    int lastRow =0;
//		    int rcnt =0;
//		    while(rcnt <= sheet.getLastRowNum() ){
//		    	 if( rcnt >= 1){
//			    	Row row = sheet.getRow(rcnt);
//			    	if(null !=CommonExcelUtil.getCellData(row.getCell(63)) && !CommonExcelUtil.getCellData(row.getCell(63)).equals("")){
//			    		lastRow++;
//			    	}else{
//			    		break;
//			    	}
//		    	 }
//		    	rcnt++;
//		    }
		    //공통액셀은 2행부터 시작하며 행수 만큼 반복하여 데이터맵 리스트를 생성한다.
		    //데이터키명은 해당항목의 컬럼명으로 매칭한다.
		    
		    //액셀 컬럼정보 취득[컬럼명과 쿼리 맵핑을 위해]
//		    Row headerCols = sheet.getRow(0); //20140113 khma  헤더정보 2행 라벨정보3행으로 변경됨
		    Row headerCols = sheet.getRow(1); //
		    
		    int headerColsSize = headerCols.getLastCellNum();
		    int commXlsStartRowNum = 3; //공통액셀 시작 행번호
		    ArrayList<String> hdColsNameList = new ArrayList<String>(); //헤더정보리스트
		    for(int i=0; i<headerColsSize; i++){
		    	hdColsNameList.add(CommonExcelUtil.getCellData(headerCols.getCell(i)));
		    }
			//3행부터의 행수만큼 반복하여 데이터맵 리스트 작성
		    for(int i = commXlsStartRowNum; i <= sheet.getLastRowNum(); i++){
		    	Row row = sheet.getRow(i);
		    	Map<String, String> mapData = new HashMap<String, String>();
			    for(int hc = 0; hc < headerColsSize; hc++){
			    	
			    	mapData.put( CommonExcelUtil.getCellData(headerCols.getCell(hc)), CommonExcelUtil.getCellData(row.getCell(hc)));
			    }
			    //TODO setJsonParameters;
			    mapData.put("UID", uId);
			    mapData.put("USITE", uSite);
			    mapData.put("ULID", uLid);
			    parameters.add(mapData);
		    }
	
		    DataUploadDaoImpl dataUploadDaoImpl = new DataUploadDaoImpl();
		    String SqlCommand = dataUploadDaoImpl.replaceNameTemplateType(si.getSql(), hdColsNameList);
		    dataUploadDaoImpl.exeDataUpload(parameters, SqlCommand, excelImportBean, hdColsNameList);
		    
		    
			//처리성공
			resultBean.setRESULT(CommonConst.SUCCESS);
		} catch (IOException e) {
			e.printStackTrace();
			logger.error("파일I/O 오류: 대상 파일은 존재 하지 않거나 손상된 파일입니다.",e);
			throw new Exception("데이터 업로드중 예기치 못한 오류 발생",e);
		} catch (InvalidFormatException e) {
			e.printStackTrace();
			logger.error("액셀 포맷 오류: 대상 파일은 정상적인 액셀 포멧이 아닙니다.",e);
			throw new Exception("데이터 업로드중 예기치 못한 오류 발생",e);
		}catch (DuplicateKeyException e) { //데이터 중복에러 
			e.printStackTrace();
			logger.error("제약사항으로 인한 중복 오류가 발생하였습니다.",e);
			throw new Exception("제약사항으로 인한 중복 오류가 발생하였습니다.", e);
		}catch (Exception e) {
			e.printStackTrace();
			logger.error("데이터 업로드중 예기치 못한 오류 발생.",e);
			throw new Exception("데이터 업로드중 예기치 못한 오류 발생",e);
		}

		logger.debug("[EndMethod]: exeExcepUpload");
		return resultBean;
	}
	
	/**
	 * 액셀 입력 쿼리
	 * @return
	 */
//	private String getSql(){
//		String strSql = "";
//
//		return strSql;
//	}
}
	



