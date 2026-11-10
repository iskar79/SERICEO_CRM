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
 * MonArch CRM 차트(SuperChart) 폼 생성 및 데이터 시각화 코어 모듈
 *
 * [모듈 개요]
 * - 기존 jquery.kdb.superContaner.js 내부에 포함되어 있던 차트(Flot $.plot 기반 pie/line/bar 차트)
 *   컴포넌트 메서드 3종을 독립 모듈(js/core/jquery.kdb.core.superChart.js)로 분리한 파일이다.
 * - $.fn.superContaner.chartMethods 네임스페이스에 메서드를 등록하며,
 *   호출 시 superContaner 본체 디스패처에서 본 모듈의 메서드로 위임(apply) 실행된다.
 *
 * [제공 메서드 목록 (총 3종)]
 * 1. superChart    : 차트 컨테이너(SuperChart) 초기화, 상단 검색 필터(SuperFilter) 테이블 및 작업 버튼 영역 생성, 자동 실행(ChartList) 연동
 * 2. ChartList     : 검색 필터 조건 및 상위 부모 조건(ParentData/parentKey)을 취합하여 백엔드 차트 데이터를 비동기 조회
 * 3. ChartShowData : 조회된 결과 배열(_rows)을 차트 유형(pie / line / bar)에 맞게 가공하여 본문(.body)에 차트 렌더링
 */
// 20261106 khma : superContaner.js 차트(superChart) 컴포넌트 모듈 분리 추출 (js/core 표준 구조 적용)
// 20261110 khma : 모듈 개요, 메서드별 상세 Javadoc 및 내부 로직 단계별 설명 주석 보강
(function ($) {
  // 20261106 khma : 상위 플러그인(superContaner) 선행 로드 여부 검증
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superChart.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  // 20261106 khma : 차트 전용 메서드 네임스페이스 초기화
  if (!$.fn.superContaner.chartMethods) {
    $.fn.superContaner.chartMethods = {};
  }

  $.extend($.fn.superContaner.chartMethods, {
    /**
     * 차트 컨테이너(SuperChart)의 검색 필터 테이블, 작업 버튼, 차트 본문 영역을 생성하고 초기 조회를 수행한다.
     *
     * @param {string|Object} option 화면 구조체 JSON 명칭 또는 구조체 옵션 객체
     * @param {jQuery} [parentObj] 호출한 상위 부모 컨테이너 객체
     */
    superChart: function (option, parentObj) {
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
      var _theme = "";
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }

      // 2. 컨테이너 DOM에 구조체 옵션 및 상위 객체 참조(parentObj)를 저장하고 SuperChart 클래스를 적용한다.
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperChart")
        .addClass(_theme);
      if (parentObj != undefined) {
        _Obj.data("parentObj", parentObj);
      }

      // 3. 화면 구조체 권한 검사(SecurityCheck)를 수행한다.
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }

      // 4. 상단 헤더(.head) 및 검색 필터 테이블(SuperFilter)의 컬럼 폭(colgroup)을 생성한다.
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      var _table = $(
        "<table class='SuperFilter SuperFilter-bg b-t b-r b-b b-l b-co b-co-basic'></table>"
      ).appendTo(_head);

      var _colgroup = $("<colgroup></colgroup>").appendTo(_table);
      $.each(option.filterView.colgroup, function (index, value) {
        if (value == undefined) return;
        $("<col width='" + value.LabelWidth + "' />").appendTo(_colgroup);
        $("<col width='" + value.DataWidth + "' />").appendTo(_colgroup);
      });
      var _colCount = option.filterView.colgroup.length * 2;

      // 5. 검색 필터 테이블의 행(TR)과 셀(TD: group / note / 일반 라벨+입력필드)을 동적으로 생성한다.
      var _vGroup = "";
      $.each(option.filterView.tr, function (index, value) {
        if (value == undefined) return;
        var tr = $("<tr class='b-t b-r b-b b-l b-co b-co-basic'></tr>")
          .appendTo(_table)
          .attr("group", _vGroup);
        var tdCount = 0;

        $.each(value.TD, function (index, value) {
          if (value == undefined) return;
          var _colspan =
            value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
          tdCount += _colspan;
          switch (value.type) {
            case "group":
              // 그룹 헤더 셀 생성
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
              // 안내 문구(Note) 셀 생성
              $(
                "<td class='fldNote fldNote-bg fldNote-ft'>" +
                  value.label +
                  "</td>"
              )
                .appendTo(tr)
                .attr("colspan", _colspan + 1);
              break;
            default:
              // 라벨 표시용 TD 및 입력 컨트롤 표시용 TD 생성 후 fieldGen으로 개별 필드를 렌더링한다.
              var _tdlable = $(
                "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft '></td>"
              )
                .appendTo(tr)
                .html(value.label)
                .attr("title", value.label);
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
        // 행 내 부족한 셀 개수만큼 빈 TD를 채워 테이블 열 정렬을 맞춘다.
        for (var i = tdCount; i < _colCount; i++) {
          $("<td></td>").appendTo(tr);
        }

        tr.attr("group", _vGroup);
      });
      Bordercontroll();

      // 6. 작업 버튼 영역(.jobArea), 차트 본문(.body), 하단(.foot), 상태줄(.status) 영역을 생성한다.
      var _jobArea = $(
        "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
      ).appendTo(_head);
      _Obj.makeButtons(_jobArea);

      var _body = $("<div class='body body-bg'></div>").appendTo(_Obj);
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);

      var _foot = $("<div class='foot none'>foot</div>").appendTo(_Obj);
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      // 7. 행 선택 체크박스(isRowSelect) 및 행 번호(isRowNum) 옵션에 따른 컬럼 노출 제어
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

      // 8. 본문 크기 및 각 UI 영역(필터, 버튼, 푸터, 상태바) 표시 여부를 설정한다.
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      if (option.bodyWidth > 0) _body.css("width", option.bodyWidth);

      $(".SuperFilter", _Obj).toggle(option.isShowFilter);
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".foot", _Obj).toggle(option.isShowFoot);
      $(".status", _Obj).toggle(option.isShowStatus);

      // 9. 로드 완료 콜백(LoadCallBack) 실행 및 자동 조회(isAutoRun) 설정 시 ChartList를 호출한다.
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
      if (option.isAutoRun) {
        $(document).ready(function () {
          _Obj.superContaner("ChartList");
        });
      }
    },

    /**
     * 검색 필터 조건과 상위 컨테이너 조건을 취합하여 백엔드에서 차트 데이터를 조회한 뒤 ChartShowData를 호출한다.
     *
     * @param {Object} [ListOption] 목록 조회 부가 옵션
     * @param {string} [trKey] 선택된 행 키값
     */
    ChartList: function (ListOption, trKey) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      var _tbody = $(".body", _Obj);

      // 1. 상단 필터 영역의 입력값들을 파라미터 객체(pl)로 수집한다.
      var pl = _Obj.superContaner("tableGetFilter");
      pl.add("service", _json.service);
      pl.add("method", _json.method.List);

      // 2. 상위 컨테이너에서 전달된 외부 조건(ParentData) 및 부모 키(parentKeyValue)가 있으면 파라미터에 추가한다.
      if (_Obj.data("ParentData") != undefined) {
        var _ext = _Obj.data("ParentData");
        var ppl = _ext.toArray();
        for (var p in ppl) {
          pl.add(p, ppl[p]);
        }
      }
      if (_json.parentKey != undefined) {
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add(_json.parentKey, _Obj.attr("parentKeyValue"));
        }
      }

      // 3. 백엔드 CRUD 서비스를 비동기 호출하여 데이터 존재 시 ChartShowData로 차트를 그린다.
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

    /**
     * 조회된 결과 데이터(_rows)를 구조체의 ChartType(pie / line / bar)에 맞춰 Flot($.plot) 차트로 시각화한다.
     *
     * @param {Array<Object>} _rows 백엔드에서 조회된 결과 데이터 행 배열
     * @param {Object} [ListOption] 차트 렌더링 부가 옵션
     */
    ChartShowData: function (_rows, ListOption) {
      var _Obj = $(this);
      var _json = _Obj.data("jsonData");
      var data = [];

      // 1. 원형(pie) 차트 데이터 구성 및 렌더링
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

      // 2. 선형(line) 시계열 차트 데이터 구성 및 렌더링
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

      // 3. 막대(bar) 차트 데이터 구성 및 렌더링
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
