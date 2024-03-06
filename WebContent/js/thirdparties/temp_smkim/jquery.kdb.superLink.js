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

    $.fn.superLink = function (option, currentObj, parentObj) {
        var node;
        var link;
        var color;
        var force;
        var svg;

        var jnode = {};

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

        $(this).data("jsonData", option);
        $(this).removeClass().addClass('SuperContaner SuperTable SuperLink').addClass(_theme);
        // 호출한 상위객체정보를 저장한다.
        _Obj.attr("SContanerID", 'superContaner' + formCID++);

        if (parentObj != undefined) { _Obj.data("parentObj", parentObj) };
        if (option.BeforeLoadCallBack != undefined) eval(option.BeforeLoadCallBack)(_Obj);


        /* ----------------------------------------------------------------------------- */
        // 구조체권한검색
        /* ----------------------------------------------------------------------------- */
        if (_Obj.superContaner('SecurityCheck')) { option = _Obj.data("jsonData"); } else { return; };
        /*-----------------
        *  Padding 적용
        ------------------*/
        if (option.isPadding != undefined) {
            _Obj.css("padding", option.isPadding);
        };

        /* ----------------------------------------------------------------------------- */
        // 외곽디자인 구성
        /* ----------------------------------------------------------------------------- */
        if (option.title != undefined) {
            var _title = $("<div class='title'></div>").appendTo(_Obj);
            _title.html(option.title.text);
            _title.addClass(option.title.Css);
        };

        var _head = $("<div class='head'></div>").appendTo(_Obj);
        //var _head = $(".head", _Obj);
        var _table = $("<table class='SuperFilter'></table>").appendTo(_head);
        /* ----------------------------------------------------------------------------- */
        // 테이블 컬럼생성
        /* ----------------------------------------------------------------------------- */
        var _colgroup = $("<colgroup></colgroup>").appendTo(_table);
        $.each(option.filterView.colgroup, function (index, value) {
            if (value == undefined) return;
            $("<col width='" + value.LabelWidth + "' />").appendTo(_colgroup);
            $("<col width='" + value.DataWidth + "' />").appendTo(_colgroup);
        });
        _colCount = option.filterView.colgroup.length * 2;
        /* ----------------------------------------------------------------------------- */
        // 테이블 TR/TD테그 생성
        /* ----------------------------------------------------------------------------- */
        var _vGroup = "";
        $.each(option.filterView.tr, function (index, value) {
            if (value == undefined) return;
            var tr = $("<tr></tr>").appendTo(_table).attr('group', _vGroup);
            var tdCount = 0;
            // TD테그생성
            $.each(value.TD, function (index, value) {
                if (value == undefined) return;
                _colspan = value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
                tdCount += _colspan;
                switch (value.type) {
                    case 'group':
                        if (true) { // GROUP TD 생성
                            $("<td colspan='" + _colCount + "'>" + value.label + "<a></a>" + "</td>").appendTo(tr);
                            tr.addClass("viewGroup");
                            if (value.toggleDefault != undefined) tr.attr('toggleDefault', value.toggleDefault);
                            if (value.color != undefined) _td.css('background-color', value.color);
                            _vGroup = value.name;
                        }
                        break;
                    case 'note':
                        if (true) {  // Note TD 생성
                            _note = $("<td class='fldNote'>" + value.label + "</td>").appendTo(tr).attr('colspan', _colspan + 1);
                            if (value.color != undefined) _note.css('background-color', value.color);
                            if (value.css != undefined) _note.addClass(value.css);

                        }
                        break;
                    default:
                        if (true) {
                            // ----------------------------------------------------------------------------------
                            // 라벨표시용 TD생성 
                            // ----------------------------------------------------------------------------------
                            _tdlable = $("<td class='fldTdLabel'></td>").appendTo(tr).html(value.label).attr('title', value.label);
                            // ----------------------------------------------------------------------------------
                            // 필드표시용 TD생성
                            // ----------------------------------------------------------------------------------
                            _tdData = $("<td class='fldTdData field'></td>").appendTo(tr).attr('colspan', _colspan);
                            $.each(value.fieldContaner, function (index, value) {
                                _Obj.superContaner('fieldGen', _tdData, value);
                            });


                        }
                        break;
                }
            });
            //alert(tdCount);
            for (i = tdCount; i < _colCount; i++) {
                $("<td></td>").appendTo(tr)
            }

            tr.attr('group', _vGroup);
        });
        $(".viewGroup[toggleDefault='false']", _Obj).each(function (index, value) {
            _group = $(this).attr('group');
            $("tr[group='" + _group + "']", $(this).parent()).toggle();
            $(this).toggle();
        });
        /* ----------------------------------------------------------------------------- */
        // 작업버턴영역 생성
        /* ----------------------------------------------------------------------------- */
        var _jobArea = $("<div class='jobArea'></div>").appendTo(_head);
        _Obj.makeButtons(_jobArea);

        if (option.isFilterClear) {
            _Obj.superContaner('FilterClear'); //
        }


        /* ----------------------------------------------------------------------------- */
        // Body생성
        /* ----------------------------------------------------------------------------- */
        if (option.bodyWidth > 0) _Obj.css('width', option.bodyWidth);
        var _body = $("<div class='body'></div>").appendTo(_Obj);
        if (option.bodyHeight > 0) _body.css('height', option.bodyHeight);

        var _linkArea = $("<div class='linkArea'></div>").appendTo(_body).css('overflow', 'scroll');
        var _linkJob = $("<div class='linkArea'></div>").appendTo(_body);
        var _linkView = $("<div class='linkView'></div>").appendTo(_body);

        var _btn1 = $('<button>+</button>').appendTo(_linkJob);
        var _btn2 = $('<button>-</button>').appendTo(_linkJob);
        _btn1.click(function (e) {
            _linkArea.height(_linkArea.height() + 200);
        });
        _btn2.click(function (e) {
            _linkArea.height(_linkArea.height() - 200);
        });

        if (option.width != undefined) _linkArea.css('width', option.width);
        if (option.height != undefined) _linkArea.css('height', option.height);


        var width = 1000, height = 800;

        if (option.svgSize.width != undefined) width = option.svgSize.width;
        if (option.svgSize.height != undefined) height = option.svgSize.height;

        color = d3.scale.category20();

        force = d3.layout.force()
                .charge(-220)  // -120
                .linkDistance(130) //30
                .size([width, height]);

        svg = d3.select(".linkArea").append("svg").attr("width", width).attr("height", height);

        var pl = new JSONClientParameters();
        pl.add("service", option.service);
        pl.add("method", option.method.List);

        PostJsonData(_M.svcUrl.crudUrl, pl, function (data) {
            if (data.Table.Rows.length > 0) {
                var cdarr = new Array();
                var lnarr = new Array();
                $.each(data.Table.Rows, function (index, row) {
                    if (Search(cdarr, row['타입'], row['키']) == -1) {
                        cdarr.push({ "name": row['이름'], "group": 1, "key": row['키'], "type": row['타입'], "Viewjson": row['Viewjson'] });
                    }
                });
                eval("jnode.nodes = cdarr");
                $.each(data.Table.Rows, function (index, row) {
                    var source = Search(cdarr, row['상위타입'], row['상위키']);
                    var target = Search(cdarr, row['타입'], row['키']);
                    if (source > -1 && target > -1) {
                        lnarr.push({ "source": source, "target": target, "value": 2 });
                    }
                });
                eval("jnode.links = lnarr");

                ShowNode(jnode);


            }
            else {

            }
        }, function (response) {
            _Obj.superContaner("tableShowMessage", response);
        }, _M.aSync.sync);

        function Search(arr, type, key) {
            var nindex = -1
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].type == type && arr[i].key == key) {
                    nindex = i
                    break;
                }

            }
            return nindex;
        }

        function ShowNode(json) {

            force.nodes(json.nodes).links(json.links).start();
            link = svg.selectAll("line.link")
                    .data(json.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .on("click", function (d, i) {
                        //  alert(d.name + '/' + d.key + '/' + ' 라인 Hello world');
                    })
                    .style("stroke-width", function (d) { return Math.sqrt(d.value); });

            node = svg.selectAll("node")
                    .data(json.nodes)
                    .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", 10)
                    .style("fill", function (d) { return color(d.type); })
                    .on("click", function (d, i) {
                        // if (d.type != 1) {
                        _linkView.superContaner('SetPageContaner', d.Viewjson);
                        _linkView.toggle(true);
                        _linkView.superContaner('Read', d.key);
                        //}
                    })
                    .on("mouseover", function (d) {
                        d3.select(this).attr("r", 30);
                        //$.ShowBox({ "msg": d.name });
                        //$.ShowBox({ "msg": d.type + '/' + d.name + '/' + d.key });
                        //$("#mainView").superContaner('Read', d.key);
                    })
                    .on("mouseout", function (d) { d3.select(this).attr("r", 10); $('#yesnodailog').dialog("close"); })
                    .call(force.drag);


            node.append("text")
                    .attr("text-anchor", "middle").attr("fill", "red").style("pointer-events", "none").attr("font-size", function (d) { return "9px"; }).text(function (d) { return d.key; });

            node.append("title").text(function (d) { return d.name; });


            force.on("tick", function () {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                        .attr("cy", function (d) { return d.y; });
            });
        }

    };

    $.fn.LinkList = function (ListOption, trKey) {
        var node;
        var link;
        var color;
        var force;
        var svg;

        var jnode = {};

        var _Obj = $(this);
        var option = $(this).data("jsonData");

        var _reqFld = _Obj.find(".head:first").superContaner("isRequired");
        if (_reqFld.toKeyString() != "") {
            alert("필수 조회조건 항목중 [" + _reqFld.toKeyString() + "] 의 입력이 누락되었습니다.");
            return false;
        }


        var width = 1000, height = 800;

        if (option.svgSize.width != undefined) width = option.svgSize.width;
        if (option.svgSize.height != undefined) height = option.svgSize.height;

        color = d3.scale.category20();

        force = d3.layout.force()
                .charge(-220)  // -120
                .linkDistance(130) //30
                .size([width, height]);

        svg = d3.select(".linkArea").append("svg").attr("width", width).attr("height", height);



        if (_Obj.attr("RunTime") == undefined) {
            // 실행중이 아니면 바로실행
        } else if (_Obj.attr("RunTime") == "") {
            // 작업시간이 없으면 
        } else {
            // 실행중이니깐 리턴함 (중복실행방지)
            var RunTime = _Obj.attr("RunTime");
            var year = RunTime.substr(0, 4);
            var month = RunTime.substr(5, 2) - 1; // 1월=0,12월=11
            var day = RunTime.substr(8, 2);
            var hour = RunTime.substr(11, 2);
            var min = RunTime.substr(14, 2);
            var sec = RunTime.substr(17, 2);

            var nStart = new Date(year, month, day, hour, min, sec);
            var nEnd = new Date().getTime();      //종료시간 체크(단위 ms)

            var nDiff = nEnd - nStart;      //두 시간차 계산(단위 ms)
            if (nDiff <= 5000) {
                // alert("run...");
                return;
            } else {
                //  alert(nDiff);
            }

        }
        _Obj.attr("RunTime", _M.f.d.getTimeStamp())

        // .offSet 이용하여 해당 Table .body 영역에 이미지 그리는 방식 대체 === blockUI ===
        $('.body', _Obj).block({ message: '<img src="/image/spinner.gif" />', css: { 'background-color': 'transparent', 'border': '1px solid transparent' }, overlayCSS: { backgroundColor: 'transparent'} });
        $(".chartArea", _Obj).empty();
        var SContanerID = _Obj.attr("SContanerID");

        pl = _Obj.superContaner("tableGetFilter");
        pl.add("service", option.service);
        pl.add("method", option.method.List);
        pl.add("_order", "RNUM");
        pl.add("_viewpage", "1");
        pl.add("_pagecnt", "9999");
        PostJsonData(_M.svcUrl.crudUrl, pl, function (data) {
            $('.body', _Obj).unblock();
            _Obj.attr("RunTime", "");
            if (SContanerID != _Obj.attr("SContanerID")) {
                //alert('SContanerID - 충돌방어');
                return;
            }
            if (data.Table.Rows.length > 0) {

                var cdarr = new Array();
                var lnarr = new Array();
                $.each(data.Table.Rows, function (index, row) {
                    if (Search(cdarr, row['타입'], row['키']) == -1) {
                        cdarr.push({ "name": row['이름'], "group": 1, "key": row['키'], "type": row['타입'], "Viewjson": row['Viewjson'] });
                    }
                });
                eval("jnode.nodes = cdarr");
                $.each(data.Table.Rows, function (index, row) {
                    var source = Search(cdarr, row['상위타입'], row['상위키']);
                    var target = Search(cdarr, row['타입'], row['키']);
                    if (source > -1 && target > -1) {
                        lnarr.push({ "source": source, "target": target, "value": 2 });
                    }
                });
                eval("jnode.links = lnarr");

                ShowNode(jnode);
                if (option.afterListCallBack != undefined) eval(option.afterListCallBack)(_Obj);
            } else {
                var _id = _Obj.attr("id");
            }
        }, function (response) {
            $('.body', _Obj).unblock();
            _Obj.attr("RunTime", "");
            alert(response);
        }, _M.aSync.async);

        function Search(arr, type, key) {
            var nindex = -1
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].type == type && arr[i].key == key) {
                    nindex = i
                    break;
                }

            }
            return nindex;
        }

        function ShowNode(json) {

            force.nodes(json.nodes).links(json.links).start();
            link = svg.selectAll("line.link")
                    .data(json.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .on("click", function (d, i) {
                        //  alert(d.name + '/' + d.key + '/' + ' 라인 Hello world');
                    })
                    .style("stroke-width", function (d) { return Math.sqrt(d.value); });

            node = svg.selectAll("node")
                    .data(json.nodes)
                    .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", 10)
                    .style("fill", function (d) { return color(d.type); })
                    .on("click", function (d, i) {
                        // if (d.type != 1) {
                        _linkView.superContaner('SetPageContaner', d.Viewjson);
                        _linkView.toggle(true);
                        _linkView.superContaner('Read', d.key);
                        //}
                    })
                    .on("mouseover", function (d) {
                        d3.select(this).attr("r", 30);
                        //$.ShowBox({ "msg": d.name });
                        //$.ShowBox({ "msg": d.type + '/' + d.name + '/' + d.key });
                        //$("#mainView").superContaner('Read', d.key);
                    })
                    .on("mouseout", function (d) { d3.select(this).attr("r", 10); $('#yesnodailog').dialog("close"); })
                    .call(force.drag);


            node.append("text")
                    .attr("text-anchor", "middle").attr("fill", "red").style("pointer-events", "none").attr("font-size", function (d) { return "9px"; }).text(function (d) { return d.key; });

            node.append("title").text(function (d) { return d.name; });


            force.on("tick", function () {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                        .attr("cy", function (d) { return d.y; });
            });
        }
    };
})(jQuery);
