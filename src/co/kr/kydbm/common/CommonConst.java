package co.kr.kydbm.common;

/**
 *  공통 상수 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public final class CommonConst {

	/** 모나크 시스템 상수 **/
	public static final String MON_COMMON = "MON_COMMON";
	public static final String MON_SYSTEM_USITE_ID = "1";
	public static final String PROP_DB_TYPE = "monarch.db.type"; //모나크 속성파일에서의 DB취득 상수
	
	public static final String COMM_ERROR_MESSAGE = "예상치 못한 에러가 발생하였습니다. \r 관리자에게 문의하여 주십시오.";
	
	/**  다이렉트(SMTP)메일 상태코드  **/
	public enum SMTP_INDV_STATE {
		STANDBY("00"), //발송대기
		SEND_SUCCESS("10"),  //발송성공
		SEND_FAIL("90") //발송실패
		;
		
		private String data;
		
		SMTP_INDV_STATE(String data) {
			this.data = data;
		}
		public String getVal() {
			return this.data;
		}
	}
	
	
	/**  모나크 기동 DB타입 **/
	public enum DB_TYPE {
		ORACLE("oracle"), 
		MSSQL("mssql"), 
		POSTGRESQL("postgresql"),
		MARIADB("mariadb"),
		MYSQL("mysql"),
		DB2("db2")
		;
		
		private String data;
		
		DB_TYPE(String data) {
			this.data = data;
		}
		public String getVal() {
			return this.data;
		}
	}
	
	/**  쿼리 실행 타입 **/
	public enum QUERY_TYPE {
		LIST,
		READ,
		CREATEIDENTITY, 
		CREATE,
		UPDATE,
		DELETE,
		EXCEL_IMPORT,
		QUERY,
		P_READ
	}
	
	/*******************************************/
	/**		 공통으로 사용되는 ENUM및 상수  **/
	/*******************************************/
	/** 처리 결과상수 **/
	public static final String SUCCESS = "SUCCESS";
	public static final String FAIL = "FAIL";
	
	//데이터 업로드 결과 해쉬테이블
	public static final String RESULT = "RESULT";
	public static final String COLNAME = "COLNAME";
	public static final String MESSAGE = "MESSAGE";
	public static final String ERRTYPE = "ERRTYPE";
	
	/** 처리 결과 반환 키 **/
	public static final String RESULT_INFO = "resultInfo";
	public static final String RESULT_DATA = "resultData";
	
	/** 공통 Seperator**/
	public static final String COMA = ",";
	
	public enum DATA_UPLOAD_ERRTYPE {
    NO_EXIST 				//존재하지 않음
    ,INCORRECT_TYPE_DATE	//날짜 포멧이 부정확함.
    ,INCORRECT_TYPE_NO		//숫자포멧이 부정확함.
    ,ETC		//그외
}

	public enum DELE_FLAG {
		YES("1"),  //사용
		NO("0"); //삭제/사용안함
		
		private String data;
		
		DELE_FLAG(String data) {
			this.data = data;
		}
		public String getVal() {
			return this.data;
		}
	}

	//공통셀값  취득시 사용하는 공통코드
	public enum XLS_GETCELL_OPT{
		TYPE_DATE
		,TYPE_NUMBER
	}
	//액셀 캐스팅에 사용하는 숫자형 타입
	public enum XLS_NUMBER_TYPE{
		FLOAT,
		INTEGER,
		LONG,
		DOUBLE
	}
	
	//액셀 캐스팅에 사용하는 숫자형 타입
	public enum XLS_TYPE{
		REPORT("report"),
		DATA("data");
		
		private String value;
		
		XLS_TYPE(String data) {
			this.value = data;
		}
		public String getVal() {
			return this.value;
		}
	}
	
	/**
	 * 액셀(데이터)업로드 파일 확장자 화이트리스트
	 * @author KyoungHo_Ma
	 *
	 */
	/* 액셀(데이터)업로드 파일 확장자 화이트리스트 */
	public static final String[] XLS_UPLOAD_WHITE_LIST = { "XLS", "XLSX" };
	/* 파일 업로드 확장자 화이트리스트 */
	public static final String[] FILE_UPLOAD_WHITE_LIST = { "ALZ","BMP","DOC","HWP","JPG","PDF","PNG","PPT","XLS","XLSX","ZIP" };
	
	/**
	 * 언어 구분코드
	 * @author KyoungHo_Ma
	 *
	 */
	public enum LANG_CODE {
		KOREAN("ko"), 
		ENGLISH("en"), 
		JAPANESE("ja"),
		CHINESE("ch"), 
		DEFAULT("ko"); //기타 디폴트는 ko모드
		
		private String data;
		
		LANG_CODE(String data) {
			this.data = data;
		}
		public String getVal() {
			return this.data;
		}
	}
	
	
	/**
	 * 클라이언트 사용여부
	 * @author KyoungHo_Ma
	 *
	 */
	public enum UI_USE_FLAG {
		USE("1"), //사용
		NOT_USE("0"); //미사용
		
		private String data;
		
		UI_USE_FLAG(String data) {
			this.data = data;
		}
		public String getVal() {
			return this.data;
		}
	}
}
