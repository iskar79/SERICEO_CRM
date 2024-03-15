/// <reference path="../Resource.js" />
/// <reference path="jquery.kdb.MonArch800.js" />

/*!
* jQuery post get plugin: 
* 
* version 0.1 2011-03-01
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DB
*/

var e_async = { sync: false, async: true };
var g_async = e_async.async;


var _dataType = "json";
if (_M.Webtype == "Java") _dataType = "text";


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

function PostJsonData(url, pi, ScCallBack, ErCallBack, aSync) {
    // aSync = g_async == e_async.async ? false : aSync;
    $.ajax({
        type: "POST",
        url: url,
        data: pi.toJson(),
        contentType: "application/json; charset=utf-8",
        dataType: _dataType,
        async: aSync, //_async,
        success: function (result) {
            // _msg = eval('(' + msg.d.replace(/\/Date\((\d+)\)\//gi, "new Date($1)") + ')');
            var _result = '';

            if (_M.Webtype == 'Java') {
                _result = jQuery.parseJSON(result);
            } else {
                _result = jQuery.parseJSON(result.d);
            }
            

            rstTf = _result.resultInfo.result;
            if (rstTf == "SUCCESS") {
            	//console.log("[MENUID] " + _result.resultInfo.menuId + ", " + _M.PrevActGbn.currMenuId + ", " + _result.resultInfo.message);
            	if (_result.resultInfo.menuId == undefined ||  _result.resultInfo.menuId == "0000" || _result.resultInfo.menuId == _M.PrevActGbn.currMenuId ) {
                    ScCallBack(_result);
				}
            } else {
                var _msg = _result.resultInfo.message;
                if (_msg.replace('ORA-20000', '') != _msg) { //ORACLE의 사용자정의EXEPTION일때
                    var errmsg = _msg;
                    errmsg = errmsg.substr(errmsg.lastIndexOf('[20000]'), errmsg.length);
                    var _aMsg = errmsg.match(new RegExp("\\${(.*?)}\\$", "gim"));
                    if (_aMsg != null) {
                        xMsg = _aMsg[0].replace('${', '').replace('}$', '');
                        alert(xMsg);
                    } else {
                        alert(_msg);
                    }
                } 
                // 2014-03-17 adding Noh Eunhye : 세션이 끊겼을 경우 발생하는 오류와 오류코드
                else if ( _result.resultInfo.errorCode == "E1000" ) {
                	alert(_msg); // 오류가 발생했음을 알림
                	$(".opticon-logout").trigger("click"); // 로그아웃 코드 발생
                } else if (_msg.replace('SQL state [20000]', '') != _msg) { //MYSQL or MARIADB의 사용자정의EXEPTION일때
                    alert(_msg.substr(_msg.lastIndexOf('Exception:')+11));
                } 
                else {
                    alert(_msg);
                    ErCallBack(_result);
                }

            }
        },
        error: function (result) {
            var _msg = jQuery.parseJSON(result.responseText);
            
            // 세션 오류인지 확인
        	if ( _msg.resultInfo.result == "FAIL" && _msg.resultInfo.errorCode == "E1000" ) {
        		// 오류가 발생했음을 알림
        		alert(_msg.resultInfo.message);
        		// 로그아웃 코드 발생
            	$(".opticon-logout").trigger("click");
        	}
        	else {
	            alert('예기치 못한 에러가 발생하였습니다.\n관리자에게 문의하시기 바랍니다.');
	
	            ErCallBack(_msg);
        	}

            /*
            if (msg.responseText.indexOf("인증실패") > 0) {
            // alert("사용자 인증에 실패하였습니다.");
            // $(".ui-logout").trigger("click");
            $.cookie('UKEY', '', { path: '/' });
            location.reload();
            return;
            } else {
            var xMsg, xNum;
            var _aMsg = _msg.Message.match(new RegExp("\\${(.*?)}\\$", "gim"));
            if (_aMsg != null) {
            xMsg = _aMsg[0].replace('${', '').replace('}$', '');
            }
            var _aNum = _msg.Message.match(new RegExp("\\$\\[(.*?)\\]\\$", "gim"));
            if (_aNum != null) {
            xNum = _aNum[0].replace('$[', '').replace(']$', '');
            }
            if (xMsg != null || xNum != null) {
            if (ErCallBack == undefined) {
            alert('[' + xNum + ']' + xMsg);
            } else {
            ErCallBack('[' + xNum + ']' + xMsg);
            }
            return;
            } else {
            if (ErCallBack == undefined) {
            alert(_msg.Message);
            } else {
            ErCallBack(_msg.Message);
            }
            return;
            }
            }*/

        }
    });
};

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
            ScCallBack(msg);
        },
        error: function (msg) {
            _msg = msg.responseText.replace(/\\r\\n/g, String.fromCharCode(13)).replace(/\\u0027/g, "'");

            ErCallBack(_msg);

        }
    });
};

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
    pi.add("UID", _M.UserInfo.id);
    pi.add("UNM", _M.UserInfo.name);
    if(undefined != usite) {
    	pi.add("USITE", usite);
    }else{
    	pi.add("USITE", _M.UserInfo.SID);
    }
    pi.add("ULANG", _M.UserInfo.lang);
    pi.add("UDEPT", _M.UserInfo.depart);
    
    var _data = pi.toXml();
    if (_M.Webtype == 'Java') {
        _data = pi.toJson();
    }
    
    var getJsonUrl = _M.svcUrl[_M.Webtype].GetJs;
    if(undefined != extOpt && extOpt == true){
    	getJsonUrl = _M.svcUrl[_M.Webtype].getExtJs;
    }
    
    var rlt = $.ajax({
        type: "POST",
        url: getJsonUrl,
        data: _data,
        contentType: "application/json; charset=utf-8",
        dataType: _dataType,
        async: _M.aSync.sync //_async,
    }).responseText;

    rlt = jQuery.parseJSON(rlt);
    if(_M.Webtype == 'Java'){
        //rlt = eval('(' + rlt + ')');
		
		if(rlt.resultInfo.result == "SUCCESS"){
			rlt = eval('(' +rlt.resultData.STRUCTURE_CONT+ ')'); //20121204 khma new
			_M.Jsons[name] = rlt;
		}
		else {
			if ( rlt.resultInfo.errorCode == "E1000" ) {
				alert(rlt.resultInfo.message); // 오류가 발생했음을 알림
				$(".opticon-logout").trigger("click"); // 로그아웃 코드 발생
			}
			return undefined;
	   }
    }else{
        rlt = eval('(' + rlt.d + ')');
    }
    

    return rlt;
};
function GETJSON2(name, callBack) {
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

$.Json2Str = function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    } else {
        var json = [], arr = (obj && obj.constructor == Array);
        $.each(obj, function (k, v) {
            t = typeof (v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" & v !== null) v = $.Json2Str(v);
            json.push((arr ? "" : '"' + k + '":') + String(v));
        });

        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

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
        
        xml += 'UID:"' + JSONClientParameters._serialize(_M.UserInfo.id) + '"';
        xml += ',ULID:"' + JSONClientParameters._serialize(_M.UserInfo.lid) + '"';
        xml += ',UNM:"' + JSONClientParameters._serialize(_M.UserInfo.name) + '"';
        xml += ',USITE:"' + JSONClientParameters._serialize(_M.UserInfo.SID) + '"';
        xml += ',GSITE:"' + JSONClientParameters._serialize(_M.UserInfo.gsite) + '"';
        xml += ',GCORP:"' + JSONClientParameters._serialize(_M.UserInfo.gcorp) + '"';
        xml += ',UDEPT:"' + JSONClientParameters._serialize(_M.UserInfo.depart) + '"';
        xml += ',ULANG:"' + JSONClientParameters._serialize(_M.UserInfo.lang) + '"';
        xml += ',MENUID:"' + JSONClientParameters._serialize(_M.PrevActGbn.currMenuId) + '"';
        xml += ',STEPMENU:"' + JSONClientParameters._serialize(_M.PrevActGbn.currStepMenu) + '"';
        xml += ',ACTIONNAME:"' + JSONClientParameters._serialize(_M.PrevActGbn.actionName) + '"';
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
  
        xml += '"UID":"' + JSONClientParameters._serialize(_M.UserInfo.id) + '"';
        xml += ',"ULID":"' + JSONClientParameters._serialize(_M.UserInfo.lid) + '"';
        xml += ',"UNM":"' + JSONClientParameters._serialize(_M.UserInfo.name) + '"';
        xml += ',"USITE":"' + JSONClientParameters._serialize(_M.UserInfo.SID) + '"';
        xml += ',"GSITE":"' + JSONClientParameters._serialize(_M.UserInfo.gsite) + '"';
        xml += ',"GCORP":"' + JSONClientParameters._serialize(_M.UserInfo.gcorp) + '"';
        xml += ',"UDEPT":"' + JSONClientParameters._serialize(_M.UserInfo.depart) + '"';
        xml += ',"ULANG":"' + JSONClientParameters._serialize(_M.UserInfo.lang) + '"';
        xml += ',"MENUID":"' + JSONClientParameters._serialize(_M.PrevActGbn.currMenuId) + '"';
        xml += ',"STEPMENU":"' + JSONClientParameters._serialize(_M.PrevActGbn.currStepMenu) + '"';
        xml += ',"ACTIONNAME":"' + JSONClientParameters._serialize(_M.PrevActGbn.actionName) + '"';
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
        if (_M.Webtype == 'NET' && opt != 1) {
            xml = "{'XmlParms': '" + xml + "'}"
        }
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


JSONClientParameters._serialize = function (o) {

    var s = "";
    if (undefined != o) {

        switch (typeof (o)) {
            case "string":
                if(_M.Webtype == 'Java'){
					s += encodeURIComponent(o.replace(/\\/g, '\\u005C').replace(/"/g, '\\"').replace(/\[/g, '\[').replace(/\]/g, '\]'));
				}else{
					s += escape(o.replace(/\\/g, "\\u005C").replace(/"/g, '\\"').replace(/'/g, "\\u0027").replace(/\+/g, "\\u002B"));
				}
                //s += o.replace(/"/g, '\\u0022').replace(/'/g, "\\u0027"); ;
                //s += o.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace("\\", "&#92;").replace(/"/g, '\\u0022').replace(/'/g, "\\u0027"); ;
                //s = s.replace(/=(.[^&]*)/g, function ($0, $1) { return "=" + escape(decodeURIComponent($1).replace(/\n/g, "\r\n")) });
                break;

            case "number":
                s += o; break;
            case "boolean":
                s += o.toString(); break;
            case "object":
                // Date

                if (o.constructor.toString().indexOf("function Date()") > -1) {


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
                // Array


                else if (o.constructor.toString().indexOf("function Array()") > -1) {
                    for (var p in o) {
                        if (!isNaN(p))   // linear array
                        {

                            (/function\s+(\w*)\s*\(/ig).exec(o[p].constructor.toString());
                            var type = RegExp.$1;
                            switch (type) {
                                case "":
                                    type = typeof (o[p]);
                                case "String":
                                    type = "string"; break;
                                case "Number":
                                    type = "int"; break;
                                case "Boolean":
                                    type = "bool"; break;
                                case "Date":


                                    type = "DateTime"; break;
                            }

                            s += "<" + type + ">" + JSONClientParameters._serialize(o[p]) + "</" + type + ">"
                        }

                        else    // associative array
                            s += "<" + p + ">" + JSONClientParameters._serialize(o[p]) + "</" + p + ">"
                    }
                }


                // Object or custom function
                else

                    for (var p in o)
                        s += "<" + p + ">" + JSONClientParameters._serialize(o[p]) + "</" + p + ">";
                break;

            default:
                throw new Error(500, "JSONClientParameters: type '" + typeof (o) + "' is not supported");
        }
    }
    return s;
}

function replaceAll(txt, replace, with_this) {
    return txt.replace(new RegExp(replace, 'g'), with_this);
}