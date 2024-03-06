/*
* version 1.0 2013-11-29
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: DongMin Jung
* Company : Kongyoung DBM
*/

; (function ($, window, document, undefined) {

    var pluginName = "chat",
        dataPlugin = "plugin_" + pluginName,
        settings = {
            target: this,
            width: 350,
            height: 150,
            theme: '#ffffff'
        };    

    var uniqueID = 0;
    var currentNotificationWindow = undefined;
    var currentChattingWindow = undefined;
    

    var fetchedData;

    


    // 타이틀 일괄 적용하기 위한 변수
    var notiTitle = '공지사항';
    var chatTitle = '채팅';
    var chatAlert = '새 메시지가 도착했습니다.';
    var defaultUnread = '&#133;';



    // ICON HTML
    var noticon                     = "<span class='extrabtn icon i-20 icon-notification-white align-middle'></span>"; // align-middle
    var chaticon                    = "<span class='extrabtn icon i-20 icon-chat-white align-middle'></span>";    // align-middle
    var shareicon                   = "<span class='extrabtn icon i-20 icon-share align-middle'></span>";
    var okicon                      = "<div class='confirm confirm-approval' style='cursor:pointer; display:inline-block; vertical-align:middle; padding:0px 10px;'><span class='icon i-20 icon-approval align-middle'></span><span class='align-middle' style='margin-right:5px;'>네</span></div>"; // align-middle
    var noicon                      = "<div class='confirm confirm-cancel' style='cursor:pointer; display:inline-block; vertical-align:middle; padding:0px 10px;'><span class='icon i-20 icon-cancel align-middle'></span><span class='align-middle' style='margin-right:5px;'>아니오</span></div>"; // align-middle
    var notiunread                  = "<span class='notification-unread align-middle' style='width:20px; height:20px; display:inline-block; line-height:20px; font-weight:bold; text-align:center;'>"+defaultUnread+"</span>"; // align-middle style='width:20px; height:20px; display:inline-block; line-height:20px; font-weight:bold; text-align:center;'
    var chatiunread                 = "<span class='chat-unread align-middle' style='width:20px; height:20px; display:inline-block; line-height:20px; font-weight:bold; text-align:center;'>"+defaultUnread+"</span>"; // align-middle style='width:20px; height:20px; display:inline-block; line-height:20px; font-weight:bold; text-align:center;'
    var xicon                       = "<span class='extrabtn icon i-20 icon-x align-middle'></span>"; // align-middle
    var plusicon                    = "<span class='icon i-20 extrabtn icon-xx align-middle' style='margin-left:22px;'></span>";


    var privateMethod = function () {
        console.log("private method");
    };



    var Plugin = function (element) {
        this.options = $.extend({}, settings);
    };



    Plugin.prototype = {


        /*=======================================================================================================================================
        ::Basic UI ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/
        
        // 기본적인 알람 영역 및 클릭 이벤트용 아이콘 두 개에 대한 HTML 제너레이트
        makeBasicUI: function () {
            //TODO :: 클래스 속성을 제외한 지저분한 스타일 및 속성들은 별도 CSS에서 관리하게 될 것임. 임시 하드 코딩.
            var BasicUI = $("<div class='chat-basic centering_right' style='width:auto; text-align:left;'></div>");
            var Notification = $("<div class='region-notification' style='display:inline-block; width:50px;'></div>");
            var Chat = $("<div class='region-chat' style='display:inline-block; width:50px;'></div>");

            // Noticon 누르면 창 띄움. 데이터 바인딩은 어떻게??
            $(noticon).appendTo(Notification).toggle(function(){                
                if (limitBtnClick($(this), 1) == false) return;
                $(this).addClass('icon-notification-white-active');
                Plugin.prototype.placeNotificationWindow();
                setTimeout(function() {$('.nicescroll-rails').css('display', 'block');}, 1000 * 0.6);
                if ( $('.chat-basic').find('.icon-notification-white-active').size () > 0 ) {
                    $('.chat-basic').find('.icon-chat-white-active').trigger('click');                    
                    $('.nicescroll-rails').css('z-index', 9);
                }
            }, function() {
                $('.chat-basic').find('.icon-notification-white-active').removeClass('icon-notification-white-active');
                $('.window-notification').animate({'height': 0}, 1000 * 0.4);
                $('.nicescroll-rails').css('display', 'none');
                if ( $('.chat-basic').find('.icon-notification-white-active').size () > 0 ) {
                    $('.chat-basic').find('.icon-chat-white-active').trigger('click');
                    $('.nicescroll-rails').css('z-index', 9);
                }
            });
            $(notiunread).appendTo(Notification);

            // Chaticon 누르면 창 띄움. 데이터 바인딩은 어떻게??
            $(chaticon).appendTo(Chat).toggle(function(){
                if (limitBtnClick($(this), 1) == false) return;
                $(this).addClass('icon-chat-white-active');
                Plugin.prototype.placeChattingWindow();
                setTimeout(function() {$('.nicescroll-rails').css('display', 'block');}, 1000 * 0.6);
                if ( $('.chat-basic').find('.icon-chat-white-active').size () > 0 ) {
                    $('.chat-basic').find('.icon-notification-white-active').trigger('click');
                    $('.nicescroll-rails').css('z-index', 9);
                }
            }, function() {
                $('.chat-basic').find('.icon-chat-white-active').removeClass('icon-chat-white-active');
                $('.window-chatting').animate({'height': 0}, 1000 * 0.4);
                $('.nicescroll-rails').css('display', 'none');
                if ( $('.chat-basic').find('.icon-chat-white-active').size () > 0 ) {
                    $('.chat-basic').find('.icon-notification-white-active').trigger('click');
                    $('.nicescroll-rails').css('z-index', 9);
                }
            });
            $(chatiunread).appendTo(Chat);

            Notification.appendTo(BasicUI);
            Chat.appendTo(BasicUI);

            return BasicUI;
        },


        // 기본 알람 영역에 숫자값을 업데이트 해 줄 함수
        setBasicUIContents: function(data) {
            $('.notification-unread').text('123');
            $('.chat-unread').text('123');
        },


        // BasicUI 요소를 셀렉터 기준 우측 정렬로 포지셔닝
        placeBasicUI: function () {
            var BasicUI = this.makeBasicUI();
            var Target = this;
            BasicUI.appendTo(Target.element);
        },

        /*=======================================================================================================================================
        ::Basic UI ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/



















        /*=======================================================================================================================================
        ::Notification Popup:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/

        // 공지사항 팝업 HTML 제너레이트
        makeNotificationPopup: function () {
            var NotificationPopup = $("<div class='popup-notification'></div>")
            .css('width', settings.width)
            .css('height', 0)
            .css('text-align', 'center')
            .css('background-color', settings.theme).css('color', 'black');

            var NotificationPopupHeader = $("<div class='popup-notification-top align-middle'></div>")
            .css('height', settings.height / 2)
            .css('line-height', settings.height / 2 + 'px')
            .appendTo(NotificationPopup);

            var NotificationPopupBody = $("<div id='popup-notification-body'></div>")
            .css('padding', '0px 20px 0px 20px')
            .appendTo(NotificationPopup);
            
            //var NotificationPopupFooter = $("<div class='popup-notification-footer'>see more</div>")
            //.css('height', settings.height / 4)
            //.css('line-height', settings.height / 4 + 'px')
            //.css('padding', '0px 20px 0px 20px')
            //.css('text-align', 'right')
            //.appendTo(NotificationPopup);

            $(noticon).removeClass('icon-notification-white').addClass('icon-notification').appendTo(NotificationPopupHeader);

            return NotificationPopup;
        },
        
        // 새로운 공지 팝업 컨텐츠를 업데이트 해 줄 함수
        setNotificationPopupContents: function(msg) {
            var NotificationPopup = this.makeNotificationPopup();
            NotificationPopup.find('#popup-notification-body').text(msg);
            this.placeNotificationPopup(NotificationPopup);

        },
        
        // 공지사항 팝업 요소를 화면 우측 하단에 포지셔닝
        placeNotificationPopup: function (NotificationPopup) {
            NotificationPopup.css('z-index', 9).css('position', 'fixed').css('bottom', 33).css('right', 1)
            .css('box-shadow', '-4px 0px 11px rgba(175, 175, 175, 0.5)').css('border-radius', '10px 10px')
            .appendTo(document.body);

            NotificationPopup.animate({'height': settings.height}, 1000 * 0.4);

            setTimeout(function() { NotificationPopup.animate({'height': 0}, 1000 * 0.4); }, 1000 * 3);
            setTimeout(function() { NotificationPopup.remove() }, 1000 * 3.5);
        },

        /*=======================================================================================================================================
        ::Notification Popup:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/


















        /*=======================================================================================================================================
        ::Notification Window::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/
        
        // 공지사항 리스트를 뿌려줄 공지사항 창 HTML 제너레이트
        makeNotificationWindow: function () {
            if ( undefined == currentNotificationWindow ) {
                var NotificationWindow = $("<div class='window-notification' style='text-align:left;'></div>")
                .css('width', settings.width)
                .css('height', 300)
                .css('background-color', settings.theme).css('color', 'black');

                var NotificationWindowHeader = $("<div class='window-notification-header align-middle'></div>")
                .css('height', 40)
                .css('line-height', 40 + 'px')
                .appendTo(NotificationWindow);

                var NotificationWindowHeaderWraper = $("<div class='window-wraper'></div>")
                .css('margin', '0px 10px 0px 10px')
                .appendTo(NotificationWindowHeader);
            
                $(noticon).removeClass('icon-notification-white').addClass('icon-notification')
                .css('line-height', '20px')
                .appendTo(NotificationWindowHeaderWraper);

                $("<span class='window-title inline-block align-middle'>"+notiTitle+"</span>")
                .css('padding-left', '6px')
                .css('line-height', '20px')
                .appendTo(NotificationWindowHeaderWraper);
            
                $("<span class='window-icon inline-block align-middle'>"+xicon+"</span>")
                .css('width', '250px')
                .css('height', '20px')
                .css('text-align', 'right')
                .css('line-height', 20 + 'px')
                .appendTo(NotificationWindowHeaderWraper)
                .click(function() {
                    $('.chat-basic').find('.icon-notification-white-active').removeClass('icon-notification-white-active');
                    $('.icon-notification-white').trigger('click');
                });

                var NotificationWindowSeperator = $("<div class='window-seperator'></div>")
                .css('margin', '0px 10px 10px 10px')
                .css('border-bottom', '1px solid #eaeaea')
                .appendTo(NotificationWindow);

                var NotificationWindowBody = $("<div id='window-notification-body' style='padding:0px 20px;'></div>")
                .css('padding', '0px 10px 0px 10px')
                .css('height', '240px')
                .css('overflow', 'hidden')
                .appendTo(NotificationWindow);

                currentNotificationWindow = NotificationWindow.css('display', 'none').appendTo(document.body);
                return NotificationWindow;
            } else {
                return currentNotificationWindow;
            }
        },
        
        // 공지 팝업 컨텐츠들을 unread 우선 순위로 업데이트 해 줄 함수
        setNotificationWindowContents: function(data) {
            var NotificationWindow = this.makeNotificationWindow();
            var NotificationWindowBody = NotificationWindow.find('#window-notification-body');

            $(data).each(function(index, dataset) {
                var NotificationWindowRows = $("<div class='rowrow'></div>").appendTo(NotificationWindowBody);  
                $("<span id='Notification-status' eq='"+index+"' class='coloring icon i-20 align-middle'></span>").appendTo(NotificationWindowRows);
                if (dataset.M_USITE_NO == 1) {
                    $("#Notification-status[eq='"+index+"']").addClass("coloring-green");
                } else {
                    $("#Notification-status[eq='"+index+"']").addClass("coloring-gray");
                }
                $("<span id='Notification-article0"+index+"'' class='desc icon align-middle'></span>").css('width', '270px')
                .css('height', '30px')
                .css('margin-left', '8px')
                .css('line-height', '30px')
                .css('overflow', 'hidden')
                .css('text-overflow', 'ellipsis')
                .css('white-space', 'nowrap')
                .text(dataset.USER_NAME)
                .appendTo(NotificationWindowRows)
            });
            currentNotificationWindow = NotificationWindow;
        },

        // 공지사항 리스트 요소를 화면 우측 하단에 포지셔닝
        placeNotificationWindow: function () {
            $(currentNotificationWindow).css('display', 'block')
            .css('z-index', 9).css('position', 'fixed').css('bottom', 33).css('right', 1)
            .css('box-shadow', '-4px 0px 11px rgba(175, 175, 175, 0.5)').css('border-radius', '10px 10px')
            .appendTo(document.body);
            
            $(currentNotificationWindow).animate({'height': 350}, 1000 * 0.4);
            $(currentNotificationWindow).find('#window-notification-body').niceScroll();
        },

        /*=======================================================================================================================================
        ::Notification Window::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/























        /*=======================================================================================================================================
        ::Chatting Popup:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/

        // 채팅 새 메시지 도착시 올라올 팝업 HTML 제너레이트
        makeChattingPopup: function() {

            var ChattingPopup = $("<div class='popup-chatting'></div>")
            .css('width', 250)
            .css('height', 0)
            .css('text-align', 'center')
            .css('background-color', settings.theme).css('color', 'black');

            var ChattingPopupHeader = $("<div class='popup-chatting-top align-middle'></div>")
            .css('height', 45)
            .css('line-height', 45 + 'px')
            .appendTo(ChattingPopup);

            var ChattingPopupBody = $("<div id='popup-chatting-body'></div>")
            .css('padding', '0px 20px 0px 20px')
            .appendTo(ChattingPopup);
            
            var ChattingPopupFooter = $("<div class='popup-chatting-footer'></div>")
            .css('height', 10)
            .css('line-height', 10 + 'px')
            .css('padding', '0px 20px 0px 20px')
            .css('text-align', 'right')
            .appendTo(ChattingPopup);
            
            $(chaticon).removeClass('icon-chat-white').addClass('icon-chat').appendTo(ChattingPopupHeader);

            return ChattingPopup;

        },

        // 새 메시지 도착시 올라올 팝업 메시지를 셋팅 해 줄 함수.
        setChattingPopupContents: function() {
            var ChattingPopup = this.makeChattingPopup();
            ChattingPopup.find('#popup-chatting-body').text(chatAlert);
            this.placeChattingPopup(ChattingPopup);
        },

        // 채팅 팝업 요소를 화면 우측 하단에 포지셔닝
        placeChattingPopup: function (ChattingPopup) {
            ChattingPopup.css('z-index', 9).css('position', 'fixed').css('bottom', 33).css('right', 1)
            .css('box-shadow', '-4px 0px 11px rgba(175, 175, 175, 0.5)').css('border-radius', '10px 10px')
            .appendTo(document.body);

            ChattingPopup.animate({'height': 80}, 1000 * 0.4);

            setTimeout(function() { ChattingPopup.animate({'height': 0}, 1000 * 0.4); }, 1000 * 3);
            setTimeout(function() { ChattingPopup.remove(); }, 1000 * 3.5);
        },
        
        /*=======================================================================================================================================
        ::Chatting Popup:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/





















        /*=======================================================================================================================================
        ::Chatting Window, the actual user list::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/
        
        // 유저리스트 및 read, unread 상태와 현재 활성화 채팅창 따위가 표현될 창 HTML 제너레이트
        makeChattingWindow: function() {
            if ( undefined == currentChattingWindow ) {
                var height = $(window).height();
                var top = $('#Top').height();
                var title = $('.Title').outerHeight();
                var bottom = $('#Footer').outerHeight();
                var sum = top + title + bottom + 20;

                var ChattingWindow = $("<div class='window-chatting' style='text-align:left;'></div>")
                .css('width', 300)
                .attr('data-mcm-height', height - sum)
                .css('background-color', settings.theme).css('color', 'black');

                var ChattingWindowHeader = $("<div class='window-chatting-header align-middle'></div>")
                .css('height', 40)
                .css('line-height', 40 + 'px')
                .appendTo(ChattingWindow);

                var ChattingWindowHeaderWraper = $("<div class='window-wraper'></div>")
                .css('margin', '0px 10px 0px 10px')
                .appendTo(ChattingWindowHeader);
            
                $(chaticon).removeClass('icon-chat-white').addClass('icon-chat')
                .css('line-height', '20px')
                .appendTo(ChattingWindowHeaderWraper);

                $("<span class='window-title inline-block align-middle'>"+chatTitle+"</span>")
                .css('padding-left', '6px')
                .css('line-height', '20px')
                .appendTo(ChattingWindowHeaderWraper);
            
                $("<span class='window-icon inline-block align-middle'>"+xicon+"</span>")
                .css('width', '225px')
                .css('height', '20px')
                .css('text-align', 'right')
                .css('line-height', 20 + 'px')
                .appendTo(ChattingWindowHeaderWraper)
                .click(function() {
                    $('.chat-basic').find('.icon-chat-white-active').removeClass('icon-chat-white-active');
                    $('.icon-chat-white').trigger('click');
                });

                var ChattingWindowSeperator = $("<div class='window-seperator'></div>")
                .css('margin', '0px 10px 10px 10px')
                .css('border-bottom', '1px solid #eaeaea')
                .appendTo(ChattingWindow);

                var ChattingWindowSearchBar = $("<div class='window-chatting-search' style='padding:0px 20px; margin-bottom:10px; '></div>").appendTo(ChattingWindow);
                var ChattingWindowSearchInput = $("<input id='searchbar' type='text' />").appendTo(ChattingWindowSearchBar)
                .keyup(function(e) {
                    //MongoDB 버전
                    var matched = $('#searchbar').val();
                    kdbSocketManager.ksock.emit('searchUser', matched);
                    
                    
                    
                    //SQL 버전
                    //var word = $(this).val();
                    //
                    //if ( word == '' ) {
                    //    $('#Footer').chat('setChattingUserList', 'empty');
                    //    return;
                    //};
                    //
                    //var pl = new JSONClientParameters();
                    //pl.add('service', 'MON_COMMON');
                    //pl.add('method', 'DEMO_USER_SEARCH');
                    //pl.add('USER_NAME', word);
                    //
                    //PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(_data) {
                    //    $('#Footer').chat('setChattingUserList', 'list', _data.resultData);
                    //}, function(response) {
                    //    $('#Footer').chat('setChattingUserList', 'notfound');
                    //}, _M.aSync.sync);
                });

                var ChattingWindowBody = $("<div id='window-chatting-body' style='padding:0px 20px;'></div>")
                .css('padding', '0px 10px 0px 10px')
                .css('height', 0)
                .css('overflow', 'hidden')
                .appendTo(ChattingWindow);

                var ChattingWindowUserList  = $("<ul id='window-chatting-userlist'></div>").appendTo(ChattingWindowBody);
                var ChattingWindowMyfrineds = $("<ul id='window-chatting-search-myfriends'></div>").appendTo(ChattingWindowBody);
                var ChattingWindowMatched = $("<ul id='window-chatting-search-matched'></div>").appendTo(ChattingWindowBody);

                currentChattingWindow = ChattingWindow.css('display', 'none').appendTo(document.body);

                return ChattingWindow;
            } else {
                return currentChattingWindow;
            }
        },
        
        // 유저리스트 창에 대한 변경값을 업데이트 해 줄 함수.
        setChattingWindowContents: function(type, data) {
            var ChattingWindow = this.makeChattingWindow();            
            var ChattingWindowBody = ChattingWindow.find('#window-chatting-body');
            var ChattingWindowList = ChattingWindow.find('#window-chatting-userlist');

            ChattingWindowList.empty();
            /*
                DEPT_NAME
                DEPT_NO
                EMAIL
                FRND_CODE
                FRND_NAME
                FRND_NO
                FRND_USITE_NO
                M_USER_NO
            */
            /*
                
            */

            $(data).each(function(index, dataset) {
                var ChattingWindowRows = $("<li class='Userlist Userlist-row'></li>").css('margin-bottom', '10px').css('width', '100%')
                .attr('DEPT_NAME', dataset.DEPT_NAME ? dataset.DEPT_NAME : "")
                .attr('DEPT_NO', dataset.DEPT_NO ? dataset.DEPT_NO : "")
                .attr('EMAIL', dataset.EMAIL ? dataset.EMAIL : "")
                .attr('FRND_CODE', dataset.FRND_CODE ? dataset.FRND_CODE : "")
                .attr('FRND_NAME', dataset.FRND_NAME ? dataset.FRND_NAME : "")
                .attr('id', dataset.FRND_NO ? dataset.FRND_NO : "")
                .attr('FRND_USITE_NO', dataset.FRND_USITE_NO ? dataset.FRND_USITE_NO : "")
                .attr('M_USER_NO', dataset.M_USER_NO ? dataset.M_USER_NO : "")
                .attr('indexing', index)
                .appendTo(ChattingWindowList).droppable({
				    over:function() {
					    $(this).css('background-color', '#FAFAFA');
				    },
				    out:function() {
					    $(this).css('background-color', '#FFFFFF');
				    },
				    drop:function(e, u) {
					    $(this).css('background-color', '#FFFFFF');
					    u.draggable.context.data.targetUserNo = $(this).attr('id');
                        kdbSocketManager.ksock.emit('sendShareBox', u.draggable.context.data);
				    }
			    }).hover(function() {
                    $(this).css('background-color', '#FAFAFA');
                }, function() {
                    $(this).css('background-color', '#FFFFFF');
                }).mousedown(function() {
                    var indexing = $(this).attr('indexing');
                    var targetUser = {
                        dept : $(this).attr('dept_name'),
                        name : $(this).attr('frnd_name'),
                        uid  : $(this).attr('id'),
                        email: $(this).attr('email')
                    };
                    $('#Footer').chat('placeChattingBox', targetUser);
                });

                var PictureBox = $("<span class='picture align-middle' title='"+dataset.EMAIL+"' style='width:50px; height:50px; display:inline-block; margin-right:6px;'></span>")
                .css('background-color', '#DBDBDB').appendTo(ChattingWindowRows);  
                $("<span id='chatting-status0"+index+"' class='coloring icon i-20 align-middle'></span>").appendTo(ChattingWindowRows);
                if (dataset.CONNECT_STATE == "1") {
                    $("#chatting-status0"+index+"").addClass("coloring-green");
                } else {
                    $("#chatting-status0"+index+"").addClass("coloring-gray");
                }
                $("<span id='chatting-dept0"+index+"'' class='desc icon align-middle' style='width:60px; height:30px; line-height:30px;'> "+dataset.DEPT_NAME+" </span>")
                .css('overflow', 'hidden')
                .css('text-overflow', 'ellipsis')
                .css('white-space', 'nowrap')
                .css('padding-left', '10px')
                .appendTo(ChattingWindowRows);

                $("<span id='chatting-name0"+index+"'' class='desc icon align-middle'></span>")
                .css('width', '100px')
                .css('height', '30px')
                .css('margin-left', '8px')
                .css('line-height', '30px')
                .css('overflow', 'hidden')
                .css('text-overflow', 'ellipsis')
                .css('white-space', 'nowrap')
                .text(dataset.FRND_NAME)
                .appendTo(ChattingWindowRows);
                $(chaticon).css('display', 'none').appendTo(ChattingWindowRows);
                //$("<span class='chatting-unread' style='width:20px; height:15px; text-align:center; line-height:15px; display:inline-block; background-color:#9C3C3C; color:White; font-weight:bold;'>11</span>")
                //.css('border-radius', '8px 8px').appendTo(ChattingWindowRows);
            });
            currentChattingWindow = ChattingWindow;
        },

        setChattingUserStatus: function(data) {
            var target = $('#'+data.M_USER_NO+'');
            if ( data.CONNECT_STATE == '0') {
                target.find('.coloring').removeClass('coloring-green').removeClass('coloring-gray').addClass('coloring-gray');
            } else {
                target.find('.coloring').removeClass('coloring-green').removeClass('coloring-gray').addClass('coloring-green');
            }
        },



        setChattingUserList: function(type, data) {
            var windowChatting = $('.window-chatting');
            var userList = windowChatting.find('#window-chatting-userlist');
            var searchList = windowChatting.find('#window-chatting-search-matched');
            var myFriends = windowChatting.find('#window-chatting-search-myfriends');

            if (type == 'list') {
                //유저리스트에 검색 결과 넣고, 기존 유저 리스트는 토글한다.
                userList.hide();                
                searchList.empty();
                $(data).each(function(index, dataset) {
                    var ChattingWindowRows = $("<li class='Userlist Userlist-row'></li>").css('margin-bottom', '10px').css('width', '100%')
                    .attr('DEPT_NAME', dataset.DEPT_NAME ? dataset.DEPT_NAME : "")
                    .attr('DEPT_NO', dataset.DEPT_NO ? dataset.DEPT_NO : "")
                    .attr('EMAIL', dataset.EMAIL ? dataset.EMAIL : "")
                    .attr('FRND_CODE', dataset.FRND_CODE ? dataset.FRND_CODE : "")
                    .attr('FRND_NAME', dataset.FRND_NAME ? dataset.FRND_NAME : "")
                    .attr('id', dataset.FRND_NO ? dataset.FRND_NO : "")
                    .attr('FRND_USITE_NO', dataset.FRND_USITE_NO ? dataset.FRND_USITE_NO : "")
                    .attr('M_USER_NO', dataset.M_USER_NO ? dataset.M_USER_NO : "")
                    .attr('indexing', index)
                    .appendTo(searchList)
                    .hover(function() {
                        

                    }, function() {

                    });
                    
                    var PictureBox = $("<span class='picture align-middle' title='"+dataset.EMAIL+"' style='width:50px; height:50px; display:inline-block; margin-right:6px;'></span>")
                    .css('background-color', '#DBDBDB').appendTo(ChattingWindowRows);

                    $("<span id='chatting-dept0"+index+"'' class='desc icon align-middle' style='width:60px; height:30px; line-height:30px;'> "+dataset.DEPT_NAME+" </span>")
                    .css('overflow', 'hidden')
                    .css('text-overflow', 'ellipsis')
                    .css('white-space', 'nowrap')
                    .css('padding-left', '10px')
                    .appendTo(ChattingWindowRows);

                    $("<span id='chatting-name0"+index+"'' class='desc icon align-middle'></span>")
                    .css('width', '100px')
                    .css('height', '30px')
                    .css('margin-left', '8px')
                    .css('line-height', '30px')
                    .css('overflow', 'hidden')
                    .css('text-overflow', 'ellipsis')
                    .css('white-space', 'nowrap')
                    .text(dataset.FRND_NAME ? dataset.FRND_NAME : '이름없음')
                    .appendTo(ChattingWindowRows);



                });

            } else if (type == 'empty') {
                //검색창이 empty 이므로, 기존 유저 리스트를 Show, 검색 리스트는 Hide
                userList.show();
                searchList.empty();
                //alert('검색어 깡통');
            } else if (type == 'notfound') {
                //검색 결과가 없으므로, 기존 유저 리스트는 여전히 Hide, 검색 리스트는 empty 로 리프레쉬.
                searchList.empty();
                //alert('검색결과없음');
            }
        },











        // 채팅 유저리스트 요소를 화면 우측 하단에 포지셔닝
        placeChattingWindow: function () {
            var height = currentChattingWindow.attr('data-mcm-height');
            currentChattingWindow.css('display', 'block')
            .css('z-index', 7).css('position', 'fixed').css('bottom', 38).css('right', 7)
            .css('box-shadow', '-4px 0px 11px rgba(175, 175, 175, 0.5)').css('border-radius', '10px 10px')
            .appendTo(document.body);
            currentChattingWindow.animate({'height': height}, 1000 * 0.4);
            currentChattingWindow.find('#window-chatting-body').animate({'height': height - 60}, 1000 * 0.4);
            // TODO :: droppable 엘레먼트 오프셋 갱신이 늦음...애니메이트 때문에...아래 고정값 주면 해결되지만 IE 에서 애니메이션 동작 이상하게 됨
            currentChattingWindow.css('height', height);
            currentChattingWindow.find('#window-chatting-body').niceScroll();
        },

        /*=======================================================================================================================================
        ::Chatting Window::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/



























        /*=======================================================================================================================================
        ::Chatting Box:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/
        // 소켓에서 msg 히스토리 던져주면
        // 클라이언트에서 채팅창 상태 확인 후 상태에 따라 3가지 동작 실행함.
        // 1. 활성화 = msg 히스토리 뿌림. 
        // 2. 최소화 = 채팅박스 head 깜빡거림 애니메이션.
        // 3. 비활성 = 메시지 도착 alert, 안 읽은 메시지에 count ++


        // 실제 대화 오고가는 것이 표현될 채팅창 HTML 제너레이트
        makeChattingBox: function(data) {
            var ChattingBox = $("<div class='box-chatting' style='text-align:left;'></div>")
            .attr('uid', data.uid ? data.uid : 'empty')
            .attr('email', data.email ? data.email : 'empty')
            .css('width', 300)
            .css('height', 300)
            .css('background-color', settings.theme).css('color', 'black')
            .data('targetData', data);

            var ChattingBoxHeader = $("<div class='box-chatting-header align-middle'></div>")
            .css('height', 40)
            .css('line-height', 40 + 'px')
            .appendTo(ChattingBox);

            var ChattingBoxHeaderWraper = $("<div class='box-wraper'></div>")
            .css('margin', '0px 10px 0px 10px')
            .appendTo(ChattingBoxHeader);
            
            $(chaticon).removeClass('icon-chat-white').addClass('icon-chat')
            .css('line-height', '20px')
            .appendTo(ChattingBoxHeaderWraper);

            $("<span id='chat-dept' class='window-title inline-block align-middle'>"+data.dept+"</span>")
            .css('width', '70px')
            .css('padding-left', '6px')
            .css('line-height', '20px')
            .appendTo(ChattingBoxHeaderWraper);

            $("<span id='chat-name' class='window-title inline-block align-middle'>"+data.name+"</span>")
            .css('width', '160px')
            .css('padding-left', '6px')
            .css('line-height', '20px')
            .appendTo(ChattingBoxHeaderWraper);
            
            $("<span class='window-icon inline-block align-middle'>"+xicon+"</span>")
            .css('width', '0px')
            .css('height', '20px')
            .css('text-align', 'right')
            .css('line-height', 20 + 'px')
            .appendTo(ChattingBoxHeaderWraper);

            ChattingBox.find('.icon-x').click(function() {
                $(this).parents('.box-chatting').remove();
            });

            var ChattingBoxSeperator = $("<div class='window-seperator'></div>")
            .css('margin', '0px 10px 10px 10px')
            .css('border-bottom', '1px solid #eaeaea')
            .appendTo(ChattingBox);

            var ChattingBoxBody = $("<div id='box-chatting-body' style='padding:0px 20px;'></div>")
            .css('padding', '0px 10px 0px 10px')
            .css('margin-top', '10px')
            .css('height', '180px')
            .css('overflow', 'hidden')
            .appendTo(ChattingBox);
            //.droppable({
			//	drop:function(e, u) {
			//		u.draggable.context.data.targetUserNo = $(this).attr('uid');
            //        kdbSocketManager.ksock.emit('sendShareBox', u.draggable.context.data);
            //    }
			//});

            $("<div class='window-seperator'></div>")
            .css('margin', '0px 10px 0px 10px')
            .css('border-bottom', '1px solid #eaeaea')
            .appendTo(ChattingBox);

            $("<textarea class='window-textarea'></textarea>")
            .css('width', '266px')
            .css('margin', '10px 10px 0px 10px')
            .css('border', '1px solid #eaeaea')
            .appendTo(ChattingBox)
            .keydown(function(e) {
                if ( e.keyCode == '13' ) {
                    console.log('소켓 함수 호출, 내 정보, 상대방 정보를 넘겨주어야 하며, uid 로 전달하는 방법 & 채팅방 id 로 메시지 전달하는 방식이 있음..');
                    var targetInfo = $('.box-chatting').data('targetData');
                    var data = {
                        myInfo : _M.UserInfo,
                        buddyInfo : targetInfo,
                        msg : $(this).val()
                    }
                    kdbSocketManager.ksock.emit('chatMessage', data);                    
                }
            });

            return ChattingBox;
        },

        // 실제 실시간 채팅에서 활용될 메시지 업데이트 함수.
        setChattingBoxContents: function(msg) {
            // 부서명,사용자명, 시간, 메시지 내용.
            var ChattingBoxDeptName = $('#chat-dept');
            var ChattingBoxUserName = $('#chat-name');
            var ChattingBoxBody = $('#box-chatting-body');
            var ChattingBoxBodyMessageWrap = $("<div class='box-chatting-body-messagewrap'></div>").appendTo(ChattingBoxBody).css('margin-bottom', '15px');
            var ChattingBoxBodyMessageInfo = $("<div class='box-chatting-body-messageinfo'></div>").appendTo(ChattingBoxBodyMessageWrap);
            $("<span id='messageinfo-department'>R&D</span><span id='messageinfo-username'>정동민</span><span id='arrivaltime'> 10:39pm</span>").appendTo(ChattingBoxBodyMessageInfo);            
            var ChattingBoxBodyMessage = $("<div class='box-chatting-body-message'>"+msg.msg+"</div>")
            .css('background-color', '#eaeaea')
            .css('padding', '8px')
            .css('border-radius', '8px 8px')
            .appendTo(ChattingBoxBodyMessageWrap);
        },

        // 채팅창을 빈 위치에 포지셔닝.
        // 유저리스트가 화면에 있는경우, left + 유저리스트 width
        // 유저리스트가 화면에 없는경우, 계산 필요없이 right 0
        // 유저리스트와 다른 채팅창이 화면에 있는 경우 right 0 포지션에서부터 width + 8 값 만큼 더해진 right x 에 위치한다.
        placeChattingBox: function(data) {
            var ChattingBox = this.makeChattingBox(data);
            ChattingBox.css('z-index', 9).css('position', 'fixed').css('bottom', 38).css('right', 345)
            .css('box-shadow', '-4px 0px 11px rgba(175, 175, 175, 0.5)').css('border-radius', '10px 10px')
            .appendTo(document.body);

            ChattingBox.find('#box-chatting-body').niceScroll();
        },

        /*=======================================================================================================================================
        ::Chatting Box:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/





























        /*=======================================================================================================================================
        :: View Popup::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        =======================================================================================================================================*/
        makeConfirmPopup: function() {
            var ConfirmPopup = $("<div class='popup-confirm'></div>")
            .css('width', settings.width)
            .css('height', 0)
            .css('text-align', 'center')
            .css('background-color', settings.theme).css('color', 'black');

            var ConfirmPopupHeader = $("<div class='popup-confirm-top align-middle'></div>")
            .css('height', 70)
            .css('line-height', 70 + 'px')
            .appendTo(ConfirmPopup);

            var ConfirmPopupBody = $("<div id='popup-confirm-body'></div>")
            .css('padding', '0px 20px 0px 20px')
            .css('height', 40)
            .appendTo(ConfirmPopup);
            
            var ConfirmPopupFooter = $("<div class='popup-confirm-footer'></div>")
            .css('height', settings.height / 4)
            .css('line-height', settings.height / 4 + 'px')
            .css('padding', '0px 20px 0px 20px')
            .css('text-align', 'center')
            .css('color', 'black')
            .appendTo(ConfirmPopup);
            
            $(shareicon).appendTo(ConfirmPopupHeader);
            $(okicon).appendTo(ConfirmPopupFooter).hide();
            $(noicon).appendTo(ConfirmPopupFooter).hide();


            ConfirmPopup.hover(function() {
                if (limitBtnClick($(this), 1) == false) return;
                $(this).animate({
                    color: '#fff'
                }, 1000 * 0.2);
                $(this).find('#popup-confirm-body').animate({height:0}, 1000 * 0.2);
                $(this).find('.popup-confirm-footer .confirm').show();
                $(this).find('.popup-confirm-footer .confirm-approval').bind('click', function() {
                    $('#Footer').chat('placeViewPopup');
                    $('.popup-confirm').animate({height:0}, 1000 * 0.4);
                    setTimeout(function() { $('.popup-confirm').remove() }, 1000 * 0.5);
                });
                $(this).find('.popup-confirm-footer .confirm-cancel').bind('click', function() {
                    kdbSocketManager.sendMessage(_M.UserInfo.name +  '님께서 화면을 확인하지 않았습니다.', $('#fromid').attr('fromid'));
                    $('.popup-confirm').animate({height:0}, 1000 * 0.4);
                    setTimeout(function() { $('.popup-confirm').remove() }, 1000 * 0.5);
                });
            }, function() {
                $(this).animate({
                    color: '#000'
                }, 1000 * 0.2);
                $(this).find('#popup-confirm-body').animate({height:40}, 1000 * 0.2);
                $(this).find('.popup-confirm-footer .confirm').hide();
                $(this).find('.popup-confirm-footer .confirm-approval').unbind('click');
                $(this).find('.popup-confirm-footer .confirm-cancel').unbind('click');
            });

            return ConfirmPopup;
        },

        setConfirmPopupContents: function(data) {
            var ConfirmPopup = this.makeConfirmPopup();
            ConfirmPopup.find('#popup-confirm-body').html("<span id='fromid' fromid='"+data.uid+"'>"+data.uname +"</span> 님께서 화면을 전송하셨습니다.<br/>확인하시겠습니까?");
            fetchedData = data; 
            this.placeConfirmPopup(ConfirmPopup);
        },
        
        placeConfirmPopup: function(ConfirmPopup) {
            ConfirmPopup.css('z-index', 9).css('position', 'fixed').css('bottom', 33).css('right', 1)
            .css('box-shadow', '-4px 0px 11px rgba(175, 175, 175, 0.5)').css('border-radius', '10px 10px')
            .appendTo(document.body);

            ConfirmPopup.animate({'height': settings.height}, 1000 * 0.4);

            //setTimeout(function() { ConfirmPopup.animate({'height': 0}, 1000 * 0.4); }, 1000 * 3);
            //setTimeout(function() { ConfirmPopup.remove() }, 1000 * 3.5);
                        
        },

        placeViewPopup: function () {
            $(document.body).find('.ShowPopUpViewJson').remove();
            $(document.body).append("<div class='ShowPopUpViewJson EditPopUp DivContext'></div>");
            $('<div id="ShowPopUpViewJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowPopUpViewJson'));
            var popObj = $("#ShowPopUpViewJson_ShowEdit").superContaner('superView', fetchedData.jsonName);
            //var popOptions = popObj.data("jsonData");
            var popupWidth = 800;
            //if (isNotEmpty(popOptions.bodyWidth)) popupWidth = popOptions.bodyWidth;
            $("#ShowPopUpViewJson_ShowEdit").superContaner('SetDefault');
            $("#ShowPopUpViewJson_ShowEdit").superContaner('Read', fetchedData.searchKey);

            $(document.body).find('.ShowPopUpViewJson').dialog({
                autoOpen: false,
                modal: true,
                width: popupWidth,
                title: "정보",
                buttons: {
                    //"저장": function () {
                    //    //callback($("#ShowPopUpViewJson_ShowEdit"), _Obj);
                    //    $(this).dialog("close");
                    //},
                    //"닫기": function () {
                    //    $(this).dialog("close");
                    //}
                },
                close: function (event, ui) {
                    $(document.body).find('.ShowPopUpViewJson').remove();
                }
            });
            $(document.body).find('.ShowPopUpViewJson').dialog("open");
            $(document.body).find('.ui-dialog').css('display', 'none')
            .css('border-radius', '8px 8px')
            .css('box-shadow', 'rgba(175, 175, 175, 0.498039) -4px 0px 11px');
            $(document.body).find('.ui-dialog').show('slide');
        }








    }

    $.fn[pluginName] = function (arg, contents) {
        var args, instance;

        if (!(this.data(dataPlugin) instanceof Plugin)) {
            this.data(dataPlugin, new Plugin(this));
        }

        instance = this.data(dataPlugin);
        instance.element = this;

        if (typeof arg === 'undefined' || typeof arg === 'object') {
            if (typeof instance['placeBasicUI'] === 'function') {
                instance.placeBasicUI();
                instance.setNotificationWindowContents();
                instance.setChattingWindowContents('userlist');
            }
        } else if (typeof arg === 'string' && typeof instance[arg] === 'function') {
            args = Array.prototype.slice.call(arguments, 1);
            return instance[arg].apply(instance, args); 
        } else {
            $.error('Method ' + arg + ' does not exist on jQuery.' + pluginName);
        }
    };

} (jQuery, window, document));