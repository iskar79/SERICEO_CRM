package co.kr.kydbm.core.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// 20261029 khma 제외 처리 : 미사용 로거 import 정리
// import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.util.DefaultPrettyPrinter;
// 20261029 khma : Spring 4.3.30 업그레이드에 따른 구형 MappingJacksonJsonView 상속을 AbstractView로 변경
/*
import org.springframework.web.servlet.view.json.MappingJacksonJsonView;

import co.kr.kydbm.core.service.LoginController;
*/
import org.springframework.util.CollectionUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.servlet.view.AbstractView;

/**
 * MonArch 공통 JSON 응답 View 클래스 (Monarch820-servlet.xml 내 jsonView 빈 매핑)
 * - 컨트롤러(SvcCRUD 등)에서 반환한 Model 데이터를 JSON 포맷으로 직렬화하여 응답 스트림으로 출력한다.
 * - 응답 데이터(resultData) 내 문자열 필드에 대해 XSS 방지용 HTML 이스케이프(MonarchSecurity.escapeHTML) 처리를 수행한다.
 */
// 20261029 khma : Spring 4.3.30 호환을 위해 AbstractView 상속으로 변경 (Jackson 1.x 호환성 유지)
/*
public class MappingJacksonJsonViewEx extends MappingJacksonJsonView {
	
	private Logger log = Logger.getLogger(LoginController.class);
*/
public class MappingJacksonJsonViewEx extends AbstractView {

	// 20261029 khma Start : Spring 4.3.30 전환에 따른 기본 Content-Type 상수 추가
	/** 기본 JSON 응답 Content-Type */
	public static final String DEFAULT_CONTENT_TYPE = "application/json";
	// 20261029 khma End : Spring 4.3.30 전환에 따른 기본 Content-Type 상수 추가

	/** JSON 출력 인코딩 (UTF-8 기본) */
	private JsonEncoding encoding = JsonEncoding.UTF8;

	/** Jackson 1.x JSON 직렬화 매퍼 */
	private ObjectMapper objectMapper = new ObjectMapper();

	// 20261029 khma Start : 구형 MappingJacksonJsonView에서 제공하던 프로퍼티 및 필터링/헤더 설정 메서드 자체 구현
	/** JSON 응답 앞단에 '{} &&' 보안 프리픽스 부착 여부 (Monarch820-servlet.xml의 prefixJson 프로퍼티와 매핑) */
	private boolean prefixJson = false;

	/** 직렬화 대상으로 지정할 특정 모델 키 목록 (미지정 시 전체 모델 키 대상) */
	private Set<String> modelKeys;

	/** 단일 키 모델일 경우 키 껍데기 없이 값만 추출할지 여부 */
	private boolean extractValueFromSingleKeyModel = false;

	/** 브라우저의 JSON 응답 캐싱 방지 헤더 적용 여부 */
	private boolean disableCaching = true;

	/**
	 * 기본 생성자: Content-Type을 application/json으로 설정하고 경로 변수 노출을 비활성화한다.
	 */
	public MappingJacksonJsonViewEx() {
		setContentType(DEFAULT_CONTENT_TYPE);
		setExposePathVariables(false);
	}

	public void setPrefixJson(boolean prefixJson) {
		this.prefixJson = prefixJson;
	}

	public void setModelKeys(Set<String> modelKeys) {
		this.modelKeys = modelKeys;
	}

	public Set<String> getModelKeys() {
		return this.modelKeys;
	}

	public void setRenderedAttributes(Set<String> renderedAttributes) {
		this.modelKeys = renderedAttributes;
	}

	public Set<String> getRenderedAttributes() {
		return this.modelKeys;
	}

	public void setExtractValueFromSingleKeyModel(boolean extractValueFromSingleKeyModel) {
		this.extractValueFromSingleKeyModel = extractValueFromSingleKeyModel;
	}

	public void setDisableCaching(boolean disableCaching) {
		this.disableCaching = disableCaching;
	}

	/**
	 * JSON 응답 전송 전 HTTP 헤더(Content-Type, UTF-8 캐릭터셋, 캐시 방지 헤더)를 설정한다.
	 */
	@Override
	protected void prepareResponse(HttpServletRequest request, HttpServletResponse response) {
		response.setContentType(getContentType());
		response.setCharacterEncoding(this.encoding.getJavaName());
		if (this.disableCaching) {
			response.addHeader("Pragma", "no-cache");
			response.addHeader("Cache-Control", "no-cache, no-store, max-age=0");
			response.addDateHeader("Expires", 1L);
		}
	}

	/**
	 * Model 객체에서 JSON 직렬화에 불필요한 Spring 내부 객체(BindingResult 등)를 제외하고 순수 데이터만 필터링한다.
	 */
	protected Object filterModel(Map<String, Object> model) {
		Map<String, Object> result = new HashMap<String, Object>(model.size());
		Set<String> renderedAttributes = !CollectionUtils.isEmpty(this.modelKeys) ? this.modelKeys : model.keySet();
		for (Map.Entry<String, Object> entry : model.entrySet()) {
			if (!(entry.getValue() instanceof BindingResult) && renderedAttributes.contains(entry.getKey())) {
				result.put(entry.getKey(), entry.getValue());
			}
		}
		return (this.extractValueFromSingleKeyModel && result.size() == 1 ? result.values().iterator().next() : result);
	}
	// 20261029 khma End : 구형 MappingJacksonJsonView에서 제공하던 프로퍼티 및 필터링/헤더 설정 메서드 자체 구현

	/**
	 * 컨트롤러 처리 결과(model)의 문자열 값에 HTML 이스케이프를 적용한 뒤 JSON 스트림으로 직렬화하여 클라이언트에 전송한다.
	 */
	@SuppressWarnings("unchecked")
	@Override
	protected void renderMergedOutputModel(Map<String, Object> model,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		// 조회 결과 리스트(resultData)가 존재하는 경우 모든 문자열 컬럼에 대해 HTML 특수문자 이스케이프 처리
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

		// 불필요한 바인딩 객체를 걸러낸 후 Jackson JsonGenerator로 응답 스트림 출력
		Object value = filterModel(model);
		// 20261029 khma : 인코딩 필드(this.encoding) 및 prefixJson 설정 반영
		/*
		JsonGenerator generator = 
				objectMapper.getJsonFactory().createJsonGenerator(response.getOutputStream(), JsonEncoding.UTF8);
		*/
		JsonGenerator generator = 
				objectMapper.getJsonFactory().createJsonGenerator(response.getOutputStream(), this.encoding);
		if (this.prefixJson) {
			generator.writeRaw("{} && ");
		}
		DefaultPrettyPrinter dp = new DefaultPrettyPrinter();
		generator.setPrettyPrinter(dp);
		objectMapper.writeValue(generator, value);
	}
}
