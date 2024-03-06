package co.kr.kydbm.core.bean;

import java.io.Serializable;

/**
 *  서비스 정보 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class ServiceInfo implements Serializable{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7695413001688743288L;
	
	/* 메소드 */
	private String SvcID;
	/* 쿼리설명 */
	private String SvcDesc;
	/* 쿼리문 */
	private String Sql;
	/* 실행방식 */
	private String JobType;
	/* ??? */
	private String Conn;
	/* 대상테이블명 */
	private String TbName;
	
	/* 쿼리실행 대상 DB (Datasource) */
	private String targetDatasource;
	
	public String getTargetDatasource() {
		return targetDatasource;
	}
	public void setTargetDatasource(String targetDatasource) {
		this.targetDatasource = targetDatasource;
	}
	public String getTbName() {
		return TbName;
	}
	public void setTbName(String tbName) {
		TbName = tbName;
	}
	public String getSvcID() {
		return SvcID;
	}
	public void setSvcID(String svcID) {
		SvcID = svcID;
	}
	public String getSvcDesc() {
		return SvcDesc;
	}
	public void setSvcDesc(String svcDesc) {
		SvcDesc = svcDesc;
	}
	public String getSql() {
		return Sql;
	}
	public void setSql(String sql) {
		Sql = sql;
	}
	public String getJobType() {
		return JobType;
	}
	public void setJobType(String jobType) {
		JobType = jobType;
	}
	public String getConn() {
		return Conn;
	}
	public void setConn(String conn) {
		Conn = conn;
	}
	@Override
	public String toString() {
		return "ServiceInfo [SvcID=" + SvcID + ", SvcDesc=" + SvcDesc
				+ ", Sql=" + Sql + ", JobType=" + JobType + ", Conn=" + Conn
				+ ", TbName=" + TbName + ", targetDatasource="
				+ targetDatasource + "]";
	}

}
