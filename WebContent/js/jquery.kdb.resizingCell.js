/*
* version 1.0 2013-11-29
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: DongMin Jung
* Company : Kongyoung DBM
*/
; (function ($) {
    $.fn.resizingCell = function (options) {
        return this.each(function () {
            var settings = $.extend({
                selector: options.selector ? options.selector : 'td',
                thick: options.thick ? options.thick : 9,
                color: options.color ? options.color : 'transparent'
            }, options);
            
            // 리사이즈 상태 설정 :: default = false;
            var resizingStatus = false;

            // 아이프레임, 바디영역 등 자바스크립트, 제이쿼리 오브젝트로 지정.
            var parentElement = {
                JavaScript      :   this,
                Jquery          :   $(this),
                Contents        :   $(this).contents().find('body'),
                Header          :   $(this).contents().find('head'),
                IframeOffset    :   $(this).offset(),
                BodyOffset      :   $(this).contents().find('body').offset(),
                Editor          :   $(tinymce.activeEditor.editorContainer)
            };
            
            //  핸들러 빈, 셀렉터에는 제이쿼리 오브젝트가 설정되며, id 에는 해당 요소의 id 속성을 설정한다.
            var attachedHandler = {
                eHandler : {
                    selector    :   undefined,
                    id          :   undefined
                },
                nHandler : {
                    selector    :   undefined,
                    id          :   undefined
                }
            };

            // 현재 엘레먼트
            // 마우스 다운 시점의 X,Y 좌표
            var selectedElement;
            var originalX, originalY;
            
            // 핸들러의 반비례하는 값으로, TD의 경계선 중앙에 위치시키는 계산을 위해 필요함.
            var leverage = settings.thick / 2;

            var methods = {
                // 고정 값을 적용한다, 한 번 고정 셋팅한 테이블은 다시는 돌지 않도록 하기 위하여 fixed 속성으로 필터링.
                // 이 때 tinymce의 경우 data-mce-style 속성 값을 취득하므로, 해당 속성 또한 업데이트 해주어야 함.
                fixedValue: function(selectedElement, tableElement) {                    
                    if ( $(tableElement).attr('fixed') != 'true' ) {
                        $(tableElement).find(settings.selector).each(function(index, td) {
                            var w,h;
                            if ( $.getInternetVersion() == "8" ) {
                                // 8일 때만.. 문제있음.. 나머지는 문제 해결 됨.
                                w = $(td).width();
                                h = $(td).height();
                            } else {
                                w = $(td).width();
                                h = $(td).height();
                            }
                            $(td).css('width', w).css('height', h);
                            $(td).attr('resize-width', w + 'px').attr('resize-height', h + 'px');
                            $(td).attr('data-mce-style', 'width:' + w + 'px; ' + 'height:' + h + 'px; ' + 'border: 1px solid black; border-top: 0; border-right: 0;');
                        });
                        $(tableElement).attr('fixed', 'true');
                        $(tableElement).css('width', $(tableElement).outerWidth()).attr('data-mce-style', 'width:' + $(tableElement).outerWidth() + 'px;').attr('width', $(tableElement).outerWidth());
                        $(tableElement).css('height', 'auto').attr('data-mce-style', 'height:auto').attr('height', 'auto');
                        parentElement.Contents.css('padding-bottom', '50px');
                    };
                },

                // 현재 선택된 TD 를 받아 핸들러 생성 함수를 호출한다. 함수의 기능이 상당히 줄었으므로, 삭제 고민 중.
                getContents: function(parentElement, selector) {
                    selectedElement = $(selector);
                    methods.attachHandler(selectedElement, selector.offsetParent);
                },

                // 핸들러 생성 및 생성 시점에서 마우스 이벤트 핸들러 붙힘.
                attachHandler: function(selectedElement, tableElement) {
                    if ( parentElement.Contents.find(attachedHandler.eHandler.id).length == 0 ) {
                        if ( attachedHandler.eHandler.selector != undefined || attachedHandler.nHandler.selector != undefined ) {
                            attachedHandler.eHandler.selector.remove();
                            attachedHandler.nHandler.selector.remove();
                        }
                        var eHandler = $('<div id="horizontalResize"></div>');
                        var nHandler = $('<div id="verticalResize"></div>');
                        var position = selectedElement.offset();
                        var dimension = { 
                            width : selectedElement.outerWidth(),
                            height : selectedElement.outerHeight()
                        };          
                        attachedHandler = {
                            eHandler : {
                                selector : eHandler,
                                id : '#'+eHandler.attr('id')
                            },
                            nHandler : {
                                selector : nHandler,
                                id : '#'+nHandler.attr('id')
                            }
                        };

                        if ( $.getInternetVersion() == "8" ) {
                            eHandler.attr('unselectable', 'on');
                            nHandler.attr('unselectable', 'on');
                        }

                        eHandler.appendTo(parentElement.Contents).css('position', 'absolute').css('top', position.top).css('left', position.left + dimension.width - leverage).css('height', dimension.height).css('width', settings.thick).css('cursor', 'e-resize').css('background-color', 'transparent')
                        .mousedown(function(e) {
                            if ( resizingStatus == false ) {
                                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                originalX = e.pageX;
                                methods.resizeStart(attachedHandler, $(this));
                            }
                        }).mouseup(function(e) {
                            methods.applyChanges();
                            methods.resizeEnd(selectedElement);
                        }).mouseenter(function(e) {
                            parentElement.Contents.attr('contentEditable', false).css('cursor', 'e-resize');
                        }).mouseout(function(e) {
                            parentElement.Contents.attr('contentEditable', true).css('cursor', 'auto');
                        });
                        nHandler.appendTo(parentElement.Contents).css('position', 'absolute').css('top', position.top + dimension.height - leverage).css('left', position.left).css('height', settings.thick).css('width', dimension.width).css('cursor', 's-resize').css('background-color', 'transparent')
                        .mousedown(function(e) {
                            if ( resizingStatus == false ) {
                                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                originalY = e.pageY;
                                methods.resizeStart(attachedHandler, $(this));
                            }
                        }).mouseup(function(e) {
                            methods.applyChanges();
                            methods.resizeEnd(selectedElement);
                        }).mouseenter(function(e) {
                            parentElement.Contents.attr('contentEditable', false).css('cursor', 's-resize');
                        }).mouseout(function(e) {
                            parentElement.Contents.attr('contentEditable', true).css('cursor', 'auto');
                        });
                    }
                },

                // selectedElement 의 좌표값으로 핸들러를 다시 포지셔닝 한다.
                positionHandler: function(selectedElement) {
                    if ( resizingStatus == false ) {
                        var position = selectedElement.offset();
                        var dimension = { 
                            width : selectedElement[0].clientWidth,
                            height : selectedElement[0].clientHeight
                        };
                        attachedHandler.eHandler.selector.css('top', position.top).css('left', position.left + dimension.width - leverage).css('height', dimension.height).css('width', settings.thick);
                        attachedHandler.nHandler.selector.css('top', position.top + dimension.height - leverage).css('left', position.left).css('height', settings.thick).css('width', dimension.width);
                    }
                },

                // 실시간 리사이즈 시작
				resizeStart: function(attachedHandler, currentHandler) {
					resizingStatus = true;
                
                    var table = $(selectedElement.context.offsetParent);
                    var parent = selectedElement.parent();
                    var child = parent.find(settings.selector);
                    var isRight = selectedElement.next()[0] ? true : false;                    
                    var targetIndexing = 0;
                    var nextIndexing = 0;
                    var rowIndexing = 0;
                    var resizeTarget = [];
                    var nextTarget = [];
                    var rowTarget = [];
                    var sorted;
                    var selected;
                    var nextSelected;

                    // 상하 조절 핸들러를 선택한 경우 rowspan 필터링
                    if ( currentHandler[0] == attachedHandler.nHandler.selector[0] ) {
                        var rowPos = selectedElement.offset();
                        var height = selectedElement.height();
                        var bottom = rowPos.top + height;
                        table.find('td').each(function(index, td) {
                            var rowPos2 = $(td).offset();
                            var height2 = $(td).height();
                            var bottom2 = rowPos2.top + height2;
                            if ( bottom2 == bottom || bottom2 + 5 > bottom && bottom2 - 5 < bottom ) {
                                rowTarget[rowIndexing] = td;
                                rowIndexing++;
                            }
                        });
                        $(rowTarget).each(function(index, td) {
                            var rowspan = $(td).attr('rowspan') ? parseInt($(td).attr('rowspan'), 10) : 1;
                            if ( rowspan == 1 ) {
                                sorted = td;
                                return false;
                            }
                        });
                    } else {

                        // 좌우 조절 핸들러를 선택한 경우 colspan 필터링
                        var colPos = selectedElement.offset();
                        var width = selectedElement[0].clientWidth;
                        var right = colPos.left + width;
                        table.find('td').each(function(index, td) {
                            var colPos2 = $(td).offset();
                            var width2 = td.clientWidth;
                            var right2 = colPos2.left + width2;
                            if ( right2 == right || right2 + 5 > right && right2 - 5 < right ) {
                                resizeTarget[targetIndexing] = td;
                                targetIndexing++;
                            }
                        });

                        // 우측 사이즈 조절할 TD 필터링
                        var colPos3 = selectedElement.offset();
                        var width3 = selectedElement[0].clientWidth;
                        var right3 = colPos3.left + width3;
                        table.find('td').each(function(index, td) {
                            var colPos4 = $(td).offset();
                            var width4 = td.clientWidth;
                            var right4 = colPos4.left + width4;
                            if ( colPos4.left >= right3 - 10 && colPos4.left <= right3 + 10 ) {
                                nextTarget[nextIndexing] = td;
                                nextIndexing++;
                            }
                        });
                    }

                    $(resizeTarget).each(function(index, td) {
                        var colspan = $(td).attr('colspan') ? true : false;
                        if ( colspan != true ) {
                            selected = $(td);
                            return false;
                        };
                    });

                    $(nextTarget).each(function(index, td) {
                        var colspan = $(td).attr('colspan') ? true : false;
                        if ( colspan != true ) {
                            nextSelected = $(td);
                            return false;
                        };
                    });

                    if ( selected == undefined ) {
                        selected = selectedElement;
                    }

					//핸들러 마우스 다운 상태로 에디터 Body 영역 위에서 마우스가 움직일 경우 실시간으로 실행됨. 실제적인 사이즈 계산은 이곳에서 이루어짐.
                    $(parentElement.Contents).mousemove(function(e) {
                        parentElement.Contents.attr('contentEditable', false).css('cursor', currentHandler.css('cursor'));
                        
                        var position;
                        var resized;
                        var width;
                        position = $(selected).offset();

                        if ( currentHandler[0] == attachedHandler.eHandler.selector[0] )
                        {
                            if ( e.pageX <= position.left + settings.thick || e.pageX >= position.left + selected.width() + (nextSelected ? nextSelected.width() : 100) - settings.thick)
                            {
                                console.log('resized limits');
                            } else {
                                width = selected.width();
                                resized = position.left + width - e.pageX;
                                attachedHandler.eHandler.selector.css('left', e.pageX - leverage);
                                attachedHandler.nHandler.selector.css('width',width - resized );
                                
                                $(resizeTarget).each(function(ind, td) {
                                    $(td).css('width', parseInt(td.style.width, 10) - parseInt(resized, 10));
                                });

                                if ( selected.next()[0] != undefined ) {
                                    $(nextTarget).each(function(ind, td) {
                                        $(td).css('width', parseInt(td.style.width, 10) + parseInt(resized, 10));
                                    });
                                } else {
                                    table.css('width', parseInt(table.outerWidth(), 10) - parseInt(resized, 10));
                                }
                            }
                        } else {
                            
                            position = $(sorted).offset();
                            resized = position.top + $(sorted).outerHeight() - e.pageY;
                            attachedHandler.nHandler.selector.css('top', e.pageY);
                            attachedHandler.eHandler.selector.css('height', $(sorted).outerHeight() - resized );
                            $(rowTarget).css('height', $(sorted).outerHeight() - resized );

                        }
                    });
                
					// 에디터 영역에서 마우스 업 할 때 종료 메소드 호출 ( 핸들러 영역에서 마우스 업 하면 핸들러에 붙힌 마우스 업 이벤트에서 종료 메소드를 호출함 )
                    parentElement.Contents.mouseup(function(e) {
                        methods.applyChanges();
                        methods.resizeEnd(selectedElement);
                    });
                
                    // 에디터 영역에서 마우스가 떠날 때 종료 메소드 호출.
                    parentElement.Contents.unbind('mouseleave').bind('mouseleave', function(e) {
                        methods.applyChanges();
                        methods.resizeEnd(selectedElement);
                    });
                    
                    // 에디터 영역과 에디터 툴바 영역에서 마우스가 떠날 때 종료 메소드 호출.
                    parentElement.Editor.unbind('mouseleave').bind('mouseleave', function(e) {
                        //$(selectedElement.context.offsetParent).attr('fixed', 'false');
                        //methods.fixedValue(selectedElement, $(selectedElement.context.offsetParent));
                        methods.applyChanges();
                        methods.resizeEnd(selectedElement);
                    });
				},

                // 리사이즈 종료, 모든 flag 값과 이벤트 핸들러를 제거 한다.
                resizeEnd: function(selectedElement) {
                    $(selectedElement.context.offsetParent).attr('fixed', 'false');
                    methods.fixedValue(selectedElement, $(selectedElement.context.offsetParent));
                    parentElement.Contents.attr('contentEditable', true).css('cursor', 'auto');                    
                    targetIndexing = 0;
                    nextIndexing = 0;
                    rowIndexing = 0;
                    isHandler = false;
                    resizingStatus = false;
                    selectedElement = undefined;
                    attachedHandler.eHandler.selector.unbind('mousedown');
                    attachedHandler.eHandler.selector.unbind('mouseup');
                    attachedHandler.eHandler.selector.unbind('mouseenter');
                    attachedHandler.eHandler.selector.unbind('mouseout');
                    attachedHandler.nHandler.selector.unbind('mousedown');
                    attachedHandler.nHandler.selector.unbind('mouseup');
                    attachedHandler.nHandler.selector.unbind('mouseenter');
                    attachedHandler.nHandler.selector.unbind('mouseout');
                    attachedHandler.eHandler.selector.remove();
                    attachedHandler.nHandler.selector.remove();
                    parentElement.Contents.unbind('mousemove');
                    parentElement.Contents.unbind('mouseup');
                },

                // 변경된 테이블 정보를 에디터에서 정상적으로 업데이트할 수 있도록 해당 함수를 호출하는 함수.
                applyChanges: function() {
                    attachedHandler.eHandler.selector.remove();
                    attachedHandler.nHandler.selector.remove();
                    parentElement.Jquery.parents('.fieldContaner').trigger('change');
                }
            } // methods 함수 선언부 종료
            
            // 테이블이 그려지고 TD 영역에 마우스 오버하면 첫 함수가 실행된다.
            parentElement.Contents.on("mouseover", settings.selector, function(e) {
                if ( e.target.localName == settings.selector || e.target.tagName.toLowerCase() == settings.selector ) {
                    if ( $(e.target.offsetParent).attr('fixed') != 'true' ) {
                        methods.fixedValue(selectedElement, e.target.offsetParent);
                    } else if ( parentElement.Contents.find(attachedHandler.eHandler.id).length == 0 ) {
                        methods.getContents(parentElement, e.target);
                    } else if ( resizingStatus != true ) {
                        selectedElement = $(e.target);
                        methods.positionHandler(selectedElement);
                    }
                }
            });
        });
    };
})(jQuery);