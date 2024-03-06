package co.kr.kydbm.core.meta;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonGenerator.Feature;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.ObjectWriter;

import co.kr.kydbm.core.utils.ConfigProperties;

/**
 * 메타데이터 전용 공통 유틸 클래스
 * @author KyoungHo_Ma
 *
 */
public class MetaCommUtils {

	/**
	 * 클라이언트용 언어별 Json파일 생성
	 * @param currLang
	 * @param string
	 */
	public static boolean makeJsonFile(
			String fileName, 
			String currLang,
			String reflKey,
			List<Map<String,Object>> listForJson) {
		
		ConfigProperties conifgProperties = ConfigProperties.getInstance();
		String realPath = conifgProperties.getProperty("monarch.url.realpath");
		realPath += "js/kydbm/meta/" + currLang;
		String saveFilePath = realPath + "/" + fileName;
//		String jsonData="";
		//언어별 폴더가 없으면 폴더를 생성한다.
		File dir = new File(realPath);
		if(!dir.isDirectory()){
			dir.mkdirs();
		}
		
		FileOutputStream f = null;
		OutputStreamWriter outpursOutputStreamWriter= null;
		BufferedWriter bufferedWriter = null;
		try {
			ObjectMapper om = new ObjectMapper();
			ObjectWriter ow = om.writerWithDefaultPrettyPrinter();
			om.configure(Feature.WRITE_NUMBERS_AS_STRINGS, true);
			String jsonData =  "var " + reflKey+ " = " + ow.writeValueAsString(listForJson);
			
			f = new FileOutputStream(saveFilePath);
			outpursOutputStreamWriter= new OutputStreamWriter(f, "UTF-8");
			bufferedWriter = new BufferedWriter(outpursOutputStreamWriter);
			bufferedWriter.write(jsonData);
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			try {
				bufferedWriter.close();
				outpursOutputStreamWriter.close();
				f.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return true;
	}
}
