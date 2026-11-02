$path = "WebContent/js/jquery.kdb.superContaner.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Normalize
$cNorm = $content -replace "\r\n", "`n"

$oldBlock = @'
      // [1단계 -> 2단계] 다음 단계 실행 함수
      var fnGoNextStep = function () {
        // 구조체 필드값 취득
        var usage = $.trim($("select[name='XLS_PURPOSE']", $superArea).val());
        var target = $("input[name='XLS_TARGET']:checked", $superArea).val();
        var reason = $.trim($("textarea[name='XLS_REASON']", $superArea).val());

        if (usage === "") {
          alert("다운로드 [용도]를 선택해 주십시오.");
          $("select[name='XLS_PURPOSE']", $superArea).focus();
          return;
        }
        if (!target) {
          target = "ALL";
        }
        if (reason.length < 10) {
          alert("다운로드 [목적]은 최소 10글자 이상 구체적으로 입력해야 합니다. (현재 " + reason.length + "자)");
          $("textarea[name='XLS_REASON']", $superArea).focus();
          return;
        }

        // 1단계 입력값 임시 보관
        var savedUsage = usage;
        var savedTarget = target;
        var savedReason = reason;

        // -----------------------------------------------------------------
        // 20261102 khma : 엑셀 다운로드 사유 및 감사 이력 테이블 저장 시도 (Create)
        // 백엔드 테이블 미배치 상태에서도 다운로드 테스트가 중단되지 않도록 안전 처리
        // -----------------------------------------------------------------
        try {
          var logPl = new JSONClientParameters();
          logPl.add("service", XLS_REASON_POPUP.service);
          logPl.add("method", XLS_REASON_POPUP.method.Create);
          logPl.add("SITE", _M.UserInfo.SID);
          logPl.add("USEQ", _M.UserInfo.id);
          logPl.add("LOGINID", _M.UserInfo.lid || _M.UserInfo.id);
          logPl.add("USER_NAME", _M.UserInfo.name || "");
          logPl.add("MENU_ID", _M.PrevActGbn.currMenuId || "");
          logPl.add("MENU_NAME", _M.PrevActGbn.actionName || "");
          logPl.add("SERVICE_NAME", serviceName);
          logPl.add("METHOD_NAME", _svc);
          logPl.add("XLS_PURPOSE", savedUsage);
          logPl.add("XLS_TARGET", savedTarget);
          logPl.add("XLS_REASON", savedReason);

          // 이력 테이블 저장 호출 (비동기, 실패하더라도 다운로드 프로세스 계속 진행)
          $.PostJsonData("/DATACRUD.json", logPl, function (res) {
            // 이력 저장 성공 콜백
          }, function (err) {
            // DB 테이블 미생성 상태 시에도 예외 통과
          }, true);
        } catch (e) {
          // 로깅 예외 무시
        }

        // [2단계 팝업 HTML] 시스템 모달 팝업 형태 파일 열람 암호 설정 (최소 4자 이상)
        var step2Html = '<div id="excelModalLayer" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:380px; background:#fff; border:2px solid #2b579a; padding:22px 24px; z-index:99999; box-shadow:0 0 20px rgba(0,0,0,0.45); border-radius:6px; font-family:\'맑은 고딕\', Malgun Gothic, sans-serif; font-size:12px; color:#333;">';
        step2Html += '<h3 style="margin:0 0 14px 0; font-size:15px; font-weight:bold; color:#2b579a; border-bottom:2px solid #2b579a; padding-bottom:6px;">[2단계] 엑셀 파일 암호 설정 (필수)</h3>';
        step2Html += '<p style="color:#666; font-size:11px; margin-bottom:12px; line-height:1.4;">※ 개인정보보호 규정에 따라 엑셀 열람 암호는 <strong>필수(최소 4자 이상)</strong>로 설정해야 합니다.</p>';

        step2Html += '<div style="margin-bottom:12px;">';
        step2Html += '<div style="font-weight:bold; color:#222; margin-bottom:4px;">파일 열람 암호 <span style="color:#d9534f;">*</span></div>';
        step2Html += '<input type="password" id="txtExcelPwd1" placeholder="파일 열람 암호 입력 (최소 4자 이상)" style="width:100%; height:28px; padding:0 8px; box-sizing:border-box; border:1px solid #aaa; border-radius:3px;" />';
        step2Html += '</div>';

        step2Html += '<div style="margin-bottom:16px;">';
        step2Html += '<div style="font-weight:bold; color:#222; margin-bottom:4px;">암호 확인 <span style="color:#d9534f;">*</span></div>';
        step2Html += '<input type="password" id="txtExcelPwd2" placeholder="암호를 한 번 더 입력하세요" style="width:100%; height:28px; padding:0 8px; box-sizing:border-box; border:1px solid #aaa; border-radius:3px;" />';
        step2Html += '</div>';

        step2Html += '<div style="text-align:center; border-top:1px solid #eee; padding-top:12px;">';
        step2Html += '<button id="btnStep2Prev" style="padding:6px 16px; margin-right:8px; cursor:pointer; background:#f0f0f0; color:#333; border:1px solid #ccc; border-radius:3px; font-size:12px;">&lt; 이전</button>';
        step2Html += '<button id="btnStep2Submit" style="padding:6px 22px; margin-right:8px; cursor:pointer; background:#2b579a; color:#fff; font-weight:bold; border:none; border-radius:3px; font-size:12px;">다운로드 실행</button>';
        step2Html += '<button id="btnModalCancel2" style="padding:6px 16px; cursor:pointer; background:#e2e2e2; color:#333; border:none; border-radius:3px; font-size:12px;">취소</button>';
        step2Html += '</div></div>';

        $("#excelModalLayer").remove();
        $("body").append(step2Html);
        $("#txtExcelPwd1").focus();

        // [이전] 버튼 클릭 시 1단계 복귀
        $("#btnStep2Prev").click(function () {
          $("#excelModalLayer, #excelModalDim").remove();
          _Obj.superContaner("DownXlsNew", oCmd);
        });

        // [2단계 취소]
        $("#btnModalCancel2").click(function () {
          $("#excelModalLayer, #excelModalDim").remove();
        });

        // [다운로드 실행] 최종 제출
        $("#btnStep2Submit").click(function () {
          var pwd1 = $.trim($("#txtExcelPwd1").val());
          var pwd2 = $.trim($("#txtExcelPwd2").val());

          if (pwd1 === "") {
            alert("엑셀 파일 열람 암호를 입력해 주십시오. (필수)");
            $("#txtExcelPwd1").focus();
            return;
          }
          if (pwd1.length < 4) {
            alert("엑셀 파일 열람 암호는 최소 4자 이상이어야 합니다.");
            $("#txtExcelPwd1").focus();
            return;
          }
          if (pwd1 !== pwd2) {
            alert("입력한 암호와 암호 확인이 일치하지 않습니다.");
            $("#txtExcelPwd2").focus();
            return;
          }

          // 검증 완료 -> 모달 닫기
          $("#excelModalLayer, #excelModalDim").remove();

          // -----------------------------------------------------------------
          // 20261102 khma : 엑셀 다운로드 동적 쿼리 필터 파라미터(XLS_PURPOSE, XLS_TARGET) 머지
          // (XLS_REASON은 쿼리 조건이 아니므로 제외, excelPassword는 백엔드 파일 암호화 생성용)
          // -----------------------------------------------------------------
          pl.add("XLS_PURPOSE", encodeURIComponent(savedUsage));
          pl.add("XLS_TARGET", encodeURIComponent(savedTarget));
          pl.add("excelPassword", encodeURIComponent(pwd1));
          // -----------------------------------------------------------------
          // 20261102 khma : 엑셀 다운로드 보안 감사 및 사유 이력 저장 (Create 호출)
          // -----------------------------------------------------------------
          var plLog = new JSONClientParameters();
          plLog.add("service", "MON_COMMON");
          plLog.add("method", "INSERT_EXCEL_DOWN_LOG");
          plLog.add("USER_ID", (_M.UserInfo && _M.UserInfo.lid) ? _M.UserInfo.lid : "");
          plLog.add("USER_NAME", (_M.UserInfo && _M.UserInfo.name) ? _M.UserInfo.name : "");
          plLog.add("DEPT_NAME", (_M.UserInfo && (_M.UserInfo.departnm || _M.UserInfo.depart)) ? (_M.UserInfo.departnm || _M.UserInfo.depart) : "");
          plLog.add("MENUID", (typeof _M.MENUID !== "undefined") ? _M.MENUID : "");
          plLog.add("ACTIONNAME", _json.title ? _json.title : "");
          plLog.add("SERVICE", _json.service ? _json.service : "");
          plLog.add("METHOD", (_json.method && _json.method.Read) ? (_json.method.Read + "Down") : "Down");
          plLog.add("FILE_NAME", (_json.title ? _json.title : "EXCEL") + ".xlsx");
          plLog.add("XLS_PURPOSE", savedUsage);
          plLog.add("XLS_TARGET", savedTarget);
          plLog.add("XLS_REASON", savedReason);
          plLog.add("TOTAL_RECORD", _RCD_CNT.replace(regex, ""));
          plLog.add("CLIENT_IP", "");

          // 다운로드 실행 함수 정의
          var fnDoDownload = function () {
            if (_jobInfo != undefined && _jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
              var _col = new Array();
              var i = 0;
              $(".body thead > tr:first-child > th", _Obj)
                .not(".resizeBar")
                .each(function () {
                  if (
                    $(this).attr("field") != undefined &&
                    $(this).attr("field") != "" &&
                    $(this).attr("field") != "ROWNUM"
                  ) {
                    _col[$(this).attr("field")] = $(this).attr("label");
                    i++;
                  }
                });
              $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
            } else {
              $.SvcDownXls(_json.service, pl);
            }
          };

          // 이력 저장 AJAX 실행 후 다운로드 진행 (에러 발생 시에도 다운로드 보장)
          try {
            PostJsonData(
              _M.svcUrl[_M.Webtype].crudUrl,
              plLog,
              function (_data) {
                fnDoDownload();
              },
              function () {
                fnDoDownload();
              }
            );
          } catch (eLog) {
            fnDoDownload();
          }
        });
      };
'@

$newBlock = @'
      // [1단계 -> 2단계] 다음 단계 실행 함수
      var fnGoNextStep = function () {
        // 필수값 검증 (모나크 표준 검증)
        var reqFld = $superArea.superContaner("isRequired");
        if (reqFld && reqFld.toKeyString() != "") {
          alert("필수항목중 [" + reqFld.toKeyString() + "] 의 입력이 누락되었습니다.");
          return;
        }

        // 목적 10자 이상 검증
        var reasonVal = $.trim($("textarea[name='XLS_REASON']", $superArea).val());
        if (reasonVal.length < 10) {
          alert("다운로드 [목적]은 최소 10글자 이상 구체적으로 입력해야 합니다. (현재 " + reasonVal.length + "자)");
          $("textarea[name='XLS_REASON']", $superArea).focus();
          return;
        }

        // [2단계 팝업 HTML] 시스템 모달 팝업 형태 파일 열람 암호 설정 (최소 4자 이상)
        var step2Html = '<div id="excelModalLayer" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:420px; background:#fff; border:2px solid #2b579a; padding:22px 24px; z-index:99999; box-shadow:0 0 20px rgba(0,0,0,0.45); border-radius:6px; font-family:\'맑은 고딕\', Malgun Gothic, sans-serif; font-size:12px; color:#333;">';
        step2Html += '<h3 style="margin:0 0 14px 0; font-size:15px; font-weight:bold; color:#2b579a; border-bottom:2px solid #2b579a; padding-bottom:6px;">엑셀 파일 암호 설정 (필수)</h3>';
        step2Html += '<p style="color:#666; font-size:11px; margin-bottom:12px; line-height:1.4;">※ 개인정보보호 규정에 따라 엑셀 열람 암호는 <strong>필수(최소 4자 이상)</strong>로 설정해야 합니다.</p>';

        step2Html += '<div style="margin-bottom:12px;">';
        step2Html += '<div style="font-weight:bold; color:#222; margin-bottom:4px;">파일 열람 암호 <span style="color:#d9534f;">*</span></div>';
        step2Html += '<input type="password" id="txtExcelPwd1" placeholder="파일 열람 암호 입력 (최소 4자 이상)" style="width:100%; height:28px; padding:0 8px; box-sizing:border-box; border:1px solid #aaa; border-radius:3px;" />';
        step2Html += '</div>';

        step2Html += '<div style="margin-bottom:16px;">';
        step2Html += '<div style="font-weight:bold; color:#222; margin-bottom:4px;">암호 확인 <span style="color:#d9534f;">*</span></div>';
        step2Html += '<input type="password" id="txtExcelPwd2" placeholder="암호를 한 번 더 입력하세요" style="width:100%; height:28px; padding:0 8px; box-sizing:border-box; border:1px solid #aaa; border-radius:3px;" />';
        step2Html += '</div>';

        step2Html += '<div style="text-align:center; border-top:1px solid #eee; padding-top:12px;">';
        step2Html += '<button id="btnStep2Prev" style="padding:6px 16px; margin-right:8px; cursor:pointer; background:#f0f0f0; color:#333; border:1px solid #ccc; border-radius:3px; font-size:12px;">&lt; 이전</button>';
        step2Html += '<button id="btnStep2Submit" style="padding:6px 22px; margin-right:8px; cursor:pointer; background:#2b579a; color:#fff; font-weight:bold; border:none; border-radius:3px; font-size:12px;">다운로드 실행</button>';
        step2Html += '<button id="btnModalCancel2" style="padding:6px 16px; cursor:pointer; background:#e2e2e2; color:#333; border:none; border-radius:3px; font-size:12px;">취소</button>';
        step2Html += '</div></div>';

        $("#excelModalLayer").remove();
        $("body").append(step2Html);
        $("#txtExcelPwd1").focus();

        // [이전] 버튼 클릭 시 1단계 복귀
        $("#btnStep2Prev").click(function () {
          $("#excelModalLayer, #excelModalDim").remove();
          _Obj.superContaner("DownXlsNew", oCmd);
        });

        // [2단계 취소]
        $("#btnModalCancel2").click(function () {
          $("#excelModalLayer, #excelModalDim").remove();
        });

        // [다운로드 실행] 최종 제출
        $("#btnStep2Submit").click(function () {
          var pwd1 = $.trim($("#txtExcelPwd1").val());
          var pwd2 = $.trim($("#txtExcelPwd2").val());

          if (pwd1 === "") {
            alert("엑셀 파일 열람 암호를 입력해 주십시오. (필수)");
            $("#txtExcelPwd1").focus();
            return;
          }
          if (pwd1.length < 4) {
            alert("엑셀 파일 열람 암호는 최소 4자 이상이어야 합니다.");
            $("#txtExcelPwd1").focus();
            return;
          }
          if (pwd1 !== pwd2) {
            alert("입력한 암호와 암호 확인이 일치하지 않습니다.");
            $("#txtExcelPwd2").focus();
            return;
          }

          // 검증 완료 -> 모달 닫기
          $("#excelModalLayer, #excelModalDim").remove();

          // -----------------------------------------------------------------
          // 20261102 khma : 구조체에 정의된 모든 필드/입력값을 동적으로 pl에 머지
          // (구조체에 필드가 추가/삭제되어도 JS 수정 없이 100% 자동 연동)
          // -----------------------------------------------------------------
          $(".fieldContaner", $superArea).each(function () {
            var fldName = $(this).attr("field");
            if (fldName) {
              var fldVal = $(this).superContaner("getFieldValue");
              if (fldVal !== undefined && fldVal !== null) {
                pl.add(fldName, encodeURIComponent(fldVal));
              }
            }
          });

          // 파일 열람 암호만 단독 추가 (백엔드 POI 암호화 생성용)
          pl.add("excelPassword", encodeURIComponent(pwd1));

          // 다운로드 실행 함수 정의
          var fnDoDownload = function () {
            if (_jobInfo != undefined && _jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
              var _col = new Array();
              var i = 0;
              $(".body thead > tr:first-child > th", _Obj)
                .not(".resizeBar")
                .each(function () {
                  if (
                    $(this).attr("field") != undefined &&
                    $(this).attr("field") != "" &&
                    $(this).attr("field") != "ROWNUM"
                  ) {
                    _col[$(this).attr("field")] = $(this).attr("label");
                    i++;
                  }
                });
              $.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
            } else {
              $.SvcDownXls(_json.service, pl);
            }
          };

          // -----------------------------------------------------------------
          // 20261102 khma : 모나크 superView 표준 Save(Create) 호출로 이력 저장 후 다운로드
          // (구조체에 선언된 service와 method.Create를 엔진이 자동 실행)
          // -----------------------------------------------------------------
          try {
            $superArea.superContaner("Save", function (res) {
              fnDoDownload();
            });
          } catch (eSave) {
            fnDoDownload();
          }
        });
      };
'@

$oldBlockNorm = $oldBlock -replace "\r\n", "`n"
$newBlockNorm = $newBlock -replace "\r\n", "`n"

if ($cNorm.Contains($oldBlockNorm)) {
    $cNorm = $cNorm.Replace($oldBlockNorm, $newBlockNorm)
    $resultCRLF = $cNorm -replace "`n", "`r`n"
    [System.IO.File]::WriteAllText($path, $resultCRLF, [System.Text.Encoding]::UTF8)
    Write-Host "Replaced with dynamic merge and standard Save"
} else {
    Write-Host "Failed to find oldBlock"
}
