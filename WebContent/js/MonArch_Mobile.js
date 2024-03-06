/// <reference path="../Resource.js" />

/* WiseClub 
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
    document.writeln('<meta http-equiv="X-UA-Compatible" content="IE=edge" />');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.soap.2.0.js"></script>');
    document.writeln('<link type="text/css" href="/css/theme/silgi/jquery-ui-1.8.18.custom.css" rel="stylesheet" />');
    document.writeln('<link type="text/css" href="/js/fullcalendar-1.5.3/fullcalendar/fullcalendar.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="/css/theme/silgi/jquery-ui-1.8.18.custom.min.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/tinymce/jscripts/tiny_mce/jquery.tinymce.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/fullcalendar-1.5.3/fullcalendar/fullcalendar.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.blockUI.js"></script>');
    document.writeln('<script type="text/javascript" src="/Resource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.form.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/MonArchResource_Mobile.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.superContaner.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.md5.js"></script>');
    document.writeln('<link type="text/css" href="/css/MonArch.8.1_Mobile.css" rel="stylesheet" />');
    document.writeln('<link type="text/css" href="/css/superContaner.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true&language=ko"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/flot/jquery.flot.min.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/flot/jquery.flot.pie.min.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/flot/jquery.flot.stack.min.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/flot/jquery.flot.symbol.min.js"></script>');
    document.writeln('<script language="javascript" type="text/javascript" src="/js/flot/jquery.flot.grow.js"></script>');
    document.writeln('<!--[if lte IE 8]><script language="javascript" type="text/javascript" src="/js/flot/excanvas.min.js"></script><![endif]-->');
    
})($, window, document);
// 공통함수들 top, foot 메뉴처리, ContextMenu 메뉴처리
/// <summary>함수기능설명</summary>
/// <param name="num" type="string">파라메타설명</param>
/// <returns type="string">리턴타입설명</returns>
// 폼의 최초 관련리소스를 바인딩하기 //
(function ($, window, document, undefined) {
    $(document).ready(function () {
        $.Login(function(e) {
            $('#head').superContaner('setGoMenu','1010');
            $('#head ul').show();
            $('.ui-logout').show();
        });
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
