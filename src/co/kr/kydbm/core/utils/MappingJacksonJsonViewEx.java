package co.kr.kydbm.core.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.util.DefaultPrettyPrinter;
import org.springframework.web.servlet.view.json.MappingJacksonJsonView;

import co.kr.kydbm.core.service.LoginController;

public class MappingJacksonJsonViewEx extends MappingJacksonJsonView {
	
	private Logger log = Logger.getLogger(LoginController.class);

	private JsonEncoding encoding = JsonEncoding.UTF8;
	private ObjectMapper objectMapper = new ObjectMapper();
		
	@Override
	protected void renderMergedOutputModel(Map<String, Object> model,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		// model에 어떤 데이터가 있는지 확인
		//log.debug("MappingJacksonJsonView : log test");
		//for ( String key : model.keySet() ) 
		//	log.debug(key);
		
		// resultData 가 있는 경우 
		if ( model.get("resultData") != null && model.get("resultData").getClass().equals(java.util.ArrayList.class) ) {
			// resultData를 가져와서 replace된 value를 넣어준다.
			List<Map<String, Object>> resultData = (ArrayList<Map<String, Object>>)model.get("resultData");
			
			for ( Map<String, Object> param : resultData ) {
				for ( String key : param.keySet() ) {
					if ( param.get(key) != null ) {
						Class<?> paramType = param.get(key).getClass();
						if ( paramType.equals(java.lang.String.class) ) {
							String requestValue = (String)param.get(key);
							if ( !requestValue.equals("") )
								requestValue = MonarchSecurity.escapeHTML(requestValue);
							param.put(key, requestValue);
						}
					}
				}
			}
		}
		
		Object value = filterModel(model);
		JsonGenerator generator = 
				objectMapper.getJsonFactory().createJsonGenerator(response.getOutputStream(), JsonEncoding.UTF8);
		DefaultPrettyPrinter dp = new DefaultPrettyPrinter();
		generator.setPrettyPrinter(dp);
		objectMapper.writeValue(generator, value);
	}
}
