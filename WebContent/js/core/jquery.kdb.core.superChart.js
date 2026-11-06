/* jQuery grid plugin:
* version 2.0 2026-11-06
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

// 20261106 khma : superContaner.js 차트(superChart) 컴포넌트 모듈 분리 추출 (js/core 표준 구조 적용)
(function ($) {
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superChart.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  if (!$.fn.superContaner.chartMethods) {
    $.fn.superContaner.chartMethods = {};
  }

  $.extend($.fn.superContaner.chartMethods, {
    /* ------------------------------------------------------- */
    /* superChart 폼생성 */
    /* ------------------------------------------------------- */
    superChart: function (option, parentObj) {
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
      var _theme = "";
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperChart")
        .addClass(_theme);
      // 호출한 상위객체정보를 저장한다.
      if (parentObj != undefined) {
        _Obj.data("parentObj", parentObj);
      }
      /* ----------------------------------------------------------------------------- */
      // 구조체권한검색
      /* ----------------------------------------------------------------------------- */
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }
      /* ----------------------------------------------------------------------------- */
      // 외곽디자인 구성
      /* ----------------------------------------------------------------------------- */
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      var _table = $(
        "<table class='SuperFilter SuperFilter-bg b-t b-r b-b b-l b-co b-co-basic'></table>"
      ).appendTo(_head);
      /* ----------------------------------------------------------------------------- */
      // 테이블 컬럼생성
      /* ----------------------------------------------------------------------------- */
      var _colgroup = $("<colgroup></colgroup>").appendTo(_table);
      $.each(option.filterView.colgroup, function (index, value) {
        if (value == undefined) return;
        $("<col width='" + value.LabelWidth + "' />").appendTo(_colgroup);
        $("<col width='" + value.DataWidth + "' />").appendTo(_colgroup);
      });
      var _colCount = option.filterView.colgroup.length * 2;
      /* ----------------------------------------------------------------------------- */
      // 테이블 TR/TD테그 생성
      /* ----------------------------------------------------------------------------- */
      var _vGroup = "";
      $.each(option.filterView.tr, function (index, value) {
        if (value == undefined) return;
        var tr = $("<tr class='b-t b-r b-b b-l b-co b-co-basic'></tr>")
          .appendTo(_table)
          .attr("group", _vGroup);
        var tdCount = 0;
        // TD테그생성
        $.each(value.TD, function (index, value) {
          if (value == undefined) return;
          var _colspan =
            value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
          tdCount += _colspan;
          switch (value.type) {
            case "group":
              // GROUP TD 생성
              $(
                "<td colspan='" +
                  _colCount +
                  "'><a class='icon i-20 icon-viewgroup align-middle'></a><span class='align-middle'>" +
                  value.label +
                  "</span></td>"
              ).appendTo(tr);
              tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
              _vGroup = value.name;
              break;
            case "note":
              // Note TD 생성
              $(
                "<td class='fldNote fldNote-bg fldNote-ft'>" +
                  value.label +
                  "</td>"
              )
                .appendTo(tr)
                .attr("colspan", _colspan + 1);
              break;
            default:
              // 라벨표시용 TD생성
              var _tdlable = $(
                "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft '></td>"
              )
                .appendTo(tr)
                .html(value.label)
                .attr("title", value.label);
              // 필드표시용 TD생성
              var _tdData = $(
                "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
              )
                .appendTo(tr)
                .attr("colspan", _colspan);
              $.each(value.fieldContaner, function (index, value) {
                _Obj.superContaner("fieldGen", _tdData, value);
              });
              break;
          }
        });
        for (var i = tdCount; i < _colCount; i++) {
          $("<td></td>").appendTo(tr);
        }

        tr.attr("group", _vGroup);
      });
      Bordercontroll();
      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성
      /* ----------------------------------------------------------------------------- */
      var _jobArea = $(
        "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
      ).appendTo(_head);
      _Obj.makeButtons(_jobArea);

      /* ----------------------------------------------------------------------------- */
      // Body생성
      /* ----------------------------------------------------------------------------- */
      var _body = $("<div class='body body-bg'></div>").appendTo(_Obj);
      // 레코드 영역의 크기
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      /* ----------------------------------------------------------------------------- */
      // foot생성
      /* ----------------------------------------------------------------------------- */
      var _foot = $("<div class='foot none'>foot</div>").appendTo(_Obj);
      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      /* ----------------------------------------------------------------------------- */
      // isRowSelect: false, // 선택체크박스를 표시할지 결정함
      /* ----------------------------------------------------------------------------- */
      if (!option.isRowSelect) {
        $(".body col:eq(0)", _Obj).toggleClass("none");
        $(".body col:eq(0)", _Obj).next().toggleClass("none");
        $(".body thead tr th:nth-child(1)", _Obj).toggleClass("none");
        $(".body thead tr th:nth-child(1)", _Obj).next().toggleClass("none");
        $(".body tbody tr td:nth-child(1)", _Obj).toggleClass("none");
        $(".body tbody tr td:nth-child(1)", _Obj).next().toggleClass("none");
      }
      if (!option.isRowNum) {
        $(".body col:eq(2)", _Obj).toggleClass("none");
        $(".body col:eq(2)", _Obj).next().toggleClass("none");
        $(".body thead tr th:nth-child(3)", _Obj).toggleClass("none");
        $(".body thead tr th:nth-child(3)", _Obj).next().toggleClass("none");
        $(".body tbody tr td:nth-child(3)", _Obj).toggleClass("none");
        $(".body tbody tr td:nth-child(3)", _Obj).next().toggleClass("none");
      }

      // 레코드 영역의 크기
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      if (option.bodyWidth > 0) _body.css("width", option.bodyWidth);

      // 필터표시여부 결정
      $(".SuperFilter", _Obj).toggle(option.isShowFilter);
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".foot", _Obj).toggle(option.isShowFoot);
      $(".status", _Obj).toggle(option.isShowStatus);
      /* ----------------------------------------------------------------------------- */
      // 자동실행여부 판단
      /* ----------------------------------------------------------------------------- */
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
      if (option.isAutoRun) {
        $(document).ready(function () {
          _Obj.superContaner("ChartList");
        });
      }
    },

    ChartList: function (ListOption, trKey) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      var _tbody = $(".body", _Obj);

      var pl = _Obj.superContaner("tableGetFilter");
      pl.add("service", _json.service);
      pl.add("method", _json.method.List);

      // 상위에서 전달된 외부조건 추가로 설정합니다.
      if (_Obj.data("ParentData") != undefined) {
        var _ext = _Obj.data("ParentData");
        var ppl = _ext.toArray();
        for (var p in ppl) {
          pl.add(p, ppl[p]);
        }
      }
      // parent 키가 있는 경우 해당 정보를 조건에 추가한다.
      if (_json.parentKey != undefined) {
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add(_json.parentKey, _Obj.attr("parentKeyValue"));
        }
      }

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          if (_data.resultData.length > 0) {
            _Obj.superContaner("ChartShowData", _data.resultData, ListOption);
            if (_json.afterListCallBack != undefined)
              eval(_json.afterListCallBack)(_Obj);
          } else {
            _Obj.superContaner("tableShowMessage", "0 Records ...");
          }
        },
        function (response) {
          alert(response.Message);
        },
        _M.aSync.async
      );
    },

    /* ------------------------------------------------------- */
    /* 데이터를 표에 표시 */
    /* ------------------------------------------------------- */
    ChartShowData: function (_rows, ListOption) {
      var _Obj = $(this);
      var _json = _Obj.data("jsonData");
      // 레코드만큼 반복하면서 데이터를 바인딩한다
      var data = [];

      if (_json.ChartType == "pie") {
        $.each(_rows, function (index, row) {
          data[index] = {
            label: row[_json.keyName],
            data: row[_json.order],
          };
        });

        $.plot($(".body", _Obj), data, {
          series: {
            pie: {
              show: true,
              radius: 1,
              label: {
                show: true,
                radius: 2 / 3,
                formatter: function (label, series) {
                  return (
                    '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                    label +
                    "<br/>" +
                    Math.round(series.percent) +
                    "%</div>"
                  );
                },
                threshold: 0.1,
              },
            },
            grow: {
              active: false,
            },
          },
          grid: {
            hoverable: true,
            clickable: true,
          },

          legend: {
            show: true,
          },
        });
      }
      if (_json.ChartType == "line") {
        $.each(_rows, function (index, row) {
          var _o = row[_json.keyName];
          _o = eval(_o.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));
          data.push([_o, row[_json.order]]);
        });

        $.plot($(".body", _Obj), [data], {
          series: {
            lines: {
              show: true,
            },
            points: {
              show: true,
            },
          },
          xaxis: {
            mode: "time",
            timeformat: "%y-%m-%d",
            minTickSize: [1, "day"],
          },
        });
      }
      if (_json.ChartType == "bar") {
        $.each(_rows, function (index, row) {
          data.push([index + 1, row[_json.order] * 100]);
        });

        $.plot($(".body", _Obj), [data], {
          series: {
            points: {
              show: true,
            },
            stack: 0,
            lines: {
              show: false,
              steps: false,
            },
            bars: {
              show: true,
              barWidth: 0.8,
              align: "center",
            },
          },
          xaxis: {
            ticks: [
              [1, "One"],
              [2, "Two"],
              [3, "Three"],
              [4, "Four"],
              [5, "Five"],
            ],
          },
        });
      }
    },
  });
})(jQuery);
