package co.kr.kydbm.core.filecontrol;

/**
 *  데이터 업로드 결과값 반환 Bean클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */

public class DataUploadResultBean {
	
	/* 업로드 최종결과 */
	private String RESULT;
	
	/* 결과 메세지 */
	private String MESSAGE;
	
	/* 에러 타입 */
	private String ERRTYPE;
	
	/* 에러등의 원인이 되는 컬럼 */
	private String COLNAME;

	/**
	 * @return the rESULT
	 */
	public String getRESULT() {
		return RESULT;
	}

	/**
	 * @param rESULT the rESULT to set
	 */
	public void setRESULT(String rESULT) {
		RESULT = rESULT;
	}

	/**
	 * @return the mESSAGE
	 */
	public String getMESSAGE() {
		return MESSAGE;
	}

	/**
	 * @param mESSAGE the mESSAGE to set
	 */
	public void setMESSAGE(String mESSAGE) {
		MESSAGE = mESSAGE;
	}

	/**
	 * @return the eRRTYPE
	 */
	public String getERRTYPE() {
		return ERRTYPE;
	}

	/**
	 * @param eRRTYPE the eRRTYPE to set
	 */
	public void setERRTYPE(String eRRTYPE) {
		ERRTYPE = eRRTYPE;
	}

	/**
	 * @return the cOLNAME
	 */
	public String getCOLNAME() {
		return COLNAME;
	}

	/**
	 * @param cOLNAME the cOLNAME to set
	 */
	public void setCOLNAME(String cOLNAME) {
		COLNAME = cOLNAME;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "DataUploadResultBean [RESULT=" + RESULT + ", MESSAGE="
				+ MESSAGE + ", ERRTYPE=" + ERRTYPE + ", COLNAME=" + COLNAME
				+ "]";
	}
	
	
	
	
	

}
