package co.kr.kydbm.core.utils;

import java.util.LinkedList;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import co.kr.kydbm.core.meta.MetaCommCode;
import co.kr.kydbm.core.meta.MetaCommLabel;


/**
 * HTML코드의 언어교환기 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-11
 * @since version 1.0.0
 */
public class LanguageExchanger {
	
	private Logger  log = Logger.getLogger(LanguageExchanger.class.getName());
	private  final String REGEX_PARAM = "\\$\\{+[ a-zA-Z0-9가-힣-_| ]*\\}"; //라벨 코드를 취득하기 위한 병합필드 정규식
//	private  final String REGEX_PARAM = "@+[ a-zA-Z0-9가-힣-_ ]*@";
	
	
	public  String jsonToHtml(String html, String lang){
		
		String replacedHtml = html;
		Pattern params = Pattern.compile(REGEX_PARAM, Pattern.MULTILINE);
		Matcher matchCol = params.matcher(html);
		while (matchCol.find()) {
			String key = matchCol.group(0).replace("${", "").replace("}", "").trim();
			String label = "";
//			logger.debug("ㅁㅁㅁ" + key +" ㅁㅁㅁ");
			//키에 |이 들어가 있으면 공통코드를 가져오고 아니면 라벨을 가져옴
			String [] keys = StringUtils.split(key, "|");
			if(1 < keys.length){
				//TODO 공통코드키
//				html = html.replaceAll(matchCol.group(0), key) ;
				label = MetaCommCode.getCodeName(keys[0], keys[1], lang);
				replacedHtml = replacedHtml.replace(matchCol.group(0), label) ;
			}else{
				//TODO 라벨키
				label =  MetaCommLabel.getLabel(key, lang);
				replacedHtml = replacedHtml.replace(matchCol.group(0), label) ;
				
			}
			
		}
		
		return replacedHtml;
	}
}
