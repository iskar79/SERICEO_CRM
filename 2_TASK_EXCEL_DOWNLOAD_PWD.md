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
* **신규 반입 파일 7개 (`WebContent/WEB-INF/lib/`에 복사)**:
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

## 3. [Step 2] 프론트엔드 UI 비밀번호 팝업 및 파라미터 전송

브라우저 기본 `prompt()`는 암호가 평문으로 노출되므로, 동적 HTML `<input type="password">` 레이어 팝업을 띄우고 확인 시 백엔드로 비밀번호를 전송하도록 제어합니다.

### 1안) 그리드 컨테이너 레벨 제어 (`WebContent/js/jquery.kdb.superContaner.js`)
* **대상 파일**: `WebContent/js/jquery.kdb.superContaner.js`
* **수정 위치**: `DownXls: function (oCmd) { ... }` 내부, 약 **6870번 라인 부근**

```javascript
// ----------------------------------------------------
// 20261001 khma : HTML 암호 레이어 팝업 동적 생성 및 다운로드 제어
/*
if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
    var _col = new Array();
    $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
} else {
    $.SvcDownXls(_json.service, pl);
}
*/
// [신규 대체 코드 시작]
var isPwdRequired = true; 
if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.usePassword != undefined) {
    isPwdRequired = _jobInfo.xlsOption.usePassword;
}

// 팝업 HTML 그리기
var popHtml = '<div id="excelPwdLayer" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:320px; background:#fff; border:2px solid #2b579a; padding:20px; z-index:99999; box-shadow:0 0 15px rgba(0,0,0,0.5); border-radius:4px;">';
popHtml += '<h3 style="margin-top:0; font-size:14px; font-weight:bold; color:#2b579a;">엑셀 다운로드 보안설정</h3>';
popHtml += '<p style="font-size:12px; margin-bottom:10px; color:#555;">' + (isPwdRequired ? '엑셀 열람 비밀번호를 입력해 주세요.' : '암호 없이 받으시려면 빈칸으로 확인을 누르세요.') + '</p>';
popHtml += '<input type="password" id="txtExcelPwd" style="width:100%; height:28px; margin-bottom:15px; padding:0 6px; box-sizing:border-box; border:1px solid #ccc;" />';
popHtml += '<div style="text-align:center;">';
popHtml += '<button id="btnExcelPwdOk" style="padding:6px 16px; margin-right:6px; cursor:pointer; background:#2b579a; color:#fff; border:none; border-radius:3px;">확인</button>';
popHtml += '<button id="btnExcelPwdCancel" style="padding:6px 16px; cursor:pointer; background:#e0e0e0; color:#333; border:none; border-radius:3px;">취소</button>';
popHtml += '</div></div>';
popHtml += '<div id="excelPwdDim" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000; opacity:0.4; z-index:99998;"></div>';

// 기존 팝업 제거 후 바디에 추가
$("#excelPwdLayer, #excelPwdDim").remove();
$("body").append(popHtml);
$("#txtExcelPwd").focus();

// [확인] 버튼 클릭 이벤트
$("#btnExcelPwdOk").click(function() {
    var inputPwd = $.trim($("#txtExcelPwd").val());
    
    if (isPwdRequired && inputPwd === "") {
        alert("비밀번호 입력은 필수입니다.");
        $("#txtExcelPwd").focus();
        return;
    }
    
    // 팝업 닫기
    $("#excelPwdLayer, #excelPwdDim").remove();
    
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

## 4. [Step 3] 백엔드 컨트롤러 파라미터 수신 (`UploadController.java`)

클라이언트에서 넘어온 `excelPassword` 파라미터를 추출하여 엑셀 생성 클래스(`ExcelDownload`)로 전달합니다.

* **대상 파일**: `src/co/kr/kydbm/core/filecontrol/UploadController.java`
* **수정 메서드**: `downExcel(@RequestParam("XmlParms") String XmlParms, ...)`

### 📝 적용 코드 (Diff)

**1) 파라미터 추출 부분 (약 838라인 부근):**
```java
		UID = obj.get("UID");
		USITE = obj.get("USITE");

		// 20261001 khma : 엑셀 암호화 비밀번호 파라미터 추출
		String excelPassword = "";
		if (obj.containsKey("excelPassword") && StringUtils.isNotEmpty(obj.get("excelPassword"))) {
			excelPassword = URLDecoder.decode(obj.get("excelPassword"), "UTF-8");
		}
```

**2) 호출부 전달 부분 (약 975라인 부근):**
```java
  		} else {
	      ExcelDownload excelDownload = new ExcelDownload();
// 20261001 khma : 암호화 파라미터 추가로 인한 기존 호출 주석처리
//	      excelDownload.downExcel(ds, fileName, type, request, response, arrHeaderInfo, xlsType);
// 20261001 khma : excelPassword 파라미터 추가 전달
	      excelDownload.downExcel(ds, fileName, type, request, response, arrHeaderInfo, xlsType, excelPassword);
  		}
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
