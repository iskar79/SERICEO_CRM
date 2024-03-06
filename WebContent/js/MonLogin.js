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
    document.writeln('<link type="text/css" href="/css/jquery-ui-1.8.18.custom.css" rel="stylesheet" />');
    document.writeln('<link type="text/css" href="/js/thirdparties/fullcalendar-1.5.3/fullcalendar/fullcalendar.css" rel="stylesheet" />');
    document.writeln('<script type="text/javascript" src="/css/jquery-ui-1.10.4.js"></script>');
    document.writeln('<script type="text/javascript" src="/Resource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.soap.2.0.js"></script>');

    document.writeln('<script type="text/javascript" src="/js/jquery.form.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.utils.js"></script>'); //20130814 khma 공통유틸 추가
    document.writeln('<script type="text/javascript" src="/js/MonArchResource.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.superContaner.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.Controls.Menu.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.jobButton.js"></script>');
    document.writeln('<script type="text/javascript" src="/js/jquery.kdb.filter.js"></script>');
	document.writeln('<script type="text/javascript" src="/js/jquery.md5.js"></script>');
	document.writeln('<script type="text/javascript" src="/js/thirdparties/crypto.js"></script>');

})($, window, document);
(function ($, window, document, undefined) {
    $(document).ready(function () {
        $.Login();
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