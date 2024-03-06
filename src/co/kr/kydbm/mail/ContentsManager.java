package co.kr.kydbm.mail;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;

import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.PropertyUtil;
import co.kr.kydbm.core.dao.MonArchDaoImpl;

/**
 *  컨텐츠의 취득 병합등을 처리하는 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class ContentsManager {
	private static final String REPLACED_CONTENTS = "replacedContents";
	private static final String ATTACH_FILE_TAG = "첨부파일";
	private static final String ATTACH_IMGFILE_TAG = "이미지파일";
	private static final String SUFFIX_GIF = "GIF";
	private static final String SUFFIX_JPG = "JPG";
	private static final String SUFFIX_PNG = "PNG";
	private static final String SUFFIX_BMP = "BMP";
	Logger log = Logger.getLogger(ContentsManager.class.getName());
	
	public  Map<String,Object> makeContents(String contentsCode
			, List<Map<String,Object>> relpaceValue
			, List<Map<String, Object>> attachFileList) 
							throws DataAccessException, Exception{
		
		String rstContent = "";
	    
		//2. 병합필드값 취득
	    Map<String,Object> contentInfo;
	    contentInfo = getContent(contentsCode);
	    
	    String content = contentInfo.get("본문").toString();
	    ConfigProperties conifgProperties = ConfigProperties.getInstance();
	    String url = conifgProperties.getProperty("monarch.url.mobile");
		//첨부파일이 존재할 경우 첨부파일 소스 추가.
//	    String attachFileHtml = " ";
		StringBuffer sbAttachFileHtml = new StringBuffer("");
		if(null != attachFileList && 0 < attachFileList.size() ){
			for (Map<String, Object> map : attachFileList) {
				sbAttachFileHtml.append("<a href='" + url + "/filedownload.mon?fid=");
				sbAttachFileHtml.append(map.get("파일관리번호").toString() + "' target='_blank'>");
				sbAttachFileHtml.append(map.get("파일명").toString() + "</a><br>");
			}
		}
		//이미지 표시용 첨부파일 소스 추가
//		String attachImgFileHtml = " ";
		StringBuffer sbAttachImgFileHtml = new StringBuffer("");
//		String realPath=conifgProperties.getProperty("monarch.url.fileserver");
		String imgFileWidth = "300"; //이미지 사이즈 width
		String imgFileHeight = "300"; //이미지 사이즈 height
		if(null != conifgProperties.getProperty("directmail.imgfile.width") && 0>conifgProperties.getProperty("directmail.imgfile.width").length()){
			imgFileWidth = conifgProperties.getProperty("directmail.imgfile.width");
		}
		if(null != conifgProperties.getProperty("directmail.imgfile.height") && 0>conifgProperties.getProperty("directmail.imgfile.height").length()){
			imgFileHeight = conifgProperties.getProperty("directmail.imgfile.height");
		}
		
		if(null != attachFileList && 0 < attachFileList.size() ){
			for (Map<String, Object> map : attachFileList) {
				String suffix = CommonUtil.getSuffix(map.get("FILE_NAME").toString()); 
				if(SUFFIX_JPG.equalsIgnoreCase(suffix) ||
						SUFFIX_GIF.equalsIgnoreCase(suffix) ||
						SUFFIX_PNG.equalsIgnoreCase(suffix) ||
						SUFFIX_BMP.equalsIgnoreCase(suffix)
						){
					//첨부파일이 이미지 파일일떄만 표시함 (지원 이미지파일은 ,PNG,JPG,BMP,GIF)
					sbAttachImgFileHtml.append("<a href='" + url + "/filedownload.mon?fid=");
					sbAttachImgFileHtml.append(map.get("FILE_MGMT_NO").toString() + "' target='_blank'>");
					sbAttachImgFileHtml.append("<img src='" + url+map.get("FILE_PATH").toString() 
							+ "' style='width: "+imgFileWidth+"px;height: "+imgFileHeight+"px;' alt='클릭하시려면 이미지를 클릭하십시요.' /></a><br>");
//					attachImgFileHtml += "<a href='" + url + "/filedownload.mon?fid=";
//					attachImgFileHtml +=map.get("파일관리번호").toString() + "' target='_blank'>";
//					attachImgFileHtml += "<img src='" + url+map.get("파일경로").toString() 
//							+ "' style='width: "+imgFileWidth+"px;height: "+imgFileHeight+"px;' alt='클릭하시려면 이미지를 클릭하십시요.' /></a><br>";
				}
			}
		}
		
		
		//3. 병합처리
		
		Map<String, Object> repalceValueMap = relpaceValue.get(0);
		repalceValueMap.put(ATTACH_FILE_TAG, sbAttachFileHtml.toString());
		repalceValueMap.put(ATTACH_IMGFILE_TAG, sbAttachImgFileHtml.toString());
		rstContent = replaceMatchField(content, repalceValueMap);
		contentInfo.put(REPLACED_CONTENTS, rstContent);
		return contentInfo;
	}
	
	/**
	 * 병합처리 메소드
	 * @param content
	 * @param relpaceValue
	 * @return
	 */
	public String replaceMatchField(String content, Map<String, Object> relpaceValue){
		 
//		String afterContent = content;
		 Iterator<String> iterator = relpaceValue.keySet().iterator();
		    while (iterator.hasNext()) {
		        String key = (String) iterator.next();
		        String rValue =" ";
		        if(null != relpaceValue.get(key)){
		        	rValue = relpaceValue.get(key).toString();
		        	rValue = rValue.replaceAll("\n", "<br>").replaceAll("\\$", "\\\\\\$"); // $심볼replaceAll시 에러나는 문제 대응
		        }
		        
		        String matchFieldName = "@" + key + "@";
		        content = content.replaceAll(matchFieldName, rValue);
		    }
		
		return content;
	}
	
	/**
	 * 컨텐츠 코드로 컨텐츠내용를 취득한다.
	 * @param contentsCode
	 * @return
	 * @throws Exception 
	 * @throws DataAccessException 
	 */
	public Map<String,Object> getContent(String contentsCode) throws DataAccessException, Exception{
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		String sqlComm = "";
		Map<String, String> parameters = new HashMap<String, String>();
		//2013-12-17 khma : db분기처리 필요
		sqlComm += "SELECT * FROM M_CONTENTS WHERE CONT_CODE = @CONT_CODE@";
		parameters.put("CONT_CODE", contentsCode);
		Map<String,Object> rstData = monArchDao.exeGetFirstRow(sqlComm, parameters);
		return rstData;
	}
}
