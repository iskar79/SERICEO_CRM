package co.kr.kydbm.core.filecontrol;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Method;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonUtil;


/**
 *  데이터 업로드 콘트롤러 클래스
 * @author KyoungHo_Ma
 * @version 1.0.0 2012-12-01
 * @since version 1.0.0
 */

@Controller
public class UploadDataController {

	// 로그
	Logger log = Logger.getLogger(UploadDataController.class);
	
	private static final String[] CLASS_WHITE_LIST = {
		//TODO EXCEL 확장클래스 호출시에 해당 클래스에 목록을 기록후 해당 클래스에 존재하는 클래스만 사용할것.
		//"co.kr.kydbm.TestExtExcelDown.class"
	};
	
	@RequestMapping("/doUploadDataFile")
	public void uploadDataFile(
			@RequestParam("Filename") MultipartFile Filename,
			HttpServletRequest request, HttpServletResponse response) {
		
		String executeClassName="";
		String upMode = "single"; //업로드 실행모드, single[서비스 목록이 한개일때]/multi[서비스 목록이 복수이고 확장 데이터 업로드 처리일때] 디폴트:single
		
		//String method;
//		String service;
//		String method;
		
		try{
			
			//싱글모드일때에는 공통 데이터 업로드 처리를 행함.
			if(StringUtils.isNotEmpty(request.getParameter("upMode"))){
				upMode = request.getParameter("upMode");
			}
			
//			if((upMode.equals("multi") && StringUtils.isNotEmpty(request.getParameter("classname")))
//					|| upMode.equals("single")){
				//외부 클래스가 지정되어 있는경우가 아닐때에는 디폴트로 공통 클래스가 실행됨.
				if(StringUtils.isNotEmpty(request.getParameter("classname")) 
						&& CommonUtil.checkExtClass(CLASS_WHITE_LIST, request.getParameter("classname"))){ //20150406 외부클래스 사용시에는 whitelist목록으로 사용할것(시큐어코딩지침대응)
		    		  //extClass(확장클래스)가 지정되어있으면 아래의 액셀다운로드 클래스를 사용하지 않고 지정된 클래스를 사용한다.)
					//className이 존재하는 경우는 외부클래스명을 셋팅
					executeClassName = request.getParameter("classname");
				} else{
					executeClassName = "co.kr.kydbm.core.filecontrol.CommonExcelUpload";
				}
				
				// 1. 리플렉션 대상클래스명을 파라메터로 지정하여 클래스를 취득
				Class targetClass = Class.forName(executeClassName);
				// 2. 대상 클래스의 객채를 생성
				Object targetInstance = targetClass.newInstance();
				
				//3. 대상객체에서 사용할 메소드의 파라메터타입을 맵핑
				Class paramTypes[] = new Class[3];
				paramTypes[0] = MultipartFile.class;
				paramTypes[1] = HttpServletRequest.class;
				paramTypes[2] = HttpServletResponse.class;
				//4. 사용할 메소드명과 파라메터타입을 파라메터로 설정하여 대상객체에서 사용할 메소드를 취득
//				Method targetMthod = targetClass.getMethod("exeTest", paramTypes);
				Method targetMthod = targetClass.getMethod("execute", paramTypes);
				
//				// 5. invoke함수를 호출하요 해당 메소드를 실행한다.
//				targetMthod.invoke(targetInstance, new Integer(5), new String("리플렉션테스트"));
				//Hashtable<String, String> hstRst = (Hashtable<String, String>) targetMthod.invoke(targetInstance, Filename, request, response );
				DataUploadResultBean resultBean = (DataUploadResultBean) targetMthod.invoke(targetInstance, Filename, request, response );
				if(CommonConst.FAIL.equals(resultBean.getRESULT())){
					//결과가 SUCCESS가 아니면 실패로 간주
					log.warn(resultBean.getMESSAGE());
					
					 throw new Exception(resultBean.getMESSAGE());
				}else{
					response.setContentType("text/html; charset=UTF-8");
			 	    PrintWriter out = null;
					try {
						out = response.getWriter();
						out.write("<script language='javascript'>alert('데이터 파일 업로드 처리 성공');</script>");
						out.close();
					} catch (IOException ioe) {
						ioe.printStackTrace();
					} finally{
						out.close();
					}
				}
//			}else{
//				//TODO 현재는 지정한  클래스를 처리하도록만개발되어있으나 차후에 else의 경우는 디폴트 처리로 만들예정
//				 throw new Exception("업로드 모드가 잘못 지정되었거나\n데이터 파일 업로드 처리에 실행할  클래스가 지정되지 않았습니다.");
//			}
			
		}catch(Exception e){
			response.setContentType("text/html; charset=UTF-8");
	 	    PrintWriter out = null;
			try {
				out = response.getWriter();
				//out.write("<script language='javascript'>alert('"+ e.getMessage()  +"');</script>");
				out.write("<script language='javascript'>alert('"+ CommonConst.COMM_ERROR_MESSAGE  +"');</script>");
			} catch (IOException ioe) {
				ioe.printStackTrace();
			} finally{
				out.close();
			}
		}
	}
}
