package co.kr.kydbm.core.bean;

import java.util.ArrayList;
import java.util.Map;

import co.kr.kydbm.common.CommonConst.DB_TYPE;
import co.kr.kydbm.core.utils.MonarchSecurity;

/**
 * Excel Import 전용 Bean
 * @author KyoungHo_Ma
 *
 */
public class ExcelImportBean {
	
	private String allowError;
	private String execRowCount;
	private String tableName;
	private ArrayList<Map<String, String>> keyCols;
	private ArrayList<Map<String, String>> createCols;
	private ArrayList<Map<String, String>> updateCols;
	public String getAllowError() {
		return allowError;
	}
	public void setAllowError(String allowError) {
		this.allowError = allowError;
	}
	public String getExecRowCount() {
		return execRowCount;
	}
	public void setExecRowCount(String execRowCount) {
		this.execRowCount = execRowCount;
	}
	public String getTableName() {
		return MonarchSecurity.makeSecureString(tableName, 0);
	}
	public void setTableName(String tableName) {
		this.tableName = tableName;;
	}
	
	public String getSeqColName() {
		return tableName + "_SEQ";
	}
	
	
	public ArrayList<Map<String, String>> getKeyCols() {
		return keyCols;
	}
	public void setKeyCols(ArrayList<Map<String, String>> keyCols) {
		this.keyCols = keyCols;
	}
	public ArrayList<Map<String, String>> getCreateCols() {
		return createCols;
	}
	public void setCreateCols(ArrayList<Map<String, String>> createCols) {
		this.createCols = createCols;
	}
	public ArrayList<Map<String, String>> getUpdateCols() {
		return updateCols;
	}
	public void setUpdateCols(ArrayList<Map<String, String>> updateCols) {
		this.updateCols = updateCols;
	}
	
	
	/**
	 * Insert문생성하여 반환 
	 * @return
	 */
	public String getCreateSql(String dbType) {
		StringBuffer sb = new StringBuffer();
		String cols ="";
		String vals = "";
		
		for (int i = 0; i < createCols.size(); i++) {
			if( i== 0) {
				if(dbType.equals(DB_TYPE.ORACLE.getVal())) {
					cols =  keyCols.get(i).get("name");
					cols = MonarchSecurity.makeSecureString(cols, 0);
					vals = getSeqColName() + ".NEXTVAL ";
				}
			}
			
			if(i > 0 || (i==0 && dbType.equalsIgnoreCase(DB_TYPE.ORACLE.getVal()))){
					cols+= ",";
					vals+= ",";
			} 
			
			cols +=  MonarchSecurity.makeSecureString( createCols.get(i).get("name"), 0);
			vals += MonarchSecurity.makeSecureString( createCols.get(i).get("field"), 0);
		}
		sb.append(" INSERT INTO  ");
		sb.append(tableName).append(" ( ");
		//t대상컬럼명 셋팅
		sb.append(cols);
		sb.append(" ) VALUES ( ");
		// 벨류값 셋팅
		sb.append(vals);
		sb.append(" ) ");

		return sb.toString();
	}

	/**
	 * Update문생성하여 반환
	 * @return
	 */
	public String getUpdateSql(String dbType) {
			//TODO 업데이터 문 생성하기~
		StringBuffer sb = new StringBuffer();
		String vals = "";
		
		sb.append(" UPDATE ");
		sb.append(tableName).append(" SET ");
		for (int i = 0; i < updateCols.size(); i++) {
			if(i > 0){
				sb.append(" , ");
			}
			sb.append( MonarchSecurity.makeSecureString( updateCols.get(i).get("name"),0) );
			sb.append(" = ");
			sb.append( MonarchSecurity.makeSecureString( updateCols.get(i).get("field"),0) );
		}
		sb.append(" WHERE ");
		for (int i = 0; i < keyCols.size(); i++) {
			if(i > 0){
				sb.append(" AND ");
			}
			sb.append( MonarchSecurity.makeSecureString( keyCols.get(i).get("name"), 0 ) );
			sb.append(" = ");
			sb.append( MonarchSecurity.makeSecureString( keyCols.get(i).get("field"), 0 ) );
		}

		return sb.toString();
	}
	
}
