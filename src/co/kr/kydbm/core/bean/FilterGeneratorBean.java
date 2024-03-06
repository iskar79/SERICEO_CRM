package co.kr.kydbm.core.bean;

import java.io.Serializable;

/**
 *  확장필드용 Bean 정보 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2013-11-07
 * @since version 1.0.0
 */
public class FilterGeneratorBean implements Serializable{
	
	private static final long serialVersionUID = -7432244503210369266L;
	
	private String label; //라벨
	private String field; //데이터/쿼리 바인딩용 필드명
	private String type;  //표시타입
	private String operators;  //확장필드 오퍼레이션
	private String values;  //확장필드 값
	private String codes; //select요소 코드
	
	
	public String getLabel() {
		return label;
	}
	public void setLabel(String label) {
		this.label = label;
	}
	public String getField() {
		return field;
	}
	public void setField(String field) {
		this.field = field;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getOperators() {
		return operators;
	}
	public void setOperators(String operators) {
		this.operators = operators;
	}
	public String getValues() {
		return values;
	}
	public void setValues(String values) {
		this.values = values;
	}
	public String getCodes() {
		return codes;
	}
	public void setCodes(String codes) {
		this.codes = codes;
	}
	@Override
	public String toString() {
		return "FilterGeneratorBean [label=" + label + ", field=" + field
				+ ", type=" + type + ", operators=" + operators + ", values="
				+ values + ", codes=" + codes + "]";
	}
    
	

}
