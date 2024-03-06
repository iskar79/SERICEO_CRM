package co.kr.kydbm.core.meta;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.QueryGenerator;


/**
 *  공통코드 관리 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class MetaCommCode {
	
	private static Hashtable<String, List<Map<String,Object>>> commonCode = new Hashtable<String, List<Map<String, Object>>>();
	private static Logger log = Logger.getLogger(MetaCommCode.class.getName());
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");
	
	/**
	 * 공통코드 정보를 메모리에 적재하는 처리
	 */
	public synchronized static void init() {
		
		if(commonCode.size() > 0){
			commonCode.clear();
		}
		log.info( "***** 공통 코드 메모리 적재 시작 *****");
		String comCodeSql = getCommcodeSql();
		Map<String, String> parameters = new HashMap<String, String>();
		
		try{
			List<Map<String,Object>> collection = null;
			String pcode = "";
			
			List<Map<String, Object>> dataList = null;
			Map<String, Object> data =null;
			//공통코드 취득
			MonArchDaoImpl monArchDaoImpl = new MonArchDaoImpl();
			dataList = monArchDaoImpl.exeRead(comCodeSql, parameters);
			String key="";
						
			for(int i =0; i < dataList.size(); i++){
				//코드정보를 해쉬테이블에 격납
				data = (Map<String, Object>) dataList.get(i);
				key = CommonUtil.nvl(data.get("CODE_GRP").toString(),null);
				
				if(!pcode.equals(key)){
					if( collection != null ){
						commonCode.put(pcode, collection);
					}
					collection = new ArrayList<Map<String,Object>>();
					pcode = key;
				}
				collection.add(data);
			}
			
			if(collection != null && collection.size() > 0) {
				commonCode.put(pcode, collection);
			}
			
		}catch(Exception ex){
			ex.printStackTrace();
			log.error( "공통 코드 정보를 메모리에 적재시 오류가 발생 하였습니다.",ex);
		}finally{
			log.info( "***** 공통 코드 메모리 적재 종료 *****");
		}
	}
	
	private static String getCommcodeSql(){
		StringBuffer sb = new StringBuffer();
		//2013-12-17 khma : db분기처리
		sb.append("	SELECT M_COMM_CODE_NO,CODE_GRP, UPPER_CODE_GRP AS UPCODE, " +
				QueryGenerator.genNvlStmt(DB_TYPE, "CODE_VAL", " ","string", false) +" AS CODE, LANG_CODE, " +
				QueryGenerator.genNvlStmt(DB_TYPE, "CODE_NAME", " ", "string",false) +" AS DECODE, " +
				QueryGenerator.genNvlStmt(DB_TYPE, "CODE_NAME2", " ","string", false) +" AS CODE_NAME2, " +
				QueryGenerator.genNvlStmt(DB_TYPE, "CODE_NAME3", " ","string", false) +" AS CODE_NAME3, " +
				QueryGenerator.genNvlStmt(DB_TYPE, "SORT_NO", "0","int", false) +" AS SORT_NO ");
		sb.append( ",USE_FLAG,M_USITE_NO,REG_DATE,REG_USER,UPD_DATE,UPD_USER ");
//		sb.append( " from 공통코드 where 사용여부='1'  order by 공통코드분류, LANG, 정렬순서");
		sb.append( " from M_COMM_CODE where USE_FLAG='1'  order by CODE_GRP, LANG_CODE, SORT_NO");
		return sb.toString();
	}
	
	/**
	 * 공통코드목록 취득
	 * @param key		공통코드
	 * @param lang		언어코드
	 * @return
	 */
	public static List<Map<String,Object>> getCodeList(String key, String lang, String usite){
		List<Map<String,Object>>  targetList = commonCode.get(key);
		List<Map<String,Object>>  rstList = new ArrayList<Map<String,Object>>();
		
		for (Map<String, Object> map : targetList) {
			if(lang.equals(map.get("LANG_CODE").toString()) && usite.equals(map.get("M_USITE_NO").toString())){
				rstList.add(map);
			}else if(lang.equals(map.get("LANG_CODE").toString()) && CommonConst.MON_SYSTEM_USITE_ID.equals(map.get("M_USITE_NO").toString())){
				//설정된 USITE에 데이터가 존재하지 않으면 공통코드(usite: 1)로 검색을 행한다.
				rstList.add(map);
			}
		}
//		return commonCode.get(key);
		return rstList;
	}
	
	/**
	 * 공통코드 취득
	 * @param key		공통코드
	 * @param lang		언어코드
	 * @return
	 */
	public static String getCodeName(String codeGbn, String key, String lang){
		List<Map<String,Object>>  targetList = commonCode.get(codeGbn);
		String rstCode = "";
		if(null != targetList){
			for (Map<String, Object> map : targetList) {
				if( lang.equals(map.get("LANG_CODE").toString()) 
						&& key.equals(map.get("CODE").toString()) ){
						rstCode = map.get("DECODE").toString();
				}
			}
		}
		return rstCode;
	}
}
