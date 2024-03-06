package co.kr.kydbm.core.bean;

import java.io.Serializable;
import java.util.Date;

/**
 *  서비스 정보 클래스
 * @author Noh Eunhye
 * @version 1.0.0 2014-03-17
 * @since version 1.0.0
 */
public class UserInfo implements Serializable{
	
	private static final long serialVersionUID = 7695413001688743288L;

	private String userNo;       /* userNo */
	private String userCode;     /* userCode */
	private String userName;     /* userName */
	private String authtime;     /* authtime */
	private String duplLoginYn;  /* duplLoginYn */
	private String userLang;     /* userLang */
	private String siteLogo;     /* siteLogo  */
	private String gSite;     	 /* gSite  */
	private String theme;        /* theme */
	private String deptNo;       /* deptNo */
	private String deptName;     /* deptName */
	private String usiteNo;
	private String usiteCode;
	/**
	 * @return the usiteCode
	 */
	public String getUsiteCode() {
		return usiteCode;
	}
	/**
	 * @param usiteCode the usiteCode to set
	 */
	public void setUsiteCode(String usiteCode) {
		this.usiteCode = usiteCode;
	}

	private int    dvLevel;      /* 개발자 레벨 */
	private int    connDur;      /* 접속시간 : CONN_DUR */
	private String menuPosition; // 메뉴 위치
	private Date pwUpdDate; /*  비밀번호 변경일 */
	private boolean isLogined = false; /*  로그 */

	private String corp;       	/* corp */
	private String corpNm;      /* corpNm */
	private String tCorp;       /* tCorp */
	private String tCorpNm;     /* tCorpNm */
	
	/**
	 * @return the isLogined
	 */
	public boolean isLogined() {
		return isLogined;
	}
	/**
	 * @param isLogined the isLogined to set
	 */
	public void setLogined(boolean isLogined) {
		this.isLogined = isLogined;
	}
	/**
	 * @return the pwUpdDate
	 */
	public Date getPwUpdDate() {
		return pwUpdDate;
	}
	/**
	 * @param pwUpdDate the pwUpdDate to set
	 */
	public void setPwUpdDate(Date pwUpdDate) {
		this.pwUpdDate = pwUpdDate;
	}
	public String getUserNo() {
		return userNo;
	}
	public void setUserNo(String userNo) {
		this.userNo = userNo;
	}
	public String getUserCode() {
		return userCode;
	}
	public void setUserCode(String userCode) {
		this.userCode = userCode;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getAuthtime() {
		return authtime;
	}
	public void setAuthtime(String authtime) {
		this.authtime = authtime;
	}
	public String getDuplLoginYn() {
		return duplLoginYn;
	}
	public void setDuplLoginYn(String duplLoginYn) {
		this.duplLoginYn = duplLoginYn;
	}
	public String getUserLang() {
		return userLang;
	}
	public void setUserLang(String userLang) {
		this.userLang = userLang;
	}
	public String getSiteLogo() {
		return siteLogo;
	}
	public void setSiteLogo(String siteLogo) {
		this.siteLogo = siteLogo;
	}
	public String getGSite() {
		return gSite;
	}
	public void setGSite(String gSite) {
		this.gSite = gSite;
	}
	public String getTheme() {
		return theme;
	}
	public void setTheme(String theme) {
		this.theme = theme;
	}
	public String getDeptNo() {
		return deptNo;
	}
	public void setDeptNo(String deptNo) {
		this.deptNo = deptNo;
	}
	public String getDeptName() {
		return deptName;
	}
	public void setDeptName(String deptName) {
		this.deptName = deptName;
	}
	public String getUsiteNo() {
		return usiteNo;
	}
	public void setUsiteNo(String usiteNo) {
		this.usiteNo = usiteNo;
	}
	public int getConnDur() {
		return connDur;
	}
	public void setConnDur(int connDur) {
		this.connDur = connDur;
	}
	public String getMenuPosition() {
		return menuPosition;
	}
	public void setMenuPosition(String menuPosition) {
		this.menuPosition = menuPosition;
	}
	public int getDvLevel() {
		return dvLevel;
	}
	public void setDvLevel(int dvLevel) {
		this.dvLevel = dvLevel;
	}

	public String getCorp() {
		return corp;
	}
	public void setCorp(String corp) {
		this.corp = corp;
	}
	public String getCorpNm() {
		return corpNm;
	}
	public void setCorpNm(String corpNm) {
		this.corpNm = corpNm;
	}
	public String getTCorp() {
		return corp;
	}
	public void setTCorp(String tCorp) {
		this.corp = tCorp;
	}
	public String getTCorpNm() {
		return tCorpNm;
	}
	public void setTCorpNm(String tCorpNm) {
		this.tCorpNm = tCorpNm;
	}
	
	
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("UserInfo [userNo=");
		builder.append(userNo);
		builder.append(", userCode=");
		builder.append(userCode);
		builder.append(", userName=");
		builder.append(userName);
		builder.append(", authtime=");
		builder.append(authtime);
		builder.append(", duplLoginYn=");
		builder.append(duplLoginYn);
		builder.append(", userLang=");
		builder.append(userLang);
		builder.append(", siteLogo=");
		builder.append(siteLogo);
		builder.append(", gSite=");
		builder.append(gSite);
		builder.append(", theme=");
		builder.append(theme);
		builder.append(", deptNo=");
		builder.append(deptNo);
		builder.append(", deptName=");
		builder.append(deptName);
		builder.append(", usiteNo=");
		builder.append(usiteNo);
		builder.append(", dvLevel=");
		builder.append(dvLevel);
		builder.append(", connDur=");
		builder.append(connDur);
		builder.append(", menuPosition=");
		builder.append(menuPosition);
		builder.append(", pwUpdDate=");
		builder.append(pwUpdDate);	
		builder.append(", corp=");
		builder.append(corp);	
		builder.append(", corpNm=");
		builder.append(corpNm);		
		builder.append(", tCorp=");
		builder.append(tCorp);	
		builder.append(", tCorpNm=");
		builder.append(tCorpNm);	
		builder.append("]");
		return builder.toString();
	}
	
}
