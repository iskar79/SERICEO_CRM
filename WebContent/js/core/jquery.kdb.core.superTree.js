/* jQuery grid plugin:
* version 2.0 2026-11-06
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

// 20261106 khma : superContaner.js 트리(superTree) 컴포넌트 모듈 분리 추출 (js/core 표준 구조 적용)
(function ($) {
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superTree.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  if (!$.fn.superContaner.treeMethods) {
    $.fn.superContaner.treeMethods = {};
  }

  $.extend($.fn.superContaner.treeMethods, {
    /* ------------------------------------------------------- */
    /* superTree 폼생성 */
    /* ------------------------------------------------------- */
    superTree: function (option) {
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
        option = OlapList;
      }
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperTree");
      /* ----------------------------------------------------------------------------- */
      // 구조체권한검색
      /* ----------------------------------------------------------------------------- */
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }
      /* 잡버턴생성 dmjung now */
      var _jobTr = $(
        "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
      ).appendTo(_Obj);
      _Obj.makeButtons(_jobTr);

      // 20140409 JWKIM jstree로 트리 라이브러리 변경
      if (option.bodyWidth > 0) _Obj.css("width", option.bodyWidth);
      _Obj.superContaner("TreeList"); // 20140409 JWKIM jstree로 트리 라이브러리 변경
    },

    TreeList: function (type) {
      // type: [0]:root, [1]:children

      var _Obj = $(this);
      $("#treeArea", _Obj).remove();
      $("<div id='treeArea'></div>").appendTo(_Obj); // tree영역 작성

      // 트리옵션
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
      var plugins = ["themes", "json_data", "search"];
      if (useMenu) {
        plugins.push("contextmenu");
      }

      $("#treeArea", _Obj)
        .jstree({
          core: {
            data: function (obj, callbackFn) {
              pl.add("service", service);
              if (obj.parent == null) {
                pl.add("method", rootMth);
              } else {
                pl.add("method", ChldMth);
                pl.add(treeOpt.keyName, obj.id);
              }

              PostJsonData(
                _M.svcUrl[_M.Webtype].crudUrl,
                pl,
                function (_data) {
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
          var jsTreeObj = $(this);
          if (expandAll) {
            // 우선순위 1위
            $(this).jstree("open_all"); // 모두 펼치기
          } else if (isNotEmpty(openParentsLevel) && openParentsLevel > 0) {
            // 초기표시오픈 레벨
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

      // 트리 클릭 이벤트 바인딩
      $("#treeArea", _Obj).on("select_node.jstree", function (event, data) {
        _Obj.superContaner("TreeClick", data.node);
      });
    },

    openTreeNode: function (jsTreeObj, nodeId, openLevel, currLevel) {
      var _Obj = $(this);
      currLevel++;
      if (openLevel >= currLevel) {
        var targetId = "#" + nodeId;
        jsTreeObj.jstree(
          "open_node",
          targetId,
          function (obj) {
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

    TreeClick: function (node) {
      var _Obj = $(this);
      var option = _Obj.data("jsonData");
      var _keyvalue = node.id;
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
