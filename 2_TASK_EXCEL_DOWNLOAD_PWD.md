# Task 2: 엑셀 다운로드 암호화 기능 개발 가이드

본 문서는 SERICEO CRM의 고객 리스트 및 엑셀 다운로드 기능에 사용자 비밀번호 보호(열람 시 암호 요구) 기능을 추가하기 위한 실무 개발 가이드입니다.

> **[핵심 기술 및 아키텍처 원칙]**  
> * **기존 한계**: 구형 `jxl(JExcelApi)` 및 구형 `.xls`(HSSF)는 65,536행 제한 및 암호화 지원에 한계가 있습니다.
> * **최종 표준**: **Apache POI 4.1.2** 기반의 **`SXSSFWorkbook` (대용량 메모리 절감형 스트리밍 XLSX)** + **`EncryptionInfo(EncryptionMode.agile)` + `Encryptor` (현대적인 표준 AES 암호화)**를 적용합니다.
> * **임시 파일 누수 방지**: 대용량 엑셀 생성 후 서버 디스크 풀(Disk Full)을 막기 위해 `finally` 절에서 반드시 `((SXSSFWorkbook)workbook).dispose();`를 호출합니다.

---

## 1. 사전 준비: 라이브러리(JAR) 교체 작업 (필수 선행)

암호화 워크북 생성 및 JDK 11 호환성을 위해 POI 4.1.2로 교체합니다.

* **작업 디렉토리**: `WebContent/WEB-INF/lib/`
* **[규칙 준수] 기존 파일 백업 (물리적 삭제 절대 금지)**:
  * 대치되는 기존 5개 파일은 파일명 뒤에 `_YYYYMMDD`를 붙여 백업 보존합니다:
    * `poi-3.8-20120326.jar` ➡️ `poi-3.8-20120326.jar_20261001`
    * `poi-ooxml-3.8-20120326.jar` ➡️ `poi-ooxml-3.8-20120326.jar_20261001`
    * `poi-ooxml-schemas-3.8-20120326.jar` ➡️ `poi-ooxml-schemas-3.8-20120326.jar_20261001`
    * `poi-scratchpad-3.8-20120326.jar` ➡️ `poi-scratchpad-3.8-20120326.jar_20261001`
    * `xmlbeans-2.3.0.jar` ➡️ `xmlbeans-2.3.0.jar_20261001`
* **신규 반입 파일 7개 (이미 `WebContent/WEB-INF/lib/POI 4.1.2 신규 라이브러리/` 폴더 및 `.zip`에 사전 준비 완료)**:
  > 💡 **VDI 반입 팁**: 인터넷에서 새로 받을 필요 없이, 이미 모아둔 **`POI 4.1.2 신규 라이브러리.zip`** (또는 해당 폴더) 하나만 망연계로 반입한 후 VDI의 `WebContent/WEB-INF/lib/` 직하위로 복사하시면 누락 없이 가장 확실합니다.
  1. `poi-4.1.2.jar`
  2. `poi-ooxml-4.1.2.jar` (핵심: 암호화 Encryptor 모듈 포함)
  3. `poi-ooxml-schemas-4.1.2.jar`
  4. `poi-scratchpad-4.1.2.jar`
  5. `xmlbeans-3.1.0.jar`
  6. `commons-collections4-4.4.jar` (POI 4.x 필수 의존성)
  7. `commons-compress-1.19.jar` (OOXML 암호화 압축 스트림 필수)

---

## 2. [Step 1] 레거시 유틸 호환성 수정 (`CommonExcelUtil.java`)

JAR 교체 후 Eclipse 컴파일 오류를 해결하기 위해 POI 3.8 정수 상수를 POI 4.1.2 `CellType` Enum으로 수정합니다.

* **대상 파일**: `src/co/kr/kydbm/common/CommonExcelUtil.java`
* **수정 메서드**: `getCellData(Cell cell)` (약 30 ~ 75라인 부근)

### 📝 적용 코드 (Diff)
```java
// 20261001 khma : POI 4.1.2 CellType Enum 마이그레이션 적용
/*
		if(cell != null) {
			switch (cell.getCellType()) {
			case Cell.CELL_TYPE_BOOLEAN:
				boolean bdata = cell.getBooleanCellValue();
				data = String.valueOf(bdata);
				break;
			case Cell.CELL_TYPE_NUMERIC:
				if(DateUtil.isCellDateFormatted(cell)){
					Date date = cell.getDateCellValue();
					data = new SimpleDateFormat("yyyy-MM-dd").format(date);
				}else{
					double ddata = cell.getNumericCellValue();
					data = String.valueOf(ddata);
				}
				break;
			case Cell.CELL_TYPE_STRING:
				data = cell.getStringCellValue();
				break;
			case Cell.CELL_TYPE_BLANK:
				break;
			case Cell.CELL_TYPE_ERROR:
				break;
			case Cell.CELL_TYPE_FORMULA:
				data = cell.getCellFormula();
				break;
			default:
				break;
			}
		}
*/
		if(cell != null) {
			switch (cell.getCellType()) {
			case BOOLEAN:
				boolean bdata = cell.getBooleanCellValue();
				data = String.valueOf(bdata);
				break;
			case NUMERIC:
				if(DateUtil.isCellDateFormatted(cell)){
					Date date = cell.getDateCellValue();
					data = new SimpleDateFormat("yyyy-MM-dd").format(date);
				}else{
					double ddata = cell.getNumericCellValue();
					data = String.valueOf(ddata);
				}
				break;
			case STRING:
				data = cell.getStringCellValue();
				break;
			case BLANK:
				break;
			case ERROR:
				break;
			case FORMULA:
				data = cell.getCellFormula();
				break;
			default:
				break;
			}
		}
```

---

## 3. [Step 2] 프론트엔드 UI 4단 보안 통제 팝업 및 파라미터 전송

고객사 확정 기획서([CRM 메일/문자/전화 타겟 추출 건 추가 요청])에 따라, 엑셀 다운로드 클릭 시 **용도/대상/목적(10자 이상)/파일 패스워드**를 입력받는 4단 모달 팝업을 동적 렌더링하고 유효성 검증 후 백엔드로 전송합니다.

### 1) 그리드 컨테이너 전사 공통 제어 (`WebContent/js/jquery.kdb.superContaner.js`)
* **대상 파일**: `WebContent/js/jquery.kdb.superContaner.js`
* **수정 위치**: `DownXls: function (oCmd) { ... }` 내부, 약 **6870번 라인 부근**

```javascript
// ----------------------------------------------------
// 20261014 khma : 고객사 확정 4단 보안 통제 모달 팝업(용도/대상/목적10자/암호) 동적 렌더링 및 다운로드 제어
/*
if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
    var _col = new Array();
    $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
} else {
    $.SvcDownXls(_json.service, pl);
}
*/
// [20261014 khma 신규 대체 코드 시작]
var isPwdRequired = true; 
if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.usePassword != undefined) {
    isPwdRequired = _jobInfo.xlsOption.usePassword;
}

// 고객사 기획서 기준 4단 팝업 HTML 동적 구성
var popHtml = '<div id="excelPwdLayer" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:380px; background:#fff; border:2px solid #2b579a; padding:22px 24px; z-index:99999; box-shadow:0 0 20px rgba(0,0,0,0.45); border-radius:6px; font-family:\'맑은 고딕\', Malgun Gothic, sans-serif; font-size:12px; color:#333;">';
popHtml += '<h3 style="margin:0 0 14px 0; font-size:15px; font-weight:bold; color:#2b579a; border-bottom:2px solid #2b579a; padding-bottom:6px;">엑셀 다운로드 보안 설정</h3>';

// 1. 용도 선택 (Select)
popHtml += '<div style="margin-bottom:10px; display:flex; align-items:center;">';
popHtml += '<label style="width:70px; font-weight:bold; color:#222;">용도</label>';
popHtml += '<select id="selExcelUsage" style="flex:1; height:28px; padding:2px 4px; border:1px solid #aaa; border-radius:3px;">';
popHtml += '<option value="">:: 선택하세요 ::</option>';
popHtml += '<option value="INFO">정보성</option>';
popHtml += '<option value="OFF_PROMO">오프라인 홍보용</option>';
popHtml += '<option value="ADV_PROMO">광고성 홍보용</option>';
popHtml += '<option value="ETC">기타</option>';
popHtml += '</select></div>';

// 2. 대상 선택 (Radio)
popHtml += '<div style="margin-bottom:10px;">';
popHtml += '<div style="font-weight:bold; color:#222; margin-bottom:4px;">대상</div>';
popHtml += '<div style="display:flex; justify-content:space-between; padding-left:4px;">';
popHtml += '<label style="cursor:pointer;"><input type="radio" name="rdoExcelTarget" value="ALL" checked style="vertical-align:middle; margin-right:3px;" />전체</label>';
popHtml += '<label style="cursor:pointer;"><input type="radio" name="rdoExcelTarget" value="EMAIL" style="vertical-align:middle; margin-right:3px;" />이메일 수신</label>';
popHtml += '<label style="cursor:pointer;"><input type="radio" name="rdoExcelTarget" value="SMS" style="vertical-align:middle; margin-right:3px;" />SMS 수신</label>';
popHtml += '<label style="cursor:pointer;"><input type="radio" name="rdoExcelTarget" value="TEL" style="vertical-align:middle; margin-right:3px;" />전화 수신</label>';
popHtml += '</div></div>';

// 3. 목적 입력 (Textarea, 10자 이상 필수)
popHtml += '<div style="margin-bottom:10px;">';
popHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:3px;">';
popHtml += '<span style="font-weight:bold; color:#222;">목적</span>';
popHtml += '<span style="font-size:11px; color:#d9534f;">(10글자 이상 입력 필수)</span>';
popHtml += '</div>';
popHtml += '<textarea id="txaExcelReason" placeholder="다운로드 사유를 상세히 입력하세요 (10자 이상)" style="width:100%; height:52px; padding:6px; box-sizing:border-box; border:1px solid #aaa; border-radius:3px; resize:none; font-size:12px;"></textarea>';
popHtml += '</div>';

// 4. 파일 패스워드 (Input)
popHtml += '<div style="margin-bottom:16px;">';
popHtml += '<div style="font-weight:bold; color:#222; margin-bottom:3px;">파일 패스워드</div>';
popHtml += '<input type="password" id="txtExcelPwd" placeholder="예) sericeo1!" style="width:100%; height:28px; padding:0 8px; box-sizing:border-box; border:1px solid #aaa; border-radius:3px;" />';
popHtml += '</div>';

// 버튼 영역
popHtml += '<div style="text-align:center; border-top:1px solid #eee; padding-top:12px;">';
popHtml += '<button id="btnExcelPwdOk" style="padding:6px 20px; margin-right:8px; cursor:pointer; background:#2b579a; color:#fff; font-weight:bold; border:none; border-radius:3px; font-size:12px;">다운로드</button>';
popHtml += '<button id="btnExcelPwdCancel" style="padding:6px 18px; cursor:pointer; background:#e2e2e2; color:#333; border:none; border-radius:3px; font-size:12px;">취소</button>';
popHtml += '</div></div>';
popHtml += '<div id="excelPwdDim" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000; opacity:0.45; z-index:99998;"></div>';

// 기존 팝업 제거 후 바디에 추가
$("#excelPwdLayer, #excelPwdDim").remove();
$("body").append(popHtml);
$("#selExcelUsage").focus();

// [다운로드] 버튼 클릭 이벤트
$("#btnExcelPwdOk").click(function() {
    var usage = $.trim($("#selExcelUsage").val());
    var target = $('input[name="rdoExcelTarget"]:checked').val();
    var reason = $.trim($("#txaExcelReason").val());
    var inputPwd = $.trim($("#txtExcelPwd").val());
    
    // 유효성 검증
    if (usage === "") {
        alert("다운로드 [용도]를 선택해 주세요.");
        $("#selExcelUsage").focus();
        return;
    }
    if (reason.length < 10) {
        alert("다운로드 [목적]은 최소 10글자 이상 구체적으로 입력해야 합니다. (현재 " + reason.length + "자)");
        $("#txaExcelReason").focus();
        return;
    }
    if (isPwdRequired && inputPwd === "") {
        alert("엑셀 파일 열람 [비밀번호]를 입력해 주세요.");
        $("#txtExcelPwd").focus();
        return;
    }
    
    // 팝업 닫기
    $("#excelPwdLayer, #excelPwdDim").remove();
    
    // 백엔드로 파라미터 전달 바인딩
    pl.add("excelUsage", encodeURIComponent(usage));
    pl.add("excelTarget", encodeURIComponent(target));
    pl.add("excelReason", encodeURIComponent(reason));
    if (inputPwd !== "") {
        pl.add("excelPassword", encodeURIComponent(inputPwd));
    }
    
    // 기존 다운로드 실행 로직 호출
    if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
        var _col = new Array();
        $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
    } else {
        $.SvcDownXls(_json.service, pl);
    }
});

// [취소] 버튼 클릭 이벤트
$("#btnExcelPwdCancel").click(function() {
    $("#excelPwdLayer, #excelPwdDim").remove();
});
// ----------------------------------------------------
```

---

## 4. [Step 3] 백엔드 컨트롤러 파라미터 수신 및 감사 로그 적재 (`UploadController.java`)

클라이언트에서 넘어온 `excelUsage`(용도), `excelTarget`(대상), `excelReason`(목적), `excelPassword`(비밀번호) 파라미터를 추출하여,
1. 전용 감사 로그 테이블에 다운로드 이력을 기록하고,
2. `ExcelDownload` 클래스로 전달하여 암호화 파일을 생성합니다.

* **대상 파일**: `src/co/kr/kydbm/core/filecontrol/UploadController.java`
* **수정 메서드**: `downExcel(@RequestParam("XmlParms") String XmlParms, ...)`

### 📝 적용 코드 (Diff)

**1) 파라미터 추출 부분 (약 838라인 부근):**
```java
		UID = obj.get("UID");
		USITE = obj.get("USITE");

		// 20261014 khma : 엑셀 보안 4단 파라미터(용도, 대상, 사유, 암호) 수신 및 디코딩
		String excelUsage    = "";
		String excelTarget   = "";
		String excelReason   = "";
		String excelPassword = "";
		if (obj.containsKey("excelUsage") && StringUtils.isNotEmpty(obj.get("excelUsage"))) {
			excelUsage = URLDecoder.decode(obj.get("excelUsage"), "UTF-8");
		}
		if (obj.containsKey("excelTarget") && StringUtils.isNotEmpty(obj.get("excelTarget"))) {
			excelTarget = URLDecoder.decode(obj.get("excelTarget"), "UTF-8");
		}
		if (obj.containsKey("excelReason") && StringUtils.isNotEmpty(obj.get("excelReason"))) {
			excelReason = URLDecoder.decode(obj.get("excelReason"), "UTF-8");
		}
		if (obj.containsKey("excelPassword") && StringUtils.isNotEmpty(obj.get("excelPassword"))) {
			excelPassword = URLDecoder.decode(obj.get("excelPassword"), "UTF-8");
		}

		// 20261014 khma : 다운로드 감사 로그 적재 (사내 보안 컴플라이언스 준수)
		try {
			String clientIp = request.getRemoteAddr();
			insertExcelDownloadAuditLog(UID, USITE, clientIp, excelUsage, excelTarget, excelReason, ds != null ? ds.size() : 0);
		} catch (Exception logEx) {
			log.error("20261014 khma : 엑셀 다운로드 감사 로그 적재 실패: " + logEx.getMessage());
		}
```

**2) 호출부 전달 부분 (약 975라인 부근):**
```java
  		} else {
	      ExcelDownload excelDownload = new ExcelDownload();
// 20261001 khma : 암호화 파라미터 추가로 인한 기존 호출 주석처리
//	      excelDownload.downExcel(ds, fileName, type, request, response, arrHeaderInfo, xlsType);
// 20261014 khma : excelPassword 파라미터 추가 전달
	      excelDownload.downExcel(ds, fileName, type, request, response, arrHeaderInfo, xlsType, excelPassword);
  		}
```

---

### 🗄️ [신규 테이블] 다운로드 이력 감사 로그 테이블 DDL (`A_EXCEL_DOWN_LOG`)

기획서 명세("해당 정보가 로그에 기록되고, 주기적으로 검토(조회)할 수 있도록 설정")에 따라 신규 생성할 DDL 설계안입니다:

```sql
-- 20261014 khma : 엑셀 다운로드 보안 감사 로그 테이블 신규 생성 DDL
CREATE TABLE A_EXCEL_DOWN_LOG (
    LOG_SEQ         NUMBER(19) NOT NULL,          -- 로그 일련번호 (PK)
    DOWN_USER_ID    VARCHAR2(50) NOT NULL,        -- 다운로드 수행자 사번/ID
    DOWN_USER_NAME  VARCHAR2(100),                -- 다운로드 수행자 성명
    DOWN_IP         VARCHAR2(50),                 -- 요청자 IP 주소
    USAGE_TYPE      VARCHAR2(20) NOT NULL,        -- 용도 (INFO: 정보성 / OFF_PROMO: 오프라인홍보 / ADV_PROMO: 광고성홍보 / ETC: 기타)
    TARGET_TYPE     VARCHAR2(20) NOT NULL,        -- 대상 (ALL: 전체 / EMAIL: 이메일 / SMS: SMS / TEL: 전화)
    DOWN_REASON     VARCHAR2(1000) NOT NULL,      -- 다운로드 목적 (10자 이상 사유)
    ROW_CNT         NUMBER(10) DEFAULT 0,         -- 다운로드 레코드 건수
    REG_DATE        DATE DEFAULT SYSDATE,         -- 다운로드 일시
    CONSTRAINT PK_A_EXCEL_DOWN_LOG PRIMARY KEY (LOG_SEQ)
);

CREATE SEQUENCE SEQ_A_EXCEL_DOWN_LOG START WITH 1 INCREMENT BY 1 NOCACHE;
COMMENT ON TABLE A_EXCEL_DOWN_LOG IS '엑셀 다운로드 보안 감사 로그 테이블 (20261014 khma)';
```

---

### 📊 [타겟 추출 쿼리 매트릭스] 용도 및 대상별 SQL 분기 조건 (기획서 3page 명세)

회원관리(`회원 > 회원관리`) 화면에서 선택한 용도/대상에 따라 데이터 조회 시 결합되는 동적 WHERE 조건입니다:

| 구분 | 정보성 (`INFO`) | 오프라인 홍보용 (`OFF_PROMO`) | 광고성 홍보용 (`ADV_PROMO`) | 기타 (`ETC`) |
| :--- | :--- | :--- | :--- | :--- |
| **사용 테이블** | `a_user` | `a_user`, `a_act_log`, `a_user_dminfo` | `a_user`, `a_act_log`, `a_user_dminfo` | 기존 기능 유지 |
| **공통 조건** | `AND trunc(servstime) <= trunc(sysdate)`<br>`AND trunc(servetime) > trunc(sysdate)` | **[1] a_user 조건**: `site='{@GSITE}' AND corp IS NULL AND useyn='Y' AND trunc(servstime) <= trunc(sysdate) AND trunc(servetime) > trunc(sysdate)`<br>**[2] a_act_log 필수 동의 조건**: `gbn='회원가입' AND subgbn='광고성 정보 전송을 위한 개인정보 수집 이용 동의' AND status='Y'` | 오프라인 홍보용과 동일한 공통 조건 적용 | 기존 기능 유지 |
| **이메일 수신** | `email IS NOT NULL AND emailyn='Y'` | `a_user_dminfo.gbn='CLASS' AND emailyn='Y'` | `a_user_dminfo.gbn='MARKETING' AND emailyn='Y'` | 기존 기능 유지 |
| **SMS 수신** | `mtelno IS NOT NULL AND smsyn='Y'` | `a_user_dminfo.gbn='CLASS' AND smsyn='Y'` | `a_user_dminfo.gbn='MARKETING' AND smsyn='Y'` | 기존 기능 유지 |
| **전화 수신** | `telno IS NOT NULL AND telyn='Y'` | `a_user_dminfo.gbn='CLASS' AND telyn='Y'` | `a_user_dminfo.gbn='MARKETING' AND telyn='Y'` | 기존 기능 유지 |

* **13개 추출 대상 컬럼**:  
  `회원분류, 아이디, 이름, 이메일, 보안아이디, 휴대폰, 비서이메일, 서비스시작일, 서비스종료일, 법인번호, 이메일 수신, SMS 수신, 광고성정보 수신`

---

### ⚙️ [MonArch 정규식 다이나믹 쿼리 적용 표준] 주석 해제(@) 파라미터 매핑 설계

MonArch 코어 엔진(`MonArchDaoImpl.java` 155L)은 아래의 정규식을 사용하여 동적 주석 해제를 수행합니다:
```java
// 주석 블록(/* ... */) 내에 반드시 '@' 파라미터가 포함되어 있어야만 주석을 해제(Uncomment)함
Pattern rows = Pattern.compile("\\/[\\*](.*?)[@](.*?)[\\*]\\/", Pattern.MULTILINE);
```
따라서 `@` 기호가 없는 순수 SQL 주석은 절대 풀리지 않으므로, **주석 내에 파라미터를 명시적으로 배치하여 파라미터 주입 여부로 주석 활성화를 제어**합니다.

#### 1) `M_SERVICE` 엑셀 쿼리 템플릿 WHERE 절 표준
```sql
WHERE 1 = 1
	/* AND CSTID = @CSTID@ */
	/* AND CSTNAME LIKE '%' ||@CSTNAME@|| '%' */
    ...
    -- [1. 정보성/홍보용 기간 체크: @CHK_SERV@ 주입 시 활성화]
    /* AND TRUNC(servstime) <= TRUNC(SYSDATE) AND TRUNC(servetime) > TRUNC(SYSDATE) AND 'Y' = @CHK_SERV@ */

    -- [2. 오프라인/광고성 홍보용 a_act_log 동의 체크: @ACT_STATUS@ 주입 시 활성화 (1:N 중복방지 EXISTS)]
    /* AND EXISTS (SELECT 1 FROM a_act_log act WHERE act.site = a_user.site AND act.useq = a_user.useq AND act.corp IS NULL AND act.useyn = 'Y' AND act.gbn = '회원가입' AND act.subgbn = '광고성 정보 전송을 위한 개인정보 수집 이용 동의' AND act.status = @ACT_STATUS@) */

    -- [3. 오프라인/광고성 홍보용 a_user_dminfo 수신동의 체크: 대상별 파라미터 주입 시 활성화]
    /* AND EXISTS (SELECT 1 FROM a_user_dminfo dm WHERE dm.site = a_user.site AND dm.useq = a_user.useq AND dm.corp IS NULL AND dm.gbn = @DM_GBN@ AND dm.smsyn = @SMS_YN@) */
    /* AND EXISTS (SELECT 1 FROM a_user_dminfo dm WHERE dm.site = a_user.site AND dm.useq = a_user.useq AND dm.corp IS NULL AND dm.gbn = @DM_GBN@ AND dm.emailyn = @EMAIL_YN@) */
    /* AND EXISTS (SELECT 1 FROM a_user_dminfo dm WHERE dm.site = a_user.site AND dm.useq = a_user.useq AND dm.corp IS NULL AND dm.gbn = @DM_GBN@ AND dm.telyn = @TEL_YN@) */

    AND ROWNUM <= 1000
/* ORDER */
```

#### 2) `UploadController.java` 파라미터 매핑 바인딩 로직
```java
// 20261014 khma : 엑셀 다운로드 용도/대상별 MonArch 정규식 다이나믹 쿼리 파라미터 매핑
if ("INFO".equalsIgnoreCase(excelUsage)) {
    paramMap.put("CHK_SERV", "Y");
    if ("EMAIL".equalsIgnoreCase(excelTarget)) paramMap.put("EMAIL_YN", "Y");
    else if ("SMS".equalsIgnoreCase(excelTarget)) paramMap.put("SMS_YN", "Y");
    else if ("TEL".equalsIgnoreCase(excelTarget)) paramMap.put("TEL_YN", "Y");
} 
else if ("OFF_PROMO".equalsIgnoreCase(excelUsage) || "ADV_PROMO".equalsIgnoreCase(excelUsage)) {
    paramMap.put("CHK_SERV", "Y");
    paramMap.put("ACT_STATUS", "Y"); // a_act_log 광고성 정보 수집동의 활성화
    
    String dmGbn = "OFF_PROMO".equalsIgnoreCase(excelUsage) ? "CLASS" : "MARKETING";
    paramMap.put("DM_GBN", dmGbn);
    
    if ("EMAIL".equalsIgnoreCase(excelTarget)) paramMap.put("EMAIL_YN", "Y");
    else if ("SMS".equalsIgnoreCase(excelTarget)) paramMap.put("SMS_YN", "Y");
    else if ("TEL".equalsIgnoreCase(excelTarget)) paramMap.put("TEL_YN", "Y");
}
// 'ETC'(기타) 선택 시에는 관련 파라미터를 일절 주입하지 않으므로 모든 주석이 그대로 유지됨!
```

---

## 5. [Step 4] 엑셀 암호화 생성 엔진 구현 (`ExcelDownload.java`)

POI 4.1.2 기반 `SXSSFWorkbook`으로 대용량 엑셀을 생성하고, 비밀번호가 입력된 경우 **Agile Encryptor 스트림 암호화**를 적용합니다. 임시 파일 삭제(`dispose()`)를 `finally`에 필수 배치합니다.

* **대상 파일**: `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java`

### 1) import 추가 (파일 상단)
```java
// 20261001 khma : POI 4.1.2 및 암호화 스트림 import 추가
import java.io.OutputStream;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.crypt.EncryptionMode;
import org.apache.poi.poifs.crypt.Encryptor;
```

### 2) 신규 오버로딩 메서드 추가 (약 173라인 부근)
기존 `downExcel` 메서드를 삭제하지 않고, `excelPassword`를 받는 신규 오버로딩 메서드를 추가합니다:

```java
	// 20261001 khma : 엑셀 암호화(POI 4.1.2 Agile) 지원 신규 downExcel 오버로딩 메서드
	public boolean downExcel(List<Map<String, Object>> ds, String service,
			String type, HttpServletRequest request,
			HttpServletResponse response,
			ArrayList<Map<String, Object>> arrHeaderInfo,
			String xlsType, String excelPassword) throws Exception {

		String fileName = service;
		String disposition = getDisposition(fileName + ".xlsx", getBrowser(request));

		// SXSSFWorkbook 생성 (대용량 메모리 최적화: 100행 단위 메모리 유지 후 디스크 플러시)
		SXSSFWorkbook workbook = new SXSSFWorkbook(100);
		OutputStream os = null;

		try {
			Sheet sheet = workbook.createSheet(fileName);
			int rowNum = 0;

			// 1. 헤더 행 생성
			if (arrHeaderInfo != null && arrHeaderInfo.size() > 0) {
				Row headerRow = sheet.createRow(rowNum++);
				for (int i = 0; i < arrHeaderInfo.size(); i++) {
					Cell cell = headerRow.createCell(i);
					String colTitle = arrHeaderInfo.get(i).get("title") != null ? arrHeaderInfo.get(i).get("title").toString() : "";
					cell.setCellValue(colTitle);
				}
			}

			// 2. 데이터 행 생성
			if (ds != null && ds.size() > 0) {
				for (Map<String, Object> rowData : ds) {
					Row dataRow = sheet.createRow(rowNum++);
					if (arrHeaderInfo != null && arrHeaderInfo.size() > 0) {
						for (int colIdx = 0; colIdx < arrHeaderInfo.size(); colIdx++) {
							String key = arrHeaderInfo.get(colIdx).get("field").toString();
							Object val = rowData.get(key);
							dataRow.createCell(colIdx).setCellValue(val != null ? val.toString() : "");
						}
					} else {
						int colIdx = 0;
						for (String key : rowData.keySet()) {
							if (!"RNUM".equals(key) && !"RCOUNT".equals(key)) {
								Object val = rowData.get(key);
								dataRow.createCell(colIdx++).setCellValue(val != null ? val.toString() : "");
							}
						}
					}
				}
			}

			// 3. HTTP 응답 헤더 설정 (.xlsx 포맷)
			response.reset();
			response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			response.setHeader("Content-Disposition", disposition);
			response.setHeader("Content-Transfer-Encoding", "binary;");
			response.setHeader("Pragma", "no-cache;");
			response.setHeader("Expires", "-1;");
			os = response.getOutputStream();

			// 4. 비밀번호 존재 여부에 따른 암호화 분기 처리
			if (excelPassword != null && !"".equals(excelPassword.trim())) {
				// POI 4.1.2 Agile 암호화 적용 (표준 AES)
				POIFSFileSystem fs = new POIFSFileSystem();
				EncryptionInfo info = new EncryptionInfo(EncryptionMode.agile);
				Encryptor enc = info.getEncryptor();
				enc.confirmPassword(excelPassword.trim());

				// 워크북을 암호화 스트림에 기록
				OutputStream encOs = enc.getDataStream(fs);
				workbook.write(encOs);
				encOs.close();

				// 암호화된 파일시스템을 HTTP 응답 출력 스트림으로 방출
				fs.writeFilesystem(os);
				fs.close();
			} else {
				// 비밀번호가 없으면 일반 평문 엑셀로 직접 방출
				workbook.write(os);
			}

			os.flush();

		} catch (Exception e) {
			log.error("20261001 khma : 엑셀 생성 및 암호화 중 오류 발생: " + e.getMessage(), e);
			throw new Exception("엑셀 파일 다운로드 중 오류가 발생하였습니다.");
		} finally {
			// 5. 메모리 찌꺼기 및 SXSSF 임시 파일 강제 정리 (디스크 누수 방지 필수)
			if (workbook != null) {
				workbook.dispose();
				workbook.close();
			}
			if (os != null) {
				os.close();
			}
		}
		return true;
	}
```

---

## 6. [Step 5] 단위 테스트 및 검증 체크리스트

1. **컴파일 검증**:
   - `CommonExcelUtil.java`, `UploadController.java`, `ExcelDownload.java` 수정 후 이클립스 `Problems` 탭 에러 0건 확인.
2. **팝업 취소 검증**:
   - 엑셀 다운로드 클릭 후 암호 팝업에서 [취소] 클릭 시 다운로드가 실행되지 않고 팝업만 정상 닫힘 확인.
3. **암호화 파일 열람 검증**:
   - 비밀번호(예: `crm1234`) 입력 후 다운로드된 `.xlsx` 파일 실행 시 **"암호를 입력하십시오"** 창 표출 및 암호 일치 시 정상 열림 확인.
4. **무암호(옵션) 다운로드 검증**:
   - 암호 입력 없이 확인 시 평문 `.xlsx` 파일로 정상 열림 확인.
5. **임시 파일 정리 검증**:
   - 대용량 다운로드 실행 후 OS 톰캣 임시 디렉토리(Temp)에 `.tmp` 파일이 남지 않고 `dispose()`로 즉각 회수되는지 확인.
6. **업로드 사이드이펙트 검증**:
   - 기존 [엑셀 업로드] 기능 실행 시 POI 버전 충돌 없이 정상 동작하는지 확인.
