/* jQuery grid plugin:
* version 2.0 2026-11-04
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

// 20261104 khma : superContaner.js 달력(superCalendar) 컴포넌트 모듈 분리 추출
(function ($) {
  if (!$.fn.superContaner) {
    return;
  }

  $.fn.superContaner.calendarMethods = {
    superCalendar: function (option, objKey) {
      var _Obj = $(this);
      var _jsonName = option;
      if (typeof _jsonName == "string") {
        option = GETJSON(_jsonName);
        $(this).attr("jsonName", _jsonName);
      }
      if (option == undefined) {
        option = eval(_jsonName);
      }
      if (option == undefined) {
        option = viewOption;
      }
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperCalendar");

      /* ----------------------------------------------------------------------------- */
      // 외곽디자인 구성
      /* ----------------------------------------------------------------------------- */
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성
      /* ----------------------------------------------------------------------------- */
      var _jobArea = $("<div class='jobArea jobArea-bg'></div>").appendTo(
        _head
      );
      var _Btnset = $("<div class='buttonset'></div>").appendTo(_jobArea);
      _Obj.makeButtons(_jobArea);

      /* ----------------------------------------------------------------------------- */
      // Body생성
      /* ----------------------------------------------------------------------------- */
      // var _body = $("<div class='body body-bg'></div>").appendTo(_Obj);
      var _body = $("<div class='body'></div>").appendTo(_Obj);

      var _calChkArea = $(
        "<div class='calChkArea'><div class='calTitle'><div class='calDiv'><a>Calendar</a></div></div></div>"
      ).appendTo(_body);

      $(".calChkArea").datepicker({
        nextText: ">",
        prevText: "<",
        showOtherMonths: true,
        dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
        changeMonth: false,
        changeYear: false,
        onSelect: function (dateText, inst) {
          var date = dateText.split("-").join("");
          var yy = date.substring(0, 4);
          var mm = date.substring(4, 6);
          var dd = date.substring(6, 8);

          mm = mm - 1;
          switch (mm) {
            case -1:
              mm == 0;

            case 13:
              mm == 0;
              break;
          }

          var oldDate = $(this).attr("oldDate");
          Mover = $(".calArea");
          Checker = Mover.fullCalendar("getView");
          if (oldDate != dateText) {
            // 동일날짜클릭 방지
            Mover.fullCalendar("gotoDate", yy, mm, dd);
            Mover.fullCalendar("changeView", "agendaDay");
          }
          $(this).attr("oldDate", dateText);
        },
      });

      $("<div class='calCategory'>My Calendar</div>").appendTo(
        $(".calChkArea")
      );
      $("<div class='calHide'></div>").appendTo(_body);
      $(
        '<div><input type="text" class="datepickbawl" style="display:none; width:50px; height:10px" /></div>'
      ).appendTo(".calChkArea");

      $.each(option.calendars, function (index, value) {
        if (value == undefined) return;
        checkBoxid = "calcheck" + formCID++;
        // var _calChkSpan =
        // $("<div></div>").appendTo(_calChkArea);
        // _calChkSpan.css("background-color",
        // value.eventColor).css("color", 'white');
        // var calChkBox = $("<input type='checkbox'
        // value='1' id='" + checkBoxid + "' /><label
        // for='" + checkBoxid + "'>" + value.name +
        // "</label>").appendTo(_calChkSpan).css('width',
        // 'auto');
        var _calChkSpan = $(
          "<div class='selectArea' style='position:relative'></div>"
        ).appendTo(_calChkArea);
        _calChkSpan
          .css("background-color", value.eventColor)
          .css("color", "white");
        var calChkBox = $(
          "<label for='" +
            checkBoxid +
            "' value='" +
            checkBoxid +
            "' class='fake_chk calcheck" +
            index +
            "'></label><input type='checkbox' value='1' id='" +
            checkBoxid +
            "'  /><label class='Arealabel' style='margin-left:6px' for='" +
            checkBoxid +
            "'>" +
            value.name +
            "</label>"
        )
          .appendTo(_calChkSpan)
          .css("width", "auto");

        calChkBox.attr("service", value.service);
        // 체크박스가 변경될때 새로 검색하도록 액션을 넣는다.
        calChkBox.change(function () {
          // var _calArea =
          // $(this).parents('superCalendar').find('.calArea');
          if ($(this).is(":checked")) {
            $(".calcheck" + index).css("background-position", "2px -17px");
            var view = $(".calArea").fullCalendar("getView");
            _Obj.superContaner(
              "CalList",
              view,
              _Obj,
              calChkBox.attr("calName")
            );
          } else {
            var targetEvent = $(".calArea").fullCalendar(
              "getEventsByClassName",
              calChkBox.attr("calName")
            );
            if (targetEvent.length > 0) {
              $(".calArea").fullCalendar(
                "removeEventSource",
                targetEvent[0].source
              );
            }
          }
        });

        if (value.method.Create != undefined) {
          calChkBox.attr("methodCreate", value.method.Create);
        }
        if (value.method.List != undefined) {
          calChkBox.attr("methodList", value.method.List);
        }
        if (value.method.Insert != undefined) {
          calChkBox.attr("methodInsert", value.method.Insert);
        }
        if (value.method.Update != undefined) {
          calChkBox.attr("methodUpdate", value.method.Update);
        }
        if (value.method.Delete != undefined) {
          calChkBox.attr("methodDelete", value.method.Delete);
        }
        if (undefined != value.css) {
          if (undefined != value.css.time) {
            calChkBox.attr("eventTimeCss", value.css.time);
          }
          if (value.css.title != undefined) {
            calChkBox.attr("eventTitleCss", value.css.title);
          }
        }
        calChkBox.attr("calName", value.name);
        calChkBox.attr("eventColor", value.eventColor);
        if (undefined != value.css) {
          calChkBox.attr("viewJson", value.viewJson);
        }
        if (value.defaultValue == "1") {
          calChkBox.attr("checked", "checked");
        }
        if (value.editable == undefined) {
          calChkBox.attr("editable", true);
        } else {
          calChkBox.attr("editable", value.editable);
        }
        if (value.allDayFlag == undefined) {
          calChkBox.attr("allDayFlag", true);
        } else {
          calChkBox.attr("allDayFlag", value.allDayFlag);
        }
        if (value.keyName != undefined) {
          calChkBox.attr("objKeyName", value.keyName);
        }
      });
      var _calArea = $(
        "<div class='calArea' initDisplayTf='0' ></div>"
      ).appendTo(_body);
      if (option.isShowCalChkArea) {
        $(".calChkArea", _Obj).show();
        // $('.calArea', _Obj).css("margin-left", "126px");
        // $('.calArea', _Obj).css("margin-left", "196px"); JDM
      } else {
        $(".calChkArea", _Obj).hide();
        // $('.calArea', _Obj).css("margin-left", "0px"); JDM
      }
      _calArea.fullCalendar(_M.fullCalendar);

      if (option.defaultViewMode == "week") {
        _calArea.fullCalendar("changeView", "agendaWeek");
      } else if (option.defaultViewMode == "day") {
        _calArea.fullCalendar("changeView", "agendaDay");
      }

      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      // 필터표시여부 결정
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );

      $(".status", _Obj).toggle(option.isShowStatus);

      // 2018.01.30 dmjung :: resize 이벤트를 Calendar 생성 이후 호출, 특정 요일만 비율 맞지
      // 않는 문제 해결하기 위함.
      $(window).resize();
    },

    CalList: function (view, obj, targetCalName, key) {
      var _Obj = $(this).parents(".SuperCalendar");
      if (obj != undefined) {
        _Obj = obj;
      }

      var _calArea = _Obj.find(".calArea");

      _json = _Obj.data("jsonData");

      _s = _M.f.d.DateGetTimeStamp(view.visStart);
      _e = _M.f.d.DateGetTimeStamp(view.visEnd);

      if (targetCalName == undefined) {
        var targetEvent = _calArea.fullCalendar("getEvents");
        _calArea.fullCalendar("removeEvents");
      }

      // 칼렌더 수만큼 반복
      $(".calChkArea input[type='checkbox']", _Obj).each(function (
        index,
        value
      ) {
        var calinfo = $(this);
        if (calinfo.is(":checked")) {
          // alert(targetCalName + '/' +
          // value.className);
          if (
            targetCalName == undefined ||
            targetCalName == calinfo.attr("calName")
          ) {
            var pl = new JSONClientParameters();
            pl.add("service", calinfo.attr("service"));
            pl.add("method", calinfo.attr("methodList"));
            pl.add("fromDate", _s);
            pl.add("toDate", _e);
            if (calinfo.attr("objKeyName") != undefined) {
              pl.add(calinfo.attr("objKeyName"), key);
            }

            var eventParam = new JSONClientParameters();
            var classType = "일정";
            if (calinfo.attr("calName") != undefined)
              classType = calinfo.attr("calName");
            var eventColor = calinfo.attr("eventColor");
            var jsonName = $(this).attr("viewJson");
            var editable = calinfo.attr("editable");
            var allDayFlag = calinfo.attr("allDayFlag"); // 구조체에서
            // 셋팅된
            // alldayflag
            // khma
            var service = calinfo.attr("service");
            var methodUpdate = calinfo.attr("methodUpdate");
            var methodDelete = calinfo.attr("methodDelete");
            var methodRead = calinfo.attr("methodRead");
            // eventParam.add("methodUpdate",
            // $(this).attr('methodUpdate'));
            // eventParam.add("methodDelete",
            // $(this).attr('methodDelete'));
            // eventParam.add("methodRead",
            // $(this).attr('methodRead'));

            // eventParam.add("eventTitleCss",
            // $(this).attr('eventTitleCss'));
            // eventParam.add("eventTimeCss",
            // $(this).attr('eventTimeCss'));
            PostJsonData(
              _M.svcUrl[_M.Webtype].crudUrl,
              pl,
              function (_data) {
                if (_data.resultData.length > 0) {
                  /*
                   * 20180328 khma 캘린더 속도
                   * 개선용 Start
                   */
                  var eventList = new Array(); // khma
                  $.each(_data.resultData, function (index, row) {
                    var event = new Object(); // khma

                    // 20261104 khma : Java Spring 단일 환경 표준화 (미사용 .NET 날짜 /Date()/ eval 분기 정리)
                    var _from = row.fromdatetime;
                    if (_from != null) {
                      _from = new Date(_from);
                    } else {
                      _from = eval(_to);
                    }
                    var _to = row.todatetime;
                    if (_to != null) {
                      _to = new Date(_to);
                    } else {
                      _to = eval(_to);
                    }
                    /*
                    var _from = row.fromdatetime;
                    if (_from != null) {
                      if (_M.Webtype == "NET") {
                        _from = eval(_from.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));
                      } else {
                        _from = new Date(_from);
                      }
                    }
                    */

                    /*
                     * if
                     * (row.TitleCss !=
                     * undefined) {
                     * eventParam.add("eventTitleCss",
                     * row.TitleCss); }
                     * else {
                     * eventParam.add("eventTitleCss",
                     * calinfo.attr('eventTitleCss')); }
                     *
                     * if
                     * (row.TimeCss !=
                     * undefined) {
                     * eventParam.add("eventTimeCss",
                     * row.TimeCss); }
                     * else {
                     * eventParam.add("eventTimeCss",
                     * calinfo.attr('eventTimeCss')); }
                     * if(row.allDayFlag !=
                     * undefined){
                     * //20180327
                     * db에서
                     * 설정된
                     * alldayflag
                     * 셋팅
                     * 추가
                     * khma
                     * if(row.allDayFlag ==
                     * '1'){
                     * eventParam.add("allDayFlag",
                     * 'true');
                     * }else{
                     * eventParam.add("allDayFlag",
                     * 'false'); } }
                     * _Obj.superContaner("CalShow",
                     * row.title,
                     * row.id,
                     * _from,
                     * _to,
                     * eventParam.toArray());
                     */

                    // khma
                    // start
                    event.title = $.decHTML(row.title);
                    event.id = classType + row.id;
                    event.className = classType;
                    event.start = _from;
                    event.end = _to;
                    event.sticker = row.sticker;
                    if (row.allDayFlag != undefined) {
                      // 20180327
                      // db에서
                      // 설정된
                      // alldayflag
                      // 셋팅
                      // 추가
                      // khma
                      if (row.allDayFlag == "1") {
                        event.allDay = true;
                      } else {
                        event.allDay = false;
                      }
                    } else {
                      if (allDayFlag != undefined) {
                        event.allDay = allDayFlag;
                      } else {
                        event.allDay = false;
                      }
                    }

                    event.backgroundColor = eventColor;
                    event.borderColor = eventColor;
                    if (editable == "true") {
                      event.editable = true;
                    } else {
                      event.editable = false;
                    }
                    event.serviceName = service;
                    event.methodUpdate = methodUpdate;
                    event.viewJson = jsonName;
                    event.eventKey = row.id;
                    if (row.TitleCss != undefined) {
                      event.eventTitleCss = row.TitleCss;
                    } else {
                      event.eventTitleCss = calinfo.attr("eventTitleCss");
                    }
                    if (row.TimeCss != undefined) {
                      event.eventTimeCss = row.TimeCss;
                    } else {
                      event.eventTimeCss = calinfo.attr("eventTimeCss");
                    }

                    eventList.push(event); // 이벤트
                    // 목록
                    // 일괄
                    // 셋팅
                  });
                  // 리스트 표시전 대상 칼렌더를 클리어함
                  _calArea.fullCalendar("addEventSource", eventList);
                  /*
                   * 20180328 khma 캘린더 속도
                   * 개선용 End
                   */

                  if (_json.afterListCallBack != undefined)
                    eval(_json.afterListCallBack)(_Obj);
                } else {
                  // _Obj.superContaner("tableShowMessage",
                  // "0 Recodes ...");
                }
              },
              function (response) {
                // _Obj.superContaner("tableShowMessage",
                // response.Message);
                // alert(response);
              },
              _M.aSync.async
            );
          }
        }
      });
    },

    CalShow: function (Title, id, fromDatetime, endDatetime, eventParam) {
      // if (eventParam.classType == undefined) classType = "할일";
      if (fromDatetime == undefined) fromDatetime = _M.f.d.getTimeStamp();
      if (endDatetime == undefined) endDatetime = _M.f.d.getTimeStamp();
      var allDayFlag = false;
      if (eventParam.allDayFlag == "true") {
        allDayFlag = true;
      }
      _Obj = $(".calArea", $(this));
      var _id = eventParam.classType + id;
      _Obj.fullCalendar("renderEvent", {
        title: Title,
        id: _id,
        className: eventParam.classType,
        start: fromDatetime,
        end: endDatetime,
        allDay: allDayFlag,
        backgroundColor: eventParam.eventColor,
        borderColor: eventParam.eventColor,
        editable: eventParam.editable == "true" ? true : false,
        serviceName: eventParam.servName,
        methodUpdate: eventParam.methodUpdate,
        viewJson: eventParam.jsonName,
        eventKey: id,
        eventTitleCss: eventParam.eventTitleCss,
        eventTimeCss: eventParam.eventTimeCss,
      });
    },

    CalRender: function (event, element) {
      var _Obj = $(this).parents(".SuperCalendar");
      var sticker = event.sticker;

      if (undefined != event.eventTimeCss) {
        // 이벤트타임의 태그적용
        var _elementName = "span.fc-event-time";
        if (
          element.find(_elementName).text() == undefined ||
          element.find(_elementName).text() == ""
        ) {
          // 엘레멘트가 없을때는 타이틀로 속성을 대신함
          _elementName = "span.fc-event-title";
        }
        _Obj.superContaner(
          "CalSetEventStyle",
          element,
          _elementName,
          event.eventTimeCss
        );
      }

      if (undefined != event.eventTitleCss) {
        // 이벤트타이틀의 태그적용
        _Obj.superContaner(
          "CalSetEventStyle",
          element,
          "span.fc-event-title",
          event.eventTitleCss
        );
      }
      // else {
      // _Obj.superContaner("CalSetEventStyle", element,
      // "span.fc-event-title", '');
      // }

      if (sticker != undefined) {
        // sticker 표시
        _Obj.superContaner(
          "CalSetEventStyle",
          element,
          "div.fc-event-inner",
          sticker
        );
      }
    },
    CalSetEventStyle: function (element, elementName, cssName) {
      // 이벤트의 타이틀과 타입의 텍스트에 태그를 적용 할수있다.
      var tagStr = "";
      if (elementName == "div.fc-event-inner") {
        // TODO sticker
        tagStr +=
          "<span class='icon calicon " +
          cssName +
          " align-middle'></span>" +
          element.find("div.fc-event-inner").html();
      } else {
        // TODO eventIcon
        tagStr +=
          "<span class='icon calicon " +
          cssName +
          " align-middle'></span>" +
          "<span class='eventHead align-middle' title='" +
          element.find(elementName).text() +
          "'>" +
          element.find(elementName).text() +
          "</span>"; // html태그를
        // 포함한
        // title의
        // 문자열을
        // 취득
      }
      eventElem = element.find(elementName);
      eventElem.html(tagStr);
    },
    CalDayClick: function (date, allDay, jsEvent, view, obj) {
      // alert('caldayclcick');
      // var _Obj = $(this).parents('.SuperCalendar');
      // var _json = _Obj.data('jsonData');
      // var _calArea = $(this).parents('.calArea');
      // $.ShowEditJson(_json.MainCalendar.viewJson,
      // _json.MainCalendar.name,function(){
      // var view = _calArea.fullCalendar("getView");
      // var targetEvent =
      // _calArea.fullCalendar("getEventsByClassName",_json.MainCalendar.name);
      // for (i = 0; i < targetEvent.length; i++) {
      // _calArea.fullCalendar('removeEvents',targetEvent[i].id);
      // }
      // _Obj.superContaner("CalList",view, _Obj,
      // _json.MainCalendar.name);
      // });
    },
    CalClick: function (calEvent, jsEvent, view, obj) {
      var _Obj = $(this).parents(".SuperCalendar");
      var _calArea = $(this).parents(".calArea");
      if (calEvent.editable == true) {
        // $.ShowCalEditJson(calEvent.viewJson, _Obj,calEvent.start,
        // calEvent.end, calEvent.allDay, function(_key) {
        $.ShowReadEditJson(
          calEvent.viewJson,
          calEvent.eventKey,
          function (_key) {
            var view = _calArea.fullCalendar("getView");
            var targetEvent = _calArea.fullCalendar(
              "getEventsByClassName",
              calEvent.className[0]
            );
            _calArea.fullCalendar("removeEventSource", targetEvent[0].source);

            var option = $(".SuperCalendar").data("jsonData");
            if (option.calendarMode != "subCalendar") {
              $(this).superContaner(
                "CalList",
                view,
                _Obj,
                calEvent.className[0]
              ); // 리스트표시
            } else {
              $(this).superContaner("CalendarListParent"); // 리스트표시
            }
          },
          true
        );
      } else {
        $.ShowReadOnlyJson(
          calEvent.viewJson,
          calEvent.eventKey,
          function (_key) {
            var view = _calArea.fullCalendar("getView");
            var targetEvent = _calArea.fullCalendar(
              "getEventsByClassName",
              calEvent.className[0]
            );
            _calArea.fullCalendar("removeEventSource", targetEvent[0].source);

            _Obj.superContaner("CalList", view, _Obj, calEvent.className[0]);
          }
        );
      }
    },

    CalAfterRender: function (event, element, view) {},
    CalDragStop: function (event, jsEvent, ui, view, obj) {
      // TODO
    },
    CalReSizeStop: function (event, jsEvent, ui, view, obj) {
      //
    },
    CalAdd: function (start, end, allDay) {
      var _Obj = $(".SuperCalendar");
      var _json = _Obj.data("jsonData");
      var _calArea = _Obj.find(".calArea");
      var view = _calArea.fullCalendar("getView");

      // 20150212 khma 켈린더 복수 입력 기능 추가
      // alert("새 칼란더 추가: start::" + start + " end::" + end + "allDay::" +
      // allDay);
      var targetCalendar; // 보여줄 켈린더
      var targetCalendarCnt = 0; // editable true인 켈린더수

      for (var i = 0; i < _json.calendars.length; i++) {
        if (
          true == _json.calendars[i].editable ||
          undefined == _json.calendars[i].editable
        ) {
          targetCalendarCnt++;
          targetCalendar = _json.calendars[i];
        }
      }

      // TODO 켈린더 목록 취득
      if (targetCalendarCnt == 1) {
        $(document.body).find(".kcontextMenu").remove();
        // 해당 켈린더 1건의 뷰화면을 팝업으로 표시한다.
        // targetCalendar = _json.calendars[0]; // 상기 추가코드에서 미리 지정하므로
        // 주석처리함
        $(this).superContaner(
          "CalShowDetail",
          _Obj,
          _calArea,
          targetCalendar,
          start,
          end,
          allDay
        ); // 리스트표시
      } else if (targetCalendarCnt > 1) {
        // TODO 팝업 선택 화면을 표시한다.
        var popTitle = "입력 폼 선택 팝업";
        $(document.body).find(".kcontextMenu").remove();
        $(document.body).append(
          "<div class='kcontextMenu calendarViewPopup' ></div>"
        );

        // 셀렉트TAG를 그림
        var _calListTag = $('<div class="row"></div>').appendTo(
          $(document.body).find(".kcontextMenu")
        );
        //
        $('<a class="Label">입력 폼 선택</a>').appendTo(_calListTag);
        // css({"color":"#000000", "font-weight":"bold",
        // "min-width":"90px", "padding-right": "10px"}).

        var _selTag = $(
          '<select name="calendarForm" id="calendarForm" size="1"></select>'
        ).appendTo(_calListTag);
        for (var i = 0; i < _json.calendars.length; i++) {
          if (
            true == _json.calendars[i].editable ||
            undefined == _json.calendars[i].editable
          ) {
            var val = _json.calendars[i].viewJson;
            var label = _json.calendars[i].name;
            $("<option value=" + val + ">" + label + "</option>")
              .data("updJson", _json.calendars[i])
              .appendTo(_selTag);
          }
        }

        // 다이얼로그 열기
        $(document.body)
          .find(".kcontextMenu")
          .dialog({
            autoOpen: false,
            modal: true,
            width: 400,
            height: 170,
            title: popTitle,
            closeOnEscape: false,
            buttons: {
              선택: function () {
                targetCalendar = $("#calendarForm")
                  .find("option:selected")
                  .data("updJson");
                $(this).superContaner(
                  "CalShowDetail",
                  _Obj,
                  _calArea,
                  targetCalendar,
                  start,
                  end,
                  allDay
                ); // 리스트표시
              },
              닫기: function () {
                $(this).dialog("close");
              },
            },
            close: function (event, ui) {
              $(document.body).find(".kcontextMenu").remove();
            },
          });
        $(document.body).find(".kcontextMenu").dialog("open");
      } else {
        return false;
      }
    },
    CalShowDetail: function (
      _Obj,
      _calArea,
      targetCalendar,
      start,
      end,
      allDay
    ) {
      var parentKey = _calArea.data("keyValue");

      // 메인켈린더를 뷰에 표시함..
      if (
        undefined != targetCalendar.viewJson &&
        "" != targetCalendar.viewJson
      ) {
        if (parentKey == undefined && undefined != targetCalendar.viewJson) {
          parentKey = targetCalendar.viewJson;
        }

        $.ShowCalEditJson(
          targetCalendar.viewJson,
          parentKey,
          start,
          end,
          allDay,
          targetCalendar.name,
          function () {
            var view = _calArea.fullCalendar("getView");
            var targetEvent = _calArea.fullCalendar(
              "getEventsByClassName",
              targetCalendar.name
            );
            if (targetEvent.length > 0) {
              _calArea.fullCalendar("removeEventSource", targetEvent[0].source);
            }

            var option = $(".SuperCalendar").data("jsonData");
            if (option.calendarMode != "subCalendar") {
              $(this).superContaner("CalList", view, _Obj, targetCalendar.name); // 리스트표시
            } else {
              $(this).superContaner("CalendarListParent"); // 리스트표시
            }
            // _Obj.superContaner("CalList",view, _Obj,
            // _json.MainCalendar.name);
          }
        );
      }
    },
    CalDrop: function (
      event,
      dayDelta,
      minuteDelta,
      allDay,
      revertFunc,
      jsEvent,
      ui,
      view,
      obj
    ) {
      // 이벤트를 이동시켜 드랍된 경우 날자를 갱신
      var _Obj = $(this).parents(".SuperCalendar");
      _Obj.superContaner("CalUpdate", event);
    },
    CalResize: function (
      event,
      dayDelta,
      minuteDelta,
      revertFunc,
      jsEvent,
      ui,
      view,
      obj
    ) {
      // 이벤트를 리사이징시켜서 완료된경우 날자를 갱신
      var _Obj = $(this).parents(".SuperCalendar");
      if (event.end == undefined) {
        // 리사이즈시 스케쥴일자가 하루인경우 날자를 가져오지 못하므로 dayDelta를 기준으로 변경한다.
        event.end = event.start;
      }
      _Obj.superContaner("CalUpdate", event);
    },
    CalUpdate: function (updateEvent) {
      // 카렌더가 이동되면 변경사항을 업데이트한다.
      var pl = new JSONClientParameters();
      pl.add("service", updateEvent.serviceName);
      pl.add("method", updateEvent.methodUpdate);
      pl.add("id", updateEvent.eventKey);
      pl.add("start", _M.f.d.DateGetTimeStamp(updateEvent.start));
      if (updateEvent.end != undefined) {
        pl.add("end", _M.f.d.DateGetTimeStamp(updateEvent.end));
      } else {
        pl.add("end", _M.f.d.DateGetTimeStamp(updateEvent.start));
      }
      if (updateEvent.allDay == true) {
        pl.add("allDayFlag", "1");
      } else {
        pl.add("allDayFlag", "0");
      }

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          // // if (_json.afterUpdateCallBack != undefined &&
          // _json.afterUpdateCallBack != "")
          // eval(_json.afterUpdateCallBack)(oCmd);
        },
        function (response) {
          // // $("#hm").html('Error : ' + response.Message);
          alert(response.Message);
        },
        _M.aSync.sync
      );
    },
    CalClear: function (calArea, opt, value) {
      // [opt]'all':AllClear,
      // 'className'
      // alert('opt: ' + opt );
      var targetEvent;
      if (calArea != undefined) {
        if (opt == undefined || opt == "all") {
          targetEvent = calArea.fullCalendar("getEvents");
        } else if (opt == "className" && value != undefined) {
          targetEvent = calArea.fullCalendar(
            "getEventsByClassName",
            _json.MainCalendar.name
          );
        } else {
          targetEvent = calArea.fullCalendar("getEvents");
        }
        if (targetEvent.length > 0)
          calArea.fullCalendar("removeEventSource", targetEvent[0].source);
      }
    }, // 20180329 미사용
    CalendarListParent: function (key) {
      // var _Obj = $('#MainView').find('.SuperCalendar');
      var _Obj = $(".SuperCalendar");
      var _caljson = _Obj.data("jsonData");
      var _calArea = _Obj.find(".calArea");
      var _key;
      if (key != undefined) {
        _calArea.data("keyValue", key);
        _key = key;
      } else {
        _key = _calArea.data("keyValue");
      }

      if (_calArea.data("keyValue") != undefined) {
        var view = _calArea.fullCalendar("getView");
        // alert("mituketa!!!" + key + " : " +_caljson.MainCalendar.name
        // );
        var targetEvent = _calArea.fullCalendar(
          "getEventsByClassName",
          _caljson.MainCalendar.name
        );
        _calArea.fullCalendar("removeEventSource", targetEvent[0].source);

        _Obj.superContaner(
          "CalList",
          view,
          _Obj,
          _caljson.MainCalendar.name,
          _key
        );
      }
    },
  };
})(jQuery);

