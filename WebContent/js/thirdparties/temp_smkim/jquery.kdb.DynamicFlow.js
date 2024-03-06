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

    $.fn.DynamicFlow = function (option, currentObj, parentObj) {
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
        $(this).removeClass().addClass('SuperContaner SuperTable SuperFlow').addClass(_theme);
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

        var _pmenu = $("<div class='progress'></div>").appendTo(_body);
        var _pArea = $("<div class='prgArea'></div>").appendTo(_body);

        $("<strong class='tit'>" + option.steptitle + "</strong>").appendTo(_pmenu);
        _ul = $("<ul></ul>").appendTo(_pmenu);
        var i = 0;


        if (option.service != undefined) {
            var pl = new JSONClientParameters();
            pl.add("service", option.service);
            pl.add("method", option.method.List);

            PostJsonData(_M.svcUrl.crudUrl, pl, function (_data) {
                if (_data.Table.Rows.length > 0) {
                    $.each(_data.Table.Rows,
                    function (index, value) {
                        if (value == undefined) return;
                        if (value.title == undefined || value.title == "") return;

                        var _li = $("<li></li>").appendTo(_ul);
                        _li.attr("step", value.step).attr("code", value.code);
                        var _a = $("<a>" + value.title + "</a>").appendTo(_li).css('width', value.width);
                        var _aul = $("<ul class='prgAreaUl'></ul>").appendTo(_pArea).attr('code', value.code);
                        _aul.css('width', _li.width() - 20).css('left', _li.offset().left + 10).css('top', _li.offset().top + 40);

                        var pl2 = new JSONClientParameters();
                        pl2.add("service", option.service);
                        pl2.add("method", option.method.ItemList);
                        pl2.add("stepCode", value.code);
                        PostJsonData(_M.svcUrl.crudUrl, pl2, function (_items) {
                            if (_items.Table.Rows.length > 0) {
                                $.each(_items.Table.Rows, function (index, value) {
                                    var _ali = $("<li></li>").appendTo(_aul).attr('keyvalue', value.keyvalue);
                                    var _html = $.tdFormSet(option.itemForm, value);
                                    _ali.html(_html);
                                });
                            } else {

                            }
                        }, function (response) {
                            _Obj.superContaner("tableShowMessage", response);
                        }, _M.aSync.sync);

                    });

                } else {

                }
            }, function (response) {
                _Obj.superContaner("tableShowMessage", response);
            }, _M.aSync.sync);
        }

        $(".prgAreaUl").sortable({ connectWith: ".prgAreaUl",
            stop: function (event, ui) {
                ui.item.animate({ backgroundColor: "yellow" }, 500).animate({ backgroundColor: "white" }, 500);
                //alert(ui.item.attr('keyvalue') +' - '+ ui.item.parent().attr('code'));

                var pl2 = new JSONClientParameters();
                pl2.add("service", option.service);
                pl2.add("method", option.method.Update);
                pl2.add("changeCode", ui.item.parent().attr('code'));
                pl2.add("keyvalue", ui.item.attr('keyvalue'));
                PostJsonData(_M.svcUrl.crudUrl, pl2, function (_items) {

                    var pl3 = new JSONClientParameters();
                    pl3.add("service", option.service);
                    pl3.add("method", option.method.List);
                    PostJsonData(_M.svcUrl.crudUrl, pl3, function (_item) {
                        $.each(_item.Table.Rows, function (index, value) {
                            $(".progress li[code='" + value.code + "'] a").html(value.title);
                        });

                    }, function (response) {
                        _Obj.superContaner("tableShowMessage", response);
                    }, _M.aSync.async);

                }, function (response) {
                    _Obj.superContaner("tableShowMessage", response);
                }, _M.aSync.async);

            }
        });
        $(".prgAreaUl").disableSelection();
    };

    $.fn.FlowList = function (ListOption, trKey) {
        var _Obj = $(this);
        var _json = $(this).data("jsonData");

        var _reqFld = _Obj.find(".head:first").superContaner("isRequired");
        if (_reqFld.toKeyString() != "") {
            alert("필수 조회조건 항목중 [" + _reqFld.toKeyString() + "] 의 입력이 누락되었습니다.");
            return false;
        }
        var _RefreshBeforValue = $(".SelectTR", _Obj).attr('keyvalue');
        _Obj.superContaner('tableClear');
        pl = _Obj.superContaner("tableGetFilter");
        pl.add("service", _json.service);
        pl.add("method", _json.method.List);

        //상위에서 전달된 외부조건 추가로 설정합니다.
        if (_Obj.data("ParentData") != undefined) {
            var _ext = _Obj.data("ParentData");
            var ppl = _ext.toArray();
            for (var p in ppl) {
                pl.add(p, ppl[p]);
            }
        };
        // parent 키가 있는 경우 해당 정보를 조건에 추가한다.
        if (_Obj.attr('jobType') != undefined) {
            pl.add('작업종류', _Obj.attr('jobType'));
        }
        if (_json.parentKey != undefined) {
            if (_Obj.attr("parentKeyValue") == undefined && _Obj.attr("id") != "ShowTableJson_ShowEdit") {
                alert("상위키값을 알수 없습니다");
                return;
            }
            if (_Obj.attr("parentKeyValue") == "" && _Obj.attr("id") != "ShowTableJson_ShowEdit") {
                alert("상위키값이 공백입니다.");
                return;
            }
            if (_Obj.attr("parentKeyValue") != undefined) {
                pl.add(_json.parentKey, _Obj.attr("parentKeyValue"));
            }
        }
        // 만일 ListJson에 List필터 조건이 있다면 적용할것.
        if (_json.ListFilter != undefined) {
            $.each(_json.ListFilter, function (index, filter) {
                pl.add(index, filter);
            });
        }
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

        PostJsonData(_M.svcUrl.crudUrl, pl, function (_data) {
            $('.body', _Obj).unblock();
            _Obj.attr("RunTime", "");
            if (SContanerID != _Obj.attr("SContanerID")) {
                //alert('SContanerID - 충돌방어');
                return;
            }
            if (_data.Table.Rows.length > 0) {
                _Obj.superContaner("tableShowData", _data.Table.Rows, ListOption, SContanerID);
                // 만일 데이터조회가 하위VIew의 업데이트에 의한 refresh인 경우는 해당 레코드의 선택만 변경한다.
                if (_data.Table1 != undefined) {
                    if (_json.SumMsg != undefined) {
                        $('.SumMsg', _Obj).text("");
                        var Form = _json.SumMsg;
                        var strReg = new RegExp("\@{+[a-zA-Z0-9가-힣-_]*\}", "gim");
                        var xArr = Form.match(strReg);
                        if (xArr != null) {
                            $.each(xArr, function (k, v) {
                                var _field = v.replace('@{', '').replace('}', '');
                                var _FieldValue = _data.Table1.Rows[0][_field]
                                switch (typeof (_FieldValue)) {
                                    case "string":
                                        if (_FieldValue.indexOf('Date') > 0) {
                                            _FieldValue = eval(_FieldValue.replace(/\/Date\((\d+)\)\//gi, "new Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
                                            _FieldValue = _M.f.d.DateGetDate(_FieldValue);

                                        }
                                        break;
                                    case "number":
                                        _FieldValue = _M.f.c.setComma(_FieldValue);
                                        break;
                                    case "boolean":
                                        break;
                                }
                                Form = Form.replace(v, _FieldValue);
                            });
                        }
                    };
                    $('.SumMsg', _Obj).text(Form);
                }
                if (ListOption == 'Refresh') {
                    $("tr[keyvalue='" + trKey + "']", _Obj).addClass('SelectTR');
                }

                if (_Obj.parent().hasClass("Tabs")) {
                    var _id = _Obj.attr("id");
                    var _tObj = _Obj.parent();

                    _tObj.find("a[href='#" + _id + "']").parent().addClass("filled");
                }

                if (_json.afterListCallBack != undefined) eval(_json.afterListCallBack)(_Obj);
            } else {
                var _id = _Obj.attr("id");
                var _tObj = _Obj.parent();
                _tObj.find("a[href='#" + _id + "']").parent().removeClass("filled");
                _Obj.superContaner("tableShowMessage", "0 Records ...");
                $('.page li', _Obj).addClass('hideUl');
                $('.SumMsg', _Obj).text("");
                $('.records', _Obj).text("Records : 0");
                $('.pages', _Obj).text("Pages : 0");
            }
        }, function (response) {
            $('.body', _Obj).unblock();
            _Obj.attr("RunTime", "");
            alert(response);
            _Obj.superContaner("tableShowMessage", response);
        }, _M.aSync.async);

        if (_json.LinkListJson != undefined) {
            var LinkPi = _Obj.superContaner("tableGetFilter");
            $.each(_json.LinkListJson, function (index, value) {
                $(value).superContaner("tableListExt", LinkPi);
            });
        };
    };
})(jQuery);
