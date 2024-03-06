package co.kr.kydbm.core.filecontrol;
 
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonParser.Feature;
import org.codehaus.jackson.map.DeserializationConfig;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonConst.XLS_TYPE;
import co.kr.kydbm.common.CommonExcelUtil;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.service.SvcCRUD;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.PropertyUtil;
import co.kr.kydbm.core.utils.QueryGenerator;
 
/**
 *  파일 업로드 콘트롤러 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
@Controller
public class UploadController
{
	
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	private static final String[] FILE_UPLOAD_WHITE_LIST = { 
		"BMP","GIF","JPG","PCX","PNG","SVG","SVGZ","TIF", //이미지파일 확장자
		"DOC","DOCX","DOTX","DOT","DPC","HWP","HWT","PDF","PPT","PPTX","RTF","TXT","XLS","XLSX","XML", //문서파일 확장자 
		"AAC","AC3","FLAC","MID","MIDI","MP3","OGG","RA","WAV","WMA", //오디오파일 확장자
		"ASF","ASX","AVI","FLV","MKV","MOV","MP4","MPG","MPEG","RAM","RM","SWF","WMV", //비디오파일 확장자
		"ACE", "ALZ","ARC",  "GZ", "JAR", "LHA", "LZH",  "RAR", "TAR", "TGZ", "WAR","ZIP"  //압축파일
		};
	
	private static final String[] EXCEL_DOWN_CLASS_WHITE_LIST = {
		//TODO EXCEL 다운로드 확장클래스 호출시에 해당 클래스에 목록을 기록후 해당 클래스에 존재하는 클래스만 사용할것.
		//"co.kr.kydbm.TestExtExcelDown.class"
	};
	Logger log = Logger.getLogger(UploadController.class.getName());
	
	/**
	 * 멀티파일업로드 물리적 파일저장방식
	 * @param USITE
	 * @param UID
	 * @param jobType
	 * @param fileSearchKey
	 * @param Filename
	 * @param request
	 */
	@RequestMapping("/fileupload")
	public void multiFileUpload(
			@RequestParam("USITE") String USITE,
			@RequestParam("UID") String UID,
			@RequestParam("jobType") String jobType,
			@RequestParam("fileSearchKey") String fileSearchKey,
			@RequestParam("Filename") MultipartFile Filename, 
			HttpServletRequest request,
			HttpServletResponse response) throws Exception  {
		
		ConfigProperties configProperties = ConfigProperties.getInstance();
		Calendar calendar = Calendar.getInstance();
		String baseFolder= "FileData" ;
		String years= String.valueOf(calendar.get(Calendar.YEAR)) ;
		String months= String.valueOf(calendar.get(Calendar.MONTH) + 1) ;
		SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String currentTimestamp = sd.format(calendar.getTime());
		String uploadFolder = "/"+baseFolder+"/" +years +"/" + months;
//		String realPath = request.getSession().getServletContext().getRealPath( uploadFolder ); //20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
		String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
		String realPath = defaultFilePath + "/" + uploadFolder ; //20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
		String realfileName = currentTimestamp+ "_"+ Filename.getOriginalFilename(); 
		String fileSize = String.valueOf(Filename.getSize());
		long lFileSize =Long.parseLong(fileSize);;
//		PropertyUtil propertyUtil  = new PropertyUtil("monarch.properties");
		long limitSize = 500000;
		String strLimitSize = configProperties.getProperty("monarch.fileupload.limitsize");
		if(StringUtils.isNotEmpty(strLimitSize) && StringUtils.isNumeric(strLimitSize)){
			limitSize = Long.parseLong(strLimitSize);
		}
		
		//업로드파일 확장자 체크(Client에서 체크와 상관없이 내부적으로 서버사이드 체크함)
		if(!CommonUtil.checkExtender(Filename.getOriginalFilename(), FILE_UPLOAD_WHITE_LIST)){
			response.setContentType("text/html; charset=UTF-8");
	 	    PrintWriter out = null;
			try {
				out = response.getWriter();
				out.write("<script language='javascript'>alert('업로드 할수 없는 형식의 파일입니다.');</script>");
			} catch (IOException e) {
				e.printStackTrace();
			}finally{
				out.close();
			}
		} else {
		
			if(lFileSize > limitSize ){
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = null;
				try {
					out = response.getWriter();
					out.write("<script language='javascript'>alert('파일용량이 제한용량보다 큽니다.');</script>");
				} catch (IOException e) {
					e.printStackTrace();
				}finally{
					out.close();
				}
			}else{
				
				File dir = new File(realPath);
				if(!dir.isDirectory()){
					dir.mkdirs();
				}
				//		 request.getSession().getServletContext().getRealPath("/APP_Data/") + System.getProperty("file.separator") + fileName+".csv";
				if(writeFile(Filename, realPath, realfileName)){
					// 파일관리 테이블에 정보 등록
					String service = "MON_COMMON";
					String method = "FILE_MANAGER_CREATE";
					String usite = USITE;
					MonArchDaoImpl monArchDao = new MonArchDaoImpl();
					ServiceInfo serviceInfo =  monArchDao.ReadQuery(service, method, usite);
					String sqlCommnand = "";
					sqlCommnand = serviceInfo.getSql();
					Map<String, String> mapParam = new HashMap<String, String>();
					mapParam.put("FILE_PATH", uploadFolder+"/"+realfileName);
					mapParam.put("FILE_NAME", Filename.getOriginalFilename());
					mapParam.put("FILE_SIZE", fileSize);
					mapParam.put("UID", UID);
					mapParam.put("USITE", USITE);
					
					mapParam.put("JOB_TYPE", jobType);
					mapParam.put("FILE_SEARCH_KEY", fileSearchKey);
					mapParam.put("USE_FLAG", "1");
					monArchDao.exeUpdate(sqlCommnand, mapParam);
//		 		response.setContentType("text/html; charset=UTF-8");
//		 	    PrintWriter out;
//				try {
//					out = response.getWriter();
//					out.write("<script language='javascript'>alert('success');</script>");
//					out.close();
//				} catch (IOException e) {
//					e.printStackTrace();
//				}
				}
			}
		}
	}

	/**
	 * 모나크 기존 DB저장방식의 파일 업로드
	 * @param Filename
	 * @param Urlname
	 * @param Note
	 * @param ParentType
	 * @param ParentKey
	 * @param WebFolder
	 * @param UID
	 * @throws IOException
	 */
	@RequestMapping("/upload")
	public void uploadFile(@RequestParam("Filename") MultipartFile multiPartFile
			,@RequestParam("Urlname") String Urlname
			,@RequestParam("Note") String Note
	//		,@RequestParam("ParentType") String ParentType	//20120816 khma
	//		,@RequestParam("ParentKey") String ParentKey	//20120816 khma
	//		,@RequestParam("WebFolder") String WebFolder	//20120816 khma
			,@RequestParam("UID") String UID,@RequestParam("USITE") String USITE) throws IOException, Exception {
		
		String fname = multiPartFile.getOriginalFilename();
		String uname = Urlname;
		String fileszie =  String.valueOf(multiPartFile.getSize());
		String fileType = "";
		String contentType = multiPartFile.getContentType();
		
		String desc = Note;
//		String 상위정보 = ParentType; //20120816 khma
//		String 상위키 = ParentKey; 	 //20120816 khma
//		String 폴더경로 = WebFolder;	//20120816 khma
		String regUser = UID;
		String 회원사번호 = USITE;
		//TODO 파일관리와 이미지겔러리를 같은 처리에서 사용되고 있으나, 유형이 경로일때는 무조건 이미지겔러리로 들어감.
		if (!uname.equals("") ) {
		
			fileType = "경로";
			contentType = "image/url";
		
		}else if(contentType.substring(0,5).equals("image")){
		
			fileType = "이미지";
		
		}else{
			
			fileType = "파일";
			
		}
		// 2013-12-17 khma : db분기처리 확인 필요 
		String sqlCommand = "INSERT INTO M_IMAGE_GAL (" +
				QueryGenerator.genSequenceCol(DB_TYPE, "M_IMAGE_GAL_NO", true) +
				"FILE_NAME, FILE_SIZE, FILE_CONTENT_TYPE, FILE_TYPE_CODE, LINK_URL, " +
				"FILE_DESC, " +
//				"상위정보, " +
//				"상위키," +
//				" 폴더경로" +
				"REG_DATE, UPD_DATE, REG_USER, UPD_USER, FILE_DATA, M_USITE_NO) VALUES (" +
				QueryGenerator.genSequenceStmt(DB_TYPE, "M_IMAGE_GAL_SEQ", true) +
				"?, ?, ?,?,?, " +
				" ?,"+
				//",?,NVL(?,0),?" +
				QueryGenerator.genSysDate(DB_TYPE, true) + 
				QueryGenerator.genSysDate(DB_TYPE, true) + 
				" ?, ?, ? ,?)";

		//바이트로 데이터를 취득
			Map<String, String> mParam = new HashMap<String, String>();
			mParam.put("FILE_NAME", fname);
			mParam.put("FILE_SIZE", fileszie);
			mParam.put("FILE_CONTENT_TYPE", contentType);
			//mParam.put("내용", Filename);
			mParam.put("FILE_TYPE_CODE", fileType);
			mParam.put("LINK_URL", uname);
			mParam.put("FILE_DESC", desc);
//			mParam.put("상위정보", 상위정보);  //20120816 khma
//			mParam.put("상위키", 상위키);		  //20120816 khma
//			mParam.put("폴더경로", 폴더경로); //20120816 khma
			mParam.put("REG_USER", regUser);
			mParam.put("UPD_USER", regUser);
			mParam.put("M_USITE_NO", USITE); //20130320 khma 추가

			MonArchDaoImpl monArchDao = new MonArchDaoImpl();
			int rst =0;
			try {
//				FileInputStream fis = multiPartFile.getBytes();
				rst = monArchDao.uploadFile(sqlCommand, mParam,multiPartFile);
			} catch (Exception e) {
				log.error("파일을 DB에 저장하는 중 오류가 발생하였습니다." ,e);
				throw new Exception(e);
			}
		}
	
	/**
	 * 파일사이즈 체크
	 * @param Filename
	 * @param Urlname
	 * @param Note
	 * @param ParentType
	 * @param ParentKey
	 * @param WebFolder
	 * @param UID
	 * @throws IOException
	 */
	@RequestMapping("/checkfilesize")
//	public long checkFilesize(@RequestParam("Filename") MultipartFile Filename	) throws IOException {
		public ModelAndView checkFilesize(@RequestBody  String XmlParms) throws Exception {
		
//		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		String xmlParams  =XmlParms;
		//xmlParams = parsingForJonType(xmlParams);
		ObjectMapper om = new ObjectMapper();
		Map<String, String> obj;
		String filepath =null;
		long filesize = 0;
		
		//om.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		om.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);
		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
		
		if(obj.containsKey("Filename")) {
			filepath =URLDecoder.decode(obj.get("Filename"), "UTF-8");
		}
		
		File file = new File(filepath);
		//파일이 존재하면 파일사이즈 체크
		if(file.isFile()){
			filesize = file.length();
		}else{
			//파일이 존재하지 않으면 -1반환 
			filesize = -1;
		}
		ModelAndView mav = new ModelAndView("", "filesize", filesize);
		return mav;
	}
	
	/**
	 * 물리적 파일 다운로드(from MultiFile다운로드) 
	 * @param fid
	 * @throws Exception 
	 */
	@RequestMapping("/filedownload")
	public void fileDownload(@RequestParam("fid") String fid, HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		FileInputStream fis = null;
		OutputStream os = null;
		//2013-12-17 khma : db분기처리
		String SqlCommand = "SELECT * FROM M_FILE_MGMT WHERE M_FILE_MGMT_NO = ?";
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		
		try{
			Map<String, Object> mapFileInfo = monArchDao.downloadFile(SqlCommand, fid);
			ConfigProperties configProperties = ConfigProperties.getInstance();
			String targetFilePath = mapFileInfo.get("FILE_PATH").toString();
			String fileName = mapFileInfo.get("FILE_NAME").toString();
			String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
			String realPath = defaultFilePath + targetFilePath ;  //20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
		
			File file = new File(realPath);
			int ifilesize = (int)file.length();
			byte b[] = new byte[ifilesize];
			fis = new FileInputStream(file);
			os = response.getOutputStream();
			String disposition = getDisposition(fileName, getBrowser(request));
			response.setContentLength(ifilesize);
			response.reset() ;
	//		response.setContentType("application/vnd.msexcel");
			response.setContentType("application/octet-stream-dummy");
			response.setHeader("content", "text/html; charset=utf-8");
	//		response.setHeader("Content-Disposition", "attachment; filename=\"" + new String(fileName.getBytes("UTF-8"), "ISO-8859-1")+ "\"");
			response.setHeader("Content-Disposition", disposition);
			response.setHeader("Content-Length", ""+ifilesize );
			response.setHeader("Content-Transfer-Encoding", "binary;");
			response.setHeader("Pragma", "no-cache;");
			response.setHeader("Expires", "-1;");
			 if (ifilesize > 0 && file.isFile()) {
			     int read = 0;
			     while((read = fis.read(b)) != -1) {
			    	 os.write(b,0,read);
			     }
			  } 
			 os.flush();
		}catch(Exception e){
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다." ,e);
		}finally{
			 os.close();
			 fis.close();
		}
	}
	
	
	/**
	 * 압축파일로 통합 다운로드(from MultiFile다운로드) 
	 * @param fid
	 * @throws Exception 
	 */
	@RequestMapping("/zipFileDownload")
	public void zipFileDownload(@RequestParam("skey") String sKey, HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		FileInputStream fis = null;
		OutputStream os = null;
		ZipOutputStream zipOutputStream = null;
		
		String sqlCommand = "SELECT * FROM M_FILE_MGMT WHERE FILE_SEARCH_KEY = ?";
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		
		try{
			List<Map<String, Object>> fileList = monArchDao.downloadZipFile(sqlCommand, sKey);
			
			ConfigProperties configProperties = ConfigProperties.getInstance();
			String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");

			
			String encodeType = "UTF-8";
			
			//ZIP 파일 출력 오브젝트 작성
			os = response.getOutputStream();
			zipOutputStream = new ZipOutputStream(os);
			zipOutputStream.setLevel(5);
			zipOutputStream.setEncoding(encodeType);
			
			//압축파일리스트의 파일을 연속 압축
			long zipFileSize = 0;
			for ( int i = 0; i < fileList.size(); i++ ) {
				//파일오브젝트 작성
				String targetFilePath = fileList.get(i).get("FILE_PATH").toString();
				String fileName = fileList.get(i).get("FILE_NAME").toString();
				String realPath = defaultFilePath + targetFilePath ;  //20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
				File file = new File(realPath);
				zipFileSize += file.length();
				//ZipEntry작성
				zipOutputStream.putNextEntry(new ZipEntry(fileName));
				//archive(zipOutputStream, baseFile, file, file.getName(), encodeType);
				fis = new FileInputStream(file);
				int ifilesize = (int)file.length();
				byte b[] = new byte[ifilesize];
				if (zipFileSize > 0 && file.isFile()) {
					int read = 0;
					while((read = fis.read(b)) != -1) {
						zipOutputStream.write(b,0,read);
					}
				} 
				
				zipOutputStream.closeEntry();
				fis.close();
			}
			
			//String targetFilePath = mapFileInfo.get("FILE_PATH").toString();
			String zipFileName = "data.zip";
			//String realPath = defaultFilePath + targetFilePath ;  //20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
			
			/*File file = new File(realPath);
			int ifilesize = (int)file.length();
			byte b[] = new byte[ifilesize];
			fis = new FileInputStream(file);
			os = response.getOutputStream();*/
			String disposition = getDisposition(zipFileName, getBrowser(request));
			response.setContentLength((int)zipFileSize);
			response.reset() ;
			response.setContentType("application/octet-stream-dummy");
			response.setHeader("content", "text/html; charset=utf-8");
			response.setHeader("Content-Disposition", disposition);
			response.setHeader("Content-Length", ""+zipFileSize );
			response.setHeader("Content-Transfer-Encoding", "binary;");
			response.setHeader("Pragma", "no-cache;");
			response.setHeader("Expires", "-1;");
			zipOutputStream.flush();
			//os.flush();
		}catch(Exception e){
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다." ,e);
		}finally{
			zipOutputStream.close();
			os.close();
		}
	}
	
	/**
	 * 파일다운로드(from DB)
	 * @param Q1
	 * @throws IOException
	 */
	@RequestMapping("/download")
	public void download(@RequestParam("Q1") String Q1, HttpServletResponse response) throws IOException,DataAccessException {
		OutputStream os = null;
		try{
			//2013-12-17 khma : db분기처리 필요
			String SqlCommand = "SELECT * FROM M_IMAGE_GAL WHERE M_IMAGE_GAL_NO = ?";
			MonArchDaoImpl monArchDao = new MonArchDaoImpl();
			Map<String, Object> mapFileInfo = monArchDao.downloadFile(SqlCommand, Q1);
			
			byte[] blob = null;
			blob = (byte[]) mapFileInfo.get("FILE_DATA");
			String name;
			name = new String(mapFileInfo.get("FILE_NAME").toString().getBytes("UTF-8"), "ISO-8859-1"); 
			response.setHeader("Content-Transfer-Encoding", "binary"); 
			response.setHeader("Content-Disposition", "attachment; filename=\"" + name  + "\"");
			response.setContentType(mapFileInfo.get("FILE_CONTENT_TYPE").toString());
			response.setContentLength(blob.length);
			
			os = response.getOutputStream();
			os.write(blob);
			os.flush();
			os.close();
		}catch(IOException ioe){
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다." ,ioe);
		} finally {
//			os.close();
		}
	}

	/**
	 * 액셀다운로드
	 * @param Q1
	 * @throws Exception 
	 */
	@RequestMapping("/exceldown")
	public ModelAndView downExcel(@RequestParam("XmlParms") String XmlParms, HttpServletRequest request,HttpServletResponse response) throws Exception {
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = parsingForJonType(xmlParams);
		
		List<Map<String,Object>> ds = null;
        String SqlComm = "";
        String rlt = "";
        int nRlt = 0;
        String xlsService = "";
        String xlsMethod  = "";
        String UID = "";
        String USITE = "";
        String KEY = "";
        String KeyString = "";
        String type = "";
        //20121025 khma 추가 로그용 
        String MENUID = "";
        String STEPMENU = "";
        String ACTIONNAME = "";
        
        //20140108 khma 추가 액셀 처리방식 개선 XLSTYPE에 따른 처리 추가
        String xlsType = XLS_TYPE.REPORT.getVal(); //default는 report  ["report" : 일반 리포트 타입의 조회용 액셀, "data": 데이터 업로드 타입의 액셀]
        String structureName = ""; //구조체 정보를 취득하기 위해 구조체명 취득
        String dispCols = ""; // 표시컬럼정보 기본적으로는 report타입일때에만 사용함.data타입의 경우에는 쿼리에서 제어할것.
        
        long 서비스시작시간 = System.currentTimeMillis();//서비스시작시간
        
		//json 데이터를 읽어서 타입변경하기
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		ServiceInfo  si= null;
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		om.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
//		xlsService = obj.get("service");
		
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmss");
		String currentTimestamp = sd.format(calendar.getTime());
		String fileName = "";
		UID = obj.get("UID");
		USITE = obj.get("USITE");
		 /* 20140108 khma 추가 액셀 처리방식 개선 XLSTYPE에 따른 처리 추가 start */
		if(obj.containsKey("xlsType") && StringUtils.isNotEmpty(obj.get("xlsType"))){
			xlsType = obj.get("xlsType");
		}
		
		if(obj.containsKey("xlsService") && StringUtils.isNotEmpty(obj.get("xlsService"))){
			xlsService = obj.get("xlsService");
		}
		if(obj.containsKey("xlsMethod") && StringUtils.isNotEmpty(obj.get("xlsMethod"))){
			xlsMethod = obj.get("xlsMethod");
		}
		if(obj.containsKey("structureName") && StringUtils.isNotEmpty(obj.get("structureName"))){
			structureName = obj.get("structureName");
		}
		Map<String, Object> obj2;
		ArrayList<Map<String, Object>> arrHeaderInfo = new ArrayList<Map<String,Object>>(); // 표시컬럼
		if(obj.containsKey("dispCols") && StringUtils.isNotEmpty(obj.get("dispCols"))){
			dispCols = obj.get("dispCols");
			om.configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
			om.configure(org.codehaus.jackson.map.DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			
			obj2 = om.readValue(dispCols, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
			arrHeaderInfo = (ArrayList<Map<String, Object>>) obj2.get("dispCols"); // 표시cols목록 취득
		}else{
			//todo 액션 쿼리대로 호출 양식이 없는경우임... 
		}
		
		/* 20140108 khma 추가 액셀 처리방식 개선 XLSTYPE에 따른 처리 추가 end */
		
		if(obj.containsKey("xlsName") && StringUtils.isNotEmpty(obj.get("xlsName"))){
			//xlsName이 지정되어있으면 파일명을 xlsName으로 하고 없으면 Method명으로 함
			fileName += obj.get("xlsName");
		}else{
			fileName += xlsMethod;
		}		
		fileName += "_"+ currentTimestamp.substring(0, 8) +"_"+ currentTimestamp.substring(8);
		
		
		type = obj.get("type");
		
		MENUID = obj.get("MENUID");
		STEPMENU = obj.get("STEPMENU");
		ACTIONNAME = obj.get("ACTIONNAME");
		
		//xlsServuce, xlsMethod를 조건으로 쿼리정보를 취득한다.
		si = monArchDao.ReadQuery(xlsService, xlsMethod, USITE);
		
		
        
        if (si == null)
        {
            String _msg = "MonArch[CRUD Service] : " + xlsService + " - " + xlsMethod + "에 해당되는 서비스쿼리를 찾을수 없습니다.";
            log.error(_msg);
            
            throw new RuntimeException(_msg);
//            throw new Exception(_msg);
        }
        
        //액셀다운처리
		int exviewpage = 1;
		int expagecnt = 99999999;
		//orderby에 대한 SQL injection방지에 대해서... 20130124 jwkim Start
		String prevOrderType = obj.get("_order");
		String newOrderType = obj.get("_sort");
		String OrderStr = prevOrderType;
		if(StringUtils.isNotEmpty(newOrderType)){
			OrderStr = CommonUtil.getOrderByStatement(newOrderType);
		}
		//orderby에 대한 SQL injection방지에 대해서... 20130124 jwkim End
      
      //1. 데이터 취득
      try {
    	String strSql= si.getSql();
  		if ( StringUtils.isNotEmpty(obj.get("DOWNCOLS")) ) {
			//TODO 서비스 파라메터에 DOWNCOLS의 데이터가 존재할경우
			//TODO 해당 쿼리를 서브 테이블로 필요한 컬럼만 추출한다.
  			ArrayList<Map<String, Object>> newHeaderInfo = new ArrayList<Map<String, Object>>();
  			String[] lavels = obj.get("DOWNLAVS").replaceAll("\"", "").split(",");
  			String[] cols = obj.get("DOWNCOLS").replaceAll("\"", "").split(",");
  			String comsql = "SELECT ";
  			for ( int i = 0 ; i < cols.length ; i++ ) {
  				comsql += (cols[i] + ((i != cols.length-1) ? ", " : " FROM ( ")); // " AS " + lavels[i] +
  				
  				Map<String, Object> map = new HashMap<String, Object>();
  				map.put("colNo", i);
  				map.put("label", lavels[i]);
  				map.put("field", cols[i]);
  				newHeaderInfo.add(map);
  			}
  			// list쿼리를 감싸는 형태로 수정함 : 원래 엑셀 다운 시에 쿼리 실행하는 부분(rnum 붙은 부분 확인해야함)
  			//strSql =  strSql.replaceAll("@DOWNCOLS@", comsql);
  			strSql = (comsql + strSql + " ) A");
  			
  			arrHeaderInfo = newHeaderInfo;
		}
  		
   	 //확장필드 처리 Start 2011107 khma
   	String extFilterObj = obj.get("extFilters");
   	//extFilterObj = parsingForJonType(extFilterObj);
   	Map<String, Object> extFilters = new HashMap<String,Object>();
   	ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String,Object>>();
   	if( StringUtils.isNotEmpty(extFilterObj)){
   		om.configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
   		extFilters = om.readValue(extFilterObj, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
   		arrExtFilters = (ArrayList<Map<String, Object>>) extFilters.get("extFilters");
   	}
       //확장필드 처리 End 20131107 khma
   	
   	
    	  ds  = monArchDao.exeList(strSql, obj, OrderStr, exviewpage , expagecnt ,arrExtFilters);
//    	  ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, exviewpage , expagecnt);
		
//      // 2. 액셀다운로드 처리 
    	  if(obj.containsKey("extClass") 
    			  && StringUtils.isNotEmpty(obj.get("extClass")) 
    			  && CommonUtil.checkExtClass(EXCEL_DOWN_CLASS_WHITE_LIST, obj.get("extClass"))){ //20150406 외부클래스 사용시에는 whitelist목록으로 사용할것(시큐어코딩지침대응)
    		  //extClass(확장클래스)가 지정되어있으면 아래의 액셀다운로드 클래스를 사용하지 않고 지정된 클래스를 사용한다.

    		  String executeClassName = obj.get("extClass");
    		  // 1. 리플렉션 대상클래스명을 파라메터로 지정하여 클래스를 취득
    		  Class targetClass = Class.forName(executeClassName);
    		// 2. 대상 클래스의 객채를 생성
    		  Object targetInstance = targetClass.newInstance();
    		  //3. 대상객체에서 사용할 메소드의 파라메터타입을 맵핑
    		  Class paramTypes[] = new Class[5];
    		  paramTypes[0] = List.class;
    		  paramTypes[1] = String.class;
    		  paramTypes[2] = String.class;
    		  paramTypes[3] = HttpServletRequest.class;
    		  paramTypes[4] = HttpServletResponse.class;
    		  //4. 사용할 메소드명과 파라메터타입을 파라메터로 설정하여 대상객체에서 사용할 메소드를 취득
    		  Method targetMthod = targetClass.getMethod("downExcel", paramTypes);
              // 5. invoke함수를 호출하요 해당 메소드를 실행한다.
			  Boolean rst = (Boolean) targetMthod.invoke(targetInstance, ds, fileName, type , request, response);    		  

  		}else{
	      ExcelDownload excelDownload = new ExcelDownload();
	      excelDownload.downExcel(ds, fileName ,type, request, response, arrHeaderInfo, xlsType);
  		}
	      
         long 서비스종료시간 = System.currentTimeMillis();//서비스종료시간
         long 서비스소요시간 = 서비스종료시간 - 서비스시작시간;
         사용로그(xlsService, xlsMethod, KEY, xmlParams, USITE, UID, 서비스소요시간, MENUID, STEPMENU, ACTIONNAME);
//      rlt = "{" + string.Format(@"'rlt':'EXCEL', 'RltCount':{0}", "0") + "}";
//      String tempSql = "{'rlt':'EXCEL', 'RltCount':{0}}";
//      rlt =  java.text.MessageFormat.format(tempSql, String.valueOf(ds.size()));
      
      } catch (DataAccessException e) {
			//데이터엑세스 예외처리
			e.printStackTrace();

			String sqlCommand = "";
			if(null != si ) sqlCommand = si.getSql();
			
			String msg = "MonArch[CRUD Service] : " + e.getMessage() + "\r\r ----------------- \r Service = " + xlsService + "\r Method = " + xlsMethod;
			log.error(msg, e);
			SvcCRUD svcCRUD = new SvcCRUD();
			svcCRUD.Log("DATACRUD", sqlCommand, msg, USITE, UID);
			throw new Exception(CommonConst.COMM_ERROR_MESSAGE);
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
			throw new Exception(CommonConst.COMM_ERROR_MESSAGE);
		}
      
      return new ModelAndView("fileDownloadView","info",null);
	}
//	/**
//	 * 액셀다운로드
//	 * @param Q1
//	 * @throws Exception 
//	 */
//	@RequestMapping("/exceldown")
//	public void downExcel(@RequestParam("XmlParms") String XmlParms, HttpServletRequest request,HttpServletResponse response) throws Exception {
//		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
//		xmlParams = parsingForJonType(xmlParams);
//		
//		List<Map<String,Object>> ds = null;
//		String SqlComm = "";
//		String rlt = "";
//		int nRlt = 0;
//		String Service = "";
//		String Method  = "";
//		String UID = "";
//		String USITE = "";
//		String KEY = "";
//		String KeyString = "";
//		String type = "";
//		//20121025 khma 추가 로그용 
//		String MENUID = "";
//		String STEPMENU = "";
//		String ACTIONNAME = "";
//		
//		long 서비스시작시간 = System.currentTimeMillis();//서비스시작시간
//		
//		//json 데이터를 읽어서 타입변경하기
//		Map<String, String> obj;
//		ObjectMapper om = new ObjectMapper();
//		ServiceInfo  si= null;
//		monArchDao = new MonArchDaoImpl();
//		om.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
//		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
//		Service = obj.get("service");
//		
////		Method = obj.get("method");
//		Method = obj.get("ExcelService");
//		
//		Calendar calendar = Calendar.getInstance();
//		SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmss");
//		String currentTimestamp = sd.format(calendar.getTime());
//		String fileName = "";
//		
//		if(obj.containsKey("xlsName") && StringUtils.isNotEmpty(obj.get("xlsName"))){
//			//xlsName이 지정되어있으면 파일명을 xlsName으로 하고 없으면 Method명으로 함
//			fileName += obj.get("xlsName");
//		}else{
//			fileName += Method;
//		}
//		fileName += "_"+ currentTimestamp.substring(0, 8) +"_"+ currentTimestamp.substring(8);
//		
//		UID = obj.get("UID");
//		USITE = obj.get("USITE");
//		type = obj.get("type");
//		
//		MENUID = obj.get("MENUID");
//		STEPMENU = obj.get("STEPMENU");
//		ACTIONNAME = obj.get("ACTIONNAME");
//		
//		
//		si = monArchDao.ReadQuery(Service, Method, USITE);
//		
//		if (si == null)
//		{
//			String _msg = "MonArch[CRUD Service] : " + Service + " - " + Method + "에 해당되는 서비스쿼리를 찾을수 없습니다.";
//			log.error(_msg);
//			
//			throw new RuntimeException(_msg);
////            throw new Exception(_msg);
//		}
//		
//		//액셀다운처리
//		int exviewpage = 1;
//		int expagecnt = 99999999;
//		//orderby에 대한 SQL injection방지에 대해서... 20130124 jwkim Start
//		String prevOrderType = obj.get("_order");
//		String newOrderType = obj.get("_sort");
//		String OrderStr = prevOrderType;
//		if(StringUtils.isNotEmpty(newOrderType)){
//			OrderStr = CommonUtil.getOrderByStatement(newOrderType);
//		}
//		//orderby에 대한 SQL injection방지에 대해서... 20130124 jwkim End
//		
//		//1. 데이터 취득
//		try {
//			String strSql= si.getSql();
//			if(StringUtils.isNotEmpty(obj.get("DOWNCOLS"))){
//				//TODO 서비스 파라메터에 DOWNCOLS의 데이터가 존재할경우
//				//TODO 쿼리의 @DOWNCOLS@부분을 해당데이터로 Replace한다
//				strSql =  strSql.replaceAll("@DOWNCOLS@", obj.get("DOWNCOLS"));
//			}
//			ds  = monArchDao.exeList(strSql, obj, OrderStr, exviewpage , expagecnt);
////    	  ds  = monArchDao.exeList(si.getSql(), obj, OrderStr, exviewpage , expagecnt);
//			
////      // 2. 액셀다운로드 처리 
//			if(obj.containsKey("extClass") && StringUtils.isNotEmpty(obj.get("extClass"))){
//				//extClass(확장클래스)가 지정되어있으면 아래의 액셀다운로드 클래스를 사용하지 않고 지정된 클래스를 사용한다.
//				
//				String executeClassName = obj.get("extClass");
//				// 1. 리플렉션 대상클래스명을 파라메터로 지정하여 클래스를 취득
//				Class targetClass = Class.forName(executeClassName);
//				// 2. 대상 클래스의 객채를 생성
//				Object targetInstance = targetClass.newInstance();
//				//3. 대상객체에서 사용할 메소드의 파라메터타입을 맵핑
//				Class paramTypes[] = new Class[5];
//				paramTypes[0] = List.class;
//				paramTypes[1] = String.class;
//				paramTypes[2] = String.class;
//				paramTypes[3] = HttpServletRequest.class;
//				paramTypes[4] = HttpServletResponse.class;
//				//4. 사용할 메소드명과 파라메터타입을 파라메터로 설정하여 대상객체에서 사용할 메소드를 취득
//				Method targetMthod = targetClass.getMethod("downExcel", paramTypes);
//				// 5. invoke함수를 호출하요 해당 메소드를 실행한다.
//				Boolean rst = (Boolean) targetMthod.invoke(targetInstance, ds, fileName, type , request, response);    		  
//				
//			}else{
//				ExcelDownload excelDownload = new ExcelDownload();
//				excelDownload.downExcel(ds, fileName ,type, request, response);
//			}
//			
//			long 서비스종료시간 = System.currentTimeMillis();//서비스종료시간
//			long 서비스소요시간 = 서비스종료시간 - 서비스시작시간;
//			사용로그(Service, Method, KEY, xmlParams, USITE, UID, 서비스소요시간, MENUID, STEPMENU, ACTIONNAME);
////      rlt = "{" + string.Format(@"'rlt':'EXCEL', 'RltCount':{0}", "0") + "}";
////      String tempSql = "{'rlt':'EXCEL', 'RltCount':{0}}";
////      rlt =  java.text.MessageFormat.format(tempSql, String.valueOf(ds.size()));
//			
//		} catch (DataAccessException e) {
//			//데이터엑세스 예외처리
//			e.printStackTrace();
//			
//			String sqlCommand = "";
//			if(null != si ) sqlCommand = si.getSql();
//			
//			String msg = "MonArch[CRUD Service] : " + e.getMessage() + "\r\r ----------------- \r Service = " + Service + "\r Method = " + Method;
//			log.error(msg,e);
//			SvcCRUD svcCRUD = new SvcCRUD();
//			svcCRUD.Log("DATACRUD", sqlCommand, msg, USITE, UID);
//			throw new Exception(msg);			
//		} catch (Exception e) {
//			e.printStackTrace();
//			log.error(e.getMessage());
//			throw new Exception(e.getMessage());		
//		}
//		
//	}
	
	private String parsingForJonType(String xmlParams) {
		String rstData = xmlParams;
		rstData = rstData.replaceAll("\\n", "\\\\n");
		rstData = rstData.replaceAll("\\t", "\\\\t");
		return rstData;
	}
	
	// Exception 처리 메소드 
	@ExceptionHandler(Exception.class)
	public ModelAndView handleException(Exception e, HttpServletResponse response){
	
		// e 객체에 익셉션에러 들어있음
		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		Map<String, Object> rstMap = new HashMap<String, Object>();
		rstMap.put("errorMessage", CommonConst.COMM_ERROR_MESSAGE);
		ModelAndView mav = new ModelAndView("", rstMap);
		return mav;
		
	}
	
	/**
	 * 파일을 저장하는 메소드 
	 * @param file
	 * @param path
	 * @param fileName
	 */
	 public boolean writeFile(MultipartFile file, String path, String fileName){
          boolean rstFlag = true;
          FileOutputStream fos = null;
	        try{
	         
	            byte fileData[] = file.getBytes();
	            
	            fos = new FileOutputStream(path + "/" + fileName);
//	            fos = new FileOutputStream(path  + fileName);
	             
	            fos.write(fileData);
	           
	            
	        }catch(Exception e){
	             
	            e.printStackTrace();
	            rstFlag = false;
	        }finally{
	             
	            if(fos != null){
	                 
	                try{
	                    fos.close();
	                }catch(Exception e){}
	                	//rstFlag = false;
	                }
	        }// try end;
	         return rstFlag;
	    }// wirteFile() end;

	 private String getBrowser(HttpServletRequest request){
		 String header = request.getHeader("User-Agent");
		 if(header.indexOf("MSIE") > -1 || header.indexOf("Trident/7.0") >= 0){  //2015.05.11 hycho : ie11 브라우저 체크를 위해 조건추가
			 return "MSIE";
		 } else if(header.indexOf("Chrome") > -1 ){
			 return "Chrome";
		 } else if(header.indexOf("Opera") > -1 ){
			 return "Opera";
		 }
		 return "FireFox";
	 }
	 
	 private String getDisposition(String filename, String browser) throws Exception{
		 String dispositionPrefix = "attachment;filename=";
		 String encodedFileName = null;
		 
		 if(browser.equals("MSIE")){
			 encodedFileName = URLEncoder.encode(filename,"UTF-8").replaceAll("\\+", "%20");
		 }else  if(browser.equals("FireFox")){
			 encodedFileName =
					 "\"" + new String(filename.getBytes("UTF-8"),"8859_1") + "\"";
		 }else  if(browser.equals("Opera")){
			 encodedFileName = 
					 "\"" + new String(filename.getBytes("UTF-8"),"8859_1") + "\"";
		 }else  if(browser.equals("Chrome")){
			 StringBuffer sb = new StringBuffer();
			 for(int i=0; i < filename.length(); i++){
				 encodedFileName = 
				 "\"" + new String(filename.getBytes("UTF-8"), "ISO-8859-1")+ "\"";
				 
			 }
		 }else{
			 throw new RuntimeException("Not Supported browser");
		 }
			 
			 return dispositionPrefix + encodedFileName;
	 }
	 
		/**
		 *사용 기록 로그
		 * @param 서비스
		 * @param 메소드
		 * @param KEY
		 * @param 요청문서
		 * @param 회원사번호
		 * @param 사용자
		 * @param 소요시간
		 */
		public void 사용로그(String 서비스, String 메소드, String KEY, String 요청문서, String 회원사번호, String 사용자, long 소요시간,
				String MENUID, String STEPMENU, String ACTIONNAME ){
			
			if(StringUtils.isNotEmpty(요청문서) && 요청문서.length() > 2000 ) 요청문서 = 요청문서.substring(0, 2000);
			if(StringUtils.isEmpty(사용자)) 사용자 = "1";
			if(StringUtils.isEmpty(회원사번호)) 회원사번호 = "44";
			
			Map<String,String> uselogParam = new HashMap();
			
			uselogParam.put("M_USITE_NO", 회원사번호);
			uselogParam.put("M_USER_NO", 사용자);
			uselogParam.put("SERVICE_NAME", 서비스);
			uselogParam.put("METHOD_NAME", 메소드);
			uselogParam.put("요청문서", 요청문서);
			uselogParam.put("ELAPSED_TIME", String.valueOf(소요시간));
			uselogParam.put("KEY_VALUE", KEY);
			uselogParam.put("MENU_MGMT_NO", MENUID);
			uselogParam.put("STEP_MENU", STEPMENU);
			uselogParam.put("ACTION_NAME", ACTIONNAME);
			
			//2013-12-17 khma : db분기처리 필요
			String sqlCommand =" INSERT INTO M_USE_LOG ( " 
					+ QueryGenerator.genSequenceCol(DB_TYPE, "M_USE_LOG_NO", true)
						+" M_USITE_NO,M_USER_NO,SERVICE_NAME,METHOD_NAME,REQ_DOC,ELAPSED_TIME,KEY_VALUE, MENU_MGMT_NO, STEP_MENU, ACTION_NAME"
					    +") VALUES ("
						+ QueryGenerator.genSequenceStmt(DB_TYPE, "M_USE_LOG_SEQ", true)
						+ "@M_USITE_NO@, @M_USER_NO@, @SERVICE_NAME@, @METHOD_NAME@,@REQ_DOC@ ,@ELAPSED_TIME@,@KEY_VALUE@,@MENU_MGMT_NO@,@STEP_MENU@, @ACTION_NAME@)";
			
			MonArchDaoImpl monArchDao = new MonArchDaoImpl();
			monArchDao.exeCreate(sqlCommand, uselogParam);
		}
		
}