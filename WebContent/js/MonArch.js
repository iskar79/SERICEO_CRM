/// <reference path="../Resource.js" />

/*  
* version 0.1 2012-02-21
* Requires jQuery v1.6.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DB
*/

// 폼의 최초 관련리소스를 바인딩하기 //
(function ($, window, document) {
    // 2013.11.25 dmjung :: 이 구문 바인딩이 늦어서 문서 모드가 표준 이하로 설정되는 경우 발생. monform.htm 에 직접 선언함.
    //document.writeln('<meta http-equiv="X-UA-Compatible" content="IE=edge" />');
    document.writeln('<link type="text/css" href="/css/jquery-ui-1.8.18.custom.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="/css/jquery-ui-1.10.4.js"></script>');
    document.writeln('<link type="text/css" href="/js/thirdparties/fullcalendar-1.5.3/fullcalendar/fullcalendar.css" rel="stylesheet" />');
    //document.writeln('<script type="text/javascript" src="/css/jquery-ui-1.8.18.custom.min.js"></script>');
    document.writeln('<link type="text/css" href="/js/thirdparties/gridster/dist/jquery.gridster.css" rel="stylesheet">'); //20150227 jwkim 대쉬보드 기능  추가
    
    document.writeln('<script type="text/javascript" src="/Resource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.soap.2.0.js"></script>');

    // 2013.08.13 dmjung :: tokenField 관련 리소스 바인딩하기
    document.writeln('<link type="text/css" href="/js/thirdparties/Tokenfield-for-Bootstrap/bootstrap-tokenfield/bootstrap-tokenfield.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/Tokenfield-for-Bootstrap/bootstrap-tokenfield/bootstrap-tokenfield.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/Tokenfield-for-Bootstrap/google-code-prettify/prettify.js"></script>');
    document.writeln('<link type="text/css" href="/js/thirdparties/Tokenfield-for-Bootstrap/google-code-prettify/prettify.css" rel="stylesheet" />');
    document.writeln('<link type="text/css" href="/js/thirdparties/Tokenfield-for-Bootstrap/docs.css" rel="stylesheet" />');

    // 2013.06.03 dmjung :: codemirror Editor mode 선택시 적용될 js 리소스 바인딩하기.
    document.writeln('<link type="text/css" href="/js/thirdparties/codemirror/lib/codemirror.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/codemirror/lib/codemirror.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/codemirror/mode/javascript/javascript.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/codemirror/mode/sql/sql.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/codemirror/mode/css/css.js"></script>');

    // 2015.02.24 jwkim :: highchart4.10 리소스 바인딩 
    document.writeln('<script type="text/javascript" src="/js/thirdparties/highchart-4.10/highcharts.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/highchart-4.10/modules/funnel.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/highchart-4.10/modules/no-data-to-display.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/highchart-4.10/modules/exporting.js"></script>');
    
    //2014.04.09 jstree라이브러리 추가
    document.writeln('<script src="/js/thirdparties/jstree/jstree.min.js"></script>');
	document.writeln('<link rel="stylesheet" href="/js/thirdparties/jstree/themes/default/style.min.css" />');
	
    document.writeln('<script type="text/javascript" src="/js/jquery.ba-hashchange.min.js"></script>'); //historyBack기능



    // 2013.11.20 dmjung :: resizingCell 플러그인 바인딩.
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.resizingCell.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/thirdparties/tinymce4/tinymce.min.js"></script>'); //tinymce4버전 추가
    document.writeln('<script type="text/javascript" src="/js/thirdparties/fullcalendar-1.5.3/fullcalendar/fullcalendar.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.blockUI.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.qtip-1.0.0-rc3.min.js"></script>');//툴팁
    //document.writeln('<script type="text/javascript" src="/Resource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.form.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.utils.js"></script>'); //20130814 khma 공통유틸 추가
    document.writeln('<script type="text/javascript" src="/js/MonArchResource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.superContaner.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.Controls.Menu.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.jobButton.js"></script>');
    
    document.writeln('<script src="/js/thirdparties/gridster/dist/jquery.gridster.min.js" type="text/javascript" charset="utf-8"></script>'); //20150227 jwkim 대쉬보드 기능  추가
    
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.dashboard.js"></script>'); //20150227 jwkim 대쉬보드 기능  추가

    //document.writeln('<script type="text/javascript" src="/js/jquery.kdb.superContaner.min.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.filter.js"></script>');
	document.writeln('<script type="text/javascript" src="/js/jquery.md5.js"></script>');
	document.writeln('<script type="text/javascript" src="/js/thirdparties/crypto.js"></script>');
	//document.writeln('<link type="text/css" href="/css/superContaner.css" rel="stylesheet" />'); JDM 121231 : 모나크 8.1 htm에서 직접 바인딩
	
	// 2013.12.02 dmjung :: 김이사님 개발 기능 분리한 js 바인딩.
	//document.writeln('<script type="text/javascript" src="/js/thirdparties/temp_smkim/jquery.kdb.DynamicFlow.js"></script>');
	//document.writeln('<script type="text/javascript" src="/js/thirdparties/temp_smkim/jquery.kdb.superDiagram.js"></script>');
	//document.writeln('<script type="text/javascript" src="/js/thirdparties/temp_smkim/jquery.kdb.superLink.js"></script>');
	//document.writeln('<script type="text/javascript" src="/js/thirdparties/temp_smkim/d3.js"></script>');
	//document.writeln('<script type="text/javascript" src="/js/thirdparties/temp_smkim/jquery.event.drag-1.5.min.js"></script>');
	document.writeln('<script type="text/javascript" src="/js/thirdparties/jquery.jsPlumb-1.5.3-min.js"></script>');
	document.writeln('<script type="text/javascript" src="/js/jquery.kdb.campaignWorkflow.js"></script>');




    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.pie.min.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.stack.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.symbol.min.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.grow.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.spider2.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.debug.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.highlighter.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/thirdparties/flot/jquery.flot.orderBars.js"></script>');
    document.writeln('<!--[if lte IE 8]><script language="javascript" type="text/javascript" src="/js/thirdparties/flot/excanvas.min.js"></script><![endif]-->');
    document.writeln('<!--[if lte IE 9]><script language="javascript" type="text/javascript" src="/js/thirdparties/flot/excanvas.min.js"></script><![endif]-->');

    //document.writeln('<script  type="text/javascript" src="http://xxx.xxx.xxx.xxx:3000/socket.io/socket.io.js"></script>'); //소켓통신용 라이브러리
//    document.writeln('<script  type="text/javascript" src="/js/jquery.kdb.socketManager.js"></script>'); //커뮤니티메니져컨트롤
//    document.writeln('<script  type="text/javascript" src="/js/jquery.kdb.socketManager-ui.js"></script>'); //커뮤니티메니져 UI
    
    //document.writeln('<script  type="text/javascript" src="/js/thirdparties/jquery.nicescroll.340/jquery.nicescroll.js"></script>'); // scrollbar ui 컨트롤용 플러그인
    
	document.writeln('<script src="https://ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js"></script>'); // daum주소 

	
})($, window, document);
// 공통함수들 top, foot 메뉴처리, ContextMenu 메뉴처리
/// <summary>함수기능설명</summary>
/// <param name="num" type="string">파라메타설명</param>
/// <returns type="string">리턴타입설명</returns>
// 폼의 최초 관련리소스를 바인딩하기 //
(function ($, window, document, undefined) {
    $(document).ready(function () {
    	getUserInfo();
    });

})($, window, document);

(function ($, undefined) {
    //===============================================================================
    //   문자열처리기본함수들
    //===============================================================================
       
    $.SetComboMenu = function(mainMenus, subMenus){
        pMobj1 = $(".subtitle select:eq(0)") ;
        pMobj2 = $(".subtitle select:eq(1)") ;

        $("option", pMobj1).remove();
        $("option", pMobj2).remove();

        $.each(mainMenus,
        function (index, value) {
                pMobj1.get(0).options[pMobj1.get(0).length] = new Option(value.title, value.href);
        });

        for (var i = pMobj2.get(0).length - 1; i >= 1; i--) {pMobj2.get(0).options[i] = null;}
        $.each(subMenus,
        function (index, value) {
                pMobj2.get(0).options[pMobj2.get(0).length] = new Option(value.title, value.href);
        });

    };


})(jQuery);


function settingMenu() {
	$('#TopMenu').controlsMenu('cacheSubMenu');
	if(opener){ // 팝업창일떄 SetHead와 setStartMenu 하는걸 방지하기 위해.
		if(!opener.closed){
			var _menu = $.getUrlVars()["menu"];
            if(_menu != undefined){
                $('#head').controlsMenu('setGoMenu',_menu);
                $('#TopMenu').controlsMenu('setHead');
            }else{
            	var _popgbn = $.getUrlVars()["popgbn"];
            	if(_popgbn != undefined && _popgbn == "false"){
            		$('#head').controlsMenu('setStartMenu');
            		$('#TopMenu').controlsMenu('setHead');
            	}
            }
		}
    }else{
    	var _menu = $.getUrlVars()["menu"];
        if(_menu != undefined){
            $('#head').controlsMenu('setGoMenu',_menu);
			 $('#TopMenu').controlsMenu('setHead');
		}else if(_menu == 'iframe'){
			//메뉴가 iframe으로 들어오면, 메인화면 내에서 아이프레임을 사용함.
			//시작화면 이동을 제한함.
			alert("iframe!!!!!");
        }else{
            if(isEmpty(hashInfo("m"))){ //해쉬정보가 남아있으면 시작화면으로 이동하지 않음.
        		$('#head').controlsMenu('setStartMenu');
				$('#TopMenu').controlsMenu('setHead');
        	}
            else {
            	historyBackProc();
            	$('#TopMenu').controlsMenu('setHead');
            }
			 
        }
    }
    $('#head ul').show();
    $('.logoutarea').show();
    $('.Holder').css('min-height', $(window).height() - 92);


    //$('#Footer').chat()
    // 자동 브라우저 height 로 화면 높이 설정하기 :: 로그인 되어있을 경우를 위해 추가. JDM
	
}

function errorInLogin(message) {
	alert(message); 
	window.location.href = "http://" + window.location.host + "/"; //해쉬URL정보 클리어
}

function getUserInfo() {
	//getUserInfo
	if ( _M.UserInfo.id == undefined || _M.UserInfo.id == "" ) {
		if ( _M.Webtype == "Java" ) {
			$.ajax({
				type: "POST",
				url: "getUserInfo.json",
				data: "",
				success: function (data) {
					if ( data.resultInfo.result != "SUCCESS" ) { 
						errorInLogin("error");
						return; 
					}
					setUserInfo(data.userInfo); //유저정보셋팅
					
					settingMenu();
					
					 if(!data.userInfo["logined"]) {
					    	//로그인인증후 최초 처리들
					    	var pwUpdDate = data.userInfo["pwUpdDate"];
					    	if(pwUpdDate == null) {
					    		//TODO pwUpdDate가 null이면 최초 등록시 로그인 유저이므로 비밀번호 변경 권유
					    		alert('최초 로그인 후 패스워드를 변경하지 않았습니다.\n 패스워드를 변경해 주십시요.');
					    		$('.opticon-config').trigger('click');
					    	}else {
					    		var betweenDays = ((new Date()).getTime() - pwUpdDate)/1000/60/60/24;
					    		if( betweenDays > 90 ) {
					    			//TODO 비밀번호가 변경된 지 90일이 지났습니다. \n보안을 위해서 새 비밀번호로 변경해 주십시요.
					    			alert('비밀번호가 변경된 지 90일이 지났습니다. \n보안을 위해서 새 비밀번호로 변경해 주십시요.');
					    			$('.opticon-config').trigger('click');
					    		}else {
					    			//TODO
					    		}
					    	}
					    }
					
				},
				error: function (data) {
					var _msg = jQuery.parseJSON(data.responseText);
					errorInLogin(_msg.resultInfo.message);
					return;
				}
			});
        } else {
            $.ajax({
                type: "POST",
                url: "/bzService/SvcCRUD.asmx/getUserInfo",
                data: {},
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                success: function (result) {
                    if (result.d["M_USER_NO"] != undefined && result.d["M_USER_NO"] != null || result.d["M_USER_NO"] == "0") {
                        setUserInfo(result.d);
                        settingMenu();
                    } else {
                        alert("세션이 종료되었습니다. 다시 로그인 해주세요");
                        location.href = "/monlogin.htm";
                    }

                }
            });
        }
	}
}


function keyValueSetting(key, url) {
	sessionStorage.setItem("noticeKey", key);
	location.href = url;
}