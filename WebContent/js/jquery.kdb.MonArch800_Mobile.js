/// <reference path="../Resource.js" />
/// <reference path="MonArchResource.js" />
/* jQuery grid plugin: 
* version 0.1 2011-07-21
* Requires jQuery v1.6.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DB
*/

(function ($, undefined) {
    $.cookie = function (key, value, options) {
        // key and at least value given, set cookie...
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = jQuery.extend({}, options);

            if (value == null || value == undefined) {
                options.expires = -1;
            }

            if (typeof options.expires == 'number') {
            	var times = options.expires;
                var t = new Date();
                //t.setDate(t.getDate() + days);
                t.setTime(t.getTime() + times);
                options.expires = t;
            }

            value = String(value);

            return (document.cookie = [
        encodeURIComponent(key), '=',
        options.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''

    ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;

    };

    //===============================================================================
    //   문자열처리기본함수들
    //===============================================================================

    $.number_format = function (num) {
        /// <summary>천단위로 , 처리하는 함수.</summary>
        /// <param name="num" type="string">숫자로구성된 문자열.</param>
        /// <returns type="string">문자열의 뒤에서부터 1000단위 ,표시.</returns>
        num = num.split(",").join("");
        var arr = num.split(".");
        var num = new Array();
        for (i = 0; i <= arr[0].length - 1; i++) {
            num[i] = arr[0].substr(arr[0].length - 1 - i, 1);
            if (i % 3 == 0 && i != 0)
                num[i] += ",";
        }
        num = num.reverse().join("");

        if (!arr[1]) {
            return num;
        } else {
            return num + "." + arr[1];
        }
    };

    /* 숫자만 추출하는 함수 */
    $.getNumberOnly = function (val) {
        val = new String(val);
        var regex = /[^0-9]/g;
        val = val.replace(regex, '');
        return val;
    };
    /* html을 화면출력용으로 변환 */
    $.encHTML = function (html) {
        if (html == undefined) return '';
        return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\/g, '&#92;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
    };
    /* 화면표시용을 html로 변환 */
    $.decHTML = function (html) {
        if (html == undefined) return '';
        return html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#92;/g, '\\').replace(/&nbsp;/g, ' ').replace(/<br>/g, "\n");
    };
    $.isEncHTML = function (str) {
        if (str.search(/&amp;/g) != -1 || str.search(/&lt;/g) != -1 || str.search(/&gt;/g) != -1)
            return true;
        else
            return false;
    };
    // json 객체에서 찾아내기
    $.getObjects = function (obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat($.getObjects(obj[i], key, val));
            } else if (i == key && obj[key] == val) {
                objects.push(obj);
            }
        }
        return objects;
    }
    //*******************************************************************************
    //   페이지이동함수
    //*******************************************************************************
    $.pageMove = function (url, target) {
        window.open(url);
    };

    //===============================================================================
    //*******************************************************************************
    //   상호작용함수들...
    //*******************************************************************************
    //===============================================================================

    $.MessageBox = function (title, msg, callback) {

        $('#yesnodailog').remove();
        $(document.body).append('<div id="yesnodailog"></div>');
        $('#yesnodailog').html(msg);
        $('#yesnodailog').dialog({ autoOpen: false, width: 400, height: 200, modal: true, closeOnEscape: false,
            title: title,
            buttons: {
                "확인": function () {
                    $('#yesnodailog').dialog("close");
                    if (callback != undefined) callback(true);
                }
            }
        });
        $('#yesnodailog').dialog('open');
    };
    $.Confirm = function (msg) {
        var result = false;
        var response = false;

        $.MessageBox("OK", msg, function (r) {
            result = r;
            response = true;
        });

        while (!response) continue; // wait
        return result;

    };
    $.MakeTwitterLink = function (Content, url) {
        var link = "https://twitter.com/intent/tweet?text=";
        link += encodeURIComponent(Content);
        link += encodeURIComponent(url);
        window.open(link, 'window', 'location=no, directories=no, status=yes,scrollbars=yes,resizable=yes, toolbar=yes,menubar=yes,width=800,height=500');
        return rlt;
    }

    //===============================================================================
    //*******************************************************************************
    //   서비스 콜 공용함수들..
    //*******************************************************************************
    //===============================================================================
    // 서비스를 실행하고 결과를 리스트형태로 받는다
    $.SvcCall = function (SvcID, CRUD, XmlParm) {
        var XmlParms = "<DataTable>";
        XmlParms += "<Record";
        XmlParms += " CRUD ='" + CRUD + "'";
        XmlParms += " SvcID ='" + SvcID + "'";
        XmlParms += " >";
        XmlParms += XmlParm;
        XmlParms += "<UID>" + MonArch.UINFO.id + "</UID>";
        XmlParms += "</Record></DataTable>";

        var pl = new JSONClientParameters();
        pl.add("SvcID", SvcID);
        pl.add("XmlParms", XmlParms);
        data = PostJsonSync(WSU, pl);
        if (data == undefined) return undefined;
        if (data.Records.length == 0) return undefined;
        return data.Records;
    };
    // 서비스를 실행하고 결과를 bool형태로 받는다
    $.SvcExcute = function (SvcID, CRUD, XmlParm) {
        var XmlParms = "<DataTable>";
        XmlParms += "<Record";
        XmlParms += " CRUD ='" + CRUD + "'";
        XmlParms += " SvcID ='" + SvcID + "'";
        XmlParms += " >";
        XmlParms += XmlParm;
        XmlParms += "<UID>" + MonArch.UINFO.id + "</UID>";
        XmlParms += "</Record></DataTable>";

        var pl = new JSONClientParameters();
        pl.add("SvcID", SvcID);
        pl.add("XmlParms", XmlParms);
        data = PostJsonSync(WSU, pl);
        if (data == undefined) return false;
        if (data.rlt != "OK") return false;
        return true;
    };

    $.M5 = function (_str) {
        var rlt = '';
        var pl = new JSONClientParameters();
        pl.add("str", _str);

        PostData(_M.svcUrl[_M.Webtype].M5Hash, pl, function (data) {
            rlt = data.rlt;
        }
        , function (response) {
            alert(response.Message);
        }, _M.aSync.sync);
        return rlt;
    };

    $.SvcGetRow = function (service, method, fldName, fldValue, CallBack) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", method);
        pl.add(fldName, fldValue);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            CallBack(data.Table.Rows[0]);
        }, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };


    $.SvcRun = function (service, method, order, viewpage, pagecnt, CallBack) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", method);
        pl.add("_order", order);
        pl.add("_viewpage", viewpage);
        pl.add("_pagecnt", pagecnt);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };

    $.SvcGetCode = function (CodeGroup, CallBack, synctf) {
        var pl = new JSONClientParameters();
        pl.add("service", "공통코드");
        pl.add("method", "GETCODE");
        pl.add("공통코드분류", CodeGroup);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };

    $.SvcGetSvcCode = function (svc, method, CallBack, synctf) {
        var pl = new JSONClientParameters();
        pl.add("service", svc);
        pl.add("method", method);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };

    $.SvcMultiCode = function (seObj, CodeGroup, Group1, Group2, Group3, service, method) {
        var pl = new JSONClientParameters();
        pl.add("service", service == undefined ? "공통코드" : service);
        pl.add("method", method == undefined ? "GETMULTICODE" : method);
        pl.add("공통코드분류", CodeGroup);
        pl.add("대분류", Group1 == undefined ? "" : Group1);
        pl.add("중분류", Group2 == undefined ? "" : Group2);
        pl.add("소분류", Group3 == undefined ? "" : Group3);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            for (var i = seObj.get(0).length - 1; i >= 1; i--) { seObj.get(0).options[i] = null; };
            seObj.get(0).options[0] = new Option("", "");
            $.each(data.Table.Rows, function (index, row) {
                seObj.get(0).options[index + 1] = new Option(row['DECODE'], row['CODE']);
            });
        }, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };


    $.SvcCallPl = function (service, method, _pl, CallBack, _IsSync) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", method);

        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                pl.add(p, ppl[p]);
            }
        };
        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            alert(response.Message);
        }, _IsSync);
    };

    $.SvcDownCsv = function (service, _pl) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", "EXCEL");
        pl.add("type", "CSV");

        var param = "";
        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                param += ",'" + p + "':'" + ppl[p] + "'";
                pl.add(p, ppl[p]);
            }
        };

        location.href = _M.svcUrl[_M.Webtype].exceldown + "?XmlParms={'service':'" + service + "','method':'EXCEL','type':'CSV'" + param + "}";
    };

    $.SvcDownXls = function (service, _pl) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", "EXCEL");
        pl.add("type", "XLS");

        var param = "";
        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                param += ",'" + p + "':'" + ppl[p] + "'";
                pl.add(p, ppl[p]);
            }
        };

        location.href = _M.svcUrl[_M.Webtype].exceldown + "?XmlParms={'service':'" + service + "','method':'EXCEL','type':'XLS'" + param + "}";
    };
    ///////////////////////////////////////////////////////////////////////////////////////////
    // PAGE 호출에 전달된 GET 파라메터를 읽어온다
    ///////////////////////////////////////////////////////////////////////////////////////////
    $.getUrlVars = function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    ///////////////////////////////////////////////////////////////////////////////////////////
    // Json2Str
    ///////////////////////////////////////////////////////////////////////////////////////////
    $.Json2Str = function (obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // array or object
            var json = [], arr = (obj && obj.constructor == Array);

            $.each(obj, function (k, v) {
                t = typeof (v);
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" & v !== null) v = $.serializeJSON(v);
                json.push((arr ? "" : '"' + k + '":') + String(v));
            });

            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////
    // 브라우즈 버전체크
    ///////////////////////////////////////////////////////////////////////////////////////////
    $.getInternetVersion = function () {
        ver = $.browserCheck();
        var rv = -1; // Return value assumes failure.      
        var ua = navigator.userAgent;
        var re = null;
        if (ver == "MSIE") {
            re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        } else {
            re = new RegExp(ver + "/([0-9]{1,}[\.0-9]{0,})");
        }
        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
        return rv;
    };
    //브라우저 종류 및 버전확인  
    $.browserCheck = function () {
        var ver = 0; // 브라우저  버전정보 
        if (navigator.appName.charAt(0) == "N") {
            if (navigator.userAgent.indexOf("Chrome") != -1) {
                return "Chrome";
            } else if (navigator.userAgent.indexOf("Firefox") != -1) {
                return "Firefox";
            } else if (navigator.userAgent.indexOf("Safari") != -1) {
                return "Safari";
            }
        } else if (navigator.appName.charAt(0) == "M") {
            return "MSIE";
        };
    };

    ///////////////////////////////////////////////////////////////////////////////////////////
    //  ContextMenu
    ///////////////////////////////////////////////////////////////////////////////////////////

    $.SetContextMenu = function (ulObj, mnJson, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('.kcontextMenu').remove();

            $(document.body).append("<div class='kcontextMenu DivContext contextMenu " + CssName + "'></div>");

            // json 데이터를 이용하여 메뉴채움
            $.each(mnJson,
                function (index, value) {
                    if (value.img == undefined) {
                        $('<li class="conMenu002" cmd="' + value.cmd + '"><span><a href="#">' + value.title + '</a></span></li>').appendTo($(document.body).find('.kcontextMenu'));
                    } else {
                        $('<li class="conMenu002" cmd="' + value.cmd + '"><span><img src="' + value.img + '"/><a href="#">' + value.title + '</a></span> </li>').appendTo($(document.body).find('.kcontextMenu'));
                    }
                });
            // 메뉴선택시 콜백함수 호출하도록 이벤트 추가함            
            if (callBackFn != undefined) {
                $(document.body).find('.kcontextMenu li').bind("click", function (e) {
                    $(document.body).find('.kcontextMenu').remove();
                    callBackFn($(this), ulObj);
                });
            }

            // 데이터입력형이 메뉴이면 닫기버턴의 클릭을 기다리고
            // 단순 메뉴이면 마우스 이탈시에 자동으로 닫게함
            if (CssName == 'DivContextInput') {
                $(document.body).find('.kcontextMenu').append("<div class='DivContextClose ui-icon ui-icon-circle-close'></div>");
                $(document.body).find('.DivContextClose').bind("click", function (e) {
                    $(document.body).find('.kcontextMenu').remove();
                });
            }
            else {
                $(document.body).find('.kcontextMenu').bind("mouseleave", function (e) {
                    $(this).remove();
                });
            }

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            $(document.body).find('.kcontextMenu').bind("mouseover", function (e) {
                $(document.body).find('.kcontextMenu').data("MouseOver", true);
            });

            $(document.body).find('.kcontextMenu').data("MouseOver", false);

            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            $(document.body).find('.kcontextMenu').delay(2000).queue(function () {
                if ($(document.body).find('.kcontextMenu').data("MouseOver") == false)
                    $(document.body).find('.kcontextMenu').remove();
            });

            var menutop = $(this).offset().top + $(this).outerHeight();
            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 11;
            $(document.body).find('.kcontextMenu li').css("width", menuwidth);

            if ($(window).width() < ($(this).offset().left + $(document.body).find('.kcontextMenu').width())) {
                menuleft = $(window).width() - $(document.body).find('.kcontextMenu').width() - 5;
            }

            $(document.body).find('.kcontextMenu').css("top", menutop);
            $(document.body).find('.kcontextMenu').css("left", menuleft);
            $(document.body).find('.kcontextMenu').removeClass('contextMenu');

        });
    };
    $.SetContextCode = function (ulObj, codes, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('.kcontextMenu').remove();

            var _pO = $("<div class='kcontextMenu DivContext " + CssName + "'><ul class='DivCodeUl'></ul><div class='DivCodeBtn'></div></div>").appendTo($(document.body));
            


            _M.f.c.SetLiCode($('.DivCodeUl', _pO), codes, function (li) {
                if (callBackFn != undefined) {
                    callBackFn(li, ulObj);
                    _pO.remove();
                }
            });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };


    $.SetMultiList = function (uiobj, callback) {
        var fieldEdit = uiobj.parents('.fieldEdit');
        var service = fieldEdit.attr('service');
        var method = fieldEdit.attr('method');
        var codes = fieldEdit.attr('codes');

        var level = uiobj.attr('level');
        var SelVar0 = $('input:eq(0)', fieldEdit).val();
        var SelVar1 = $('input:eq(1)', fieldEdit).val();
        var SelVar2 = $('input:eq(2)', fieldEdit).val();
        var SelVar3 = $('input:eq(3)', fieldEdit).val();

        var pl = new JSONClientParameters();
        if (codes != undefined) {
            pl.add("공통코드분류", codes);
            service = "공통코드";
            method = "GETMULTICODE";
        }
        pl.add("service", service == undefined ? "공통코드" : service);
        pl.add("method", method == undefined ? "GETMULTICODE" : method);

        if (level == 0) {
            pl.add("대분류", "");
            pl.add("중분류", "");
            pl.add("소분류", "");
        }
        if (level == 1) {
            pl.add("대분류", SelVar0 == undefined ? "" : SelVar0);
            pl.add("중분류", "");
            pl.add("소분류", "");
        }
        if (level == 2) {
            pl.add("대분류", SelVar0 == undefined ? "" : SelVar0);
            pl.add("중분류", SelVar1 == undefined ? "" : SelVar1);
            pl.add("소분류", "");
        }
        if (level == 3) {
            pl.add("대분류", SelVar0 == undefined ? "" : SelVar0);
            pl.add("중분류", SelVar1 == undefined ? "" : SelVar1);
            pl.add("소분류", SelVar2 == undefined ? "" : SelVar2);
        }

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            $(document.body).find('.kcontextMenu').remove();
            var _pO = $("<div class='kcontextMenu DivContext DivContextMenu'><ul class='DivCodeUl'></ul></div>").appendTo($(document.body));
            $.each(data.Table.Rows, function (index, row) {
                $('<li class="conMenu002" cmd="' + row['CODE'] + '"><span><a>' + row['DECODE'] + '</a></span></li>').appendTo($('.DivCodeUl', _pO));
            });
            $('.conMenu002', _pO).bind("click", function (e) {
                if (level == 0) {
                    $('input:eq(1)', fieldEdit).val("");
                    $('input:eq(2)', fieldEdit).val("");
                    $('input:eq(3)', fieldEdit).val("");
                }
                if (level == 1) {
                    $('input:eq(2)', fieldEdit).val("");
                    $('input:eq(3)', fieldEdit).val("");
                }
                if (level == 2) {
                    $('input:eq(3)', fieldEdit).val("");
                }
                callback($(this).attr('cmd'), $(this));
                _pO.remove();
            });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = uiobj.offset().top + uiobj.outerHeight();
            var menuleft = uiobj.offset().left;
            var menuwidth = uiobj.outerWidth() - 21;
            if ($(window).width() < (uiobj.offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);


        }, function (response) {
            alert(response.Message);
        }, _M.aSync.async);

    };


    $.SetChkList = function (ulObj, codes, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('.kcontextMenu').remove();

            var _pO = $("<div class='kcontextMenu DivContext " + CssName + "'><div class='DivCodeLi'></div><div class='DivCodeBtn'></div></div>").appendTo($(document.body));

            // json 데이터를 이용하여 메뉴채움
            _M.f.c.SetMultiCheckCode($('.DivCodeLi', _pO), codes)

            // 데이터입력형이 메뉴이면 닫기버턴의 클릭을 기다리고
            // 단순 메뉴이면 마우스 이탈시에 자동으로 닫게함
            $("<span class='ui-icon ui-icon-check'></span>").appendTo($('.DivCodeBtn', _pO))
            .bind("click", function (e) {
                var DataArr = [];
                $("input[type='checkbox']", _pO).each(function () {
                    if ($(this).is(":checked")) {
                        DataArr.push($(this).val());
                    }
                });
                data = DataArr.join(",");
                callBackFn(data, $(this));
                _pO.remove();
            });
            $("<span class='ui-icon ui-icon-close'></span>").appendTo($('.DivCodeBtn', _pO)).bind("click", function (e) { _pO.remove(); });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };


    $.SetMultiCombo = function (ulObj, codes, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('SetMultiCombo').remove();

            var _pO = $("<div class='SetMultiCombo DivContext " + CssName + "'><div class='DivCodeLi'></div><div class='DivCodeBtn'></div></div>").appendTo($(document.body));

            //            // json 데이터를 이용하여 메뉴채움
            var _arFld = ulObj.attr('field').split(',');
            var _Width = (100 / (_arFld.length + 1)) + "%";
            $.each(_arFld, function (index, value) {
                var se = $('<select></select>').appendTo($('.DivCodeLi', _pO)).css("width", _Width);
                if (index == 0) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(1)', _pO), codes, SelVar0, "", "");
                        $('.DivCodeLi select:eq(2),.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 1) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(2)', _pO), codes, SelVar0, SelVar1, "");
                        $('.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 2) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        var SelVar2 = $('.DivCodeLi select:eq(2)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(3)', _pO), codes, SelVar0, SelVar1, SelVar2);
                    })
                }
            });

            $.SvcMultiCode($('.DivCodeLi select:eq(0)', _pO), codes, "", "", "");

            $("<span class='ui-icon ui-icon-check'></span>").appendTo($('.DivCodeBtn', _pO))
            .bind("click", function (e) {
                var DataArr = [];
                $("선택",_pO).each(function () {
                    DataArr.push($(this).val());
                });
                data = DataArr.join(",");
                callBackFn(data, ulObj);
                _pO.remove();
            });
            $("<span class='ui-icon ui-icon-close'></span>").appendTo($('.DivCodeBtn', _pO)).bind("click", function (e) { _pO.remove(); });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.data("MouseOver", false);
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.bind("mouseleave", function (e) {
                if ((typeof e.fromElement != 'undefined' && !e.fromElement.length) || (typeof e.fromElement == 'undefined' && e.target.tagName != 'SELECT')) {
                    _pO.data("MouseOver", false);
                    _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); $(this).dequeue(); });
                }
            });

            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); $(this).dequeue(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };

    $.SetMultiSvcCombo = function (ulObj, service, method, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput
        var codes = "";
        $(ulObj).bind(event, function (e) {
            $(document.body).find('SetMultiCombo').remove();

            var _pO = $("<div class='SetMultiCombo DivContext " + CssName + "'><div class='DivCodeLi'></div><div class='DivCodeBtn'></div></div>").appendTo($(document.body));

            //            // json 데이터를 이용하여 메뉴채움
            var _arFld = ulObj.attr('field').split(',');
            var _Width = (100 / (_arFld.length + 1)) + "%";
            $.each(_arFld, function (index, value) {
                var se = $('<select></select>').appendTo($('.DivCodeLi', _pO)).css("width", _Width);
                if (index == 0) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(1)', _pO), codes, SelVar0, "", "", service, method);
                        $('.DivCodeLi select:eq(2),.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 1) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(2)', _pO), codes, SelVar0, SelVar1, "", service, method);
                        $('.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 2) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        var SelVar2 = $('.DivCodeLi select:eq(2)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(3)', _pO), codes, SelVar0, SelVar1, SelVar2, service, method);
                    })
                }
            });

            $.SvcMultiCode($('.DivCodeLi select:eq(0)', _pO), codes, "", "", "", service, method);

            $("<span class='ui-icon ui-icon-check'></span>").appendTo($('.DivCodeBtn', _pO))
            .bind("click", function (e) {
                var DataArr = [];
                $("선택",_pO).each(function () {
                    DataArr.push($(this).val());
                });
                data = DataArr.join(",");
                callBackFn(data, ulObj);
                _pO.remove();

            });
            $("<span class='ui-icon ui-icon-close'></span>").appendTo($('.DivCodeBtn', _pO)).bind("click", function (e) { _pO.remove(); });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };

    $.GetExcelColumn = function (_Obj, type, cols) {
        var _json = _Obj.data("jsonData");
        var _svc = _json.method.List;
        if (_json.method.Excel != "" && _json.method.Excel != undefined) {
            _svc = _json.method.Excel;
        }

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu ExcelColumnPopUp' ></div>");

        // json 데이터를 이용하여 메뉴채움
        _t = $('<div class="row"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $('<a class="Label">컬럼을 선택하세요.</a><br/>').appendTo(_t);
        var seObj = $('<select id="excelcols" multiple size="20" style="width:40%;float:left;" ></select>').appendTo(_t);
        $.each(cols, function (index, row) {
            seObj.get(0).options[index] = new Option(row, row);
        });
        var _go = $("<span class='btn-arrow-right' style='float:left;margin-top:110px;margin-left:15px;'></span>").appendTo(_t);
        var _back = $("<span class='btn-arrow-left' style='float:left;margin-top:140px;margin-left:-23px;'></span>").appendTo(_t);
        var seObjgo = $('<select id="exceldowncols" multiple size="20" style="width:40%;float:right;" ></select>').appendTo(_t);

        _go.click(function () {
            var cnt = 0;
            seObj.find("option:selected").each(function (index, value) {
                seObjgo.append($(this).clone());
                $(this).remove();
            });
        });

        _back.click(function () {
            seObjgo.find("option:selected").each(function (index, value) {
                seObj.append($(this).clone());
                $(this).remove();
            });
        });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 300,
            height: 450,
            title: "Excel Down 항목 선택",
            buttons: {
                "Down": function () {
                    var _downcols = "";
                    seObjgo.find("option").each(function () {
                        _downcols += $(this).val() + ",";
                    });
                    _downcols = _downcols.substr(0, _downcols.length - 1);
                    pl = _Obj.superContaner("tableGetFilter");
                    pl.add("_order", _Obj.attr("_order"));
                    pl.add("USITE", _M.UserInfo.SID);
                    pl.add("UID", _M.UserInfo.id);
                    pl.add("UKEY", _M.UserInfo.key);
                    pl.add("key", "0");
                    pl.add("ExcelService", _svc);
                    pl.add("DOWNCOLS", _downcols);
                    if (_Obj.attr("parentkeyvalue") != null && _Obj.attr("parentkeyvalue") != undefined && _Obj.attr("parentkeyvalue") != "") {
                        pl.add(_json.parentKey, _Obj.attr("parentkeyvalue"));
                    }

                    if (type == "XLS") {
                        $.SvcDownXls(_json.service, pl);
                    } else if (type = "CSV") {
                        $.SvcDownCsv(_json.service, pl);
                    } else {
                        alert("엑셀 다운 타입이 지정되지 않았습니다. XLS 또는 CSV를 지정해주세요.");
                    }
                    $(this).dialog("close");
                },
                "close": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
    };

    $.GetImg = function (callBackFn) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu GalleryPopUp' ></div>");

        // json 데이터를 이용하여 메뉴채움
        var _o = $('<form id="frmFile" name="frmFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.kcontextMenu'));
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">파일을 선택하세요.</a>').appendTo(_t);
        $('<input type="file" size="30" name="Filename" id="Filename" title="PC파일" />').appendTo(_t);
        $('<input type="button" class="GetImgFileUpload" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">Url을 입력하세요.</a>').appendTo(_t);
        $('<input type="text"  name="Urlname" id="Urlname" />').appendTo(_t);
        $('<input type="button" class="GetImgFileUpload" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">문서설명을 입력하세요.</a>').appendTo(_t);
        $('<input type="text" name="Note" />').appendTo(_t);

        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentType" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentKey" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="WebFolder" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);

        $('<input type="hidden" name="UID" />').appendTo(_t).val(_M.UserInfo.id);

        $('<div id="GetImgGallery"></div>').appendTo(_o);
        $("#GetImgGallery").superContaner('superGallery', "파일겔러리PopUp");

        var frm = $('#frmFile');
        frm.ajaxForm(FileuploadCallback);
        frm.submit(function () { return false; });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 650,
            title: "페이지정보",
            buttons: {
                "delete": function () {
                    callBackFn("", "");
                    $(this).dialog("close");
                },
                "select": function () {
                    _li = $('.SuperGallery .body .li_selected', $(this));
                    urlData = $('img', _li).attr('src');
                    fileName = $('h3', _li).text();
                    callBackFn(urlData, fileName);
                    $(this).dialog("close");
                },
                "close": function () {
                    $(this).dialog("close");
                }
                //..SuperGallery .body .li_selected
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
    };
    $.GetFile = function (callBackFn) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu GalleryPopUp' ></div>");

        // json 데이터를 이용하여 메뉴채움
        var _o = $('<form id="frmFile" name="frmFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.kcontextMenu'));
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">파일을 선택하세요.</a>').appendTo(_t);
        $('<input type="file" size="30" name="Filename" id="Filename" title="PC파일" />').appendTo(_t);
        $('<input type="button" class="GetImgFileUpload" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">Url을 입력하세요.</a>').appendTo(_t);
        $('<input type="text"  name="Urlname" id="Urlname" />').appendTo(_t);
        $('<input type="button" class="GetImgFileUpload" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">문서설명을 입력하세요.</a>').appendTo(_t);
        $('<input type="text" name="Note" />').appendTo(_t);

        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentType" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentKey" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="WebFolder" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);

        $('<input type="hidden" name="UID" />').appendTo(_t).val(_M.UserInfo.id);

        $('<div id="GetImgGallery"></div>').appendTo(_o);
        $("#GetImgGallery").superContaner('superGallery', "파일겔러리PopUp");

        var frm = $('#frmFile');
        frm.ajaxForm(FileuploadCallback);
        frm.submit(function () { return false; });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 650,
            title: "웹하드",
            buttons: {
                "delete": function () {
                    callBackFn("", "");
                    $(this).dialog("close");
                },
                "select": function () {
                    _li = $('.SuperGallery .body .li_selected', $(this));

                    urlData = $('img', _li).attr('src');
                    if (urlData == undefined) {
                        urlData = $('div', _li).attr('src');
                    }
                    fileName = $('h3', _li).text();

                    callBackFn(urlData, fileName);
                    $(this).dialog("close");
                },
                "close": function () {
                    $(this).dialog("close");
                }
                //..SuperGallery .body .li_selected
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
    };
    
    $.GetFileManager = function (jobType, fileSearchKey, callBackFn) {  //LG하우시스 수정 버전....
		
    	$(document.body).find('.kcontextMenu').remove();
    	$(document.body).append("<div class='kcontextMenu FileManagerPopup' ></div>");
    	
    	// json 데이터를 이용하여 메뉴채움
    	var _o = $('<form id="frmFile" name="frmFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.kcontextMenu'));
    	_t = $('<div class="row"></div>').appendTo(_o);
    	$('<a class="Label">파일을 선택하세요.(최대20MB)</a>').appendTo(_t);
    	$('<input type="file" size="30" name="Filename" id="Filename" title="PC파일" />').appendTo(_t);
    	$('<input type="button" class="GetImgFileUpload" value="업로드" onclick="GetMultiFileUpload(this);" />').appendTo(_t);
    	$('<input type="hidden" name="UID" />').appendTo(_t).val(_M.UserInfo.id);
		$('<input type="hidden" name="USITE" />').appendTo(_t).val(_M.UserInfo.SID);
		$('<input type="hidden" name="jobType" />').appendTo(_t).val(jobType);
		$('<input type="hidden" name="fileSearchKey" />').appendTo(_t).val(fileSearchKey);
    	
    	$('<div id="GetFileManager"></div>').appendTo(_o);
		$("#GetFileManager").attr("jobType", jobType);
		$("#GetFileManager").attr("fileSearchKey" , fileSearchKey);
    	$("#GetFileManager").superContaner('superTable', "파일메니져PopUp");
    	
    	var frm = $('#frmFile');


		frm.ajaxForm(function(data, state) {
				if (data == "error") {
					alert("파일전송중 에러 발생!!");
				} else {
					var _ar = data.split('^!^');
					$(".kcontextMenu").find(".jobArea").find("input[incomm='List']").trigger("click");
				}
			});
    	frm.submit(function () { return false; });
    	
    	$(document.body).find('.kcontextMenu').dialog({
    		autoOpen: false,
    		modal: true,
    		width: 600,
    		height: 400,
    		title: "MultiFileUpload",
    		buttons: {
    			//"삭제": function () {
    			//	callBackFn("","");
    			//	$(this).dialog("close");
    			//},
    			"확인": function () {
    				//callBackFn();
    				$(this).dialog("close");
    			}
    			//"닫기": function () {
    			//	$(this).dialog("close");
    			//}
    			//..SuperGallery .body .li_selected
    		},
    		close:function (event,ui) {
    			callBackFn();
    			$(document.body).find('.kcontextMenu').remove();
    		}
    	});
    	$(document.body).find('.kcontextMenu').dialog("open");
    };

    //LG하우시스 메일 즉시발송처리 20120719
	$.SendDirectMail = function (jobType, jobKey,contentsCode, service, method, callBackFn) {  //LG하우시스 메일서비스콜
		//contensCode :컨텐츠코드, service:서비스, method :메소드
		
		var pl = new JSONClientParameters();
		var successFlag = true;
        pl.add("JOB_TYPE", jobType);
        pl.add("JOB_KEY", jobKey);
        pl.add("contentsCode", contentsCode);
        pl.add("service", service);
        pl.add("method", method);
		//서비스 호출 
		PostJsonData("/sendDirectMail.json", pl, function (data) {
			
            //CallBack(data.Table.Rows[0]);
            /*if(data.Table.Rows == true){
            	alert("메일송신완료");
            }else{
            	alert("메일송신실패");
            }*/
            successFlag =data.Table.Rows;
            callBackFn(successFlag);
        }, function (response) {
            alert(response);
        }, _M.aSync.async);
        
        
	}

  $.ShowImg = function (_Obj) {
        $(document.body).find('.gcontextMenu').remove();
        $(document.body).append("<div class='gcontextMenu DivContext DivContextMenu contextMenu'></div>");

        var _o = $('<img  />').appendTo($(document.body).find('.gcontextMenu'));
        _o.attr('src', _Obj.attr('src'));

        // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
        $(document.body).find('.gcontextMenu').bind("mouseover", function (e) {
            $(document.body).find('.gcontextMenu').data("MouseOver", true);
        });
        $(document.body).find('.gcontextMenu').bind("mouseleave", function (e) {
            $(this).remove();
        });
        $(document.body).find('.gcontextMenu').data("MouseOver", false);


        // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
        $(document.body).find('.gcontextMenu').delay(2000).queue(function () {
            if ($(document.body).find('.gcontextMenu').data("MouseOver") == false)
                $(document.body).find('.gcontextMenu').remove();
        });

        var menutop = _Obj.offset().top + _Obj.outerHeight();
        //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
        var menuleft = _Obj.offset().left;
        //var menuwidth = _Obj.outerWidth() - 11;
        //$(document.body).find('.kcontextMenu').css("width", menuwidth);
        if ($(window).width() < (_Obj.offset().left + $(document.body).find('.gcontextMenu').width())) {
            menuleft = $(window).width() - $(document.body).find('.gcontextMenu').width() - 5;
        }

        $(document.body).find('.gcontextMenu').css("top", menutop + 10);
        $(document.body).find('.gcontextMenu').css("left", menuleft + 10);
        $(document.body).find('.gcontextMenu').removeClass('contextMenu');
    };
    // TABLE에서 여러건 선택
    $.ShowTableJson = function (json, _Obj, callBackFn) {
        $(document.body).find('.ShowTableJson').remove();
        $(document.body).append("<div class='ShowTableJson EditPopUp DivContext'></div>");
        $('<div id="ShowTableJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowTableJson'));
        $("#ShowTableJson_ShowEdit").superContaner('superTable', json);

        $(document.body).find('.ShowTableJson').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    var tCnt =  $("tr[selected='selected']", $("#ShowTableJson_ShowEdit")).length;
                    $("tr[selected='selected']", $("#ShowTableJson_ShowEdit")).each(function (index) {
                        _key = $(this).attr('keyvalue');
                        callBackFn(_key, tCnt, index + 1, $(this));
                    });
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close:function (event,ui) {
                $(document.body).find('.ShowTableJson').remove();
            }
        });
        $(document.body).find('.ShowTableJson').dialog("open");
    };
   // TABLE에서 특정자료 1건만 선택
  $.ShowPopUpTableJson = function (json, _Obj, callBackFn) {
        $(document.body).find('.ShowPopUpTableJson').remove();
        $(document.body).append("<div class='ShowPopUpTableJson EditPopUp DivContext'></div>");
        $('<div id="ShowPopUpTableJson_1"></div>').appendTo($(document.body).find('.ShowPopUpTableJson'));
        $("#ShowPopUpTableJson_1").superContaner('superTable', json);

        $(document.body).find('.ShowPopUpTableJson').dialog({
            autoOpen: false,
            modal: true,
            width: "90%",
            title: "정보",
            buttons: {
                "선택": function () {
                    var tCnt =  $("tr[selected='selected']", $("#ShowEdit")).length;
                    $(".SelectTR", $("#ShowPopUpTableJson_1")).each(function (index) {
                       _key = $(this).attr('keyvalue'); 
                       _display = $(this).attr('displayvalue'); 
                       callBackFn(_key,_display,$(this));
                    });     
                    $(this).dialog("close");
                },
                "닫기": function () {
                    callBackFn();
                    $(this).dialog("close");
                }
            },
            close:function (event,ui) {
                $(document.body).find('.ShowPopUpTableJson').remove();
            }
        });
        $(document.body).find('.ShowPopUpTableJson').dialog("open");
    };
    
   // 컨텐츠 팝업 전용 20120809 khma 
  $.ShowContentPopUpJson = function (json, _Obj, contentType, callBackFn) {
        $(document.body).find('.ShowContentPopUpJson').remove();
        $(document.body).append("<div class='ShowContentPopUpJson EditPopUp DivContext'></div>");
        $('<div id="ShowContentPopUpJson_1"></div>').appendTo($(document.body).find('.ShowContentPopUpJson'));
		$("#ShowContentPopUpJson_1").attr("contenttype",contentType);
        $("#ShowContentPopUpJson_1").superContaner('superTable', json);
        $(document.body).find('.ShowContentPopUpJson').dialog({
            autoOpen: false,
            modal: true,
            width: "90%",
            title: "정보",
            buttons: {
                "선택": function () {
                    var tCnt =  $("tr[selected='selected']", $("#ShowEdit")).length;
                    $(".SelectTR", $("#ShowContentPopUpJson_1")).each(function (index) {
                       _key = $(this).attr('keyvalue'); 
                       _display = $(this).attr('displayvalue'); 
                       callBackFn(_key,_display,$(this));
                    });     
                    $(this).dialog("close");
                },
                "닫기": function () {
                    callBackFn();
                    $(this).dialog("close");
                }
            },
            close:function (event,ui) {
                $(document.body).find('.ShowContentPopUpJson').remove();
            }
        });
        $(document.body).find('.ShowContentPopUpJson').dialog("open");
    };
    
// viewJson팝업창
  $.ShowPopUpViewJson = function (json, _Obj, callBackFn) {
        $(document.body).find('.ShowPopUpViewJson').remove();
        $(document.body).append("<div class='ShowPopUpViewJson EditPopUp DivContext'></div>");
        $('<div id="ShowPopUpViewJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowPopUpViewJson'));
        $("#ShowPopUpViewJson_ShowEdit").superContaner('superView', json);
        $("#ShowPopUpViewJson_ShowEdit").superContaner('SetDefault');

        $(document.body).find('.ShowPopUpViewJson').dialog({
            autoOpen: false,
            modal: true,
            width: "90%",
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    callBackFn($("#ShowPopUpViewJson_ShowEdit"), _Obj);
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close:function (event,ui) {
                $(document.body).find('.ShowPopUpViewJson').remove();
            }
        });
        $(document.body).find('.ShowPopUpViewJson').dialog("open");
    };
    // sUB등록창
    $.ShowEditJson = function (json, _Obj, callBackFn) {
        var parentKeyValue = "";
        if (typeof (_Obj) == "string") {
            parentKeyValue = _Obj
        } else {
            parentKeyValue = _Obj.attr("parentKeyValue");
        };

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $("#ShowEdit").superContaner('superView', json, parentKeyValue);
        $("#ShowEdit").superContaner('SetDefault');

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            //width: 800,
            width: "90%",//lghausys요청으로 인한 사이즈수정
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    $("#ShowEdit").superContaner('Save');
                    if (typeof (_Obj) == "string") {
                        //parentKeyValue = _Obj

                    } else {
                        option = _Obj.data("jsonData");
                        if (option.isParentRefresh) {
                            _Obj.superContaner("ParentRefresh");
                        } else {
                            _Obj.superContaner('tableRefresh');
                        }
                    };
                    if (callBackFn != undefined) {
                        callBackFn();
                    }
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };
    
    $.ShowViewJson = function (json, _Obj, callBackFn) {
        var parentKeyValue = "";
        if (typeof (_Obj) == "string") {
            parentKeyValue = _Obj
        } else {
            parentKeyValue = _Obj.attr("parentKeyValue");
        };

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $("#ShowEdit").superContaner('superView', json, parentKeyValue);
        $("#ShowEdit").superContaner('SetDefault');

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            //width: 800,
            width: "90%",//lghausys요청으로 인한 사이즈수정
            //height: 300,
            title: "정보",
            buttons: {
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    $.ShowCalEditJson = function (json, _Obj, start, end, allDay, callBackFn) {
        var parentKeyValue = "";
        if (typeof (_Obj) == "string") {
            parentKeyValue = _Obj
        } else {
            parentKeyValue = _Obj.attr("parentKeyValue");
        };

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $("#ShowEdit").superContaner('superView', json, parentKeyValue);
        $("#ShowEdit").superContaner('SetDefault');

        // 셀렉트한 날의 일자 설정
        $(".fieldContaner").each(function (index, value) {
            var _calType = $(this).attr("calType");
            var _fieldName = $(this).attr("field");
            if (_calType == 'startDate') {
                var sDate = lPadZero(start.getFullYear(), 4) + '-' + lPadZero(start.getMonth() + 1, 2) + '-' + lPadZero(start.getDate(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), sDate, 0);

            } else if (_calType == 'endDate') {
                var eDate = lPadZero(end.getFullYear(), 4) + '-' + lPadZero(end.getMonth() + 1, 2) + '-' + lPadZero(end.getDate(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), eDate, 0);
            } else if (_calType == 'startTime') {

                var sTimeHours = lPadZero(start.getHours(), 2)
                var sTimeMins = lPadZero(start.getMinutes(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), sTimeHours + sTimeMins);
            } else if (_calType == 'endTime') {

                var eTimeHours = lPadZero(end.getHours(), 2)
                var eTimeMins = lPadZero(end.getMinutes(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), eTimeHours + eTimeMins);
            }

        });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    $("#ShowEdit").superContaner('Save');
                    if (typeof (_Obj) == "string") {
                        //parentKeyValue = _Obj

                    } else {
                        //_Obj.superContaner('tableRefresh');
                    };
                    if (callBackFn != undefined) {
                        callBackFn();
                    }
                    $(this).dialog("close");

                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });

        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    //컨텐츠 가져오기 팝업
    $.ContentPopUp = function (json, parentObj, contentType, callBackFn) {
        var content = '';
        $.ShowContentPopUpJson(json, parentObj, contentType, function (key, display, trobj) {
            var jsData;
            var service = "컨텐츠관리";
            var method = "READ";
            var fieldName = "컨텐츠관리번호";
            var fieldKey = key;
            if (undefined != key) {
                $.SvcGetRow(service, method, fieldName, fieldKey, function (data) {
                    if (data != undefined) {
                        callBackFn(data.본문);
                    }

                });
            }
        });
    };

    $.ShowReadOnlyJson = function (json, _key, callBackFn) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));

        if (_superContanerRemoteMode) {
            $("#ShowEdit").superContanerRemote('superViewInit', { "jsonName": json, "ReadKey": _key });
        } else {
            $("#ShowEdit").superContaner('superView', json);
            $("#ShowEdit").superContaner('Read', _key);
            $("#ShowEdit").superContaner('modeChange', false);
        }

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: "정보",
            buttons: {
                "close": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };


    $.ShowReadEditJson = function (json, _key, callBackFn, delBtnFlag) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        if (_superContanerRemoteMode) {
            $("#ShowEdit").superContanerRemote('superViewInit', { "jsonName": json, "ReadKey": _key });
        } else {
            $("#ShowEdit").superContaner('superView', json);
            $("#ShowEdit").superContaner('Read', _key);
        }


        if (undefined == delBtnFlag || delBtnFlag == false) {
            $(document.body).find('.kcontextMenu').dialog({
                autoOpen: false,
                modal: true,
                width: 800,
                //height: 300,
                title: "정보",
                buttons: {
                    "저장": function () {
                        $("#ShowEdit").superContaner('Save');
                        callBackFn(_key);
                        $(this).dialog("close");
                    },
                    "닫기": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.kcontextMenu').remove();
                }
            });
        } else {
            $(document.body).find('.kcontextMenu').dialog({
                autoOpen: false,
                modal: true,
                width: 800,
                //height: 300,
                title: "정보",
                buttons: {
                    "저장": function () {
                        $("#ShowEdit").superContaner('Save');
                        callBackFn(_key);
                        $(this).dialog("close");
                    },
                    "삭제": function () {
                        $("#ShowEdit").superContaner('Delete');
                        callBackFn(_key);
                        $(this).dialog("close");
                    },
                    "닫기": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.kcontextMenu').remove();
                }
            });
        }

        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    $.ShowSubTableJson = function (json, _Obj, parentKeyValue) {
        $(document.body).find('.ShowTableJson').remove();
        $(document.body).append("<div class='ShowTableJson EditPopUp DivContext'></div>");
        $('<div id="ShowTableJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowTableJson')).attr("parentKeyValue", parentKeyValue);
        $("#ShowTableJson_ShowEdit").superContaner('superTable', json, _Obj);

        $(document.body).find('.ShowTableJson').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: "정보",
            buttons: {
                "추가": function () {
                    $("#ShowTableJson_ShowEdit").superContaner('tableSave');
                    _Obj.superContaner('List');
                    //$(this).dialog("close"); //저장후 PopUp 유지하도록 하여 데이터를 추가로 넣을 수 있게 하기 위해 주석처리
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ShowTableJson').remove();
            }
        });
        $(document.body).find('.ShowTableJson').dialog("open");
        return $("#ShowTableJson_ShowEdit");
    };
    // TABLE에서 특정자료 1건만 선택


    $.ZipPopUp = function (callBackFn) {
        var json = "우편POPUPListJson";
        $(document.body).find('.ZipPopUp').remove();
        $(document.body).append("<div class='ZipPopUp EditPopUp DivContext'></div>");
        $('<div id="ZipPopUp_1"></div>').appendTo($(document.body).find('.ZipPopUp'));
        $("#ZipPopUp_1").superContaner('superTable', json);

        $(document.body).find('.ZipPopUp').dialog({
            autoOpen: false,
            modal: true,
            width: "90%",
            title: "주소찾기",
            buttons: {
                "저장": function () {
                    var tCnt =  $("tr[selected='selected']", $("#ShowEdit")).length;
                    $(".SelectTR", $("#ZipPopUp_1")).each(function (index) {
                        var 우편번호 = $("td:[field='우편번호']", $(this)).text();
                        var 주소상 = $("td:[field='주소상']", $(this)).text();
                        var 주소하 = $("td:[field='주소하']", $(this)).text();
                        callBackFn(우편번호, 주소상, 주소하, $(this));
                    });
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ZipPopUp').remove();
            }
        });
        $(document.body).find('.ZipPopUp').dialog("open");
    };

    $.ZipOnePopUp = function (callBackFn) {
        var json = "우편POPUPListJson";
        $(document.body).find('.ZipOnePopUp').remove();
        $(document.body).append("<div class='ZipOnePopUp EditPopUp DivContext'></div>");
        $('<div id="ZipOnePopUp_1"></div>').appendTo($(document.body).find('.ZipOnePopUp'));
        $("#ZipOnePopUp_1").superContaner('superTable', json);
        $('<div id="ZipOnePopUp_2"></div>').appendTo($(document.body).find('.ZipOnePopUp'));
        $("<br/><div><span>상세주소 : </span><input type='text' id='ziponeaddr2'style='width:80%' /></div>").appendTo("#ZipOnePopUp_2");
        $("#ziponeaddr2").keyup(function (e) {
            if (e.keyCode == '13') {
                $.each($(".ZipOnePopUp").parent().find(".ui-button-text"), function (index, row) {
                    var _btn = $(this).html()
                    if (_btn == "save" || _btn == "select" || _btn == "추가" || _btn == "선택" || _btn == "기록" || _btn == "저장") {
                        $(this).parent().trigger("click");
                    }
                });
            }
        });

        $(document.body).find('.ZipOnePopUp').dialog({
            autoOpen: false,
            modal: true,
            width: "90%",
            title: "주소찾기",
            buttons: {
                "저장": function () {
                	var tCnt = $("tr[selected='selected']", $("#ShowEdit")).length;
                    $(".SelectTR", $("#ZipOnePopUp_1")).each(function (index) {
                        var 우편번호 = $("td:[field='우편번호']", $(this)).text();
                        var 주소상 = $("td:[field='주소상']", $(this)).text();
                        var 주소하 = $("#ziponeaddr2").val();
                        callBackFn(우편번호, 주소상, 주소하, $(this));
                    });
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
            	$(document.body).find('.ZipOnePopUp').remove();
            }
        });
        $(document.body).find('.ZipOnePopUp').dialog("open");
    };

    $.TestJson = function (jsonStr) {
        var _json = eval('(' + jsonStr + ')');
        var _ObjType = "";

        if (_json.colModel == undefined) {
            _ObjType = "superView";
        } else {
            _ObjType = "superTable";
            _json.mainViewID = undefined;

        }
        $(document.body).find('.TestJson').remove();
        $(document.body).append("<div class='TestJson EditPopUp DivContext'></div>");
        $('<div id="TestJson_ShowEdit"></div>').appendTo($(document.body).find('.TestJson'));
        $("#TestJson_ShowEdit").superContaner(_ObjType, _json);

        $(document.body).find('.TestJson').dialog({
            autoOpen: false,
            modal: true,
            width: 900,
            height: 600,
            title: "정보",
            buttons: {
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.TestJson').remove();
            }
        });
        $(document.body).find('.TestJson').dialog("open");
    };
    $.TestOlap = function (oxml, callBackFn) {
        $(document.body).find('.TestOlap').remove();
        $(document.body).append("<div class='TestOlap EditPopUp'></div>");
        $('<div id="TestOlap_ShowOlap"></div>').appendTo($(document.body).find('.TestOlap'));
        //$("#TestOlap_ShowOlap").superContaner('superOlap', oxml);
        $("#TestOlap_ShowOlap").superContaner('superOlap');
        $("#TestOlap_ShowOlap").superContaner('olapShowData', oxml);

        $(document.body).find('.TestOlap').dialog({
            autoOpen: false,
            modal: true,
            width: 900,
            height: 600,
            title: "정보",
            buttons: {
                "저장": function () {
                    var _xml = document.getElementById("TestOlap_ShowOlap_olap").XMLData;
                    callBackFn(_xml);
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            }
        });
        $(document.body).find('.TestOlap').dialog("open");
    };
    $.JsonEditPop = function (jsName, jsData) {
        var pl = new JSONClientParameters();
        pl.add("구조체명", jsName);
        $.SvcCallPl("구조체", "READJSON", pl, function (Data) {
            jsData = Data.Table.Rows[0]["구조체내용"];

            $(document.body).find('.JsonEditPop').remove();
            $(document.body).append("<div class='JsonEditPop DivContext'></div>");
            var _o = $(document.body).find('.JsonEditPop');
            var _div = $("<div></div>").appendTo(_o);
            var _t = $("<input type='text' />").appendTo(_div);
            _t.val(jsName);
            var _div = $("<div></div>").appendTo(_o);
            var _e = $("<textarea class='SourceEdit' wrap='off' rows='50' cols='600'></textarea>").appendTo(_div);
            _e.val(jsData);
            _e.tabby();

            $(document.body).find('.JsonEditPop').dialog({
                autoOpen: false,
                modal: true,
                title: "정보",
                width: 1000,
                height: 800,
                buttons: {
                    "저장": function () {
                        jsData = _e.val();
                        var pl = new JSONClientParameters();
                        pl.add("구조체명", jsName);
                        pl.add("구조체내용", jsData);
                        $.SvcCallPl("구조체", "UPDATEJSON", pl, function (Data) {
                            alert('수정되었습니다');
                        });
                        $(this).dialog("close");

                    },
                    "닫기": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.JsonEditPop').remove();
                }
            });
            $(document.body).find('.JsonEditPop').dialog("open");


        }, _M.aSync.sync);
    };

    $.ImportPopUp = function (CallBack) {
        $(document.body).find('.JsonEditPop').remove();
        $(document.body).append("<div class='JsonEditPop DivContext'></div>");
        var _o = $(document.body).find('.JsonEditPop');
        var _div = $("<div></div>").appendTo(_o);
        var _e = $("<textarea rows='5' cols='5'></textarea>").appendTo(_div);
        $(document.body).find('.JsonEditPop').dialog({
            autoOpen: false,
            modal: true,
            title: "정보",
            width: 1000,
            height: 800,
            buttons: {
                "저장": function () {
                    CallBack(_e.val());
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.JsonEditPop').remove();
            }
        });
        $(document.body).find('.JsonEditPop').dialog("open");
    };

    $.PopUpUrl = function (Url) {
        var $dialog = $('<div></div>')
        .html("<iframe style='border: 0px;' src='" + Url + "' width='100%' height='100%'></iframe>")
        .dialog({
            autoOpen: false,
            modal: true,
            width: 650,
            height: 700,
            resizable: false,
            title: "페이지정보"
        });
        $dialog.dialog("open");
    };

    $.ImgPopUp = function (Url) {
        var $dialog = $('<div></div>')
        .html("<img src='" + Url + "' width='620px' height='650px'/>")
        .dialog({
            autoOpen: false,
            modal: true,
            width: 650,
            height: 720,
            resizable: false,
            title: "이미지정보"
        });
        $dialog.dialog("open");
    };



    $.LoginPop = function () {
        $(document.body).find('.LoginPop').remove();
        var _pop = $("<div class='LoginPop'></div>").appendTo(document.body);
        var _o = $("<div class='login'></div>").appendTo(_pop);
        //var _div = $("<div></div>").appendTo(_o);
        //var _t = $("<input type='text' />").appendTo(_div);
        //var _div = $("<div></div>").appendTo(_o);

        $(document.body).find('.LoginPop').dialog({
            autoOpen: false,
            closeText: 'hide',
            closeOnEscape: true,
            disabled: false,
            modal: true,
            dialogClass: "login-dialog",
            resizable: false,
            width: 700,
            height: 430
        });
        $(document.body).find('.LoginPop').dialog("open");
    };

    $.MapPopUp = function (x, y, title, callBackFn) {
        var json = "MapJsonPopUp";
        $(document.body).find('.MapPopUp').remove();
        $(document.body).append("<div class='MapPopUp EditPopUp DivContext'></div>");
        $('<div id="MapPopUp_1"></div>').appendTo($(document.body).find('.MapPopUp'));
        $("#MapPopUp_1").superContaner('superMap', json, x, y, title);
        $(document.body).find('.MapPopUp').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 600,
            title: "Map",
            buttons: {
                "기록": function () {
                    _maker = $("#MapPopUp_1").data("markers");
                    if (_maker.length > 0) {
                        callBackFn("지도좌표", _maker[0].position);
                    }
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            }
        });
        $(document.body).find('.MapPopUp').dialog("open");
    };

    $.SignPopUp = function () {
        $(document.body).find('.SignPopUp').remove();
        var _SignPopUp = $("<div class='SignPopUp'></div>").appendTo(document.body);
        var _o = $("<canvas id='simple_sketch' width='400' height='200'></canvas>").appendTo(_SignPopUp);
        _o.sketch();
        _SignPopUp.dialog({
            autoOpen: false,
            modal: true,
            width: 450,
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    var dataUri = $('#simple_sketch')[0].toDataURL('image/png').split(",")[1];
                    $.post("bzService/UpSign.aspx", { data: dataUri }, function (data) {
                        alert("사인확인");
                        _SignPopUp.dialog("close");
                    });
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                _SignPopUp.remove();
            }
        });
        _SignPopUp.dialog("open");
        return _SignPopUp;
    };


    //////////////////////////////////////////////////////////////////////
    $.Login = function (callBack) {

        var ukey = $.cookie('UKEY');
        if (ukey != undefined && ukey != null && ukey != '') {
            if (_Biz.인증.정보(ukey)) {
                callBack();
                return;
            } else {

            }
        }

        $(document.body).find('.LoginPop').remove();

        $(".Blue").hide();
        $("#foot").hide();

        var _pop = $("<div class='LoginPop'></div>").appendTo(document.body);
        var _o = $("<div class='login'></div>").appendTo(_pop);

        var _o2 = $("<div class='logcenter'></div>").appendTo(_o);
        $("<div class='logtop'><img src='../image/top.png' /></div>").appendTo(_o2);
        var _o4 = $("<div class='logbottom'><img src='../image/bottom.png' /></div>").appendTo(_o);

        var _o5 = $("<div class='logmain'><img src='../image/loginbg.png' /></div>").appendTo(_o2);
        $("<div id='txt'><input type='text'  class='loginID'/></div>").appendTo(_o5);
        var _pw = $("<div id='pass'><input type='password' class='loginPS' /></div>").appendTo(_o5);
        $("<span class='loginBTN'><img src='../image/btn.png' /></span>").appendTo(_o5);
        
        _pw.keydown(function (e) {
            if (e.keyCode == '13') {
                $(".loginBTN").trigger("click");
            }
        });
        $(".loginBTN").click(function (e) {
        	$.cookie('UKEY','');
        	
            var _id = $(".login .loginID").val();
            var _pass = $(".login .loginPS").val();
            if(_id == ""){
            	alert("ID를 입력하세요.");
            }else if(_pass == ""){
            	alert("PW를 입력하세요.");
            }else{
            	if (_Biz.인증.로그인(_id, _pass)) {
                    $(document.body).find('.LoginPop').remove();
                    $(".Blue").show();
                    $("#foot").show();
                    callBack();
                }
            }
        })
    };


    $.Sum = function (p1, p2, p3, p4) {
        rlt = '';
        if (p1 != undefined) { rlt += p1; }
        if (p2 != undefined) { rlt += p2; }
        if (p3 != undefined) { rlt += p3; }
        if (p4 != undefined) { rlt += p4; }

        return rlt;
    };
    $.whois = function (date) {
        alert("i'M Monarch810.js");
    };

})(jQuery);

// 파일업로드 이벤트
function GetImgFileUpload() {
    //   $.mobile.pageLoading();
    if (!$("#Filename").val() && !$("#Urlname").val()) {
        alert("파일을 선택하세요.");
        $("#Filename").focus();
        return;
    }
    //파일전송
    var frm;
    frm = $('#frmFile');
//    frm.attr("action", "/bzService/Upload.aspx"); //오라클버전
    frm.attr("action", "/upload.mon"); //자바버전(파일 DB로 업로드)
    frm.submit();
}

// 멀티파일업로드 이벤트
function GetMultiFileUpload(obj) {
    //   $.mobile.pageLoading();
    if (!$("#Filename").val()) {
        alert("파일을 선택하세요.");
        $("#Filename").focus();
        return;
    }
	
 	//파일사이즈 체크
 	var Filename = $("#Filename").val();
 	var filesize = 0;
	//파일전송
	var frm;
	frm = $('#frmFile');
	frm.attr("action", "/fileupload.mon"); //자바버전(파일업로드)
	frm.submit();
}

//파일전송 후 콜백 함수
function FileuploadCallback(data, state) {
    if (data == "error") {
        alert("파일전송중 에러 발생!!");
    } else {
        var _ar = data.split('^!^');
        $("#GetImgGallery").superContaner('ListGallery');
        
    }
    return false;

}

function lPadZero(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

// ***************************************************************
// 지정한 TextArea의 내용이 제한된 길이를 초과하는지 확인한다.
// ***************************************************************
function StringBuffer() {
	this.buffer = [];
}

StringBuffer.prototype.append = function append(string) {
	this.buffer.push(string);
	return this;
};

StringBuffer.prototype.toString = function toString() {
	return this.buffer.join("");
};

function checkTextareaLimit(obj, limitLength) {
	var length = obj.val().length;
	var byteLength = getByteLength(obj.val())
	//alert("byteLength : " + byteLength);
	if (byteLength > limitLength) {
		alert("입력한 내용이 제한된 길이를 초과했습니다.");
		obj.val(extract(obj.val(), limitLength));
		return;
	}
}

function extract(string, limitLength) {
	var length = 0;
	var esc = "%B2%B3%B4%B7%A8%AD%B1%D7%F7%B0%A7%B8%A1%BF%A4%B6%AE%C6%D0%AA%3F%3F%D8%BA%DE%BD%BC%BE%E6%F0%F8%DF%FE%B9";

	var buffer = new StringBuffer()
	for ( var index = 0; index < limitLength-1; index++) {
		var character = escape(string.charAt(index));
		if (character.length == 1) {
			length++;
		} else if (character.indexOf("%u") != -1) {
			length += 2;
		} else if (character.indexOf("%") != -1) {
			if (esc.indexOf(character) != -1) {
				length += 2;
			} else {
				length += character.length / 3;
			}
		}

		if (length < limitLength) {
			buffer.append(string.charAt(index));
		}
	}
	return buffer.toString();
}

function getByteLength(string) {
	var length = 0;
	var esc = "%B2%B3%B4%B7%A8%AD%B1%D7%F7%B0%A7%B8%A1%BF%A4%B6%AE%C6%D0%AA%3F%3F%D8%BA%DE%BD%BC%BE%E6%F0%F8%DF%FE%B9";

	for ( var index = 0; index < string.length; index++) {
		var character = escape(string.charAt(index));
		if (character.length == 1) {
			length++;
		} else if (character.indexOf("%u") != -1) {
			length += 2;
		} else if (character.indexOf("%") != -1) {
			if (esc.indexOf(character) != -1) {
				length += 2;
			} else {
				length += character.length / 3;
			}
		}
	}
	return length;
}

function isDate(val){
	var ret = false;
	var year = 0;
    var month = 0;
    var day = 0;
	var thisMonth, nextMonth, maxday;
	
	year = Number(val.split("-")[0]);
	month = Number(val.split("-")[1]);
	day = Number(val.split("-")[2]);
	if(year >= 1900 && (month >= 1 && month <=12)) {
		thisMonth = new Date(year, month-1, 1);
		nextMonth = new Date(year, month, 1);
		maxDay = (nextMonth - thisMonth) / 1000 / 60 / 60 / 24;
		
		if(day >= 1 && day <= maxDay){
			ret = true;
		}
	}
		
	return ret;
}

function validatePassword(pw, options)
{
	var result = true;

	var o = {
				lower: 0,
				upper: 0,
				alpha: 0,
				numeric: 0,
				special: 0,
				length: [7, Infinity],
				custom: [],
				badWords: [],
				badSequenceLength: 0,
				noQwertySequences: true,
				noSequential: true
			};
			
	for (var property in options)
	{
		o[property] = options[property];
	}
	
	var	re = {
				lower:   /[a-z]/g,
				upper:   /[A-Z]/g,
				alpha:   /[A-Z]/gi,
				numeric: /[0-9]/g,
				special: /[\W_]/g
			 };
			 
	var rule, i;

	// 암호길이검사
	if (pw.length < o.length[0] || pw.length > o.length[1])
		result = false;//return false;
	// 소문자/대문자/대소문자/숫자/특수문자 룰 검사
	
	// 금지어인지 검사
	for (i = 0; i < o.badWords.length; i++) 
		if (pw.toLowerCase().indexOf(o.badWords[i].toLowerCase()) > -1)
			result = false;//return false;
	

	// 암호의 연속성 여부 검사
	var SamePass_0 = 0; //동일문자 카운트
	var SamePass_1 = 0; //연속성(+) 카운드
	var SamePass_2 = 0; //연속성(-) 카운드
	 
	var chr_pass_0;
	var chr_pass_1;
	 
	for(var i=0; i < pw.length; i++) 
	{
		chr_pass_0 = pw.charAt(i);
		chr_pass_1 = pw.charAt(i+1);
	
		//동일문자 카운트
		if(chr_pass_0 == chr_pass_1) 
		{
			SamePass_0 = SamePass_0 + 1
		}
	}
	if(SamePass_0 > 2) 
	{
		result = false;
	}
	
	if (o.badSequenceLength) {
		var	lower   = "abcdefghijklmnopqrstuvwxyz",
			upper   = lower.toUpperCase(),
			numbers = "0123456789",
			qwerty  = "qwertyuiopasdfghjklzxcvbnm",
			start   = o.badSequenceLength - 1,
			seq     = "_" + pw.slice(0, start);
		for (i = start; i < pw.length; i++) {
			seq = seq.slice(1) + pw.charAt(i);
			if (
				lower.indexOf(seq)   > -1 ||
				upper.indexOf(seq)   > -1 ||
				numbers.indexOf(seq) > -1 ||
				(o.noQwertySequences && qwerty.indexOf(seq) > -1)
			) {
				result = false;//return false;
			}
		}
	}
	
	if (!result)
	{
		alert("입력한 암호를 확인해 주십시오.\n\n" + 
		      "-----------------------------------------\n\n" + 
		      "1) 암호는 최소 8글자 이상이여야 합니다.\n\n" +
		      "2) 4회이상연속된 숫자나 알파벳을 입력할 수 없습니다."); 
	}

	return (result);				
}
