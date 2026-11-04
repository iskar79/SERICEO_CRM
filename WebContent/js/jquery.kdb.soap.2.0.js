/// <reference path="../Resource.js" />
/// <reference path="jquery.kdb.MonArch800.js" />

/* jQuery post get plugin: 
* version 2.0 2026-11-04
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

var e_async = { sync: false, async: true };
var g_async = e_async.async;


// 20261104 khma : Java 서블릿/Spring MVC 단일 환경 표준 (미사용 .NET json dataType 분기 정리)
var _dataType = "text";
/*
var _dataType = "json";
if (_M.Webtype == "Java") _dataType = "text";
*/


/*function PostData(url, pi, ScCallBack, ErCallBack, aSync) {
// aSync = g_async == e_async.async ? false : aSync;
$.ajax({
type: "POST",
url: url,
data: pi.toXml(),
contentType: "application/json; charset=utf-8",
dataType: _dataType,
async: aSync, //_async,
success: function(msg) {
//_msg = eval('(' + msg.d.replace(/\/Date\((\d+)\)\//gi, "new Date($1)") + ')');

_msg = jQuery.parseJSON(msg.d);
ScCallBack(_msg); 
},
error: function(msg) {
//_msg = eval('(' + msg.responseText + ')');
_msg = jQuery.parseJSON(msg.responseText);
alert(_msg.Message);
ErCallBack(_msg);
}
});
};*/

// 20261104 khma Start : 프론트엔드 통신 관문(PostJsonData, PostJsonData2) 예외 처리 방어 및 응답 안전 파싱 보강

/**
 * SERICEO CRM 프론트-백엔드 간 핵심 AJAX POST 통신 관문 함수 (JSONClientParameters 전송 및 응답 수신)
 * 
 * [주요 처리 흐름]
 * 1. 클라이언트 파라미터(pi.toJson())를 JSON 형식으로 서버 URL에 비동기/동기 전송
 * 2. 서버 응답(result)을 감지하여 HTML 오류 페이지(500, 404 등)가 올 경우 SyntaxError 방어 및 안전 JSON 파싱
 * 3. resultInfo 메타 응답 계약 검증 (result: 'SUCCESS' / 'FAIL')
 * 4. 예외 유형별 분기 처리:
 *    - ORA-20000: 오라클 사용자 정의 비즈니스 예외 메시지 정규식 추출 및 안내
 *    - E1000: 세션 만료 예외 감지 시 자동 로그아웃 트리거
 *    - 일반 FAIL: 서버 전달 에러 메시지 알림 및 오류 콜백 실행
 * 5. 오류 콜백(ErCallBack) 안전 실행: 함수 여부를 검증(typeof === 'function')하여 콜백 미전달 시 런타임 에러 방지
 * 
 * @param {string} url - 호출할 백엔드 서비스 엔드포인트 URL (예: /DATACRUD.json)
 * @param {JSONClientParameters} pi - 직렬화 대상 클라이언트 파라미터 객체
 * @param {function} ScCallBack - 통신 및 비즈니스 처리 성공 시 실행할 콜백 함수 (매개변수: 서버 응답 객체)
 * @param {function} [ErCallBack] - 통신 오류 또는 비즈니스 FAIL 발생 시 실행할 오류 콜백 함수 (선택 사항)
 * @param {boolean} [aSync] - 비동기 통신 여부 (true: 비동기 기본값, false: 동기)
 */
function PostJsonData(url, pi, ScCallBack, ErCallBack, aSync) {
    // aSync = g_async == e_async.async ? false : aSync;

    // -------------------------------------------------------------
    // 20261104 khma : 요청 파라미터 직렬화 단계 사전 예외 격리
    // pi.toJson() 실행 중 예외가 발생하더라도 스크립트 중단을 방어하고 ErCallBack으로 안전 통지
    // -------------------------------------------------------------
    var reqData = "";
    try {
        reqData = (pi && typeof pi.toJson === "function") ? pi.toJson() : ((pi && typeof pi === "object") ? JSON.stringify(pi) : String(pi));
    } catch (eReq) {
        alert("요청 파라미터 처리 중 오류가 발생하였습니다.");
        if (typeof ErCallBack === "function") {
            try {
                ErCallBack({
                    resultInfo: {
                        result: "FAIL",
                        errorCode: "E9998",
                        message: "요청 데이터 직렬화 실패: " + eReq.message
                    }
                });
            } catch (eCb) {}
        }
        return;
    }

    $.ajax({
        type: "POST",
        url: url,
        data: reqData, // 직렬화 검증 완료된 JSON 문자열 전송
        contentType: "application/json; charset=utf-8",
        dataType: _dataType, // Java 서버 환경일 경우 텍스트로 수신하여 클라이언트에서 정밀 파싱
        async: aSync, // 동기/비동기 제어
        success: function (result) {
            // -------------------------------------------------------------
            // 20261104 khma : JSON 안전 파싱 (서버 오류로 HTML 수신 시 SyntaxError 예외 방어)
            // 서버 500/404 에러나 JSP 포워딩 등으로 HTML 텍스트가 반환되더라도 
            // jQuery.parseJSON에서 스크립트 실행이 중단되지 않도록 try-catch로 완전 격리
            // -------------------------------------------------------------
            var _result = null;
            try {
                // 20261104 khma : Java Spring 단일 환경 표준화 (미사용 .NET result.d 분기 정리)
                var rawData = result;
                /*
                var rawData = (_M.Webtype == 'Java') ? result : (result && result.d ? result.d : result);
                */
                if (typeof rawData === "object" && rawData !== null) {
                    _result = rawData; // 이미 객체로 파싱된 경우 그대로 사용
                } else if (typeof rawData === "string") {
                    _result = jQuery.parseJSON(rawData); // 문자열일 때만 JSON 파싱 수행
                }
            } catch (eParse) {
                // HTML 에러 페이지 등 비정상 문자열 수신 시 안내 후 오류 콜백 호출
                alert("서버 응답 처리 중 오류가 발생하였습니다.\n(잘못된 응답 형식이 수신되었습니다.)");
                if (typeof ErCallBack === "function") {
                    try {
                        ErCallBack({
                            resultInfo: {
                                result: "FAIL",
                                errorCode: "E9999",
                                message: "응답 데이터 파싱 실패"
                            }
                        });
                    } catch (eCb) {}
                }
                return;
            }

            // -------------------------------------------------------------
            // 20261104 khma : null 또는 비객체 응답 시 에러 콜백으로 안전 격리
            // 서버에서 빈 응답이 오거나 JSON null 수신 시 성공 콜백 내 필드 참조 예외(TypeError) 방어
            // -------------------------------------------------------------
            if (_result === null || typeof _result !== "object") {
                alert("서버에서 올바른 응답 데이터를 수신하지 못했습니다.");
                if (typeof ErCallBack === "function") {
                    try {
                        ErCallBack({
                            resultInfo: {
                                result: "FAIL",
                                errorCode: "E9998",
                                message: "응답 데이터가 비어있거나 올바른 객체가 아닙니다."
                            }
                        });
                    } catch (eCb) {}
                }
                return;
            }

            // -------------------------------------------------------------
            // 20261104 khma : resultInfo 미포함 일반 유효 JSON 객체 응답 호환 처리
            // SvcCRUD 응답이 아닌 일반 JSON 객체를 반환하는 서비스 호출에 대한 하위 호환성 유지
            // -------------------------------------------------------------
            if (!_result.resultInfo) {
                if (typeof ScCallBack === "function") {
                    ScCallBack(_result);
                }
                return;
            }

            // -------------------------------------------------------------
            // 20261104 khma : 서버 비즈니스 처리 결과 분기 (SUCCESS vs FAIL)
            // -------------------------------------------------------------
            var rstTf = _result.resultInfo.result;
            if (rstTf == "SUCCESS") {
                // 메뉴 ID 일치 여부 확인 (이전 메뉴 비동기 응답이 현재 메뉴 화면에 덮어써지는 현상 방어)
                // 불일치하는 stale 응답은 현재 화면의 UI나 다른 요청의 잠금(blockUI)에 간섭하지 않고 안전하게 무시
                if (_result.resultInfo.menuId == undefined || _result.resultInfo.menuId == "0000" || _result.resultInfo.menuId == _M.PrevActGbn.currMenuId) {
                    if (typeof ScCallBack === "function") {
                        ScCallBack(_result);
                    }
                }
            } else {
                // 비즈니스 처리 실패(FAIL) 응답 분기
                var _msg = _result.resultInfo.message || "처리 중 오류가 발생하였습니다.";

                // ① ORACLE의 사용자 정의 예외(ORA-20000) 감지: 프로시저/트리거의 ${에러내용}$ 패턴 정밀 추출
                if (_msg.indexOf('ORA-20000') > -1) {
                    var errmsg = _msg;
                    errmsg = errmsg.substr(errmsg.lastIndexOf('[20000]'), errmsg.length);
                    var _aMsg = errmsg.match(new RegExp("\\${(.*?)}\\$", "gim"));
                    if (_aMsg != null) {
                        var xMsg = _aMsg[0].replace('${', '').replace('}$', '');
                        alert(xMsg);
                    } else {
                        alert(_msg);
                    }
                    // 오류 발생 시 호출 화면의 로딩 스피너/버튼 잠금 해제를 위해 ErCallBack 안전 호출
                    if (typeof ErCallBack === "function") {
                        try { ErCallBack(_result); } catch (eCb) {}
                    }
                } 
                // ② 세션 만료 오류코드(E1000) 감지: ErCallBack 예외 여부와 무관하게 로그아웃 완수 보장
                else if (_result.resultInfo.errorCode == "E1000") {
                    alert(_msg);
                    if (typeof ErCallBack === "function") {
                        try { ErCallBack(_result); } catch (eCb) {}
                    }
                    $(".opticon-logout").trigger("click"); // CRM 공통 로그아웃 트리거 실행
                } 
                // ③ MySQL/MariaDB 사용자 정의 예외 감지
                else if (_msg.indexOf('SQL state [20000]') > -1) {
                    alert(_msg.substr(_msg.lastIndexOf('Exception:') + 11));
                    if (typeof ErCallBack === "function") {
                        try { ErCallBack(_result); } catch (eCb) {}
                    }
                } 
                // ④ 기타 일반 비즈니스 FAIL 예외
                else {
                    alert(_msg);
                    if (typeof ErCallBack === "function") {
                        try { ErCallBack(_result); } catch (eCb) {}
                    }
                }
            }
        },
        error: function (result) {
            // -------------------------------------------------------------
            // 20261104 khma : HTTP 통신 레벨 오류(4xx, 5xx) 안전 파싱 및 콜백 방어
            // 서버 오류로 HTML 에러 페이지가 내려오더라도 JSON 파싱 예외로 중단되지 않도록 보호
            // -------------------------------------------------------------
            var _msg = null;
            try {
                if (result && result.responseText) {
                    _msg = jQuery.parseJSON(result.responseText);
                }
            } catch (eErrParse) {
                _msg = null;
            }

            // HTTP 401 또는 JSON 본문 내 세션 만료(E1000) 감지
            if (_msg && _msg.resultInfo && _msg.resultInfo.result == "FAIL" && _msg.resultInfo.errorCode == "E1000") {
                alert(_msg.resultInfo.message || "세션이 만료되었습니다. 다시 로그인해 주십시오.");
                if (typeof ErCallBack === "function") {
                    try { ErCallBack(_msg); } catch (eCb) {}
                }
                $(".opticon-logout").trigger("click");
            } else {
                // 사용자에게는 안전하게 정제된 공통 오류 메시지만 안내 (서버 스택트레이스/SQL 은닉)
                var displayMsg = "예기치 못한 에러가 발생하였습니다.\n관리자에게 문의하시기 바랍니다.";
                if (_msg && _msg.resultInfo && _msg.resultInfo.message) {
                    displayMsg = _msg.resultInfo.message;
                } else if (_msg && _msg.errorMessage) {
                    displayMsg = _msg.errorMessage;
                }
                alert(displayMsg);

                // 호출 화면 상태 복원을 위한 오류 콜백 안전 실행
                if (typeof ErCallBack === "function") {
                    try {
                        ErCallBack(_msg || {
                            resultInfo: {
                                result: "FAIL",
                                errorCode: "E9999",
                                message: displayMsg
                            },
                            status: result ? result.status : 0
                        });
                    } catch (eCb) {}
                }
            }
        }
    });
}
function PostJsonData2(url, pi, ScCallBack, ErCallBack, aSync) {
    _async = g_async == false ? false : aSync;
    $.ajax({
        type: "POST",
        url: url,
        data: pi.toJson(),
        contentType: "application/json; charset=utf-8",
        dataType: _dataType,
        async: _async,
        success: function (msg) {
            // 성공 콜백 함수 유효성 검증 후 안전 호출
            if (typeof ScCallBack === "function") {
                ScCallBack(msg);
            }
        },
        error: function (msg) {
            // 에러 응답 문자열 개행 처리 및 콜백 함수 유효성 검증 후 안전 호출
            var _msg = (msg && msg.responseText) ? msg.responseText.replace(/\\r\\n/g, String.fromCharCode(13)).replace(/\\u0027/g, "'") : "";
            if (typeof ErCallBack === "function") {
                ErCallBack(_msg);
            }
        }
    });
}
// 20261104 khma End : 프론트엔드 통신 관문(PostJsonData, PostJsonData2) 예외 처리 방어 및 응답 안전 파싱 보강
function GETJSON(name, usite, extOpt) {
    // 구조체가 local에 보관중이면 읽어오고
    if (_M.Jsons[name] != undefined) {
        return _M.Jsons[name];
    }
    
    var rlt = GetJsonServer(name, usite, extOpt)

    _M.Jsons[name] = rlt;

    return rlt;
};

function GetJsonServer(name, usite, extOpt) {
    var pi = new JSONClientParameters();

    pi.add("JsName", name);
    // 20261104 khma : _M.UserInfo Null-Safe 방어 적용
    var uId = (_M.UserInfo && _M.UserInfo.id) ? _M.UserInfo.id : "";
    var uNm = (_M.UserInfo && _M.UserInfo.name) ? _M.UserInfo.name : "";
    var uSite = (undefined != usite) ? usite : ((_M.UserInfo && _M.UserInfo.SID) ? _M.UserInfo.SID : "44");
    var uLang = (_M.UserInfo && _M.UserInfo.lang) ? _M.UserInfo.lang : "KO";
    var uDept = (_M.UserInfo && _M.UserInfo.depart) ? _M.UserInfo.depart : "";

    pi.add("UID", uId);
    pi.add("UNM", uNm);
    pi.add("USITE", uSite);
    pi.add("ULANG", uLang);
    pi.add("UDEPT", uDept);
    
    // 20261104 khma : Java Spring 단일 환경 표준화 (pi.toJson() 직렬화 단일 사용)
    var _data = pi.toJson();
    /*
    var _data = pi.toXml();
    if (_M.Webtype == 'Java') {
        _data = pi.toJson();
    }
    */
    
    var getJsonUrl = _M.svcUrl[_M.Webtype].GetJs;
    if (undefined != extOpt && extOpt == true) {
        getJsonUrl = _M.svcUrl[_M.Webtype].getExtJs;
    }
    
    // -------------------------------------------------------------
    // 20261104 khma : 동기 통신 순서(async: sync) 유지 + 안전 JSON 파싱 및 예외 방어
    // -------------------------------------------------------------
    var rawText = "";
    try {
        var xhr = $.ajax({
            type: "POST",
            url: getJsonUrl,
            data: _data,
            contentType: "application/json; charset=utf-8",
            dataType: _dataType,
            async: _M.aSync.sync // 기존 동기 호출 순서 100% 엄격 유지
        });
        rawText = (xhr && xhr.responseText) ? xhr.responseText : "";
    } catch (eAjax) {
        alert("화면 구조체(" + name + ")를 서버에서 불러오는 중 통신 오류가 발생하였습니다.");
        return undefined;
    }

    if (!rawText) {
        alert("화면 구조체(" + name + ") 응답 데이터가 비어 있습니다.");
        return undefined;
    }

    var rlt = null;
    try {
        rlt = jQuery.parseJSON(rawText);
    } catch (eParse) {
        alert("화면 구조체(" + name + ") 수신 데이터 파싱에 실패하였습니다.\n(서버에서 올바른 JSON 응답을 받지 못했습니다.)");
        return undefined;
    }

    // 20261104 khma : Java Spring 단일 환경 표준화 (미사용 .NET rlt.d eval 분기 정리)
    if (rlt && rlt.resultInfo && rlt.resultInfo.result == "SUCCESS") {
        try {
            // 20261104 khma : STRUCTURE_CONT 객체 변환 (자바스크립트 함수 및 객체 리터럴을 포함하므로 eval('(' + structCont + ')') 표준 평가)
            var structCont = rlt.resultData ? rlt.resultData.STRUCTURE_CONT : null;
            if (typeof structCont === "object" && structCont !== null) {
                rlt = structCont;
            } else if (typeof structCont === "string") {
                rlt = eval('(' + structCont + ')'); // 20121204 khma new 원본 평가 방식 유지
            }
            _M.Jsons[name] = rlt;
        } catch (eStruct) {
            alert("화면 구조체(" + name + ") 설정 데이터 변환에 실패하였습니다.");
            return undefined;
        }
    } else {
        // E1000 외의 일반 비즈니스 FAIL 응답도 명확히 사용자에게 alert 안내 후 undefined 반환
        var errMsg = (rlt && rlt.resultInfo && rlt.resultInfo.message) ? rlt.resultInfo.message : "화면 구조체 정보를 불러오지 못했습니다.";
        if (rlt && rlt.resultInfo && rlt.resultInfo.errorCode == "E1000") {
            alert(errMsg);
            $(".opticon-logout").trigger("click");
        } else {
            alert("[" + name + "] " + errMsg);
        }
        return undefined;
    }
    /*
    if (_M.Webtype == 'Java') { ... } else { rlt = eval('(' + rlt.d + ')'); }
    */

    return rlt;
};function GETJSON2(name, callBack) {
    var pi = new JSONClientParameters();
    pi.add("JsName", name);
    pi.add("UID", _M.UserInfo.id);
    pi.add("UNM", _M.UserInfo.name);
    pi.add("USITE", _M.UserInfo.SID);

    $.ajax({
        type: "POST",
        url: _M.svcUrl[_M.Webtype].GetJs,
        data: pi.toXml(),
        contentType: "application/json; charset=utf-8",
        dataType: _dataType,
        async: _M.aSync.async, //_async,
        success: function (rlt) {
            //rlt = eval('(' + rlt.d + ')');
            rlt = jQuery.parseJSON(rlt.d);
            callBack(rlt);
        },
        error: function (msg) {
            //_msg = eval('(' + msg.responseText + ')');
            _msg = jQuery.parseJSON(msg.responseText);
            alert(_msg.Message);
        }
    });
};

function GETJSONREMOTE(name, callBack) {
    if (_M.Jsons[name] != undefined) {
        callBack(_M.Jsons[name]);
    }
    var pi = new JSONClientParameters();
    pi.add("JsName", name);
    pi.add("UID", _M.UserInfo.id);
    pi.add("UNM", _M.UserInfo.name);
    pi.add("USITE", _M.UserInfo.SID);

    $.ajax({
        type: "POST",
        url: _M.svcUrl[_M.Webtype].GetJs,
        data: pi.toXml(),
        contentType: "application/json; charset=utf-8",
        dataType: _dataType,
        async: _M.aSync.async, //_async,
        success: function (msg) {
            _msg = eval('(' + msg.d + ')');
            _M.Jsons[name] = _msg;
            callBack(_msg);
        },
        error: function (msg) {
            alert(msg.Message);
        }
    });

};

function GETHTML(name) {
    var pi = new JSONClientParameters();
    pi.add("JsName", name);
    pi.add("UID", _M.UserInfo.id);
    pi.add("UNM", _M.UserInfo.name);
    pi.add("USITE", _M.UserInfo.SID);

    var rlt = $.ajax({
        type: "POST",
        url: _M.svcUrl[_M.Webtype].GetJs,
        data: pi.toXml(),
        contentType: "application/json; charset=utf-8",
        dataType: _dataType,
        async: _M.aSync.sync //_async,
    }).responseText;
    //rlt = eval('(' + rlt + ')');
    rlt = jQuery.parseJSON(rlt);
    rlt = rlt.d
    //    rlt = eval('(' + rlt.Table.Rows[0]['구조체내용'] + ')');
    //    alert(rlt);
    return rlt;
};

/*
var unescapeHtml = function (html) {
if (html == "" || html == undefined) return '';
var temp = document.createElement("div");
temp.innerHTML = html;
//var result = temp.childNodes[0].nodeValue;
var result = temp.textContent;
temp.removeChild(temp.firstChild)
return result;
}
*/

function unescapeHtml(html) {

    if (html) {
        return $('<div />').html(html).text();
    } else {
        return '';
    }
}

/// Json의 문자열을 객체로 전환하기위한 코드
function JSON_Serialized(jsonString, url, jdata) {
    var _data;
    if (typeof (jsonString) == "object") {
        return jsonString
    }
    else {
        try {
            // return eval('(' + _data + ')');

            return jQuery.parseJSON(_data);
        }
        catch (e1) {
            alert(e1.message);
            //$.SM('kdb.soap.msg - JSON_Serialized : url : ' + url + ' /  data : ' + jdata + ' / ' + e1.message);
        }
    }
}

// 20261104 khma Start : JSON 직렬화 유틸($.Json2Str) 따옴표/개행 이스케이프 깨짐 방어 보강
$.Json2Str = function (obj) {
    // 최신 브라우저 표준 JSON.stringify 지원 시 우선 사용하여 따옴표/역슬래시/개행 깨짐을 완벽 방지
    if (window.JSON && typeof JSON.stringify === "function") {
        try {
            return JSON.stringify(obj);
        } catch (eJson) {
            // 순환 참조 등으로 실패 시 아래 기존 직렬화 로직으로 Fallback
        }
    }

    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") {
            // 큰따옴표, 역슬래시, 개행문자 정규식 이스케이프 처리
            obj = '"' + obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
        }
        return String(obj);
    } else {
        var json = [], arr = (obj && obj.constructor == Array);
        $.each(obj, function (k, v) {
            t = typeof (v);
            if (t == "string") {
                v = '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
            } else if (t == "object" && v !== null) {
                v = $.Json2Str(v);
            }
            json.push((arr ? "" : '"' + k + '":') + String(v));
        });

        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};
// 20261104 khma End : JSON 직렬화 유틸($.Json2Str) 따옴표/개행 이스케이프 깨짐 방어 보강
///  json parameters 
function JSONClientParameters() {
    var _pl = new Array();
    this.add = function (name, value) {
        _pl[name] = value;
        return this;
    },
    this.toXml = function () {
        var xml = "{";
        var i = 0;
        
        // 20261104 khma : _M.UserInfo Null-Safe 접근 헬퍼 적용
        var _uid = (_M.UserInfo && _M.UserInfo.id) ? _M.UserInfo.id : "";
        var _ulid = (_M.UserInfo && _M.UserInfo.lid) ? _M.UserInfo.lid : "";
        var _unm = (_M.UserInfo && _M.UserInfo.name) ? _M.UserInfo.name : "";
        var _usite = (_M.UserInfo && _M.UserInfo.SID) ? _M.UserInfo.SID : "44";
        var _gsite = (_M.UserInfo && _M.UserInfo.gsite) ? _M.UserInfo.gsite : "";
        var _gcorp = (_M.UserInfo && _M.UserInfo.gcorp) ? _M.UserInfo.gcorp : "";
        var _udept = (_M.UserInfo && _M.UserInfo.depart) ? _M.UserInfo.depart : "";
        var _ulang = (_M.UserInfo && _M.UserInfo.lang) ? _M.UserInfo.lang : "KO";
        var _menuid = (_M.PrevActGbn && _M.PrevActGbn.currMenuId) ? _M.PrevActGbn.currMenuId : "";
        var _stepmenu = (_M.PrevActGbn && _M.PrevActGbn.currStepMenu) ? _M.PrevActGbn.currStepMenu : "";
        var _actnm = (_M.PrevActGbn && _M.PrevActGbn.actionName) ? _M.PrevActGbn.actionName : "";

        xml += 'UID:"' + JSONClientParameters._serialize(_uid) + '"';
        xml += ',ULID:"' + JSONClientParameters._serialize(_ulid) + '"';
        xml += ',UNM:"' + JSONClientParameters._serialize(_unm) + '"';
        xml += ',USITE:"' + JSONClientParameters._serialize(_usite) + '"';
        xml += ',GSITE:"' + JSONClientParameters._serialize(_gsite) + '"';
        xml += ',GCORP:"' + JSONClientParameters._serialize(_gcorp) + '"';
        xml += ',UDEPT:"' + JSONClientParameters._serialize(_udept) + '"';
        xml += ',ULANG:"' + JSONClientParameters._serialize(_ulang) + '"';
        xml += ',MENUID:"' + JSONClientParameters._serialize(_menuid) + '"';
        xml += ',STEPMENU:"' + JSONClientParameters._serialize(_stepmenu) + '"';
        xml += ',ACTIONNAME:"' + JSONClientParameters._serialize(_actnm) + '"';
        xml += ',UKEY:"' + JSONClientParameters._serialize(sessionStorage.getItem("authValue")) + '"';
        
		for (var p in _pl) {
           // if (i > 0) xml += ",";
		   xml += ",";
            xml += p + ':"' + JSONClientParameters._serialize(_pl[p]) + '"';
            i++;
        }
		
		xml += "}";
        return xml; // return unescapeHtml(xml);
    },
    this.toJson = function (opt) { //옵션 opt: 1일때만 xml파라메터 제거후 송신
        var xml = "{";
        var i = 0;
  
        // 20261104 khma : _M.UserInfo Null-Safe 접근 헬퍼 적용
        var _uid = (_M.UserInfo && _M.UserInfo.id) ? _M.UserInfo.id : "";
        var _ulid = (_M.UserInfo && _M.UserInfo.lid) ? _M.UserInfo.lid : "";
        var _unm = (_M.UserInfo && _M.UserInfo.name) ? _M.UserInfo.name : "";
        var _usite = (_M.UserInfo && _M.UserInfo.SID) ? _M.UserInfo.SID : "44";
        var _gsite = (_M.UserInfo && _M.UserInfo.gsite) ? _M.UserInfo.gsite : "";
        var _gcorp = (_M.UserInfo && _M.UserInfo.gcorp) ? _M.UserInfo.gcorp : "";
        var _udept = (_M.UserInfo && _M.UserInfo.depart) ? _M.UserInfo.depart : "";
        var _ulang = (_M.UserInfo && _M.UserInfo.lang) ? _M.UserInfo.lang : "KO";
        var _menuid = (_M.PrevActGbn && _M.PrevActGbn.currMenuId) ? _M.PrevActGbn.currMenuId : "";
        var _stepmenu = (_M.PrevActGbn && _M.PrevActGbn.currStepMenu) ? _M.PrevActGbn.currStepMenu : "";
        var _actnm = (_M.PrevActGbn && _M.PrevActGbn.actionName) ? _M.PrevActGbn.actionName : "";

        xml += '"UID":"' + JSONClientParameters._serialize(_uid) + '"';
        xml += ',"ULID":"' + JSONClientParameters._serialize(_ulid) + '"';
        xml += ',"UNM":"' + JSONClientParameters._serialize(_unm) + '"';
        xml += ',"USITE":"' + JSONClientParameters._serialize(_usite) + '"';
        xml += ',"GSITE":"' + JSONClientParameters._serialize(_gsite) + '"';
        xml += ',"GCORP":"' + JSONClientParameters._serialize(_gcorp) + '"';
        xml += ',"UDEPT":"' + JSONClientParameters._serialize(_udept) + '"';
        xml += ',"ULANG":"' + JSONClientParameters._serialize(_ulang) + '"';
        xml += ',"MENUID":"' + JSONClientParameters._serialize(_menuid) + '"';
        xml += ',"STEPMENU":"' + JSONClientParameters._serialize(_stepmenu) + '"';
        xml += ',"ACTIONNAME":"' + JSONClientParameters._serialize(_actnm) + '"';
        xml += ',"UKEY":"' + JSONClientParameters._serialize(sessionStorage.getItem("authValue")) + '"';
  
      if (_pl != undefined) {
            for (var p in _pl) {
                //if (i > 0) xml += ",";
				xml += ",";
                xml += '"' + p + '":"' + JSONClientParameters._serialize(_pl[p]) + '"';
                i++;
            }
        }
		
        xml += "}";
        // 20261104 khma : 미사용 .NET XmlParms 감싸기 분기 정리
        /*
        if (_M.Webtype == 'NET' && opt != 1) {
            xml = "{'XmlParms': '" + xml + "'}"
        }
        */
        return xml;
    },
    this.toKeyString = function () {
        var _rlt = "";
        var i = 0;
        for (var p in _pl) {
            if (i > 0) _rlt += ",";
            _rlt += p;
            i++;
        }
        return _rlt;
    },
    this.toArray = function () {
        return _pl;
    },
    this.toGetString = function () {
        var xml = "";
        var i = 0;

        xml += 'UID=' + JSONClientParameters._serialize(_M.UserInfo.id) + '';
        xml += '&ULID=' + JSONClientParameters._serialize(_M.UserInfo.lid) + '';
        xml += '&UNM=' + JSONClientParameters._serialize(_M.UserInfo.name) + '';
        xml += '&USITE=' + JSONClientParameters._serialize(_M.UserInfo.SID) + '';
        xml += '&GSITE=' + JSONClientParameters._serialize(_M.UserInfo.gsite) + '';
        xml += '&GCORP=' + JSONClientParameters._serialize(_M.UserInfo.gcorp) + '';
        xml += '&UDEPT=' + JSONClientParameters._serialize(_M.UserInfo.depart) + '';
        xml += '&ULANG=' + JSONClientParameters._serialize(_M.UserInfo.lang) + '';
        xml += '&MENUID=' + JSONClientParameters._serialize(_M.PrevActGbn.currMenuId) + '';
        xml += '&STEPMENU=' + JSONClientParameters._serialize(_M.PrevActGbn.currStepMenu) + '';
        xml += '&ACTIONNAME=' + JSONClientParameters._serialize(_M.PrevActGbn.actionName) + '';
        xml += '&UKEY=' + JSONClientParameters._serialize(sessionStorage.getItem("authValue")) + '';

        for (var p in _pl) {
           // if (i > 0) xml += "&";
		   xml += "&";
		   
            xml += p + '=' + JSONClientParameters._serialize(_pl[p]) + '';
            i++;
        }
		
        xml += "";
        return xml; // return unescapeHtml(xml);
    }
}


//  json parameters
function JSONClientParamNotSet() {
    var _pl = new Array();
    this.add = function (name, value) {
        _pl[name] = value;
        return this;
    },
    this.toXml = function () {
        var xml = "{";
        var i = 0;
        for (var p in _pl) {
            if (i > 0) xml += ",";
            xml += '"' + p + '":"' + JSONClientParameters._serialize(_pl[p]) + '"';
            i++;
        }
        xml += "}";
        return xml; // return unescapeHtml(xml);
    },
    this.toJson = function () {
        var xml = "{";
        var i = 0;
        for (var p in _pl) {
            if (i > 0) xml += ",";
            xml += '"' + p + '":"' + JSONClientParameters._serialize(_pl[p]) + '"';
            i++;
        }
        xml += "}";
        //for Java Version

        return xml;
    },
    this.toKeyString = function () {
        var _rlt = "";
        var i = 0;
        for (var p in _pl) {
            if (i > 0) _rlt += ",";
            _rlt += p;
            i++;
        }
        return _rlt;
    },
    this.toArray = function () {
        return _pl;
    },
    this.toGetString = function () {
        var xml = "";
        var i = 0;
        for (var p in _pl) {
            if (i > 0) xml += "&";
            xml += p + '=' + JSONClientParameters._serialize(_pl[p]) + '';
            i++;
        }
        xml += "";
        return xml; // return unescapeHtml(xml);
    }
}


// 20261104 khma Start : 직렬화 엔진(_serialize) null/undefined 및 미지원 타입 예외 방어 보강
JSONClientParameters._serialize = function (o) {
    if (o === null || o === undefined) {
        return "";
    }
    var s = "";
    switch (typeof (o)) {
        case "string":
            // 20261104 khma : Java Spring 단일 환경 표준화 (encodeURIComponent 단일 적용 및 미사용 .NET escape 분기 정리)
            s += encodeURIComponent(o.replace(/\\/g, '\\u005C').replace(/"/g, '\\"').replace(/\[/g, '\[').replace(/\]/g, '\]'));
            /*
            if (_M.Webtype == 'Java') {
                s += encodeURIComponent(o.replace(/\\/g, '\\u005C').replace(/"/g, '\\"').replace(/\[/g, '\[').replace(/\]/g, '\]'));
            } else {
                s += escape(o.replace(/\\/g, "\\u005C").replace(/"/g, '\\"').replace(/'/g, "\\u0027").replace(/\+/g, "\\u002B"));
            }
            */
            break;
        case "number":
            s += o;
            break;
        case "boolean":
            s += o.toString();
            break;
        case "object":
            if (!o) return "";
            // Date 객체 판별
            if (o instanceof Date || (o.constructor && o.constructor.toString().indexOf("function Date()") > -1)) {
                var year = o.getFullYear().toString();
                var month = (o.getMonth() + 1).toString(); month = (month.length == 1) ? "0" + month : month;
                var date = o.getDate().toString(); date = (date.length == 1) ? "0" + date : date;
                var hours = o.getHours().toString(); hours = (hours.length == 1) ? "0" + hours : hours;
                var minutes = o.getMinutes().toString(); minutes = (minutes.length == 1) ? "0" + minutes : minutes;
                var seconds = o.getSeconds().toString(); seconds = (seconds.length == 1) ? "0" + seconds : seconds;
                var milliseconds = o.getMilliseconds().toString();
                var tzminutes = Math.abs(o.getTimezoneOffset());
                var tzhours = 0;
                while (tzminutes >= 60) {
                    tzhours++;
                    tzminutes -= 60;
                }
                tzminutes = (tzminutes.toString().length == 1) ? "0" + tzminutes.toString() : tzminutes.toString();
                tzhours = (tzhours.toString().length == 1) ? "0" + tzhours.toString() : tzhours.toString();
                var timezone = ((o.getTimezoneOffset() < 0) ? "+" : "-") + tzhours + ":" + tzminutes;
                s += year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds + "." + milliseconds + timezone;
            }
            // Array 객체 판별 (원소 null/undefined 접근 시 constructor TypeError 방어)
            else if (o instanceof Array || (o.constructor && o.constructor.toString().indexOf("function Array()") > -1)) {
                for (var p in o) {
                    if (!isNaN(p)) { // linear array
                        var elem = o[p];
                        if (elem === null || elem === undefined) {
                            s += "<string></string>";
                            continue;
                        }
                        var type = typeof (elem);
                        if (type === "string") type = "string";
                        else if (type === "number") type = "int";
                        else if (type === "boolean") type = "bool";
                        else if (elem instanceof Date) type = "DateTime";
                        s += "<" + type + ">" + JSONClientParameters._serialize(elem) + "</" + type + ">";
                    } else { // associative array
                        s += "<" + p + ">" + JSONClientParameters._serialize(o[p]) + "</" + p + ">";
                    }
                }
            }
            // 일반 Object 객체
            else {
                for (var p in o) {
                    s += "<" + p + ">" + JSONClientParameters._serialize(o[p]) + "</" + p + ">";
                }
            }
            break;
        default:
            // 미지원 타입이 들어오더라도 throw new Error로 중단시키지 않고 안전한 문자열 변환 수행
            s += String(o);
            break;
    }
    return s;
};
// 20261104 khma End : 직렬화 엔진(_serialize) null/undefined 및 미지원 타입 예외 방어 보강
function replaceAll(txt, replace, with_this) {
    return txt.replace(new RegExp(replace, 'g'), with_this);
}