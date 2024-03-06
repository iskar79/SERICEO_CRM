/*
* version 1.0 2013-12-02
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DBM
*/

(function ($, undefined) {

    $.fn.superDiagram = function (option, currentObj, parentKeyValue) {
        var _Obj = currentObj;
        var _jsonName = option;
        if (typeof (_jsonName) == "string") {
            option = GETJSON(_jsonName);
            $(this).attr("jsonName", _jsonName);
        };
        if (option == undefined) { option = eval(_jsonName); };
        if (option == undefined) { option = viewOption; };

        if (option.theme == undefined) {
            _theme = "";
        } else {
            _theme = option.theme;
        }
        if (option.Security == undefined) {
            option.Security = { "Module": "계정관리", "Level": 1, "Permissions": { "C": true, "R": true, "U": true, "D": true, "M": true, "S": 1} };
        }

        if (option == undefined) return;

        $(this).data("jsonData", option);
        if ($('#Title').hasClass('FoldTitle')) {
            $(this).removeClass().addClass('SuperContaner SuperView SuperDiagram FoldFlowtop').addClass(_theme).attr('keyvalue', '');
        } else {
            $(this).removeClass().addClass('SuperContaner SuperView SuperDiagram Flowtop').addClass(_theme).attr('keyvalue', '');
            $(this).removeClass();
            $(this).addClass('SuperContaner SuperView SuperDiagram Flowtop');
        }

        /* ----------------------------------------------------------------------------- */
        // 외곽디자인 구성
        /* ----------------------------------------------------------------------------- */
        if (option.title != undefined) {
            var _title = $("<div class='title'></div>").appendTo(_Obj);
            _title.html(option.title.text);
            _title.attr('titleform',option.title.text);
            _title.addClass(option.title.Css);
        };

        // superview 생성시 상위객체의 초기값이 전달된 경우라면 이를 기록해 두었다가
        // 값 초기화시에 해당 전달된 값을 초기값으로 설정한다.
        $(this).attr("parentKeyValue", parentKeyValue);
        if (option.BeforeLoadCallBack != undefined) eval(option.BeforeLoadCallBack)(_Obj);

        /* ----------------------------------------------------------------------------- */
        // 구조체권한검색
        /* ----------------------------------------------------------------------------- */
        if (_Obj.superContaner('SecurityCheck')) {
            // option = _Obj.data("jsonData"); 
        } else { return; };

        if (option == undefined) return;

        // 레코드 영역의 크기
        if (option.bodyHeight > 0) _Obj.css('height', option.bodyHeight);
        if (option.bodyWidth > 0) _Obj.css('width', option.bodyWidth);

        /*-----------------
        *  Padding 적용
        ------------------*/
        if (option.isPadding != undefined) {
            _Obj.css("padding", option.isPadding);
        };

        /* ----------------------------------------------------------------------------- */
        // 작업버턴영역 생성 (상단)
        /* ----------------------------------------------------------------------------- */
        var _jobArea = $("<div class='jobArea'></div>").appendTo(_Obj);
        _Obj.makeButtons(_jobArea);

        /* ----------------------------------------------------------------------------- */
        // 그림영역
        /* ----------------------------------------------------------------------------- */
        var _Diagram = $("<div class='diagramArea'></div>").appendTo(_Obj);

        window.jsPlumbDemo = {
            init: function() {
                jsPlumb.importDefaults(jsPlumbOption);
            }
        };

        jsPlumb.bind("ready", function() {

            var resetRenderMode = function(desiredMode) {

                jsPlumbDemo.init();
            };
            resetRenderMode(jsPlumb.SVG);

        });

        if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
        drawCID = 0;

    };

    $.fn.drawNew = function () {
            var _Obj = $(this);
            jsPlumb.reset();
            _Obj.find(".w").remove();
    },

    $.fn.drawModelNew = function () {
        var _Obj = $(this);
        _Obj.drawShow(defaultDiagramOption);
    },

    $.fn.drawAddItem = function () {
        drawCID++;
        var _x = 100+drawCID*10;
        var _y = 100+drawCID*10;
        _Obj.drawItemAdd({ "id": $.GUID(), "title": "Node" + formCID++, "left": _x, "top": _y});
    },
    $.fn.drawItemAdd = function (option) {
        var _Obj = $(this);
        var _Area = _Obj.find('.diagramArea');
        var _item = $("<div class='w' id='" + option.id + "' ><a>" + option.title + "</a><div class='ep'></div></div>").appendTo(_Area).css('left', option.left).css('top', option.top);
        // var windows = $(".w");
        jsPlumb.draggable(_item);
        jsPlumb.makeSource(_item, {
            filter: ".ep", 			// only supported by jquery
            anchor: "Continuous",
            connector: ["StateMachine", { curviness: 20}],
            connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
            maxConnections: 5,
            onMaxConnections: function(info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        jsPlumb.makeTarget(_item, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous"
        });


        jsPlumb.bind("click", function(c) {
            jsPlumb.detach(c);
        });

        _item.find('a').click(function(e) {
            var _node = $(this);
            $.GetRename(function(r) {
                _node.html(r);
            });

        });
        _item.resizable({
        resize: function( event, ui ) {jsPlumb.repaintEverything();}
            
        });

    },

    $.fn.drawConnectAdd = function (option) {
        jsPlumb.connect(option);
    },

    $.fn.drawSave = function (option) {
        var _Obj = $(this);
        var _Area = _Obj.find('.diagramArea');
        var json = { "node": [], "link": [] };

        $.each(_Area.find(".w"), function(index, value) {
            var _o = { "id": $(value).attr('id'),
                "title": $(value).find('a').html(),
                "left": $(value).css('left'),
                "top": $(value).css('top')
            }
            json.node.push(_o);
                	

        });
        $.each(jsPlumb.getConnections(), function(index, value) {
            var _o = { "id": value.id,
                "sourceId": value.sourceId,
                "targetId": value.targetId
            }

            json.link.push(_o);
            // log(_o);

        });

        var _rlt = $.Json2Str(json);

        //$('#meta').text(_rlt);
        //$.SetKey("캠페인등록", _rlt);
        return _rlt;
    },

    $.fn.drawShow = function (option) {
        var _Obj = $(this);
        _Obj.drawNew();
            

        $.each(option.node, function(index, value) {
            _Obj.drawItemAdd(value);
        });

        $.each(option.link, function(index, value) {
            _Obj.drawConnectAdd({ "source": value.sourceId, "target": value.targetId });
        });

    };

})(jQuery);
