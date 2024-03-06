package co.kr.kydbm.mail;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeUtility;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import co.kr.kydbm.common.CommonConst;
import co.kr.kydbm.common.CommonUtil;
import co.kr.kydbm.core.bean.ResultInfo;
import co.kr.kydbm.core.bean.ServiceInfo;
import co.kr.kydbm.core.dao.MonArchDaoImpl;
import co.kr.kydbm.core.utils.ConfigProperties;
import co.kr.kydbm.core.utils.PEBEncrytor;
import co.kr.kydbm.core.utils.QueryGenerator;

/**
 * 메일서비스 컨트롤러 클래스
 * @author kim jungwon
 * @version 1.0
 * @since 2012.07.19
 */
@Controller
@Transactional
public class MailServiceController {

	private static final String REPLACED_CONTENTS = "replacedContents";
	private static final String TO = "TO";
	private static final String CC = "CC";
	private static final String BCC = "BCC";
	Logger log = Logger.getLogger(MailServiceController.class.getName());
	private static ConfigProperties  prop = ConfigProperties.getInstance(); //속성정의 정보 취득
	private static final String DB_TYPE = prop.getProperty("monarch.db.type");	
	
//	@RequestMapping("/sendDirectMail") //미사용 예정
//	public ModelAndView sendDirectMail(@RequestBody  String XmlParms) throws DataAccessException, Exception{
//		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
//		xmlParams = CommonUtil.parsingForJonType(xmlParams);
//		Map<String, String> obj;
//		ObjectMapper om = new ObjectMapper();
//		ServiceInfo  si= null;
//		monArchDao = new MonArchDaoImpl();
//		boolean rstFlag = true;
//		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
//		
//		String contentsCode = obj.get("contentsCode"); //컨텐츠코드
//		String jobType = obj.get("JOB_TYPE"); //작업종류(검색키)
//		String jobKey = obj.get("JOB_KEY"); //작업키(검색키)
//		String service = obj.get("service"); //서비스
//		String method = obj.get("method"); //메소드
//		String usite = obj.get("USITE");
//		String uid = obj.get("UID");
//		String unm = obj.get("UNM");
//		String ulid = obj.get("ULID");
//		//0. 검색키로 메일송신에 필요한 쿼리 검색
//		monArchDao = new MonArchDaoImpl();
//		ContentsManager contentsManager = new ContentsManager();
//		si = monArchDao.ReadQuery(service, method, usite);
//		List<Map<String, Object>> mailInfo = monArchDao.exeRead(si.getSql(), obj); //메일정보취득
//		
//		//1. 컨텐츠 취득
//		try{
//			if(mailInfo.size() > 0){
//				//String replacedContent ="";
//				List<Map<String, Object>> attachFileList = null;
//				Map<String,Object> contentsInfo = null;
//				if(null != mailInfo.get(0).get("ATTC_FILE_KEY")){
//					String attcFileKey = mailInfo.get(0).get("ATTC_FILE_KEY").toString();
//					attachFileList = getAttachFileList(attcFileKey);  //첨부파일
//					/* 메일 필수 항목 */
//				}
//				contentsInfo  = contentsManager.makeContents(contentsCode, mailInfo, attachFileList);
//				//replacedContent = contentsInfo.get(REPLACED_CONTENTS).toString();
//				//4. 메일송신
//				rstFlag =  mailSend(contentsInfo,mailInfo, ulid, usite);
//			}else{
//				rstFlag = false;
//			}
//		}catch(Exception e){
//			log.error("다이렉트 메일 발송 오류",e);
//			rstFlag = false;
//		}
//
//		
//		//6, 처리결과값 리턴
//		ModelAndView mav = new ModelAndView("", "Rows", rstFlag);
//		return mav;
//	}
	
	/**
	 * 개별 메일 발송 요청 처리 (MonArch815 신규추가)
	 * @param XmlParms
	 * @return
	 * @throws DataAccessException
	 * @throws Exception
	 */
	@RequestMapping("/sendIndvEmail") //20140211 khma 추가 
	@Transactional
	public ModelAndView sendDirectMail(@RequestBody  String XmlParms, HttpServletRequest request) throws DataAccessException, Exception{
		String xmlParams  =URLDecoder.decode(XmlParms, "UTF-8");
		xmlParams = CommonUtil.parsingForJonType(xmlParams);
		Map<String, String> obj;
		ObjectMapper om = new ObjectMapper();
		ServiceInfo  si= null;
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		boolean rstFlag = false;
		obj = om.readValue(xmlParams, new TypeReference<Map<String, Object>>(){}); //맵으로 가져옴
		
		String service = obj.get("service"); //서비스
		String method = obj.get("method"); //메소드
		String usite = obj.get("USITE");
		//0. 검색키로 메일송신에 필요한 쿼리 검색
		monArchDao = new MonArchDaoImpl();
		List<Map<String,Object>> listMerge = null;
		String contBody = "";
		String sendEmail = null;
		Map<String, Object> userInfoMap = null; //보내는 사람 정보가 없을때 사용자정보 취득맵

		if(obj.containsKey("CONT_BODY")){
			contBody = obj.get("CONT_BODY");
		}
		//사용자번호로 이메일 취득
		if(obj.containsKey("SEND_EMAIL")){
			sendEmail = obj.get("SEND_EMAIL");
		}else{
			userInfoMap =  monArchDao.queryForMap("SELECT M_USER_NO, USER_NAME, EMAIL FROM M_USER WHERE M_USER_NO=:UID", obj);
			if(null != userInfoMap){
				sendEmail = userInfoMap.get("EMAIL").toString();
				obj.put("SEND_EMAIL", sendEmail);
			}
		}
		
		if(StringUtils.isNotEmpty(sendEmail)){
			//최종 취득 이메일 정보가 존재할 때
			if(obj.containsKey("service") && obj.containsKey("method")){
				//해당 서비스와 메소드 정보가 존재할때에만 병합처리 실행함
				si = monArchDao.ReadQuery(service, method, usite);
				listMerge = monArchDao.exeRead(si.getSql(), obj);
				if(listMerge.size() > 0) {
					contBody = replaceMatchField(contBody, listMerge.get(0));
					obj.put("CONT_BODY", contBody);
				}
			}
			
			// email type이 내부통지일 경우
			if ( obj.get("MAIL_TYPE")!= null && "NT".equals(obj.get("MAIL_TYPE").toString()) ) {
				// 내부통지 함수 실행
				int nRlt = setInnerNotice(obj, monArchDao, request);
			}
			else {
				int rst = monArchDao.exeUpdate(getIndvEmailInsertQry(), obj);
				if(rst > 0) rstFlag = true;
			}
			
			//6, 처리결과값 리턴
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.SUCCESS));
			
		}else {
			//최종 취득 이메일 정보가 존재하지 않을 때
			//6, 처리결과값 리턴
			// 부정한 사용자번호
			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL,"부정한 사용자번호 입니다." ));
		}
		
		
		
		
//		if(StringUtils.isNotEmpty(sendEmail) || null != userInfoMap){
//			sendEmail = userInfoMap.get("EMAIL").toString();
////			obj.put("SEND_EMAIL", sendEmail);
//			//취득한 service/method파라메터가 존재할 경우에는 해당하는 쿼리를 실행하여 데이터를 취득한다.
//			if(obj.containsKey("service") && obj.containsKey("method")){
//				//해당 서비스와 메소드 정보가 존재할때에만 병합처리 실행함
//				si = monArchDao.ReadQuery(service, method, usite);
//				listMerge = monArchDao.exeRead(si.getSql(), obj);
//				if(listMerge.size() > 0) {
//					contBody = replaceMatchField(contBody, listMerge.get(0));
//					obj.put("CONT_BODY", contBody);
//				}
//			}
//			int rst = monArchDao.exeUpdate(getIndvEmailInsertQry(), obj);
//			if(rst > 0) rstFlag = true;
//			//6, 처리결과값 리턴
//			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.SUCCESS));
//		} else {
//			//6, 처리결과값 리턴
//			// TODO 부정한 사용자번호
//			return new ModelAndView("", CommonConst.RESULT_INFO, new ResultInfo(CommonConst.FAIL,"부정한 사용자번호 입니다." ));
//		}
			
	}
	
	@Transactional
	private int setInnerNotice(Map<String, String> param, MonArchDaoImpl monArchDao
			, HttpServletRequest req) throws Exception {
		int result = 0;
		try {
			
			/// 내부통지 테이블에 데이터 입력 ///
			int nRlt = monArchDao.exeCreateIdentity(getInnerNoticeInsertQuery(), "M_INNER_NOTICE", param);
			if ( nRlt < 1 ) {
				throw new Exception("내부통지 테이블에 데이터를 삽입할 때에 오류가 발생함.");
			}
			// 삽입한 통지 번호를 가져온다.
			param.put("M_INNER_NOTICE_NO", nRlt + "");
			
			/// 받은 사람 테이블에 데이터 입력 ///
			log.debug("내부통지 테이블 키값 : " + nRlt);
			
			// 1. 받은 사람, 참조, 숨은 참조를 받은 사람 목록에 추가하기
			String recvTo = param.get("RECV_EMAIL");
			String recvCc = param.get("RECV_EMAIL_CC");
			String recvBcc = param.get("RECV_EMAIL_BCC");
			
			log.debug("받은 사람 목록 : " + recvTo + ";" + recvCc + ";" + recvBcc);
			
			List<String> receiverList = new ArrayList<String>();
			if ( recvTo != null && !recvTo.equals("") ) { 
				for ( String recvt : recvTo.split(",") ) { receiverList.add(recvt); } 
			}
			else {
				// 받은 사람 데이터가 없으므로 Exception을 발생시키고 오류 메세지 작성
				throw new Exception("받는 사람이 없음.");
			}
			// 참조
			if ( recvCc != null && !recvCc.equals("") ) { 
				for ( String recvc : recvCc.split(",") ) { receiverList.add(recvc); }
			}
			// 숨은 참조
			if ( recvBcc != null && !recvBcc.equals("") ) { 
				for ( String recvb : recvBcc.split(",") ) { receiverList.add(recvb); }
			}
			
			// 2. 수신자 테이블에 데이터를 삽입한다.
			int recvLen = 0;
			for ( String receiver : receiverList ) {
				// RECV_USER RECV_MAIL
				// 받는 사람 메일 데이터를 쿼리의 파라미터로 넣어준다.
				param.put("RECV_MAIL", receiver);
				// 받는 사람이 참조인지 아닌지 구분한다.
				if ( recvLen >= recvTo.split(",").length ) { param.put("REF_RECV_MAIL", "1"); }
				else { param.put("REF_RECV_MAIL", "0"); }
				// 수신자 테이블에 데이터를 삽입한다.
				int rst = monArchDao.exeUpdate(getReceiverInsertQuery(),  param);
				if ( rst < 1 ) {
					throw new Exception("받는 사람 테이블에 데이터 삽입할 때 오류가 발생함.");
				}
			}

			// 3. 수신자 별로 메일을 전송한다.
			// 서버 주소를 가져온다.
			String url = req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort();
			// 메일 내용을 가져온다.
			String content = getNoticeContentStr();
			// 메일에 병합될 파라미터를 가져온다.
			Map<String, Object> noticeInfo = getNoticeContentParam(nRlt, url, param);
			for ( String receiver : receiverList ) {
				// 메일에 표시될 내용을 만든다.
				String noticeContent = replaceMatchField(content, noticeInfo);
				param.put("CONT_BODY", noticeContent);
				// 수신자 정보를 입력한다.
				param.put("RECV_EMAIL_TO", receiver);
				// 메일을 전송하기 위해 이메일 테이블에 데이터를 삽입한다.
				int rst = monArchDao.exeUpdate(getIndvEmailInsertQry(), param);
				if ( rst < 1 ) { throw new Exception("내부통지 메일을 테이블에 저장할 때 오류가 발생함."); }
				recvLen++;
			}
			result = nRlt;
		}
		catch ( Exception e ) {
			e.printStackTrace();
		}
		return result;
	}
	
	/**
	 * 내부통지 insert 쿼리
	 * @return
	 */
	private String getInnerNoticeInsertQuery() {
		StringBuffer sb = new StringBuffer();
		sb.append(" INSERT INTO M_INNER_NOTICE ")
		.append(" ( ")
		.append("   M_INNER_NOTICE_NO ")
		.append(" , M_USITE_NO ")
		.append(" , SEND_DATE ")
		.append(" , SEND_USER ")
		.append(" , SEND_MAIL ")
		.append(" , TITLE ")
		.append(" , CONTENT ")
		.append(" , TABLE_NAME ")
		.append(" , KEY_VALUE ")
		.append(" , LINK_URL ")
		.append(" , MENU_NAME ")
		.append(" , SEND_DEL_YN ")
		.append(" , ATTC_FILE ")
		.append(" , REG_DATE ")
		.append(" , REG_USER ")
		.append(" , UPD_DATE ")
		.append(" , UPD_USER ")
		.append(" ) ")
		.append(" VALUES  ")
		.append(" ( ")
		.append("   @M_INNER_NOTICE_NO@ ")
		.append(" , @USITE@ ")
		.append(" , SYSDATE ")
		.append(" , @UID@ ")
		.append(" , @SEND_EMAIL@ ")
		.append(" , @CONT_SUBJECT@ ")
		.append(" , @CONT_BODY@ ")
		.append(" , @TABLE_NAME@ ")
		.append(" , @KEY_VALUE@ ")
		.append(" , @LINK_URL@ ")
		.append(" , @MENU_NAME@ ")
		.append(" , '0' ")
		.append(" , @ATTC_FILE@ ")
		.append(" , SYSDATE ")
		.append(" , @UID@ ")
		.append(" , SYSDATE ")
		.append(" , @UID@ ")
		.append(" ) ")
		;
		return sb.toString();
	}
	
	private String getReceiverInsertQuery() {
		StringBuffer sb = new StringBuffer();
		sb.append(" INSERT INTO M_RECEIVER ")
		.append(" ( ")
		.append("   M_RECEIVER_NO ")
		.append(" , M_USITE_NO ")
		.append(" , M_INNER_NOTICE_NO ")
		.append(" , RECV_USER ")
		.append(" , REF_RECV_USER ")
		.append(" , RECV_MAIL ")
		.append(" , READ_YN ")
		.append(" , MAIL_CFRM_YN ")
		.append(" , RECV_DEL_YN ")
		.append(" , REG_DATE ")
		.append(" , REG_USER ")
		.append(" , UPD_DATE ")
		.append(" , UPD_USER ")
		.append(" ) ")
		.append(" VALUES ")
		.append(" ( ")
		.append("   M_RECEIVER_SEQ.NEXTVAL ")
		.append(" , @USITE@ ")
		.append(" , @M_INNER_NOTICE_NO@ ")
		.append(" , (SELECT M_USER_NO FROM M_USER WHERE EMAIL = @RECV_MAIL@) ")
		.append(" , @REF_RECV_MAIL@ ")
		.append(" , @RECV_MAIL@ ")
		.append(" , '0' ")
		.append(" , '0' ")
		.append(" , '0' ")
		.append(" , SYSDATE ")
		.append(" , @UID@ ")
		.append(" , SYSDATE ")
		.append(" , @UID@ ")
		.append(" ) ")
		;
		return sb.toString();
	}
	
	 /**
	  * 개별메일 등록 쿼리
	  * @return
	  */
	  private String getIndvEmailInsertQry() {
		// TODO Auto-generated method stub
		  StringBuffer sb = new StringBuffer();
		  sb.append(" INSERT INTO MC_INDV_EMAIL ( ");
		  sb.append(" M_USITE_NO ");
		  sb.append(" ,SEND_NAME ");
		  sb.append(" ,SEND_EMAIL ");
		  sb.append(" ,CONT_SUBJECT ");
		  sb.append(" ,RSRV_SEND_DATE ");
		  sb.append(" ,INDV_STATE ");
		  sb.append(" ,SYNC_FLAG ");
		  sb.append(" ,ATTC_FILE ");
		  sb.append(" ,CONT_BODY ");
		  sb.append(" ,EXPIRE_DATE ");
		  sb.append(" ,RECV_NAME ");
		  sb.append(" ,RECV_EMAIL_TO ");
		  sb.append(" ,RECV_EMAIL_CC ");
		  sb.append(" ,RECV_EMAIL_BCC ");
		  sb.append(" ,M_CUST_NO ");
		  sb.append(" ,M_CMPN_EXEC_CUST_NO ");
		  sb.append(" , MAIL_TYPE ");
		  sb.append(" ,REG_DATE ");
		  sb.append(" ,REG_USER ");
		  sb.append(" ,UPD_DATE ");
		  sb.append(" ,UPD_USER ");
		  sb.append("  ");
		  sb.append(" ) ");
		  sb.append(" VALUES ( ");
		  sb.append(" @USITE@ ");
		  sb.append(" ,@SEND_NAME@ ");
		  sb.append(" ,@SEND_EMAIL@ ");
		  sb.append(" ,@CONT_SUBJECT@ ");
		  sb.append(" ,@RSRV_SEND_DATE@ ");
		  sb.append(" ,'00' ");
		  sb.append(" ,@SYNC_FLAG@ ");
		  sb.append(" ,@ATTC_FILE@ ");
		  sb.append(" ,@CONT_BODY@ ");
		  sb.append(" ,@EXPIRE_DATE@ ");
		  sb.append(" ,@RECV_NAME@ ");
		  sb.append(" ,@RECV_EMAIL_TO@ ");
		  sb.append(" ,@RECV_EMAIL_CC@ ");
		  sb.append(" ,@RECV_EMAIL_BCC@ ");
		  sb.append(" ,@M_CUST_NO@ ");
		  sb.append(" ,@M_CMPN_EXEC_CUST_NO@");
		  sb.append(" ,@MAIL_TYPE@ ,");
		  sb.append(QueryGenerator.genSysDate(DB_TYPE, false));
		  sb.append(" ,@UID@ , ");
		  sb.append(QueryGenerator.genSysDate(DB_TYPE, false));
		  sb.append(" ,@UID@ ");
		  sb.append(" ) ");
		  
		return sb.toString();
	}






	public boolean mailSend(Map<String,Object> contentInfo, List<Map<String,Object>> mailInfo, String ulid, String usite)throws ServletException, IOException {
		  boolean debug = false;
		  boolean success = false;    // 메일 성공 여부
		  
//	        PropertyUtil mailconfig = new PropertyUtil("monarch.properties");
		  ConfigProperties configProperties = ConfigProperties.getInstance();
		  String mailMode = configProperties.getProperty("directmail.mode"); //메일 모드 (0:테스트모드,1:운영모드)
		  String testToMail = configProperties.getProperty("directmail.test.tomail"); //테스트메일 보내는사람
		  String testFromMail = configProperties.getProperty("directmail.test.frommail"); //테스트메일 받는사람
		  
		  
//	        String frommail=user_name+"<"+isrt_idxx+"@oodb.co.kr>";
		  
		  String content = contentInfo.get(REPLACED_CONTENTS).toString(); //본문내용
		  String subject = contentInfo.get("CONT_NAME").toString();
		  String host =  configProperties.getProperty("directmail.host");
		  
		  try {
			  Properties props = new Properties();
			  props.put("mail.smtp.host",host);
			  Session msgSession = Session.getDefaultInstance(props,null);
			  msgSession.setDebug(debug);
			  MimeMessage msg = new MimeMessage(msgSession);
			  
			  InternetAddress from;  //보내는사람
			  InternetAddress[] arrToAddress = null; //받는사람[복수]
			  InternetAddress[] arrCcAddress = null; //참조[복수]
			  InternetAddress[] arrBccAddress = null; //숨겨진 참조[복수]
			  List<String> toList = new ArrayList<String>();
			  List<String> ccList = new ArrayList<String>();
			  List<String> bccList = new ArrayList<String>();
			  
			  if(mailMode.equals("0")){ //테스트모드일때에는 설정파일에서 테스트메일주소를 설정한다.
				  
				  from = new InternetAddress(testFromMail); //보내는 사람 테스트메일 설정
				  arrToAddress = InternetAddress.parse(testToMail); //받는사람 테스트메일 설정
				  
			  }else{
				  
				  from = new InternetAddress(mailInfo.get(0).get("FROM_MAIL").toString()); //보내는 사람
				  //메일 송신 대상 수 만큼 to,cc,bcc에 나눠서 셋팅
				  for (Map<String,Object> map : mailInfo) {
					  
					  String reciType = map.get("RECI_TYPE").toString();
					  String tomail = map.get("TO_MAIL").toString();
					  if(TO.equals(reciType)){
						  toList.add(tomail);
					  }
					  
					  if(CC.equals(reciType)){
						  ccList.add(tomail);
					  }
					  
					  if(BCC.equals(reciType)){
						  bccList.add(tomail);
					  }
				  }
			  }
			  
			  if(toList.size() > 0){
				  arrToAddress = InternetAddress.parse(makeMailAdresses(toList));
			  }
			  
			  if(ccList.size() > 0){
				  arrCcAddress = InternetAddress.parse(makeMailAdresses(ccList));
			  }
			  
			  if(bccList.size() > 0){
				  arrBccAddress = InternetAddress.parse(makeMailAdresses(bccList));
			  }
			  
			  //메일 대상이 존재하면 메일을 송신한다.
			  if(arrToAddress.length > 0){
				  
				  msg.setContent(content, "text/html;charset=EUC-KR");
				  msg.setSubject(subject ,"euc-kr");    //제목
				  msg.setFrom(from);
				  msg.setRecipients(Message.RecipientType.TO, arrToAddress);
				  if(null != arrCcAddress &&  0 < arrCcAddress.length) msg.setRecipients(Message.RecipientType.CC, arrCcAddress);
				  if(null != arrBccAddress && 0 < arrBccAddress.length) msg.setRecipients(Message.RecipientType.BCC ,arrBccAddress);
				  
				  Transport.send(msg);
				  success = true;
				  
				  //테스트모드가 아닐때에는 메일관리테이블에 각 메일 정보의 상태를 송신완료'1'로 갱신한다. 
				  updateSendState(mailInfo, ulid, usite, "44");
				  
				  
				  /* 아래와 같이 하면 성공 start*/
				  Transport transport = msgSession.getTransport("smtp");
				  transport.connect(host, "id","pw");
				  transport.sendMessage(msg, msg.getAllRecipients());
				  transport.close();
				  /* 아래와 같이 하면 성공 end*/
				  
			  }else{
				  
				  success = false;
				  
			  }
		  } catch(Exception e) {
			  
			  e.printStackTrace();
			  log.error("다이렉트 메일 발송 오류 발생",e);
			  try{
				  updateSendState(mailInfo, ulid, usite, "-1");
			  }catch(Exception e2){
				  log.error("메일발송상태값 갱신중 오류 발생",e2);
			  }
			  success = false;
			  
			  
		  }
		  
		  return success;
	  }

	  /**
	   * SMTP 개별 다이렉트 메일송신후 상태 갱신 메소드[구버전:LGHAUSYS에서 사용되던 처리메소드]
	   * @param mailInfo
	   */
	private void updateSendState(List<Map<String, Object>> mailInfo, String ulid, String usite, String sendStat) {
		// 송신한 메일 정보의 발송상태를 갱신한다.
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		//2013-12-17 khma : db분기처리
		String sqlComm = "UPDATE MAIL_MGMT SET ";
		sqlComm += " SEND_STAT = @SEND_STAT@ " ;
		sqlComm += " ,UPDT_DATE = " + QueryGenerator.genSysDate(DB_TYPE, false) ;
		sqlComm += " WHERE  UPDT_ID = @ULID@" ;
		sqlComm += " AND COMP_CODE = @USITE@" ;
		sqlComm += " AND MAIL_NO = @MAIL_NO@" ;
		
		Map<String, String> parameters = new HashMap<String, String>();
		for (Map<String, Object> map : mailInfo) {
			parameters.clear();
			parameters.put("ULID", ulid);
			parameters.put("USITE", usite);
			parameters.put("MAIL_NO", map.get("MAIL_NO").toString());
			parameters.put("SEND_STAT", sendStat);
			
			//업데이트
			monArchDao.exeUpdate(sqlComm, parameters);
		}
		
	}

	/**
	 * 기본 첨부파일 정보 취득
	 * @param attcFileKey
	 * @return
	 * @throws DataAccessException
	 * @throws Exception
	 */
	private List<Map<String, Object>> getAttachFileList(String attcFileKey) throws DataAccessException, Exception{
		//2013-12-17 khma : db분기처리 
		String attacghFileSQL= "SELECT M_FILE_MGMT_NO, FILE_PATH, FILE_NAME FROM M_FILE_MGMT ";
		attacghFileSQL += " WHERE FILE_SEARCH_KEY = @FILE_SEARCH_KEY@ AND USE_FLAG='1'";
		Map<String, String> parameters = new HashMap<String, String>();
		parameters.put("FILE_SEARCH_KEY", attcFileKey);
		MonArchDaoImpl monArchDao = new MonArchDaoImpl(); //
		List<Map<String, Object>> fileList =  monArchDao.exeRead(attacghFileSQL, parameters);
		return fileList;
	}
	
	// Exception 처리 메소드 
	@ExceptionHandler(Exception.class)
	public ModelAndView handleException(Exception e, HttpServletResponse response){
	
		// e 객체에 익셉션에러 들어있음
		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		Map<String, Object> rstMap = new HashMap<String, Object>();
		rstMap.put("errorMessage", e.getMessage());
		ModelAndView mav = new ModelAndView("", rstMap);
		return mav;
		
	}
	
	private String makeMailAdresses(List<String> targetList ){
		String strAddress = "";
		for (int i = 0; i < targetList.size(); i++) {
			strAddress += targetList.get(i);
			if(  i < targetList.size() - 1 ){
				strAddress += ",";
			}
		}
		return strAddress;
	}

	/**
	 *  배치처리에서 실행하는 sendDirectMail (개별메일용)
	 * @param attcFileList 
	 * @param targetMailList
	 */
	public boolean sendDirectMail(Map<String, Object> targetMail, List<Map<String,Object>> attcFileList) {

		boolean success = false;    // 메일 성공 여부
		StandardPBEStringEncryptor pbeEnc = new  StandardPBEStringEncryptor();
		pbeEnc.setPassword("kydbmJasyptPass");
		
        ConfigProperties configProperties = ConfigProperties.getInstance();
        
        String subject = "[제목없음]";  //본문제목
        if(null != targetMail.get("CONT_SUBJECT")) {
        	subject = targetMail.get("CONT_SUBJECT").toString();  //본문제목
        }
        String content = targetMail.get("CONT_BODY").toString(); //본문내용
        String host =  configProperties.getProperty("email.smtp.host"); //smtp호트스
        String id =  pbeEnc.decrypt(configProperties.getProperty("email.smtp.id")); //smtp아이디
        String pw =  pbeEnc.decrypt(configProperties.getProperty("email.smtp.password")); //smtp패스워드
        String mailMode = configProperties.getProperty("email.indv.mode"); //테스트모드 설정
        String testToMail = configProperties.getProperty("email.indv.test.tomail"); //테스트모드 설정

        //SMTP계정접속정보가 존재할 경우에만 처리함.
        if(StringUtils.isNotEmpty(host) && StringUtils.isNotEmpty(id) && StringUtils.isNotEmpty(pw)){
        	 try {
                 Properties props = new Properties();
                 props.put("mail.smtp.host",host);
                 props.put("mail.smtp.conectiontimeout",1000*10);
                 props.put("mail.smtp.timeout",1000*10);
                
                 
//                 props.put("mail.smtp.auth","true");
                 Session msgSession = Session.getDefaultInstance(props,null);
                 msgSession.setDebug(false);
                 MimeMessage msg = new MimeMessage(msgSession);
                 MimeMultipart multipart = new MimeMultipart ( "related" ) ;
                 InternetAddress from;  //보내는사람
                 InternetAddress[] arrToAddress = null; //받는사람[복수]
                 InternetAddress[] arrCcAddress = null; //참조[복수]
             	InternetAddress[] arrBccAddress = null; //숨겨진 참조[복수]
             	String strToAddress = targetMail.get("RECV_EMAIL_TO").toString();
             	String strCcAddress = null;
             	String strBccAddress = null;
             	if(targetMail.containsKey("RECV_EMAIL_CC") && null != targetMail.get("RECV_EMAIL_CC")){
             		strCcAddress = targetMail.get("RECV_EMAIL_CC").toString();
             	}
             	if(targetMail.containsKey("RECV_EMAIL_BCC") && null != targetMail.get("RECV_EMAIL_BCC")){
             		strBccAddress = targetMail.get("RECV_EMAIL_BCC").toString();
             	}
             	
             	from = new InternetAddress(targetMail.get("SEND_EMAIL").toString()); //보내는 사람
             	
                 if(StringUtils.isEmpty(mailMode) ||  mailMode.equals("0")){ //테스트모드일때에는 설정파일에서 테스트메일주소를 설정한다.
                 	arrToAddress = InternetAddress.parse(testToMail); //받는사람 테스트메일 설정
                 }else{
                	 if(StringUtils.isNotEmpty(strToAddress) ) arrToAddress = InternetAddress.parse(strToAddress);
                	 if(StringUtils.isNotEmpty(strCcAddress) ) arrCcAddress = InternetAddress.parse(strCcAddress);
                	 if(StringUtils.isNotEmpty(strBccAddress) ) arrBccAddress = InternetAddress.parse(strBccAddress);
                 }
                 
                 //메일 대상이 존재하면 메일을 송신한다.
                 if(arrToAddress.length > 0){
                	 MimeBodyPart mimeBodyPart1 = new MimeBodyPart();
                  	mimeBodyPart1.setContent(content, "text/html;charset=UTF-8");
                  	multipart.addBodyPart(mimeBodyPart1);
                	 //첨부파일
                  	String fileServerUrl = configProperties.getProperty("monarch.fileupload.path");
                 	 for (Map<String,Object> attachedFile : attcFileList) {
    					MimeBodyPart mimeBodyPart2 = new MimeBodyPart();
    					String filePath = attachedFile.get("FILE_PATH").toString();
    					String fullPath = fileServerUrl+ "/" +filePath  ;
    					FileDataSource fds =new FileDataSource(fullPath);
    					mimeBodyPart2.setDataHandler(new DataHandler(fds));
    					mimeBodyPart2.setFileName(MimeUtility.encodeText(attachedFile.get("FILE_NAME").toString(),"EUC-KR","B"));
//    					mimeBodyPart2.setFileName(MimeUtility.encodeText(fds.getName(),"EUC-KR","B"));
    					
    					multipart.addBodyPart(mimeBodyPart2);
    				}
//     	            msg.setContent(content, "text/html;charset=UTF-8");
						msg.setContent(multipart);
						msg.setSentDate(new Date());
						msg.setSubject(subject ,"utf-8");    //제목
						msg.setFrom(from);
						
						msg.addRecipients(Message.RecipientType.TO, arrToAddress);
						if(null != arrCcAddress &&  0 < arrCcAddress.length) msg.addRecipients(Message.RecipientType.CC, arrCcAddress);
						if(null != arrBccAddress && 0 < arrBccAddress.length) msg.addRecipients(Message.RecipientType.BCC ,arrBccAddress);
                 	
//                 	 Transport.send(msg);
                 	 //테스트모드가 아닐때에는 메일관리테이블에 각 메일 정보의 상태를 송신완료'1'로 갱신한다. 
                 	 
                 	
                 	 /* 아래와 같이 하면 성공 start*/
					try {
						Transport transport = msgSession.getTransport("smtp");
						transport.connect(host, id, pw);
						transport.sendMessage(msg, msg.getAllRecipients());
						transport.close();
						updateIndvEmailState(targetMail.get("MC_INDV_EMAIL_NO").toString(),CommonConst.SMTP_INDV_STATE.SEND_SUCCESS.getVal()); 
						 success = true;
					} catch(MessagingException e ){
						log.error("STMP커넥션 오류",e);
						success = false;
						 throw new Exception();
					} catch(Exception e){
						 success = false;
						 throw new Exception();
					}
                 	 /* 아래와 같이 하면 성공 end*/
                 }else{
                 	success = false;
                 	 throw new Exception();
                 }
             } catch(Exception e) {
                 e.printStackTrace();
             	log.error("다이렉트 메일 발송 오류 발생",e);
                 try{
                	 updateIndvEmailState(targetMail.get("MC_INDV_EMAIL_NO").toString(), CommonConst.SMTP_INDV_STATE.SEND_FAIL.getVal());
                 }catch(Exception e2){
                 	log.error("메일발송상태값 갱신중 오류 발생",e2);
                 }
                 success = false;
             }
        	 
        }else {
        	log.warn("SMTP서버 계정접속 정보가 존재하지 않습니다.");
        }

        return success;
	}
	
	/**
	 * SMTP 개별 다이렉트 메일송신후 상태 갱신 메소드
	 * @param mailInfo
	 */
	private int updateIndvEmailState(String mcIndvEmailNo, String Stat) {
		// 송신한 메일 정보의 발송상태를 갱신한다.
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		String sqlComm = "UPDATE MC_INDV_EMAIL SET ";
		sqlComm += " INDV_STATE = :INDV_STATE " ;
		sqlComm += " ,UPD_DATE = " + QueryGenerator.genSysDate(DB_TYPE, false) ;
		sqlComm += " WHERE MC_INDV_EMAIL_NO = :MC_INDV_EMAIL_NO" ;
		
		Map<String, String> parameters = new HashMap<String, String>();
		parameters.put("MC_INDV_EMAIL_NO", mcIndvEmailNo);
		parameters.put("INDV_STATE", Stat);
		
		//업데이트
		return monArchDao.exeUpdateSpringJdbcNameTemplate(sqlComm, parameters);		
	
		
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
	 * 통지 메일을 읽으면 확인으로 상태를 변경하는 함수
	 * @param receiver
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/setNoticeState")
	public String updateNoticeState(@RequestParam("ReceiverID") String receiver) throws Exception {
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();
		
		// 파라미터 설정
		Map<String, String> param = new HashMap<String, String>();
		param.put("M_RECEIVER_NO", receiver);
		
		// 쿼리 작성 : M_RECEIVER 테이블에서 메일확인여부 컬럼을 업데이트 한다.
		StringBuffer sb = new StringBuffer();
		sb.append( "UPDATE M_RECEIVER ");
		sb.append( "SET    MAIL_CFRM_YN = '1' ");
		sb.append( "WHERE  M_RECEIVER_NO = :M_RECEIVER_NO ");
		
		int result = monArchDao.exeUpdateSpringJdbcNameTemplate(sb.toString(), param);
		if ( result < 1 ) {
			throw new Exception();
		}
		
		return null;
	}
	
	/**
	 * 통지 내용 병합 처리 함수
	 * @param nRlt	통지 고유키
	 * @param obj
	 * @return
	 * @throws Exception
	 */
	private Map<String, Object> getNoticeContentParam(int nRlt, String url, Map<String, String> obj) throws Exception {
		MonArchDaoImpl monArchDao = new MonArchDaoImpl();

		String contBody = "";
		if(obj.containsKey("CONT_BODY")){
			contBody = obj.get("CONT_BODY");
		}
		// Mail Content에 넣을 파라미터 가져오기
		Map<String, Object> noticeInfo = new HashMap<String, Object>();
		noticeInfo.put("NT_NO", nRlt); // 번호
		noticeInfo.put("NT_TITLE", obj.get("CONT_SUBJECT").toString()); // 제목
		noticeInfo.put("NT_CONTENT", contBody); // 내용
		noticeInfo.put("NT_LINK", obj.get("LINK_URL").toString()); // url

		// 받는 사람
		String query = "SELECT M_RECEIVER_NO, FN_USER_NAME(RECV_USER) AS RECV_USER, REF_RECV_USER";
		query += " FROM M_RECEIVER";
		query += " WHERE M_INNER_NOTICE_NO = @M_INNER_NOTICE_NO@";
		String recvName = "";
		String ccName = "";
		List<Map<String, Object>> recvList = monArchDao.exeRead(query, obj);
		for ( Map<String, Object> recv : recvList ) {
			if ( "0".equals(recv.get("REF_RECV_USER").toString()) ) {
				recvName += recv.get("RECV_USER") + ";";
			}
			else {
				ccName += recv.get("RECV_USER") + ";";
			}
			// 메일에 입력할 주소
			String comfURL = url + "/setNoticeState.json?ReceiverID=" + recv.get("M_RECEIVER_NO").toString();
			noticeInfo.put("NT_URL", comfURL);
		}
		noticeInfo.put("SITE_URL", url);
		noticeInfo.put("NT_TO", recvName); // TO
		noticeInfo.put("NT_CC", ccName); // CC
		
		// 보낸 사람
		query = "SELECT FN_USER_NAME(SEND_USER) AS SEND_USER, TO_CHAR(SEND_DATE, 'YYYY-MM-DD HH24:MI:SS') AS SEND_DATE"
				+ " FROM M_INNER_NOTICE WHERE M_INNER_NOTICE_NO =  :M_INNER_NOTICE_NO";
		Map<String, Object> sendName = monArchDao.queryForMap(query, obj);
		noticeInfo.put("NT_FROM", sendName.get("SEND_USER").toString()); // FROM
		noticeInfo.put("NT_DATE", sendName.get("SEND_DATE").toString()); // 날짜
		
		return noticeInfo;
	}
	
	private String getNoticeContentStr() {
		StringBuffer sb = new StringBuffer();
		sb.append("<table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\">");
		sb.append("<tbody><tr><td>");
		
		sb.append("<style type=\"text/css\">");
		sb.append("TD { FONT-SIZE: 9pt; COLOR: #000; WORD-BREAK: break-all; FONT-FAMILY: verdana, Arial, Helvetica }");
		sb.append(".Style1 { 	FONT-SIZE: 9pt; COLOR: #265F88; WORD-BREAK: break-all; FONT-FAMILY: verdana, Arial, Helvetica; font-weight:bold}");
		sb.append("A:link { COLOR: #333; TEXT-DECORATION: underline;font-weight:bold;FONT-SIZE:13px }");
		sb.append("A:visited { COLOR: #333; TEXT-DECORATION: underline;font-weight:bold;FONT-SIZE:13px }");
		sb.append("A:hover { 	COLOR:#003399; TEXT-DECORATION: underline;FONT-SIZE:13px }");
		sb.append("A.NOTI:link { COLOR: #FF9900; TEXT-DECORATION: NONE; }");
		sb.append("A.NOTI:visited { COLOR: #FF9900; TEXT-DECORATION: underline; }");
		sb.append("A.NOTI:hover {	COLOR:FF9900; TEXT-DECORATION: underline; }");
		sb.append("</style>");
		
		sb.append("<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\">");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td width=\"590\"><img src=\"@SITE_URL@/image/mail/notice/insidetop.gif\" width=\"590\" height=\"62\"></td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td width=\"590\" background=\"@SITE_URL@/image/mail/notice//insidebg.gif\" align=\"center\">");
		sb.append("<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"10\">");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td valign=\"top\">");
		sb.append("<table width=\"520\" border=\"0\" cellpadding=\"2\" cellspacing=\"1\" bgcolor=\"#c5dae7\">");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td width=\"15%\" height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\">&nbsp;&nbsp;<span class=\"Style111\">From :</span></td>");
		sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\">@NT_FROM@</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td width=\"15%\" height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\">&nbsp;&nbsp;<span class=\"Style111\">To :</span></td>");
		sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\"><b>@NT_TO@</b></td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td width=\"15%\" height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\">&nbsp;&nbsp;<span class=\"Style111\">CC:</span></td>");
		sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\"><b>@NT_CC@</b></td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td width=\"15%\" height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\">&nbsp;&nbsp;<span class=\"Style111\">제목:</span></td>");
		sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\">@NT_TITLE@</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td width=\"15%\" height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\">&nbsp;&nbsp;<span class=\"Style111\">통지 내용</span></td>");
		sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\">@NT_CONTENT@</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td width=\"15%\" height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\">&nbsp;&nbsp;<span class=\"Style111\">통지 일시:</span></td>");
		sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\">@NT_DATE@</td>");
		sb.append("</tr>");
		// 메일 상세 사이트에서 keyvalue를 설정하는 스크립트 코드를 작성하면 해당 사이트의 session storage에 저장이 되기 때문에 
		// monarch에선 keyvalue 데이터를 가져올 수 없다.
		// 그래서 monarch 사이트를 a link든 location 이동이든 목록 페이지 밖에 보이지 않는다.
		//sb.append("<tr>");
		//sb.append("<td height=\"23\" align=\"right\" valign=\"top\" bgcolor=\"#e1eff6\" width=\"15%\">&nbsp;&nbsp;<span class=\"Style111\">참조 화면</span></td>");
		//sb.append("<td width=\"85%\" bgcolor=\"#ffffff\" align=\"left\"><a href=\"https://www.linkcrm.co.kr//WebUiDemo/UI900/UI990210.aspx?Url=UI200%2fUI210020.aspx%3fKey%3d7365&amp;ReceiveId=21310&amp;UserId=5108\" target=\"new\">영업 조회</a></td>");
		//sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table>");
		sb.append("<img src=\"@NT_URL@\" width=\"0\" height=\"0\" border=\"0\">");
		sb.append("</td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table>");
		sb.append("</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td>");
		sb.append("<img src=\"@SITE_URL@/image/mail/notice/insidebottom.gif\" width=\"590\" height=\"18\">");
		sb.append("</td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table>");
		
		sb.append("</td></tr></tbody></table>");
		
		return sb.toString();
	}
}
