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
 * MonArch CRM 트리(SuperTree) 렌더링 및 노드 이벤트 제어 코어 모듈
 *
 * [모듈 개요]
 * - 기존 jquery.kdb.superContaner.js 내부에 포함되어 있던 jsTree 기반 트리 컴포넌트
 *   메서드 4종을 독립 모듈(js/core/jquery.kdb.core.superTree.js)로 분리한 파일이다.
 * - $.fn.superContaner.treeMethods 네임스페이스에 메서드를 등록하며,
 *   호출 시 superContaner 본체 디스패처에서 본 모듈의 메서드로 위임(apply) 실행된다.
 *
 * [제공 메서드 목록 (총 4종)]
 * 1. superTree    : 트리 컨테이너(SuperTree) 초기화, 권한 검사(SecurityCheck), 상단 작업 버튼 생성 및 TreeList 호출
 * 2. TreeList     : jsTree 플러그인을 초기화하고 루트(rootMethod)/자식(childrenMethod) 노드 동적 로딩 및 초기 펼침 레벨 제어
 * 3. openTreeNode : 설정된 초기 펼침 단계(openParentsLevel)까지 트리 노드를 재귀적으로 오픈
 * 4. TreeClick    : 트리 노드 선택(select_node.jstree) 시 연결된 메인 뷰(mainViewID: SuperView/SuperOlap/SuperiFrame/SuperTable) 연동 조회
 */
// 20261106 khma : superContaner.js 트리(superTree) 컴포넌트 모듈 분리 추출 (js/core 표준 구조 적용)
// 20261110 khma : 모듈 개요, 메서드별 상세 Javadoc 및 내부 로직 단계별 설명 주석 보강
(function ($) {
  // 20261106 khma : 상위 플러그인(superContaner) 선행 로드 여부 검증
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superTree.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  // 20261106 khma : 트리 전용 메서드 네임스페이스 초기화
  if (!$.fn.superContaner.treeMethods) {
    $.fn.superContaner.treeMethods = {};
  }

  $.extend($.fn.superContaner.treeMethods, {
    /**
     * 트리 컨테이너(SuperTree) 폼을 초기화하고 권한 확인 및 작업 버튼 생성 후 트리 목록(TreeList)을 로드한다.
     *
     * @param {string|Object} option 화면 구조체 JSON 명칭 또는 구조체 옵션 객체
     */
    superTree: function (option) {
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
        option = OlapList;
      }

      // 2. 컨테이너 DOM에 구조체 옵션을 바인딩하고 SuperTree 클래스를 부여한다.
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperTree");

      // 3. 화면 구조체 권한 검사(SecurityCheck)를 수행한다.
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }

      // 4. 상단 작업 버튼 영역(.jobArea)을 생성하고 버튼을 렌더링한다.
      var _jobTr = $(
        "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
      ).appendTo(_Obj);
      _Obj.makeButtons(_jobTr);

      // 5. 컨테이너 너비를 설정하고 jsTree 기반 트리 목록(TreeList)을 생성한다.
      if (option.bodyWidth > 0) _Obj.css("width", option.bodyWidth);
      _Obj.superContaner("TreeList");
    },

    /**
     * jsTree 라이브러리를 이용하여 트리 영역(#treeArea)을 생성하고 백엔드 데이터(루트/하위 노드) 및 클릭 이벤트를 바인딩한다.
     *
     * @param {number} [type] 조회 구분 ([0]: root, [1]: children)
     */
    TreeList: function (type) {
      var _Obj = $(this);

      // 1. 기존 트리 영역(#treeArea)이 있으면 제거하고 새로 생성한다.
      $("#treeArea", _Obj).remove();
      $("<div id='treeArea'></div>").appendTo(_Obj);

      // 2. 구조체 내 treeOptions 설정값(서비스명, 루트/자식 조회 메서드, 컨텍스트 메뉴 여부, 펼침 옵션 등)을 추출한다.
      var option = _Obj.data("jsonData");
      var pl = new JSONClientParameters();
      var treeOpt = option.treeOptions;
      var service = treeOpt.service;
      var rootMth = treeOpt.rootMethod;
      var ChldMth = treeOpt.childrenMethod;
      var useMenu = treeOpt.useMenu;
      var viewJson = treeOpt.viewJson;
      var expandAll = treeOpt.expandAll;
      var openParentsLevel = treeOpt.openParentsLevel;
      var height = option.bodyHeight;

      $("#treeArea", _Obj).css({
        height: height,
        overflow: "auto",
      });

      // 3. jsTree 활성화 플러그인 목록을 구성한다 (useMenu 옵션 시 contextmenu 추가).
      var plugins = ["themes", "json_data", "search"];
      if (useMenu) {
        plugins.push("contextmenu");
      }

      // 4. jsTree 인스턴스를 생성하고 노드 확장 시마다 루트(rootMth) 또는 자식(ChldMth) 데이터를 비동기 조회한다.
      $("#treeArea", _Obj)
        .jstree({
          core: {
            data: function (obj, callbackFn) {
              pl.add("service", service);
              if (obj.parent == null) {
                // 최상위 루트 노드 조회
                pl.add("method", rootMth);
              } else {
                // 특정 부모 노드의 하위 자식 노드 조회
                pl.add("method", ChldMth);
                pl.add(treeOpt.keyName, obj.id);
              }

              PostJsonData(
                _M.svcUrl[_M.Webtype].crudUrl,
                pl,
                function (_data) {
                  // 자식 노드 건수(children > 0)를 boolean으로 변환하여 jsTree 확장 아이콘 표시 여부를 결정한다.
                  if (_data.resultData.length > 0) {
                    $.each(_data.resultData, function (idx, data) {
                      if (data.children > 0) {
                        data.children = true;
                      } else {
                        data.children = false;
                      }
                    });
                  }
                  callbackFn(_data.resultData);
                },
                function (response) {
                  if (typeof loader !== "undefined" && loader && loader.remove) {
                    loader.remove();
                  }
                  _Obj.superContaner("tableShowMessage", response);
                },
                _M.aSync.async
              );
            },
          },
          plugins: plugins,
        })
        .bind("loaded.jstree", function (event, data) {
          // 5. 트리 초기 로드 완료 시 전체 펼침(expandAll) 또는 지정 레벨 펼침(openParentsLevel)을 수행한다.
          var jsTreeObj = $(this);
          if (expandAll) {
            // 우선순위 1위: 모든 노드 일괄 펼치기
            $(this).jstree("open_all");
          } else if (isNotEmpty(openParentsLevel) && openParentsLevel > 0) {
            // 우선순위 2위: 지정된 부모 레벨(openParentsLevel)까지 재귀적으로 노드 펼치기
            var currLevel = 0;
            $.each($("#treeArea li"), function (idx, val) {
              _Obj.superContaner(
                "openTreeNode",
                jsTreeObj,
                $(this).attr("id"),
                openParentsLevel,
                currLevel
              );
            });
          }
        });

      // 6. 트리 노드 선택(클릭) 시 상세 화면 연동(TreeClick) 이벤트를 바인딩한다.
      $("#treeArea", _Obj).on("select_node.jstree", function (event, data) {
        _Obj.superContaner("TreeClick", data.node);
      });
    },

    /**
     * 지정된 목표 깊이(openLevel)까지 트리 노드를 재귀적으로 열어 하위 노드를 표시한다.
     *
     * @param {jQuery} jsTreeObj jsTree 인스턴스가 바인딩된 jQuery 객체
     * @param {string} nodeId 펼칠 대상 노드의 DOM ID
     * @param {number} openLevel 목표로 하는 최대 펼침 레벨 깊이
     * @param {number} currLevel 현재 탐색 중인 레벨 깊이
     */
    openTreeNode: function (jsTreeObj, nodeId, openLevel, currLevel) {
      var _Obj = $(this);
      currLevel++;
      if (openLevel >= currLevel) {
        var targetId = "#" + nodeId;
        jsTreeObj.jstree(
          "open_node",
          targetId,
          function (obj) {
            // 현재 노드가 열린 후 자식 노드들을 순회하며 목표 레벨까지 재귀 호출한다.
            $.each(obj.children, function (idx, val) {
              _Obj.superContaner(
                "openTreeNode",
                jsTreeObj,
                val,
                openLevel,
                currLevel
              );
            });
          },
          false
        );
      }
    },

    /**
     * 트리 노드를 클릭했을 때 선택된 노드 ID(node.id)를 연결된 대상 컨테이너(mainViewID)로 전달하여 상세 데이터를 조회한다.
     *
     * @param {Object} node jsTree에서 선택된 노드 객체 (id 속성 포함)
     */
    TreeClick: function (node) {
      var _Obj = $(this);
      var option = _Obj.data("jsonData");
      var _keyvalue = node.id;

      // 구조체에 연동 대상 뷰(mainViewID)가 지정되어 있으면 대상 컨테이너 유형에 맞는 조회 메서드를 호출한다.
      if (option.mainViewID != undefined) {
        if ($(option.mainViewID).hasClass("SuperView")) {
          $(option.mainViewID).superContaner("Read", _keyvalue);
        } else if ($(option.mainViewID).hasClass("SuperOlap")) {
          $(option.mainViewID).superContaner("olapRead", _keyvalue);
        } else if ($(option.mainViewID).hasClass("SuperiFrame")) {
          $(option.mainViewID).superContaner("iFrameRead", _keyvalue);
        } else if ($(option.mainViewID).hasClass("SuperTable")) {
          $(option.mainViewID).superContaner("tableListParent", _keyvalue);
        }
      }
    },
  });
})(jQuery);
