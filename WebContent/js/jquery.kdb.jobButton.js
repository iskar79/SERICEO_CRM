// 2013.09.27 dmjung :: jobMake 플러그인 화 작업중...

(function ($) {
    $.fn.extend({
        makeButtons: function (jobsArea, bottom) {
            _Obj = $(this);
            var option = $(this).data("jsonData");
            // 2013.10.01 dmjung :: 최초 로드시 readonly 상태인지 아닌지 파악한다.
            //if (option.isEditMode != true) {
            //    _Obj.attr('viewstatus', 'view');
            //} else {
            //    _Obj.attr('viewstatus', 'edit');
            //}
            if (bottom == undefined) {
                $.each(option.jobs, function (index, value) {
                    if (value == undefined) return;
                    if (option.Security != undefined) {
                        switch (value.inComm) {
                            case "New":
                                if (!option.Security.Permissions.C) return;
                                break;
                            case "Save":
                                if (!option.Security.Permissions.U) return;
                                break;
                            case "Delete":
                                if (!option.Security.Permissions.D) return;
                                break;
                            case "CopyNew":
                                if (!option.Security.Permissions.C) return;
                                break;
                            case "List":
                                if (!option.Security.Permissions.R) return;
                                break;
                            case "tableNew":
                                if (!option.Security.Permissions.C) return;
                                break;
                            case "tableDelete":
                                if (!option.Security.Permissions.D) return;
                                break;
                        }
                    }
                    if (value.inComm == 'getJson' && _M.UserInfo.dvl < 1) return true; //시스템개발자인 경우에만 개발버튼 보이도록
                    if (value.inComm == 'DownXls' && _M.UserInfo.xlauth < 1) return true; //엑셀출력관리자인 경우에만 개발버튼 보이도록
                    
                    if ($('.cmdspan:last .cmdicon', jobsArea).hasClass('btn-block') && value.css == 'btn-block') return;
                    var _butSet = $(jobsArea).find('.buttonset');
                    var _cmdspan = $("<span class='cmdspan cmdspan-bg align-middle b-t b-r b-b b-l b-co b-co-basic'></span>").appendTo(_butSet);
                    var _cmdwrap = $("<div class='cmdspanwrap'></div>").appendTo(_cmdspan);
                    if (value.inComm != undefined && value.inComm == 'Share' && _cmdwrap.parents('.ShowPopUpViewJson').size() == 0) {
                        _cmdwrap.attr('id', 'Share').draggable({
                            helper: 'clone',
                            start: function (e, u) {
                                if (true != $('#window-chatting-userlist').is(":visible")) {
                                    $('#window-chatting-userlist').css('display', 'block');
                                    $('#window-chatting-search-matched').css('display', 'none');
                                    $('#searchbar').val('');
                                }
                                u.helper.context.data = {
                                    type: 'jsonView',
                                    uid: _M.UserInfo.id,
                                    depart: _M.UserInfo.departnm,
                                    uname: _M.UserInfo.name,
                                    targetUserNo: undefined,
                                    jsonName: $(this).parents('#MainView').attr('jsonname'),
                                    searchKey: $(this).parents('#MainView').attr('keyvalue')
                                }
                                $(u.helper).css('z-index', 9999);
                                $(this).parents('.jobArea').css('overflow', 'visible');
                                $(this).parents('.Wraper').css('overflow', 'visible');
                                if ($('.icon-chat-white-active').size() == 0) {
                                    $('.icon-chat-white').trigger('click');
                                };
                                $('#window-chatting-body').css('display', 'none').css('display', 'block');
                            },
                            stop: function () {
                                $(this).parents('.jobArea').css('overflow', 'hidden');
                                $(this).parents('.Wraper').css('overflow', 'hidden');
                            }
                        });
                    }
                    // 2013.01.01 dmjung :: JDM btn-block 대체 요소 자동 추가, CSS로 각 테마에서 컨트롤 가능케하는 목적
                    $("<span class='cmdspan-block align-middle' number='" + index + "'></span>").appendTo(_butSet);
                    // 2024.02.26 아이콘 삭제 $("<span class='cmdicon icon i-20 '></span>").appendTo(_cmdwrap).addClass(value.css).attr("index", value.index);
                    $("<input type='button' class='cmdbtn cmdspan-ft' />").appendTo(_cmdwrap)
                    .attr("value", value.name)
                    .attr("index", value.index)
                    .attr("inComm", value.inComm != undefined ? value.inComm : "")
                    .attr("display", value.display != undefined ? value.display : null);

                });
            } else {
                $.each(option.jobsBottom, function (index, value) {
                    if (value == undefined) return;
                    if (option.Security != undefined) {
                        switch (value.inComm) {
                            case "New":
                                if (!option.Security.Permissions.C) return;
                                break;
                            case "Save":
                                if (!option.Security.Permissions.U) return;
                                break;
                            case "Delete":
                                if (!option.Security.Permissions.D) return;
                                break;
                            case "CopyNew":
                                if (!option.Security.Permissions.C) return;
                                break;
                            case "List":
                                if (!option.Security.Permissions.R) return;
                                break;
                            case "tableNew":
                                if (!option.Security.Permissions.C) return;
                                break;
                            case "tableDelete":
                                if (!option.Security.Permissions.D) return;
                                break;
                        }
                    }
                    if ($('.cmdspan:last .cmdicon', jobsArea).hasClass('btn-block') && value.css == 'btn-block') return;
                    var _butSet = $(jobsArea).find('.buttonset');
                    var _cmdspan = $("<span class='cmdspan cmdspan-bg b-t b-r b-b b-l b-co b-co-basic'></span>").appendTo(_butSet);
                    var _cmdwrap = $("<div class='cmdspanwrap'></div>").appendTo(_cmdspan);
                    if (value.inComm != undefined && value.inComm == 'Share' && _cmdwrap.parents('.ShowPopUpViewJson').size() == 0) {
                        _cmdwrap.attr('id', 'Share').draggable({
                            helper: 'clone',
                            start: function (e, u) {
                                u.helper.context.data = {
                                    type: 'jsonView',
                                    uid: _M.UserInfo.id,
                                    depart: _M.UserInfo.departnm,
                                    uname: _M.UserInfo.name,
                                    targetUserNo: undefined,
                                    jsonName: $(this).parents('#MainView').attr('jsonname'),
                                    searchKey: $(this).parents('#MainView').attr('keyvalue')
                                }
                                $(u.helper).css('z-index', 9999);
                                $(this).parents('.jobArea').css('overflow', 'visible');
                                $(this).parents('.Wraper').css('overflow', 'visible');
                                if ($('.icon-chat-white-active').size() == 0) {
                                    $('.icon-chat-white').trigger('click');
                                };
                                $('#window-chatting-body').css('display', 'none').css('display', 'block');
                            },
                            stop: function () {
                                $(this).parents('.jobArea').css('overflow', 'hidden');
                                $(this).parents('.Wraper').css('overflow', 'hidden');
                            }
                        });
                    }
                    // 2024.02.27 버튼 아이콘 삭제 $("<span class='cmdicon icon i-20 '></span>").appendTo(_cmdwrap).addClass(value.css).attr("index", value.index);
                    $("<input type='button' class='cmdbtn cmdspan-ft' />").appendTo(_cmdwrap)
                            .attr("value", value.name)
                            .attr("index", value.index)
                            .attr("inComm", value.inComm != undefined ? value.inComm : "")
                            .attr("display", value.display != undefined ? value.display : null);
                });
            }

            $('.cmdspan').mouseover(function () {
                $(this).css('border', '1px solid transparent').css('border-bottom', '1px solid #acacac').css('border-right', '1px solid #acacac');
            });
            $('.cmdspan').mousedown(function () {
                $(this).css('border', '1px solid transparent').css('border-top', '1px solid #acacac').css('border-left', '1px solid #acacac');
            });
            $('.cmdspan').mouseup(function () {
                $(this).css('border', '1px solid transparent').css('border-bottom', '1px solid #acacac').css('border-right', '1px solid #acacac');
            });
            $('.cmdspan').mouseleave(function () {
                // 2013.01.01 dmjung :: PTS 테마에서는 마우스 떠날 때 기존 border 값이 유지되어야 하므로 조건문 추가 
                var cssName = $('#CSSlink').attr('href');
                if (cssName == '/css/Theme_Thebuttons.css') {
                    $(this).css('border', '1px solid #B0B0B0');
                } else {
                    $(this).css('border', '1px solid transparent');
                }
            });

        },

        displayButtons: function (Obj) {

		var parent;
            var status = Obj.attr('viewstatus');

			if (status == undefined || Obj.parent('.kcontextMenu').length > 0  || Obj.parent('.ShowPopUpViewJson').length > 0) { // superView가 팝업일때도 버튼을 모두 표시
				return false;
			} else {
				hideAll(Obj);
			}
			
            var mainObj = Obj.parents('.Wraper');
            var leftObj = Obj.parents('.left');


            if (mainObj.size() > 0) {
                parent = mainObj;
            } else {
                parent = leftObj;
            }
            $('.cmdspan', parent).each(function (index, button) {
                var display = $(button).find('input').attr('display');
                if (display != undefined || display != null) {
                    // 2013.10.02 dmjung :: Status 식별자를 갖고 있는 버튼을 Sorting out.
                    if (status != undefined || status != null) {
                        if (display.indexOf(status) > -1) showTargetButton(button);
                    } else {
                        showTargetButton(button);
                    }
                } else {
                    showTargetButton(button);
                }
            });

            function showTargetButton(button) {
                // 2013.10.02 dmjung :: Status 식별자와 동일한 display 속성을 가진 버튼만 취득해서 show 처리.
                $(button).show();
                $(button).next().show();
            }

            function hideAll(Obj) {
                // 2013.10.02 dmjung :: 버튼 초기화 처리.
                //var option = $(Obj).data('jsonData');
               
				//20140915 khma :: 제대로 된 cmdspan영역을 취득하지 못하고 있으므로 대응처리
				$('.cmdspan', Obj).hide();
				$('.cmdspan-block', Obj).hide();

			 /* var mainObj = Obj.parents('.Wrapper');
                var leftObj = Obj.parents('.left');

                if (mainObj.size() > 0) {
                    $('.cmdspan', mainObj).hide();
                    $('.cmdspan-block', mainObj).hide();
                } else {
                    $('.cmdspan', leftObj).hide();
                    $('.cmdspan-block', leftObj).hide();
                }*/


                //if (option.mainViewID) {
                //    $(option.mainViewID).find('.cmdspan').hide();
                //    $(option.mainViewID).find('.cmdspan-block').hide();
                //}
            }
        },
        
        setButtonState: function(args, optionalArgs) {
        	// args 는, 			버튼 객체와 처리하고 싶은 옵션을 담은 plainObject.
        	// optionalArgs 는,	처리하고 싶은 옵션. 이 때는 args 가 jquery object 이거나, selector 정보이다.
        	
        	/* args 의 plainObject 구조        	
        	  	args = {
        	  		settings : [
				        { target : "btn1", changeTo : "hide" },
				        { target : "btn2", changeTo : "open" },
				        .
				        .
				        .
				        .
				        { target : "btn9", changeTo : "disabled" }
				    ]
        	  	}
        	  	
        	  	// target 에는 버튼의 DOM id 혹은 class 등과 같이 셀렉터 정보를 입력한다.
        	  	// changeTo 에는 해당 버튼을 제어하고 싶은 옵션을 지정한다.
        	 */
        	        	        	
        	/* args, optionalArgs 파라메터가 들어올 경우
        	 	args 에는  버튼의 DOM id 혹은 class 등과 같이 셀렉터 정보를 입력한다.
        	 	optionalArgs 에는 해당 버튼을 제어하고 싶은 옵션을 지정한다.
        	 */        	
        	var errorMsg = '버튼 처리 정보가 없습니다.';
        	
        	function processButtons(button, action) {
        		switch (action) {
	        		case 'show' :
	        				button.show().css('opacity', 1);
	        			break;
	        		case 'hide' :
	        				button.hide();
	        			break;
	        		case 'able' :
	        				button.show().css('opacity', 1);
	        			break;
	        		case 'disable' :
	        				button.show().css('opacity', .4);
	        			break;
	        		default:
	        				alert('버튼 처리는 show, hide, able, disable 처리만 가능합니다.');
	        			break;
        		}
        	}
    		
        	if ( undefined != optionalArgs ) {
        		var object;
        		args instanceof jQuery ? object = args : object = $(args);
        		
        		if ( object.size() == 0 ) {
        			alert('지정하신 셀렉터 : ' + args + " 이(가) 잘못되었습니다.")
        		} else {
        			processButtons(object, optionalArgs);
        		}
        		
    			return false;
        	}
        	
        	if ( undefined == args ) alert(errorMsg);        	 
        	else {
        		var Keyname = undefined;
        		for (key in args) {
        			Keyname = key;
        		}
        		
        		if (undefined == args[key]) alert(errorMsg);
        		else {
        			var object;
        			args[key] instanceof jQuery ? object = args[key] : object = $(args[key]);
        			
        			jQuery.each(object, function(index, option) {
        				var byId = $("#"+option.target).size();
        				var byClass = $("."+option.target).size();
        				var byDefined = $(option.target).size();
        				if ( byId == 0 && byClass == 0 && byDefined == 0 ) alert('지정하신 셀렉터 : ' + option.target + " 이(가) 잘못되었습니다.");
        				else {
        					if ( byDefined == 0 ) {        						
        						if ( byId == 0 ) {
        							processButtons($("."+option.target), option.changeTo);
        						} else {
        							processButtons($("#"+option.target), option.changeTo);
        						}
        					} else {
        						var prohibitingTag = $(["HTML","BODY","HEAD","TITLE","SCRIPT","META","LINK"]);
        						var validationFlag = false;
        						
        						jQuery.each(prohibitingTag, function(index, data) {
        							if ( data == $(option.target)[0].tagName ) {
    									validationFlag = true;
        							}
        						});
        						
        						if ( validationFlag == false ) {
        							processButtons($(option.target), option.changeTo);
        						} else {
    								if ( byId == 0 ) {
    									processButtons($("."+option.target), option.changeTo);
    								} else {
    									processButtons($("#"+option.target), option.changeTo);
    								}
        						}
        					}
        				}
        			})
        		}
        	}
        }        
        
    });
})(jQuery);