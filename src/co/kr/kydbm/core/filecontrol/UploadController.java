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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonParser.Feature;
import org.codehaus.jackson.map.DeserializationConfig;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
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
 * 파일 업로드 및 엑셀 다운로드 콘트롤러 클래스
 * version 2.0 2026-10-30
 * Authors : Ma KyoungHo
 * Company : KYDBM
 */
@Controller
public class UploadController {

	private static ConfigProperties prop = ConfigProperties.getInstance(); // 속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	private static final String[] FILE_UPLOAD_WHITE_LIST = {
			"BMP", "GIF", "JPG", "PCX", "PNG", "SVG", "SVGZ", "TIF", // 이미지파일 확장자
			"DOC", "DOCX", "DOTX", "DOT", "DPC", "HWP", "HWT", "PDF", "PPT", "PPTX", "RTF", "TXT", "XLS", "XLSX", "XML",
			"PDF", // 문서파일 확장자
			"AAC", "AC3", "FLAC", "MID", "MIDI", "MP3", "OGG", "RA", "WAV", "WMA", // 오디오파일 확장자
			"ASF", "ASX", "AVI", "FLV", "MKV", "MOV", "MP4", "MPG", "MPEG", "RAM", "RM", "SWF", "WMV", // 비디오파일 확장자
			"ACE", "ALZ", "ARC", "GZ", "JAR", "LHA", "LZH", "RAR", "TAR", "TGZ", "WAR", "ZIP" // 압축파일
	};

	private static final String[] SIGN_FILE_UPLOAD_WHITE_LIST = {
			"PNG", "JPG", // 이미지파일 확장자
			"HWP", "DOC", "DOCX", "XLS", "XLSX", "PPT", "PPTX", "PDF" // 문서파일 확장자
	};

	private static final String[] EXCEL_DOWN_CLASS_WHITE_LIST = {
			// TODO EXCEL 다운로드 확장클래스 호출시에 해당 클래스에 목록을 기록후 해당 클래스에 존재하는 클래스만 사용할것.
			// "co.kr.kydbm.TestExtExcelDown.class"
	};
	Logger log = Logger.getLogger(UploadController.class.getName());

	/**
	 * 물리적 디렉토리 파일 업로드 (M_FILE_MGMT 관리)
	 * 
	 * 파일을 지정된 물리 경로(monarch.fileupload.path/FileData/년/월/)에 저장하고,
	 * 파일 메타데이터를 M_FILE_MGMT 테이블에 등록한다.
	 * 
	 * @param USITE 회원사 사이트 번호
	 * @param UID 등록 사용자 ID
	 * @param jobType 업무 유형 코드
	 * @param fileSearchKey 파일 검색 키 (업무 연계 식별키)
	 * @param Filename 업로드할 MultipartFile 객체
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 입출력 및 DB 등록 예외
	 */
	@RequestMapping("/fileupload")
	public void multiFileUpload(
			@RequestParam("USITE") String USITE,
			@RequestParam("UID") String UID,
			@RequestParam("jobType") String jobType,
			@RequestParam("fileSearchKey") String fileSearchKey,
			@RequestParam("Filename") MultipartFile Filename,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		ConfigProperties configProperties = ConfigProperties.getInstance();
		Calendar calendar = Calendar.getInstance();
		String baseFolder = "FileData";
		String years = String.valueOf(calendar.get(Calendar.YEAR));
		String months = String.valueOf(calendar.get(Calendar.MONTH) + 1);
		SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String currentTimestamp = sd.format(calendar.getTime());
		String uploadFolder = "/" + baseFolder + "/" + years + "/" + months;
		String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
		String realPath = defaultFilePath + "/" + uploadFolder; // 20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
		String realfileName = currentTimestamp + "_" + Filename.getOriginalFilename();
		String fileSize = String.valueOf(Filename.getSize());
		long lFileSize = Long.parseLong(fileSize);
		;
		long limitSize = 500000;
		String strLimitSize = configProperties.getProperty("monarch.fileupload.limitsize");
		if (StringUtils.isNotEmpty(strLimitSize) && StringUtils.isNumeric(strLimitSize)) {
			limitSize = Long.parseLong(strLimitSize);
		}

		// 업로드파일 확장자 체크(Client에서 체크와 상관없이 내부적으로 서버사이드 체크함)
		if (!CommonUtil.checkExtender(Filename.getOriginalFilename(), FILE_UPLOAD_WHITE_LIST)) {
			response.setContentType("text/html; charset=UTF-8");
			PrintWriter out = null;
			try {
				out = response.getWriter();
				out.write("<script language='javascript'>alert('업로드 할수 없는 형식의 파일입니다.');</script>");
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				out.close();
			}
		} else {

			if (lFileSize > limitSize) {
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = null;
				try {
					out = response.getWriter();
					out.write("<script language='javascript'>alert('파일용량이 제한용량보다 큽니다.');</script>");
				} catch (IOException e) {
					e.printStackTrace();
				} finally {
					out.close();
				}
			} else {

				File dir = new File(realPath);
				if (!dir.isDirectory()) {
					dir.mkdirs();
				}
				if (writeFile(Filename, realPath, realfileName)) {
					// 파일관리 테이블에 정보 등록
					String service = "MON_COMMON";
					String method = "FILE_MANAGER_CREATE";
					String usite = USITE;
					MonArchDaoImpl monArchDao = new MonArchDaoImpl();
					ServiceInfo serviceInfo = monArchDao.ReadQuery(service, method, usite);
					String sqlCommnand = "";
					sqlCommnand = serviceInfo.getSql();
					Map<String, String> mapParam = new HashMap<String, String>();
					mapParam.put("FILE_PATH", uploadFolder + "/" + realfileName);
					mapParam.put("FILE_NAME", Filename.getOriginalFilename());
					mapParam.put("FILE_SIZE", fileSize);
					mapParam.put("UID", UID);
					mapParam.put("USITE", USITE);

					mapParam.put("JOB_TYPE", jobType);
					mapParam.put("FILE_SEARCH_KEY", fileSearchKey);
					mapParam.put("USE_FLAG", "1");
					monArchDao.exeUpdate(sqlCommnand, mapParam);
				}
			}
		}
	}

	/**
	 * 물리 파일명 변경 및 파일 정보 테이블(M_FILE_MGMT) 갱신
	 * 
	 * @param USITE 회원사 사이트 번호
	 * @param UID 수정 사용자 ID
	 * @param jobType 업무 유형 코드
	 * @param fileName 기존 파일명
	 * @param fileNewName 변경할 새 파일명
	 * @param filePath 물리 디렉토리 경로
	 * @param fileSearchKey 파일 검색 키
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 이동 및 DB 수정 예외
	 */
	@RequestMapping("/fileRename")
	public void fileRename(
			@RequestParam("USITE") String USITE,
			@RequestParam("UID") String UID,
			@RequestParam("jobType") String jobType,
			@RequestParam("fileName") String fileName,
			@RequestParam("fileNewName") String fileNewName,
			@RequestParam("filePath") String filePath,
			@RequestParam("fileSearchKey") String fileSearchKey,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		Path file = Paths.get(filePath + "/" + fileName);
		Path newFile = Paths.get(filePath + "/" + fileName);
		try {
			Path newFilePath = Files.move(file, newFile);
			System.out.println(newFilePath);
		} catch (IOException e) {
			e.printStackTrace();
		}

		// 파일관리 테이블에 정보 등록
		String service = "MON_COMMON";
		String method = "FILENAME_UPDATE";
		String usite = USITE;
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		ServiceInfo serviceInfo = monArchDao.ReadQuery(service, method, usite);
		String sqlCommnand = "";
		sqlCommnand = serviceInfo.getSql();
		Map<String, String> mapParam = new HashMap<String, String>();
		mapParam.put("FILE_NAME", fileNewName);
		mapParam.put("UID", UID);
		mapParam.put("USITE", USITE);

		mapParam.put("JOB_TYPE", jobType);
		mapParam.put("FILE_SEARCH_KEY", fileSearchKey);
		monArchDao.exeUpdate(sqlCommnand, mapParam);

	}

	/**
	 * 계약서 및 서명 파일 물리 업로드 (M_IMAGE_GAL 연계)
	 * 
	 * @param USITE 회원사 사이트 번호
	 * @param UID 등록 사용자 ID
	 * @param jobType 업무 유형 코드
	 * @param fileSearchKey 파일 검색 키 (계약 연계 식별키)
	 * @param Filename 업로드할 MultipartFile 객체
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 저장 및 DB 등록 예외
	 */
	@RequestMapping("/signFileUpload")
	public void signFileUpload(
			@RequestParam("USITE") String USITE,
			@RequestParam("UID") String UID,
			@RequestParam("jobType") String jobType,
			@RequestParam("fileSearchKey") String fileSearchKey,
			@RequestParam("Filename") MultipartFile Filename,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		ConfigProperties configProperties = ConfigProperties.getInstance();
		Calendar calendar = Calendar.getInstance();
		String years = String.valueOf(calendar.get(Calendar.YEAR));
		String months = String.valueOf(calendar.get(Calendar.MONTH) + 1);
		SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String currentTimestamp = sd.format(calendar.getTime());
		String uploadFolder = years + "/" + months;
		String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
		String realPath = defaultFilePath + "/" + uploadFolder;
		String uploadFileName = Filename.getOriginalFilename();
		String ext = FilenameUtils.getExtension(uploadFileName);
		String realfileName = currentTimestamp;
		String fileSize = String.valueOf(Filename.getSize());
		long lFileSize = Long.parseLong(fileSize);
		long limitSize = 500000;
		String strLimitSize = configProperties.getProperty("monarch.fileupload.limitsize");
		if (StringUtils.isNotEmpty(strLimitSize) && StringUtils.isNumeric(strLimitSize)) {
			limitSize = Long.parseLong(strLimitSize);
		}

		// 업로드파일 확장자 체크(Client에서 체크와 상관없이 내부적으로 서버사이드 체크함)
		if (!CommonUtil.checkExtender(Filename.getOriginalFilename(), SIGN_FILE_UPLOAD_WHITE_LIST)) {
			response.setContentType("text/html; charset=UTF-8");
			PrintWriter out = null;
			try {
				out = response.getWriter();
				out.write("<script language='javascript'>alert('업로드 할수 없는 형식의 파일입니다.');</script>");
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				out.close();
			}
		} else {

			if (lFileSize > limitSize) {
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = null;
				try {
					out = response.getWriter();
					out.write("<script language='javascript'>alert('파일용량이 제한용량보다 큽니다.');</script>");
				} catch (IOException e) {
					e.printStackTrace();
				} finally {
					out.close();
				}
			} else {

				File dir = new File(realPath);
				if (!dir.isDirectory()) {
					dir.mkdirs();
				}
				if (writeFile(Filename, realPath, realfileName)) {
					// 파일관리 테이블에 정보 등록
					String service = "MON_COMMON";
					String method = "FILE_CREATE";
					String usite = USITE;
					MonArchDaoImpl monArchDao = new MonArchDaoImpl();
					ServiceInfo serviceInfo = monArchDao.ReadQuery(service, method, usite);
					String sqlCommnand = "";
					sqlCommnand = serviceInfo.getSql();
					Map<String, String> mapParam = new HashMap<String, String>();
					mapParam.put("FILE_PATH", uploadFolder);
					mapParam.put("ORIG_FILE_NAME", Filename.getOriginalFilename());
					mapParam.put("REAL_FILE_NAME", realfileName);
					mapParam.put("FILE_CONTENT_TYPE", ext);
					mapParam.put("FILE_SIZE", fileSize);
					mapParam.put("FILE_DESC", "SIGN_FILE");
					mapParam.put("UID", UID);
					mapParam.put("USITE", USITE);
					mapParam.put("UPPER_INFO", fileSearchKey);
					monArchDao.exeUpdate(sqlCommnand, mapParam);
				}
			}
		}
	}

	/**
	 * 계약서 파일 물리 삭제 및 A_SIGN_ACC 계약 정보 갱신
	 * 
	 * @param fid 삭제 대상 M_IMAGE_GAL 번호
	 * @param uid 삭제 처리자 ID
	 * @throws Exception 물리 파일 삭제 및 DB 수정 예외
	 */
	@RequestMapping("/signFileDelete")
	public void signFileDelete(
			@RequestParam("fid") String fid,
			@RequestParam("uid") String uid) throws Exception {

		ConfigProperties configProperties = ConfigProperties.getInstance();
		String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");

		try {

			// 파일 정보 조회
			String SqlCommand = "SELECT FILE_PATH, UPPER_KEY FROM M_IMAGE_GAL WHERE M_IMAGE_GAL_NO = ?";
			MonArchDaoImpl monArchDao = new MonArchDaoImpl();

			Map<String, Object> fileInfo = monArchDao.downloadFile(SqlCommand, fid);
			String targetFilePath = String.valueOf(fileInfo.get("FILE_PATH"));
			String upperKey = String.valueOf(fileInfo.get("UPPER_KEY"));
			upperKey = upperKey.equals("null") ? "" : upperKey;
			String realPath = defaultFilePath + targetFilePath;

			File file = new File(realPath);

			if (file.exists()) {
				if (file.delete()) {
					System.out.println("파일삭제 성공");

					if (upperKey.length() > 0) {
						// A_SIGN_ACC 파일 정보 업데이트
						String sqlUpdtSignAcc = "UPDATE A_SIGN_ACC SET ";
						sqlUpdtSignAcc += " CONTRACT_FILENAME = NULL";
						sqlUpdtSignAcc += " ,CONTRACT_FILEPATH = NULL";
						sqlUpdtSignAcc += " ,CHGTIME = SYSDATE";
						sqlUpdtSignAcc += " ,CHGUSEQ = @UID@";
						sqlUpdtSignAcc += " WHERE  = @SIGNSEQ@";

						Map<String, String> parameters = new HashMap<String, String>();
						parameters.clear();
						parameters.put("SIGNSEQ", upperKey);
						parameters.put("UID", uid);

						// 업데이트
						monArchDao.exeUpdate(sqlUpdtSignAcc, parameters);
					}

				} else {
					System.out.println("파일삭제 실패");
				}
			} else {
				log.error("파일이 존재하지 않습니다.");
			}

		} catch (Exception e) {
			log.error("파일삭제 중 예기치 못한 에러가 발생하였습니다.", e);
		}

	}

	/**
	 * 이미지 갤러리 및 DB BLOB 파일 업로드 (M_IMAGE_GAL)
	 * 
	 * 파일 바이너리(BLOB) 또는 이미지 URL 경로를 M_IMAGE_GAL 테이블에 등록한다.
	 * ※ 참고: 계층형 파일 관리(상위 업무/폴더 연계) 기능 확장을 위해 ParentType, ParentKey, WebFolder 파라미터가
	 * 설계되었으나, 프론트엔드 미전달 시 400 에러 방지 및 단일 업로드 호환성을 위해 주석 보존(20230816 khma) 상태임.
	 * 
	 * @param multiPartFile 업로드 대상 멀티파트 파일 (BLOB 데이터)
	 * @param Urlname       이미지 URL 링크 경로 (경로 방식 등록 시 사용)
	 * @param Note          파일 부가 설명 (FILE_DESC)
	 * @param UID           등록 사용자 ID
	 * @param USITE         회원사 사이트 번호
	 * @throws IOException 입출력 예외
	 * @throws Exception   데이터베이스 처리 예외
	 */
	@RequestMapping("/upload")
	public void uploadFile(@RequestParam("Filename") MultipartFile multiPartFile,
			@RequestParam("Urlname") String Urlname, @RequestParam("Note") String Note
			// 20230816 khma : 계층형 파일 관리(상위 업무/폴더 연계) 확장용 파라미터 (프론트 미전달 시 400 에러 방지를 위해 보존
			// 주석 처리)
			// ,@RequestParam("ParentType") String ParentType
			// ,@RequestParam("ParentKey") String ParentKey
			// ,@RequestParam("WebFolder") String WebFolder
			, @RequestParam("UID") String UID, @RequestParam("USITE") String USITE) throws IOException, Exception {

		String fname = multiPartFile.getOriginalFilename();
		String uname = Urlname;
		String fileszie = String.valueOf(multiPartFile.getSize());
		String fileType = "";
		String contentType = multiPartFile.getContentType();

		String desc = Note;
		// 20230816 khma : 계층형 파일 관리 활성화 시 변수 매핑
		// String 상위정보 = ParentType;
		// String 상위키 = ParentKey;
		// String 폴더경로 = WebFolder;
		String regUser = UID;
		String 회원사번호 = USITE;
		// TODO 파일관리와 이미지겔러리를 같은 처리에서 사용되고 있으나, 유형이 경로일때는 무조건 이미지겔러리로 들어감.
		if (!uname.equals("")) {

			fileType = "경로";
			contentType = "image/url";

		} else if (contentType.substring(0, 5).equals("image")) {

			fileType = "이미지";

		} else {

			fileType = "파일";

		}
		// 2018-12-17 khma : DB 유형(DB_TYPE: Oracle/MSSQL/MySQL)별 시퀀스 및 SysDate 동적 생성 적용 완료
		String sqlCommand = "INSERT INTO M_IMAGE_GAL (" +
				QueryGenerator.genSequenceCol(DB_TYPE, "M_IMAGE_GAL_NO", true) +
				"FILE_NAME, FILE_SIZE, FILE_CONTENT_TYPE, FILE_TYPE_CODE, LINK_URL, " +
				"FILE_DESC, " +
				// 20230816 khma : M_IMAGE_GAL 테이블 계층 컬럼 추가 시 활성화
				// "상위정보, " +
				// "상위키," +
				// " 폴더경로" +
				"REG_DATE, UPD_DATE, REG_USER, UPD_USER, FILE_DATA, M_USITE_NO) VALUES (" +
				QueryGenerator.genSequenceStmt(DB_TYPE, "M_IMAGE_GAL_SEQ", true) +
				"?, ?, ?,?,?, " +
				" ?," +
				// ",?,NVL(?,0),?" +
				QueryGenerator.genSysDate(DB_TYPE, true) +
				QueryGenerator.genSysDate(DB_TYPE, true) +
				" ?, ?, ? ,?)";

		// 바이트로 데이터를 취득
		Map<String, String> mParam = new HashMap<String, String>();
		mParam.put("FILE_NAME", fname);
		mParam.put("FILE_SIZE", fileszie);
		mParam.put("FILE_CONTENT_TYPE", contentType);
		mParam.put("FILE_TYPE_CODE", fileType);
		mParam.put("LINK_URL", uname);
		mParam.put("FILE_DESC", desc);
		// 20230816 khma : M_IMAGE_GAL 계층 파라미터 바인딩
		// mParam.put("상위정보", 상위정보);
		// mParam.put("상위키", 상위키);
		// mParam.put("폴더경로", 폴더경로);
		mParam.put("REG_USER", regUser);
		mParam.put("UPD_USER", regUser);
		mParam.put("M_USITE_NO", USITE); // 20180320 khma 추가

		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		int rst = 0;
		try {
			rst = monArchDao.uploadFile(sqlCommand, mParam, multiPartFile);
		} catch (Exception e) {
			log.error("파일을 DB에 저장하는 중 오류가 발생하였습니다.", e);
			throw new Exception(e);
		}
	}

	/**
	 * 파일사이즈 체크 메소드
	 * 
	 * @param XmlParms 요청 파라미터 (Filename JSON 문자열)
	 * @return ModelAndView 파일 크기(bytes) 또는 미존재 시 -1
	 * @throws Exception
	 */
	@RequestMapping("/checkfilesize")
	public ModelAndView checkFilesize(@RequestBody String XmlParms) throws Exception {
		String xmlParams = XmlParms;
		ObjectMapper om = new ObjectMapper();
		Map<String, String> obj;
		String filepath = null;
		long filesize = 0;

		om.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);
		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>() {
		}); // 맵으로 가져옴

		if (obj.containsKey("Filename")) {
			filepath = URLDecoder.decode(obj.get("Filename"), "UTF-8");
		}

		File file = new File(filepath);
		// 파일이 존재하면 파일사이즈 체크
		if (file.isFile()) {
			filesize = file.length();
		} else {
			// 파일이 존재하지 않으면 -1반환
			filesize = -1;
		}
		ModelAndView mav = new ModelAndView("", "filesize", filesize);
		return mav;
	}

	/**
	 * 물리 파일 다운로드 (M_FILE_MGMT)
	 * 
	 * @param fid 파일 관리 번호 (M_FILE_MGMT_NO)
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 스트림 전송 예외
	 */
	@RequestMapping("/filedownload")
	public void fileDownload(@RequestParam("fid") String fid, HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		FileInputStream fis = null;
		OutputStream os = null;
		// 2018-12-17 khma : 표준 ANSI SQL 단건 조회 (DB 유형 무관 공통 쿼리)
		String SqlCommand = "SELECT * FROM M_FILE_MGMT WHERE M_FILE_MGMT_NO = ?";
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();

		try {
			Map<String, Object> mapFileInfo = monArchDao.downloadFile(SqlCommand, fid);
			ConfigProperties configProperties = ConfigProperties.getInstance();
			String targetFilePath = mapFileInfo.get("FILE_PATH").toString();
			String fileName = mapFileInfo.get("FILE_NAME").toString();
			String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
			String realPath = defaultFilePath + targetFilePath; // 20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경

			File file = new File(realPath);
			int ifilesize = (int) file.length();
			byte b[] = new byte[ifilesize];
			fis = new FileInputStream(file);
			os = response.getOutputStream();
			String disposition = getDisposition(fileName, getBrowser(request));
			response.setContentLength(ifilesize);
			response.reset();
			response.setContentType("application/octet-stream-dummy");
			response.setHeader("content", "text/html; charset=utf-8");
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
		} catch (Exception e) {
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다.", e);
		} finally {
			os.close();
			fis.close();
		}
	}

	/**
	 * 계약/이미지 파일 다운로드 (M_IMAGE_GAL 물리 파일)
	 * 
	 * @param fid 이미지 갤러리 관리 번호 (M_IMAGE_GAL_NO)
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 스트림 전송 예외
	 */
	@RequestMapping("/signFileDownload")
	public void signFileDownload(@RequestParam("fid") String fid, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		FileInputStream fis = null;
		OutputStream os = null;
		// 2018-12-17 khma : 표준 ANSI SQL 단건 조회 (DB 유형 무관 공통 쿼리)
		String SqlCommand = "SELECT * FROM M_IMAGE_GAL WHERE M_IMAGE_GAL_NO = ?";
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();

		try {
			Map<String, Object> mapFileInfo = monArchDao.downloadFile(SqlCommand, fid);
			ConfigProperties configProperties = ConfigProperties.getInstance();
			String targetFilePath = mapFileInfo.get("FILE_PATH").toString();
			String fileName = mapFileInfo.get("FILE_NAME").toString();
			String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
			String realPath = defaultFilePath + targetFilePath; // 20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경

			File file = new File(realPath);
			int ifilesize = (int) file.length();
			byte b[] = new byte[ifilesize];
			fis = new FileInputStream(file);
			os = response.getOutputStream();
			String disposition = getDisposition(fileName, getBrowser(request));
			response.setContentLength(ifilesize);
			response.reset();
			response.setContentType("application/octet-stream-dummy");
			response.setHeader("content", "text/html; charset=utf-8");
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
		} catch (Exception e) {
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다.", e);
		} finally {
			os.close();
			fis.close();
		}
	}

	/**
	 * 다중 첨부파일 압축 ZIP 통합 다운로드
	 * 
	 * @param sKey 파일 검색 키 (FILE_SEARCH_KEY 그룹 식별자)
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception ZIP 스트림 압축 및 전송 예외
	 */
	@RequestMapping("/zipFileDownload")
	public void zipFileDownload(@RequestParam("skey") String sKey, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		FileInputStream fis = null;
		OutputStream os = null;
		ZipOutputStream zipOutputStream = null;

		String sqlCommand = "SELECT * FROM M_FILE_MGMT WHERE FILE_SEARCH_KEY = ?";
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();

		try {
			List<Map<String, Object>> fileList = monArchDao.downloadZipFile(sqlCommand, sKey);

			ConfigProperties configProperties = ConfigProperties.getInstance();
			String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");

			String encodeType = "UTF-8";

			// ZIP 파일 출력 오브젝트 작성
			os = response.getOutputStream();
			zipOutputStream = new ZipOutputStream(os);
			zipOutputStream.setLevel(5);
			zipOutputStream.setEncoding(encodeType);

			// 압축파일리스트의 파일을 연속 압축
			long zipFileSize = 0;
			for (int i = 0; i < fileList.size(); i++) {
				// 파일오브젝트 작성
				String targetFilePath = fileList.get(i).get("FILE_PATH").toString();
				String fileName = fileList.get(i).get("FILE_NAME").toString();
				String realPath = defaultFilePath + targetFilePath; // 20140207 khma 패스를 request정보가 아닌 URL이 아닌 설정값으로 변경
				File file = new File(realPath);
				zipFileSize += file.length();
				// ZipEntry작성
				zipOutputStream.putNextEntry(new ZipEntry(fileName));
				// archive(zipOutputStream, baseFile, file, file.getName(), encodeType);
				fis = new FileInputStream(file);
				int ifilesize = (int) file.length();
				byte b[] = new byte[ifilesize];
				if (zipFileSize > 0 && file.isFile()) {
					int read = 0;
					while ((read = fis.read(b)) != -1) {
						zipOutputStream.write(b, 0, read);
					}
				}

				zipOutputStream.closeEntry();
				fis.close();
			}

			String zipFileName = "data.zip";
			String disposition = getDisposition(zipFileName, getBrowser(request));
			response.setContentLength((int) zipFileSize);
			response.reset();
			response.setContentType("application/octet-stream-dummy");
			response.setHeader("content", "text/html; charset=utf-8");
			response.setHeader("Content-Disposition", disposition);
			response.setHeader("Content-Length", "" + zipFileSize);
			response.setHeader("Content-Transfer-Encoding", "binary;");
			response.setHeader("Pragma", "no-cache;");
			response.setHeader("Expires", "-1;");
			zipOutputStream.flush();
		} catch (Exception e) {
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다.", e);
		} finally {
			zipOutputStream.close();
			os.close();
		}
	}

	/**
	 * DB BLOB 저장 파일 직접 다운로드 (M_IMAGE_GAL)
	 * 
	 * @param Q1 이미지 갤러리 번호 (M_IMAGE_GAL_NO)
	 * @param response HttpServletResponse
	 * @throws IOException 입출력 예외
	 * @throws DataAccessException DB 접근 예외
	 */
	@RequestMapping("/download")
	public void download(@RequestParam("Q1") String Q1, HttpServletResponse response)
			throws IOException, DataAccessException {
		OutputStream os = null;
		try {
			// 2018-12-17 khma : 표준 ANSI SQL 단건 조회 (DB 유형 무관 공통 쿼리)
			String SqlCommand = "SELECT * FROM M_IMAGE_GAL WHERE M_IMAGE_GAL_NO = ?";
			MonArchDaoImpl monArchDao = new MonArchDaoImpl();
			Map<String, Object> mapFileInfo = monArchDao.downloadFile(SqlCommand, Q1);

			byte[] blob = null;
			blob = (byte[]) mapFileInfo.get("FILE_DATA");
			String name;
			name = new String(mapFileInfo.get("FILE_NAME").toString().getBytes("UTF-8"), "ISO-8859-1");
			response.setHeader("Content-Transfer-Encoding", "binary");
			response.setHeader("Content-Disposition", "attachment; filename=\"" + name + "\"");
			response.setContentType(mapFileInfo.get("FILE_CONTENT_TYPE").toString());
			response.setContentLength(blob.length);

			os = response.getOutputStream();
			os.write(blob);
			os.flush();
			os.close();
		} catch (IOException ioe) {
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다.", ioe);
		} finally {
		}
	}

	/**
	 * 20261030 khma : 보안 엑셀 다운로드 (XLS_PURPOSE, XLS_TARGET, 사유, 암호화 지원)
	 * 그리드 조회 데이터를 기반으로 일반 엑셀(JXL) 또는 Agile AES 암호화 엑셀(POI 4.1.2 SXSSFWorkbook)을
	 * 생성하여 다운로드한다.
	 * 
	 * @param XmlParms 엑셀 다운로드 요청 JSON 파라미터 (xlsService, xlsMethod, dispCols,
	 *                 excelUsage, excelTarget, excelReason, excelPassword 등)
	 * @param request  HttpServletRequest
	 * @param response HttpServletResponse
	 * @return ModelAndView 파일 다운로드 뷰
	 * @throws Exception
	 */
	@RequestMapping("/exceldown")
	public ModelAndView downExcel(@RequestParam("XmlParms") String XmlParms, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String xmlParams = URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = parsingForJonType(xmlParams);

		log.debug("exceldown.mon from frontWeb ==> khma");

		List<Map<String, Object>> ds = null;
		String SqlComm = "";
		String rlt = "";
		int nRlt = 0;
		String xlsService = "";
		String xlsMethod = "";
		String UID = "";
		String USITE = "";
		String KEY = "";
		String KeyString = "";
		String type = "";
		// 20231025 khma 추가 로그용
		String MENUID = "";
		String STEPMENU = "";
		String ACTIONNAME = "";

		// 20140108 khma 추가 액셀 처리방식 개선 XLSTYPE에 따른 처리 추가
		String xlsType = XLS_TYPE.REPORT.getVal(); // default는 report ["report" : 일반 리포트 타입의 조회용 액셀, "data": 데이터 업로드 타입의
													// 액셀]
		String structureName = ""; // 구조체 정보를 취득하기 위해 구조체명 취득
		String dispCols = ""; // 표시컬럼정보 기본적으로는 report타입일때에만 사용함.data타입의 경우에는 쿼리에서 제어할것.

		long 서비스시작시간 = System.currentTimeMillis();// 서비스시작시간

		// json 데이터를 읽어서 타입변경하기
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		ServiceInfo si = null;
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		om.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>() {
		}); // 맵으로 가져옴

		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmss");
		String currentTimestamp = sd.format(calendar.getTime());
		String fileName = "";
		UID = obj.get("UID");
		USITE = obj.get("USITE");
		/* 20140108 khma 추가 액셀 처리방식 개선 XLSTYPE에 따른 처리 추가 start */
		if (obj.containsKey("xlsType") && StringUtils.isNotEmpty(obj.get("xlsType"))) {
			xlsType = obj.get("xlsType");
		}

		if (obj.containsKey("xlsService") && StringUtils.isNotEmpty(obj.get("xlsService"))) {
			xlsService = obj.get("xlsService");
		}
		if (obj.containsKey("xlsMethod") && StringUtils.isNotEmpty(obj.get("xlsMethod"))) {
			xlsMethod = obj.get("xlsMethod");
		}
		if (obj.containsKey("structureName") && StringUtils.isNotEmpty(obj.get("structureName"))) {
			structureName = obj.get("structureName");
		}
		Map<String, Object> obj2;
		ArrayList<Map<String, Object>> arrHeaderInfo = new ArrayList<Map<String, Object>>(); // 표시컬럼
		if (obj.containsKey("dispCols") && StringUtils.isNotEmpty(obj.get("dispCols"))) {
			dispCols = obj.get("dispCols");
			om.configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
			om.configure(org.codehaus.jackson.map.DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES, false);

			obj2 = om.readValue(dispCols, new TypeReference<Map<String, Object>>() {
			}); // 맵으로 가져옴
			arrHeaderInfo = (ArrayList<Map<String, Object>>) obj2.get("dispCols"); // 표시cols목록 취득
		} else {
			// todo 액션 쿼리대로 호출 양식이 없는경우임...
		}

		/* 20140108 khma 추가 액셀 처리방식 개선 XLSTYPE에 따른 처리 추가 end */

		if (obj.containsKey("xlsName") && StringUtils.isNotEmpty(obj.get("xlsName"))) {
			// xlsName이 지정되어있으면 파일명을 xlsName으로 하고 없으면 Method명으로 함
			fileName += obj.get("xlsName");
		} else {
			fileName += xlsMethod;
		}
		fileName += "_" + currentTimestamp.substring(0, 8) + "_" + currentTimestamp.substring(8);

		type = obj.get("type");

		MENUID = obj.get("MENUID");
		STEPMENU = obj.get("STEPMENU");
		ACTIONNAME = obj.get("ACTIONNAME");

		// 20261030 khma Start : 보안 엑셀 다운로드 (용도, 대상, 사유, 암호) 파라미터 취득
		String excelUsage = "";
		String excelTarget = "";
		String excelReason = "";
		String excelPassword = "";
		if (obj.containsKey("excelUsage") && StringUtils.isNotEmpty(obj.get("excelUsage"))) {
			excelUsage = URLDecoder.decode(obj.get("excelUsage"), "UTF-8");
		}
		if (obj.containsKey("excelTarget") && StringUtils.isNotEmpty(obj.get("excelTarget"))) {
			excelTarget = URLDecoder.decode(obj.get("excelTarget"), "UTF-8");
		}
		if (obj.containsKey("excelReason") && StringUtils.isNotEmpty(obj.get("excelReason"))) {
			excelReason = URLDecoder.decode(obj.get("excelReason"), "UTF-8");
		}
		if (obj.containsKey("excelPassword") && StringUtils.isNotEmpty(obj.get("excelPassword"))) {
			excelPassword = URLDecoder.decode(obj.get("excelPassword"), "UTF-8");
		}
		// 20261030 khma End : 보안 엑셀 다운로드 (용도, 대상, 사유, 암호) 파라미터 취득

		// xlsServuce, xlsMethod를 조건으로 쿼리정보를 취득한다.
		si = monArchDao.ReadQuery(xlsService, xlsMethod, USITE);

		if (si == null) {
			String _msg = "MonArch[CRUD Service] : " + xlsService + " - " + xlsMethod + "에 해당되는 서비스쿼리를 찾을수 없습니다.";
			log.error(_msg);

			throw new RuntimeException(_msg);
		}

		// 액셀다운처리
		int exviewpage = 1;
		int expagecnt = 99999999;
		// orderby에 대한 SQL injection방지에 대해서... 20180124 jwkim Start
		String prevOrderType = obj.get("_order");
		String newOrderType = obj.get("_sort");
		String OrderStr = prevOrderType;
		if (StringUtils.isNotEmpty(newOrderType)) {
			OrderStr = CommonUtil.getOrderByStatement(newOrderType);
		}
		// orderby에 대한 SQL injection방지에 대해서... 20180124 jwkim End

		// 1. 데이터 취득
		try {
			String strSql = si.getSql();
			if (StringUtils.isNotEmpty(obj.get("DOWNCOLS"))) {
				// TODO 서비스 파라메터에 DOWNCOLS의 데이터가 존재할경우
				// TODO 해당 쿼리를 서브 테이블로 필요한 컬럼만 추출한다.
				ArrayList<Map<String, Object>> newHeaderInfo = new ArrayList<Map<String, Object>>();
				String[] lavels = obj.get("DOWNLAVS").replaceAll("\"", "").split(",");
				String[] cols = obj.get("DOWNCOLS").replaceAll("\"", "").split(",");
				String comsql = "SELECT ";
				for (int i = 0; i < cols.length; i++) {
					comsql += (cols[i] + ((i != cols.length - 1) ? ", " : " FROM ( ")); // " AS " + lavels[i] +

					Map<String, Object> map = new HashMap<String, Object>();
					map.put("colNo", i);
					map.put("label", lavels[i]);
					map.put("field", cols[i]);
					newHeaderInfo.add(map);
				}
				// list쿼리를 감싸는 형태로 수정함 : 원래 엑셀 다운 시에 쿼리 실행하는 부분(rnum 붙은 부분 확인해야함)
				strSql = (comsql + strSql + " ) A");

				arrHeaderInfo = newHeaderInfo;
			}

			// 확장필드 처리 Start 2016107 khma
			String extFilterObj = obj.get("extFilters");
			Map<String, Object> extFilters = new HashMap<String, Object>();
			ArrayList<Map<String, Object>> arrExtFilters = new ArrayList<Map<String, Object>>();
			if (StringUtils.isNotEmpty(extFilterObj)) {
				om.configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
				extFilters = om.readValue(extFilterObj, new TypeReference<Map<String, Object>>() {
				}); // 맵으로 가져옴
				arrExtFilters = (ArrayList<Map<String, Object>>) extFilters.get("extFilters");
			}
			// 확장필드 처리 End 20181107 khma

			ds = monArchDao.exeList(strSql, obj, OrderStr, exviewpage, expagecnt, arrExtFilters);

			if (obj.containsKey("extClass")
					&& StringUtils.isNotEmpty(obj.get("extClass"))
					&& CommonUtil.checkExtClass(EXCEL_DOWN_CLASS_WHITE_LIST, obj.get("extClass"))) { // 20150406 외부클래스
																										// 사용시에는
																										// whitelist목록으로
																										// 사용할것(시큐어코딩지침대응)
				// extClass(확장클래스)가 지정되어있으면 아래의 액셀다운로드 클래스를 사용하지 않고 지정된 클래스를 사용한다.

				String executeClassName = obj.get("extClass");
				// 1. 리플렉션 대상클래스명을 파라메터로 지정하여 클래스를 취득
				Class targetClass = Class.forName(executeClassName);
				// 2. 대상 클래스의 객채를 생성
				Object targetInstance = targetClass.newInstance();
				// 3. 대상객체에서 사용할 메소드의 파라메터타입을 맵핑
				Class paramTypes[] = new Class[5];
				paramTypes[0] = List.class;
				paramTypes[1] = String.class;
				paramTypes[2] = String.class;
				paramTypes[3] = HttpServletRequest.class;
				paramTypes[4] = HttpServletResponse.class;
				// 4. 사용할 메소드명과 파라메터타입을 파라메터로 설정하여 대상객체에서 사용할 메소드를 취득
				Method targetMthod = targetClass.getMethod("downExcel", paramTypes);
				// 5. invoke함수를 호출하요 해당 메소드를 실행한다.
				Boolean rst = (Boolean) targetMthod.invoke(targetInstance, ds, fileName, type, request, response);

			} else {
				ExcelDownload excelDownload = new ExcelDownload();
				// 20261030 khma : 보안 엑셀 다운로드 암호 전달 (excelPassword)
				/*
				 * excelDownload.downExcel(ds, fileName ,type, request, response, arrHeaderInfo,
				 * xlsType);
				 */
				excelDownload.downExcel(ds, fileName, type, request, response, arrHeaderInfo, xlsType, excelPassword);
			}

			long 서비스종료시간 = System.currentTimeMillis();// 서비스종료시간
			long 서비스소요시간 = 서비스종료시간 - 서비스시작시간;
			사용로그(xlsService, xlsMethod, KEY, xmlParams, USITE, UID, 서비스소요시간, MENUID, STEPMENU, ACTIONNAME);

		} catch (DataAccessException e) {
			// 데이터엑세스 예외처리
			e.printStackTrace();

			String sqlCommand = "";
			if (null != si)
				sqlCommand = si.getSql();

			String msg = "MonArch[CRUD Service] : " + e.getMessage() + "\r\r ----------------- \r Service = "
					+ xlsService + "\r Method = " + xlsMethod;
			log.error(msg, e);
			SvcCRUD svcCRUD = new SvcCRUD();
			svcCRUD.Log("DATACRUD", sqlCommand, msg, USITE, UID);
			throw new Exception(CommonConst.COMM_ERROR_MESSAGE);
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
			throw new Exception(CommonConst.COMM_ERROR_MESSAGE);
		}

		return new ModelAndView("fileDownloadView", "info", null);
	}

	/**
	 * JSON 파싱을 위한 개행 및 탭 문자 이스케이프 처리
	 * 
	 * @param xmlParams 원본 문자열
	 * @return 치환된 문자열
	 */
	private String parsingForJonType(String xmlParams) {
		String rstData = xmlParams;
		rstData = rstData.replaceAll("\\n", "\\\\n");
		rstData = rstData.replaceAll("\\t", "\\\\t");
		return rstData;
	}

	public ModelAndView handleException(Exception e, HttpServletResponse response) {

		// e 객체에 익셉션에러 들어있음
		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		Map<String, Object> rstMap = new HashMap<String, Object>();
		rstMap.put("errorMessage", CommonConst.COMM_ERROR_MESSAGE);
		ModelAndView mav = new ModelAndView("", rstMap);
		return mav;

	}

	/**
	 * 파일을 저장하는 메소드
	 * 
	 * @param file
	 * @param path
	 * @param fileName
	 */
	public boolean writeFile(MultipartFile file, String path, String fileName) {
		boolean rstFlag = true;
		FileOutputStream fos = null;
		try {

			byte fileData[] = file.getBytes();

			fos = new FileOutputStream(path + "/" + fileName);

			fos.write(fileData);

		} catch (Exception e) {

			e.printStackTrace();
			rstFlag = false;
		} finally {

			if (fos != null) {

				try {
					fos.close();
				} catch (Exception e) {
				}
			}
		} // try end;
		return rstFlag;
	}// wirteFile() end;

	private String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.indexOf("MSIE") > -1 || header.indexOf("Trident/7.0") >= 0) { // 2015.05.11 hycho : ie11 브라우저 체크를 위해
																					// 조건추가
			return "MSIE";
		} else if (header.indexOf("Chrome") > -1) {
			return "Chrome";
		} else if (header.indexOf("Opera") > -1) {
			return "Opera";
		}
		return "FireFox";
	}

	private String getDisposition(String filename, String browser) throws Exception {
		String dispositionPrefix = "attachment;filename=";
		String encodedFileName = null;

		if (browser.equals("MSIE")) {
			encodedFileName = URLEncoder.encode(filename, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.equals("FireFox")) {
			encodedFileName = "\"" + new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Opera")) {
			encodedFileName = "\"" + new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Chrome")) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < filename.length(); i++) {
				encodedFileName = "\"" + new String(filename.getBytes("UTF-8"), "ISO-8859-1") + "\"";

			}
		} else {
			throw new RuntimeException("Not Supported browser");
		}

		return dispositionPrefix + encodedFileName;
	}

	/**
	 * CRM 시스템 기능 호출 감사 및 사용 기록 로그 적재 (M_USE_LOG)
	 * 
	 * @param 서비스 서비스명 (xlsService 등)
	 * @param 메소드 메소드명 (xlsMethod 등)
	 * @param KEY 조회 키 값
	 * @param 요청문서 요청 파라미터 JSON 전문 (최대 2000자)
	 * @param 회원사번호 회원사 사이트 번호 (M_USITE_NO)
	 * @param 사용자 로그인 사용자 식별 번호 (M_USER_NO)
	 * @param 소요시간 서비스 실행 경과 시간 (ms)
	 * @param MENUID 접속 메뉴 관리 번호 (MENU_MGMT_NO)
	 * @param STEPMENU 상위 단계 메뉴명 (STEP_MENU)
	 * @param ACTIONNAME 수행 액션명 (ACTION_NAME)
	 */
	public void 사용로그(String 서비스, String 메소드, String KEY, String 요청문서, String 회원사번호, String 사용자, long 소요시간,
			String MENUID, String STEPMENU, String ACTIONNAME) {

		if (StringUtils.isNotEmpty(요청문서) && 요청문서.length() > 2000)
			요청문서 = 요청문서.substring(0, 2000);
		if (StringUtils.isEmpty(사용자))
			사용자 = "1";
		if (StringUtils.isEmpty(회원사번호))
			회원사번호 = "44";

		Map<String, String> uselogParam = new HashMap();

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

		// 2018-12-17 khma : DB 유형(DB_TYPE: Oracle/MSSQL/MySQL)별 M_USE_LOG 시퀀스 동적 생성 적용 완료
		String sqlCommand = " INSERT INTO M_USE_LOG ( "
				+ QueryGenerator.genSequenceCol(DB_TYPE, "M_USE_LOG_NO", true)
				+ " M_USITE_NO,M_USER_NO,SERVICE_NAME,METHOD_NAME,REQ_DOC,ELAPSED_TIME,KEY_VALUE, MENU_MGMT_NO, STEP_MENU, ACTION_NAME"
				+ ") VALUES ("
				+ QueryGenerator.genSequenceStmt(DB_TYPE, "M_USE_LOG_SEQ", true)
				+ "@M_USITE_NO@, @M_USER_NO@, @SERVICE_NAME@, @METHOD_NAME@,@REQ_DOC@ ,@ELAPSED_TIME@,@KEY_VALUE@,@MENU_MGMT_NO@,@STEP_MENU@, @ACTION_NAME@)";

		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		monArchDao.exeCreate(sqlCommand, uselogParam);
	}

}
