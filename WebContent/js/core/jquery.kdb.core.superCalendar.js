/* jQuery grid plugin:
* version 2.0 2026-11-10
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

/**
 * MonArch CRM 달력/일정(SuperCalendar) 렌더링 및 일정 이벤트 제어 코어 모듈
 *
 * [모듈 개요]
 * - 기존 jquery.kdb.superContaner.js 내부에 포함되어 있던 FullCalendar 1.5.3 기반
 *   달력 컴포넌트 메서드 17종을 독립 모듈(js/core/jquery.kdb.core.superCalendar.js)로 분리한 파일이다.
 * - $.fn.superContaner.calendarMethods 네임스페이스에 메서드를 등록하며,
 *   호출 시 superContaner 본체 디스패처에서 본 모듈의 메서드로 위임(apply) 실행된다.
 *
 * [제공 메서드 목록 (총 17종)]
 * 1. superCalendar      : 달력 컨테이너(SuperCalendar) 초기화, 미니 달력(datepicker), 다중 캘린더 카테고리 체크박스 및 FullCalendar 생성
 * 2. CalList            : 표시 기간(visStart ~ visEnd) 및 체크된 캘린더 카테고리 기준으로 백엔드 일정을 조회하여 일괄 바인딩(addEventSource)
 * 3. CalShow            : 단건 일정 데이터를 FullCalendar에 개별 렌더링(renderEvent)
 * 4. CalRender          : 각 일정 엘리먼트 렌더링 시 시간/타이틀 아이콘 및 스티커(sticker) 스타일 적용
 * 5. CalSetEventStyle   : 일정 DOM 요소 내부에 아이콘(calicon) 및 툴팁 타이틀 HTML 태그 삽입
 * 6. CalDayClick        : 달력 날짜 셀 클릭 이벤트 핸들러 (확장 포인트)
 * 7. CalClick           : 등록된 일정 클릭 시 편집 가능 여부(editable)에 따라 수정용 팝업(ShowReadEditJson) 또는 조회 전용 팝업(ShowReadOnlyJson) 호출
 * 8. CalAfterRender     : 일정 렌더링 완료 후 후처리 콜백 핸들러
 * 9. CalDragStop        : 일정 드래그 종료 시점 핸들러
 * 10. CalReSizeStop     : 일정 기간 리사이즈 종료 시점 핸들러
 * 11. CalAdd            : 달력 빈 영역 드래그 선택 시 단일 입력폼 즉시 팝업 또는 다중 입력폼 선택 다이얼로그 표시
 * 12. CalShowDetail     : 선택된 캘린더 카테고리의 신규 일정 등록 팝업(ShowCalEditJson) 오픈 및 저장 후 일정 목록 갱신
 * 13. CalDrop           : 일정을 다른 날짜/시간으로 드래그 앤 드롭 이동 완료 시 CalUpdate 호출
 * 14. CalResize         : 일정 종료일/시간 리사이즈 완료 시 CalUpdate 호출
 * 15. CalUpdate         : 이동 또는 리사이즈된 일정의 시작/종료 일시 및 종일 여부(allDayFlag)를 백엔드에 동기 업데이트
 * 16. CalClear          : 전체 또는 특정 클래스명의 일정 소스를 달력에서 제거
 * 17. CalendarListParent: 상위 부모 컨테이너의 키값(key) 변경 시 연동된 하위 캘린더(subCalendar) 일정을 재조회
 */
// 20261104 khma : superContaner.js 달력(superCalendar) 컴포넌트 모듈 분리 추출
// 20261106 khma : js/core 폴더 구조 표준화에 따라 core/jquery.kdb.core.superCalendar.js로 이관 배치
// 20261110 khma : 모듈 개요, 메서드별 상세 Javadoc 및 내부 로직 단계별 설명 주석 보강
(function ($) {
  // 20261104 khma : 상위 플러그인(superContaner) 선행 로드 여부 검증
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superCalendar.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  // 20261104 khma : 달력 전용 메서드 네임스페이스 초기화
  if (!$.fn.superContaner.calendarMethods) {
    $.fn.superContaner.calendarMethods = {};
  }

  $.extend($.fn.superContaner.calendarMethods, {
    /**
     * 달력 컨테이너(SuperCalendar) 레이아웃, 좌측 미니 달력(datepicker), 카테고리별 체크박스 및 FullCalendar 본문을 생성한다.
     *
     * @param {string|Object} option 화면 구조체 JSON 명칭 또는 구조체 옵션 객체
     * @param {string} [objKey] 초기 연동 키값
     */
    superCalendar: function (option, objKey) {
      var _Obj = $(this);
      var _jsonName = option;

      // 1. 문자열 형태로 구조체명이 전달된 경우 서버/캐시에서 JSON 설정 객체를 로드한다.
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

      // 2. 컨테이너 DOM에 구조체 옵션을 바인딩하고 SuperCalendar 클래스를 적용한다.
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperCalendar");

      // 3. 상단 헤더(.head) 및 작업 버튼 영역(.jobArea)을 생성한다.
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      var _jobArea = $("<div class='jobArea jobArea-bg'></div>").appendTo(
        _head
      );
      var _Btnset = $("<div class='buttonset'></div>").appendTo(_jobArea);
      _Obj.makeButtons(_jobArea);

      // 4. 본문(.body) 및 좌측 미니 달력/카테고리 영역(.calChkArea)을 생성한다.
      var _body = $("<div class='body'></div>").appendTo(_Obj);

      var _calChkArea = $(
        "<div class='calChkArea'><div class='calTitle'><div class='calDiv'><a>Calendar</a></div></div></div>"
      ).appendTo(_body);

      // 좌측 미니 달력(jQuery UI datepicker) 바인딩: 날짜 클릭 시 우측 FullCalendar를 해당 일자(agendaDay)로 이동시킨다.
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
            // 동일 날짜 중복 클릭이 아닌 경우에만 해당 날짜의 일간 뷰(agendaDay)로 전환한다.
            Mover.fullCalendar("gotoDate", yy, mm, dd);
            Mover.fullCalendar("changeView", "agendaDay");
          }
          $(this).attr("oldDate", dateText);
        },
      });

      // 5. 다중 캘린더 카테고리 목록(My Calendar) 체크박스를 생성한다.
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

        // 카테고리 체크박스 변경 시: 체크되면 해당 캘린더 일정을 조회(CalList)하고, 해제되면 해당 이벤트 소스를 제거한다.
        calChkBox.change(function () {
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

        // 캘린더 카테고리별 CRUD 메서드, 색상, 상세 뷰(viewJson), 편집 가능 여부(editable), 종일 여부(allDayFlag)를 속성에 저장한다.
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

      // 6. 우측 본문 FullCalendar 영역(.calArea)을 생성하고 기본 뷰 모드(month/week/day)를 설정한다.
      var _calArea = $(
        "<div class='calArea' initDisplayTf='0' ></div>"
      ).appendTo(_body);
      if (option.isShowCalChkArea) {
        $(".calChkArea", _Obj).show();
      } else {
        $(".calChkArea", _Obj).hide();
      }
      _calArea.fullCalendar(_M.fullCalendar);

      if (option.defaultViewMode == "week") {
        _calArea.fullCalendar("changeView", "agendaWeek");
      } else if (option.defaultViewMode == "day") {
        _calArea.fullCalendar("changeView", "agendaDay");
      }

      // 7. 하단 상태줄(.status) 생성 및 옵션에 따른 표시 여부 제어 후 창 리사이즈 이벤트를 트리거하여 요일 폭 비율을 맞춘다.
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".status", _Obj).toggle(option.isShowStatus);

      $(window).resize();
    },

    /**
     * 현재 달력 표시 기간(view.visStart ~ view.visEnd)과 체크된 카테고리를 기준으로 백엔드에서 일정을 조회하여 달력에 일괄 바인딩한다.
     *
     * @param {Object} view FullCalendar View 객체 (visStart, visEnd 보유)
     * @param {jQuery} [obj] SuperCalendar 컨테이너 객체
     * @param {string} [targetCalName] 특정 캘린더 카테고리만 조회할 경우 대상 카테고리명 (미지정 시 체크된 전체 카테고리 조회)
     * @param {string} [key] 상위 부모 컨테이너 연동 키값
     */
    CalList: function (view, obj, targetCalName, key) {
      var _Obj = $(this).parents(".SuperCalendar");
      if (obj != undefined) {
        _Obj = obj;
      }

      var _calArea = _Obj.find(".calArea");
      _json = _Obj.data("jsonData");

      // 1. 조회 시작일(_s)과 종료일(_e) 타임스탬프를 추출한다.
      _s = _M.f.d.DateGetTimeStamp(view.visStart);
      _e = _M.f.d.DateGetTimeStamp(view.visEnd);

      // 전체 카테고리 재조회인 경우 기존 일정을 먼저 비운다.
      if (targetCalName == undefined) {
        var targetEvent = _calArea.fullCalendar("getEvents");
        _calArea.fullCalendar("removeEvents");
      }

      // 2. 좌측 카테고리 체크박스 중 선택된 항목을 순회하며 각각의 서비스/메서드로 일정을 비동기 조회한다.
      $(".calChkArea input[type='checkbox']", _Obj).each(function (
        index,
        value
      ) {
        var calinfo = $(this);
        if (calinfo.is(":checked")) {
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
            var allDayFlag = calinfo.attr("allDayFlag");
            var service = calinfo.attr("service");
            var methodUpdate = calinfo.attr("methodUpdate");
            var methodDelete = calinfo.attr("methodDelete");
            var methodRead = calinfo.attr("methodRead");

            PostJsonData(
              _M.svcUrl[_M.Webtype].crudUrl,
              pl,
              function (_data) {
                if (_data.resultData.length > 0) {
                  // 3. 조회된 일정 레코드들을 eventList 배열로 일괄 조립한 뒤 addEventSource로 한 번에 렌더링한다 (렌더링 속도 개선).
                  var eventList = new Array();
                  $.each(_data.resultData, function (index, row) {
                    var event = new Object();

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

                    event.title = $.decHTML(row.title);
                    event.id = classType + row.id;
                    event.className = classType;
                    event.start = _from;
                    event.end = _to;
                    event.sticker = row.sticker;

                    // DB 조회 결과에 allDayFlag('1'/'0')가 있으면 우선 적용하고, 없으면 구조체 기본값을 따른다.
                    if (row.allDayFlag != undefined) {
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

                    eventList.push(event);
                  });

                  // 조립된 일정 배열을 FullCalendar 이벤트 소스로 일괄 추가한다.
                  _calArea.fullCalendar("addEventSource", eventList);

                  if (_json.afterListCallBack != undefined)
                    eval(_json.afterListCallBack)(_Obj);
                }
              },
              function (response) {},
              _M.aSync.async
            );
          }
        }
      });
    },

    /**
     * 단건 일정을 FullCalendar 화면에 즉시 추가(renderEvent)한다.
     *
     * @param {string} Title 일정 제목
     * @param {string} id 일정 고유 키값
     * @param {Date|string} fromDatetime 시작 일시
     * @param {Date|string} endDatetime 종료 일시
     * @param {Object} eventParam 카테고리명, 색상, 편집 가능 여부, 연결 viewJson 등 부가 속성 객체
     */
    CalShow: function (Title, id, fromDatetime, endDatetime, eventParam) {
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

    /**
     * FullCalendar가 각 일정 블록(element)을 렌더링할 때 시간(eventTimeCss), 제목(eventTitleCss), 스티커(sticker) 아이콘 스타일을 적용한다.
     *
     * @param {Object} event FullCalendar 이벤트 데이터 객체
     * @param {jQuery} element 렌더링되는 일정 DOM 엘리먼트
     */
    CalRender: function (event, element) {
      var _Obj = $(this).parents(".SuperCalendar");
      var sticker = event.sticker;

      // 1. 일정 시간 영역 아이콘 스타일 적용 (시간 영역이 없는 종일 일정은 제목 영역에 대체 적용)
      if (undefined != event.eventTimeCss) {
        var _elementName = "span.fc-event-time";
        if (
          element.find(_elementName).text() == undefined ||
          element.find(_elementName).text() == ""
        ) {
          _elementName = "span.fc-event-title";
        }
        _Obj.superContaner(
          "CalSetEventStyle",
          element,
          _elementName,
          event.eventTimeCss
        );
      }

      // 2. 일정 제목 영역 아이콘 스타일 적용
      if (undefined != event.eventTitleCss) {
        _Obj.superContaner(
          "CalSetEventStyle",
          element,
          "span.fc-event-title",
          event.eventTitleCss
        );
      }

      // 3. 일정 스티커 아이콘 표시
      if (sticker != undefined) {
        _Obj.superContaner(
          "CalSetEventStyle",
          element,
          "div.fc-event-inner",
          sticker
        );
      }
    },

    /**
     * 일정 엘리먼트 내부의 지정된 선택자(elementName)에 아이콘 클래스(cssName)와 툴팁 타이틀이 포함된 HTML을 삽입한다.
     *
     * @param {jQuery} element 일정 DOM 엘리먼트
     * @param {string} elementName 대상 하위 선택자 ('div.fc-event-inner', 'span.fc-event-title', 'span.fc-event-time')
     * @param {string} cssName 적용할 아이콘 CSS 클래스명
     */
    CalSetEventStyle: function (element, elementName, cssName) {
      var tagStr = "";
      if (elementName == "div.fc-event-inner") {
        // 스티커 아이콘을 일정 내부 컨테이너 앞에 추가한다.
        tagStr +=
          "<span class='icon calicon " +
          cssName +
          " align-middle'></span>" +
          element.find("div.fc-event-inner").html();
      } else {
        // 시간 또는 제목 텍스트 앞에 아이콘을 추가하고 마우스 오버 title 툴팁을 부여한다.
        tagStr +=
          "<span class='icon calicon " +
          cssName +
          " align-middle'></span>" +
          "<span class='eventHead align-middle' title='" +
          element.find(elementName).text() +
          "'>" +
          element.find(elementName).text() +
          "</span>";
      }
      eventElem = element.find(elementName);
      eventElem.html(tagStr);
    },

    /**
     * 달력 날짜 셀 클릭 이벤트 핸들러 (FullCalendar dayClick 콜백 연동용).
     *
     * @param {Date} date 클릭된 날짜
     * @param {boolean} allDay 종일 여부
     * @param {Event} jsEvent 브라우저 네이티브 이벤트
     * @param {Object} view FullCalendar View 객체
     * @param {jQuery} obj 컨테이너 객체
     */
    CalDayClick: function (date, allDay, jsEvent, view, obj) {},

    /**
     * 달력에 표시된 일정을 클릭했을 때 상세 조회/수정 팝업을 오픈하고 팝업 종료 시 해당 카테고리 일정을 갱신한다.
     *
     * @param {Object} calEvent 클릭된 FullCalendar 이벤트 객체 (editable, viewJson, eventKey, className 포함)
     * @param {Event} jsEvent 브라우저 네이티브 이벤트
     * @param {Object} view FullCalendar View 객체
     * @param {jQuery} obj 컨테이너 객체
     */
    CalClick: function (calEvent, jsEvent, view, obj) {
      var _Obj = $(this).parents(".SuperCalendar");
      var _calArea = $(this).parents(".calArea");

      // 편집 가능(editable == true) 일정인 경우 조회/수정 겸용 팝업(ShowReadEditJson)을 호출한다.
      if (calEvent.editable == true) {
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
              );
            } else {
              $(this).superContaner("CalendarListParent");
            }
          },
          true
        );
      } else {
        // 읽기 전용 일정인 경우 조회 전용 팝업(ShowReadOnlyJson)을 호출한다.
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

    /**
     * 일정 렌더링 완료 직후 호출되는 FullCalendar eventAfterRender 훅 핸들러.
     */
    CalAfterRender: function (event, element, view) {},

    /**
     * 일정 드래그 종료 시 호출되는 FullCalendar eventDragStop 훅 핸들러.
     */
    CalDragStop: function (event, jsEvent, ui, view, obj) {},

    /**
     * 일정 기간 리사이즈 종료 시 호출되는 FullCalendar eventResizeStop 훅 핸들러.
     */
    CalReSizeStop: function (event, jsEvent, ui, view, obj) {},

    /**
     * 달력에서 날짜/시간 영역을 선택하여 새 일정을 등록할 때 편집 가능한 캘린더 수에 따라 즉시 입력 팝업을 열거나 입력폼 선택 팝업을 표시한다.
     *
     * @param {Date} start 선택된 시작 일시
     * @param {Date} end 선택된 종료 일시
     * @param {boolean} allDay 종일 일정 여부
     */
    CalAdd: function (start, end, allDay) {
      var _Obj = $(".SuperCalendar");
      var _json = _Obj.data("jsonData");
      var _calArea = _Obj.find(".calArea");
      var view = _calArea.fullCalendar("getView");

      // 1. 구조체에 정의된 캘린더 중 편집 가능(editable !== false)한 캘린더 개수를 확인한다.
      var targetCalendar;
      var targetCalendarCnt = 0;

      for (var i = 0; i < _json.calendars.length; i++) {
        if (
          true == _json.calendars[i].editable ||
          undefined == _json.calendars[i].editable
        ) {
          targetCalendarCnt++;
          targetCalendar = _json.calendars[i];
        }
      }

      // 2. 편집 가능한 캘린더가 1개뿐이면 즉시 해당 캘린더의 상세 등록 팝업(CalShowDetail)을 오픈한다.
      if (targetCalendarCnt == 1) {
        $(document.body).find(".kcontextMenu").remove();
        $(this).superContaner(
          "CalShowDetail",
          _Obj,
          _calArea,
          targetCalendar,
          start,
          end,
          allDay
        );
      } else if (targetCalendarCnt > 1) {
        // 3. 편집 가능한 캘린더가 2개 이상이면 사용자가 입력할 캘린더 양식을 선택할 수 있는 모달 다이얼로그를 표시한다.
        var popTitle = "입력 폼 선택 팝업";
        $(document.body).find(".kcontextMenu").remove();
        $(document.body).append(
          "<div class='kcontextMenu calendarViewPopup' ></div>"
        );

        var _calListTag = $('<div class="row"></div>').appendTo(
          $(document.body).find(".kcontextMenu")
        );
        $('<a class="Label">입력 폼 선택</a>').appendTo(_calListTag);

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

        // 입력 폼 선택 다이얼로그 오픈
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
                );
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

    /**
     * 선택된 캘린더 카테고리의 신규 일정 등록 팝업($.ShowCalEditJson)을 열고, 저장 완료 후 해당 캘린더 일정을 재조회한다.
     *
     * @param {jQuery} _Obj SuperCalendar 컨테이너 객체
     * @param {jQuery} _calArea FullCalendar(.calArea) 객체
     * @param {Object} targetCalendar 등록 대상 캘린더 설정 객체 (viewJson, name 포함)
     * @param {Date} start 시작 일시
     * @param {Date} end 종료 일시
     * @param {boolean} allDay 종일 여부
     */
    CalShowDetail: function (
      _Obj,
      _calArea,
      targetCalendar,
      start,
      end,
      allDay
    ) {
      var parentKey = _calArea.data("keyValue");

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
              $(this).superContaner("CalList", view, _Obj, targetCalendar.name);
            } else {
              $(this).superContaner("CalendarListParent");
            }
          }
        );
      }
    },

    /**
     * 일정을 드래그하여 다른 날짜/시간에 드롭했을 때 변경된 일시를 백엔드에 업데이트(CalUpdate)한다.
     */
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
      var _Obj = $(this).parents(".SuperCalendar");
      _Obj.superContaner("CalUpdate", event);
    },

    /**
     * 일정 블록의 끝을 드래그하여 기간(종료 일시)을 리사이즈했을 때 변경된 일시를 백엔드에 업데이트(CalUpdate)한다.
     */
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
      var _Obj = $(this).parents(".SuperCalendar");
      if (event.end == undefined) {
        // 하루짜리 일정 리사이즈 시 종료일(end)이 비어 있으면 시작일(start)로 보정한다.
        event.end = event.start;
      }
      _Obj.superContaner("CalUpdate", event);
    },

    /**
     * 드래그 이동(CalDrop) 또는 기간 변경(CalResize)된 일정의 시작/종료 일시와 종일 여부를 백엔드에 동기 저장한다.
     *
     * @param {Object} updateEvent 변경된 FullCalendar 이벤트 객체
     */
    CalUpdate: function (updateEvent) {
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
        function (_data) {},
        function (response) {
          alert(response.Message);
        },
        _M.aSync.sync
      );
    },

    /**
     * 달력 영역(calArea)에서 전체('all') 또는 특정 카테고리('className')의 일정 소스를 제거한다.
     *
     * @param {jQuery} calArea FullCalendar(.calArea) 객체
     * @param {string} [opt] 삭제 옵션 ('all' 또는 'className')
     * @param {string} [value] 클래스명 조건값
     */
    CalClear: function (calArea, opt, value) {
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
    },

    /**
     * 상위 부모 컨테이너에서 행 선택 등으로 키값(key)이 전달되었을 때 하위 연동 달력(subCalendar)의 일정을 재조회한다.
     *
     * @param {string} [key] 상위 부모 레코드 키값 (미전달 시 기존에 저장된 keyValue 사용)
     */
    CalendarListParent: function (key) {
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
  });
})(jQuery);
