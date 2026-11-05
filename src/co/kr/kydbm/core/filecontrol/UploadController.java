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
import javax.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import co.kr.kydbm.core.bean.UserInfo;

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
import co.kr.kydbm.core.bean.ResultInfo;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.service.SvcCRUD;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.PropertyUtil;
import co.kr.kydbm.core.utils.QueryGenerator;

/**
 * SERICEO CRM MonArch 8.2.0 파일 업로드/다운로드 및 보안 엑셀 다운로드 컨트롤러
 * 
 * [시스템 역할 및 기능 명세]
 * 1. 차세대 파일 제어: HTML5 Drag&Drop 클라이언트 지연 업로드(/uploadFileNew), 안전 다운로드(/downloadFileNew), 휴지통 이동(/deleteFileSafe)
 * 2. 레거시 파일 제어: 멀티파트 업로드(/multiFileUpload, /upload), 다운로드(/fileDownload, /download), ZIP 압축 다운로드(/zipFileDownload)
 * 3. 보안 엑셀 다운로드(/downExcel): POI 4.1.2 Agile AES 암호화 엑셀 스트리밍 및 감사 이력(M_EXCEL_DOWN_LOG) 정밀 연동
 * 4. 예외 및 스트림 안전성: @ExceptionHandler 표준 ResultInfo JSON 응답, HTTP 상태 유지 및 스트림 전송 전/후 에러 격리
 * 
 * @author Ma KyoungHo
 * @company KYDBM
 * @version 2.0 2026-11-04
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
				// 20261104 khma : printStackTrace() 제거 및 로거 기록
				/*
				e.printStackTrace();
				*/
				log.error("응답 출력 스트림 오류: " + e.getMessage(), e);
			} finally {
				// 20261104 khma : out 객체 null-safe 검증 후 닫기
				if (out != null) {
					out.close();
				}
			}
		} else {

			if (lFileSize > limitSize) {
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = null;
				try {
					out = response.getWriter();
					out.write("<script language='javascript'>alert('파일용량이 제한용량보다 큽니다.');</script>");
				} catch (IOException e) {
					// 20261104 khma : printStackTrace() 제거 및 로거 기록
					/*
					e.printStackTrace();
					*/
					log.error("응답 출력 스트림 오류: " + e.getMessage(), e);
				} finally {
					// 20261104 khma : out 객체 null-safe 검증 후 닫기
					if (out != null) {
						out.close();
					}
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
			log.info("파일 이름 변경 완료: " + newFilePath);
		} catch (IOException e) {
			// 20261104 khma : printStackTrace() 제거 및 로거 기록
			/*
			e.printStackTrace();
			*/
			log.error("파일 이름 변경 실패: " + e.getMessage(), e);
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
				// 20261104 khma : printStackTrace() 제거 및 로거 기록
				/*
				e.printStackTrace();
				*/
				log.error("응답 출력 스트림 오류: " + e.getMessage(), e);
			} finally {
				// 20261104 khma : out 객체 null-safe 검증 후 닫기
				if (out != null) {
					out.close();
				}
			}
		} else {

			if (lFileSize > limitSize) {
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = null;
				try {
					out = response.getWriter();
					out.write("<script language='javascript'>alert('파일용량이 제한용량보다 큽니다.');</script>");
				} catch (IOException e) {
					// 20261104 khma : printStackTrace() 제거 및 로거 기록
					/*
					e.printStackTrace();
					*/
					log.error("응답 출력 스트림 오류: " + e.getMessage(), e);
				} finally {
					// 20261104 khma : out 객체 null-safe 검증 후 닫기
					if (out != null) {
						out.close();
					}
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
			// 20261104 khma : null-safe 스트림 닫기
			if (os != null) {
				try { os.close(); } catch (Exception e) {}
			}
			if (fis != null) {
				try { fis.close(); } catch (Exception e) {}
			}
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
			// 20261104 khma : null-safe 스트림 닫기
			if (os != null) {
				try { os.close(); } catch (Exception e) {}
			}
			if (fis != null) {
				try { fis.close(); } catch (Exception e) {}
			}
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
			// 20261104 khma : null-safe 스트림 닫기
			if (zipOutputStream != null) {
				try { zipOutputStream.close(); } catch (Exception e) {}
			}
			if (os != null) {
				try { os.close(); } catch (Exception e) {}
			}
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
		} catch (IOException ioe) {
			log.error("파일다운로드 중 예기치 못한 에러가 발생하였습니다.", ioe);
		} finally {
			// 20261104 khma : null-safe 스트림 닫기
			if (os != null) {
				try { os.close(); } catch (Exception e) {}
			}
		}
	}

	/**
	 * 20261102 khma : 보안 엑셀 다운로드 (동적 쿼리 필터 XLS_PURPOSE, XLS_TARGET 및 POI 4.1.2 Agile AES 암호화)
	 * 그리드 조회 데이터를 기반으로 일반 엑셀(JXL) 또는 Agile AES 암호화 엑셀(POI 4.1.2 SXSSFWorkbook)을
	 * 생성하여 클라이언트 스트림으로 직접 출력한다.
	 * 
	 * @param XmlParms 엑셀 다운로드 요청 JSON 파라미터 (xlsService, xlsMethod, dispCols,
	 *                 XLS_PURPOSE, XLS_TARGET, excelPassword 등)
	 * @param request  HttpServletRequest
	 * @param response HttpServletResponse
	 * @return ModelAndView 파일 스트림 직접 출력 후 null 반환 (Spring View 충돌 방지)
	 * @throws Exception 데이터 조회 또는 파일 스트림 출력 중 예외
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
		// 20261102 khma : 프론트엔드에서 timeStamp 전달 시 동일하게 사용하여 실제 다운로드 파일명과 감사 로그 파일명 100% 일치
		if (obj.containsKey("timeStamp") && StringUtils.isNotEmpty(obj.get("timeStamp")) && obj.get("timeStamp").length() >= 14) {
			currentTimestamp = obj.get("timeStamp");
		}
		String fileName = "";
		UID = obj.get("UID");
		USITE = obj.get("USITE");

		// 20261104 khma Start : 파라미터에 UID/USITE 누락 시 세션(userInfo)에서 안전하게 Fallback 취득
		if (StringUtils.isEmpty(UID) || StringUtils.isEmpty(USITE)) {
			HttpSession session = request.getSession(false);
			if (session != null) {
				UserInfo sUser = null;
				if (session.getAttribute("userInfo") != null) {
					sUser = (UserInfo) session.getAttribute("userInfo");
				} else if (session.getAttribute("UserInfo") != null) {
					sUser = (UserInfo) session.getAttribute("UserInfo");
				}
				if (sUser != null) {
					if (StringUtils.isEmpty(UID)) {
						UID = StringUtils.isNotEmpty(sUser.getUserCode()) ? sUser.getUserCode() : sUser.getUserNo();
					}
					if (StringUtils.isEmpty(USITE)) {
						USITE = StringUtils.isNotEmpty(sUser.getUsiteNo()) ? sUser.getUsiteNo() : "44";
					}
				}
			}
		}
		// 20261104 khma End : 파라미터에 UID/USITE 누락 시 세션(userInfo)에서 안전하게 Fallback 취득
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

		// 20261102 khma Start : 보안 엑셀 다운로드 (용도 XLS_PURPOSE, 대상 XLS_TARGET, 파일 암호 excelPassword) 파라미터 취득
		String excelUsage = "";
		String excelTarget = "";
		String excelPassword = "";
		// 용도 코드 취득 (동적 쿼리 주석 해제용: XLS_PURPOSE 우선, excelUsage 하위호환)
		if (obj.containsKey("XLS_PURPOSE") && StringUtils.isNotEmpty(obj.get("XLS_PURPOSE"))) {
			excelUsage = URLDecoder.decode(obj.get("XLS_PURPOSE"), "UTF-8");
		} else if (obj.containsKey("excelUsage") && StringUtils.isNotEmpty(obj.get("excelUsage"))) {
			excelUsage = URLDecoder.decode(obj.get("excelUsage"), "UTF-8");
		}
		// 대상 코드 취득 (동적 쿼리 주석 해제용: XLS_TARGET 우선, excelTarget 하위호환)
		if (obj.containsKey("XLS_TARGET") && StringUtils.isNotEmpty(obj.get("XLS_TARGET"))) {
			excelTarget = URLDecoder.decode(obj.get("XLS_TARGET"), "UTF-8");
		} else if (obj.containsKey("excelTarget") && StringUtils.isNotEmpty(obj.get("excelTarget"))) {
			excelTarget = URLDecoder.decode(obj.get("excelTarget"), "UTF-8");
		}
		// 파일 암호 취득 (POI 4.1.2 Agile AES 암호화 생성용)
		if (obj.containsKey("excelPassword") && StringUtils.isNotEmpty(obj.get("excelPassword"))) {
			excelPassword = URLDecoder.decode(obj.get("excelPassword"), "UTF-8");
		}
		// 20261103 khma Start : 요청문서 이력(REQ_DOC) 및 다운로드 사유(XLS_REASON) 파라미터 취득
		String excelReason = "";
		String reqDoc = "";
		if (obj.containsKey("XLS_REASON") && StringUtils.isNotEmpty(obj.get("XLS_REASON"))) {
			excelReason = URLDecoder.decode(obj.get("XLS_REASON"), "UTF-8");
		} else if (obj.containsKey("excelReason") && StringUtils.isNotEmpty(obj.get("excelReason"))) {
			excelReason = URLDecoder.decode(obj.get("excelReason"), "UTF-8");
		}
		if (obj.containsKey("REQ_DOC") && StringUtils.isNotEmpty(obj.get("REQ_DOC"))) {
			reqDoc = URLDecoder.decode(obj.get("REQ_DOC"), "UTF-8");
		} else if (obj.containsKey("reqDoc") && StringUtils.isNotEmpty(obj.get("reqDoc"))) {
			reqDoc = URLDecoder.decode(obj.get("reqDoc"), "UTF-8");
		}
		// 20261103 khma : 감사 로그 내 엑셀 암호(excelPassword) 평문 노출 방지 마스킹
		if (StringUtils.isNotEmpty(reqDoc)) {
			reqDoc = reqDoc.replaceAll("(\"excelPassword\"\\s*:\\s*\")[^\"]*(\")", "$1******$2")
					.replaceAll("(?i)(excelPassword=)[^&]*", "$1******");
		}
		// 20261103 khma End : 요청문서 이력(REQ_DOC) 및 다운로드 사유(XLS_REASON) 파라미터 취득
		// 20261102 khma End : 보안 엑셀 다운로드 파라미터 취득

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

			// 20261105 khma Start : 대용량 10만건 이상 엑셀/CSV 스트리밍 다운로드 (WAS 메모리 적재 제거 및 downStream 연동)
			int actualDownCnt = 0;

			if (obj.containsKey("extClass")
					&& StringUtils.isNotEmpty(obj.get("extClass"))
					&& CommonUtil.checkExtClass(EXCEL_DOWN_CLASS_WHITE_LIST, obj.get("extClass"))) {
				// extClass(확장클래스)가 지정된 특수 화면의 경우에만 기존 리플렉션 호출 유지
				ds = monArchDao.exeList(strSql, obj, OrderStr, exviewpage, expagecnt, arrExtFilters);
				actualDownCnt = (ds != null) ? ds.size() : 0;

				String executeClassName = obj.get("extClass");
				Class targetClass = Class.forName(executeClassName);
				Object targetInstance = targetClass.newInstance();
				Class paramTypes[] = new Class[5];
				paramTypes[0] = List.class;
				paramTypes[1] = String.class;
				paramTypes[2] = String.class;
				paramTypes[3] = HttpServletRequest.class;
				paramTypes[4] = HttpServletResponse.class;
				Method targetMthod = targetClass.getMethod("downExcel", paramTypes);
				Boolean rst = (Boolean) targetMthod.invoke(targetInstance, ds, fileName, type, request, response);
			} else {
				// 일반 엑셀 및 보안 엑셀 모두 DB 커서 기반 Row-by-Row 스트리밍 다운로드 적용 (메모리 100행 유지, 10만건 이상 OOM 원천 방지)
				if (StringUtils.isNotEmpty(excelPassword)) {
					request.setAttribute("xlsPassword", excelPassword);
				}
				ExcelDownload excelDownload = new ExcelDownload();
				actualDownCnt = excelDownload.downStream(monArchDao, strSql, obj, OrderStr, arrExtFilters, fileName, type, request, response, arrHeaderInfo, xlsType);
			}
			// 20261105 khma End : 대용량 10만건 이상 엑셀/CSV 스트리밍 다운로드 (WAS 메모리 적재 제거 및 downStream 연동)

			// 20261103 khma Start : 실제 엑셀 다운로드 조회 건수로 M_EXCEL_DOWN_LOG.DOWN_CNT 정밀 갱신
			try {
				Map<String, String> updateDownCntParam = new HashMap<String, String>();
				updateDownCntParam.put("DOWN_CNT", String.valueOf(actualDownCnt));
				updateDownCntParam.put("FILE_NAME_EXT", fileName + ".xlsx");
				updateDownCntParam.put("FILE_NAME_RAW", fileName);
				String baseName = (obj.containsKey("xlsName") && StringUtils.isNotEmpty(obj.get("xlsName"))) ? obj.get("xlsName") : xlsMethod;
				updateDownCntParam.put("BASE_NAME", baseName);
				// 20261104 khma : UID가 유효할 때만 파라미터에 추가하여 모나크 동적 주석 문법(/* AND REGUSER = @REGUSER@ */)과 연동
				if (StringUtils.isNotEmpty(UID)) {
					updateDownCntParam.put("REGUSER", UID);
				}
				// 20261104 khma : 오라클 컬럼명 정합성 보정 (REG_DATE -> REGDATE) 및 파일명/사용자 다중 Fallback 매칭
				String sqlUpdateDownCnt = "UPDATE M_EXCEL_DOWN_LOG "
						+ "   SET DOWN_CNT = @DOWN_CNT@ "
						+ " WHERE LOG_NO = ( "
						+ "       SELECT MAX(LOG_NO) "
						+ "         FROM M_EXCEL_DOWN_LOG "
						+ "        WHERE ( "
						+ "              FILE_NAME = @FILE_NAME_EXT@ "
						+ "              OR FILE_NAME = @FILE_NAME_RAW@ "
						+ "              OR FILE_NAME LIKE '%' || @BASE_NAME@ || '%' "
						+ "              ) "
						+ "          /* AND REGUSER = @REGUSER@ */ "
						+ "          AND REGDATE >= SYSTIMESTAMP - INTERVAL '5' MINUTE "
						+ " ) ";
				int nUpdateCnt = monArchDao.exeUpdate(sqlUpdateDownCnt, updateDownCntParam);
				if (nUpdateCnt > 0) {
					log.info("M_EXCEL_DOWN_LOG DOWN_CNT 정밀 갱신 완료 (" + nUpdateCnt + "건): DOWN_CNT=" + actualDownCnt + ", fileName=" + fileName);
				} else {
					// 파일명 매칭 실패 시 동일 사용자 최근 5분 이내 최신 로그 Fallback 갱신
					if (StringUtils.isNotEmpty(UID)) {
						String sqlFallback = "UPDATE M_EXCEL_DOWN_LOG "
								+ "   SET DOWN_CNT = @DOWN_CNT@ "
								+ " WHERE LOG_NO = ( "
								+ "       SELECT MAX(LOG_NO) "
								+ "         FROM M_EXCEL_DOWN_LOG "
								+ "        WHERE REGUSER = @REGUSER@ "
								+ "          AND REGDATE >= SYSTIMESTAMP - INTERVAL '5' MINUTE "
								+ " ) ";
						int nFb = monArchDao.exeUpdate(sqlFallback, updateDownCntParam);
						log.info("M_EXCEL_DOWN_LOG Fallback DOWN_CNT 갱신 결과 (" + nFb + "건): DOWN_CNT=" + actualDownCnt + ", UID=" + UID);
					}
				}
			} catch (Exception eLog) {
				log.warn("M_EXCEL_DOWN_LOG DOWN_CNT 정밀 갱신 중 예외 발생 (무시): " + eLog.getMessage(), eLog);
			}
			// 20261103 khma End : 실제 엑셀 다운로드 조회 건수로 M_EXCEL_DOWN_LOG.DOWN_CNT 정밀 갱신

			long 서비스종료시간 = System.currentTimeMillis();// 서비스종료시간
			long 서비스소요시간 = 서비스종료시간 - 서비스시작시간;
			사용로그(xlsService, xlsMethod, KEY, xmlParams, USITE, UID, 서비스소요시간, MENUID, STEPMENU, ACTIONNAME);

		} catch (DataAccessException e) {
			// 데이터엑세스 예외처리
			// 20261104 khma : printStackTrace 제거 및 log.error 일원화
			/*
			e.printStackTrace();
			*/

			String sqlCommand = "";
			if (null != si)
				sqlCommand = si.getSql();

			String msg = "MonArch[CRUD Service] : " + e.getMessage() + "\r\r ----------------- \r Service = "
					+ xlsService + "\r Method = " + xlsMethod;
			log.error(msg, e);
			SvcCRUD svcCRUD = new SvcCRUD();
			svcCRUD.Log("DATACRUD", sqlCommand, msg, USITE, UID);

			// 20261103 khma : 하얀 화면 이동 방지, 오류 로그 DB 기록 및 브라우저 alert 안내 후 복귀
			// 20261104 khma : response.isCommitted() 체크 추가로 IllegalStateException 방어
			try {
				if (!response.isCommitted()) {
					response.reset();
					response.setContentType("text/html; charset=UTF-8");
					PrintWriter out = response.getWriter();
					out.write("<script>alert('엑셀 데이터 조회 중 오류가 발생하였습니다.\\n관리자에게 문의해 주십시오.'); history.back();</script>");
					out.flush();
					out.close();
				}
			} catch (Exception ex) {}
			return null;
		} catch (Throwable e) {
			// 20261104 khma : printStackTrace 제거 및 표준 로깅
			/*
			e.printStackTrace();
			*/
			log.error(e.getMessage(), e);

			// 20261103 khma : 시스템 에러 로그(SvcCRUD.Log) DB 적재 및 사용자 alert 안내 출력 (하얀 화면 방어)
			// 20261104 khma : 내부 시스템 에러 메시지 노출 차단 및 response.isCommitted() 안전 검증
			try {
				String sqlCommand = (si != null) ? si.getSql() : "";
				String msg = "MonArch[Excel Down] : " + e.getMessage() + "\r\r ----------------- \r Service = "
						+ xlsService + "\r Method = " + xlsMethod;
				SvcCRUD svcCRUD = new SvcCRUD();
				svcCRUD.Log("EXCELDOWN", sqlCommand, msg, USITE, UID);

				if (!response.isCommitted()) {
					response.reset();
					response.setContentType("text/html; charset=UTF-8");
					PrintWriter out = response.getWriter();
					String alertMsg = "엑셀 다운로드 중 오류가 발생하였습니다.\\n관리자에게 문의해 주십시오.";
					/*
					String alertMsg = "엑셀 다운로드 중 오류가 발생하였습니다.";
					if (StringUtils.isNotEmpty(e.getMessage()) && !e.getMessage().equals(CommonConst.COMM_ERROR_MESSAGE)) {
						alertMsg += "\\n(" + e.getMessage().replace("'", "\\'").replace("\r", " ").replace("\n", " ") + ")";
					}
					*/
					out.write("<script>alert('" + alertMsg + "'); history.back();</script>");
					out.flush();
					out.close();
				}
			} catch (Exception ex) {}
			return null;
		}
		return null;
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

	/**
	 * 20261104 khma : 파일 업로드 및 다운로드 컨트롤러 전용 공통 예외 처리기 (@ExceptionHandler)
	 * 컨트롤러 내 처리되지 않은 예외 발생 시 표준 ResultInfo(E00004) JSON 구조를 반환하여
	 * 클라이언트(jquery.kdb.soap.2.0.js)에서 일관되게 에러를 처리할 수 있도록 보장한다.
	 *
	 * @param e 발생한 예외
	 * @param response HttpServletResponse
	 * @return JSON 뷰 ModelAndView
	 */
	@ExceptionHandler(Exception.class)
	public ModelAndView handleException(Exception e, HttpServletResponse response) {

		// 20261104 khma : printStackTrace 대신 log.error 로깅 및 표준 ResultInfo 생성
		log.error("UploadController 예외 발생: " + e.getMessage(), e);
		response.setStatus(HttpServletResponse.SC_OK);
		Map<String, Object> rstMap = new HashMap<String, Object>();
		rstMap.put("errorMessage", CommonConst.COMM_ERROR_MESSAGE);

		ResultInfo resultInfo = new ResultInfo();
		resultInfo.setResult("FAIL");
		resultInfo.setErrorCode("E00004");
		resultInfo.setMessage(CommonConst.COMM_ERROR_MESSAGE);
		rstMap.put(CommonConst.RESULT_INFO, resultInfo);

		ModelAndView mav = new ModelAndView("mappingJacksonJsonView", rstMap);
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

			// 20261104 khma : printStackTrace 제거 및 log.error 로깅
			/*
			e.printStackTrace();
			*/
			log.error("물리 파일 저장 중 오류 발생: path=" + path + ", fileName=" + fileName, e);
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

		// 20261103 khma : 감사 로그 내 엑셀 암호(excelPassword) 평문 노출 방지 마스킹
		if (StringUtils.isNotEmpty(요청문서)) {
			요청문서 = 요청문서.replaceAll("(\"excelPassword\"\\s*:\\s*\")[^\"]*(\")", "$1******$2")
					.replaceAll("(?i)(excelPassword=)[^&]*", "$1******");
		}
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
		// 20261103 khma : M_USE_LOG SQL 바인딩 템플릿(@REQ_DOC@)과 일치하도록 영문 컬럼명 키(REQ_DOC)로 일치화 및 미사용 키 제거
		/*
		uselogParam.put("요청문서", 요청문서);
		*/
		uselogParam.put("REQ_DOC", 요청문서);
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

	// 20261102 khma Start : 차세대 드래그앤드롭 파일 시스템 신규 엔드포인트 (/uploadFileNew, /downloadFileNew, /deleteFileSafe)

	/**
	 * 차세대 드래그앤드롭 파일 업로드 (singleFileNew / multiFileNew 전용)
	 * 파일을 지정된 물리 경로(monarch.fileupload.path/년/월/)에 저장하고, M_IMAGE_GAL 테이블에 메타데이터를 등록한다.
	 *
	 * @param Filename 업로드할 MultipartFile
	 * @param fileSearchKey 화면에서 전달된 그룹/식별키 (UPPER_INFO 에 매핑)
	 * @param jobType 업무 분류
	 * @param ParentKey 부모 업무 PK (UPPER_KEY 에 매핑, 숫자 변환 가능 시)
	 * @param UID 등록자 ID
	 * @param USITE 사이트 번호
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 저장 및 DB 등록 예외
	 */
	@RequestMapping("/uploadFileNew")
	public void uploadFileNew(
			@RequestParam("Filename") MultipartFile Filename,
			@RequestParam(value = "fileSearchKey", required = false, defaultValue = "") String fileSearchKey,
			@RequestParam(value = "jobType", required = false, defaultValue = "FILE") String jobType,
			@RequestParam(value = "ParentKey", required = false, defaultValue = "") String ParentKey,
			@RequestParam(value = "UID", required = false, defaultValue = "1") String UID,
			@RequestParam(value = "USITE", required = false, defaultValue = "44") String USITE,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		Map<String, Object> resultMap = new HashMap<String, Object>();

		try {
			// 20261103 khma : 세션 userInfo 우선 취득 및 미인증 접근 차단 (요청 파라미터 변조 방어)
			HttpSession session = request.getSession(false);
			UserInfo userInfo = null;
			if (session != null) {
				if (session.getAttribute("userInfo") != null) {
					userInfo = (UserInfo) session.getAttribute("userInfo");
				} else if (session.getAttribute("UserInfo") != null) {
					userInfo = (UserInfo) session.getAttribute("UserInfo");
				}
			}
			if (userInfo == null) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "로그인 세션이 만료되었거나 존재하지 않습니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}
			String realUid = StringUtils.isNotEmpty(userInfo.getUserNo()) ? userInfo.getUserNo() : userInfo.getUserCode();
			String realUsite = StringUtils.isNotEmpty(userInfo.getUsiteNo()) ? userInfo.getUsiteNo() : "44";

			if (Filename == null || Filename.isEmpty()) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "업로드할 파일이 없습니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}

			// 20261103 khma : 파일당 20MB 제한 백엔드 강제 검증 (20MB = 20 * 1024 * 1024 bytes)
			long maxFileSize = 20L * 1024L * 1024L;
			if (Filename.getSize() > maxFileSize) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "파일 업로드 용량 제한(20MB)을 초과하였습니다. (현재 크기: " + (Filename.getSize() / (1024 * 1024)) + "MB)");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}
			// 업로드 파일 확장자 체크 (화이트리스트)
			if (!CommonUtil.checkExtender(Filename.getOriginalFilename(), FILE_UPLOAD_WHITE_LIST)) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "업로드 할 수 없는 형식의 파일입니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}

			ConfigProperties configProperties = ConfigProperties.getInstance();
			Calendar calendar = Calendar.getInstance();
			String years = String.valueOf(calendar.get(Calendar.YEAR));
			String months = String.format("%02d", calendar.get(Calendar.MONTH) + 1);
			SimpleDateFormat sd = new SimpleDateFormat("yyyyMMddHHmmssSSS");
			String currentTimestamp = sd.format(calendar.getTime());

			String uploadFolder = years + "/" + months;
			// 20261102 khma : D: 드라이브 부재 로컬/VDI 환경 자동 Fallback 지원 기본 업로드 경로 취득
			String defaultFilePath = getBaseUploadPath(request);
			String realPath = defaultFilePath + uploadFolder;
			String originalFileName = Filename.getOriginalFilename();
			String ext = FilenameUtils.getExtension(originalFileName);
			// 20261104 khma : 물리 파일명 및 DB FILE_PATH에 원본 파일명을 제외하고 순수 타임스탬프(YYYY/MM/타임스탬프)만 저장 (기존 CRM 표준 유지)
			/*
			String realfileName = currentTimestamp + "_" + originalFileName;
			*/
			String realfileName = currentTimestamp;
			String fileSize = String.valueOf(Filename.getSize());

			// 디렉토리 자동 생성
			File dir = new File(realPath);
			if (!dir.isDirectory()) {
				dir.mkdirs();
			}

			// 물리 파일 저장
			if (writeFile(Filename, realPath, realfileName)) {
				MonArchDaoImpl monArchDao = new MonArchDaoImpl();
				// 신규 시퀀스 채번
				Long newFid = null;
				try {
					Map<String, Object> seqMap = monArchDao.queryForMap("SELECT M_IMAGE_GAL_SEQ.NEXTVAL AS NEXTVAL FROM DUAL", new HashMap<String, String>());
					if (seqMap != null && seqMap.get("NEXTVAL") != null) {
						newFid = Long.parseLong(seqMap.get("NEXTVAL").toString());
					}
				} catch (Exception ex) {
					log.warn("M_IMAGE_GAL_SEQ 채번 실패, 기본 시퀀스 바인딩 대체", ex);
				}

				String relativeFilePath = uploadFolder + "/" + realfileName;
				String upperKeyVal = (StringUtils.isNotEmpty(ParentKey) && StringUtils.isNumeric(ParentKey)) ? ParentKey : null;

				String insertSql = "INSERT INTO M_IMAGE_GAL ("
						+ (newFid != null ? "M_IMAGE_GAL_NO, " : QueryGenerator.genSequenceCol(DB_TYPE, "M_IMAGE_GAL_NO", true))
						+ "FILE_NAME, FILE_SIZE, FILE_CONTENT_TYPE, FILE_TYPE_CODE, FILE_DESC, "
						+ "FILE_PATH, UPPER_INFO, "
						+ (upperKeyVal != null ? "UPPER_KEY, " : "")
						+ "REG_DATE, UPD_DATE, REG_USER, UPD_USER, M_USITE_NO) VALUES ("
						+ (newFid != null ? newFid + ", " : QueryGenerator.genSequenceStmt(DB_TYPE, "M_IMAGE_GAL_SEQ", true))
						+ "@FILE_NAME@, @FILE_SIZE@, @FILE_CONTENT_TYPE@, @FILE_TYPE_CODE@, @FILE_DESC@, "
						+ "@FILE_PATH@, @UPPER_INFO@, "
						+ (upperKeyVal != null ? upperKeyVal + ", " : "")
						+ QueryGenerator.genSysDate(DB_TYPE, true)
						+ QueryGenerator.genSysDate(DB_TYPE, true)
						+ "@REG_USER@, @UPD_USER@, @M_USITE_NO@)";

				Map<String, String> mapParam = new HashMap<String, String>();
				mapParam.put("FILE_NAME", originalFileName);
				mapParam.put("FILE_SIZE", fileSize);
				mapParam.put("FILE_CONTENT_TYPE", ext);
				mapParam.put("FILE_TYPE_CODE", "파일");
				mapParam.put("FILE_DESC", jobType);
				mapParam.put("FILE_PATH", relativeFilePath);
				mapParam.put("UPPER_INFO", fileSearchKey);
				mapParam.put("REG_USER", realUid);
				mapParam.put("UPD_USER", realUid);
				mapParam.put("M_USITE_NO", realUsite);

				monArchDao.exeUpdate(insertSql, mapParam);

				resultMap.put("result", "OK");
				resultMap.put("fid", newFid != null ? String.valueOf(newFid) : "");
				resultMap.put("filePath", relativeFilePath);
				resultMap.put("fileName", originalFileName);
				resultMap.put("fileSize", fileSize);
				resultMap.put("fileSearchKey", fileSearchKey);
			} else {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "물리 파일 저장에 실패하였습니다.");
			}
		} catch (Exception e) {
			log.error("신규 파일 업로드 중 에러 발생", e);
			resultMap.put("result", "FAIL");
			// 20261104 khma : 내부 시스템 에러 메시지(e.getMessage) 노출 차단
			/*
			resultMap.put("message", "파일 업로드 중 오류가 발생하였습니다: " + e.getMessage());
			*/
			resultMap.put("message", "파일 업로드 처리 중 오류가 발생하였습니다.");
		} finally {
			// 20261104 khma : out null-safe 출력 및 닫기
			if (out != null) {
				try {
					out.print(new ObjectMapper().writeValueAsString(resultMap));
					out.flush();
					out.close();
				} catch (Exception ex) {}
			}
		}
	}

	/**
	 * 차세대 드래그앤드롭 파일 다운로드 (singleFileNew / multiFileNew 전용)
	 * M_IMAGE_GAL 의 fid(M_IMAGE_GAL_NO) 또는 상대 filePath 를 기반으로 물리 파일을 안전 스트림 다운로드한다.
	 *
	 * @param fid 이미지 갤러리 번호 (M_IMAGE_GAL_NO)
	 * @param filePath 상대 파일 경로 (fid 부재 시 대체)
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 다운로드 예외
	 */
	@RequestMapping("/downloadFileNew")
	public void downloadFileNew(
			@RequestParam(value = "fid", required = false, defaultValue = "") String fid,
			@RequestParam(value = "filePath", required = false, defaultValue = "") String filePath,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		FileInputStream fis = null;
		OutputStream os = null;

		try {
			// 20261103 khma : 세션 userInfo 검증 (미인증 파일 다운로드 차단)
			HttpSession session = request.getSession(false);
			UserInfo userInfo = null;
			if (session != null) {
				if (session.getAttribute("userInfo") != null) {
					userInfo = (UserInfo) session.getAttribute("userInfo");
				} else if (session.getAttribute("UserInfo") != null) {
					userInfo = (UserInfo) session.getAttribute("UserInfo");
				}
			}
			if (userInfo == null) {
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.write("<script>alert('로그인 세션이 만료되었습니다. 다시 로그인해 주십시오.'); history.back();</script>");
				out.flush();
				out.close();
				return;
			}
			String sessionUsite = StringUtils.isNotEmpty(userInfo.getUsiteNo()) ? userInfo.getUsiteNo() : "";

			// 20261102 khma : D: 드라이브 부재 로컬/VDI 환경 자동 Fallback 지원 기본 업로드 경로 취득
			String defaultFilePath = getBaseUploadPath(request);
			String targetFilePath = "";
			String downloadFileName = "";

			// 20261103 khma : 임의 filePath 파라미터 직접 다운로드 차단, 오직 DB(M_IMAGE_GAL)에 등록된 fid로만 다운로드 허용
			if (StringUtils.isNotEmpty(fid)) {
				String sql = "SELECT * FROM M_IMAGE_GAL WHERE M_IMAGE_GAL_NO = ? AND (USE_YN IS NULL OR USE_YN <> 'N')";
				MonArchDaoImpl monArchDao = new MonArchDaoImpl();
				Map<String, Object> mapFileInfo = monArchDao.downloadFile(sql, fid);
				if (mapFileInfo != null && !mapFileInfo.isEmpty()) {
					String fileUsite = (mapFileInfo.get("M_USITE_NO") != null) ? mapFileInfo.get("M_USITE_NO").toString() : "";
					if (StringUtils.isNotEmpty(sessionUsite) && StringUtils.isNotEmpty(fileUsite) && !sessionUsite.equals(fileUsite)) {
						log.warn("타 사이트 파일 접근 차단: fid=" + fid + ", sessionUsite=" + sessionUsite + ", fileUsite=" + fileUsite);
						response.setContentType("text/html; charset=UTF-8");
						PrintWriter out = response.getWriter();
						out.write("<script>alert('접근 권한이 없는 파일입니다.'); history.back();</script>");
						out.flush();
						out.close();
						return;
					}
					if (mapFileInfo.get("FILE_PATH") != null) {
						targetFilePath = mapFileInfo.get("FILE_PATH").toString();
					}
					if (mapFileInfo.get("FILE_NAME") != null) {
						downloadFileName = mapFileInfo.get("FILE_NAME").toString();
					}
				} else {
					response.setContentType("text/html; charset=UTF-8");
					PrintWriter out = response.getWriter();
					out.write("<script>alert('파일 정보가 존재하지 않거나 삭제된 파일입니다.'); history.back();</script>");
					out.flush();
					out.close();
					return;
				}
			} else {
				log.warn("fid 누락 파일 다운로드 시도 차단");
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.write("<script>alert('비정상적인 파일 요청입니다. (파일 식별자 누락)'); history.back();</script>");
				out.flush();
				out.close();
				return;
			}

			if (StringUtils.isEmpty(downloadFileName) && StringUtils.isNotEmpty(targetFilePath)) {
				downloadFileName = FilenameUtils.getName(targetFilePath);
				if (downloadFileName.contains("_")) {
					downloadFileName = downloadFileName.substring(downloadFileName.indexOf("_") + 1);
				}
			}

			String realPath = (defaultFilePath + targetFilePath).replace("//", "/").replace("/\\", "/");
			File file = new File(realPath);

			// 20261103 khma : Canonical Path 기반 기본 업로드 디렉토리 탈출 방어 검증
			File baseDir = new File(defaultFilePath).getCanonicalFile();
			File canonicalTarget = file.getCanonicalFile();
			if (!canonicalTarget.getPath().startsWith(baseDir.getPath())) {
				log.warn("비인가 상위 디렉토리 이탈 시도 차단 (Canonical Path Traversal): " + canonicalTarget.getPath());
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.write("<script>alert('비정상적인 파일 경로입니다.'); history.back();</script>");
				out.flush();
				out.close();
				return;
			}
			if (!file.exists() || !file.isFile()) {
				// WebRoot 하위 보조 탐색
				// 20261104 khma : 과거 타임스탬프_파일명 형식으로 저장된 레거시 물리 파일 호환 탐색
				if (StringUtils.isNotEmpty(downloadFileName)) {
					File legacyFile = new File(realPath + "_" + downloadFileName);
					if (legacyFile.exists() && legacyFile.isFile()) {
						file = legacyFile;
					}
				}

				String webRoot = request.getSession().getServletContext().getRealPath("/");
				if (StringUtils.isNotEmpty(webRoot)) {
					File altFile = new File(webRoot + "/FileData/signFile/" + targetFilePath);
					if (altFile.exists() && altFile.isFile()) {
						file = altFile;
					}
				}
			}

			if (!file.exists() || !file.isFile()) {
				response.setContentType("text/html; charset=UTF-8");
				PrintWriter out = response.getWriter();
				out.write("<script>alert('파일이 존재하지 않거나 삭제되었습니다.'); history.back();</script>");
				out.flush();
				out.close();
				return;
			}

			int ifilesize = (int) file.length();
			byte b[] = new byte[8192];
			fis = new FileInputStream(file);
			os = response.getOutputStream();

			String disposition = getDisposition(downloadFileName, getBrowser(request));
			response.reset();
			response.setContentType("application/octet-stream; charset=UTF-8");
			response.setHeader("Content-Disposition", disposition);
			response.setHeader("Content-Length", String.valueOf(ifilesize));
			response.setHeader("Content-Transfer-Encoding", "binary;");
			response.setHeader("Pragma", "no-cache;");
			response.setHeader("Expires", "-1;");

			int read = 0;
			while ((read = fis.read(b)) != -1) {
				os.write(b, 0, read);
			}
			os.flush();
		} catch (Exception e) {
			log.error("신규 파일 다운로드 중 에러 발생", e);
			// 20261104 khma : 다운로드 예외 발생 시 빈 응답 무한 대기 방지 및 alert 안내 스크립트 출력
			if (!response.isCommitted()) {
				try {
					response.reset();
					response.setContentType("text/html; charset=UTF-8");
					PrintWriter out = response.getWriter();
					out.write("<script>alert('파일 다운로드 처리 중 오류가 발생하였습니다.\\n관리자에게 문의해 주십시오.'); history.back();</script>");
					out.flush();
					out.close();
				} catch (Exception ex) {}
			}
		} finally {
			if (os != null) try { os.close(); } catch (Exception e) {}
			if (fis != null) try { fis.close(); } catch (Exception e) {}
		}
	}

	/**
	 * 차세대 안전 파일 삭제 및 휴지통 이동 (/deleteFileSafe)
	 * 파일을 영구 파기하지 않고 휴지통 디렉토리(/FileData/trash/년/월/)로 안전 이동하여 롤백 및 감사 보존을 지원한다.
	 *
	 * @param fid 대상 M_IMAGE_GAL_NO
	 * @param filePath 대상 상대 경로 (fid 부재 시)
	 * @param uid 삭제 요청자 ID
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 * @throws Exception 파일 삭제 및 이동 예외
	 */
	@RequestMapping("/deleteFileSafe")
	public void deleteFileSafe(
			@RequestParam(value = "fid", required = false, defaultValue = "") String fid,
			@RequestParam(value = "filePath", required = false, defaultValue = "") String filePath,
			@RequestParam(value = "uid", required = false, defaultValue = "") String uid,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		Map<String, Object> resultMap = new HashMap<String, Object>();

		try {
			// 20261103 khma : 세션 userInfo 검증 (미인증 삭제 차단)
			HttpSession session = request.getSession(false);
			UserInfo userInfo = null;
			if (session != null) {
				if (session.getAttribute("userInfo") != null) {
					userInfo = (UserInfo) session.getAttribute("userInfo");
				} else if (session.getAttribute("UserInfo") != null) {
					userInfo = (UserInfo) session.getAttribute("UserInfo");
				}
			}
			if (userInfo == null) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "로그인 세션이 만료되었거나 존재하지 않습니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}
			String sessionUid = StringUtils.isNotEmpty(userInfo.getUserNo()) ? userInfo.getUserNo() : userInfo.getUserCode();
			String sessionUsite = StringUtils.isNotEmpty(userInfo.getUsiteNo()) ? userInfo.getUsiteNo() : "";

			// 20261103 khma : fid 식별자 누락 시 삭제 거부 (임의 경로 직접 삭제 방지)
			if (StringUtils.isEmpty(fid)) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "삭제 대상 파일 식별자(fid)가 누락되었습니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}

			// 20261102 khma : D: 드라이브 부재 로컬/VDI 환경 자동 Fallback 지원 기본 업로드 경로 취득
			String defaultFilePath = getBaseUploadPath(request);
			MonArchDaoImpl monArchDao = new MonArchDaoImpl();

			String sql = "SELECT * FROM M_IMAGE_GAL WHERE M_IMAGE_GAL_NO = ?";
			Map<String, Object> mapFileInfo = monArchDao.downloadFile(sql, fid);
			if (mapFileInfo == null || mapFileInfo.isEmpty()) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "삭제 대상 파일 정보가 존재하지 않습니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}

			String fileUsite = (mapFileInfo.get("M_USITE_NO") != null) ? mapFileInfo.get("M_USITE_NO").toString() : "";
			if (StringUtils.isNotEmpty(sessionUsite) && StringUtils.isNotEmpty(fileUsite) && !sessionUsite.equals(fileUsite)) {
				resultMap.put("result", "FAIL");
				resultMap.put("message", "타 사이트 파일에 대한 삭제 권한이 없습니다.");
				out.print(new ObjectMapper().writeValueAsString(resultMap));
				return;
			}

			String targetFilePath = (mapFileInfo.get("FILE_PATH") != null) ? mapFileInfo.get("FILE_PATH").toString() : "";
			if (StringUtils.isNotEmpty(targetFilePath)) {
				String realPath = (defaultFilePath + targetFilePath).replace("//", "/");
				File srcFile = new File(realPath);

				// 20261103 khma : Canonical Path 기반 기본 업로드 디렉토리 탈출 방어 검증
				File baseDir = new File(defaultFilePath).getCanonicalFile();
				File canonicalSrc = srcFile.getCanonicalFile();
				if (!canonicalSrc.getPath().startsWith(baseDir.getPath())) {
					resultMap.put("result", "FAIL");
					resultMap.put("message", "비정상적인 파일 경로입니다. (디렉토리 이탈)");
					out.print(new ObjectMapper().writeValueAsString(resultMap));
					return;
				}

				if (!srcFile.exists() || !srcFile.isFile()) {
					// 20261104 khma : 과거 타임스탬프_파일명 형식으로 저장된 레거시 물리 파일 호환 탐색
					String legacyName = (mapFileInfo.get("FILE_NAME") != null) ? mapFileInfo.get("FILE_NAME").toString() : "";
					if (StringUtils.isNotEmpty(legacyName)) {
						File legacySrc = new File(realPath + "_" + legacyName);
						if (legacySrc.exists() && legacySrc.isFile()) {
							srcFile = legacySrc;
						}
					}
				}

				if (srcFile.exists() && srcFile.isFile()) {
					Calendar calendar = Calendar.getInstance();
					String trashFolder = defaultFilePath + "/trash/" + calendar.get(Calendar.YEAR) + "/" + String.format("%02d", calendar.get(Calendar.MONTH) + 1);
					File trashDir = new File(trashFolder);
					if (!trashDir.isDirectory()) {
						trashDir.mkdirs();
					}
					File destFile = new File(trashFolder + "/" + System.currentTimeMillis() + "_" + srcFile.getName());
					// 20261103 khma : renameTo 성공 여부 확인 및 실패 시 FileUtils Fallback
					boolean isMoved = srcFile.renameTo(destFile);
					if (!isMoved) {
						try {
							org.apache.commons.io.FileUtils.moveFile(srcFile, destFile);
							isMoved = true;
						} catch (Exception eMove) {
							log.warn("FileUtils.moveFile 실패: " + eMove.getMessage());
						}
					}
					if (!isMoved) {
						log.error("물리 파일 휴지통 이동 실패로 DB 삭제 중단: " + srcFile.getAbsolutePath());
						resultMap.put("result", "FAIL");
						resultMap.put("message", "물리 파일 이동에 실패하여 삭제 처리를 안전하게 중단하였습니다.");
						out.print(new ObjectMapper().writeValueAsString(resultMap));
						return;
					}
				}

				// 20261103 khma : DB 행 완전 삭제 대신 소프트 삭제(USE_YN='N', DEL_DATE=SYSDATE, DEL_USER) 적용
				String delSql = "UPDATE M_IMAGE_GAL "
						+ "   SET USE_YN = 'N', "
						+ "       DEL_DATE = SYSDATE, "
						+ "       DEL_USER = @DEL_USER@, "
						+ "       UPD_DATE = SYSDATE, "
						+ "       UPD_USER = @DEL_USER@ "
						+ " WHERE M_IMAGE_GAL_NO = @M_IMAGE_GAL_NO@";
				Map<String, String> delParam = new HashMap<String, String>();
				delParam.put("M_IMAGE_GAL_NO", fid);
				delParam.put("DEL_USER", sessionUid);
				monArchDao.exeUpdate(delSql, delParam);
			}

			resultMap.put("result", "OK");
		} catch (Exception e) {
			log.error("파일 안전 삭제 중 에러 발생", e);
			resultMap.put("result", "FAIL");
			// 20261104 khma : 내부 시스템 에러 메시지(e.getMessage) 노출 차단
			/*
			resultMap.put("message", e.getMessage());
			*/
			resultMap.put("message", "파일 삭제 처리 중 오류가 발생하였습니다.");
		} finally {
			// 20261104 khma : out null-safe 출력 및 닫기
			if (out != null) {
				try {
					out.print(new ObjectMapper().writeValueAsString(resultMap));
					out.flush();
					out.close();
				} catch (Exception ex) {}
			}
		}
	}

	// 20261102 khma Start : 물리 파일 업로드 기본 경로 취득 (D: 드라이브 미존재 로컬/VDI 환경 자동 Fallback 지원)
	/**
	 * 물리 파일 업로드 기본 경로를 취득한다.
	 * monarch.fileupload.path 설정 경로의 루트 드라이브가 존재하지 않는 경우(예: D: 드라이브 없는 VDI 개발환경)
	 * 서블릿 컨텍스트(ServletContext) 루트 하위 /FileData/signFile/ 로 자동 Fallback하여 물리 파일 저장 실패를 원천 방지한다.
	 *
	 * @param request HttpServletRequest
	 * @return 정제된 물리 디렉토리 기본 경로 (끝에 '/' 포함)
	 */
	private String getBaseUploadPath(HttpServletRequest request) {
		ConfigProperties configProperties = ConfigProperties.getInstance();
		String defaultFilePath = configProperties.getProperty("monarch.fileupload.path");
		if (StringUtils.isEmpty(defaultFilePath)) {
			defaultFilePath = configProperties.getProperty("monarch.url.realpath");
			if (StringUtils.isNotEmpty(defaultFilePath)) {
				defaultFilePath += "/FileData/signFile/";
			}
		}

		boolean isPathValid = false;
		if (StringUtils.isNotEmpty(defaultFilePath)) {
			try {
				File testFile = new File(defaultFilePath);
				File[] roots = File.listRoots();
				boolean rootDriveExists = false;
				String testPathUpper = testFile.getAbsolutePath().toUpperCase();
				if (roots != null) {
					for (File r : roots) {
						if (testPathUpper.startsWith(r.getAbsolutePath().toUpperCase())) {
							rootDriveExists = true;
							break;
						}
					}
				}
				if (rootDriveExists) {
					if (!testFile.exists()) {
						testFile.mkdirs();
					}
					if (testFile.exists() && testFile.canWrite()) {
						isPathValid = true;
					}
				}
			} catch (Exception e) {
				log.warn("설정된 파일 경로(" + defaultFilePath + ") 유효성 검증 실패: " + e.getMessage());
			}
		}

		// D: 드라이브 미존재 등으로 경로가 유효하지 않은 경우 ServletContext 하위로 자동 Fallback
		if (!isPathValid) {
			try {
				String webRoot = request.getSession().getServletContext().getRealPath("/");
				if (StringUtils.isNotEmpty(webRoot)) {
					File fallbackDir = new File(webRoot, "FileData/signFile");
					if (!fallbackDir.exists()) {
						fallbackDir.mkdirs();
					}
					defaultFilePath = fallbackDir.getAbsolutePath().replace("\\", "/");
					log.info("로컬/VDI 환경 자동 Fallback 파일 저장 경로 적용: " + defaultFilePath);
				}
			} catch (Exception e) {
				log.error("ServletContext getRealPath Fallback 경로 취득 실패", e);
			}
		}

		if (StringUtils.isNotEmpty(defaultFilePath) && !defaultFilePath.endsWith("/")) {
			defaultFilePath += "/";
		}
		return defaultFilePath;
	}
	// 20261102 khma End : 물리 파일 업로드 기본 경로 취득

	// 20261102 khma End : 차세대 드래그앤드롭 파일 시스템 신규 엔드포인트 (/uploadFileNew, /downloadFileNew, /deleteFileSafe)

}
