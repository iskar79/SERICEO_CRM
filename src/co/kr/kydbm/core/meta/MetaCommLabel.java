package co.kr.kydbm.core.meta;

import java.util.HashMap;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonConst.LANG_CODE;
import co.kr.kydbm.common.CommonConst.UI_USE_FLAG;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.dao.MonArchDaoImpl;


/**
 *  공통라벨 관리 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-06
 * @since version 1.0.0
 */
public class MetaCommLabel {
	
//	private static Hashtable<String, Map<String, Map<String,Object>>> commonLabel = new Hashtable<String, Map<String, Map<String, Object>>>();
	private static Hashtable<String, Map<String, String>> commonLabel = new Hashtable<String, Map<String , String>>();
	private static Logger log = Logger.getLogger(MetaCommLabel.class.getName());

	/**
	 * 공통라벨 정보를 메모리에 적재하는 처리
	 */
	public synchronized static void init() {
		
		if(commonLabel.size() > 0){
			commonLabel.clear();
		}
		log.info( "***** 공통 라벨 메모리 적재 시작 *****");
		String comLabelSql = getCommLabelSql();
		Map<String, String> parameters = new HashMap<String, String>();
		
		try{
//			Map<String, Map<String,Object>> collection = null;
			Map<String, String> collection = null;
			String langCode = "";
			
			List dataList = null;
			LinkedList<Map<String, Object>> dataListForClient = new LinkedList<Map<String, Object>>();
			Map<String, Object> mapData =null; //최상위 라벨 코드 맵
			//공통코드 취득
			MonArchDaoImpl monArchDaoImpl = new MonArchDaoImpl();
			dataList = monArchDaoImpl.exeRead(comLabelSql, parameters);
			
			String key="";
			for(int i =0; i < dataList.size(); i++){
				//라벨정보를 해쉬테이블에 격납 Start
				mapData = (Map<String, Object>) dataList.get(i);
				String labelCode = mapData.get("LABEL_CODE").toString();
				key = CommonUtil.nvl(mapData.get("LANG_CODE").toString(), LANG_CODE.DEFAULT.getVal());
				if(!langCode.equals(key)){
					//언어코드가 변경될때
					if( collection != null ){
						commonLabel.put(langCode, collection);
					}
//					collection = new HashMap<String, Map<String,Object>>();
					collection = new HashMap<String, String>();
					langCode = key;
				}
				collection.put(labelCode, mapData.get("LABEL_NAME").toString());
				//라벨정보를 해쉬테이블에 격납 End
				
				//클라이언트 사용플러그가 1이면 파일데이터로 셋팅
				if(null != mapData.get("UI_USE_FLAG") && (UI_USE_FLAG.USE.getVal()).equals(mapData.get("UI_USE_FLAG").toString())){
					dataListForClient.add(mapData);
				}
				
			}
			if(collection != null && collection.size() > 0) {
				commonLabel.put(langCode, collection);  //메모리에 적재함
				makeClientDataFile(dataListForClient); // 파일로 저장
			}
			//TODO 클라이언트용 경랑파일 생성
			//makeClientDataFile(dataListForClient);
			
		}catch(Exception ex){
			ex.printStackTrace();
			log.error("공통 라벨 정보를 메모리에 적재시 오류가 발생 하였습니다.",ex);
		}finally{
			log.info("***** 공통 라벨 메모리 적재 종료 *****");
		}
	}
	
	/**
	 * 클라이언트에 사용될 라벨 정보파일 생성
	 * @param dataListForClient
	 */
	private static boolean makeClientDataFile(
			LinkedList<Map<String, Object>> dataListForClient) {

		boolean rstFlag = true;

		//*데이터는 원칙적으로 언어코드로 OrderBy되어있음
		//*폴더 구조는 /WebContent/js/meta/언어코드/label.js 
		//*구조는 msgCode: "E00001", msgName: "테스트메세지입니다."
		String prevLang = "";
		String currLang = "";
		String refKey = "labelInfo";
		String fileName = "label.js";
		LinkedList<Map<String, Object>> listForJson = new LinkedList<Map<String, Object>>();
		for (int i = 0; i < dataListForClient.size(); i++) {
			Map<String, Object> dataMap = (Map<String, Object>) dataListForClient.get(i);
			//현재 언어가 변경될때
			currLang = dataMap.get("LANG_CODE").toString();

			if(!prevLang.equals(currLang)){
				if(i != 0 ){
					//파일을 생성
					MetaCommUtils.makeJsonFile(fileName, prevLang, refKey,listForJson);
					listForJson.clear();
				}
				prevLang = currLang;
			}
			listForJson.add(dataMap);
			if(i != dataListForClient.size()-1){
			}else{
				//파일을 생성
				MetaCommUtils.makeJsonFile(fileName,currLang, refKey, listForJson);
			}
		}
		return rstFlag;
	}
	
	/**
	 * 라벨 취득 SQL 
	 * @param opt ['S' : 서버, 'C' : 클라이언트]
	 * @return
	 */
	private static String getCommLabelSql(){
		StringBuffer sb = new StringBuffer();
		//2013-12-17 khma : db분기처리 
		sb.append(" SELECT ");
		sb.append("   M_COMM_LABEL_NO	");
		sb.append("   LABEL_CODE");
		sb.append("   ,LANG_CODE	");
		sb.append("   ,LABEL_NAME ");
		sb.append("   ,UI_USE_FLAG ");
		sb.append("   ,M_USITE_NO ");
//		sb.append("   ,USE_FLAG ");
//		sb.append("   ,REG_DATE ");
//		sb.append("   ,REG_USER ");
//		sb.append("   ,UPD_DATE ");
//		sb.append("   ,UPD_USER ");
		sb.append("   FROM ");
		sb.append("   M_COMM_LABEL ");
		sb.append(" WHERE ");
		sb.append("  USE_FLAG='1' ");
		sb.append(" ORDER BY ");
		sb.append(" LANG_CODE  ").append(CommonConst.COMA);
		sb.append("  LABEL_CODE ");
		return sb.toString();
		
	}
	
	/**
	 * 공통라벨 취득
	 * @param key		라벨코드
	 * @param lang		언어코드
	 * @return
	 */
	public static String getLabel(String key, String lang){
		String rstVal = "";
		if(null != commonLabel.get(lang)){
			if(null != commonLabel.get(lang).get(key)){
//				rstVal = commonLabel.get(lang).get(key).get("LABEL_NAME").toString();
				rstVal = commonLabel.get(lang).get(key);
			}
		}
		return rstVal;
	}
}
