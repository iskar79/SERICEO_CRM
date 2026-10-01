# Task 2: 엑셀 다운로드 암호화 기능 개발 가이드

본 문서는 SERICEO CRM의 고객 리스트 및 엑셀 다운로드 기능에 비밀번호 보호(옵션) 기능을 추가하기 위한 실무 개발 가이드입니다.

---

## 1. 프론트엔드 (UI 팝업 처리) 상세 가이드
**대상 파일**: `WebContent/js/jquery.kdb.superContaner.js`
**수정 위치**: `DownXls: function (oCmd) { ... }` 내부, 약 **6870번 라인 부근**의 `$.SvcDownXls(_json.service, pl);` 직전 위치를 찾습니다.

### 📝 적용 코드 (복사/붙여넣기)
* **수정 대상 파일**: `WebContent/js/jquery.kdb.superContaner.js` (약 6870번 라인 부근)

⚠️ **매우 중요**: 단순히 코드를 추가하는 것이 아니라, **기존의 다운로드 실행 로직을 완전히 삭제하고 아래 코드로 통째로 '교체(Replace)'** 해야 합니다. (그렇지 않으면 팝업이 뜨자마자 백그라운드에서 다운로드가 바로 실행되어 버립니다.)

```javascript
// ----------------------------------------------------
// [삭제해야 할 기존 코드] (이 부분을 찾아서 지우세요)
/*
if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
    var _col = new Array();
    // ... 생략 ...
    $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
} else {
    $.SvcDownXls(_json.service, pl);
}
*/
// ----------------------------------------------------

// ----------------------------------------------------
// [그 자리에 덮어씌울 신규 코드 시작] 20261001 khma : HTML 팝업 동적 생성 및 다운로드 제어
var isPwdRequired = true; 
if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.usePassword != undefined) {
    isPwdRequired = _jobInfo.xlsOption.usePassword;
}

// 팝업 HTML 그리기
var popHtml = '<div id="excelPwdLayer" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:300px; background:#fff; border:1px solid #000; padding:20px; z-index:99999; box-shadow:0 0 10px rgba(0,0,0,0.5);">';
popHtml += '<h3 style="margin-top:0; font-size:14px; font-weight:bold;">엑셀 다운로드 보안설정</h3>';
popHtml += '<p style="font-size:12px; margin-bottom:10px;">' + (isPwdRequired ? '엑셀 파일 암호를 반드시 입력해 주세요.' : '암호 없이 받으시려면 빈칸으로 확인을 누르세요.') + '</p>';
popHtml += '<input type="password" id="txtExcelPwd" style="width:100%; height:25px; margin-bottom:15px; padding:0 5px;" />';
popHtml += '<div style="text-align:center;">';
popHtml += '<button id="btnExcelPwdOk" style="padding:5px 15px; margin-right:5px; cursor:pointer;">확인</button>';
popHtml += '<button id="btnExcelPwdCancel" style="padding:5px 15px; cursor:pointer;">취소</button>';
popHtml += '</div></div>';
popHtml += '<div id="excelPwdDim" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000; opacity:0.3; z-index:99998;"></div>';

// 기존 팝업이 있다면 제거 후 바디에 추가
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
        pl.add("excel_pwd", inputPwd);
    }
    
    // === 기존 다운로드 로직을 이 안으로 이동 (중요) ===
    if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
        var _col = new Array();
        // ... 중간 코드 생략 ... 
        $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
    } else {
        $.SvcDownXls(_json.service, pl);
    }
});

// [취소] 버튼 클릭 이벤트
$("#btnExcelPwdCancel").click(function() {
    $("#excelPwdLayer, #excelPwdDim").remove();
});
// [추가할 코드 끝]
// ----------------------------------------------------
```
> **주의사항**: 브라우저 기본 `prompt()`는 비밀번호가 평문(Plain text)으로 노출되므로 사용할 수 없습니다. 따라서 위처럼 동적 HTML `<input type="password">` 레이어 팝업을 생성하고, 확인(Ok) 버튼을 눌렀을 때만 백엔드로 다운로드 요청(`$.SvcDownXls` 등)을 보내도록 흐름을 완전히 제어해야 합니다.

---

## 2. 백엔드 (엑셀 파일 암호화) 상세 가이드
**대상 파일**: `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java`

> 💡 **[사전 준비: 라이브러리(Jar) 점검]**
> * 엑셀 암호화를 구현하기 위해서는 **Apache POI 라이브러리**가 필수입니다.
> * 현재 VDI 내부망의 `WEB-INF/lib` 폴더에 이미 구형 `poi-3.8-20120326.jar` 세트가 존재하며, 이 버전으로도 암호화 로직(Biff8EncryptionKey)은 정상 동작합니다.
> * 따라서 **2번 과제(엑셀 다운로드 암호화)만 수행할 경우 별도로 다운받아야 할 jar 파일은 없습니다.** (단, 성능과 보안을 위해 가급적 3번 과제의 가이드에 따라 `poi-4.1.2` 버전으로 업그레이드하는 것을 권장합니다.)

### ⚠️ 기술적 과제 및 필요 라이브러리
현재 로직은 구형 **`jxl(JExcelAPI)`**을 사용하여 파일 자체를 잠그는 암호(File Open Password)가 지원되지 않습니다.
**해결책**: 프로젝트에 이미 내장된 **Apache POI**를 사용하여 다운로드 컨트롤러를 전면 재작성해야 합니다.

### 📝 Apache POI 적용 가이드 (가이드라인)
* **수정 대상 파일**: `src/co/kr/kydbm/core/filecontrol/ExcelDownload.java`

컨트롤러 내부에 `excel_pwd` 파라미터를 받는 로직과 POI 암호화 로직을 아래와 같이 추가하세요.

```java
// 1. 파라미터 수신
String excelPwd = request.getParameter("excel_pwd");

// 2. POI Workbook 생성 및 jxl 코드 변환
org.apache.poi.ss.usermodel.Workbook wb = new org.apache.poi.hssf.usermodel.HSSFWorkbook();
org.apache.poi.ss.usermodel.Sheet sheet = wb.createSheet("고객정보");

/* [jxl -> POI 마이그레이션 핵심 문법 비교]
 * 기존 jxl:
 *   Label label = new Label(열index, 행index, "데이터");
 *   sheet.addCell(label);
 * 
 * 변경될 POI:
 *   org.apache.poi.ss.usermodel.Row row = sheet.getRow(행index);
 *   if (row == null) row = sheet.createRow(행index);
 *   org.apache.poi.ss.usermodel.Cell cell = row.createCell(열index);
 *   cell.setCellValue("데이터");
 */

// 3. 암호화 적용 및 다운로드 처리
response.setContentType("application/vnd.ms-excel");
response.setHeader("Content-Disposition", "attachment;filename=" + fileName + ".xls");

if (excelPwd != null && !excelPwd.trim().equals("")) {
    // 암호가 있을 경우 (Biff8EncryptionKey 적용 - HSSF 전용)
    org.apache.poi.hssf.record.crypto.Biff8EncryptionKey.setCurrentUserPassword(excelPwd);
}

// 스트림으로 파일 쓰기
OutputStream out = response.getOutputStream();
wb.write(out);
out.close();

// 암호 키 초기화 (필수)
if (excelPwd != null && !excelPwd.trim().equals("")) {
    org.apache.poi.hssf.record.crypto.Biff8EncryptionKey.setCurrentUserPassword(null);
}
```
