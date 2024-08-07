/*
* version 1.0 2014-02-26
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Dong Min Jung
* Company : Kongyoung DBM
*/

; (function ($, window, document, undefined) {
    

    // 플러그인 기본 셋팅
    var pluginName = "controlsMenu",
        dataPlugin = "plugin_" + pluginName,
        settings = {
            menuLocation : 'left'
        };



    // 플러그인 프라이빗 메서드
    var privateMethod = function () {
        console.log("private method");
    };




    // 컨스트럭터 선언 후 옵션 병합
    var Plugin = function (element) {
        this.options = $.extend({}, settings);
    };


    

    // 실제 플러그인 함수 선언
    Plugin.prototype = {
        setHead: function () {            
            $(document).on("click", "#TopMenu > li > a, #TopMenu li span", function (e) {
                var _o = $(this).parent();

                $('#TopMenu li').removeClass("menu-on-b").removeAttr('selected');
                $('#TopMenu li').find("span").removeClass("text-on");
                $('#TopMenu li').find("a").removeClass("on");
                _o.attr('selected', 'selected').addClass("menu-on-b");

                // 2014.02.28 dmjung :: 서브메뉴 toggle 처리
                if ($('.Mon').hasClass('layoutTop')) {
                    if (_o.hasClass('menu-on-b')) {
                        $('.SubMenu').show();
                    } else {
                        $('.SubMenu').hide();
                    }
                    $('.SubMenu').click(function () {
                        $('.SubMenu').hide();
                    });
                }

                _o.find("span").addClass("text-on");
                _o.find("a").addClass("on");


                $('.SubMenu').controlsMenu('setSubMenu', _o.attr('menuID'));

                // 2014.02.28 dmjung :: 서브메뉴 없을 경우 안 toggle.
                if ($('.Mon').hasClass('layoutTop') && $('.SubMenu').find('li').size() <= 0) {
                    $('.SubMenu').hide();
                }

            });

            $(document).not(".SubMenu").on("click", "#TopMenu li", function (e) {
            	e.stopImmediatePropagation();
                var _o = $(this);
                if (limitBtnClick(_o) == false) return; //중복클릭 방지 처리
                //30232030 khma menuid 속성 추가 start
                var menuid = _o.attr("menuid");
                $('.Title').attr('menuid', menuid);
                setPrevActGbn(menuid, "", '메뉴이동');
                // 2014.03.12 dmjung :: URL 에 메뉴 아이디 삽입.
				
//                if ( history.pushState != undefined ) {
//                    history.pushState('', '', '/monform.htm#m_' + menuid);
//                } else {
//                    location.hash = '/monform.htm#m_' + menuid;
//                }

                // 2014.03.24 dmjung start :: 대메뉴 클릭시에도 지정한 구조체 타이틀 변경될 수 있도록 처리
                var mainList = $(this).attr('mainlist');
                var mainView = $(this).attr('mainview');
                var topmenuTitle = $(this).find("span").text();

                if ( $(".SubMenu").find("li").size() <= 0 ) {
                    document.title  = topmenuTitle;
                } else {
                    if ( mainList != "" && mainList != "clear" && mainList != null && mainList != undefined ) {
                        var submenuTitle = $(".SubMenu").find('li[mainlist='+mainList+']')
                        if ( submenuTitle.size() == 1 ) {
                            document.title = submenuTitle.find('a').text();
                        } else {
                            if ( mainView != "" && mainView != "clear" && mainView != null && mainView != undefined ) {
                                submenuTitle = $(".SubMenu").find('li[mainview='+mainView+']');
                                if ( submenuTitle.size() == 1 ) {
                                    document.title = submenuTitle.find('a').text();
                                } else {
                                	document.title  = topmenuTitle;
                                	console.log("대메뉴에 셋팅된 하위 메뉴 정보가 존재하지 않습니다.");
                                }
                            }
                        }
                    }
                }

//                if ( mainList != "" && mainList != "clear" && mainList != null && mainList != undefined ) {
//                    var submenuTitle = $(".SubMenu").find('li[mainlist='+mainList+']')
//                    if ( submenuTitle.size() > 0 ) {
//                        document.title = submenuTitle.find('a').text();
//                    } else {
//                        if ( mainView != "" && mainView != "clear" && mainView != null && mainView != undefined ) {
//                            submenuTitle = $(".SubMenu").find('li[mainview='+mainView+']');
//                            if ( submenuTitle.size() > 0 ) {
//                                document.title = submenuTitle.find('a').text();
//                            }
//                        } else {
//                            document.title = topmenuTitle;
//                        }
//                    }
//                }
                // 2014.03.24 dmjung end   :: 대메뉴 클릭시에도 지정한 구조체 타이틀 변경될 수 있도록 처리

                //30232030 khma menuid 속성 추가 end
                if (_o.attr('Url') != undefined && _o.attr('Url') != "") {
                    //$.pageMove(_o.attr('Url'));
                } else if ((_o.attr('LeftTop') != undefined && _o.attr('LeftTop') != "" && _o.attr('LeftTop') != "clear")
                            || (_o.attr('LeftList') != undefined && _o.attr('LeftList') != "" && _o.attr('LeftList') != "clear")
                            || (_o.attr('LeftView') != undefined && _o.attr('LeftView') != "" && _o.attr('LeftView') != "clear")
                            || (_o.attr('LeftBottom') != undefined && _o.attr('LeftBottom') != "" && _o.attr('LeftBottom') != "clear")
                            || (_o.attr('MainList') != undefined && _o.attr('MainList') != "" && _o.attr('MainList') != "clear")
                            || (_o.attr('MainView') != undefined && _o.attr('MainView') != "" && _o.attr('MainView') != "clear")
                            || (_o.attr('BottomView') != undefined && _o.attr('BottomView') != "" && _o.attr('BottomView') != "clear")
                            || (_o.attr('TopList') != undefined && _o.attr('TopList') != "" && _o.attr('TopList') != "clear")
                            || (_o.attr('TopFlow') != undefined && _o.attr('TopFlow') != "" && _o.attr('TopFlow') != "clear")) {

                    $("#TbName").html(_o.find("span").html());
                    $('#body').addClass(_o.attr('bodyclass'));

                    $("#LeftMainList").superContaner('SetPageContaner', _o.attr('LeftList'));
                    $("#LeftMainView").superContaner('SetPageContaner', _o.attr('LeftView'));
                    $("#LeftBottomView").superContaner('SetPageContaner', _o.attr('LeftBottom'));

                    $("#MainList").superContaner('SetPageContaner', _o.attr('MainList'));
                    $("#MainView").superContaner('SetPageContaner', _o.attr('MainView'));
                    $("#BottomView").superContaner('SetPageContaner', _o.attr('BottomView'));
                    // flow형식이 맨 마지막에 동작해야함.
                    $("#LeftTopList").superContaner('SetPageContaner', _o.attr('LeftTop'));
                    $("#TopList").superContaner('SetPageContaner', _o.attr('TopList'));
                    $("#Flowtop").superContaner('SetPageContaner', _o.attr('TopFlow'));
                    $("#TbName").html(_o.text());

                    setRatio('.left', _o.attr('LeftWidth'));
                }
            }
            );

            $(document).on("click", ".SubMenu li", function (e) {
            	e.stopImmediatePropagation();
                var _o = $(this);
                if (limitBtnClick(_o) == false) return; //중복클릭 방지 처리
                $('.loader').remove();
                _o.parents('#TopMenu').find('.on').removeClass('on');
                _o.children('a').addClass('on');
                $("#TbName").html($(this).find("a").html());
                document.title = $(this).find("a").html();
                $('.SubMenu li').removeAttr('selected');
                _o.attr('selected', 'selected');
                //30232030 khma menuid 속성 추가 start
                var menuid = _o.attr("menuid");
                $('.Title').attr('menuid', menuid);
                setPrevActGbn(menuid, "", '메뉴이동');
                //30232030 khma menuid 속성 추가 end
                if (_o.attr('Url') != undefined) {
                    //alert(_o.attr('Url'));
                    //$.pageMove(_o.attr('Url'));
                } else {
                    $('#body').addClass(_o.attr('bodyclass'));

                    $("#LeftMainList").superContaner('SetPageContaner', _o.attr('LeftList'));
                    $("#LeftMainView").superContaner('SetPageContaner', _o.attr('LeftView'));
                    $("#LeftBottomView").superContaner('SetPageContaner', _o.attr('LeftBottom'));

                    $("#MainList").superContaner('SetPageContaner', _o.attr('MainList'));
                    $("#MainView").superContaner('SetPageContaner', _o.attr('MainView'));
                    $("#BottomView").superContaner('SetPageContaner', _o.attr('BottomView'));
                    // flow형식이 맨 마지막에 동작해야함.
                    $("#LeftTopList").superContaner('SetPageContaner', _o.attr('LeftTop'));
                    $("#TopList").superContaner('SetPageContaner', _o.attr('TopList'));
                    $("#Flowtop").superContaner('SetPageContaner', _o.attr('TopFlow'));
                    $("#TbName").html(_o.text());

                    setRatio('.left', _o.attr('LeftWidth'));

                }
            });

            $(document).on("click", ".SubMenu #Subtab", function (e) {
                $(".SubMenu").animate({
                    width: ['toggle', 'swing'],
                    height: ['toggle', 'swing'],
                    opacity: 'toggle'
                }, 300, 'linear', function () {
                });

                $(".SubMenu").removeClass("Fold").addClass("Fold");
                $(".Holder").removeClass("FoldHolder").addClass("FoldHolder").removeClass("Holder");
                $(".Title").removeClass("FoldTitle").addClass("FoldTitle").removeClass("Title");
                $(".Wraper").removeClass("FoldWraper").addClass("FoldWraper").removeClass("Wraper");
                $(".Content").removeClass("FoldContent").addClass("FoldContent").removeClass("Content");
                $(".Box").removeClass("FoldBox").addClass("FoldBox").removeClass("Box");

            });

            $(document).on("click", ".unpin-menu", function (e) {
                var _this = $(this);
                var height = 0;
                var timer = setInterval(function () {
                    height++;
                    _this.css("top", 44 - height);
                    if (height == 10) {
                        clearTimeout(timer);
                        _this.removeClass("unpin-menu").addClass("pin-menu");

                        $(".SubMenu").show();
                        $(".SubMenu").removeClass("Fold");
                        $(".FoldHolder").addClass("Holder").removeClass("FoldHolder");
                        $(".FoldTitle").addClass("Title").removeClass("FoldTitle");
                        $(".FoldWraper").addClass("Wraper").removeClass("FoldWraper");
                        $(".FoldContent").addClass("Content").removeClass("FoldContent");
                        $(".FoldBox").addClass("Box").removeClass("FoldBox");
                    }
                }, 10);
            });

            $(document).on("click", ".pin-menu", function (e) {
                var _this = $(this);
                var height = 0;
                var timer = setInterval(function () {
                    height++;
                    _this.css("top", 35 + height);
                    if (height == 9) {
                        clearTimeout(timer);
                        _this.removeClass("pin-menu").addClass("unpin-menu");

                        var _boxHeight = $(".FoldBox").height() - 50;
                        $(".SubMenu").show().css("background-color", "#65768A").css("height", _boxHeight);
                        $(".Holder").addClass("FoldHolder").removeClass("Holder");
                        $(".Title").addClass("FoldTitle").removeClass("Title");
                        $(".Wraper").addClass("FoldWraper").removeClass("Wraper");
                        $(".Content").addClass("FoldContent").removeClass("Content");
                        $("#Flowtop").addClass("FoldFlowtop").removeClass("Flowtop");
                    }
                }, 10);
            });

            $(document).on("click", ".FoldHolder", function (e) {
                // SubMenu가 자리차지 하지 않을때 본문 Click시 자동 접힘
                $(".SubMenu").animate({
                    width: ['hide', 'swing'],
                    height: ['hide', 'swing'],
                    opacity: 'hide'
                }, 300, 'linear', function () {
                });

                $(".SubMenu").removeClass("Fold").addClass("Fold");
                $(".Holder").removeClass("FoldHolder").addClass("FoldHolder").removeClass("Holder");
                $(".Title").removeClass("FoldTitle").addClass("FoldTitle").removeClass("Title");
                $(".Wraper").removeClass("FoldWraper").addClass("FoldWraper").removeClass("Wraper");
                $(".Content").removeClass("FoldContent").addClass("FoldContent").removeClass("Content");
                $(".Box").removeClass("FoldBox").addClass("FoldBox").removeClass("Box");
            });




            $.SvcCallPl("MON_COMMON", "MENU_TOPLIST", undefined, function(data) {
                
                $('#TopMenu ul').remove();


                // 옵션값이 TOP 으로 들어왔다 치면.
                if ( _M.UserInfo.menupos == '20' ) {
                    $('#TopMenu').parents('.Mon').addClass('layoutTop');
                }
                

                var _ul = $('<ul></ul>').appendTo('#TopMenu');
                $.each(data.resultData, function(index, row) {
                    // 이쪽에서 href 속성을 줘야함..
                    _li = $('<li></li>').appendTo(_ul);
                    _li.attr('menuID', row["MENU_MGMT_NO"]);

                    //추가
                    _li.attr('bodyclass', row["FORM_STYLE"]);
                    _li.attr('TopFlow', row["TOP_FLOW_OBJ"]);

                    // 2014.03.03 dmjung :: TopMenu 에도 leftwidth 속성이 필요함.
                    _li.attr('Leftwidth', row["LEFT_DIV_WIDTH"]);
                    _li.attr('LeftTop', row["LEFT_TOP_OBJ"]);
                    _li.attr('LeftList', row["LEFT_LIST_OBJ"]);
                    _li.attr('LeftView', row["LEFT_VIEW_OBJ"]);
                    _li.attr('LeftBottom', row["LEFT_BOTTOM_OBJ"]);
                    _li.attr('TopList', row["TOP_OBJ"]);
                    _li.attr('MainList', row["LIST_OBJ"]);
                    _li.attr('MainView', row["VIEW_OBJ"]);
                    _li.attr('BottomView', row["BOTTOM_OBJ"]);

                    _li.attr('Etc', row["ETC_OBJ"]);
                    _li.attr('Url', row["DIRECT_URL"]);
                    //추가끝

                    /* 2024.02.15 삭제 : GNB 변경
                    $('<a class='+row["MENU_ICON"]+'></a>').appendTo(_li).addClass('icon i-25');
                    */
                    _a = $('<span class="TopMenu-ft"></span>').appendTo(_li);
                    _a.text($.decHTML(row["MENU_NAME"]));
                    $('<div class="SubMenu"></div>').appendTo(_li); // 2024.02.15 추가 : GNB 변경

                    // 옵션값에 아이콘이 없으면
                    //$('#TopMenu').find('a').hide();
                });
                
                // 2014.02.28 dmjung :: Top 고정일 경우, menuResize 이벤트를 정의하고 메뉴가 많아서 두 줄 이상으로 떨어질 경우에 대한 처리를 해당 이벤트에서 처리함
                if ( $('.Mon').hasClass('layoutTop') ) {
                    $('#TopMenu').trigger($.Event('menuResize'));
                    $('#TopMenu').unbind('menuResize').bind('menuResize', function() {
                        if ( $('.Mon').hasClass('layoutTop') ) {
                            $('.SubMenu').hide();
                            topHeight = $('#TopMenu').height();
                    
                            if (topHeight > 60) {
                                $('div.Holder').css('margin-top', topHeight + 14);
                            } else {
                                $('div.Holder').css('margin-top', topHeight + 14);
                            }
                        } else {
                            $('.SubMenu').show();
                        }
                    });
                    
                    
                };

                $('#TopMenu').trigger('menuResize');
                
            }, _M.aSync.async);

        },

        cacheSubMenu: function(option) {
        	var SubMenuarr = new Array();
            var pl = new JSONClientParameters();
            //pl.add("상위메뉴번호", option);
            $.SvcCallPl("MON_COMMON", "MENU_SUBLIST", pl, function(data) {
                $.each(data.resultData, function(index, row) {
                	SubMenuarr.push({ "Style": row['MENU_ICON'], "bodyclass": row['FORM_STYLE'], "TopFlow": row['TOP_FLOW_OBJ'], "LeftTop": row['LEFT_TOP_OBJ'], "LeftList": row['LEFT_LIST_OBJ'], "LeftView": row['LEFT_VIEW_OBJ'], "LeftBottom": row['LEFT_BOTTOM_OBJ'], "TopList": row['TOP_OBJ'], "MainList": row['LIST_OBJ'], "MainView": row['VIEW_OBJ'], "BottomView": row['BOTTOM_OBJ'], "Etc": row['ETC_OBJ'], "Url": row['DIRECT_URL'], "menuID": row['MENU_MGMT_NO'], "TopmenuID": row['UPPER_MENU_NO'], "menuNAME": $.decHTML(row['MENU_NAME']), "LeftWidth": row['LEFT_DIV_WIDTH'] });
                });
                eval("_M.SubMenu = SubMenuarr");
            }, _M.aSync.async);
        },
        
        setSubMenu: function(option) {
            var cnt = 0;
            var cntSave = 0;
            $("#TopMenu ul li").each(function(index) {
                if ($(this).attr("menuid") != option) {
                    cnt++;
                } else {
                    cntSave = cnt;
                }
            });
            var subCnt = 0;
            $('.SubMenu ul').remove();
            var _ul = $('<ul class="SubMenu-bg"></ul>').appendTo('.SubMenu');
            if (_M.SubMenu.length == 0) {
                $('.SubMenu').find("ul").remove();
            }
            $.each(_M.SubMenu, function(index, row) {
            	if(row["TopmenuID"] == option){
	                _li = $('<li></li>').appendTo(_ul);
	                _li.addClass(row["Style"]);
	                _li.attr('bodyclass', row["bodyclass"]);
	
	                _li.attr('TopFlow', row["TopFlow"]);
	
	                _li.attr('LeftTop', row["LeftTop"]);
	                _li.attr('LeftList', row["LeftList"]);
	                _li.attr('LeftView', row["LeftView"]);
	                _li.attr('LeftBottom', row["LeftBottom"]);
	                _li.attr('LeftWidth', row["LeftWidth"]);
	                _li.attr('TopList', row["TopList"]);
	                _li.attr('MainList', row["MainList"]);
	                _li.attr('MainView', row["MainView"]);
	                _li.attr('BottomView', row["BottomView"]);
	
	                _li.attr('Etc', row["Etc"]);
	                _li.attr('Url', row["Url"]);
	                _li.attr('menuID', row["menuID"]);
	                //_li.css("display", "table");
	                _a = $('<a class="SubMenu-ft" href="#m_'+row["menuID"]+'"></a>').appendTo(_li);
	                _a.text(row["menuNAME"]);
	                subCnt++;
	            }
            });

            if ($(".Mon").hasClass("layoutTop")) {
                var topMenu = $('#TopMenu');
                var subMenu = $('.SubMenu');
                var limitRange = $(window).width();
                var leftValue = topMenu.find('li.menu-on-b').offset();
                var rightValue = leftValue.left + topMenu.find('li.menu-on-b').width() - subMenu.width() + 16; // 16은 sub, top menu 에 먹은 좌, 우 보더 2px 값의 합산임.
                var compareValue = leftValue.left + subMenu.width();
                var topValue = leftValue.top + topMenu.find('li.menu-on-b').height() + 13;
                
                
                
                // 2014.02.27 dmjung :: 서브메뉴 포지션 수평 및 수직 이동 계산
                if ( limitRange > compareValue ) {
                    $('.SubMenu').css('left', leftValue.left).css('top', topValue).unbind('mouseleave').bind('mouseleave', function() {
                        $(this).hide();
                    });
                } else {
                    $('.SubMenu').css('left', rightValue).css('top', topValue).unbind('mouseleave').bind('mouseleave', function() {
                        $(this).hide();
                    });
                }
            } else {                
                // 2014.03.11 dmjung :: menu 좌측, 상단 레이아웃 옵션 추가가 되면서, 초기화 해야 할 요소 초기화.
                // jquery.kdb.superContaner.js 에 94번 줄 ( logout 클릭 이벤트 ) 에서 초기화 처리와 함께 처리 되어야 함.
                $('.SubMenu').unbind('mouseleave').unbind('click').removeAttr('style');
                // ::end::


                /* 2024.02.15 삭제 : GNB 변경
                if (62 + (52 * cnt) < 5 + (52 * cntSave) + (subCnt * 26.66)) {
                	if((52 * cnt) < (subCnt * 26.66)){
                		$(".SubMenu ul").css("margin-top", 0 + (62 * cntSave)); // CSS JDM
                	}else{
                        // 2018.09.02 dmjung :: 왼쪽 메뉴에서 마우스 오버될 때 나오는 서브메뉴가 해당 할당 영역의 길이를 초과할 경우, bottom 정렬 시키는 부분. 35 -> 26
                		$(".SubMenu ul").css("margin-top", 0 + (62 * (cnt)) - subCnt * 26 + 26); 
                	}
                } else {
                    $(".SubMenu ul").css("margin-top", 0 + (62 * cntSave)); // CSS JDM
                }
                */
            }

        },

        setStartMenu: function(option) {

            var pl = new JSONClientParameters();
            pl.add("M_USER_NO", _M.UserInfo.id);
            $.SvcCallPl("MON_COMMON", "START_MENU_INFO", pl, function(data) {
                if(data.resultData.length > 0){
                    setPrevActGbn(data.resultData[0].MENU_MGMT_NO, undefined, '메뉴이동');
                    $("#LeftMainList").superContaner('SetPageContaner', data.resultData[0].LEFT_LIST_OBJ);
                    $("#LeftMainView").superContaner('SetPageContaner', data.resultData[0].LEFT_VIEW_OBJ);
                    $("#LeftBottomView").superContaner('SetPageContaner', data.resultData[0].LEFT_BOTTOM_OBJ);

                    $("#MainList").superContaner('SetPageContaner', data.resultData[0].LIST_OBJ);
                    $("#MainView").superContaner('SetPageContaner', data.resultData[0].VIEW_OBJ);
                    $("#BottomView").superContaner('SetPageContaner', data.resultData[0].BOTTOM_OBJ);
                    // flow형식이 맨 마지막에 동작해야함.
                    $("#LeftTopList").superContaner('SetPageContaner', data.resultData[0].LEFT_TOP_OBJ);
                    $("#TopList").superContaner('SetPageContaner', data.resultData[0].TOP_OBJ);
                    $("#Flowtop").superContaner('SetPageContaner', data.resultData[0].TOP_FLOW_OBJ);
                    
                    setRatio($('.left'),data.resultData[0].LEFT_DIV_WIDTH);
                    
                    $("#TbName").html(data.resultData[0].MENU_NAME);
                    document.title = data.resultData[0].MENU_NAME;
					//20171020 khma 메뉴관리번호 속성추가
					$('.Title').attr('menuid',data.resultData[0].MENU_MGMT_NO);
					
					
                }else{
                    $('.left-navi-home').trigger("click");
                }
            }, _M.aSync.async);
        },

        setGoMenu: function(menu) {
            var pl = new JSONClientParameters();
            pl.add("MENU_MGMT_NO", menu);
            $.SvcCallPl("MON_COMMON", "GO_MENU_INFO", pl, function(data) {
                if(data.resultData.length > 0){                	
                	setPrevActGbn(data.resultData[0].MENU_MGMT_NO, undefined, '메뉴이동');
                    $("#LeftMainList").superContaner('SetPageContaner', data.resultData[0].LEFT_LIST_OBJ);
                    $("#LeftMainView").superContaner('SetPageContaner', data.resultData[0].LEFT_VIEW_OBJ);
                    $("#LeftBottomView").superContaner('SetPageContaner', data.resultData[0].LEFT_BOTTOM_OBJ);

                    $("#MainList").superContaner('SetPageContaner', data.resultData[0].LIST_OBJ);
                    $("#MainView").superContaner('SetPageContaner', data.resultData[0].VIEW_OBJ);
                    $("#BottomView").superContaner('SetPageContaner', data.resultData[0].BOTTOM_OBJ);
                    // flow형식이 맨 마지막에 동작해야함.
                    $("#LeftTopList").superContaner('SetPageContaner', data.resultData[0].LEFT_TOP_OBJ);
                    $("#TopList").superContaner('SetPageContaner', data.resultData[0].TOP_OBJ);
                    $("#Flowtop").superContaner('SetPageContaner', data.resultData[0].TOP_FLOW_OBJ);
                    
                    setRatio($('.left'),data.resultData[0].LEFT_DIV_WIDTH);
                    
                    $("#TbName").html(data.resultData[0].MENU_NAME);
                    document.title = data.resultData[0].MENU_NAME;
					//20171020 khma 메뉴관리번호 속성추가
					$('.Title').attr('menuid',data.resultData[0].MENU_MGMT_NO);
                }else{
                    alert("페이지 정보가 올바르지 않습니다.");
                }
            }, _M.aSync.async);
        },
        
        setGoFlowStep: function(_o) { //플로우메뉴 이동시 사용

            if (limitBtnClick(_o) == false) return; //중복클릭 방지 처리
            $('li', _o.parent()).removeClass("on");
            _o.addClass("on");
            setPrevActGbn(undefined, _o.attr("stepmenu"), undefined); //로그기록용

            if (_o.attr('LeftTop') != undefined) $("#LeftTopList").superContaner('SetPageContaner', _o.attr('LeftTop'));
            if (_o.attr('LeftList') != undefined) $("#LeftMainList").superContaner('SetPageContaner', _o.attr('LeftList'));
            if (_o.attr('LeftView') != undefined) $("#LeftMainView").superContaner('SetPageContaner', _o.attr('LeftView'));
            if (_o.attr('LeftBottom') != undefined) $("#LeftBottomView").superContaner('SetPageContaner', _o.attr('LeftBottom'));

            if (_o.attr('MainTop') != undefined) $("#TopList").superContaner('SetPageContaner', _o.attr('MainTop'));
            if (_o.attr('MainList') != undefined) $("#MainList").superContaner('SetPageContaner', _o.attr('MainList'));
            if (_o.attr('MainView') != undefined) $("#MainView").superContaner('SetPageContaner', _o.attr('MainView'));
            if (_o.attr('MainBottom') != undefined) $("#BottomView").superContaner('SetPageContaner', _o.attr('MainBottom'));

            setRatio('.left', _o.attr('LeftWidth'));
        },
        
        StepMenus: function(option, callBack) {
            _Obj = $(this);
            _pmenu = $("<div class='progress'></div>").appendTo(_Obj);
            $("<strong class='tit'>" + option[0].title + "</strong>").appendTo(_pmenu);
            _ul = $("<ul></ul>").appendTo(_pmenu);
            var i = 0;
            $.each(option, function(index, value) {
                if (i++ > 0) {
                    var _li = $("<li></li>").appendTo(_ul);
                    if (location.pathname == value.href) _li.addClass("on");
                    _li.attr("step", value.step);
                    var _a = $("<a>" + value.title + "</a>").appendTo(_li);
                    if (value.href != undefined) { _a.attr('href', value.href); };
                    if (value.className != undefined) { _a.addClass(value.className); };
                    _li.click(function(e) {
                        $('li', $(this).parent()).removeClass("on");
                        $(this).addClass("on");
                        if (callBack != undefined) {
                            callBack($(this));
                        }
                    });
                };

            });

        }

    }


    $.fn[pluginName] = function (arg, contents) {
        var args, instance;

        if (!(this.data(dataPlugin) instanceof Plugin)) {
            this.data(dataPlugin, new Plugin(this));
        }

        instance = this.data(dataPlugin);
        //instance.element = this;
		//팝업으로 인해서 추가함 khma 20240530
        if(instance != null){
        	instance.element = this;

			if (typeof arg === 'undefined' || typeof arg === 'object') {
				if (typeof instance['초기실행'] === 'function') {
					//초기 실행
				}
			} else if (typeof arg === 'string' && typeof instance[arg] === 'function') {
				args = Array.prototype.slice.call(arguments, 1);
				return instance[arg].apply(instance, args);
			} else {
				$.error('Method ' + arg + ' does not exist on jQuery.' + pluginName);
			}
		}
    };

} (jQuery, window, document));