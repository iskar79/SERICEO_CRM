/// <reference path="../Resource.js" />

/* jQuery grid plugin: 
* version 2.0 2026-11-11
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

// 폼의 최초 관련리소스를 바인딩하기 //
(function ($, window, document) {
    // 2013.11.25 dmjung :: 이 구문 바인딩이 늦어서 문서 모드가 표준 이하로 설정되는 경우 발생. monform.htm 에 직접 선언함.
    //document.writeln('<meta http-equiv="X-UA-Compatible" content="IE=edge" />');
    document.writeln('<link type="text/css" href="/css/jquery-ui-1.8.18.custom.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="/css/jquery-ui-1.10.4.js"></script>');
    //document.writeln('<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css" />');
    document.writeln('<link type="text/css" href="/js/thirdparties/fullcalendar-1.5.3/fullcalendar/fullcalendar.css" rel="stylesheet" />');
    //document.writeln('<script type="text/javascript" src="/css/jquery-ui-1.8.18.custom.min.js"></script>');
    //document.writeln('<script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>');
    
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

    //2014.04.09 jstree라이브러리 추가
//    document.writeln('<script src="http://static.jstree.com/3.0.0-beta10/assets/dist/jstree.min.js"></script>');
//    document.writeln('<script src="/js/thirdparties/jstree/jstree.min.js"></script>');
//	document.writeln('<link rel="stylesheet" href="/js/thirdparties/jstree/themes/default/style.min.css" />');
	
    document.writeln('<script type="text/javascript" src="/js/jquery.ba-hashchange.min.js"></script>'); //historyBack기능



    // 2013.11.20 dmjung :: resizingCell 플러그인 바인딩.
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.resizingCell.js"></script>');

    document.writeln('<script type="text/javascript" src="/js/thirdparties/tinymce4/tinymce.min.js"></script>'); //tinymce4버전 추가
    document.writeln('<script type="text/javascript" src="/js/thirdparties/fullcalendar-1.5.3/fullcalendar/fullcalendar.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.blockUI.js"></script>');
    document.writeln('<script type="text/javascript" src="http://malsup.github.io/jquery.blockUI.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.qtip-1.0.0-rc3.min.js"></script>');//툴팁
    //document.writeln('<script type="text/javascript" src="/Resource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.form.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.utils.js"></script>'); //20130814 khma 공통유틸 추가
    document.writeln('<script type="text/javascript" src="/js/MonArchResource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.superContaner.js"></script>');
    // 20261111 khma Start : SurveyAnsform.htm 등 단독 페이지에서도 분리된 core 하위 모듈(superAnswer 등)이 정상 동작하도록 순차 로드 추가
    document.writeln('<script type="text/javascript" src="/js/core/jquery.kdb.core.superCalendar.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/core/jquery.kdb.core.superTree.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/core/jquery.kdb.core.superChart.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/core/jquery.kdb.core.superMap.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/core/jquery.kdb.core.superAnswer.js"></script>');
    // 20261111 khma End : 분리된 core 하위 모듈 순차 로드 추가
    //document.writeln('<script type="text/javascript" src="/js/jquery.kdb.Controls.Menu.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.jobButton.js"></script>');
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
   
	
})($, window, document);

