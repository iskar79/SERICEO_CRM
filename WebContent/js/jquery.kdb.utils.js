/*
* 공통 유틸
* 
* version 0.1 2011-08-14
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Jungwon
* Company : Kongyoung DB
*/

/* uniqueKey 생성 메소드 */
function makeUniqueKey(jobType, userNo) {
	var uniqueKey = "";
	var timestamp = new Date().getTime();
	if(isNotEmpty(jobType)){	
		uniqueKey += jobType;
	}
	if(isNotEmpty(userNo)){	
		uniqueKey += userNo;
	}
	uniqueKey += timestamp;
	return uniqueKey;
}		

/* 객체가 undefined/ null/ 공백('')인경우 true */
function isEmpty( obj ){
	if(undefined == obj || null == obj || "" == $.trim(obj)){
		return true;
	}else{
		return false;
	}
}

/* 객체가 undefined/ null/ 공백('')아닌경우 true */
function isNotEmpty( obj ){
	if(undefined == obj || null == obj || "" == $.trim(obj)){
		return false;
	}else{
		return true;
	}
}


/* 클릭 중복 방지 처리 메소드 */
function limitBtnClick(obj, n) {    
    var second = 1;
    if ( undefined != n ) {
        second = n;
    }
	var runTime = obj.attr("runTime");
	var rst = true;
	if (isNotEmpty(runTime)) {
                // 실행중이니깐 리턴함 (중복실행방지)
                var year  = runTime.substr(0,4);
                var month = runTime.substr(5,2) - 1; // 1월=0,12월=11
                var day   = runTime.substr(8,2);
                var hour  = runTime.substr(11,2);
                var min   = runTime.substr(14,2);
                var sec   = runTime.substr(17,2);

                var nStart = new Date(year,month,day,hour,min,sec);
                var nEnd =  new Date().getTime();      //종료시간 체크(단위 ms)

                var nDiff = nEnd - nStart;      //두 시간차 계산(단위 ms)
                if (nDiff <= 1000 * second) {
                  // alert("run...");
                   rst = false;
                } 
	}
	if(rst){
		obj.attr("runTime", _M.f.d.getTimeStamp());
	}		
	return rst;
}

/* PageHistory처리 메소드 */
function historyBackProc() {

    var hash = location.hash;
    //alert(_M.PrevActGbn.currMenuId);
	if(isNotEmpty(_M.UserInfo.id)){
		if (isNotEmpty(hash)) {
			var arrDpt1 = hash.replace('#', '').split(':');
			var m = '';
			var t = '';
			var f = '';
			$.each(arrDpt1, function (index, value) {
				//alert(value);
				var arrHash = value.split('_');

				var prefix = arrHash[0];
				var val = arrHash[1];
				//alert("prefix:" + prefix + " val:" + val);
				switch (prefix) {
					case 'm': //메뉴
						m = val;
						break;
					case 'f': //슈퍼플로우클릭
						f = val;
						break
					case 't': //서브탭
						t = val;
						break;

				}

			});
			if (isEmpty(m)) {
			    $('#head').controlsMenu('setStartMenu');
				//alert('2');
			} else if (_M.PrevActGbn.currMenuId != m) {
                $('#head').controlsMenu('setGoMenu', m);
				$('#TopMenu').controlsMenu('setHead');
			} else if (_M.PrevActGbn.currMenuId == m) {
				moveFlow(f);
			}

		} else {
            $('#head').controlsMenu('setStartMenu'); 
		}
	}
}
/* historyBackProc에서 플로우 이동시 사용하는 메소드 */
function moveFlow(f) {
    var fCnt = $('#Flowtop').find('li').size();
    if (fCnt > 0) { //플로우가 존재할대만 동작
        if (isEmpty(f)) {
            var flowObj = $('#Flowtop');
            var flow = $('li:eq(0)', flowObj);
            flow.controlsMenu('setGoFlowStep', flow);
        } else {
            var flowObj = $('#Flowtop');
            var flows = flowObj.find('li');
            $.each(flows, function (index, flow) {
                var fObj = $(flow);
                if (f == fObj.attr('step')) {
                    fObj.controlsMenu('setGoFlowStep', fObj);
                }
            });

        }
    }
}

/* 해쉬정보를 구분하여 취득하는 함수 opt: 'f':플로우 'm': 메뉴 't':탭 */
function hashInfo(opt) {

    var hash = location.hash;
    var rstHash = new Array();
    var arrDpt1 = hash.replace('#', '').split(':');
    var m = '';
    var t = '';
    var f = '';
    $.each(arrDpt1, function (index, value) {
        //alert(value);
        var arrHash = value.split('_');

        var prefix = arrHash[0];
        var val = arrHash[1];
        //alert("prefix:" + prefix + " val:" + val);
        switch (prefix) {
            case 'm': //메뉴
                m = val;
                break;
            case 'f': //슈퍼플로우클릭
                f = val;
                break
            case 't': //서브탭
                t = val;
                break;

        }
    });

    if (opt == 'm') {
        return m;
    } else if (opt == 'f') {
        return f;
    } else if (opt == 't') {
        return t;
    } else {
        return null;
    }
}

/* tinymce객체를 삭제하는 메소드  */
function removeEditor() {    
	//editor삭제 2013-10-24 jwkim tinmymce삭제
    if (undefined != tinymce.activeEditor) {
        //2013.10.28 dmjung :: IE8+ 에서 tinymce 에디터 인스턴스가 잔존하는 현상이 있어서 해당 부분 삭제하는 처리임.
        //                  :: tinymce 4.08 버전에서는 인스턴스 삭제 처리 후 다시 tinymce 생성할 때 SCRIPT70: 권한이 없습니다. 메시지 발생
        //                  :: tinymce 4.10 버전에서는 인스턴스 삭제 처리 후 다시 tinymce 생성할 때 lastFocusBookmark 속성이 null 처리되어 동작은 정상적으로 하나, 콘솔에 에러메시지가 뿌려짐.
        //                  :: tinymce.min.js 자체를 수정하여 exception 메시지 출력하지 않도록 처리하였음. ( //index :: lastFocusBookmark 주석처리 된 부분 마킹 )
        tinymce.remove();
	}
}

/* Date 타입 변환 */
function getDateIE8Compatible(tDate){
	var rstDate;
	try {
		if (tDate.indexOf('Date') > 0) {
			rstDate = eval(tDate.replace(/\/Date\((\d+)\)\//gi, "new Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
		} else if ( tDate == "" || tDate == undefined ){
			rstDate ="";
		} else if(tDate.indexOf('-') < 0){  //오라클일때 value가number로 넘어와서 string으로 셋팅됨... 
			rstDate= eval("new Date("+tDate+")");
		} else if(tDate.indexOf('-') >= 1 ){  //(yyyy-mm-dd형태의 스트링으로 넘어올때
			//rstDate = tDate.replace(/\-/gi, "");
			var splitDate = tDate.split("-");
			//rstDate = eval(new Date(rstDate.substring(0,4),rstDate.substring(5,6)-1,rstDate.substring(7,8)));
			rstDate = eval(new Date(splitDate[0],splitDate[1]-1,splitDate[2]));
		}	
	}catch(e) {
		rstDate ="";
	}
	return rstDate;
}

/* 브라우저 스크롤바 폭 취득 */
function getScrollbarWidth() 
{ 
    var outer = document.createElement("div"); 
    outer.style.visibility = "hidden"; 
    outer.style.width = "100px"; 
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps 
    
    document.body.appendChild(outer); 
    var widthNoScroll = outer.offsetWidth; // force scrollbars 
    outer.style.overflow = "scroll"; // add innerdiv 
    
    var inner = document.createElement("div"); 
    inner.style.width = "100%"; 
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth; // remove divs 
    outer.parentNode.removeChild(outer);

    var width = widthNoScroll - widthWithScroll;
    
    return widthNoScroll - widthWithScroll;
}

(function ($) {
    $.fn.hasScrollBar = function () {
        var result = {
            vertical : this.get(0).scrollHeight > this.height(),
            horizontal : this.get(0).scrollWidth > this.width()
        }
        return result;
    }
})(jQuery);