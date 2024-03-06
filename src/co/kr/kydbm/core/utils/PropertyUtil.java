package co.kr.kydbm.core.utils;
import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.*;

/**
 *  프로퍼티 유틸 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */
public class PropertyUtil {
	private Properties pros = null;
	
	//클래스 생성자
	public PropertyUtil() {
	}
	public PropertyUtil(String filename) {
		this.init(filename);
	}
	
	public void init(String filename){
		//프로퍼티 파일저장경로
		File profile = null;
		FileInputStream fis = null;
//		private FileOutputStream fos = null;
		
        ClassLoader cl;
        cl = Thread.currentThread().getContextClassLoader();
        if( cl == null )
            cl = ClassLoader.getSystemClassLoader();  
        URL url = cl.getResource( filename);
//        URL url = cl.getResource( "myprop.properties" );
        
		try {
			profile = new File(url.toURI());
		
			//프로퍼티 객체 생성
			pros = new Properties();
		
			//파일이 없다면 새로 만든다
			if(!profile.exists()) profile.createNewFile();
			//프로퍼티 파일 인 인스트림
			fis = new FileInputStream(profile);
			//프로퍼티 파일 아웃 스트림
//			fos = new FileOutputStream(profile);
			//프로퍼티 파일을 메모리에 올린다.(파일을 읽어온다.)
			pros.load(new BufferedInputStream(fis));
			
		} catch (IOException e){
			e.printStackTrace();
		} catch (URISyntaxException e1) {
			e1.printStackTrace();
		}finally {
			try {
				if (fis != null)
					fis.close();
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}
	}
	
	public String getProperty(String key)  {
		String val = "";
		try{
			val = pros.getProperty(key);
		}catch(Exception e){
			 val = "";
		}
		return val;
	}
	
}

