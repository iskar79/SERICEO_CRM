package co.kr.kydbm.core.bean;

import java.io.Serializable;

import org.apache.commons.lang.StringUtils;

/**
 * 결과 정보 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-11-30
 * @since version 1.0.0
 */
public class ResultInfo implements Serializable{

	private static final long serialVersionUID = 6239194500658630023L;
	
	
	
	/** 결과여부 */
	private String result; 
	
	/** 에러타입 */
	private String errorCode; 
	
	/** 익셉션메세지 */
	private String exceptionMsg;
	
	/** 출력용 메세지 */
	private String message;
	
	/** JobType */
	private String jobType;
	
	/** 화면메뉴ID */
	private String menuId;

	
	/**
	 * 결과 정보 생성자
	 */
	public ResultInfo() {
		
	}
	
	/**
	 * 결과 정보 생성자
	 * @param result 결과
	 * @param message 메세지
	 */
	public ResultInfo( String result, String message ) {
		if( StringUtils.isNotEmpty(result)) this.result = result;
		if( StringUtils.isNotEmpty(message)) this.message = message;
	}
	
	/**
	 * 결과 정보 생성자
	 * @param result 결과
	 * @param message 메세지
	 */
	public ResultInfo( String result ) {
		if( StringUtils.isNotEmpty(result)) this.result = result;
	}
	
	/**
	 * 결과 정보 생성자
	 * @param result
	 * @param errorCode
	 * @param message
	 */
	public ResultInfo( String result, String errorCode, String message ) {
		if( StringUtils.isNotEmpty(result)) this.result = result;
		if( StringUtils.isNotEmpty(errorCode)) this.errorCode = errorCode;
		if( StringUtils.isNotEmpty(message)) this.message = message;
	}
	
	
	/**
	 * 결과 정보 생성자
	 * @param result
	 * @param errorCode
	 * @param exceptionMsg
	 * @param message
	 */
	public ResultInfo( String result, String errorCode, String message , String exceptionMsg) {
		if( StringUtils.isNotEmpty(result)) this.result = result;
		if( StringUtils.isNotEmpty(errorCode)) this.errorCode = errorCode;
		if( StringUtils.isNotEmpty(exceptionMsg)) this.exceptionMsg = exceptionMsg;
		if( StringUtils.isNotEmpty(message)) this.message = message;
	}
	
	
	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public String getExceptionMsg() {
		return exceptionMsg;
	}

	public void setExceptionMsg(String exceptionMsg) {
		this.exceptionMsg = exceptionMsg;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
	
	public String getJobType() {
		return jobType;
	}

	public void setJobType(String jobType) {
		this.jobType = jobType;
	}
	
	public String getMenuId() {
		return menuId;
	}

	public void setMenuId(String menuId) {
		this.menuId = menuId;
	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("ResultInfo [result=");
		builder.append(result);
		builder.append(", errorCode=");
		builder.append(errorCode);
		builder.append(", exceptionMsg=");
		builder.append(exceptionMsg);
		builder.append(", message=");
		builder.append(message);
		builder.append(", jobType=");
		builder.append(jobType);
		builder.append(", menuId=");
		builder.append(menuId);
		builder.append("]");
		return builder.toString();
	}
}
