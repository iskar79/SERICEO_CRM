/// <reference path="../Resource.js" />

/*!
* jQuery grid plugin: 
* 
* version 0.1 2011-07-21
* Requires jQuery v1.6.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DB
*
*/
var _Biz = {
    인증: {
        로그인: function (id, pass, scode) {
			$.cookie('gSite','');
			if(scode == "" || scode == undefined) { scode = "SERICEO"; }
        	if ( !checkLoginData(id, pass, scode) ) { return false; }
        	// input을 hidden 타입으로 새로 만들어서 값 넘겨주기 : 기존 input에 넣어도 되는지 확인한 후 수정
            $("#loginForm").append("<input type='hidden' id='id' name='id' value='" + id + "' />");
            $("#loginForm").append("<input type='hidden' id='scode' name='scode' value='" + scode + "' />");
            //$("#loginForm").append("<input type='hidden' id='pass' name='pass' value='" + $.md5(pass) + "' />");
			$("#loginForm").append("<input type='hidden' id='pass' name='pass' value='" + SHA256(pass) + "' />");
            // action 세팅 후 submit
			if (_M.Webtype == "Java") {
                $("#loginForm").attr("action", "/login.mon");
				$("#loginForm").submit();
            }
			else {
                var pl = new JSONClientParameters();
                pl.add("id", id);
                pl.add("pass", SHA256(pass));
				//pl.add("pass", $.md5(pass));
                pl.add("scode", scode);
                $.ajax({
                    type: "POST",
                    url: "/bzService/SvcCRUD.asmx/loginProcess",
                    data: pl.toXml(),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        if (result.d == true) {
                            location.href = "/monform.htm";
                        } else {
                            alert("사용자 정보가 일치하지 않습니다.");
                            return false;
                        }
                    },
                    error: function (result) {
                        alert("Failed" + result);
                    }
                });
            }
		},
		/* 이전 버전 로그인 (UKEY 사용)
		sessionlogin: function (id, pass, scode) {
            var rlt = false;
            var pl = new JSONClientParameters();
            pl.add("service", 'MON_COMMON');
            pl.add("method", 'LOGIN_CHECK');
            pl.add('id', id);
            pl.add('scode', scode);
            pl.add('pass', $.md5(pass));
            $.SvcCallPl("MON_COMMON", "LOGIN_CHECK", pl, function (data) {
                if (data.resultData[0]["M_USER_NO"] > 0) {
					setUserInfo(data.resultData[0]); //유저정보셋팅
					rlt = true;
					// mcm 커넥트 
                    //kdbSocketManager.connect();
                } else {
                    alert("인증실패");
                    clearUserInfo();
                }
            }, _M.aSync.sync);

            return rlt;
            
        },*/
        SITE목록: function (id, mngrflag) {
            // 2024.02.19 khma 관리자 기능 (SERICEO 특화된 기능) -- 기존의 기능을 추가         
            var pl = new JSONClientParameters();
            pl.add('id', id);
            if (mngrflag == "1") {
                //최고관리자인 경우
                $.SvcCallPl("SITE", "LIST", pl, function (data) {
					if (data.resultData.length > 1) {
                        var _o = $(".ui-site", $(document.body));
                        var _sel = $("<select class='selsite'></select>").appendTo(_o);
                        //var _sel = $(".selsite", $(document.body));
                        var _selected = "";
						$.each(data.resultData, function (index, row){
                            if (_M.UserInfo.gsite == row["CODE"]) {
                                _selected = "selected='selected'";
                            } else {
                                _selected = "";
                            }
                            $("<option value='" + row["CODE"] + "' " + _selected + ">" + row["DECODE"] + "</option>").appendTo(_sel);
                        });
                    }
				}, _M.aSync.sync);
            } else {
                $(".ui-site", $(document.body)).hide();
            }

            //if (mngrflag == "1" || mngrflag == "2") {
            if (_M.UserInfo.gsite == "MS") {
                //SERI담당자
                var _objCorp = $(".ui-corp", $(document.body));

                //$(".ui-top-label", $(document.body)).html(" 법인:");
                $(".ui-top-label", $(document.body)).html("<span class='fldTdLabel fldTdLabel-ft' title='법인'>법인: </span>");
				
				var _oHstr = "";
				_oHstr += "<div class='fieldContaner' type='linkKey' field='GGCORP' oldvalue='' value='' linkfield='거래처명' linkjson='거래처ListJsonPopUp' bindfield='거래처명' style='width: 100%;'>";
				_oHstr += "	<div class='fieldView' style='display: none;'></div>";
				_oHstr += "	<div class='fieldEdit'>";
				_oHstr += "	</div>";
				_oHstr += "</div>";
				
				var _obj = $(_oHstr).appendTo(_objCorp);
                var _fieldEdit = $(".fieldContaner[field='GGCORP'] .fieldEdit", _objCorp);
				var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
				
				var _iHstr = "<input  class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' for='linkkey' />";				
				var _o = $(_iHstr).appendTo(_span).change(function () {
								_o.attr("data", $(this).val());
							});

				var _img = $("<span class='icon i-20 icon-search align-middle'></span>").appendTo(_span);
				_img.click(function (e) {
					var _fieldContaner = $(this).parents(".fieldContaner");
					$.ShowPopUpTableJson(
						_fieldContaner.attr("linkJson"),_fieldContaner,function (key, display, trobj) {
							if (key != undefined) {
								$("input", _fieldContaner).val($.decHTML(display));
								$("input", _fieldContaner).attr("data", $.decHTML(display));
								_fieldContaner.attr("linkvalue", key);
								_fieldContaner.trigger("change");
							}
						}
					);
				});
				
				_o.keydown(function (e) {
					var _fieldContaner = $(this).parents(".fieldContaner");
					if (e.keyCode == "13") {
						// var _inputval = _o.val();
						e.preventDefault();
						$.ShowPopUpTableJson(
							_fieldContaner.attr("linkJson"),_fieldContaner,function (key, display, trobj) {
								if (key != undefined) {
									$("input", _fieldContaner).val(display);
									_fieldContaner.attr("linkvalue", key);
									_fieldContaner.trigger("change");
								}
							}
						);
					}
				});

                //$(".ui-corpsave", $(document.body)).html("<div class='cmdspanwrap'><input type='button' class='cmdbtn cmdspan-ft' value='GCORP' index='GCORP' incomm='GCORP'></div>");
				$(".ui-corpsave", $(document.body)).html("<a class='ActionCmd'>저장</a>");
				//$(".ui-corpsave", $(document.body)).html("[저장]");
                var _obtn = $(".ui-corpsave", $(document.body));

                $(".fieldContaner[field='GGCORP']", _objCorp).val(_M.UserInfo.gcorp);
                _o.val(_M.UserInfo.gcorpnm);
                _obtn.click(function () {
                    var ans = confirm("저장 하시겠습니까?");
                    if (!ans) {return false;}

                    //var v_corp = $(".fieldContaner[field='GGCORP']", _objCorp).attr("value");
                    var v_corp = $(".fieldContaner[field='GGCORP']", _objCorp).attr("linkvalue");
                    var v_corpnm = $(".fieldContaner[field='GGCORP'] input", _objCorp).val();
					
                    //alert("v_corp:" + v_corp);
					debugger;
					if(v_corp != "" && v_corpnm != ""){
						$.cookie("gCorp", v_corp);
						$.cookie("gCorpNm", v_corpnm);
					} else {
						$.cookie("gCorp", "");
						$.cookie("gCorpNm", "");
					}
                    var pl = new JSONClientParameters();
                    pl.add('ID', _M.UserInfo.id);
                    pl.add('CORP', v_corp);
                    $.SvcCallPl("MON_COMMON", "UPDATE_GCORP", pl, function (data) { }, false);

                    location.reload();
                });
            } else {
                $(".ui-corp", $(document.body)).hide();
                $(".ui-corpsave", $(document.body)).hide();
            }
        },
        /* Start  LG하우시스 전용 SSO 로그인 처리 20120730 khma */
        SSO로그인: function (id, scode) {
            var rlt = false;
            var pl = new JSONClientParameters();
            pl.add("service", 'MON_COMMON');
            pl.add("method", 'SSO로그인');
            pl.add('id', id);
            pl.add('socde', socde);
            $.SvcCallPl("MON_COMMON", "SSO_LOGIN_CHECK", pl, function (data) {
                if (data.resultData[0]["M_USER_NO"] > 0) {
					setUserInfo(data.resultData[0]); //유저정보셋팅
                    rlt = true;
                } else {
                    alert("인증실패");
                }
            }, _M.aSync.sync);

            return rlt;
        },
        /* End  LG하우시스 전용 SSO 로그인 처리  20120730 khma*/
        정보: function (userAuthKey) {
            var rlt = false;
            var pl = new JSONClientParameters();
            pl.add('USER_AUTH_KEY', userAuthKey);
            $.SvcCallPl("MON_COMMON", "AUTH_INFO", pl, function (data) {
                if (data.resultData[0]["MESSAGE_CODE"] == 0) {
					setUserInfo(data.resultData[0]); //유저정보셋팅
					rlt = true;
					//kdbSocketManager.connect();
                } else {
                    alert("인증실패");
                    alert(data.resultData[0]["RST_MESSAGE"]);
                    clearUserInfo();
                }
            }, _M.aSync.sync);

            return rlt;
        }

    }
};

/**
 *유저정보 셋팅 및 우저별 로고 테마 설정
 */
function setUserInfo(data){
	
	let gSite = $.cookie('gSite');
	 if($.cookie('gSite') == "") {  gSite = data["gsite"]; }
	let gCorp = $.cookie('gCorp');
	 if($.cookie('gCorp') == "") {  gSite = data["gcorp"]; }
	let gCorpNm = $.cookie('gCorpNm');
	 if($.cookie('gCorpNm') == "") {  gSite = data["CORPNM"]; }
	 
	_M.UserInfo.id = data["userNo"];
    _M.UserInfo.lid = data["userCode"];
    _M.UserInfo.SID = data["usiteNo"];
    _M.UserInfo.name = data["userName"];
    _M.UserInfo.depart = data["deptNo"];
    _M.UserInfo.departnm = data["deptName"];
    //_M.UserInfo.level = data["LEVEL"];
    _M.UserInfo.level = data["excelAuth"];
    _M.UserInfo.lang = data["userLang"];
    _M.UserInfo.dvl = data["dvLevel"];
    
    _M.UserInfo.xlauth = data["excelAuth"];
    if(data["excelAuth"] == undefined || data["excelAuth"] == ""){
		$.SvcGetRow('M_USER','READ_XLS_AUTH','M_USER_NO', _M.UserInfo.id, function(Row) {
			//엑셀다운로드 권한 조회를 위하여 추가함
			_M.UserInfo.xlauth = Row.XLS_AUTH;
		});
	}
    
    _M.UserInfo.logo = data["siteLogo"];
    _M.UserInfo.menupos = data["menuPosition"];
    
    //_M.UserInfo.gsite = data["gsite"];
    _M.UserInfo.gsite = gSite;
	//_M.UserInfo.gcorp = (data["CORP"] == null) ? "" : data["CORP"];
    if(_M.UserInfo.gsite == "MS"){
		_M.UserInfo.gcorp = gCorp;
	} else {
		_M.UserInfo.gcorp = "";
	}
	//_M.UserInfo.gcorpnm = (data["CORPNM"] == null) ? "" : data["CORPNM"];
    if(_M.UserInfo.gsite == "MS"){
		_M.UserInfo.gcorpnm = gCorpNm;
	} else {
		_M.UserInfo.gcorpnm = "";
	}
	_M.UserInfo.tcorp = (data["TCORP"] == null) ? "" : data["TCORP"];
	_M.UserInfo.tcorpnm = (data["TCORPNM"] == null) ? "" : data["TCORPNM"];
    
    // 2014.03.11 dmjung :: menu 좌측, 상단 레이아웃 옵션에 따라 왼쪽 메뉴 배경 그리기 선택.
    var isMenuTop = _M.UserInfo.menupos;

    if (isMenuTop == '20') {
        $(document.body).find('div.Box').removeClass('navi-bg');
    } else {
        $(document.body).find('div.Box').addClass('navi-bg');
    }
    // :: end ::
                                                    
    $('.ui-username').html("<span class='name'>" + _M.UserInfo.name + "</span>님");
    //$('.ui-direction').html("◀");
    //changeTheme(data["theme"]); //테마 
    var Mon_Theme = 'css/Theme_CEO.css';
    if(_M.UserInfo.gsite == 'CEO' || _M.UserInfo.gsite == 'PRO'){
		Mon_Theme = 'css/Theme_' + _M.UserInfo.gsite + '.css';
	} else {
		Mon_Theme = 'css/Theme_ETC.css';
	}
    changeTheme(Mon_Theme);
    if ( null != _M.UserInfo.logo && '' != _M.UserInfo.logo ) {
    	$('#logobg').css({'background': 'url('+ _M.UserInfo.logo+')  no-repeat center center'}); //로고
    }
    else {
    	$('#logobg').css({'background': 'url(/image/logo2.png)  no-repeat center center'}); //로고
    }
    //$.cookie('UKEY', _M.UserInfo.key, { expires: 36000000 }); // expires가 정상동작하지 않아 refresh시 로그인창으로 튕겨 수정함. 2012.07.18 hsjung

    //_Biz.인증.SITE목록(_M.UserInfo.id, data.Table.Rows[0]["MNGR_FLAG"]);
    _Biz.인증.SITE목록(_M.UserInfo.id, '1');
                    
    // 2013.06.20 dmjung :: 브라우저 버전 체크, IE8일 때 logoutarea 에 고정값 추가.
    var ieVer = $.getInternetVersion();
    if ( ieVer == "8" ) {
        var userName = $('.ui-username', '.logoutarea').width();
        var iconSet = $('.iconset', '.logoutarea').width();
        $('.logoutarea').css('width', userName + iconSet + 20);
    }
}


/** 유저정보 클리어 */
function clearUserInfo(){
	_M.UserInfo.id = '';
    _M.UserInfo.name = '';
    $.cookie('UID', '', { path: '/' });
    $.cookie('UNM', '', { path: '/' });
    $.cookie('ssoUID','', { path: '/' });
    _M.UserInfo.lid = '';
    _M.UserInfo.SID = '';
    _M.UserInfo.depart = '';
    _M.UserInfo.departnm = '';
    _M.UserInfo.cardcd = '';
    _M.UserInfo.dvl = '0';
    _M.UserInfo.xlauth = '0';
    _M.UserInfo.logined = false;
}
/**
 *테마변경  
  */
function changeTheme(cssName){
	if(cssName ==undefined || cssName == ''){
		$('#CSSlink').attr('href', '/css/Theme_820.css');	
	}else{
		$('#CSSlink').attr('href', cssName);	
	}
	
	if(cssName != undefined || cssName != ''){
		$('#CSSlink').attr('href', cssName);
	} else {
		$('#CSSlink').attr('href', '/css/Theme_Thebuttons.css');
	}
	
}

/** 로그인 데이터 체크 */
function checkLoginData(id, pass, scode) {
	if ( id == undefined || id == "" ) {
		alert("사용자 아이디를 입력해주세요.");
		return false;
	}
	else if ( pass == undefined || pass == "" ) {
		alert("사용자 비밀번호를 입력해주세요.");
		return false;
	}
	else if ( scode == undefined || scode == "" ) {
		alert("회원사 코드를 입력해주세요.");
		return false;
	}
	return true;
}