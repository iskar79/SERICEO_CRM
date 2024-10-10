/// <reference path="jquery.kdb.MonArch800.js" />
/// <reference path="../Resource.js" />
/// <reference path="MonArchResource.js" />

/*
 * superContaner
 *
 * version 0.1 2016-03-10
 * Requires jQuery v1.4.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Kim Seoung Min
 * Company : Kongyoung DB
 */

// ---------------------------------------------------------------------
// 전역변수 선언
// ---------------------------------------------------------------------
var formCID = 0; // 폼의 고유객체번호를 만듬.
var map; // 지도서비스
var _superContanerRemoteMode = false;

// ---------------------------------------------------------------------
// TopMenu UserName Click 이벤트 정의
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// TopMenu LogOut Click 이벤트 정의
// ---------------------------------------------------------------------
// $(document).on("click", ".icon-logout", function(e) {
$(document).on("click", ".opticon-logout", function (e) {
  $.ajax({
    type: "POST",
    url: "logoutProcess.mon",
    data: "",
    success: function (data) {
      sessionStorage.removeItem("authValue");
      //alert("로그아웃 되었습니다.");
      window.location.href = "http://" + window.location.host + "/"; // 해쉬URL정보
      // 클리어
    },
    error: function (data) {
      alert(data.resultInfo.message);
    },
  });
  // 메니져 오프
  //kdbSocketManager.disconnect();

  // 채팅 윈도우 및 관련 UI 제거
  // $('.chat-basic, .window-notification, .window-chatting').remove();

  // $('#TopMenu ul').remove(); //TopMenu 제거
  // $('#SubMenu ul').remove(); //SupMenu 제거
  // $('#head ul').hide(); //알림숨김
  // $("#TbName").html(''); //Title제거

  // Content 제거
  // $('#Flowtop').html('');
  // $('#LeftTopList').html('');
  // $('#LeftMainList').html('');
  // $('#LeftMainView').html('');
  // $('#LeftBottomView').html('');
  // $('#TopList').html('');
  // $('#MainList').html('');
  // $('#MainView').html('');
  // $('#BottomView').html('');

  // clearUserInfo();
  /*
   * _M.UserInfo.id = ''; _M.UserInfo.name = ''; $.cookie('UKEY', '', { path:
   * '/' }); $.cookie('UID', '', { path: '/' }); $.cookie('UNM', '', { path:
   * '/' }); _M.UserInfo.key = ''; _M.UserInfo.lid = ''; _M.UserInfo.SID = '';
   * _M.UserInfo.depart = ''; _M.UserInfo.departnm = ''; _M.UserInfo.cardcd =
   * ''; _M.UserInfo.dvl = '0'; //SSO쿠키도 삭제 20170803 khma //
   * /$.cookie('ssoUID', null); $.cookie('ssoUID','', { path: '/' });
   */
  // _M.SubMenu = {};
  // location.reload();
  // $.Login(function (e) {
  // var _href = window.location.href;
  // if (_href.indexOf('monmobile') > 0) {
  // // $('#head').superContaner('setGoMenu','1010');
  // // $('#head ul').show();
  // // $('.ui-username').show();
  // // $('.ui-direction').show();
  // } else {
  // $('#TopMenu').controlsMenu('cacheSubMenu');
  // $('#head').controlsMenu('setStartMenu');
  // $('#TopMenu').controlsMenu('setHead');
  // $('#head ul').show();
  // $('.ui-username').show();
  // $('.ui-direction').show();
  // }
  // });
  // 2014.03.11 dmjung :: menu 좌측, 상단 레이아웃 옵션 추가가 되면서, 초기화 해야 할 요소 초기화.
  // jquery.kdb.Controls.Menu.js 396 번 줄에 초기화 처리와 같이 적용해야 정상적으로 동작함.
  // $(document.body).find('.Mon').removeClass('layoutTop').removeClass('layoutLeft')
  // .find('.Holder').css('margin-top', '0px');
  // :: end ::

  // window.location.hash = ''; //해쉬URL정보 클리어
});

// ---------------------------------------------------------------------
// TopMenu 정보수정 Click 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("click", ".opticon-config", function (e) {
  $.ShowReadEditJson(
    "MON_COM_사용자정보POPUP_TBL",
    _M.UserInfo.id,
    function () {}
  );
});
// ---------------------------------------------------------------------
// TopMenu 정보수정 Click 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("change", ".selsite", function (e) {
  var selsite = $(this).val();
  $.cookie("gSite", selsite);
  var pl = new JSONClientParameters();
  pl.add("ID", _M.UserInfo.id);
  pl.add("SITE", selsite);
  //$.SvcCallPl("공통서비스", "UPDATE사이트변경", pl, function (data) {
  $.SvcCallPl("MON_COMMON", "CHANGE_GSITE", pl, function (data) {}, false);

  location.reload();
});
// ---------------------------------------------------------------------
// TopMenu 비밀번호수정 Click 이벤트 정의
// ---------------------------------------------------------------------
/*
 * $(document).on("click", ".iconset2", function (e) {
 * $.ShowReadEditJson("사용자비밀번호수정ViewJson", _M.UserInfo.id, function () { }); });
 */ // 사용자 개인정보 수정에 통합함 jwkim 20180325
// ---------------------------------------------------------------------
// SupersuperContanerView live 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("click", ".ActionCmd", function (e) {
  setPrevActGbn(undefined, undefined, $(this).find("input").attr("value")); // 로그용
  // 액션로그데이터
  // 셋팅
  $(this).superContaner("ActionCmd", $(this));
});
// 전체선택 ------------------------------------------------------------
$(document).on("change", ".SuperTable .body .trChkAll input", function (e) {
  var _Obj = $(this).parents(".SuperTable");
  $(".body tbody tr td:nth-child(1) input", _Obj)
    .prop("checked", $(this).is(":checked"))
    .trigger("change"); // 2018.10.16
  // dmjung ::
  // 확장필터 체크박스까지
  // 체크처리되서 .body
  // 셀렉터 상위에 추가
  e.stopPropagation();
});
$(document).on("click", ".SuperTable .tbody tr td input", function (e) {
  var _Obj = $(this).parents(".SuperTable");
  var list = $(this)
    .parents("tbody.tbody")
    .find("tr td:nth-child(1) input:not(:checked)");
  if (list.length > 0) {
    $(".body .trChkAll input", _Obj).prop("checked", false);
  } else if (list.length == 0) {
    $(".body .trChkAll input", _Obj).prop("checked", true);
  }
  e.stopPropagation();
});
// 컬럼정렬선택 ------------------------------------------------------------
$(document).on("click", ".SuperTable .body thead th", function (e) {
  if (e.target == $("input", $(this))[0]) {
  } else if ($(e.target).hasClass("trChkAll")) {
  } else {
    if (!$(this).hasClass("resizeBar")) {
      $(this).parents(".SuperTable").superContaner("thClick", $(this), event);
    }
    // alert("해드클릭 " + $(this).text());
  }
});
// Data레코드선택 ----------------------------------------------------------
$(document).on("click", ".SuperTable .body tbody tr", function (event) {
  setPrevActGbn(undefined, undefined, "상세조회"); // 로그용 액션로그데이터 셋팅
  $(this).parents(".SuperTable").superContaner("trClick", $(this), event);
});
// Data레코드 Double Click 선택 --------------------------------------------
$(document).on("dblclick", ".SuperTable .body tbody tr", function (event) {
  $(this).parents(".SuperTable").superContaner("trDblClick", $(this), event);
});
// Cell선택 ------------------------------------------------------------
$(document).on("click", ".SuperTable .body tbody tr td", function (event) {
  _clickAction = $(this).attr("clickAction");
  $(this).parents(".SuperTable").superContaner("tdClick", $(this), event);
  if (
    $(this).attr("checkbox") == "ROWSELECT" ||
    $(this).attr("field") == "ROWNUM"
  ) {
    event.stopPropagation();
  }
  if (_clickAction != undefined) {
    event.stopPropagation();
  }
});
$(document).on(
  "click",
  ".SuperTable .body tbody tr .ActionIsUsed",
  function (event) {
    alert("ActionIsUse를 클릭함");
  }
);

$(document).on("change", ".SuperTable .pgLCnt", function (event) {
  $(this).parents(".SuperTable").superContaner("ChangePgCnt", $(this), event);
});
// 페이지 이동 클릭시
$(document).on("click", ".SuperTable .pgnum", function (event) {
  setPrevActGbn(undefined, undefined, "페이지이동"); // 로그용 액션로그데이터 셋팅
  $(this).parents(".SuperTable").superContaner("ChangePage", $(this), event);
  var _st = $(".SuperTable .body .trChkAll input").attr(
    "checked",
    $(this).is(":checked")
  );
});
// 레코드 개별 체크 ------------------------------------------------------------
$(document).on(
  "change",
  ".SuperTable .body tbody tr td[checkbox]  input:nth-child(1)",
  function (e) {
    var _tr = $(this).parents("tr");
    $("tr", _tr.parent()).removeClass("SelectTR bg-c1d1e1");
    _tr.addClass("SelectTR bg-c1d1e1");

    if ($(this).is(":checked")) {
      _tr.attr("selected", "selected");
    } else {
      _tr.removeAttr("selected");
    }
  }
);
// 작업명령선택
$(document).on("click", ".SuperTable .jobArea .cmdspan", function (e) {
  setPrevActGbn(undefined, undefined, $(this).find("input").attr("value")); // 로그용 액션로그데이터 셋팅
  $(this)
    .parents(".SuperTable")
    .superContaner("jobClick", $(this).find("input"));
  // var _st = $(".SuperTable .body .trChkAll input").attr('checked',
  // $(this).is(":checked"));
  // var _Obj = _st.parents('.SuperTable');
  // $('tbody tr td:nth-child(1) input', _Obj).attr('checked',
  // $(this).is(":checked")).trigger('change');
});
$(document).on("click", ".SuperTable .jobBottomArea .cmdspan", function (e) {
  setPrevActGbn(undefined, undefined, $(this).find("input").attr("value")); // 로그용 액션로그데이터 셋팅
  $(this)
    .parents(".SuperTable")
    .superContaner("jobClick", $(this).find("input"));
});
$(document).on("mouseover", ".SuperTable .jobArea .cmdspan", function (e) {
  if ($(this).find("span").hasClass("btn-block")) {
  } else {
    $(this).addClass("over-span");
  }
});
$(document).on("mouseout", ".SuperTable .jobArea .cmdspan", function (e) {
  $(this).removeClass("over-span");
});
$(document).on(
  "keydown",
  ".SuperTable .SuperFilter .fieldContaner",
  function (e) {
    _Obj = $(this).parents(".SuperTable");
    var option = _Obj.data("jsonData");
    var _inComm = "";
    if (option != undefined) {
      for (var i = 0; i < option.jobs.length; i++) {
        if (option.jobs[i].index.toUpperCase() == "LIST") {
          _inComm = option.jobs[i].inComm;
        }
      }
    }
    if (e.keyCode == "13") {
      $(this).trigger("change");
      if ($(this).attr("type") != "linkKey") {
        if (_inComm != "") {
          _Obj.superContaner("List", $(this));
        } else {
          // SuperTable Filter 에서 Enter 입력시, inComm 명령 사용안할떄
          // List버튼 click되도록
          $(".cmdbtn[index='List']", _Obj).trigger("click");
        }
      }
    }
  }
);

$(document).on("mouseover", ".SuperTable .body tbody tr img ", function (e) {
  var _o = $(this);
  var _Obj = _o.parents(".SuperTable");
  var _json = _Obj.data("jsonData");
  if (_json.isImageView) $.ShowImg(_o);
});

$(document).on("mouseover", ".SuperGallery .body li img", function (e) {
  var _o = $(this);
  var _Obj = _o.parents(".SuperGallery");
  var _json = _Obj.data("jsonData");

  if (_json.isImageView) $.ShowImg(_o);
});
$(document).on("change", ".SuperGallery .pgLCnt", function (event) {
  $(this)
    .parents(".SuperGallery")
    .superContaner("ChangePgCntGallery", $(this), event);
});
$(document).on("click", ".SuperGallery .pgnum", function (event) {
  $(this)
    .parents(".SuperGallery")
    .superContaner("ChangePageGallery", $(this), event);
});
$(document).on("click", ".SuperGallery .jobArea .cmdbtn", function (e) {
  if ($(this).attr("incomm") == "ListGallery") {
    $(this).parents(".SuperGallery").superContaner("jobClick", $(this));
  }
});
$(document).on("click", ".SuperGallery .body li", function (event) {
  $(this)
    .parents(".SuperGallery")
    .superContaner("GalleryClick", $(this), event);
});

// ---------------------------------------------------------------------
// SuperView live 이벤트 정의
// ---------------------------------------------------------------------
// 그룹활성이벤트
$(document).on("click", ".SuperView .viewGroup", function (e) {
  _group = $(this).attr("group");
  $("tr[group='" + _group + "']", $(this).parent()).toggle();
  $(this).toggle();
  $(this).toggleClass("is-active");
});
// 작업버턴 클릭이벤트
// $(document).on("click", ".SuperView > table > tbody > .jobArea > td >
// .cmdspan", function(e) { //20180122 CSS최적화 작업으로 변경
$(document).on(
  "click",
  ".SuperView > .jobArea > .buttonset >.cmdspan",
  function (e) {
    setPrevActGbn(undefined, undefined, $(this).find("input").attr("value")); // 로그용 액션로그데이터 셋팅
    $(this)
      .parents(".SuperView:eq(0)")
      .superContaner("jobClick", $(this).find("input"));
  }
);
// $(document).on("click", ".SuperView > table > tbody > .jobArea > td >
// .cmdspan", function(e) { //20180122 CSS최적화 작업으로 변경
$(document).on(
  "click",
  ".SuperView > table > tbody > .jobAreaTR >.jobBottomArea >.buttonset > .cmdspan",
  function (e) {
    $(this)
      .parents(".SuperView:eq(0)")
      .superContaner("jobClick", $(this).find("input"));
  }
);

$(document).on(
  "click",
  ".fieldContaner[type='img'] .fieldView img",
  function (e) {
    $.ImgPopUp($(this).attr("src"));
  }
);

$(document).on("click", ".SuperContaner .tabhead", function (e) {
  _SubItem = $(this).next("div");
  _SubItem.toggle();
});

// 파일추가용 레코드
$(document).on(
  "click",
  ".SuperView .fieldContaner[type='file'] .fieldEdit .fileSelectBox",
  function (e) {
    var _file = $(this).parents(".fieldEdit");
    $.GetFile(function (url, filename) {
      _o = $(".fldfiledown", _file);
      var _htm = "";
      if (url == "") {
        _htm = "<a>파일없음</a>";
      } else {
        _htm = "<a href='" + url + "'>다운로드</a>";
      }
      _o.attr("src", url).html(_htm).trigger("change");
    });
  }
);


// 계약파일 추가 레코드 20240619
$(document).on(
  "click",
  ".SuperView .fieldContaner[type='signfile'] .fieldEdit .fileSelectBox",
  function (e) {
    var _file = $(this).parents(".fieldEdit");
    var fileSearchKey = _file.find("#fileSearchKey").attr("value");
    var extenders;
    if (undefined != _file.data("extenders")) {
      extenders = _file.data("extenders");
    }

    var container = $(this).parents(".fieldContaner");
    var column = container.attr("field");

    var jobType = _file.attr("jobType");
    //if (undefined == jobType || "" == jobType) {
      // 작업종류가 없으면 경고창 표시후 처리 종료
      //alert("파일속성에 작업종류(jobType)가 설정되지 않았습니다.");
      //return false;
    //}

    var viewStat = $(this).parents(".SuperView").attr("ViewStatus");
    if ("N" != viewStat) {
      var option = $(this).parents(".SuperView").data("jsonData");
      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Update);
      pl.add(option.keyName, $(this).parents(".SuperView").attr("keyvalue"));
      pl.add(column, fileSearchKey);

      //PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {
        $.GetSignFile(jobType, fileSearchKey, extenders, function () {
          var _Obj = _file.parents(".SuperView ");
          _Obj.superContaner("GetSignFileList", _file, jobType, fileSearchKey);
        });
      //});
    } else {
      $.GetSignFile(jobType, fileSearchKey, extenders, function () {
        var _Obj = _file.parents(".SuperView ");
        _Obj.superContaner("GetSignFileList", _file, jobType, fileSearchKey);
      });
    }
  }
  
);


// 멀티파일추가용 레코드(LG하우시스 적용분)
$(document).on(
  "click",
  ".SuperView .fieldContaner[type='multifile'] .fieldEdit .fileSelectBox",
  function (e) {
    var _file = $(this).parents(".fieldEdit");
    var fileSearchKey = _file.find("#fileSearchKey").attr("value");
    var extenders;
    if (undefined != _file.data("extenders")) {
      extenders = _file.data("extenders");
    }

    var container = $(this).parents(".fieldContaner");
    var column = container.attr("field");

    var jobType = _file.attr("jobType");
    if (undefined == jobType || "" == jobType) {
      // 작업종류가 없으면 경고창 표시후 처리 종료
      alert("파일속성에 작업종류(jobType)가 설정되지 않았습니다.");
      return false;
    }

    var viewStat = $(this).parents(".SuperView").attr("ViewStatus");
    if ("N" != viewStat) {
      var option = $(this).parents(".SuperView").data("jsonData");
      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Update);
      pl.add(option.keyName, $(this).parents(".SuperView").attr("keyvalue"));
      pl.add(column, fileSearchKey);

      PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {
        $.GetFileManager(jobType, fileSearchKey, extenders, function () {
          var _Obj = _file.parents(".SuperView ");
          _Obj.superContaner("GetMultiFileList", _file, jobType, fileSearchKey);
        });
      });
    } else {
      $.GetFileManager(jobType, fileSearchKey, extenders, function () {
        var _Obj = _file.parents(".SuperView ");
        _Obj.superContaner("GetMultiFileList", _file, jobType, fileSearchKey);
      });
    }
  }
);

// ---------------------------------------------------------------------
// SuperOlap live 이벤트 정의
// ---------------------------------------------------------------------
/*
 * $(document).on("click", ".SuperOlap .head .jobArea .cmdbtn", function(e) { //
 * 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함 var _Obj =
 * $(this).parents('.SuperOlap'); _Obj.superContaner('jobClick', $(this)); });
 */
// ---------------------------------------------------------------------
// SuperiFrame live 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("click", ".SuperiFrame .head .jobArea .cmdbtn", function (e) {
  // 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함
  var _Obj = $(this).parents(".SuperiFrame");
  _Obj.superContaner("jobClick", $(this));
});
// 필드영역 이벤트정의
$(document).on("change", ".SuperTable .fieldContaner", function (e) {
  // 해당컨테이너의 속의 필드설정을 통하여 value 속성값을 채운다
  var _Obj = $(this);
  if (_Obj.attr("type") == "datetimeBetween") {
    var _fi = "";
    var _fs1 = "";
    var _fs2 = "";
    var _ti = "";
    var _ts1 = "";
    var _ts2 = "";
    $(".fieldEdit", _Obj).each(function (index, value) {
      if (index == 0) {
        _fi = $("input", $(this));
        _fs1 = $("select:eq(0)", $(this));
        _fs2 = $("select:eq(1)", $(this));
      } else if (index == 1) {
        _ti = $("input", $(this));
        _ts1 = $("select:eq(0)", $(this));
        _ts2 = $("select:eq(1)", $(this));
      }
    });

    if (_fi.val() == _ti.val()) {
      if (_fs1.val() > _ts1.val()) {
        _ts1.val(lPadZero(_fs1.val() * 1 + 1, 2));
      }
      if (_fs1.val() >= _ts1.val() && _fs2.val() >= _ts2.val()) {
        _ts2.val(lPadZero(_fs2.val() * 1 + 5, 2));
      }
    }
  }
  _Obj.superContaner("ContanerChangeTable");
});

$(document).on("change", ".SuperView .fieldContaner", function (e) {
  // 해당컨테이너의 속의 필드설정을 통하여 value 속성값을 채운다
  var _Obj = $(this);
  if (_Obj.attr("type") == "datetimeBetween") {
    var _fi = "";
    var _fs1 = "";
    var _fs2 = "";
    var _ti = "";
    var _ts1 = "";
    var _ts2 = "";
    $(".fieldEdit", _Obj).each(function (index, value) {
      if (index == 0) {
        _fi = $("input", $(this));
        _fs1 = $("select:eq(0)", $(this));
        _fs2 = $("select:eq(1)", $(this));
      } else if (index == 1) {
        _ti = $("input", $(this));
        _ts1 = $("select:eq(0)", $(this));
        _ts2 = $("select:eq(1)", $(this));
      }
    });

    if (_fi.val() == _ti.val()) {
      if (_fs1.val() > _ts1.val()) {
        _ts1.val(lPadZero(_fs1.val() * 1 + 1, 2));
      }
      if (_fs1.val() >= _ts1.val() && _fs2.val() >= _ts2.val()) {
        _ts2.val(lPadZero(_fs2.val() * 1 + 5, 2));
      }
    }
  }
  _Obj.superContaner("ContanerChange");
});

$(document).on("blur", ".fieldContaner", function (e) {
  // 해당컨테이너의 속의 필드설정을 통하여 value 속성값을 채운다
  var _Obj = $(this);
  _Obj.superContaner("ContanerBlur");
});

$(document).on("click", ".fieldContaner[type='iconcheck']", function (e) {
  var fieldContaner = $(this);
  var _oc = fieldContaner.find(".cmdicon");
  if (_oc.hasClass(fieldContaner.attr("unselectIcon"))) {
    _oc
      .removeClass(fieldContaner.attr("unselectIcon"))
      .addClass(fieldContaner.attr("selectIcon"));
  } else {
    _oc
      .removeClass(fieldContaner.attr("selectIcon"))
      .addClass(fieldContaner.attr("unselectIcon"));
  }
  fieldContaner.trigger("change");
});

$(document).on("click", ".fieldContaner[type='multiiconcheck']", function (e) {
  var fieldContaner = $(this);
  var target = e.target.className;
  var type = fieldContaner.attr("type");

  if ($(e.target).hasClass("cmdicon") || $(e.target).hasClass("cmdiconLabel")) {
    var _oc = $(e.target).parent();
    if (_oc.find(".cmdicon").hasClass(fieldContaner.attr("unselectIcon"))) {
      _oc
        .find(".cmdicon")
        .removeClass(fieldContaner.attr("unselectIcon"))
        .addClass(fieldContaner.attr("selectIcon"));
    } else {
      _oc
        .find(".cmdicon")
        .removeClass(fieldContaner.attr("selectIcon"))
        .addClass(fieldContaner.attr("unselectIcon"));
    }
    fieldContaner.trigger("change");
  }
});

/*
 * $(document).on("keydown", ".fieldContaner", function(e) { // esc키를 누르면 수정전의
 * 상태로 복귀시킨다. _Obj = $(this); if (e.which == 27 && _Obj.hasClass('fldChange')) {
 * e.preventDefault(); _Obj.removeClass('fldChange');
 * _Obj.superContaner('setFieldValue', _Obj.attr('oldValue')); } });
 *
 * $(document).on("keyup", ".fieldContaner input", function(e) {
 * $(this).superContaner('ContanerKeyDown'); });
 */

// ---------------------------------------------------------------------
// SuperFlow live 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("click", ".SuperFlow li", function (e) {
  // 2014.03.03 dmjung :: 만약 선택된 플로우라면, 토글 기능 실행하지 않음.
  // MainList 를 토글하고, MainView 를 보고 있는 상태에서 같은 플로우를 선택할 경우
  // MainView 도 토글되기 때문에 화면에 아무 것도 없는 현상이 발생함.
  if ($(this).hasClass("on")) {
    return false;
  }

  // Flow일때 MainView toggle하기.
  option = $("#MainList").data("jsonData");
  if (option.mainViewToggle) {
    if (option.mainViewID != undefined) {
      $(option.mainViewID).toggle(false);
    }
  } else {
    $(option.mainViewID).toggle(true);
  }
  // flow형식이 맨 마지막에 동작해야함
});

$(document).on("click", ".SuperFlow strong", function (e) {
  if (_M.UserInfo.dvl > 0) {
    $(this).parents(".SuperFlow").superContaner("getJson");
  }
});

// ---------------------------------------------------------------------
// SuperTree live 이벤트 정의
// ---------------------------------------------------------------------

/*
 * //20140411 jwkim jstree 도입으로 인해 주석 처리 $(document).on("click", ".SuperTree li
 * a", function(e) { _Obj = $(this).parents('.SuperTree'); $('a',
 * _Obj).removeAttr('selected'); $(this).attr('selected', 'selected'); if
 * ($(this).parent().children('ul').length > 0) {
 * $(this).parent().children('ul').toggle(); if
 * ($(this).parent().children('ul').is(":hidden")) { $('span:first',
 * $(this).parent()).removeClass('ui-icon-circle-minus
 * icon-minus').addClass("ui-icon-circle-plus icon-plus"); } else {
 * $('span:first', $(this).parent()).removeClass('ui-icon-circle-plus
 * icon-plus').addClass("ui-icon-circle-minus icon-minus"); } if
 * ($(this).attr('nodekey') != undefined) { _Obj.superContaner('TreeClick',
 * $(this)); } e.stopPropagation(); } else { //alert($(this).attr('nodekey'));
 * _Obj.superContaner('TreeClick', $(this)); } });
 */
$(document).on("click", ".SuperTree .jobArea .cmdbtn", function (e) {
  // 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함
  var _Obj = $(this).parents(".SuperTree");
  _Obj.superContaner("jobClick", $(this));
});

// ---------------------------------------------------------------------
// SuperChart live 이벤트 정의
// ---------------------------------------------------------------------
/*
 * $(document).on("click", ".SuperChart .head .jobArea .cmdbtn", function(e) { //
 * 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함 var _Obj =
 * $(this).parents('.SuperChart'); _Obj.superContaner('jobClick', $(this)); });
 */

// ---------------------------------------------------------------------
// SuperMap live 이벤트 정의
// ---------------------------------------------------------------------
/*
 * $(document).on("click", ".SuperMap .head .jobArea .cmdbtn", function(e) { //
 * 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함 var _Obj = $(this).parents('.SuperMap');
 * _Obj.superContaner('jobClick', $(this)); });
 */
// ---------------------------------------------------------------------
// SuperCalendar live 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("click", ".SuperCalendar .head .jobArea .cmdbtn", function (e) {
  // 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함
  var _Obj = $(this).parents(".SuperCalendar");
  _Obj.superContaner("jobClick", $(this));
});

$(document).on("click", ".SuperContaner .SuperSecurityGetJson", function (e) {
  // 과제 : 상위테이블찾을때까지 parent()찾지 않도록 개선필요함
  var _Obj = $(this).parents(".SuperContaner");
  _Obj.superContaner("getJson");
});

// ---------------------------------------------------------------------
// Menu live 이벤트 정의
// ---------------------------------------------------------------------
$(document).on("mouseover", ".ky-menu li", function (e) {
  var _Obj = $(this);
  _option = $(this).data("submenu");
  _Obj.controlsMenu("setSubMenu", _option);
});
$(document).on("click", ".ky-menu li", function (e) {
  $("li", $(this).parent()).removeAttr("selected");
  $(this).attr("selected", "selected");
});

$(document).on("keydown", ".t_Number, .ilNumberOnly", function (e) {
  _ps = $(this).val().length - $(this)[0].selectionStart;
  _key = e.which;
  keychar = String.fromCharCode(_key);
  if (
    _key == null ||
    _key == 0 ||
    _key == 8 ||
    _key == 9 ||
    _key == 13 ||
    _key == 27 ||
    _key == 37 ||
    _key == 39 ||
    (_key >= 96 && _key <= 105)
  ) {
    return true;
  } else if ("0123456789+-.".indexOf(keychar) > -1) {
    _ps = $(this).val().length - $(this)[0].selectionStart;
  } else if (e.ctrlKey) {
    return true;
  } else {
    e.preventDefault();
  }
});

$(document).on("keyup", ".t_Number, .ilNumberOnly", function (e) {
  var val = $(this).val();
  $(this).val(val.replace(/[^0-9]/g, ""));
  $(this).trigger("change");
});

$(document).on("keydown", ".t_Money", function (e) {
  _ps = $(this).val().length - $(this)[0].selectionStart;
  _key = e.which;
  keychar = String.fromCharCode(_key);
  if (
    _key == null ||
    _key == 0 ||
    _key == 8 ||
    _key == 9 ||
    _key == 13 ||
    _key == 27 ||
    _key == 37 ||
    _key == 39 ||
    (_key >= 48 && _key <= 57) ||
    (_key >= 96 && _key <= 105) ||
    _key == 110 ||
    _key == 190
  ) {
    var obj = $(this);
    var val = obj.val();

    if (
      (_key == 110 || _key == 190) &&
      (obj.attr("decimalPlaces") == undefined || obj.attr("decimalPlaces") <= 0)
    ) {
      e.preventDefault();
    } else if (val.split(".").length > 2) {
      // 소수점 중복 체크
      e.preventDefault();
    } else if (
      ((_key >= 48 && _key <= 57) || (_key >= 96 && _key <= 105)) &&
      val.split(".").length == 2 &&
      obj.attr("decimalPlaces") > 0 &&
      obj.attr("decimalPlaces") <= val.split(".")[1].length
    ) {
      e.preventDefault();
    } else {
      return true;
    }
  } else if ("0123456789+-.".indexOf(keychar) > -1) {
    _ps = $(this).val().length - $(this)[0].selectionStart;
  } else if (e.ctrlKey) {
    return true;
  } else {
    e.preventDefault();
  }
});

$(document).on("keyup", ".t_Money", function (e) {
  var val = $(this).val();
  $(this).val(val.replace(/[^0-9.]/g, ""));

  if (isNotEmpty(val)) {
    $(this).setComma().trigger("change");
  }

  var maxleng = $(this).attr("maxlength");
  var val2 = $(this).val();
  if (isNotEmpty(maxleng)) {
    if (val2.length > maxleng) {
      var valLength = Number(val2.length) - Number(maxleng);
      var valLength2 = Number(val2.length) - Number(valLength);

      $(this).val(val2.substr(0, valLength2));
      $(this).setComma().trigger("change");
    }
  }
});
$(document).on("blur", ".t_Money", function (e) {
  var obj = $(this);
  var val = obj.val();
  if (val.substr(val.length - 1) == ".") {
    obj.val(val.substring(0, val.length - 1));
  }
});

(function ($) {
  $.fn.superContaner = function (method) {
    if (methods[method]) {
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery.tooltip");
    }
  };

  var methods = {
    /* ------------------------------------------------------- */
    /* superView폼생성 */
    /* ------------------------------------------------------- */
    superView: function (option, parentKeyValue) {
      var _Obj = $(this);
      var _jsonName = option;
      var listOption = $("#MainList").data("jsonData"); // 2018.10.07
      // dmjung ::
      // MainList 가 두
      // 개 이상 오는 경우가
      // 없을 때만 유효함..
      // 2018.10.23 dmjung :: List 영역에 SuperView 가 들어올 경우 listOption 이
      // undefined 되므로...
      if (listOption == undefined) {
        listOption = _Obj;
        listOption.isAutoRun = true;
        listOption.isAutoClick = true;
      }
      if (option.isEditMode == true && listOption.isAutoRun == true) {
        if (listOption.isAutoClick == true) {
          _Obj.attr("viewstatus", "E");
        } else {
          _Obj.attr("viewstatus", "N");
        }
      }
      if (option.isEditMode == false && listOption.isAutoRun == true) {
        if (listOption.isAutoClick == true) {
          _Obj.attr("viewstatus", "V");
        } else {
          _Obj.attr("viewstatus", "N");
        }
      }
      if (
        (option.isEditMode == true && listOption.isAutoRun == false) ||
        listOption.isAutoRun == undefined
      ) {
        if (listOption.isAutoClick == true) {
          _Obj.attr("viewstatus", "N");
        } else {
          _Obj.attr("viewstatus", "N");
        }
      }
      if (
        (option.isEditMode == false && listOption.isAutoRun == false) ||
        listOption.isAutoRun == undefined
      ) {
        if (listOption.isAutoClick == true) {
          _Obj.attr("viewstatus", "N");
        } else {
          _Obj.attr("viewstatus", "N");
        }
      }
      // _Obj.displayButtons(_Obj);

      if (typeof _jsonName == "string") {
        option = GETJSON(_jsonName);
        _Obj.attr("jsonName", _jsonName);
      }
      if (option == undefined) {
        option = eval(_jsonName);
      }
      if (option == undefined) {
        option = viewOption;
      }
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }

      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperView")
        .addClass(_theme)
        .attr("keyvalue", "");
      // superview 생성시 상위객체의 초기값이 전달된 경우라면 이를 기록해 두었다가
      // 값 초기화시에 해당 전달된 값을 초기값으로 설정한다.
      _Obj.attr("parentKeyValue", parentKeyValue);

      /* ----------------------------------------------------------------------------- */
      // 구조체권한검색
      /* ----------------------------------------------------------------------------- */
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }
      /* ----------------------------------------------------------------------------- */
      // 뷰 타이틀 영역
      /* ----------------------------------------------------------------------------- */
      if (option.title != undefined) {
        var _title = $("<div class='title title-bg title-ft'></div>").appendTo(
          _Obj
        );
        _title.html(option.title.text);
        _title.addClass(option.title.Css);
      }
      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성 (상단)
      /* ----------------------------------------------------------------------------- */

      var _jobDiv = $(
        "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
      ).appendTo(_Obj);
      _Obj.makeButtons(_jobDiv);

      /* ----------------------------------------------------------------------------- */
      // HTML 빠른생성
      /* ----------------------------------------------------------------------------- */
      if (option.isHtmlDown) {
        var InHtml = $.HtmlGet(_Obj.attr("jsonName"));
        _Obj.append(InHtml);
        $(".Tabs ul a", _Obj).each(function (index) {
          var _aobj = $(this);
          _aobj.click(function () {
            var _id = _aobj.attr("href");
            if ($(_id).hasClass("SuperTable")) {
              $(_id).superContaner("List");
            } else if ($(_id).hasClass("SuperView")) {
              $(_id).superContaner("viewParentKeyRefresh");
            }
          });
        });
        $.each($(".SuperContaner", _Obj), function (index, value) {
          if ($(this).hasClass("SuperTable")) {
            $(this).superContaner("superTableQ", $(this).attr("jsonName"));
          } else if ($(this).hasClass("SuperView")) {
            $(this).superContaner("superViewQ", $(this).attr("jsonName"));
          }
        });
        // var _tabs = $("<div class='Tabs'></div>").appendTo(_Obj);
        _Obj.find(".Tabs").tabs();
        if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
        return;
      }
      /* ----------------------------------------------------------------------------- */
      // superView 스크롤 활성화 시의 처리
      /* ----------------------------------------------------------------------------- */

      var _wrapper = $("<div class='ScrollableView'></div>").appendTo(_Obj);
      if (option.isScrollMode) {
        _wrapper.css("overflow-y", "auto").css("height", option.bodyHeight);
      }

      /* ----------------------------------------------------------------------------- */
      // 외곽디자인 구성
      /* ----------------------------------------------------------------------------- */
      var _table = $("<table></table>").appendTo(_wrapper);
      /* ----------------------------------------------------------------------------- */
      // 테이블 컬럼생성
      /* ----------------------------------------------------------------------------- */
      var _colgroup = $("<colgroup></colgroup>").appendTo(_table);
      $.each(option.colgroup, function (index, value) {
        if (value == undefined) return;
        $("<col width='" + value.LabelWidth + "' />").appendTo(_colgroup);
        $("<col width='" + value.DataWidth + "' />").appendTo(_colgroup);
      });
      _colCount = option.colgroup.length * 2;

      /* ----------------------------------------------------------------------------- */
      // 테이블 TR/TD테그 생성
      /* ----------------------------------------------------------------------------- */
      var _vGroup = "";
      var codes = new Array();
      var keys = "";
      var values = [];
      $.each(option.tr, function (index, value) {
        if (value == undefined) return;
        var tr = $("<tr class='tr b-t b-r b-b b-l b-co b-co-basic'></tr>")
          .appendTo(_table)
          .attr("group", _vGroup);
        if (value.css != undefined) tr.addClass(value.css);
        var toggleDefault = true;

        // TD테그생성
        $.each(value.TD, function (index, value) {
          if (value == undefined) return;
          _colspan =
            value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
          _rowspan = value.rowspan == undefined ? 1 : value.rowspan;
          switch (value.type) {
            case "group":
              if (true) {
                // GROUP TD
                // 생성
                _td = $(
                  "<td colspan='" +
                    _colCount +
                    "'><span class='icon i-20 icon-viewgroup align-middle'></span><span class='align-middle viewGroup-ft'>" +
                    value.label +
                    "</span></td>"
                ).appendTo(tr);
                tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
                if (value.toggleDefault != undefined) {
                  tr.attr("toggleDefault", value.toggleDefault);
                  toggleDefault = value.toggleDefault;
                } else {
                  toggleDefault = true;
                }
                if (toggleDefault === true) {
                  tr.addClass("is-active");
                } else {
                  tr.removeClass("is-active");
                }
                if (value.color != undefined)
                  _td.css("background-color", value.color);
                _vGroup = value.name;
              }
              break;
            case "note":
              if (true) {
                // Note TD
                // 생성
                _note = $(
                  "<td class='fldNote fldNote-bg fldNote-ft'>" +
                    value.label +
                    "</td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan + 1);
                if (value.color != undefined)
                  _note.css("background-color", value.color);
                if (value.css != undefined) _note.addClass(value.css);
              }
              break;
            default:
              if (true) {
                // ----------------------------------------------------------------------------------
                // 라벨표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdlable = $(
                  "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft'></td>"
                )
                  .appendTo(tr)
                  .html(value.label);
                if (value.labelCss != undefined)
                  _tdlable.addClass(value.labelCss);
                // ----------------------------------------------------------------------------------
                // 필드표시용 TD생성
                // ----------------------------------------------------------------------------------
                if (_colspan < 1) {
                  _tdlable.attr("colspan", 2);
                  var _tdData = _tdlable;
                  _tdlable.html("").css("text-align", "center");
                } else {
                  var _tdData = $(
                    "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
                  )
                    .appendTo(tr)
                    .attr("colspan", _colspan);
                }
                if (value.rowspan != undefined) {
                  _tdlable.attr("rowspan", value.rowspan);
                  _tdData.attr("rowspan", value.rowspan);
                }
                if (value.dataCss != undefined) _tdData.addClass(value.dataCss);
                $.each(value.fieldContaner, function (index, value) {
                  // if((value.type
                  // ==
                  // 'multiemail')
                  // ||
                  // (value.type
                  // ==
                  // 'multitel')
                  // ||
                  // (value.type
                  // ==
                  // 'multiaddress')){
                  // var
                  // check
                  // =
                  // _tdData.parents('.SuperView').data('jsonData');
                  // if
                  // (!check.jobType)
                  // {
                  // alert("jobType이
                  // 없습니다.");
                  // return
                  // false;
                  // }
                  // else
                  // { }
                  // }
                  if (
                    value.type == "select" &&
                    value.codes != undefined &&
                    value.codes != "" &&
                    value.codes.split(".").length == 1 &&
                    _M.Codes[value.codes] == undefined
                  ) {
                    keys += value.codes + ",";
                  }
                  codes.push(_tdData);
                  values.push(value);
                });
              }
              break;
          }
        });
        tr.attr("group", _vGroup);
        /* if (!toggleDefault) {
							tr.toggle(toggleDefault);
							alert();
						} */
      });

      if (keys != undefined && keys != "") {
        keys = keys.substring(0, keys.length - 1);
        $.SvcGetCodes(
          keys,
          function (data) {
            $.each(data.resultData, function (index, value) {
              if (_M.Codes[value.CODE_GRP] == undefined) {
                _M.Codes[value.CODE_GRP] = new Array();
              }
              var flag = false;
              $.each(_M.Codes[value.CODE_GRP], function (i, codegrp) {
                if (codegrp.CODE == value["CODE"]) {
                  flag = true;
                  return;
                }
              });
              if (!flag) {
                _M.Codes[value.CODE_GRP].push({
                  CODE: $.decHTML(value["CODE"]),
                  DECODE: $.decHTML(value["DECODE"]),
                  UPCODE: $.decHTML(value["UPCODE"]),
                });
              }
            });
          },
          _M.aSync.sync
        );
      }
      $.each(codes, function (index, value) {
        _Obj.superContaner("fieldGen", codes[index], values[index]);
      });
      Bordercontroll();
      _Obj
        .find(".viewGroup[toggleDefault='false']")
        .each(function (index, value) {
          _group = $(this).attr("group");
          $(this)
            .parent()
            .find("tr[group='" + _group + "']")
            .toggle();
          $(this).toggle();
        });

      _Obj.superContaner("modeChange", option.isEditMode); //

      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성 (하단)
      /* ----------------------------------------------------------------------------- */
      if (option.jobsBottom != undefined) {
        var _jobTr = $("<tr class='jobAreaTR'></tr>").appendTo(_table);
        var _jobTd = $(
          "<td class='jobBottomArea jobArea-bg'><div class='buttonset'></div></td>"
        )
          .appendTo(_jobTr)
          .attr("colspan", _colCount);
        _Obj.makeButtons(_jobTd, "true");
      }

      /* ----------------------------------------------------------------------------- */
      // Tab 생성
      /* ----------------------------------------------------------------------------- */
      if (option.tabs != undefined) {
        // tab형식으로 표현
        if (option.isTabMode) {
          // var _tabs = $("<div class='Tabs ui-tabs ui-widget
          // ui-widget-content ui-corner-all'></div>").appendTo(_Obj);
          // var _tabsUl = $("<ul class='ui-tabs-nav ui-helper-reset
          // ui-helper-clearfix ui-widget-header
          // ui-corner-all'></ul>").appendTo(_tabs);

          var tabSource =
            "<div class='Tabs ui-tabs ui-widget ui-widget-content ui-corner-all'>";
          tabSource +=
            "<ul class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all'></ul>";
          tabSource += "</div>";

          _Obj.append(tabSource);

          var _tabs = $("div.Tabs", _Obj);
          var _tabsUl = _tabs.find("ul.ui-tabs-nav");

          $.each(option.tabs, function (index, value) {
            if (value == undefined) return;
            var _divId = "tabs-" + formCID++; // 20180829
            // khma
            // var _id =
            // 'm_'+_M.PrevActGbn.currMenuId+':t_'+value.idx;
            var source = "<li class='ui-state-default ui-corner-top'>";
            source +=
              "<a href='#" + _divId + "' id='tabs'>" + value.name + "</a>";
            source += "</li>";
            var _tabsLi = $(source).appendTo(_tabsUl);
            var _tabsLiA = _tabsLi.find("a");

            if (!_superContanerRemoteMode) {
              if (index == 0) {
                var _tabsDiv = $(
                  "<div id='" +
                    _divId +
                    "'" +
                    (value.jobType != undefined
                      ? " jobType='" + value.jobType + "'"
                      : "") +
                    "></div>"
                ).appendTo(_tabs);
                _tabsDiv.superContaner(value.type, value.json, _Obj);
                tmpopt = _tabsDiv.data("jsonData");
                if (tmpopt.chartOpton != undefined) {
                  _tabsLiA.click(function () {
                    _tabsDiv
                      .find(".jobArea")
                      .find("input[incomm='List']")
                      .trigger("click");
                  });
                } else {
                  // s 2014.02.11 노은혜 : 탭클릭시
                  // AutoRun 방지기능
                  _tabsLiA.click(function () {
                    if (value.type == "superTable") {
                      var data = _tabsDiv.data("jsonData");
                      // 2014.11.26
                      // dmjung ::
                      // Tab 테이블의
                      // isAutuRun
                      // 옵션 처리 관련
                      // 조건.
                      if (
                        data.isAutoRun == true ||
                        data.isAutoRun == undefined
                      ) {
                        _tabsDiv.superContaner("List");
                      }
                    } else if (value.type == "superView") {
                      _tabsDiv.superContaner("viewParentKeyRefresh");
                    }
                  });
                }
              } else {
                // 처음 탭을 그릴 때 index != 0 인 탭에는
                // click이벤트를 넣는다.
                _tabsLiA.click(function () {
                  var _tabsDiv = $("#" + _divId, _tabs);
                  if (_tabsDiv.length < 1) {
                    _tabsDiv = $(
                      "<div id='" +
                        _divId +
                        "'" +
                        (value.jobType != undefined
                          ? " jobType='" + value.jobType + "'"
                          : "") +
                        "></div>"
                    ).appendTo(_tabs);
                    _tabsDiv.superContaner(value.type, value.json, _Obj);
                    _tabsDiv.attr("parentkeyvalue", _Obj.attr("keyvalue"));
                    $(_tabs).tabs("refresh");
                  }
                  tmpopt = _tabsDiv.data("jsonData");
                  if (tmpopt.chartOpton != undefined) {
                    _tabsDiv
                      .find(".jobArea")
                      .find("input[incomm='List']")
                      .trigger("click");
                  } else {
                    if (value.type == "superTable") {
                      var data = _tabsDiv.data("jsonData");
                      if (data.isAutoRun == true) {
                        _tabsDiv.superContaner("List");
                      }
                    } else if (value.type == "superView") {
                      _tabsDiv.superContaner("viewParentKeyRefresh");
                    }
                  }
                });
              }
            } else {
              // _tabsDiv.superContaner(value.type,
              // value.json, _Obj);
              var _tabsDiv = $(
                "<div id='" +
                  _divId +
                  "'" +
                  (value.jobType != undefined
                    ? " jobType='" + value.jobType + "'"
                    : "") +
                  "></div>"
              ).appendTo(_tabs);
              _tabsDiv.superContanerRemote(
                "superTableInit",
                {
                  jsonName: value.json,
                },
                function (e) {
                  tmpopt = _tabsDiv.data("jsonData");
                  if (tmpopt.chartOpton != undefined) {
                    _tabsLiA.click(function () {
                      _tabsDiv
                        .find(".jobArea")
                        .find("input[incomm='List']")
                        .trigger("click");
                    });
                  }
                  if (option.tabs.length == index + 1) {
                    $(_tabs).tabs();
                  }
                }
              );
            }
          });
          if (!_superContanerRemoteMode) {
            $(_tabs).tabs({
              // select: function (event, ui) { //탭선택시 해쉬정보 취득
              // 20180829 khma
              // location.hash = ui.tab.hash;
              // }
            });
          }
        } else {
          // 리스트 형식으로 표현
          var _tabs = $("<div class='TabLists'></div>").appendTo(_Obj);
          $.each(option.tabs, function (index, value) {
            if (value == undefined) return;
            var _id = "tabs-" + formCID++;
            var _tabItem = $("<div class='TabItem'></div>").appendTo(_tabs); // Tabset 부분
            // 원래 h3 였음
            $(
              "<div class='tabGroup tabGroup-bg tabGroup-ft'>" +
                "<a class='icon i-20 coloring coloring-tab align-middle'></a><a class='TabIconfold' style='display:none;'></a> " +
                value.name +
                "</div>"
            )
              .appendTo(_tabItem)
              .addClass(value.css == undefined ? "" : value.css)
              .click(function () {
                _tabsDiv.toggle();
                $(this).find(".TabIcon").toggle();
                $(this).find(".TabIconfold").toggle();
              });
            var _tabsDiv = $("<div id='" + _id + "'></div>").appendTo(_tabItem);
            _tabsDiv.superContaner(value.type, value.json, _Obj);
            if (value.jobType != undefined) {
              _tabsDiv.attr("jobType", value.jobType);
            }
          });
        }
      }
      // 레코드 영역의 크기
      if (option.bodyHeight > 0) _Obj.css("min-height", option.bodyHeight);
      if (option.bodyWidth > 0) _Obj.css("width", option.bodyWidth);
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );

      // Mainview Toggle시 toggle명령이 Table에만 있어서 최초에 View가 안사라져 추가.
      if (option.mainViewToggle) {
        if (option.mainListID != undefined) {
          _Obj.toggle(false);
          _Obj.attr("viewstatus", "N");
        }
      } else {
        _Obj.toggle(true);
      }

      _Obj.displayButtons(_Obj);
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);

      return _Obj;
    },

    superViewQ: function (option, parentKeyValue) {
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
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }

      $(this)
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperView")
        .addClass(_theme)
        .attr("keyvalue", "");
      // superview 생성시 상위객체의 초기값이 전달된 경우라면 이를 기록해 두었다가
      // 값 초기화시에 해당 전달된 값을 초기값으로 설정한다.
      $(this).attr("parentKeyValue", parentKeyValue);

      /* ----------------------------------------------------------------------------- */
      // 구조체권한검색
      /* ----------------------------------------------------------------------------- */
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }
      /* ----------------------------------------------------------------------------- */
      // HTML 빠른생성
      /* ----------------------------------------------------------------------------- */
      if (option.isHtmlDown) {
        var InHtml = $.HtmlGet(_Obj.attr("jsonName"));

        if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
        return;
      }
    },

    /* ------------------------------------------------------- */
    /* superTable 폼생성 */
    /* ------------------------------------------------------- */
    superTableQ: function (option, parentObj) {
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
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }
      // 20180124 jwkim start
      var sort = getSortOption(option.sort);
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperTable")
        .addClass(_theme)
        .attr("_viewpage", "1")
        .attr("_pagecnt", option.rowNum)
        .attr("_sort", sort)
        .attr("_order", option.order);
      // _Obj.data("jsonData",
      // option).removeClass().addClass('SuperContaner
      // SuperTable').addClass(_theme).attr("_order",
      // option.order).attr("_viewpage", "1").attr("_pagecnt",
      // option.rowNum);
      // 20180124 jwkim end
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
      // HTML 빠른생성
      /* ----------------------------------------------------------------------------- */
      if ($(".body tbody tr:last", _Obj).length == 0) {
        _Obj.superContaner("superTableQtr", option);
      }
      _Obj.data("TRdata", $(".body tbody tr:last", _Obj));
      $(".body tbody tr", _Obj).remove();
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
    },

    superTableQtr: function (option) {
      var _Obj = $(this);
      var _bodyTableTbody = $(this).find(".body tbody");

      var _bodyTableTbodyTr = $(
        "<tr class='tr b-t b-r b-b b-l b-co b-co-basic'></tr>"
      ).appendTo(_bodyTableTbody);
      $(
        "<td><input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic' type='checkbox' value='1' /></td>"
      ).appendTo(_bodyTableTbodyTr);
      $("<td></td>").appendTo(_bodyTableTbodyTr).attr("field", "ROWNUM");

      $.each(option.colModel, function (index, value) {
        if (value == undefined) return;
        var _name = value.name;
        var _label = value.label == undefined ? value.name : value.label;
        var _field = value.field == undefined ? value.name : value.field;

        var _td = $("<td></td>").appendTo(_bodyTableTbodyTr);

        _td.attr("name", _name);
        _td.attr("field", _field);
        _td.css("text-align", value.align);
        _td.attr("type", value.type);
        if (value.subfield) {
          _td.attr("subfield", value.subfield);
        }
        if (value.size != undefined) {
          if (value.size.width != undefined)
            _td.attr("sizewidth", value.size.width);
          if (value.size.height != undefined)
            _td.attr("sizeheight", value.size.height);
        }

        if (value.showText != undefined) _td.attr("showText", value.showText);
        if (value.dynamicCss != undefined)
          _td.attr("dynamicCss", value.dynamicCss);
        if (value.clickAction != undefined)
          _td.attr("clickAction", value.clickAction).addClass("tdAuction");

        if (value.css != undefined) _td.addClass(value.css);
        // if (value.css != undefined) _td.append("<span
        // class='"+value.css+"'></span>");
        if (value.mode != undefined) {
          _td.attr("mode", value.mode);
          if (value.mode == "edit") {
            _Obj.superContaner("fieldGen", _td, value);
          }
        }
      });

      if (option.isEditMode != undefined) {
        _Obj.superContaner("tableModeChange", option.isEditMode); //
      } else {
        _Obj.superContaner("tableModeChange", true); //
      }
      if (option.tdActions != undefined) {
        $.each(option.tdActions, function (index, value) {
          var _td = $("td[name='" + value.name + "']", _bodyTableTbodyTr);
          _td.attr("clickAction", value.clickAction).addClass("tdAuction");
        });
      }
      $("<td></td>").appendTo(_bodyTableTbodyTr);
    },

    /* ------------------------------------------------------- */
    /* superTable 폼생성 */
    /* ------------------------------------------------------- */
    superTable: function (option, parentObj) {
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
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }
      // 20180124 jwkim start
      var sort = getSortOption(option.sort);
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperTable")
        .addClass(_theme)
        .attr("_viewpage", "1")
        .attr("_pagecnt", option.rowNum)
        .attr("_sort", sort)
        .attr("_order", option.order);
      // 20180124 jwkim end
      // _Obj.data("jsonData",
      // option).removeClass().addClass('SuperContaner
      // SuperTable').addClass(_theme).attr("_order",
      // option.order).attr("_viewpage", "1").attr("_pagecnt",
      // option.rowNum);
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
      // HTML 빠른생성
      /* ----------------------------------------------------------------------------- */
      if (option.isHtmlDown) {
        var InHtml = $.HtmlGet(_Obj.attr("jsonName"));

        _Obj.append(InHtml);
        if ($(".body tbody tr:last", _Obj).length == 0) {
          _Obj.superContaner("superTableQtr", option);
        }
        _Obj.data("TRdata", $(".body tbody tr:last", _Obj));
        $(".body tbody tr", _Obj).remove();

        if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);

        if (
          typeof _jsonName != "string" &&
          undefined != option.isAutoRun &&
          true == option.isAutoRun
        ) {
          $(document).ready(function () {
            _Obj.superContaner("List"); //
          });
        }
        return;
      }
      /* ----------------------------------------------------------------------------- */
      // 외곽디자인 구성
      /* ----------------------------------------------------------------------------- */
      if (option.title != undefined && _Obj.parents(".EditPopUp").length == 0) {
        var _title = $("<div class='title title-bg title-ft'></div>").appendTo(
          _Obj
        );
        _title.html(option.title.text);
        _title.addClass(option.title.Css);
      }
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      // var _head = $(".head", _Obj);
      var _table = $(
        "<table class='SuperFilter SuperFilter-bg b-t b-r b-b b-l b-co b-co-basic'></table>"
      ).appendTo(_head);
      var superExtFilter;
      // 20180922 khma 확장필터 호출
      if (isNotEmpty(option.extFilterView)) {
        superExtFilter = _head.superExtFilter({
          filters: option.extFilterView,
          presets: [],
        });
      }

      if (option.filterView != undefined) {
        /* ----------------------------------------------------------------------------- */
        // 테이블 컬럼생성
        /* ----------------------------------------------------------------------------- */
        var _colgroup = "<colgroup>";
        $.each(option.filterView.colgroup, function (index, value) {
          if (value == undefined) return;
          _colgroup += "<col width='" + value.LabelWidth + "' />";
          _colgroup += "<col width='" + value.DataWidth + "' />";
        });
        _colgroup += "</colgroup>";
        _table.append(_colgroup);
        _colCount = option.filterView.colgroup.length * 2;
        /* ----------------------------------------------------------------------------- */
        // 테이블 TR/TD테그 생성
        /* ----------------------------------------------------------------------------- */
        var _vGroup = "";
        var codes = new Array();
        var keys = "";
        var values = [];
        if (option.filterView.tr != undefined) {
          $.each(option.filterView.tr, function (index, value) {
            if (value == undefined) return;
            var tr = $("<tr class='tr b-t b-r b-b b-l b-co b-co-basic'></tr>")
              .appendTo(_table)
              .attr("group", _vGroup);
            var tdCount = 0;
            // TD테그생성
            $.each(value.TD, function (index, value) {
              if (value == undefined) return;
              _colspan =
                value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
              tdCount += _colspan;
              switch (value.type) {
                case "group":
                  if (true) {
                    // GROUP TD 생성
                    $(
                      "<td colspan='" +
                        _colCount +
                        "'><a class='icon i-20 icon-title align-middle'></a><span class='align-middle'>" +
                        value.label +
                        "</span></td>"
                    ).appendTo(tr);
                    tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
                    _vGroup = value.name;
                  }
                  break;
                case "note":
                  if (true) {
                    // Note TD 생성
                    _note = $(
                      "<td class='fldNote fldNote-bg fldNote-ft'>" +
                        value.label +
                        "</td>"
                    )
                      .appendTo(tr)
                      .attr("colspan", _colspan + 1);
                    if (value.color != undefined)
                      _note.css("background-color", value.color);
                    if (value.css != undefined) _note.addClass(value.css);
                  }
                  break;
                default:
                  if (true) {
                    // ----------------------------------------------------------------------------------
                    // 라벨표시용 TD생성
                    // ----------------------------------------------------------------------------------
                    _tdlable = $(
                      "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft'></td>"
                    )
                      .appendTo(tr)
                      .html(value.label)
                      .attr("title", value.label);
                    // ----------------------------------------------------------------------------------
                    // 필드표시용 TD생성
                    // ----------------------------------------------------------------------------------
                    _tdData = $(
                      "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
                    )
                      .appendTo(tr)
                      .attr("colspan", _colspan);
                    $.each(value.fieldContaner, function (index, value) {
                      if (
                        value.type == "select" &&
                        value.codes != undefined &&
                        value.codes != "" &&
                        value.codes.split(".").length == 1 &&
                        _M.Codes[value.codes] == undefined
                      ) {
                        keys += value.codes + ",";
                      }
                      codes.push(_tdData);
                      values.push(value);
                    });
                  }
                  break;
              }
            });
            // alert(tdCount);
            var addtd = "";
            for (var i = tdCount; i < _colCount; i++) {
              addtd += "<td></td>";
            }
            tr.append(addtd);

            tr.attr("group", _vGroup);
          });
          // key 수정 필요
          if (keys != undefined && keys != "") {
            keys = keys.substring(0, keys.length - 1);
            $.SvcGetCodes(
              keys,
              function (data) {
                $.each(data.resultData, function (index, value) {
                  if (_M.Codes[value.CODE_GRP] == undefined) {
                    _M.Codes[value.CODE_GRP] = new Array();
                  }
                  var flag = false;
                  $.each(_M.Codes[value.CODE_GRP], function (i, codegrp) {
                    if (
                      codegrp.CODE == value["CODE"] &&
                      codegrp.UPCODE == value["UPCODE"]
                    ) {
                      flag = true;
                      return;
                    }
                  });
                  if (!flag) {
                    _M.Codes[value.CODE_GRP].push({
                      CODE: $.decHTML(value["CODE"]),
                      DECODE: $.decHTML(value["DECODE"]),
                      UPCODE: $.decHTML(value["UPCODE"]),
                    });
                  }
                });
              },
              _M.aSync.sync
            );
          }
          $.each(codes, function (index, value) {
            _Obj.superContaner("fieldGen", codes[index], values[index]);
          });
        }
        Bordercontroll();
        _Obj.superContaner("SetDefault"); // 20140516 검색필터 디폴트값 지정
      }

      $(".SuperFilter", _Obj).toggle(option.isShowFilter);

      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성
      /* ----------------------------------------------------------------------------- */
      if (option.isShowjobArea == undefined || option.isShowjobArea) {
        var _jobArea = $(
          "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
        ).appendTo(_head);
        // 이 부분만 실행되는 중...
        _Obj.makeButtons(_jobArea);
      }

      /* ----------------------------------------------------------------------------- */
      // Chart Area
      /* ----------------------------------------------------------------------------- */
      var _ChartArea = $(
        "<div class='chartArea b-b b-co b-co-basic'></div>"
      ).appendTo(_Obj);

      /* ----------------------------------------------------------------------------- */
      // Table목록 Body생성
      /* ----------------------------------------------------------------------------- */
      _Obj.superContaner("drawSuperTableBody", _Obj);

      /* ----------------------------------------------------------------------------- */
      // Page생성
      /* ----------------------------------------------------------------------------- */
      // _Obj.superContaner('drawPageArea', _Obj);
      if (option.isShowPage != undefined && option.isShowPage) {
        var pageSource =
          "<div class='page page-bg page-ft b-t b-r b-b b-l b-co b-co-basic'>";

        pageSource +=
          "<span class='pgMsg records' >Records: <b>0</b></span><span class='pgMsg pages'>Page: <b>0</b></span>";
        pageSource += "<span class='pgLSelect'>";
        pageSource +=
          "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic pgLCnt'><option>5</option><option>10</option><option>15</option><option>30</option><option>50</option><option>100</option><option>1000</option></select>";
        pageSource += "</span>";
        pageSource += "<ul>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgnum_first icon-page icon i-20 icon-pagefirst'></span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgnum_prev icon-page icon i-20 icon-pageprev'></span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_1'>1</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_2'>2</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_3'>3</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_4'>4</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_5'>5</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_6'>6</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_7'>7</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_8'>8</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_9'>9</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgn pgnum_10'>10</span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgnum_next icon-page icon i-20 icon-pagenext'></span></li>";
        pageSource +=
          "<li class='pgnum'><span class='pgs pgnum_end icon-page icon i-20 icon-pagelast'></span></li>";
        pageSource += "</ul>";

        pageSource += "</div>";
        _Obj.append(pageSource);
      }

      /* ----------------------------------------------------------------------------- */
      // foot생성
      /* ----------------------------------------------------------------------------- */
      if (option.isShowFoot != undefined && option.isShowFoot)
        $("<div class='foot'>foot</div>").appendTo(_Obj);
      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      if (option.isShowStatus != undefined && option.isShowStatus)
        $("<div class='status'>status</div>").appendTo(_Obj);

      if (option.isShowHead != undefined) {
        $("thead", _Obj).toggle(option.isShowHead);
      }

      if (option.isShowPageMin) {
        _pageUl.parent().css("text-align", "center");
        // _pageUl.css('width', '30px'); CSS JDM
        $(".pgnum_first").parent().hide();
        $(".pgnum_1").parent().hide();
        $(".pgnum_2").parent().hide();
        $(".pgnum_3").parent().hide();
        $(".pgnum_4").parent().hide();
        $(".pgnum_5").parent().hide();
        $(".pgnum_6").parent().hide();
        $(".pgnum_7").parent().hide();
        $(".pgnum_8").parent().hide();
        $(".pgnum_9").parent().hide();
        $(".pgnum_10").parent().hide();
        $(".pgnum_end").parent().hide();

        $(".records").hide();
        $(".pages").hide();
        $(".pgLCnt").hide();
      }

      if (option.selectableRowNum == false) {
        $(".pgLCnt").attr("disabled", "disabled");
      }

      /* ----------------------------------------------------------------------------- */
      // Chart
      /* ----------------------------------------------------------------------------- */
      if (option.chartOpton != undefined) {
        if (option.bodyWidth > 0) {
          $(".chartArea", _Obj).css("width", option.bodyWidth);
        }
        if (option.chartOpton.chartHeight > 0) {
          $(".chartArea", _Obj)
            .css("height", option.chartOpton.chartHeight)
            .css("width", $(this).parents(".SuperContaner").width());
        }
        $(".chartArea", _Obj).toggle(option.chartOpton.isShowChart);
      }

      $(".pgLCnt", _Obj).val(option.rowNum);

      _Obj.toggle(true);
      if (option.mainViewToggle) {
        if (option.mainViewID != undefined) {
          $(option.mainViewID).toggle(false);
        }
      } else {
        $(option.mainViewID).toggle(true);
      }

      /* ----------------------------------------------------------------------------- */
      // LoadCallback실행
      /* ----------------------------------------------------------------------------- */
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
      /* ----------------------------------------------------------------------------- */
      // 자동실행여부 판단
      /* ----------------------------------------------------------------------------- */
      if (
        ($(this).parent(".EditPopUp").length > 0 || parentObj == undefined) &&
        undefined != option.isAutoRun &&
        true == option.isAutoRun
      ) {
        $(document).ready(function () {
          // 20180922 khma 확장필터 호출
          if (isNotEmpty(option.extFilterView)) {
            _head.superExtFilter("selectDefaultPreset");
          } else {
            _Obj.superContaner("List");
          }
        });
      } else {
        // 2014.03.24 dmjung start :: 레코드가 없을 때 페이징 숨김
        if (_Obj.find(".body").find("tbody tr").size() == 0) {
          _Obj.find(".page ul").hide();
        }
        // 2014.03.24 dmjung end :: 레코드가 없을 때 페이징 숨김
      }
    },
    /* 슈퍼테이블 목록 ht,td태그 생성 */
    /* _Obj:슈퍼테이블목록객체 dispList:뿌려질컬럼정보 */
    drawSuperTableBody: function (_Obj, dispList) {
      var option = _Obj.data("jsonData"); // 옵션정보 취득
      _Obj.find(".body").remove();

      /* ----------------------------------------------------------------------------- */
      // Body thead 고정일 경우는 헤더를 상단에 div로 생성 20140402
      /* ----------------------------------------------------------------------------- */
      if (option.isTheadFix) {
        var headSource =
          "<div class='body thead body-bg b-t b-l b-r b-co b-co-basic' style='overflow-x:hidden'>";
        headSource += "<table>";
        headSource += "<colgroup>";
        if (option.isRowSelect) {
          headSource +=
            "<col width='25px' /><col class='resizeBar' width='1px' />";
        }
        if (option.isRowNum) {
          headSource +=
            "<col width='60px'class='rowNum'/><col class='resizeBar' width='1px' />";
        }
        $.each(option.colModel, function (index, value) {
          headSource +=
            "<col width='" +
            value.width +
            "' field='" +
            value.field +
            "' /><col class='resizeBar' width='1px' />";
        });
        headSource += "<col width='100%' />";
        headSource += "</colgroup>";
        headSource += "</table>";
        headSource += "</div>";
        _Obj.append(headSource);
      }

      /* ----------------------------------------------------------------------------- */
      // Body생성
      /* ----------------------------------------------------------------------------- */
      var _body = $(
        "<div class='body tbody body-bg b-t b-l b-r b-b b-co b-co-basic'></div>"
      ).appendTo(_Obj);
      if (_Obj.find(".page")) {
        _Obj.find(".page").before(_body); // page 가 그려줘있으면 위치이동
      }

      var _bodyTable = $("<table></table>").appendTo(_body);

      if (option.isTheadFix) {
        // 20140402 jwkim 헤더고정옵션처리
        _body.scroll(function () {
          var _ls = $(this).scrollLeft();
          _Obj.find(".thead").scrollLeft(_ls);
        });
      }
      /* ----------------------------------------------------------------------------- */
      // Body colgroup 생성
      /* ----------------------------------------------------------------------------- */

      // option.isRowSelect: false, // 선택체크박스를 표시할지 결정함
      var colSource = "<colgroup>";
      if (option.isRowSelect) {
        colSource +=
          "<col width='25px' /><col class='resizeBar' width='1px' />";
      }
      if (option.isRowNum) {
        colSource +=
          "<col width='60px'class='rowNum'/><col class='resizeBar' width='1px' />";
      }

      if (undefined == dispList) {
        // undefined이면 모두 출력
        $.each(option.colModel, function (index, value) {
          colSource +=
            "<col width='" +
            value.width +
            "' field='" +
            value.field +
            "' /><col class='resizeBar' width='1px' />";
        });
      } else {
        // undefined이 아니면 display대상컬을 순차적으로 출력
        for (var i = 0; i < dispList.length; i++) {
          $.each(option.colModel, function (index, value) {
            if (value.field == dispList[i].field) {
              colSource +=
                "<col width='" +
                value.width +
                "' field='" +
                value.field +
                "' /><col class='resizeBar' width='1px' />";
            }
          });
        }
      }
      colSource += "<col width='100%' />";
      colSource += "</colgroup>";
      _bodyTable.append(colSource);

      /* ----------------------------------------------------------------------------- */
      // Body thead 생성
      /* ----------------------------------------------------------------------------- */
      var headSource = "<thead" + (option.isTheadFix ? ">" : " class='thead'>"); // 20140402
      // jwkim
      // 헤더고정옵션처리
      var rowSpan = 0;

      // todo 헤더 병합 정보 처리 20140401 jwkim
      var trSource = "";
      if (undefined != option.colHead) {
        $.each(option.colHead.tr, function (index, value) {
          trSource += "<tr>";
          if (index == 0) {
            rowSpan = option.colHead.tr.length; // +1
            // 제거함
            if (option.isRowSelect) {
              trSource +=
                "<th class='trChkAll th th-bg th-ft b-b b-co b-co-basic' rowSpan=" +
                rowSpan +
                "><input type='checkbox' value='1' /></th><th class='resizeBar th th-bg th-ft b-b b-co b-co-basic' rowSpan=" +
                rowSpan +
                "></th>";
            }
            if (option.isRowNum) {
              trSource +=
                "<th class='rowNum th th-bg th-ft b-b b-co b-co-basic' rowSpan=" +
                rowSpan +
                ">행번호</th><th class='resizeBar th th-bg th-ft b-b b-co b-co-basic' rowSpan=" +
                rowSpan +
                "></th>";
            }
          }
          $.each(value.TD, function (index, value) {
            trSource += makeTalbleTh(value, option);
          });
          trSource +=
            "<th class='SortNone th th-bg th-ft b-b b-co b-co-basic'></th>";
          trSource += "</tr>";
        });
      }
      // todo 헤더 병합 정보 처리 20140401 jwkim
      else if (undefined == option.colHead) {
        trSource += "<tr>";
        if (option.isRowSelect) {
          trSource +=
            "<th class='trChkAll th th-bg th-ft b-b b-co b-co-basic'><input type='checkbox' value='1' /></th><th class='resizeBar th th-bg th-ft b-b b-co b-co-basic'></th>";
        }
        if (option.isRowNum) {
          trSource +=
            "<th class='rowNum th th-bg th-ft b-b b-co b-co-basic'>행번호</th><th class='resizeBar th th-bg th-ft b-b b-co b-co-basic'></th>";
        }

        if (undefined == dispList) {
          // undefined이면 모두 출력
          $.each(option.colModel, function (index, value) {
            trSource += makeTalbleTh(value, option); // TH내용을 그리는 메소드 호출
          });
        } else {
          // undefined이 아니면 display대상컬을 순차적으로 출력
          for (var i = 0; i < dispList.length; i++) {
            $.each(option.colModel, function (index, value) {
              if (value.field == dispList[i].field) {
                trSource += makeTalbleTh(value, option);
              }
            });
          }
        }
        trSource +=
          "<th class='SortNone th th-bg th-ft b-b b-co b-co-basic'></th>";
        trSource += "</tr>";
      }

      if (option.isTheadFix) {
        $("div.thead table", _Obj).append(headSource + trSource + "</thead>");
        _bodyTable.append("<thead class='thead'></thead>");
      } else _bodyTable.append(headSource + trSource + "</thead>");

      /* ----------------------------------------------------------------------------- */
      // Body tbody 생성
      /* ----------------------------------------------------------------------------- */

      // EditMode
      /*
       * var tbodySource = ""; tbodySource += "<tbody class='tbody'>";
       * tbodySource += "<tr>"; if ( option.isRowSelect ) { tbodySource += "<td class='b-b b-co b-co-basic' checkbox='ROWSELECT'><input
       * type='checkbox' value='1' /></td><td class='resizeBar b-b b-co b-co-basic'></td>"; }
       * if ( option.isRowNum ) { tbodySource += "<td class='b-b b-co b-co-basic rowNum' field='ROWNUM' style='text-align: center;'></td><td class='resizeBar b-b b-co b-co-basic' field='ROWNUM' style='text-align: center;'></td>" }
       *
       * if(undefined == dispList){ //undefined이면 모두 출력
       * $.each(option.colModel, function(index, value) { tbodySource +=
       * makeTalbleTd(value); }); }else{ //undefined이 아니면 display대상컬을
       * 순차적으로 출력 for(var i=0;i<dispList.length;i++){
       * $.each(option.colModel, function(index, value) { if(value.field ==
       * dispList[i].field){ tbodySource += makeTalbleTd(value); } }); } }
       * tbodySource += "<td class='b-b b-co b-co-basic'></td>";
       * tbodySource += "</tr>"; tbodySource += "</tbody>";
       * _bodyTable.append(tbodySource);
       */

      var _bodyTableTbody = $("<tbody class='tbody'></tbody>").appendTo(
        _bodyTable
      );
      var _bodyTableTbodyTr = $("<tr></tr>").appendTo(_bodyTableTbody);
      if (option.isRowSelect) {
        $(
          "<td class='b-b b-co b-co-basic' checkbox='ROWSELECT'><input type='checkbox' value='1' /></td><td class='resizeBar b-b b-co b-co-basic'></td>"
        ).appendTo(_bodyTableTbodyTr);
      }
      if (option.isRowNum) {
        $(
          "<td class='b-b b-co b-co-basic rowNum' field='ROWNUM'></td><td class='resizeBar b-b b-co b-co-basic'></td>"
        )
          .appendTo(_bodyTableTbodyTr)
          .attr("field", "ROWNUM")
          .css("text-align", "center");
      }

      if (undefined == dispList) {
        // undefined이면 모두 출력
        $.each(option.colModel, function (index, value) {
          makeTalbleTd(value, _bodyTableTbodyTr);
        });
      } else {
        // undefined이 아니면 display대상컬을 순차적으로 출력
        for (var i = 0; i < dispList.length; i++) {
          $.each(option.colModel, function (index, value) {
            if (value.field == dispList[i].field) {
              makeTalbleTd(value, _bodyTableTbodyTr);
            }
          });
        }
      }

      $("<td class='b-b b-co b-co-basic'></td>").appendTo(_bodyTableTbodyTr);

      if (option.isEditMode != undefined) {
        _Obj.superContaner("tableModeChange", option.isEditMode); //
      } else {
        _Obj.superContaner("tableModeChange", true); //
      }
      if (option.tdActions != undefined) {
        $.each(option.tdActions, function (index, value) {
          var _td = _Obj.find("td[name='" + value.name + "']");
          _td.attr("clickAction", value.clickAction).addClass("tdAuction");
        });
      }
      _Obj.data("TRdata", $(".body tbody tr:last", _Obj));
      $(".body tbody tr", _Obj).remove();

      // var TrData = $(this).data("TRdata");

      // 2014.03.25 dmjung start :: fixed 값에 따라 가변/고정 높이 값 지정 처리
      if (option.isFixed == false || option.isFixed == undefined) {
        if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      } else {
        if (option.bodyHeight > 0) _body.css("height", option.bodyHeight);
      }
      // 2014.03.25 dmjung end :: fixed 값에 따라 가변/고정 높이 값 지정 처리

      if (option.bodyWidth > 0) _Obj.css("width", option.bodyWidth);
    },

    /* ------------------------------------------------------- */
    /* superGallery 폼생성 */
    /* ------------------------------------------------------- */
    superGallery: function (option) {
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
        option = tableOption;
      }
      _Obj.removeClass();

      // 20180124 jwkim start
      var sort = getSortOption(option.sort);
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperGallery")
        .attr("_viewpage", "1")
        .attr("_pagecnt", option.rowNum)
        .attr("_sort", sort)
        .attr("_order", option.order);
      // _Obj.data("jsonData",
      // option).removeClass().addClass('SuperContaner
      // SuperGallery').attr("_order", option.order).attr("_viewpage",
      // "1").attr("_pagecnt", option.rowNum);
      // 20180124 jwkim end
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
      // var _head = $(".head", _Obj);
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
      _colCount = option.filterView.colgroup.length * 2;
      /* ----------------------------------------------------------------------------- */
      // 테이블 TR/TD테그 생성
      /* ----------------------------------------------------------------------------- */
      var _vGroup = "";
      $.each(option.filterView.tr, function (index, value) {
        if (value == undefined) return;
        var tr = $("<tr class='b-t b-r b-b b-l b-co b-co-basic'></tr>")
          .appendTo(_table)
          .attr("group", _vGroup);
        // TD테그생성
        $.each(value.TD, function (index, value) {
          if (value == undefined) return;
          _colspan =
            value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
          switch (value.type) {
            case "group":
              if (true) {
                // GROUP TD
                // 생성
                $(
                  "<td colspan='" +
                    _colCount +
                    "'><a class='icon i-20 icon-viewgroup align-middle'></a><span class='align-middle'>" +
                    value.label +
                    "</span></td>"
                ).appendTo(tr);
                tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
                _vGroup = value.name;
              }
              break;
            case "note":
              if (true) {
                // Note TD
                // 생성
                $(
                  "<td class='fldNote fldNote-bg fldNote-ft'>" +
                    value.label +
                    "</td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan + 1);
              }
              break;
            default:
              if (true) {
                // ----------------------------------------------------------------------------------
                // 라벨표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdlable = $(
                  "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft'></td>"
                )
                  .appendTo(tr)
                  .html(value.label);
                // ----------------------------------------------------------------------------------
                // 필드표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdData = $(
                  "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan);
                $.each(value.fieldContaner, function (index, value) {
                  _Obj.superContaner("fieldGen", _tdData, value);
                });
              }
              break;
          }
        });
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
      var _bodyTable = $("<ul></ul>").appendTo(_body);
      if (option.bodyHeight > 0) _body.css("height", option.bodyHeight);
      /* ----------------------------------------------------------------------------- */
      // Page생성
      /* ----------------------------------------------------------------------------- */
      var _page = $("<div class='page page-bg'></div>").appendTo(_Obj);
      $(
        "<span class='pgMsg records' >Records: <b>0</b></span><span class='pgMsg pages'>Page: <b>0</b></span>"
      ).appendTo(_page);
      var _pageSelect = $("<span class='pgLSelect'></span>").appendTo(_page);
      $(
        "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic pgLCnt'><option>5</option><option>10</option><option>15</option><option>30</option><option>50</option><option>100</option></select>"
      ).appendTo(_pageSelect);
      var _pageUl = $("<ul></ul>").appendTo(_page);
      $(
        "<li class='pgnum'><span class='pgs pgnum_first icon-page icon i-20 icon-pagefirst'></span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgnum_prev icon-page icon i-20 icon-pageprev'></span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_1'>1</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_2'>2</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_3'>3</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_4'>4</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_5'>5</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_6'>6</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_7'>7</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_8'>8</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_9'>9</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgn pgnum_10'>10</span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgnum_next icon-page icon i-20 icon-pagenext'></span></li>"
      ).appendTo(_pageUl);
      $(
        "<li class='pgnum'><span class='pgs pgnum_end icon-page icon i-20 icon-pagelast'></span></li>"
      ).appendTo(_pageUl);

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

      // 필터표시여부 결정
      $(".head", _Obj).toggle(option.isShowFilter);
      $(".page", _Obj).toggle(option.isShowPage);
      $(".foot", _Obj).toggle(option.isShowFoot);
      $(".status", _Obj).toggle(option.isShowStatus);

      $(".pgLCnt", _Obj).val(option.rowNum);
      /* ----------------------------------------------------------------------------- */
      // 자동실행여부 판단
      /* ----------------------------------------------------------------------------- */
      if (option.isAutoRun) {
        $(document).ready(function () {
          _Obj.superContaner("ListGallery"); //
        });
      }
      if (option.mainViewToggle) {
        if (option.mainViewID != undefined) {
          $(option.mainViewID).toggle(false);
        }
      }
    },

    /* ------------------------------------------------------- */
    /* superOlap 폼생성 */
    /* ------------------------------------------------------- */
    superOlap: function (option) {
      if ($.browserCheck() != "MSIE") {
        alert("olap분석은 ie 브라우즈에서만 가능합니다.");
        return;
      }

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
        .attr("keyvalue", "")
        .removeClass()
        .addClass("SuperContaner SuperOlap");
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
      // var _head = $(".head", _Obj);
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
      _colCount = option.filterView.colgroup.length * 2;
      /* ----------------------------------------------------------------------------- */
      // 테이블 TR/TD테그 생성
      /* ----------------------------------------------------------------------------- */
      var _vGroup = "";
      $.each(option.filterView.tr, function (index, value) {
        if (value == undefined) return;
        var tr = $("<tr class='b-t b-r b-b b-l b-co b-co-basic'></tr>")
          .appendTo(_table)
          .attr("group", _vGroup);
        // TD테그생성
        $.each(value.TD, function (index, value) {
          if (value == undefined) return;
          _colspan =
            value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
          switch (value.type) {
            case "group":
              if (true) {
                // GROUP TD
                // 생성
                $(
                  "<td colspan='" +
                    _colCount +
                    "'><a class='icon i-20 icon-viewgroup align-middle'></a><span class='align-middle'>" +
                    value.label +
                    "</span></td>"
                ).appendTo(tr);
                tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
                _vGroup = value.name;
              }
              break;
            case "note":
              if (true) {
                // Note TD
                // 생성
                $(
                  "<td class='fldNote fldNote-bg fldNote-ft'>" +
                    value.label +
                    "</td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan + 1);
              }
              break;
            default:
              if (true) {
                // ----------------------------------------------------------------------------------
                // 라벨표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdlable = $(
                  "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft'></td>"
                )
                  .appendTo(tr)
                  .html(value.label)
                  .attr("title", value.label);
                // ----------------------------------------------------------------------------------
                // 필드표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdData = $(
                  "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan);
                $.each(value.fieldContaner, function (index, value) {
                  _Obj.superContaner("fieldGen", _tdData, value);
                });
              }
              break;
          }
        });
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
      // Body생성 Olap도구생성
      /* ----------------------------------------------------------------------------- */
      var _NameArea = $("<div class='NameArea'></div>").appendTo(_Obj);
      var _NameView = $("<div></div>").appendTo(_NameArea);
      _NameView.superContaner("superView", "분석보고서ViewJsonPopUp");

      var _body = $("<div class='body body-bg'></div>").appendTo(_Obj);
      var _id = _Obj.attr("id") + "_olap";

      PtStr =
        "<OBJECT id='" +
        _id +
        "'  classid='CLSID:0002E55A-0000-0000-C000-000000000046' VIEWASTEXT>";
      PtStr += "</OBJECT>";
      _body.html(PtStr);

      if ($("#" + _id)[0].Version == undefined) {
        alert("컴포넌트가 설치되지 않았습니다. 지금 설치합니다.");
        $.pageMove("/js/owc11.exe");
      }
      // 레코드 영역의 크기
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);
      // 필터표시여부 결정
      $(".SuperFilter", _Obj).toggle(option.isShowFilter);
      $(".NameArea", _Obj).toggle(
        option.isEditMode == undefined ? false : option.isEditMode
      );
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".status", _Obj).toggle(option.isShowStatus);
    },
    olapShowData: function (oXml) {
      var _Obj = $(this);
      var _id = _Obj.attr("id") + "_olap";
      document.getElementById(_id).XMLData = oXml;
    },
    olapNew: function () {
      var _Obj = $(this);
      var _id = _Obj.attr("id") + "_olap";
      _Obj.attr("keyvalue", "");
      $(".NameArea div", _Obj).superContaner("New");
      $(".body", _Obj).addClass("none");
      $.ShowPopUpTableJson(
        "분석원본ListJsonPopUp",
        _Obj,
        function (_key, _display) {
          $(".body", _Obj).removeClass("none");
          if (_key != undefined) {
            $.SvcGetRow(
              "분석원본",
              "read",
              "분석원본번호",
              _key,
              function (data) {
                _xml = data["본문"];
                _Obj.superContaner("olapShowData", _xml);
              }
            );
          }
        }
      );
    },
    olapSave: function () {
      var _Obj = $(this);
      var _nameArea = $(".NameArea div", _Obj);
      var option = $(this).data("jsonData");
      var _id = _Obj.attr("id") + "_olap";
      var _본문 = document.getElementById(_id).XMLData;
      _분석보고서명 = $(
        ".fieldContaner[field='분석보고서명']",
        _nameArea
      ).superContaner("getFieldValue");
      _구분 = $(".fieldContaner[field='구분']", _nameArea).superContaner(
        "getFieldValue"
      );
      _설명 = $(".fieldContaner[field='설명']", _nameArea).superContaner(
        "getFieldValue"
      );

      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      if (_Obj.attr("keyvalue") == "") {
        pl.add("method", option.method.Create);
      } else {
        pl.add("method", option.method.Update);
      }
      pl.add("분석보고서명", _분석보고서명);
      pl.add("구분", _구분);
      pl.add("설명", _설명);
      pl.add("본문", _본문);
      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          $(".fieldContaner.fldChange", _Obj).removeClass("fldChange");
          if (option.mainListID != undefined) {
            $(option.mainListID).superContaner("tableRefresh");
          }
          alert("Save ok");
          if (_data.resultInfo.jobType == "CREATEIDENTITY") {
            if (option.afterCreateCallBack != undefined)
              eval(option.afterCreateCallBack)(_Obj);
            _Obj.attr("keyvalue", _data.resultData[0].rltKey);
          } else {
            if (option.afterCreateCallBack != undefined)
              eval(option.afterCreateCallBack)(_Obj);
          }
          // 만일링크가 걸린 테이블이 있으면 새로고침 합니다.
          if (option.mainListID != undefined) {
            $(option.mainListID).superContaner("tableRefresh");
          }
        },
        function (response) {
          // $("#hm").html('Error : ' + response.Message);
          alert(response.Message);
        },
        _M.aSync.sync
      );

      return _Obj;
    },
    olapRead: function (key) {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      $(".NameArea div", _Obj).superContaner("Read", key);
      $.SvcGetRow("분석보고서", "read", "분석보고서번호", key, function (data) {
        _xml = data["본문"];
        _po = $(".body", _Obj);
        _width = $(window).width() - _po.offset().left - 20;
        _height = $(window).height() - _po.offset().top - 20;
        _xml = _xml.replace(
          /(<x:MaxHeight>\s*)(.*?)(\s*<\/x:MaxHeight>)/g,
          "<x:MaxHeight>" + _height + "</x:MaxHeight>"
        );
        _xml = _xml.replace(
          /(<x:MaxWidth>\s*)(.*?)(\s*<\/x:MaxWidth>)/g,
          "<x:MaxWidth>" + _width + "</x:MaxWidth>"
        );
        // _xml =
        // _xml.replace('<x:NoAllowDetails/>','<x:NoAllowDetails/><x:MaxHeight>'+_height+'</x:MaxHeight><x:MaxWidth>'+_width+'</x:MaxWidth>')
        _Obj.superContaner("olapShowData", _xml);
      });
      return _Obj;
    },

    /* ------------------------------------------------------- */
    /* superiFrame 폼생성 */
    /* ------------------------------------------------------- */
    superiFrame: function (option) {
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
        .attr("keyvalue", "")
        .removeClass()
        .addClass("SuperContaner SuperiFrame");
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
      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성
      /* ----------------------------------------------------------------------------- */
      var _jobArea = $(
        "<div class='jobArea jobArea-bg'><div class='buttonset'></div></div>"
      ).appendTo(_head);
      _Obj.makeButtons(_jobArea);

      /* ----------------------------------------------------------------------------- */
      // Body생성 Olap도구생성
      /* ----------------------------------------------------------------------------- */
      var _frameDiv = $("<div class='frameDiv'></div>").appendTo(_Obj);
      var _id = _Obj.attr("id") + "_olap";

      $(
        "<iframe  src='#' width='100%' height='100%' frameborder='0' scrolling='auto' allowtransparency='true'  >"
      ).appendTo(_frameDiv);

      // 레코드 영역의 크기
      if (option.bodyHeight > 0) {
        _frameDiv.css("min-height", option.bodyHeight);
      } else {
        _width = $(window).width() - _frameDiv.offset().left - 260;
        _height = $(window).height() - _frameDiv.offset().top - 40;
        _frameDiv.css("width", "100%");
        _frameDiv.css("min-height", "800px");

        $(window).resize(function () {
          _width = $(window).width() - _frameDiv.offset().left - 260;
          _height = $(window).height() - _frameDiv.offset().top - 40;
          _frameDiv.css("width", "100%");
          _frameDiv.css("min-height", "800px");
        });
      }
      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);
      // 필터표시여부 결정
      $(".SuperFilter", _Obj).toggle(option.isShowFilter);
      $(".NameArea", _Obj).toggle(
        option.isEditMode == undefined ? false : option.isEditMode
      );
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".status", _Obj).toggle(option.isShowStatus);

      if (option.ShowReportID != undefined) {
        _Obj.superContaner("iFrameRead", option.ShowReportID);
      }
    },
    iFrameRead: function (key) {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      $.SvcGetRow("분석리포트", "read", "분석리포트번호", key, function (data) {
        _Url = data["분석리포트주소"];
        _iFrame = $(".frameDiv iframe", _Obj);
        _iFrame.attr("src", _Url);
      });
      return _Obj;
    },

    /* ------------------------------------------------------- */
    /* superFlow 폼생성 */
    /* ------------------------------------------------------- */
    superFlow: function (option) {
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
      _Obj.addClass("SuperFlow SuperFlow-bg"); // CSS JDM
      var _pmenu = $("<div class='progress'></div>").appendTo(_Obj);
      $("<strong class='tit'>" + option.title + "</strong>").appendTo(_pmenu);
      _ul = $("<ul></ul>").appendTo(_pmenu);
      var i = 0;
      $.each(option.StepMenus, function (index, value) {
        if (i++ > 0) {
          var _li = $("<li></li>").appendTo(_ul);
          if (location.pathname == value.href) _li.addClass("on");
          _li.attr("step", value.step);
          // 20171026 khma 로그기록
          _li.attr("stepMenu", value.title);
          if (i == 2) setPrevActGbn(undefined, value.title, undefined);
          var hashUrl = "m_" + _M.PrevActGbn.currMenuId + ":f_" + value.step;
          var _a = $(
            "<a class='SuperFlow-ft' href='#" +
              hashUrl +
              "'>" +
              value.title +
              "</a>"
          ).appendTo(_li);
          _li.attr("MainTop", value.MainTop);
          _li.attr("MainList", value.MainList);
          _li.attr("MainView", value.MainView);
          _li.attr("MainBottom", value.MainBottom);

          _li.attr("LeftTop", value.LeftTop);
          _li.attr("LeftList", value.LeftList);
          _li.attr("LeftView", value.LeftView);
          _li.attr("LeftBottom", value.LeftBottom);

          _li.attr("TopFlow", value.TopFlow);
          _li.attr("LeftWidth", value.LeftWidth);
        }
      });
      // $('li:eq(0)', _Obj).trigger('click');
      var _o = $("li:eq(0)", _Obj);

      var f = hashInfo("f"); // 플로우해쉬존재할때
      if (isNotEmpty(f)) {
        var flowObj = $("#Flowtop");
        var flows = flowObj.find("li");
        $.each(flows, function (index, flow) {
          var fObj = $(flow);
          if (f == fObj.attr("step")) {
            fObj.controlsMenu("setGoFlowStep", fObj);
          }
        });
      } else {
        _o.controlsMenu("setGoFlowStep", _o);
      }
    },

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
      _Obj.superContaner("TreeList"); // 20140409 JWKIM jstree로 트리 라이브러리
      // 변경
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
                    // todo js free취득 정보 및
                    // 데이터 재생성등
                    // 체크....20140409 jwkim
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
                  loader.remove();
                  _Obj.superContaner("tableShowMessage", response);
                },
                _M.aSync.async
              );
            },
          },
          plugins: plugins,
          /*
           * "contextmenu": { "items": function ($node) {
           * return { "create": { "label": "추가", "action":
           * function (obj) { //this.create(obj);
           * alert(viewJson); $.ShowPopUpViewJson(viewJson,
           * _Obj, function(){popObj}) ; } } }; } }
           */
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
              /*
               * var targetId = '#' +
               * $(this).attr('id');
               * $(this).jstree('open_node',targetId,
               * function(obj,data){ debugger;
               * var dt =data; },false);
               */
            });
          }
        });

      // 트리 클릭 이벤트 바인딩
      $("#treeArea", _Obj).on("select_node.jstree", function (event, data) {
        // 폴더가 아닌 하위정보일때
        // var selectedLi =
        // $('li.jstree-leaf[aria-selected=true]',data.instance.element);
        // if(data.node.id == selectedLi.attr('id') ){
        _Obj.superContaner("TreeClick", data.node);
        // }
      });
    },
    openTreeNode: function (jsTreeObj, nodeId, openLevel, currLevel) {
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
      // _keyvalue = node.find('a').attr('nodekey'); //20140411 jwkim
      // jstree로 변경함
      var _keyvalue = node.id;
      // alert("kk-"+_keyvalue)
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

    /*
     * ------------------------------------------------------- Calender
     * --------------------------------------------------------
     */
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

                    var _from = row.fromdatetime;
                    if (_from != null) {
                      if (_M.Webtype == "NET") {
                        _from = eval(
                          _from.replace(/\/Date\((\d+)\)\//gi, "new Date($1)")
                        );
                      } else {
                        _from = new Date(_from);
                      }
                    } else {
                      _from = eval(_to);
                    }
                    var _to = row.todatetime;
                    if (_to != null) {
                      if (_M.Webtype == "NET") {
                        _to = eval(
                          _to.replace(/\/Date\((\d+)\)\//gi, "new Date($1)")
                        );
                      } else {
                        _to = new Date(_to);
                      }
                    } else {
                      _to = eval(_to);
                    }

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

    /*
     * ------------------------------------------------------- Map
     * --------------------------------------------------------
     */
    superMap: function (option, px, py, ptitle) {
      var _Obj = $(this);
      // _Obj.html('');
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
        .addClass("SuperContaner SuperMap");
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
      /*
       * //20140926 jwkim start var _jobArea = $("<div class='jobArea
       * jobArea-bg'><div class='buttonset'></div></div>").appendTo(_head);
       * $.each(option.jobs, function(index, value) { if (value ==
       * undefined) return; $("<span class='cmdicon icon i-20 '></span>").appendTo(_cmdspan).addClass(value.css).attr("index",
       * value.index); $("<input type='button' class='cmdbtn cmdspan-ft'
       * />").appendTo(_cmdspan) .attr("value", value.name) .attr("index",
       * value.index) .attr("inComm", value.inComm != undefined ?
       * value.inComm : ""); });
       */ // 20140926 jwkim end
      /* ----------------------------------------------------------------------------- */
      // Body생성
      /* ----------------------------------------------------------------------------- */
      /*
       * var _AddressFind = $("<div class='AddressFind'></div>").appendTo(_Obj);
       * var _img = $("<span class='icon i-20 icon-search '></span>").appendTo(_AddressFind);
       * var _span = $("<span class='pinset'></span>").appendTo(_AddressFind);
       * _span.css('width', '100%');
       *
       * var _o = $("<a>find : </a><input class='input-bg input-ft b-t
       * b-r b-b b-l b-co b-co-basic' type='text' value=''
       * />").appendTo(_span); _img.click(function(e) { var _adf =
       * $(this).parents('.AddressFind'); var _addData = $("input",
       * _adf).val(); _Obj.superContaner("MapAddressSetMark", _addData,
       * "찾기");
       *
       * });
       */
      var _body = $("<div class='body body-bg'></div>").appendTo(_Obj);
      if (option.bodyHeight != undefined) {
        _body.css("min-height", option.bodyHeight);
      } else {
        var _bdyheight = $(window).height();
        if (_bdyheight * 1 < 800) {
          _bdyheight = 800;
        }
        _body.css("height", _bdyheight);
      }

      // if (option.mapmode == 'listview') {
      var _mapchkArea = $("<div class='mapChkArea'></div>").appendTo(_body);
      $("<div class='mapTitle mapDiv'>Map Category</div>").appendTo(
        _mapchkArea
      );

      $.each(option.maps, function (index, value) {
        if (value == undefined) return;
        checkBoxid = "mapcheck" + formCID++;
        var _mapChkSpan = $("<div class='selectArea'></div>").appendTo(
          _mapchkArea
        );
        var mapChkBox = $(
          "<input type='checkbox' value='1' id='" +
            checkBoxid +
            "'  /><label style='color:white' for='" +
            checkBoxid +
            "'>" +
            value.name +
            "</label>"
        )
          .appendTo(_mapChkSpan)
          .css("width", "auto");
        // 체크박스가 변경될때 새로 검색하도록 액션을 넣는다.

        mapChkBox.change(function () {
          if ($(this).is(":checked")) {
            // 해당하는 맵을 표시할것
            _Obj.superContaner("MapList", $(this).attr("mapId"));
          } else {
            // 해당하는 맵을 숨길것
            // _Obj.superContaner("MapDeleteOverlays",
            // $(this).attr("name"));
            _Obj.superContaner("MapDeleteOverlays", $(this).attr("mapId"));
          }
        });

        mapChkBox.attr("service", value.service);
        if (value.method.Create != undefined) {
          mapChkBox.attr("methodCreate", value.method.Create);
        }
        if (value.method.List != undefined) {
          mapChkBox.attr("methodList", value.method.List);
        }
        if (value.method.Read != undefined) {
          mapChkBox.attr("methodRead", value.method.Read);
        }
        if (value.method.Update != undefined) {
          mapChkBox.attr("methodUpdate", value.method.Update);
        }
        if (value.method.Delete != undefined) {
          mapChkBox.attr("methodDelete", value.method.Delete);
        }
        if (value.isMoveCenter != undefined) {
          mapChkBox.attr("isMoveCenter", value.isMoveCenter);
        }
        if (undefined != value.css) {
          if (undefined != value.css.image) {
            mapChkBox.attr("image", value.css.image);

            switch (value.css.image) {
              case "red-dot":
                _mapChkSpan.css("background-color", "#ff7a6b");
                break;
              case "pink-dot":
                _mapChkSpan.css("background-color", "#e661ac");
                break;
              case "blue-dot":
                _mapChkSpan.css("background-color", "#6e98ff");
                break;
              case "green-dot":
                _mapChkSpan.css("background-color", "#00e64d");
                break;
              case "ltblue-dot":
                _mapChkSpan.css("background-color", "#67dddd");
                break;
              case "yellow-dot":
                _mapChkSpan.css("background-color", "#FFD700");
                break;
              case "purple-dot":
                _mapChkSpan.css("background-color", "#8e67fd");
                break;
              case "orange-dot":
                _mapChkSpan.css("background-color", "#ff9900");
                break;
              default:
                _mapChkSpan.css("background-color", "#ff7a6b");
                break;
            }
          }
          if (undefined != value.css.shadow) {
            mapChkBox.attr("shadow", value.css.shadow);
          }
        }

        mapChkBox.attr("service", value.service);
        mapChkBox.attr("name", value.name);
        mapChkBox.attr("isShowInfoWindow", value.isShowInfoWindow);
        mapChkBox.attr("mapId", value.mapId);

        // 디폴트 체크 기능 표시
        if (value.defaultValue == "1") {
          mapChkBox.attr("checked", "checked");
        }
        // 맵 상세정보 표시 뷰JSON
        if (undefined != value.viewJson) {
          if (undefined != value.viewJson.jsonName)
            mapChkBox.attr("viewJson", value.viewJson.jsonName);
          if (undefined != value.viewJson.height)
            mapChkBox.attr("infoWindowHeight", value.viewJson.height);
          if (undefined != value.viewJson.width)
            mapChkBox.attr("infoWindowWidth", value.viewJson.width);
        }
      });
      // }
      /* ----------------------------------------------------------------------------- */
      // Map생성
      /* ----------------------------------------------------------------------------- */
      var _map = $("<div  id='map_canvas'></div>").appendTo(_body);

      if (option.bodyHeight != undefined) {
        _map.css("min-height", option.bodyHeight - 10);
      } else {
        var _bdyheight = _map.parent().height();
        _map.css("height", _bdyheight - 10);
      }
      if (option.bodyWidth != undefined) {
        _map.css("width", option.bodyWidth - 84);
      } else {
        var _bdyWidth = _map.parent().width();
        if (option.isShowMapChkArea) {
          _map.css("width", _bdyWidth - 212);
        } else {
          _map.css("width", _bdyWidth - 84);
        }
      }

      $(window).resize(function () {
        if (option.bodyHeight != undefined) {
          _map.css("min-height", option.bodyHeight - 10);
        } else {
          var _bdyheight = _map.parent().height();
          _map.css("height", _bdyheight - 10);
        }
        if (option.bodyWidth != undefined) {
          _map.css("width", option.bodyWidth);
        } else {
          var _bdyWidth = _map.parent().width();
          if (option.isShowMapChkArea) {
            _map.css("width", _bdyWidth - 212);
          } else {
            _map.css("width", _bdyWidth - 84);
          }
        }
      });

      if (px == undefined || py == undefined) {
        px = 37.525201; // 서울
        py = 127.027152;
        // px = 35.0645741953;
        // py = 127.746749878;
      }
      /*
       * 위치좌표가 현재 타이밍에서 취득이 안됨.//TODO if ( navigator.geolocation ) {
       * navigator.geolocation.getCurrentPosition(function(position){ posX =
       * position.coords.latitude; posY = position.coords.longitude;
       * alert(posX+"/"+posY + ": 현위치"); });
       *  }
       */
      var myLatlng = new google.maps.LatLng(px, py);
      var myOptions = {
        zoom: 11, // 12
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      map = new google.maps.Map(
        document.getElementById("map_canvas"),
        myOptions
      );

      var markers = [];
      _Obj.data("map", map);
      _Obj.data("markers", markers);

      /*
       * if (option.isClickMarker) { google.maps.event.addListener(map,
       * 'click', function(event) { _Obj.superContaner("MapAddMarker",
       * event.latLng, "추가");
       *
       * }); }
       *
       *
       * if (ptitle != undefined) { _Obj.superContaner("MapXyAddMarker",
       * px, py, ptitle); }
       */

      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      // 필터표시여부 결정
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".mapChkArea", _Obj).toggle(
        option.isShowMapChkArea == undefined ? true : option.isShowMapChkArea
      );
      $(".status", _Obj).toggle(option.isShowStatus);
      $(".AddressFind", _Obj).toggle(option.isShowAddressFind);

      _Obj.superContaner("MapList");
    },
    MapList: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");

      var infoWindow = new google.maps.InfoWindow();
      google.maps.event.addListener(_map, "click", function () {
        infoWindow.close();
      });

      // 맵수만큼 반복하여 표시함
      $(".mapChkArea input[type='checkbox']", _Obj).each(function (
        index,
        value
      ) {
        // 맵의 경우는 최초 맵을 모두 가져옴
        // if (mapname == undefined || mapname ==
        // $(this).attr("name")) {
        if ($(this).is(":checked")) {
          // alert('맵수만큼 반복!!! : ' +
          // $(this).attr("name"));
          var pl = new JSONClientParameters();
          pl.add("service", $(this).attr("service"));
          pl.add("method", $(this).attr("methodList"));
          pl.add("appType", option.appType);
          pl.add("pFormNo", option.pFormNo);
          pl.add("mapTargetFieldId", $(this).attr("mapId"));
          pl.add("execType", "MAPLIST");

          /*
           * var markerParam = new
           * JSONClientParameters();
           * markerParam.add("mapId",
           * $(this).attr("mapId"));
           * markerParam.add("mapname",
           * $(this).attr("name"));
           * markerParam.add("isMoveCenter",
           * $(this).attr("isMoveCenter"));
           *
           * markerParam.add("image",
           * $(this).attr("image"));
           * markerParam.add("shadow",
           * $(this).attr("shadow"));
           * markerParam.add("viewJson",
           * $(this).attr("viewJson"));
           * markerParam.add("infowindowHeight",
           * $(this).attr("infowindowHeight"));
           * markerParam.add("infowindowWidth",
           * $(this).attr("infowindowWidth"));
           * markerParam.add("isShowInfoWindow",
           * $(this).attr("isShowInfoWindow"));
           */
          var markerParam = {
            mapId: $(this).attr("mapId"),
            mapname: $(this).attr("name"),
            isMoveCenter: $(this).attr("isMoveCenter"),
            image: $(this).attr("image"),
            shadow: $(this).attr("shadow"),
            viewJson: $(this).attr("viewJson"),
            infowindowHeight: $(this).attr("infowindowHeight"),
            infowindowWidth: $(this).attr("infowindowWidth"),
            isShowInfoWindow: $(this).attr("isShowInfoWindow"),
          };

          PostJsonData(
            _M.svcUrl[_M.Webtype].crudUrl,
            pl,
            function (_data) {
              // alert(_data.Table.Rows.length);

              if (_data.resultData.length > 0) {
                $.each(_data.resultData, function (index, row) {
                  // alert(index+":"+
                  // row['address']);
                  // 좌표를
                  // 가지고
                  // 마커를
                  // 표시한다.
                  // _Obj.superContaner("MapAddressSetMark",
                  // row['address'],
                  // row['title']
                  // + ':'
                  // +
                  // row['address']);
                  /*
                   * refactoring
                   * start
                   */

                  var address = row["address"];
                  var title = row["title"] + "\n" + row["fullAddress"];
                  var keyValue = row["keyValue"];
                  _Obj.superContaner(
                    "MapAddressSetMark",
                    address,
                    title,
                    keyValue,
                    markerParam,
                    infoWindow,
                    function (vposition) {}
                  );
                });
                if (_json.afterListCallBack != undefined) {
                  if (_json.appType == "monpaas") {
                    var afterListCallback = eval(
                      "(" + _json.afterListCallBack + ")"
                    );
                    afterListCallback(_Obj);
                  } else {
                    eval(_json.afterListCallBack)(_Obj);
                  }
                }
              } else {
              }
            },
            function (response) {
              alert(response.Message);
            },
            _M.aSync.async
          );
        }
      });
    },

    // 주소를 가지고 위치정보를 파악해서 콜백처리한다
    MapGetGeocoder: function (address, title, callback) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = $(".body", _Obj).data("map");

      var geocoder = new google.maps.Geocoder();
      address = decodeURI(address);
      title = decodeURI(title);

      geocoder.geocode(
        {
          address: address,
        },
        function (results, status) {
          if (results != null) {
            var vposition = results[0].geometry.location;
            callback(vposition);
          } else {
            callback("");
          }
        }
      );
    },
    // 주소를 가지고 마크를 표시한다.
    MapAddressSetMark: function (
      address,
      title,
      keyValue,
      markerParam,
      infoWindow,
      callbackFn
    ) {
      _Obj = $(this);
      _Obj.superContaner(
        "MapGetGeocoder",
        address,
        title,
        function (vposition) {
          if (vposition == "") return;
          _Obj.superContaner(
            "MapAddMarker",
            vposition,
            title,
            keyValue,
            markerParam,
            infoWindow
          );
        }
      );
    },

    // 좌표를 가지고 마크를 표시한다.
    MapXyAddMarker: function (x, y, title, keyValue, markerParam, infoWindow) {
      _Obj = $(this);

      var location = new google.maps.LatLng(x, y);

      _Obj.superContaner(
        "MapAddMarker",
        location,
        title,
        keyValue,
        markerParam,
        infoWindow
      );
    },
    MapAddMarker: function (
      location,
      title,
      keyValue,
      markerParam,
      infoWindow
    ) {
      // _Obj = $(this);
      _Obj = $(".SuperMap");
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      if (
        null != _json &&
        undefined != _json.isClickMarker &&
        _json.isClickMarker
      ) {
        _Obj.superContaner("MapDeleteOverlays");
      }
      // Create our "tiny" marker icon
      var imageName = "red-dot.png"; // 디폴트 빨강 마커
      var shadowName = "msmarker.shadow.png"; // 디폴트 마커쉐도우

      if (undefined != markerParam) {
        if (undefined != markerParam.image) {
          imageName = markerParam.image + ".png";
        }
        if (undefined != markerParam.shadow) {
          shadowName = markerParam.shadow + ".png";
        }
      }

      var image = new google.maps.MarkerImage(
        "image/map/" + imageName,
        // This marker is 20 pixels wide by 32 pixels tall.
        new google.maps.Size(30, 32),
        // The origin for this image is 0,0.
        new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at 0,32.
        new google.maps.Point(0, 32)
      );
      var shadow = new google.maps.MarkerImage(
        "image/map/" + shadowName,
        // The shadow image is larger in the horizontal dimension
        // while the position and offset are the same as for the main image.
        new google.maps.Size(37, 32),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 32)
      );

      _markers = _Obj.data("markers");
      marker = new google.maps.Marker({
        position: location,
        map: _map,
        draggable: _json.isDrag == undefined ? false : _json.isDrag,
        title: title,
        mapId: markerParam != undefined ? markerParam.mapId : null,
        mapname: markerParam != undefined ? markerParam.mapname : null,
        icon: image,
        shadow: shadow,
        keyValue: keyValue,
        viewJson: markerParam != undefined ? markerParam.viewJson : null,
        infowindowHeight:
          markerParam != undefined ? markerParam.infowindowHeight : null,
        infowindowWidth:
          markerParam != undefined ? markerParam.infowindowWidth : null,
        json: _json,
      });

      _markers.push(marker);

      if (markerParam != undefined) {
        if (
          markerParam.isShowInfoWindow != undefined &&
          markerParam.isShowInfoWindow == "true"
        ) {
          google.maps.event.addListener(marker, "click", function () {
            _Obj.superContaner(
              "mapOpenInfoWindow",
              _map,
              _Obj,
              $(this)[0],
              infoWindow
            );
          });
        }
      }

      // if(markerParam != undefined && markerParam.isMoveCenter == true){
      if (markerParam == undefined || markerParam.isMoveCenter == true) {
        _map.setCenter(location);
      }
      _Obj.data("markers", _markers);

      if (null != _json && _json.isDrag) {
        google.maps.event.addListener(marker, "dragend", function () {
          // alert('Drag ended');
          // geocodePosition(marker.getPosition());
        });
      }
    },

    mapOpenInfoWindow: function (map, obj, marker, infoWindow) {
      var iWndWidth = 600;
      var iWndHeight = 400;
      if (marker.infowindowWidth != undefined)
        iWndWidth = marker.infowindowWidth;
      if (marker.infowindowHeight != undefined)
        iWndHeight = marker.infowindowHeight;

      google.maps.event.clearInstanceListeners(infoWindow);
      infoWindow.close();
      infoWindow.setContent(
        "<div id='mapinfo' style='width:" +
          iWndWidth +
          "px; height:" +
          iWndHeight +
          "px;'></div>"
      );
      infoWindow.open(map, marker);
      google.maps.event.addListener(infoWindow, "domready", function () {
        $("#mapinfo").empty();
        $("#mapinfo").superContaner("superView", marker.viewJson);
        $("#mapinfo").superContaner("Read", marker.keyValue);
      });
    },

    MapSetAll: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");

      for (var i = 0; i < _markers.length; i++) {
        // 맵네임이 파라메터로 제공되지 않을경우는 전체맵을 클리어하고, 제공되어있는 경우는 제공된 맵네임만 클리어
        if (mapId == undefined || mapId == _markers[i].mapId) {
          _markers[i].setMap(_map);
        }
      }
    },
    // Removes the overlays from the map, but keeps them in the array.
    MapClearOverlays: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      for (var i = 0; i < _markers.length; i++) {
        // 맵네임이 파라메터로 제공되지 않을경우는 전체맵을 클리어하고, 제공되어있는 경우는 제공된 맵네임만 클리어
        if (mapId == undefined || mapId == _markers[i].mapId) {
          _markers[i].setMap(null);
        }
      }
    },
    // Deletes all markers in the array by removing references to them.
    MapDeleteOverlays: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      _newMarkers = new Array();
      _Obj.superContaner("MapClearOverlays", mapId);
      _newMarkers.length = 0;
      cnt = 0;
      for (var i = 0; i < _markers.length; i++) {
        // 맵네임이 파라메터로 제공되지 않을경우는 전체맵을 클리어하고, 제공되어있는 경우는 제공된 맵네임만 클리어
        if (mapId != undefined && mapId != _markers[i].mapId) {
          _newMarkers[cnt] = _markers[i];
          cnt++;
        }
      }
      _Obj.data("markers", _newMarkers);
    },
    MapDeleteMark: function () {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      _Obj.data("markers", _markers);
    },

    /* ------------------------------------------------------- */
    /* SuperAnswer 설문조사 */
    /* ------------------------------------------------------- */

    SuperAnswer: function (option, key, mSurveyNo, mUsiteNo, dspmode) {
      // dspmode 1:preview모드 0:실제표시모드
      var _Obj = $(this);
      _Obj.html("");
      _Obj.show();
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
      if (option.theme == undefined) {
        _theme = "";
      } else {
        _theme = option.theme;
      }

      $(this)
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperAnswer")
        .addClass(_theme);
      /*
       * // superview 생성시 상위객체의 초기값이 전달된 경우라면 이를 기록해 두었다가 // 값 초기화시에 해당
       * 전달된 값을 초기값으로 설정한다. $(this).attr("parentKeyValue",
       * parentKeyValue);
       */

      /* ----------------------------------------------------------------------------- */
      // Popup 사용 변수 attr에 등록
      /* ----------------------------------------------------------------------------- */

      if (option.type != undefined) {
        $(this).attr("type", option.type);
      } else {
        $(this).attr("type", "C");
      }
      if (key != undefined) {
        $(this).attr("key", key);
      } else {
        return;
      }

      if (mUsiteNo != undefined) {
        $(this).attr("mUsiteNo", mUsiteNo);
      } else {
        return;
      }

      if (isNotEmpty(mSurveyNo)) {
        $(this).attr("sno", mSurveyNo);
      } else {
        var pl = new JSONClientParameters();
        pl.add("JOB_KEY", key);
        if (option.type != undefined && option.type == "V") {
          $.SvcCallPl(
            "VOC설문지",
            "READ",
            pl,
            function (data) {
              mSurveyNo = data.resultData[0]["M_SURVEY_NO"];
            },
            false
          );
        } else {
          $.SvcCallPl(
            "캠페인설문지",
            "READ",
            pl,
            function (data) {
              mSurveyNo = data.resultData[0]["M_SURVEY_NO"];
            },
            false
          );
        }
        if (mSurveyNo == undefined || mSurveyNo == null || mSurveyNo == "") {
          alert("설문관리번호가 존재하지 않습니다.");
          return false;
        } else {
          $(this).attr("sno", mSurveyNo);
        }
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
      var _body = $("<div class='ansbody'></div>").appendTo(_Obj);
      // 레코드 영역의 크기
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      if (option.bodyWidth > 0) _body.css("width", option.bodyWidth);

      if (mSurveyNo == undefined) {
        if (option.AnswerNo != undefined) mSurveyNo = option.AnswerNo;
      }
      if (mSurveyNo != undefined) {
        $(".ansbody", _Obj).empty();
        $(".ansbody", _Obj).attr("SNO", mSurveyNo);

        if ((dspmode = 1 || _Obj.superContaner("AnswerCheck") == 0)) {
          _Obj.superContaner("AnswerGenForm", mSurveyNo, dspmode);
        } else {
          $.MessageBox("설문응답", "이미 등록된 설문입니다.");
        }
      }
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
    },

    AnswerGenForm: function (mSurveyNo, dspmode) {
      var _Obj = $(this);
      // AnswerGenForm을 바로 호출하여 설문지를 볼때
      if (!$("div:first-child", _Obj).hasClass("ansbody")) {
        var _body = $("<div class='ansbody'></div>").appendTo(_Obj);
        $(".ansbody", _Obj).empty();
        $(".ansbody", _Obj).attr("SNO", mSurveyNo);
      }

      var option = $(this).data("jsonData");
      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Read);
      pl.add("M_SURVEY_NO", mSurveyNo);

      PostJsonData(
        _M.svcUrl[_M.Webtype].extSvc,
        pl,
        function (_data) {
          if (_data.resultData.length > 0) {
            _Obj.superContaner("AnswerForm", _data.resultData, dspmode);
            if (option.afterListCallBack != undefined)
              eval(option.afterListCallBack)(_Obj);
          } else {
          }
        },
        function (response) {
          loader.remove();
          _Obj.superContaner("tableShowMessage", response.Message);
        },
        _M.aSync.async
      );
    },

    AnswerForm: function (JsonForm, dspmode) {
      var _Obj = $(this);

      $.each(JsonForm, function (index, value) {
        _AnsType = value.REPLY_TYPE == undefined ? "30" : value.REPLY_TYPE;
        _Qno = value.M_SURVEY_QUESTION_NO;
        _surveySeq = value.SEQUENCE;

        var Area = $("<div  class='SurveyArea Qobj'></div>").appendTo(
          $(".ansbody", _Obj)
        );
        Area.attr("Qno", _Qno);
        Area.attr("AnsType", _AnsType);
        Area.attr("_surveySeq", _surveySeq);

        var head = $(
          "<div  class='head'>" +
            (index + 1) +
            ". " +
            value.QUESTION_TITLE +
            "</div>"
        ).appendTo(Area);

        switch (_AnsType) {
          case "10": // 단답형
            rlt = $(
              "<input  class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic Qitem'  type='text' />"
            ).appendTo(Area);
            rlt.data("QnoObj", Area);
            break;
          case "20": // 서술형
            rlt = $(
              "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic Qitem'></textarea>"
            ).appendTo(Area);
            rlt.data("QnoObj", Area);
            break;
          case "30": // 선택형
            _ul = $("<ul></ul>").appendTo(Area);
            var lines = value.ANSWER.split("\n");
            _row = 0;
            for (var i = 0; i < lines.length; i++) {
              if (lines[i] == "") {
                break;
              }
              $(
                "<li><input  class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic  Qitem' type='radio' value='1' name='" +
                  _Qno +
                  "' itemdesc='" +
                  lines[i] +
                  "' title='" +
                  lines[i] +
                  "'/>" +
                  lines[i] +
                  "</li>"
              ).appendTo(_ul);
            }
            break;
          case "40": // 복수선택형
            _ul = $("<ul></ul>").appendTo(Area);
            var lines = value.ANSWER.split("\n");
            _row = 0;
            for (var i = 0; i < lines.length; i++) {
              if (lines[i] == "") {
                break;
              }
              $(
                "<li><input class='Qitem' type='checkbox' value='1' name='" +
                  _Qno +
                  "' itemdesc='" +
                  lines[i] +
                  "' title='" +
                  lines[i] +
                  "'/>" +
                  lines[i] +
                  "</li>"
              ).appendTo(_ul);
            }
            break;
          case "50": // 기타서술형
            _ul = $("<ul></ul>").appendTo(Area);
            var lines = value.ANSWER.split("\n");
            _row = 0;
            for (var i = 0; i < lines.length; i++) {
              if (lines[i] == "") {
                break;
              }
              $(
                "<li><input  class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic  Qitem' type='radio' value='1' name='" +
                  _Qno +
                  "' itemdesc='" +
                  lines[i] +
                  "' title='" +
                  lines[i] +
                  "'/>" +
                  lines[i] +
                  "</li>"
              ).appendTo(_ul);
            }
            rlt = $(
              "<textarea  class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic  Qitem'></textarea>"
            ).appendTo(Area);
            break;
          case "70": // 응답자정보
            rlt = $(
              "<input  class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic Qitem'  type='text' />"
            ).appendTo(Area);
            rlt.data("QnoObj", Area);
            break;
        }
      });
      $("<br/>").appendTo($(".ansbody", _Obj));

      $("<input id='BtnOK' type='button' value='응답완료' />").appendTo(
        $(".ansbody", _Obj)
      );
      if (dspmode != 1) {
        $("#BtnOK").bind("click", function (e) {
          _Obj.superContaner("AnswerSave");
        });
      }
    },
    AnswerSave: function () {
      var _Obj = $(this);
      var SNO = $(".ansbody", _Obj).attr("SNO"); // 설문관리번호
      var TYPE = _Obj.attr("type"); // 작업종류
      var KEY = _Obj.attr("key"); // 작업키
      var mUsiteNo = _Obj.attr("mUsiteNo"); // 회원사번호

      if (KEY == "") {
        $.MessageBox("설문 오류", "설문 대상이 아닙니다."); // 20180114 키맨번호가 존재하지
        // 않을때
        return false;
      }

      // 설문문제 답안 체크Validation
      var validCheck = true;
      $(".Qobj", _Obj).each(function (index) {
        _qIdx = index + 1;
        _AnsType = $(this).attr("AnsType");
        _QAnswerS = "";
        switch (_AnsType) {
          case "10": // 단답형
            _QAnswerS = $("input", $(this)).val();
            break;
          case "20": // 서술형
            _QAnswerS = $("textarea", $(this)).val();
            break;
          case "30": // 선택형
            $("input", $(this)).each(function (index) {
              if ($(this).is(":checked")) {
                _QAnswerS = $(this).attr("itemdesc");
              }
            });
            break;
          case "40": // 복수선택형
            $("input", $(this)).each(function (index) {
              if ($(this).is(":checked")) {
                _QAnswerS = _QAnswerS + "," + $(this).attr("itemdesc");
              }
            });
            break;
          case "50": // 기타서술형
            $("input[type='radio']", $(this)).each(function (index) {
              if ($(this).is(":checked")) {
                _QAnswerS = $(this).attr("itemdesc");
              }
            });
            // 기타를 선택하였다면
            if ($("input[type='radio']", $(this)).length == _QAnswerN) {
              _QAnswerS = $("textarea", $(this)).val();
            }

            break;
          case "70": // 응답자정보
            _QAnswerS = $("input", $(this)).val();
            break;
        }

        if (undefined == _QAnswerS || "" == _QAnswerS) {
          validCheck = false;
          return false;
        }
      });

      if (validCheck == false) {
        alert(_qIdx + "번 설문에 답을 기록해주십시요.");
        return;
      }

      $(".Qobj", _Obj).each(function (index) {
        _QAnswerN = "";
        _QAnswerS = "";
        _Qno = $(this).attr("Qno");
        _AnsType = $(this).attr("AnsType");
        _surveySeq = $(this).attr("_surveySeq");
        switch (_AnsType) {
          case "10": // 단답형
            _QAnswerN = "0";
            _QAnswerS = $("input", $(this)).val();
            break;
          case "20": // 서술형
            _QAnswerN = "0";
            _QAnswerS = $("textarea", $(this)).val();
            break;
          case "30": // 선택형
            $("input", $(this)).each(function (index) {
              if ($(this).is(":checked")) {
                _QAnswerN = index * 1 + 1;
                _QAnswerS = $(this).attr("itemdesc");
              }
            });
            break;
          case "40": // 복수선택형
            $("input", $(this)).each(function (index) {
              if ($(this).is(":checked")) {
                _QAnswerN = _QAnswerN + "," + (index * 1 + 1);
                _QAnswerS = _QAnswerS + "," + $(this).attr("itemdesc");
              }
            });
            break;
          case "50": // 기타서술형
            $("input[type='radio']", $(this)).each(function (index) {
              if ($(this).is(":checked")) {
                _QAnswerN = index * 1 + 1;
                _QAnswerS = $(this).attr("itemdesc");
              }
            });
            // 기타를 선택하였다면
            if ($("input[type='radio']", $(this)).length == _QAnswerN) {
              _QAnswerS = $("textarea", $(this)).val();
            }

            break;
          case "70": // 응답자정보
            _QAnswerN = "0";
            _QAnswerS = $("input", $(this)).val();
            break;
        }
        // alert(SNO + ' / ' + TYPE + ' / ' + KEY + ' /
        // ' + _Qno + ' / ' + _AnsType + '/' + _QAnswerN
        // + ' / ' + _QAnswerS);
        var pl = new JSONClientParameters();
        pl.add("M_SURVEY_NO", SNO);
        pl.add("M_SURVEY_QUESTION_NO", _Qno);
        pl.add("JOB_TYPE", TYPE);
        pl.add("JOB_KEY", KEY);
        // pl.add("SEQUENCE", _QAnswerN);
        pl.add("SEQUENCE", _surveySeq);

        pl.add("ANSWER", _QAnswerS);
        pl.add("M_USITE_NO", mUsiteNo);
        pl.add("service", "SURVEY_ANSWER");
        pl.add("method", "ANSWER_CREATE");

        /*
         * if (_AnsType != "문항설명") {
         * $.SvcCallPl("M_SURVEY_ANSWER",
         * "ANSWER_CREATE", pl, function(data) { },
         * true); }
         */
        PostJsonData(
          _M.svcUrl[_M.Webtype].extSvc,
          pl,
          function (_data) {},
          function (response) {
            // _Obj.superContaner("tableShowMessage",
            // response.Message);
            alert("설문 응답 완료 처리중 예기치 못할 오류가 발생하였습니다. ");
            return false;
          },
          _M.aSync.sync
        );
      });
      if (_Obj.superContaner("AnswerCheck") == 0) {
        alert("설문응답 처리 실패");
      } else {
        $.MessageBox("설문 응답", "설문에 응답해주셔서 감사합니다.");
        _Obj.hide();
      }
    },
    AnswerCheck: function () {
      var _Obj = $(this);
      var SNO = $(".ansbody", _Obj).attr("SNO"); // 설문관리번호
      var TYPE = _Obj.attr("type"); // 작업종류
      var KEY = _Obj.attr("key"); // 작업키
      var result = "0";

      // var pl = new JSONClientParameters();
      var pl = new JSONClientParamNotSet();
      pl.add("M_SURVEY_NO", SNO);
      pl.add("JOB_TYPE", TYPE);
      pl.add("JOB_KEY", KEY);
      pl.add("service", "SURVEY_ANSWER");
      pl.add("method", "CHECK_ANSWER");
      pl.add("USITE", _Obj.attr("mUsiteNo"));
      PostJsonData(
        _M.svcUrl[_M.Webtype].extSvc,
        pl,
        function (data) {
          if (data.resultData[0].ANSWER_CNT > 0) {
            result = "1"; // 이미 답변이 등록되어있음.
          } else {
            result = "0"; // 답변이 등록되어 있지 않음.
          }
        },
        function (response) {
          // alert(response.Message);
          return false; // 20171127 PKH 에러발생후 다음 진행 중단처리.
        },
        false
      );

      return result;
    },

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
      // var _head = $(".head", _Obj);
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
      _colCount = option.filterView.colgroup.length * 2;
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
          _colspan =
            value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
          tdCount += _colspan;
          switch (value.type) {
            case "group":
              if (true) {
                // GROUP TD
                // 생성
                $(
                  "<td colspan='" +
                    _colCount +
                    "'><a class='icon i-20 icon-viewgroup align-middle'></a><span class='align-middle'>" +
                    value.label +
                    "</span></td>"
                ).appendTo(tr);
                tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
                _vGroup = value.name;
              }
              break;
            case "note":
              if (true) {
                // Note TD
                // 생성
                $(
                  "<td class='fldNote fldNote-bg fldNote-ft'>" +
                    value.label +
                    "</td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan + 1);
              }
              break;
            default:
              if (true) {
                // ----------------------------------------------------------------------------------
                // 라벨표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdlable = $(
                  "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft '></td>"
                )
                  .appendTo(tr)
                  .html(value.label)
                  .attr("title", value.label);
                // ----------------------------------------------------------------------------------
                // 필드표시용 TD생성
                // ----------------------------------------------------------------------------------
                _tdData = $(
                  "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
                )
                  .appendTo(tr)
                  .attr("colspan", _colspan);
                $.each(value.fieldContaner, function (index, value) {
                  _Obj.superContaner("fieldGen", _tdData, value);
                });
              }
              break;
          }
        });
        // alert(tdCount);
        for (i = tdCount; i < _colCount; i++) {
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
          _Obj.superContaner("ChartList"); //
        });
      }
    },

    ChartList: function (ListOption, trKey) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      var _tbody = $(".body", _Obj);

      pl = _Obj.superContaner("tableGetFilter");
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

    /* ------------------------------------------------------- */
    /* monDashboard 폼생성 */
    /* ------------------------------------------------------- */
    monDashboard: function (option) {
      var _Obj = $(this);
      var _jsonName = option;
      if (typeof _jsonName == "string") {
        option = GETJSON(_jsonName);
        $(this).attr("jsonName", _jsonName);
      }
      if (option == undefined) {
        option = eval(_jsonName);
      }
      _Obj
        .data("jsonData", option)
        .attr("keyvalue", "")
        .removeClass()
        .addClass("SuperContaner SuperiFrame");
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
      var superExtFilter;
      // 20180922 khma 확장필터 호출
      if (isNotEmpty(option.extFilterView)) {
        superExtFilter = _head.superExtFilter({
          filters: option.extFilterView,
          presets: [],
        });
      }
      if (option.filterView != undefined) {
        /* ----------------------------------------------------------------------------- */
        // 테이블 컬럼생성
        /* ----------------------------------------------------------------------------- */
        var _colgroup = "<colgroup>";
        $.each(option.filterView.colgroup, function (index, value) {
          if (value == undefined) return;
          _colgroup += "<col width='" + value.LabelWidth + "' />";
          _colgroup += "<col width='" + value.DataWidth + "' />";
        });
        _colgroup += "</colgroup>";
        _table.append(_colgroup);
        _colCount = option.filterView.colgroup.length * 2;
        /* ----------------------------------------------------------------------------- */
        // 테이블 TR/TD테그 생성
        /* ----------------------------------------------------------------------------- */
        var _vGroup = "";
        var codes = new Array();
        var keys = "";
        var values = [];
        if (option.filterView.tr != undefined) {
          $.each(option.filterView.tr, function (index, value) {
            if (value == undefined) return;
            var tr = $("<tr class='tr b-t b-r b-b b-l b-co b-co-basic'></tr>")
              .appendTo(_table)
              .attr("group", _vGroup);
            var tdCount = 0;
            // TD테그생성
            $.each(value.TD, function (index, value) {
              if (value == undefined) return;
              _colspan =
                value.colspan == undefined ? 1 : (value.colspan - 1) * 2 + 1;
              tdCount += _colspan;
              switch (value.type) {
                case "group":
                  if (true) {
                    // GROUP TD 생성
                    $(
                      "<td colspan='" +
                        _colCount +
                        "'><a class='icon i-20 icon-title align-middle'></a><span class='align-middle'>" +
                        value.label +
                        "</span></td>"
                    ).appendTo(tr);
                    tr.addClass("viewGroup viewGroup-bg viewGroup-ft");
                    _vGroup = value.name;
                  }
                  break;
                case "note":
                  if (true) {
                    // Note TD 생성
                    _note = $(
                      "<td class='fldNote fldNote-bg fldNote-ft'>" +
                        value.label +
                        "</td>"
                    )
                      .appendTo(tr)
                      .attr("colspan", _colspan + 1);
                    if (value.color != undefined)
                      _note.css("background-color", value.color);
                    if (value.css != undefined) _note.addClass(value.css);
                  }
                  break;
                default:
                  if (true) {
                    // ----------------------------------------------------------------------------------
                    // 라벨표시용 TD생성
                    // ----------------------------------------------------------------------------------
                    _tdlable = $(
                      "<td class='fldTdLabel fldTdLabel-bg fldTdLabel-ft'></td>"
                    )
                      .appendTo(tr)
                      .html(value.label)
                      .attr("title", value.label);
                    // ----------------------------------------------------------------------------------
                    // 필드표시용 TD생성
                    // ----------------------------------------------------------------------------------
                    _tdData = $(
                      "<td class='fldTdData field fldTdData-bg fldTdData-ft'></td>"
                    )
                      .appendTo(tr)
                      .attr("colspan", _colspan);
                    $.each(value.fieldContaner, function (index, value) {
                      if (
                        value.type == "select" &&
                        value.codes != undefined &&
                        value.codes != "" &&
                        value.codes.split(".").length == 1 &&
                        _M.Codes[value.codes] == undefined
                      ) {
                        keys += value.codes + ",";
                      }
                      codes.push(_tdData);
                      values.push(value);
                    });
                  }
                  break;
              }
            });
            // alert(tdCount);
            var addtd = "";
            for (var i = tdCount; i < _colCount; i++) {
              addtd += "<td></td>";
            }
            tr.append(addtd);

            tr.attr("group", _vGroup);
          });
          // key 수정 필요
          if (keys != undefined && keys != "") {
            keys = keys.substring(0, keys.length - 1);
            $.SvcGetCodes(
              keys,
              function (data) {
                $.each(data.resultData, function (index, value) {
                  if (_M.Codes[value.CODE_GRP] == undefined) {
                    _M.Codes[value.CODE_GRP] = new Array();
                  }
                  var flag = false;
                  $.each(_M.Codes[value.CODE_GRP], function (i, codegrp) {
                    if (
                      codegrp.CODE == value["CODE"] &&
                      codegrp.UPCODE == value["UPCODE"]
                    ) {
                      flag = true;
                      return;
                    }
                  });
                  if (!flag) {
                    _M.Codes[value.CODE_GRP].push({
                      CODE: $.decHTML(value["CODE"]),
                      DECODE: $.decHTML(value["DECODE"]),
                      UPCODE: $.decHTML(value["UPCODE"]),
                    });
                  }
                });
              },
              _M.aSync.sync
            );
          }
          $.each(codes, function (index, value) {
            _Obj.superContaner("fieldGen", codes[index], values[index]);
          });
        }
        Bordercontroll();
        _Obj.superContaner("SetDefault"); // 20140516 검색필터 디폴트값 지정
      }

      $(".SuperFilter", _Obj).toggle(option.isShowFilter);

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
      var _dashboardDiv = $("<div class='monDashboard'></div>").appendTo(_Obj);
      var gridsterDiv = $('<div class="gridster" ></div>').appendTo(
        _dashboardDiv
      );
      // $("<iframe src='#' width='100%' height='100%' frameborder='0'
      // scrolling='auto' allowtransparency='true'
      // >").appendTo(_dashboardDiv);
      // 레코드 영역의 크기
      if (option.bodyHeight > 0) {
        _dashboardDiv.css("min-height", option.bodyHeight);
      } else {
        _dashboardDiv.css("width", "100%");
        _dashboardDiv.css("min-width", "1024px");
        _dashboardDiv.css("min-height", "800px");
        gridsterDiv.css("width", "100%");

        /*$(window).resize(function() {
					event.stopPropagation(); 
					_dashboardDiv.css('width', '100%');
					_dashboardDiv.css('min-height', '800px');
					gridsterDiv.css('width', '100%');
					gridsterDiv.redrawWidget(option);
					//console.log($(this));
				});*/
      }
      /* ----------------------------------------------------------------------------- */
      // PreloadCallBack실행
      /* ----------------------------------------------------------------------------- */
      if (option.PreloadCallBack != undefined)
        eval(option.PreloadCallBack)(_Obj);
      gridsterDiv.monDashboard("destroy");
      var dashboard = gridsterDiv.monDashboard(option);
      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      // var _status = $("<div
      // class='status'>status</div>").appendTo(_Obj);
      // 필터표시여부 결정
      // $('.SuperFilter', _Obj).toggle(option.isShowFilter);
      // $('.NameArea', _Obj).toggle(option.isEditMode == undefined ?
      // false : option.isEditMode);
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      // $('.status', _Obj).toggle(option.isShowStatus);

      /* ----------------------------------------------------------------------------- */
      // LoadCallback실행
      /* ----------------------------------------------------------------------------- */
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
    },

    /* ------------------------------------------------------- */
    /* superView 내부명령 */
    /* ------------------------------------------------------- */
    tableViewExt: function (_parentPl) {
      var _Obj = $(this);
      // 상위에서 전달된 외부조건을 저장하여 둡니다
      _Obj.data("ParentData", _parentPl);
      $(this).superContaner("Read");
    },

    /* ------------------------------------------------------- */
    /* superTable 내부명령 */
    /* ------------------------------------------------------- */
    tableClear: function () {
      var _Obj = $(this);
      $(".body tbody tr", _Obj).remove();
    },
    List: function (oCmd) {
      var _Obj = $(this);
      if (undefined != oCmd && oCmd.parents(".gs-wd").length > 0) {
        //위젯일 경우 우선적으로 처리함.
        _Obj = oCmd.parents(".gs-wd").find(".SuperTable");
      }
      _Obj.find(".trChkAll input").attr("checked", false);
      _Obj.attr("_viewpage", 1);
      _Obj.superContaner("tableList");
    },
    tableList: function (ListOption, trKey) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");

      var _reqFld = _Obj.find(".head:first").superContaner("isRequired");
      if (_reqFld.toKeyString() != "") {
        alert(
          "필수 조회조건 항목중 [" +
            _reqFld.toKeyString() +
            "] 의 입력이 누락되었습니다."
        );
        return false;
      }

      var _RefreshBeforValue = $(".SelectTR", _Obj).attr("keyvalue");

      _Obj.superContaner("tableClear");
      pl = _Obj.superContaner("tableGetFilter");
      pl.add("service", _json.service);
      pl.add("method", _json.method.List);
      pl.add("_order", _Obj.attr("_order"));
      /* 20180124 jwkim SQL sort속성 추가 */
      pl.add("_sort", _Obj.attr("_sort"));
      pl.add("_viewpage", _Obj.attr("_viewpage"));
      pl.add("_pagecnt", _Obj.attr("_pagecnt"));
      // 상위에서 전달된 외부조건 추가로 설정합니다.
      if (_Obj.data("ParentData") != undefined) {
        var _ext = _Obj.data("ParentData");
        var ppl = _ext.toArray();
        for (var p in ppl) {
          pl.add(p, ppl[p]);
        }
      }
      // parent 키가 있는 경우 해당 정보를 조건에 추가한다.
      if (_Obj.attr("jobType") != undefined) {
        pl.add("JOB_TYPE", _Obj.attr("jobType"));
      }
      if (_json.parentKey != undefined) {
        if (
          _Obj.attr("parentKeyValue") == undefined &&
          _Obj.attr("id") != "ShowTableJson_ShowEdit"
        ) {
          alert("상위키값을 알수 없습니다");
          return;
        }
        if (
          _Obj.attr("parentKeyValue") == "" &&
          _Obj.attr("id") != "ShowTableJson_ShowEdit"
        ) {
          alert("상위키값이 공백입니다.");
          return;
        }
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add(_json.parentKey, _Obj.attr("parentKeyValue"));
        }
      }
      // ----------------------------------------------------------------------------
      // 목록 이중실행 방지를 위해 추가함. 20171108
      // ----------------------------------------------------------------------------
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
        var nEnd = new Date().getTime(); // 종료시간 체크(단위 ms)

        var nDiff = nEnd - nStart; // 두 시간차 계산(단위 ms)
        if (nDiff <= 5000) {
          // && ( _M.PrevActGbn.prevMenuId !=
          // _M.PrevActGbn.currMenuId ) ) {
          return;
        } else {
          // alert(nDiff);
        }
      }
      _Obj.attr("RunTime", _M.f.d.getTimeStamp());
      $(".body.tbody", _Obj).block({
        message: '<img src="../image/loader.gif" width="200" />',
        css: {
          "background-color": "transparent",
          border: "1px solid transparent",
        },
        overlayCSS: {
          backgroundColor: "transparent",
        },
        blockOverlay: {
          display: "none",
        },
      });

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          $(".body", _Obj).unblock();
          _Obj.attr("RunTime", ""); // 20171108 이중실행방지를 위해 추가

          if (_data.resultData.length > 0) {
            _Obj.superContaner("tableShowData", _data.resultData, ListOption);
            // 만일 데이터조회가 하위VIew의 업데이트에 의한 refresh인 경우는 해당 레코드의 선택만 변경한다.
            if (ListOption == "Refresh") {
              $("tr[keyvalue='" + trKey + "']", _Obj).addClass("SelectTR");
            }

            if (_Obj.parent().hasClass("Tabs")) {
              var _id = _Obj.attr("id");
              var _tObj = _Obj.parent();

              _tObj
                .find("a[href='#" + _id + "']")
                .parent()
                .addClass("filled");
            }

            // if (_json.afterListCallBack != undefined)
            // eval(_json.afterListCallBack)(_Obj);
          } else {
            var _id = _Obj.attr("id");
            var _tObj = _Obj.parent();
            _tObj
              .find("a[href='#" + _id + "']")
              .parent()
              .removeClass("filled");
            _Obj.superContaner("tableShowMessage", "0 Records ...");
            $(".page li", _Obj).addClass("none");
            $(".records", _Obj).text("Records : 0");
            $(".pages", _Obj).text("Pages : 0");
          }

          if (
            $("#MainView").hasClass("campaignWorkFlow") == true &&
            _Obj.hasClass("campaignWorkFlow") == true
          ) {
            if (_Obj.find(".body").find("tbody tr").size() == 0) {
              //console.log('no list data');
              jsPlumb.reset();
              jsPlumb.detachEveryConnection();
              jsPlumb.deleteEveryEndpoint();
              jsPlumb.Defaults.Container.empty();
            }
          }

          // 2014.04.07 dmjung :: scroll 여부 체크 후 고정된 thead 싱크 맞춤.
          if (undefined != _json.isTheadFix && true == _json.isTheadFix) {
            syncThead(_Obj.find(".thead"), _Obj.find(".tbody"), _Obj);
            // var thick = getScrollbarWidth();
            // var result = _Obj.find('.tbody').hasScrollBar();
            // if ( result.horizontal == true && result.vertical == true
            // ) {
            // _Obj.find('.thead').css('padding-right', thick);
            // }
          }

          _Obj.find(".page ul").show();
          if (_json.afterListCallBack != undefined)
            eval(_json.afterListCallBack)(_Obj);

          if (_M.PrevActGbn.prevMenuId != _M.PrevActGbn.currMenuId) {
            _M.PrevActGbn.prevMenuId = _M.PrevActGbn.currMenuId;
          }

          // keyValue setting
          var noticeKey = sessionStorage.getItem("noticeKey");
          if (noticeKey != undefined && noticeKey != "") {
            $(_json.mainViewID).superContaner("Read", noticeKey);

            _Obj.toggle(false);
            $(_json.mainViewID).toggle(true);
            sessionStorage.removeItem("noticeKey");
          }
        },
        function (response) {
          $(".body", _Obj).unblock();
          _Obj.attr("RunTime", ""); // 20171108 이중실행방지를 위해 추가
          _Obj.superContaner("tableShowMessage", response.Message);

          // 2014.03.24 dmjung start :: 레코드가 없을 때 페이징 숨김
          if (_Obj.find(".body").find("tbody tr").size() == 0) {
            _Obj.find(".page ul").hide();
          }
          // 2014.03.24 dmjung end :: 레코드가 없을 때 페이징 숨김
        },
        _M.aSync.async
      );
    },

    /* 외부조건에 의한 리스트 실행 */
    tableListExt: function (_parentPl) {
      var _Obj = $(this);
      // 상위에서 전달된 외부조건을 저장하여 둡니다
      _Obj.data("ParentData", _parentPl);
      $(this).superContaner("List");
    },
    /* 상위키값조건에 의한 리스트 실행 */
    tableListParent: function (_parentKey) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      _Obj.attr("parentKeyValue", _parentKey);
      $(this).superContaner("List");
    },
    ListGallery: function () {
      var _Obj = $(this);
      _Obj.attr("_viewpage", 1);
      _Obj.superContaner("GalleryList");
    },
    GalleryList: function () {
      var _Obj = $(this);
      $(".body li", _Obj).remove();
      _json = $(this).data("jsonData");
      pl = _Obj.superContaner("tableGetFilter");
      pl.add("service", _json.service);
      pl.add("method", _json.method.List);
      pl.add("_order", _Obj.attr("_order"));
      pl.add("_viewpage", _Obj.attr("_viewpage"));
      pl.add("_pagecnt", _Obj.attr("_pagecnt"));

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          if (_data.resultData.length > 0) {
            _Obj.superContaner("GalleryShowData", _data.resultData);
            if (_json.afterListCallBack != undefined)
              eval(_json.afterListCallBack)(_Obj);
          } else {
            _Obj.superContaner("tableShowMessage", "0 Records ...");
            $(".page li", _Obj).addClass("none");
            $(".records", _Obj).text("Records : 0");
            $(".pages", _Obj).text("Pages : 0");
          }
        },
        function (response) {
          _Obj.superContaner("tableShowMessage", response.Message);
        },
        _M.aSync.async
      );
    },

    // 2018.12.03 dmjung :: 김이사님 컴퍼넌트에 필요한 메서드.
    FilterClear: function () {
      var _Obj = $(this);
      _Obj.superContaner("tableModeChange", true);
      _Obj.superContaner("Clear");
      _Obj.superContaner("SetDefault");
    },

    /* multiEmail, multitel,multiaddress타입의 목록을 취득하기 위한 메소드 */
    MultiContactList: function (searchKey, type, service, kind, jobType) {
      if (jobType == undefined) {
        alert(
          "구조체에 jobType속성을 지정해주십시요. \n멀티 타입 데이터 조회에 실패하였습니다."
        );
        return;
      }
      var dataset;
      var method = type;
      var pl = new JSONClientParameters();
      pl.add("service", "MON_COMMON");
      pl.add("method", service + "_LIST");
      pl.add("SEARCH_KEY", searchKey);
      pl.add("JOB_TYPE", jobType);
      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          dataset = _data;
        },
        function (response) {
          alert(response.Message);
        },
        _M.aSync.sync
      );
      return dataset;
    },

    // 2018.08.05 dmjung :: Lunar to Solar // Solar to Lunar
    LunardateSet: function (type, object) {
      var dataset;
      var year = object.find("select#lunaryear");
      var month = object.find("select#lunarmonth");
      var day = object.find("select#lunarday");

      var pick = object.find(".hasDatepicker");
      var solar = object.find("span#solar");

      var yy;
      var mm;
      var dd;

      var flag = object.find("input#yundal").attr("value");
      var dayValue;
      if (isNotEmpty(object.find("#lunartype").attr("dateval"))) {
        dayValue = object.find("#lunartype").attr("dateval").substring(8);
      }

      if (type == "Lunar") {
        yy = year.val();
        mm = month.val();
        dd = day.val();

        if (yy == "default" || yy == undefined || yy == null) {
          return false;
        }
        if (mm == "default" || mm == undefined || mm == null) {
          return false;
        }

        var pl = new JSONClientParameters();
        pl.add("service", "MON_COMMON");
        pl.add("method", "LUNAR_CAL_YDAYS_LIST");
        pl.add("LUNAR_DATE", yy + "-" + mm);
        pl.add("YUN", flag == "1" ? 1 : 0);
        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {
          if (_data.resultData[0] == undefined) {
            solar.text("");
            return false;
          } else {
            $.each(_data.resultData, function (index, row) {
              day.get(0).options[0] = new Option("선택", "default");
              index++;
              day.get(0).options[index] = new Option(
                row["LUN_DAYS"] + "일",
                row["LUN_DAYS"]
              );
              if (index == _data.resultData.length) {
                yy = year.val();
                mm = month.val();
                if (dd == "default" || dd == null || dd == undefined) {
                  dd = "01";
                }
                day.val(dd);
                var pl = new JSONClientParameters();
                pl.add("service", "MON_COMMON");
                pl.add("method", "LUNAR_CAL_YDATE_READ");
                pl.add("LUNAR_DATE", yy + "-" + mm + "-" + dd);
                pl.add("YUN", flag == "1" ? 1 : 0);
                PostJsonData(
                  _M.svcUrl[_M.Webtype].crudUrl,
                  pl,
                  function (_data) {
                    solar.text(_data.resultData[0]["SOL_DATES"]);
                    pick.datepicker(
                      "setDate",
                      _data.resultData[0]["SOL_DATES"]
                    );
                  },
                  function (response) {
                    alert(response.Message);
                  },
                  _M.aSync.sync
                );
              }
            });
          }
        });
      } else if (type == "Yun") {
        yy = year.val();
        mm = month.val();
        if (dayValue == undefined || dayValue == "" || dayValue == null)
          dd = day.val();
        else dd = dayValue;
        if (dd == "default") {
          dd = "01";
        }
        var pl = new JSONClientParameters();
        pl.add("service", "MON_COMMON");
        pl.add("method", "LUNAR_CAL_YDAYS_LIST");
        pl.add("LUNAR_DATE", yy + "-" + mm);
        pl.add("YUN", 1);
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            if (_data.resultData[0] == undefined) {
              alert("해당 월이 윤달이 아닙니다.");
              solar.text("");
              // 150216 stingo 수정
              $("input#yundal").prop("checked", false);
              return false;
            } else {
              $.each(_data.resultData, function (index, row) {
                day.get(0).options[0] = new Option("선택", "default");
                index++;
                day.get(0).options[index] = new Option(
                  row["LUN_DAYS"] + "일",
                  row["LUN_DAYS"]
                );
                if (index == _data.resultData.length) {
                  day.val(dd);
                  yy = year.val();
                  mm = month.val();
                  dd = day.val();
                  if (dd == "default" || dd == null || dd == undefined) {
                    dd = "01";
                  }
                  var pl = new JSONClientParameters();
                  pl.add("service", "MON_COMMON");
                  pl.add("method", "LUNAR_CAL_YDATE_READ");
                  pl.add("LUNAR_DATE", yy + "-" + mm + "-" + dd);
                  pl.add("YUN", 1);
                  PostJsonData(
                    _M.svcUrl[_M.Webtype].crudUrl,
                    pl,
                    function (_data) {
                      solar.text(_data.resultData[0]["SOL_DATES"]);
                      pick.datepicker(
                        "setDate",
                        _data.resultData[0]["SOL_DATES"]
                      );
                    },
                    function (response) {
                      alert(response.Message);
                    },
                    _M.aSync.sync
                  );
                  if (day.val() == "default") {
                    day.val(index);
                  }
                }
              });
            }
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.sync
        );
      } else if (type == "Unyun") {
        yy = year.val();
        mm = month.val();
        dd = day.val();
        if (dd == "default") {
          dd = "01";
        }
        var pl = new JSONClientParameters();
        pl.add("service", "MON_COMMON");
        pl.add("method", "LUNAR_CAL_YDAYS_LIST");
        pl.add("LUNAR_DATE", yy + "-" + mm);
        pl.add("YUN", 0);
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            $.each(_data.resultData, function (index, row) {
              if (index == 0) {
                day.empty();
              }
              day.get(0).options[0] = new Option("선택", "default");
              index++;
              day.get(0).options[index] = new Option(
                row["LUN_DAYS"] + "일",
                row["LUN_DAYS"]
              );
              if (index == _data.resultData.length) {
                if (dayValue == undefined || dayValue == "" || dayValue == null)
                  day.val(dd);
                else day.val(dayValue);
                yy = year.val();
                mm = month.val();
                dd = day.val();
                if (dd == "default" || dd == null || dd == undefined) {
                  dd = "01";
                }
                var pl = new JSONClientParameters();
                pl.add("service", "MON_COMMON");
                pl.add("method", "LUNAR_CAL_YDATE_READ");
                pl.add("LUNAR_DATE", yy + "-" + mm + "-" + dd);
                pl.add("YUN", 0);
                PostJsonData(
                  _M.svcUrl[_M.Webtype].crudUrl,
                  pl,
                  function (_data) {
                    solar.text(_data.resultData[0]["SOL_DATES"]);
                    pick.datepicker(
                      "setDate",
                      _data.resultData[0]["SOL_DATES"]
                    );
                  },
                  function (response) {
                    alert(response.Message);
                  },
                  _M.aSync.sync
                );

                if (day.val() == "default") {
                  day.val(index);
                }
              }
            });
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.sync
        );
      } else {
        var forLunar = $(".hasDatepicker", object).val();
        var pl = new JSONClientParameters();
        pl.add("service", "MON_COMMON");
        pl.add("method", "LUNAR_CAL_LDATE_READ");
        pl.add("SOLAR_DATE", forLunar);
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            dataset = _data;
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.sync
        );
        yy = dataset.resultData[0]["LUN_DATES"].substring(0, 4);
        mm = dataset.resultData[0]["LUN_DATES"].substring(5, 7);
        dd = dataset.resultData[0]["LUN_DATES"].substring(8, 10);

        year.val(yy);
        month.val(mm);

        var pl = new JSONClientParameters();
        pl.add("service", "MON_COMMON");
        pl.add("method", "LUNAR_CAL_YDAYS_LIST");
        pl.add("LUNAR_DATE", yy + "-" + mm);
        pl.add("YUN", 0);
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            $.each(_data.resultData, function (index, row) {
              day.get(0).options[0] = new Option("선택", "default");
              index++;
              day.get(0).options[index] = new Option(
                row["LUN_DAYS"] + "일",
                row["LUN_DAYS"]
              );
            });
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.sync
        );

        day.val(dd);

        yy = year.val();
        mm = month.val();
        dd = day.val();
        if (dd == "default") {
          dd = "01";
        }
        var pl = new JSONClientParameters();
        pl.add("service", "MON_COMMON");
        pl.add("method", "LUNAR_CAL_YDATE_READ");
        pl.add("LUNAR_DATE", yy + "-" + mm + "-" + dd);
        pl.add("YUN", 0);
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            solar.text(_data.resultData[0]["SOL_DATES"]);
            pick.datepicker("setDate", _data.resultData[0]["SOL_DATES"]);
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.sync
        );
      }
    },

    tableNew: function () {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      _Obj.attr("viewstatus", "N");
      _Obj.superContaner("modeChange", true);
      // -----------------------------------------------
      // MainView link
      // -----------------------------------------------
      if (option.mainViewID != undefined) {
        $(option.mainViewID).superContaner("New");
        if (option.mainViewToggle) {
          _Obj.toggle(false);
          $(option.mainViewID).toggle(true);
        }
      } else if (option.isSubTable != undefined) {
        // -----------------------------------------------
        // Sub SuperTable
        // -----------------------------------------------
        switch (option.isSubTable.mode) {
          case "SuperSubTable":
            _subTableST = GETJSON(option.isSubTable.jsonName);
            if (_subTableST.ContanerType != "superTable") {
              alert("SuperTable로 선언한 구조체를 사용하세요.");
            } else {
              var pop = $.ShowSubTableJson(
                option.isSubTable.jsonName,
                _Obj,
                _Obj.attr("parentKeyValue")
              ); // .attr("parentKeyValue",
              // _Obj.attr('parentKeyValue'));
              if (_Obj.attr("jobType") != undefined) {
                pop.attr("jobType", _Obj.attr("jobType"));
              }
            }
            break;
          case "SuperSubView":
            _subTableST = GETJSON(option.isSubTable.jsonName);
            if (_subTableST.ContanerType != "superView") {
              alert("SuperView로 선언한 구조체를 사용하세요.");
            } else {
              var obj = $.ShowEditJson(option.isSubTable.jsonName, _Obj);
              if (_Obj.attr("jobType") != undefined) {
                $("#ShowEdit").attr("jobType", _Obj.attr("jobType"));
              }
            }
            break;
          case "SuperFile":
            $.GetFile(function (urlData, fileName) {
              var pl = new JSONClientParameters();
              pl.add("JOB_TYPE", _Obj.attr("jobType"));
              pl.add("JOB_KEY", _Obj.attr("parentKeyValue"));
              pl.add("FILE_PATH", urlData);
              pl.add("FILE_NAME", fileName);
              $.SvcCallPl("파일관리", "Create", pl, function (Data) {
                _Obj.superContaner("List");
              });
            });
            break;
        }
      }
      // 2018.09.16 dmjung :: 추가버튼 시 afterNewCallBack 동작하도록. ( New: 에
      // 정의되어있던 것임. TableNew 에도 추가 )
      if (option.afterNewCallBack != undefined)
        eval(option.afterNewCallBack)(_Obj);
    },
    tableDelete: function () {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      $(document.body).append('<div id="tabledailog"></div>');
      $("#tabledailog").html("정말로 선택된 자료를 삭제합니까?");
      $("#tabledailog").dialog({
        autoOpen: false,
        width: 400,
        height: 200,
        modal: true,
        closeOnEscape: false,
        title: "자료삭제",
        buttons: {
          확인: function () {
            $("tr[selected='selected']", _Obj).each(function (index) {
              var _tr = $(this);
              _key = _tr.attr("keyvalue");
              var pl = new JSONClientParameters();
              pl.add("service", option.service);
              pl.add("method", option.method.Delete);
              pl.add("key", _key);
              pl.add(option.keyName, _key);

              PostJsonData(
                _M.svcUrl[_M.Webtype].crudUrl,
                pl,
                function (_data) {
                  // alert("Delete
                  // ..
                  // ok");
                  _tr.remove();
                  if (option.afterDeleteCallBack != undefined)
                    eval(option.afterDeleteCallBack)(_key, _Obj);
                },
                function (response) {
                  // $("#hm").html('Error
                  // : ' +
                  // response.Message);
                  alert(response.Message);
                },
                _M.aSync.sync
              );
            });
            // 2018.07.25 dmjung :: 삭제 후 리스트 다시 불러오기
            // 추가..
            _Obj.superContaner("List");
            $("#tabledailog").remove();
            // var _ParentObj =
            // _Obj.data("parentObj");
            // if (_ParentObj != undefined) {
            // var _keyValue =
            // _ParentObj.attr('keyvalue');
            // _ParentObj.superContaner('Read',_keyValue);
            // } else {
            // _Obj.superContaner('List');
            // }
          },
          취소: function () {
            $("#tabledailog").remove();
          },
        },
      });
      $("#tabledailog").dialog("open");
    },
    tableSave: function () {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      var nSuccess = 0;
      var nFail = 0;
      $("tr[selected='selected']", _Obj).each(function (index) {
        var _tr = $(this);
        _key = _tr.attr("keyvalue");
        var pl = new JSONClientParameters();
        pl.add("service", option.service);
        pl.add("method", option.method.Create);
        if (_key != undefined) {
          pl.add("key", _key);
          pl.add(option.keyName, _key);
        }
        if (option.parentKey != undefined) {
          if (_Obj.attr("parentKeyValue") != undefined) {
            pl.add(option.parentKey, _Obj.attr("parentKeyValue"));
          }
        }
        if (_Obj.attr("jobType") != undefined) {
          pl.add("JOB_TYPE", _Obj.attr("jobType"));
          if (_Obj.attr("parentKeyValue") != undefined) {
            pl.add("JOB_KEY", _Obj.attr("parentKeyValue"));
          }
        }

        $("td", _tr).each(function (index) {
          var _fld = $(".fieldContaner", $(this));
          if (_fld.length == 0) {
            _fld = $(this);
          } else {
            _fld = $(".fieldContaner", $(this));
          }
          if (_fld.attr("field") != undefined) {
            var _flddata = _fld.attr("value");
            if (_flddata == undefined) _flddata = _fld.text();
            if (_flddata != undefined) {
              pl.add(_fld.attr("field"), _flddata);
            }
          }
        });

        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            // $('td:eq(2)', _tr).html('성공');
            // alert("Delete .. ok");
            nSuccess++;
          },
          function (response) {
            // $("#hm").html('Error : ' +
            // response.Message);
            // alert(response.Message);
            // $('td:eq(2)', _tr).html('실패: ' +
            // response.Message).attr('title',
            // response.Message);
            nFail++;
          },
          _M.aSync.sync
        );
      });
      alert("추가성공:" + nSuccess + "건\n추가실패:" + nFail + "건");
      _Obj.superContaner("List");
    },

    tableImport: function () {
      var _Obj = $(this);
      var JsonForm = $(this).data("formatData");
      _tbody = $(".body tbody", _Obj);

      $.ImportPopUp(function (ImportData) {
        // alert(lines);
        var TrData = _Obj.data("TRdata");
        $("td", TrData).removeClass("none");
        $.each($(".body col", _Obj), function (index, col) {
          if ($(this).hasClass("none")) {
            $("td:eq(" + index + ")", TrData).addClass("none");
          }
        });

        $("tr", _tbody).remove();
        var lines = ImportData.split("\n");
        _row = 0;
        for (var i = 0; i < lines.length; i++) {
          if (lines[i] == "") {
            break;
          }
          _tbody.append(TrData.clone());
          var addTr = $("tr:last", _tbody);
          var cells = lines[i].split("\t");
          for (var j = 0; j < cells.length; j++) {
            addTr.find("td:eq(" + (j * 1 + 3) + ")").html(cells[j]);
          }
        }
      });
    },

    tableRefresh: function (trKey) {
      var _Obj = $(this);
      _Obj.superContaner("tableList", "Refresh", trKey);
    },

    /* sub Table에서 상위 view를 호출하여 새로 고침함 */
    ParentRefresh: function () {
      var _Obj = $(this).data("parentObj");
      var _keyValue = _Obj.attr("keyvalue");
      _Obj.superContaner("Read", _keyValue);
    },

    viewParentKeyRefresh: function () {
      var _Obj = $(this);
      // 2018.07.29 jwkim ::
      if (undefined != _Obj.data("jsonData").method.Read) {
        _parentkeyValue = _Obj.attr("parentKeyValue");
        _Obj.superContaner("Read", _parentkeyValue);
      }
    },

    viewRefresh: function () {
      var _Obj = $(this);
      var _keyValue = _Obj.attr("keyvalue");
      if (_keyValue == undefined || _keyValue == "") {
        _keyValue = _Obj.attr("parentKeyValue");
      }
      _Obj.superContaner("Read", _keyValue);
    },

    DownCsv: function () {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      var _popup = false;

      for (var c = 0; c < _json.jobs.length; c++) {
        if (_json.jobs[c].inComm == "DownCsv") {
          _popup = _json.jobs[c].popup;
        }
      }

      if (_popup) {
        if (_json.method.Excel == undefined) {
          alert("CSV다운 항목 선택 시 Excel Method를 사용해주세요.");
        } else {
          var _col = new Array();
          var i = 0;
          $(".body thead > tr:first-child > th", _Obj).each(function (
            index,
            value
          ) {
            if (
              $(this).attr("field") != undefined &&
              $(this).attr("field") != "" &&
              $(this).attr("field") != "ROWNUM"
            ) {
              _col[i] = $(this).attr("field");
              i++;
            }
          });
          $.GetExcelColumn(_Obj, "CSV", _col, _jobInfo);
        }
      } else {
        var _svc = _json.method.List;
        if (_json.method.Excel != "" && _json.method.Excel != undefined) {
          _svc = _json.method.Excel;
        }

        pl = _Obj.superContaner("tableGetFilter");
        pl.add("_order", _Obj.attr("_order"));
        pl.add("USITE", _M.UserInfo.SID);
        pl.add("UID", _M.UserInfo.id);
        pl.add("UKEY", _M.UserInfo.key);
        pl.add("key", "0");
        pl.add("ExcelService", _svc);

        if (_jobInfo.xlsName != "" && _jobInfo.xlsName != undefined) {
          pl.add("xlsName", _jobInfo.xlsName);
        }

        if (
          _Obj.attr("parentkeyvalue") != null &&
          _Obj.attr("parentkeyvalue") != undefined &&
          _Obj.attr("parentkeyvalue") != ""
        ) {
          pl.add(_json.parentKey, _Obj.attr("parentkeyvalue"));
        }

        $.SvcDownCsv(_json.service, pl);
      }
    },

    DownXls: function (oCmd) {
      var _Obj = $(this);
	  var _RCD_CNT = $('.pgMsg.records',_Obj).text();
	  var regex = /[^0-9]/g;
	  if(_RCD_CNT.replace(regex,"") == "0"){
		  alert('조회 건수가 0건 입니다. 데이터를 조회해 주세요.');
	  } else {
		  var _json = $(this).data("jsonData");
		  var _popup = false;
		  var idx = oCmd.attr("index");
		  // 20170905 액셀다운로드 확장기능(확장클래스 사용)
		  var _jobInfo;
		  for (var c = 0; c < _json.jobs.length; c++) {
			if (_json.jobs[c].inComm == "DownXls" && _json.jobs[c].index == idx) {
			  _popup = _json.jobs[c].popup;
			  _jobInfo = _json.jobs[c];
			}
		  }
		  // todo 20140107 액셀다운로드 개선을 위해 excelOpt:{excelType, excelService,
		  // excelMethod와 }을 추가

		  var _svc = _json.method.List;
		  if (_json.method.Excel != "" && _json.method.Excel != undefined) {
			_svc = _json.method.Excel;
		  }
		  pl = _Obj.superContaner("tableGetFilter");
		  pl.add("_order", _Obj.attr("_order"));
		  pl.add("_sort", _Obj.attr("_sort"));
		  pl.add("USITE", _M.UserInfo.SID);
		  pl.add("GSITE", _M.UserInfo.gsite);
		  pl.add("GCORP", _M.UserInfo.gcorp);
		  pl.add("UID", _M.UserInfo.id);
		  pl.add("UKEY", $("#authValue").val());
		  pl.add("key", "0");
		  // pl.add("ExcelService", _svc);
		  pl.add("MENUID", _M.PrevActGbn.currMenuId);
		  pl.add("STEPMENU", _M.PrevActGbn.currStepMenu);
		  pl.add("ACTIONNAME", _M.PrevActGbn.actionName);

		  var serviceName = "";
		  // 20140107 액셀처리 관련 옵션 추가 start
		  if (_jobInfo.xlsOption != undefined) {
			var xlsOpt = _jobInfo.xlsOption;
			if (xlsOpt.xlsName != "" && xlsOpt.xlsName != undefined) {
			  pl.add("xlsName", xlsOpt.xlsName);
			}

			if (xlsOpt.extClass != "" && xlsOpt.extClass != undefined) {
			  pl.add("extClass", _jobInfo.xlsOption.extClass);
			}

			if (xlsOpt.type != "" && xlsOpt.type != undefined) {
			  pl.add("xlsType", xlsOpt.type);
			} else {
			  pl.add("xlsType", "report");
			}

			if (xlsOpt.service != "" && xlsOpt.service != undefined) {
			  serviceName = xlsOpt.service; // pl.add("xlsService",
			  // xlsOpt.service);
			} else {
			  serviceName = _json.service; // pl.add("xlsService",
			  // _json.service);
			}

			if (xlsOpt.method != "" && xlsOpt.method != undefined) {
			  pl.add("xlsMethod", xlsOpt.method);
			} else {
			  pl.add("xlsMethod", _svc);
			}
		  } else {
			pl.add("xlsType", "report");
			// pl.add("xlsService", _json.service);
			pl.add("xlsMethod", _svc);
			serviceName = _json.service;
		  }
		  var dispCols;
		  if ($(".SuperExtFilter", _Obj).length > 0) {
			dispCols = superExtFilter.getParameters("label");
		  } else {
			dispCols = _Obj.superExtFilter({
			  exec: "getCurrentColsInfo",
			});
		  }
		  pl.add("dispCols", dispCols);
		  pl.add("xlsService", serviceName);

		  pl.add("structureName", _Obj.attr("jsonname"));
		  // 20140107 액셀처리 관련 옵션 추가 end

		  /*
		   * if(_jobInfo.xlsName != "" && _jobInfo.xlsName != undefined) {
		   * pl.add("xlsName", _jobInfo.xlsName); }
		   */
		  // 20170905 액셀 확장클래스를 지정하면 처리할 클래스명을 파라메터로 넘김 김정원
		  /*
		   * if(_jobInfo.extClass != "" && _jobInfo.extClass != undefined) {
		   * pl.add("extClass", _jobInfo.extClass); }
		   */
		  if (
			_Obj.attr("parentkeyvalue") != null &&
			_Obj.attr("parentkeyvalue") != undefined &&
			_Obj.attr("parentkeyvalue") != ""
		  ) {
			pl.add(_json.parentKey, _Obj.attr("parentkeyvalue"));
		  }
		  // (type, cols, service, pl) {
		  if (_jobInfo.xlsOption != undefined && _jobInfo.xlsOption.popup) {
			var _col = new Array();
			var i = 0;

			$(".body thead > tr:first-child > th", _Obj)
			  .not(".resizeBar")
			  .each(function (index, value) {
				if (
				  $(this).attr("field") != undefined &&
				  $(this).attr("field") != "" &&
				  $(this).attr("field") != "ROWNUM"
				) {
				  _col[$(this).attr("field")] = $(this).attr("label");
				  i++;
				}
			  });
			// 서비스, 함수 제대로 들어갔는지 확인하고 pl데이터 들어갔는지 확인
			$.GetExcelColumn("XLS", _col, _jobInfo.service, pl);
		  } else {
			$.SvcDownXls(_json.service, pl);
		  }
	  }
    },
    
    DownXlsOld: function() {
        var _Obj = $(this);
        var _json = $(this).data("jsonData");
        var _popup = false;
		//20170905 액셀다운로드 확장기능(확장클래스 사용)
		var _jobInfo; 
        for(var c = 0;c<_json.jobs.length;c++){
            if(_json.jobs[c].inComm == "DownXlsOld"){
                _popup = _json.jobs[c].popup;
				_jobInfo = _json.jobs[c];
            }
        }
        var _svc = _json.method.List;
        if(_json.method.Excel != "" && _json.method.Excel != undefined){
            _svc = _json.method.Excel;
        }
        pl = _Obj.superContaner("tableGetFilter");
        pl.add("_order", _Obj.attr("_order"));
        pl.add("USITE", _M.UserInfo.SID);
        pl.add("UID", _M.UserInfo.id);
        pl.add("UKEY", _M.UserInfo.key);				
        pl.add("key", "0");
        pl.add("ExcelService", _svc);	
        pl.add("MENUID", _M.PrevActGbn.currMenuId);
        pl.add("STEPMENU", _M.PrevActGbn.currStepMenu);
        pl.add("ACTIONNAME", _M.PrevActGbn.actionName);	
 
		//20170905 액셀 확장클래스를 지정하면 처리할 클래스명을 파라메터로 넘김 김정원
        if(_jobInfo.extClass != "" && _jobInfo.extClass != undefined) {
			pl.add("extClass", _jobInfo.extClass);
		}
		if(_jobInfo.xlsName != "" && _jobInfo.xlsName != undefined) {
			pl.add("xlsName", _jobInfo.xlsName);
		}
		if (_Obj.attr("parentkeyvalue") != null && _Obj.attr("parentkeyvalue") != undefined && _Obj.attr("parentkeyvalue") != "") {
            pl.add(_json.parentKey, _Obj.attr("parentkeyvalue"));
        }
			
		$.blockUI({ message: '<h1><img src="/image/block_loading.gif" /><br> 처리중...</h1>',
					baseZ: 100000,
					css: { color:'#ffffff', border:'2px solid #888888', backgroundColor:'#000000'}
					});
           
	    $.SvcDownXlsOld(_json.service, pl);
			
		setTimeout($.unblockUI, 5000); 
            
    },

    /* ------------------------------------------------------- */
    /* Excel이나 CSV등의 데이터파일을 디비에 저장할때 사용 */
    /* ------------------------------------------------------- */
    uploadDataFileOld: function (jobObj) {
		debugger;
		
		var errMsg = "데이터 업로드 처리 옵션이 정상적으로 정의되어 있지 않습니다.\n관리자에게 문의하여 주시기 바랍니다.";
	  
		if (isEmpty(jobObj.attr("upMode"))) {
			alert(errMsg);
			return;
		} else {
			var upMode; // single[셀렉트미표시],singleExt(확장클래스),
			var xlsService;
			var xlsMethod;
			var xlsProcName;
			var xlsTitle;
			var xlsJobType;
			var xlsUploadName;
			var extClass;

			// xlsOpt.upMode확인 후 single일때와 multi일때의 처리 구분
			if (isNotEmpty(jobObj.attr("upMode"))) {
			  upMode = jobObj.attr("upMode");
			}

			if(isNotEmpty(jobObj.attr("procName"))) {
				
				if (jobObj.attr("upMode") == "proc") {
					xlsService = "MON_EXCEL_UPLOAD";
					xlsProcName = jobObj.attr("procName");	
				} else {
					alert(errMsg);
					return;
				}
				
			}  else {
				
				if(isNotEmpty(jobObj.attr("service"))) {
					xlsService = jobObj.attr("service");
				} else {
					alert(errMsg);
					return;
				}
				
			}
				
			if(isNotEmpty(jobObj.attr("method"))) {
				xlsMethod = jobObj.attr("method");
			} else {
				alert(errMsg);
				return;
			}

			if(isNotEmpty(jobObj.attr("title"))) {
				xlsTitle = jobObj.attr("title");
			}

			if(isNotEmpty(jobObj.attr("jobType"))) {
				xlsJobType = jobObj.attr("jobType");
			} else {
				alert(errMsg);
				return;
			}

			if(isNotEmpty(jobObj.attr("uploadName"))) {
				xlsUploadName = jobObj.attr("uploadName");
			}

			if(isNotEmpty(jobObj.attr("extClass"))) {
				extClass = jobObj.attr("extClass");
			}

			var param = {
						  upMode: upMode,
						  service: xlsService,
						  method: xlsMethod,
						  procName: xlsProcName,
						  title: xlsTitle,
						  jobType: xlsJobType,
						  name: xlsUploadName,
						  extClass: extClass
						};
			
		}
		
		$.ShowDataUpdatePopupOld(param,function() {});
	},

    /* ------------------------------------------------------- */
    /* Excel이나 CSV등의 데이터파일을 디비에 저장할때 사용 */
    /* ------------------------------------------------------- */
    uploadDataFile: function (jobObj) {
		debugger;
      var _Obj = $(this);
      //var _json = $(this).data("jsonData");
      var _json = _Obj.data("jsonData");
      /*
       * var param = new JSONClientParameters(); if(undefined != pl){
       * param = pl; };
       */

      // var useExtender = ""; //20140113 서버사이드에서 확인하는 방식으로 변경
      var jobs = _json.jobs;
      var xlsOpt;
      var errMsg = "데이터 업로드 처리 옵션이 정상적으로 정의되어 있지 않습니다.\n관리자에게 문의하여 주시기 바랍니다.";
      for (var c = 0; c < jobs.length; c++) {
		// todo 실행한 job버튼객체의 index와 inComm이 타겟데이터의 index, inComm과 동일할때
		// 동작한다.
		// 해당 데이터의 xlsOption취득
		
		if (_json.jobs[c].inComm == "uploadDataFile" && jobObj.attr("index") == _json.jobs[c].index ) {
		  	if (isNotEmpty(jobs[c].xlsOption)) {
		    	xlsOpt = jobs[c].xlsOption;
		  	}
		}
      }

      if (isEmpty(xlsOpt)) {
        alert(errMsg);
        return;
      } else {
        var upMode = "single"; // single[셀렉트미표시],singleExt(확장클래스),
        // multiExt
        var xlsService;
        var xlsMethod;
        var extClass;
        var title;
        var uploadName;

        // xlsOpt.upMode확인 후 single일때와 multi일때의 처리 구분
        if (isNotEmpty(xlsOpt.upMode)) {
          upMode = xlsOpt.upMode;
        }

        if (isNotEmpty(xlsOpt.service)) {
          xlsService = xlsOpt.service;
        }

        if (isNotEmpty(xlsOpt.method)) {
          xlsMethod = xlsOpt.method;
        }

        if (isNotEmpty(xlsOpt.extClass)) {
          extClass = xlsOpt.extClass;
        }

        if (isNotEmpty(xlsOpt.title)) {
          title = xlsOpt.title;
        }

        if (isNotEmpty(xlsOpt.uploadName)) {
          uploadName = xlsOpt.uploadName;
        }

        var param = {
			          name: uploadName,
			          title: title,
			          upMode: upMode,
			          service: xlsService,
			          method: xlsMethod,
			          extClass: extClass,
			        };
        // 확장자 체크는 서버사이드에서 처리하도록 변경.
        // upMode가 multi인경우에는 uploadDataFile이 필수
        if ( upMode == "single" || (upMode == "multi" && undefined != _json.uploadDataFile) ) {
          $.ShowDataUpdatePopup(_json, param, function () {});
        }
      }
      /*
       *
       * for(var c = 0;c<_json.jobs.length;c++){ if(_json.jobs[c].inComm ==
       * "uploadDataFile"){ //alert(_json.jobs[c].inComm); if(undefined!=
       * _json.jobs[c].upMode) upMode = _json.jobs[c].upMode;
       * if(undefined!= _json.jobs[c].useExtender) useExtender =
       * _json.jobs[c].useExtender; } }
       *
       * if((upMode == "single") || (upMode != "single" && undefined !=
       * _json.uploadDataFile)){ //데이터 업데이트 팝업 호출
       * $.ShowDataUpdatePopup(useExtender,upMode,_json,function() { },
       * param); }else{ alert("구조체에 uploadDataFile속성이 정의되어 있지 않습니다."); }
       */
    },
    
    /* ------------------------------------------------------- */
    /* 메타코드(공통코드)를 메모리에 새로 읽어들임 */
    /* ------------------------------------------------------- */
    refreshMetaCode: function () {
      $.InitMetaCode(function (resultFlag) {
        if (resultFlag == "SUCCESS") {
          alert("공통코드 적용성공");
        } else {
          alert("공통코드 적용실패");
        }
      });
    },
    /* ------------------------------------------------------- */
    /* 메타코드(공통라벨)를 메모리에 새로 읽어들임 */
    /* ------------------------------------------------------- */
    refreshMetaLabel: function () {
      // 20171206 다국어를 위해 추가함 khma
      $.InitMetaLabel(function (resultFlag) {
        if (resultFlag == "SUCCESS") {
          alert("공통라벨 적용성공");
        } else {
          alert("공통라벨 적용실패");
        }
      });
    },
    /* ------------------------------------------------------- */
    /* 메타코드(공통라벨)를 메모리에 새로 읽어들임 */
    /* ------------------------------------------------------- */
    refreshMetaMessage: function () {
      // 20180326 다국어를 위해 추가함 khma
      /*
       * $.InitMetaLabel( function(resultFlag){ if( resultFlag=="SUCCESS" ){
       * alert("공통라벨 적용성공"); }else{ alert("공통라벨 적용실패"); } });
       */
    },
    /* ------------------------------------------------------- */
    /* SMTP개별 메일 발송 처리 */
    /* ------------------------------------------------------- */
    indvEmail: function (jobObj) {
      // 20180326 다국어를 위해 추가함 khma

      var json = "MON_COM_INDVMAIL_PVIW";
      if (jobObj.attr("index") == "Notice") {
        json = "COM_SENDMAIL_PVIW";
      }

      var btns = {};
      /*
       * btns['발송'] = function (a,b,c,d) { //발송처리 var _json =
       * _Obj.data("jsonData"); var jobs = _json.jobs; var emailOpt;
       * for(var c = 0;c < jobs.length;c++){ //todo 실행한 job버튼객체의 index와
       * inComm이 타겟데이터의 index, inComm과 동일할때 동작한다. //해당 데이터의 emailOption취득
       * if((_json.jobs[c].inComm == "indvEmail") && (jobObj.attr('index') ==
       * _json.jobs[c].index)){ if(isNotEmpty(jobs[c].emailOption)){
       * emailOpt = jobs[c].emailOption; } } } var test;
       * //callBackFn($("#ShowPopUpViewJson_ShowEdit"), _Obj); /*var
       * popParams = $(this).superContaner("getValue");
       *
       * popParams.put("service",""); popParams.put("method","");
       * PostJsonData(_M.svcUrl[_M.Webtype].sendIndvEmail, popParams,
       * function(data){ alert('메일을 발송하였습니다.'); },function(data){
       * alert('메일 발송에 실패하였습니다.'); },_M.aSync.sync);
       * $(this).dialog("close");
       *  }; btns['닫기'] = function () { $(this).dialog("close"); };
       */

      {
        btns = [
          {
            id: "sendEmail",
            text: "발송",
            click: function () {
              var spTbl = jobObj.parents(".SuperTable");
              if (spTbl.length == 0) spTbl = jobObj.parents(".SuperView");
              var jsonData = spTbl.data("jsonData");
              var jobs = jsonData.jobs;
              var popParams = $(this).superContaner("getValue");

              for (var c = 0; c < jobs.length; c++) {
                // todo 실행한 job버튼객체의 index와 inComm이 타겟데이터의
                // index, inComm과 동일할때 동작한다.
                // 해당 데이터의 emailOption취득
                if (
                  jsonData.jobs[c].inComm == "indvEmail" &&
                  jobObj.attr("index") == jsonData.jobs[c].index
                ) {
                  var emailOption = jobs[c].emailOption;
                  if (isNotEmpty(emailOption)) {
                    if (isNotEmpty(emailOption.service)) {
                      popParams.add("service", emailOption.service);
                    }
                    if (isNotEmpty(emailOption.method)) {
                      popParams.add("method", emailOption.method);
                    }
                    if (emailOption.type == "NT") {
                      var titleName =
                        $("div.Title #TbName").text() +
                        ($("#Flowtop li.on").length == 0
                          ? ""
                          : " > " + $("#Flowtop li.on").text());
                      popParams.add("MENU_NAME", titleName);
                      popParams.add("MAIL_TYPE", emailOption.type);
                      popParams.add("KEY_VALUE", spTbl.attr("keyvalue"));
                      if (spTbl.attr("keyvalue")) {
                        popParams.add("LINK_URL", location.href);
                      } else {
                        popParams.add("LINK_URL", "");
                      }
                    }
                    var seqKey;
                    // jobObj의 key값 취득
                    if ($(".SuperTable").find(".SelectTR").size() > 0) {
                      seqKey = spTbl.find(".SelectTR").attr("keyValue");
                      popParams.add(jsonData.keyName, seqKey);
                    }
                  }
                }
              }

              PostJsonData(
                _M.svcUrl[_M.Webtype].sendIndvEmail,
                popParams,
                function (data) {
                  alert("메일을 발송하였습니다.");
                  $(document.body).find(".ShowPopUpViewJson").dialog("close");
                },
                function (data) {
                  alert("메일 발송에 실패하였습니다.");
                },
                _M.aSync.sync
              );
            },
          },
          {
            id: "cancel",
            text: "취소",
            click: function () {
              $(this).dialog("close");
            },
          },
        ];
      }
      $.ShowPopUpViewJson(
        json,
        _Obj,
        function (popup, parent) {
          // todo
          alert("test");
        },
        btns
      );
    },

    /* ------------------------------------------------------- */
    /* 해당하는 구조체의 URL 취득 */
    /* ------------------------------------------------------- */
    copyURL: function () {
      var strUrl =
        window.location.href +
        "monform.htm?fr=" +
        $(this).attr("jsonname") +
        "&ky=";
      if ($(this).hasClass("SuperView")) {
        strUrl += $(this).attr("keyvalue");
      } else if ($(this).hasClass("SuperTable")) {
        strUrl += $(".SelectTR", $(this)).attr("keyvalue");
      }
      $.MessageBox("URL정보", strUrl, null, 600);
    },
    /* ------------------------------------------------------- */
    /* superTable 페이지 단위 변경 */
    /* ------------------------------------------------------- */
    ChangePgCnt: function (select, event) {
      var _Obj = $(this);
      _Obj.attr("_pagecnt", select.val());
      _Obj.superContaner("tableList");
    },
    ChangePgCntGallery: function (select, event) {
      var _Obj = $(this);
      _Obj.attr("_pagecnt", select.val());
      _Obj.superContaner("GalleryList");
    },

    /* ------------------------------------------------------- */
    /* superTable 페이지 이동 */
    /* ------------------------------------------------------- */
    ChangePage: function (pgnum, event) {
      var _Obj = $(this);
      _psg = $(".pgs", pgnum);
      _Obj.attr("_viewpage", _psg.attr("pgnum"));
      _Obj.superContaner("tableList");
    },
    ChangePageGallery: function (pgnum, event) {
      var _Obj = $(this);
      _psg = $(".pgs", pgnum);
      _Obj.attr("_viewpage", _psg.attr("pgnum"));
      _Obj.superContaner("GalleryList");
    },

    /* ------------------------------------------------------- */
    /* superTable 조건입력된 객체값읽어오기 */
    /* ------------------------------------------------------- */
    tableGetFilter: function (bMode) {
      var _Obj = $(this);
      var option = _Obj.data("jsonData");

      // 2014.11.26 dmjung :: Tab 테이블의 isAutuRun 옵션 처리 시작.
      if (isNotEmpty(option) && !option.isAutoRun) {
        $("div.fieldContaner", _Obj).each(function (ind, fc) {
          var cont = $(fc);
          var type = cont.attr("type");

          switch (type) {
            case "text":
              if (cont.find("input").val().length > 0) {
                cont.removeClass("fldChange").addClass("fldChange");
              }
              break;

            case "select":
              if (cont.find("select").val().length > 0) {
                cont.removeClass("fldChange").addClass("fldChange");
              }
              break;
          }
        });
      }
      // 2014.11.26 dmjung :: Tab 테이블의 isAutuRun 옵션 처리 종료.
      var pl = new JSONClientParameters();
	  // 2024.05.29 khma 서브테이블에서 조회조건의 값이 있는데도 필터를 타지 않는 이유로 인해서 아래의 each 구문을 추가함
	  $(".head .fieldContaner", $(this)).each(function (e) {
			_val = $(this).superContaner("getFieldValue");
			if(_val != undefined && _val != ""){
				$(this).addClass("fldChange");
			}
      });
      $(".head .fieldContaner.fldChange", $(this)).each(function (e) {
        _field = $(this).attr("field");
        _val = $(this).superContaner("getFieldValue");
        // 만일 복합 필드구조라면 분리하여 저장한다.
        var _arF = _field.split(",");
        if (_arF.length > 1) {
          var _arV = _val.split(",");
          $.each(_arF, function (index, value) {
            pl.add(_arF[index], _arV[index]);
          });
        } else {
          pl.add(_field, _val);
        }
      });

      var extFilterParams = "";
      var tblColumnParams = "";
      if (
        isNotEmpty(option) &&
        undefined != option.extFilterView &&
        option.extFilterView.length > 0
      ) {
        var extFiterObj = $(".head", _Obj);
        extFilterParams = extFiterObj.superExtFilter("getParameters", "filter"); // 확장검색 파라메터 취득
        tblColumnParams = extFiterObj.superExtFilter("getParameters", "column"); // 확장검색 파라메터 취득
        if (isNotEmpty(extFilterParams)) {
          pl.add("extFilters", extFilterParams);
        }
        if (isNotEmpty(tblColumnParams)) {
          pl.add("dispCols", tblColumnParams);
        }
      }

      return pl;
    },

    /* ------------------------------------------------------- */
    /* 데이터를 표에 표시 */
    /* ------------------------------------------------------- */
    tableShowData: function (_rows, ListOption) {
      var _Obj = $(this);
      var _json = _Obj.data("jsonData");
      var TrData = _Obj.data("TRdata");
      var htmlString = "";
      if (undefined == TrData) return false;
      $("td", TrData).removeClass("none");
      $.each($(".body col", _Obj), function (index, col) {
        if ($(this).hasClass("none")) {
          $("td:eq(" + index + ")", TrData).addClass("none");
        }
      });
      // 레코드만큼 반복하면서 데이터를 바인딩한다
      $.each(_rows, function (index, row) {
        var newTr = TrData.clone();
        // 레코드의 키값을 먼저 설정하고, crud(편집상태)값을 읽기(R)로 초기값을
        // 설정한다
        if (row[_json.keyName] == undefined) {
          // alert('function:tableShowData [' +
          // _json.keyName + '] keyfield data is not
          // found');
          return false;
        }
        if (row[_json.displayName] == undefined) {
          // alert('function:tableShowData [' +
          // _json.displayName + '] display field data
          // is not found');
          return false;
        }

        newTr.attr("keyvalue", row[_json.keyName]).attr("crud", "R");
        newTr.attr("displayvalue", row[_json.displayName]);
        // tr의 td를 반복하면서 필드변수를 확인하고 해당레코드의 자료를 읽어와서
        // 바인딩한다
        newTr.superContaner("setTrValue", row);
        $.each($("td", newTr), function (index, td) {
          if (index < 1) return;
          var _td = $(td);
          _name = _td.attr("name");
          _field = _td.attr("field");
          _subfield = _td.attr("subfield");
          _type = _td.attr("type");
          _dynamicCss = _td.attr("dynamicCss");
          _showText = _td.attr("showText");
          _sizewidth = _td.attr("sizewidth");
          _sizeheight = _td.attr("sizeheight");
          _mode = _td.attr("mode");

          _data = row[_field];
          if (_subfield) {
            // td
            // click을위한
            // 보고 key사용을
            // 위해 attr
            // 등록
            _subdata = row[_subfield];
            if (_subdata) {
              _td.attr("subkey", _subdata);
            }
          }
          if (_data == null) _data = "";
          if (_data != null && typeof _data === "string")
            _data = $.decHTML(_data);

          switch (_type) {
            case _M.DataType.number:
              if (_data != null) {
                _data = _M.f.c.setComma(_data);
              }
              if (_mode != undefined && _mode == "edit") {
                _td.find("input").attr("value", $.decHTML(_data));
              }
              break;

            case _M.DataType.date8:
              if (_data != null) {
                _data = _M.f.c.convDate8(_data);
              }
              break;

            case _M.DataType.date: //
              if (typeof _data == "number") {
                var _o = eval(new Date(_data));
                _data = _M.f.d.DateGetDate(_o);
              } else {
                if (_data.indexOf("Date") > 0) {
                  var _o = eval(
                    _data.replace(/\/Date\((\d+)\)\//gi, "new Date($1)")
                  );
                  _data = _M.f.d.DateGetDate(_o);
                }
              }
              break;

            case _M.DataType.datetime: //
              if (typeof _data == "number") {
                var _o = eval(new Date(_data));
                _data = _M.f.d.DateGetTimeStamp(_o);
              } else {
                if (_data.indexOf("Date") > 0) {
                  var _o = eval(
                    _data.replace(/\/Date\((\d+)\)\//gi, "new Date($1)")
                  );
                  _data = _M.f.d.DateGetTimeStamp(_o);
                }
              }
              break;

            case _M.DataType.img: //
              if (_data == "") {
              } else {
                _data = "<img src='" + _data + "' />";
              }
              break;

            case "file": // _data 에
              // filepath
              // 가 필요할 경우,
              // 이 곳에 서비스
              // 추가 해야 함.
              _FileClassName = _data == "" ? "fileSelect" : "fileAttch";
              _data = "<span class='" + _FileClassName + "'></span>";
              break;
              
            case "signfile": // _data 에
              // filepath
              // 가 필요할 경우,
              // 이 곳에 서비스
              // 추가 해야 함.
              _FileClassName = _data == "" ? "fileSelect" : "fileAttch";
              _data = "<span class='" + _FileClassName + "'></span>";
              break;

            case _M.DataType.text:
              if (typeof _data === "string") _data = $.decHTML(_data);
              if (_mode != undefined && _mode == "edit") {
                _td.find("input").attr("value", $.decHTML(_data));
              }
              break;

            case _M.DataType.check:
              if (_mode != undefined && _mode == "edit") {
                _td
                  .find("input")
                  .attr(
                    "checked",
                    _td.find("div.fieldContaner").attr("defaultvalue") == _data
                  );
                _td.find("label").remove();
              }
              break;

            case _M.DataType.select:
              if (_mode != undefined && _mode == "edit") {
                _td
                  .find("option[value='" + _data + "']")
                  .attr("selected", true);
              }
              break;
            default:
              if (typeof _data === "string") _data = $.decHTML(_data);
              if (_mode != undefined && _mode == "edit") {
                _td.find("input").attr("value", $.decHTML(_data));
              }
              break;
          }

          _td.attr("title", _data);

          if (_type == _M.DataType.img) _td.attr("title", "");

          if (_dynamicCss != undefined) {
            if (_showText != undefined) _td.text("");
            _va = eval("_json." + _dynamicCss)(_data);
            _td.append("<span class='" + _va + "'></span>");
          }
          if (_json.tdIcon != undefined) {
            if (_json.tdIcon[_name] != undefined) {
              if (_json.tdIcon[_name][_data] != undefined) {
                var _va = _json.tdIcon[_name][_data];
                _td.text("");
                _td.append("<span class='" + _va + "'></span>");
              }
            }
          }
          if (_json.tdForm != undefined) {
            if (_json.tdForm[_name] != undefined) {
              _td.text("");
              var Form = _json.tdForm[_name];
              var strReg = new RegExp("@{+[a-zA-Z0-9가-힣-_]*}", "gim");
              var xArr = Form.match(strReg);
              if (xArr != null) {
                $.each(xArr, function (k, v) {
                  var _field = v.replace("@{", "").replace("}", "");
                  Form = Form.replace(v, row[_field]);
                });
              }
              _td.append(Form);
            }
          }

          // $('.body tbody',
          // _Obj).append(newTr);
        });
        // 2014.04.25 dmjung :: 속도개선 ( 약 x4 향상 )
        htmlString += newTr[0].outerHTML;
      });
      $(".body tbody", _Obj).append(htmlString);
      _records = _rows[0]["RCOUNT"]; // 20170629 김정원 자바버전과 취합하기 위해
      // _RCOUNT를 RCOUNT로 변경함.
      _pagecnt = parseInt(_Obj.attr("_pagecnt"));
      _pages = parseInt((_records + _pagecnt - 1) / _Obj.attr("_pagecnt"));
      $(".records", _Obj).text("Records :" + set_Comma(_records));
      $(".pages", _Obj).text("Pages :" + set_Comma(_pages));

      /*
       * ----------------------------------------- 페이지모양 표시하기
       * ------------------------------------------
       */
      if (true) {
        _viewPage = parseInt(_Obj.attr("_viewpage"));
        _StartPage = parseInt((_viewPage - 1) / 10) * 10 + 1;
        var j = 1;
        $(".page li", _Obj).addClass("none");
        for (var i = _StartPage; i <= _StartPage + 9 && i <= _pages; i++) {
          $(".pgnum_" + j, _Obj)
            .text(i)
            .attr("pgnum", i)
            .parent()
            .removeClass("none")
            .removeClass("pgn_selected");
          if (_viewPage == i) {
            $(".pgnum_" + j, _Obj)
              .parent()
              .addClass("pgn_selected");
          }
          j++;
        }
        $(".pgnum_first", _Obj)
          .text(_StartPage)
          .attr("pgnum", 1)
          .parent()
          .removeClass("none");
        if (_StartPage > 10) {
          $(".pgnum_prev", _Obj)
            .text(_StartPage - 10)
            .attr("pgnum", _StartPage - 10)
            .parent()
            .removeClass("none");
        } else {
          $(".pgnum_prev", _Obj)
            .text(_StartPage)
            .attr("pgnum", _StartPage)
            .parent()
            .removeClass("none");
        }
        if (_StartPage + 10 < _pages) {
          $(".pgnum_next", _Obj)
            .text(_StartPage + 10)
            .attr("pgnum", _StartPage + 10)
            .parent()
            .removeClass("none");
        } else {
          $(".pgnum_next", _Obj)
            .text(_pages)
            .attr("pgnum", _pages)
            .parent()
            .removeClass("none");
        }
        $(".pgnum_end", _Obj)
          .text(_pages)
          .attr("pgnum", _pages)
          .parent()
          .removeClass("none");

        _Obj.superContaner("tableShowMessage", "recode find..");
      }

      if (ListOption == undefined) ListOption = "";

      _Obj.superContaner("tableShowChart", _rows);

      if (_json.isAutoClick && ListOption == "") {
        $(".body tbody tr:eq(0)", _Obj).trigger("click");
      }
    },
    /* ------------------------------------------------------- */
    /* 데이터를 표에 표시 */
    /* ------------------------------------------------------- */
    tableShowChart: function (_rows) {
      var _Obj = $(this);
      var _json = _Obj.data("jsonData");
      if (_json.chartOpton == undefined) return;
      // 레코드만큼 반복하면서 데이터를 바인딩한다
      var DataSeries = [];

      // Chart type A -------------------------------
      if (_json.chartOpton.ChartType == "A") {
        var ticks = _json.chartOpton.ticks;
        if (_json.chartOpton.SeriesExceptField != undefined) {
          var ecptf = _json.chartOpton.SeriesExceptField;
          $.each(_rows, function (index, row) {
            if (String(ecptf).indexOf(row[_json.chartOpton.SeriesField]) < 0) {
              // List
              // 데이터에는
              // 보이지만
              // chart에선
              // 제외하고
              // 싶은
              // Y축을
              // 컨트롤
              // 하고
              // 싶을때
              // 사용
              var d0 = [];
              $.each(ticks, function (index, tick) {
                if (row[tick[1]] != undefined) {
                  if (_json.chartOpton.isRowCol) {
                    d0.push([tick[0], row[tick[1]]]);
                  } else {
                    d0.push([row[tick[1]], tick[0]]);
                  }
                }
              });
              var SeriesSet = {
                label: row[_json.chartOpton.SeriesField],
                data: d0,
              };
              DataSeries.push(SeriesSet);
            }
          });
        } else {
          $.each(_rows, function (index, row) {
            var d0 = [];
            $.each(ticks, function (index, tick) {
              if (row[tick[1]] != undefined) {
                if (_json.chartOpton.isRowCol) {
                  d0.push([tick[0], row[tick[1]]]);
                } else {
                  d0.push([row[tick[1]], tick[0]]);
                }
              }
            });
            var SeriesSet = {
              label: row[_json.chartOpton.SeriesField],
              data: d0,
            };
            DataSeries.push(SeriesSet);
          });
        }
      }
      if (_json.chartOpton.ChartType == "B") {
        var d0 = [];
        var oldNm = _rows[0][_json.chartOpton.SeriesField];
        $.each(_rows, function (index, row) {
          if (oldNm != row[_json.chartOpton.SeriesField]) {
            var SeriesSet = {
              label: oldNm,
              data: d0,
            };
            DataSeries.push(SeriesSet);
            d0 = [];
          }
          var _o = row[_json.chartOpton.DateField];
          if (_o != null && _o != undefined) {
            _o = eval(_o.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));
          }
          d0.push([_o, row[_json.chartOpton.DataField]]);
          oldNm = row[_json.chartOpton.SeriesField];
        });
        var SeriesSet = {
          label: oldNm,
          data: d0,
        };
        DataSeries.push(SeriesSet);

        // DataSeries.push(d0);
      }
      if (_json.chartOpton.ChartType == "C") {
        // pie
        var d0 = [];
        $.each(_rows, function (index, row) {
          DataSeries.push({
            label: row[_json.chartOpton.SeriesField],
            data: row[_json.chartOpton.DataField],
            color: _json.chartOpton.colors[index],
          });
        });
      }
      if (_json.chartOpton.ChartType == "D") {
        var d0 = Array(_json.chartOpton.DataField.length);
        for (i = 0; i < _json.chartOpton.DataField.length; i++) {
          d0[i] = new Array();
        }
        var tk = [];
        var i = 1;
        $.each(_rows, function (index, row) {
          var _o = row[_json.chartOpton.SeriesField];
          if (_o != null && _o != undefined) {
            if (_o.indexOf("Date") > -1) {
              _o = eval(_o.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));
              _o = _M.f.d.DateGetDate(_o);
            }
          }
          for (i = 0; i < _json.chartOpton.DataField.length; i++) {
            d0[i].push([index, row[_json.chartOpton.DataField[i]]]);
          }

          tk.push([index, _o]);
        });
        for (i = 0; i < _json.chartOpton.DataField.length; i++) {
          var MultipleAxis = false;
          if (
            _json.chartOpton.ChartDetail.yaxes != undefined &&
            _json.chartOpton.ChartDetail.yaxes.length > 1
          ) {
            if (
              _json.chartOpton.DataYaxes != undefined &&
              _json.chartOpton.DataYaxes.length > 1
            ) {
              MultipleAxis = true;
            }
          }

          if (MultipleAxis) {
            if (_json.chartOpton.OrderBar)
              DataSeries.push({
                label: _json.chartOpton.DataField[i],
                data: d0[i],
                lines: {
                  order: i,
                },
                bars: {
                  order: i,
                },
                yaxis: _json.chartOpton.DataYaxes[i],
              });
            else
              DataSeries.push({
                label: _json.chartOpton.DataField[i],
                data: d0[i],
                yaxis: _json.chartOpton.DataYaxes[i],
              });
          } else {
            if (_json.chartOpton.OrderBar)
              DataSeries.push({
                label: _json.chartOpton.DataField[i],
                data: d0[i],
                lines: {
                  order: i,
                },
                bars: {
                  order: i,
                },
              });
            else
              DataSeries.push({
                label: _json.chartOpton.DataField[i],
                data: d0[i],
              });
          }
        }
        _json.chartOpton.ChartDetail.xaxis.ticks = tk;
      }
      if (_json.chartOpton.ChartType == "V") {
        var ticks = _json.chartOpton.ticks;
        if (_json.chartOpton.SeriesExceptField != undefined) {
          var ecptf = _json.chartOpton.SeriesExceptField;
          $.each(_rows, function (index, row) {
            if (String(ecptf).indexOf(row[_json.chartOpton.SeriesField]) < 0) {
              // List
              // 데이터에는
              // 보이지만
              // chart에선
              // 제외하고
              // 싶은
              // Y축을
              // 컨트롤
              // 하고
              // 싶을때
              // 사용
              var d0 = [];
              $.each(ticks, function (index, tick) {
                if (row[tick[1]] != undefined) {
                  if (_json.chartOpton.isRowCol) {
                    d0.push([tick[0], row[tick[1]]]);
                  } else {
                    d0.push([row[tick[1]], tick[0]]);
                  }
                }
              });
              var SeriesSet = {
                label: row[_json.chartOpton.SeriesField],
                data: d0,
                bars: {
                  order: index,
                },
              };
              DataSeries.push(SeriesSet);
            }
          });
        } else {
          $.each(_rows, function (index, row) {
            var d0 = [];
            $.each(ticks, function (index, tick) {
              if (row[tick[1]] != undefined) {
                if (_json.chartOpton.isRowCol) {
                  d0.push([tick[0], row[tick[1]]]);
                } else {
                  d0.push([row[tick[1]], tick[0]]);
                }
              }
            });
            var SeriesSet = {
              label: row[_json.chartOpton.SeriesField],
              data: d0,
              bars: {
                order: index,
              },
            };
            DataSeries.push(SeriesSet);
          });
        }
      }
      $(".chartArea", _Obj).empty();
      $(".chartArea", _Obj).unbind("plotclick");
      var p = $.plot(
        $(".chartArea", _Obj),
        DataSeries,
        _json.chartOpton.ChartDetail
      );

      // $('.chartArea', _Obj).css('padding-bottom', '10px'); //padding
      // option으로 인한 주석

      var previousPoint = null;
      if (_json.chartOpton != undefined) {
        if (_json.chartOpton.plothover != undefined) {
          $(".chartArea", _Obj).bind("plothover", function (event, pos, item) {
            _json.chartOpton.plothover(event, pos, item);
          });
        }
        if (_json.chartOpton.plotclick != undefined) {
          $(".chartArea", _Obj).bind("plotclick", function (event, pos, item) {
            _json.chartOpton.plotclick(event, pos, item);
          });
        }
      }
    },

    // JDM 이미지 겔러리 디자인 변경 작업 중
    GalleryShowData: function (_rows) {
      var _Obj = $(this);
      var _json = _Obj.data("jsonData");
      var _ul = $(".body ul", _Obj);
      _ul.empty();
      // 레코드만큼 반복하면서 데이터를 바인딩한다
      $.each(_rows, function (index, row) {
        _li = $('<li class="GalleryLists"></li>').appendTo(_ul);
        _li.attr("key", row.KEY);
        if (undefined != _json.colNum)
          _li.css("width", 75 / _json.colNum + "%");
        _span = $("<a></a>").appendTo(_li);
        var _fileName = row.FILENAME;
        var _fileExt = _fileName.substring(_fileName.lastIndexOf(".") + 1);

        if (_fileExt == "xls" || _fileExt == "xlsx") {
          _img = $(
            "<div class='ui-filetype-excel' src='" + row.URL + "'></div>"
          ).appendTo(_span);
        } else if (_fileExt == "ppt" || _fileExt == "pptx") {
          _img = $(
            "<div class='ui-filetype-ppt' src='" + row.URL + "'></div>"
          ).appendTo(_span);
        } else if (_fileExt == "txt") {
          _img = $(
            "<div class='ui-filetype-txt' src='" + row.URL + "'></div>"
          ).appendTo(_span);
        } else if (_fileExt == "doc" || _fileExt == "docx") {
          _img = $(
            "<div class='ui-filetype-docx' src='" + row.URL + "'></div>"
          ).appendTo(_span);
        } else if (_fileExt == "hwp") {
          _img = $(
            "<div class='ui-filetype-hwp' src='" + row.URL + "'></div>"
          ).appendTo(_span);
        } else if (_fileExt == "pdf") {
          _img = $(
            "<div class='ui-filetype-file' src='" + row.URL + "'></div>"
          ).appendTo(_span);
        } else {
          _img = $("<img src='" + row.URL + "'></img>").appendTo(_span);
        }

        if (_json.imgSize != undefined) {
          _img.css("width", "100%");
          _img.css("height", _json.imgSize.height);
        }
        $("<div class='GalleryTitle'>" + row.TITLE + "</div>").appendTo(_span);
        $("<div class='GalleryDesc'>" + row.DESC + "</div>").appendTo(_span);
      });
      _records = _rows[0]["RCOUNT"]; // 20170629 김정원 자바버전과 취합하기 위해
      // _RCOUNT를 RCOUNT로 변경함.

      _pagecnt = parseInt(_Obj.attr("_pagecnt"));
      _pages = parseInt((_records + _pagecnt - 1) / _Obj.attr("_pagecnt"));
      $(".records", _Obj).text("Records :" + set_Comma(_records));
      $(".pages", _Obj).text("Pages :" + set_Comma(_pages));

      /*
       * ----------------------------------------- 페이지모양 표시하기
       * ------------------------------------------
       */
      if (true) {
        _viewPage = parseInt(_Obj.attr("_viewpage"));
        _StartPage = parseInt((_viewPage - 1) / 10) * 10 + 1;
        var j = 1;
        $(".page li", _Obj).addClass("none");
        for (i = _StartPage; i <= _StartPage + 10 && i <= _pages; i++) {
          $(".pgnum_" + j, _Obj)
            .text(i)
            .attr("pgnum", i)
            .parent()
            .removeClass("none")
            .removeClass("pgn_selected");
          if (_viewPage == i) {
            $(".pgnum_" + j, _Obj)
              .parent()
              .addClass("pgn_selected");
          }
          j++;
        }
        $(".pgnum_first", _Obj)
          .text(_StartPage)
          .attr("pgnum", 1)
          .parent()
          .removeClass("none");
        if (_StartPage > 10) {
          $(".pgnum_prev", _Obj)
            .text(_StartPage - 10)
            .attr("pgnum", _StartPage - 10)
            .parent()
            .removeClass("none");
        } else {
          $(".pgnum_prev", _Obj)
            .text(_StartPage)
            .attr("pgnum", _StartPage)
            .parent()
            .removeClass("none");
        }
        if (_StartPage + 10 < _pages) {
          $(".pgnum_next", _Obj)
            .text(_StartPage + 10)
            .attr("pgnum", _StartPage + 10)
            .parent()
            .removeClass("none");
        } else {
          $(".pgnum_next", _Obj)
            .text(_pages)
            .attr("pgnum", _pages)
            .parent()
            .removeClass("none");
        }
        $(".pgnum_end", _Obj)
          .text(_pages)
          .attr("pgnum", _pages)
          .parent()
          .removeClass("none");
        _Obj.superContaner("tableShowMessage", "recode find..");
      }

      if (_json.isAutoClick) {
        $(".body tbody tr:eq(0)", _Obj).trigger("click");
      }
    },
    /* ------------------------------------------------------- */
    /* 유틸리티 */
    /* ------------------------------------------------------- */

    // 표의 하단에 메시지를 표시한다.
    tableShowMessage: function (msg) {
      var _Obj = $(this);
      $(".status", _Obj).text(msg);
    },
    /* ------------------------------------------------------- */
    /* 필드생성 */
    /* ------------------------------------------------------- */
    fieldGen: function (td, option) {
      var _Obj = $(this);
      _dateWidth = 80;

      _fieldContaner = $("<div class='fieldContaner'></div>").appendTo(td);
      _fieldContaner.attr("type", option.type);
      _fieldContaner.css("width", option.width);
      if (option.height != undefined)
        _fieldContaner.css("height", option.height);
      if (option.readonly != undefined)
        _fieldContaner.attr("readonly", option.readonly);

      _fieldContaner.attr("field", option.field);
      _fieldContaner.attr("oldValue", "");
      _fieldContaner.attr("Value", "");

      // _fieldContaner.attr('calType', ''); //2018.06.05 dmjung :: 모든 필드에
      // calType 속성값 표시되는 것 방지하기 위하여

      if (option.calType != undefined)
        _fieldContaner.attr("calType", option.calType);
      if (option.linkField != undefined)
        _fieldContaner.attr("linkField", option.linkField);
      if (option.linkJson != undefined)
        _fieldContaner.attr("linkJson", option.linkJson);
      if (option.linkfield != undefined)
        _fieldContaner.attr("linkField", option.linkfield);
      if (option.linkjson != undefined)
        _fieldContaner.attr("linkJson", option.linkjson);
      if (option.service != undefined)
        _fieldContaner.attr("service", option.service);
      if (option.method != undefined)
        _fieldContaner.attr("method", option.method);
      if (option.bindField != undefined)
        _fieldContaner.attr("bindField", option.bindField); // 20180909
      // khma
      // bindField추가
      if (option.parentfield != undefined)
        _fieldContaner.attr("parentField", option.parentfield);
      if (option.orders != undefined)
        _fieldContaner.attr("orders", option.orders);
      if (option.editorDisable != undefined)
        _fieldContaner.attr("editorDisable", option.editorDisable); // 2014.06.09
      // dmjung
      // ::
      // 에디터
      // readonly
      // 모드에
      // 필요한
      // 옵션
      // 속성
      // 부여.
      if (option.errFlgField != undefined)
        _fieldContaner.attr("errFlgField", option.errFlgField); // 2015.02.04
      // khma
      // 오류필드의
      // 사선처리
      // 옵션

      if (option.codes != undefined) _fieldContaner.attr("codes", option.codes);

      // 2018.06.04 dmjung :: codeEditor 사용시 javascript, sql, css 모드 선택값을
      // 셋팅함.
      if (option.codemode != undefined)
        _fieldContaner.attr("codemode", option.codemode);

      if (
        option.type == "multiemail" ||
        option.type == "multiaddress" ||
        option.type == "multitel"
      ) {
        if (option.jobType == undefined) {
          alert("jobType이 없습니다.");
          return false;
        }
      }
      if (option.jobType != undefined)
        _fieldContaner.attr("jobType", option.jobType);

      // 2018.08.14 dmjung :: tokenfield 사용시 속성값 셋팅
      if (option.tokenFldOption != undefined) {
        _fieldContaner.attr("json", option.tokenFldOption.json);
        _fieldContaner.attr("label", option.tokenFldOption.label);
        _fieldContaner.attr("value", option.tokenFldOption.value);
      }

      // 변경시 동작을 바인딩함
      if (option.Action != undefined)
        _fieldContaner.attr("Action", option.Action);

      // 전달된 초기값으로 정의함
      if (option.defaultValue != undefined) {
        _fieldContaner.attr("defaultValue", option.defaultValue);
      }
      // 전달된 상위객체의 값이 있다면
      // 해당객체의 초기값이 정의 되어야 함
      if (_Obj.data("ParentData") != undefined) {
        var _ext = _Obj.data("ParentData");
        var ppl = _ext.toArray();
        if (ppl[option.field] != undefined) {
          _fieldContaner.attr("defaultValue", ppl[option.field]);
        }
      }
      _fieldView = $("<div class='fieldView'></div>").appendTo(_fieldContaner);
      _fieldEdit = $("<div class='fieldEdit'></div>").appendTo(_fieldContaner);

      // 2014.01.14 dmjung :: afterlabel, beforelabel 공통 처리 위한 함수
      function attachLabels(html, toEl) {
        if (html.before != undefined) {
          var beforeTarget = $(toEl).eq(0).children().eq(0);
          $(html.before)
            .before(beforeTarget)
            .addClass("beforeLabel align-middle inline-block");
        }
        if (html.after != undefined) {
          var after = $.decHTML(html.after);
          if (option.readonly == undefined) {
            // $(html.after).appendTo(toEl).addClass('afterLabel
            // align-middle inline-block');
            $(toEl)
              .parents(".fieldContaner")
              .after($(after).addClass("afterLabel align-middle inline-block"));
          } else {
            // $(html.after).appendTo(_fieldView).addClass('afterLabel
            // align-middle');
            _fieldView
              .after(
                $(after)
                  .addClass("afterLabel align-middle inline-block")
                  .css("margin-left", "6px")
              )
              .css("display", "inline-block");
          }
        }
      }

      // required 위치 변경 , switch case 하단으로 이동
      switch (option.type) {
        case "tokenField":
          var customIcon = option.customIcon;
          if (undefined == customIcon || "" == customIcon) {
            customIcon = "icon-search";
          }

          var e = $.Event("keypress");
          e.which = 13;
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);

          var _o = $(
            "<input  class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' for='linkkey' />"
          )
            .appendTo(_span)
            .change(function () {
              // CSS JDM
              _o.attr("data", $(this).val());
            });
          var _img = $(
            "<span class='icon i-20 " + customIcon + " align-middle'></span>"
          ).appendTo(_span);

          function setToken(_fieldContaner, type) {
            $.ShowPopUpTableJson(
              _fieldContaner.attr("json"),
              _fieldContaner,
              function (key, display, trobj) {
                if (key != undefined) {
                  var selected = trobj;
                  var tokenLabel = selected
                    .find('td[field="' + option.tokenFldOption.label + '"]')
                    .attr("value");
                  var tokenValue = selected
                    .find('td[field="' + option.tokenFldOption.value + '"]')
                    .attr("value");

                  if (undefined == tokenLabel || "" == tokenLabel) {
                    alert(
                      option.tokenFldOption.label +
                        " 데이터가 없습니다. 지정한 필드명이 올바른지 확인해주세요"
                    );
                    return false;
                  } else if (undefined == tokenValue || "" == tokenValue) {
                    alert(
                      option.tokenFldOption.value +
                        " 데이터가 없습니다. 지정한 필드명이 올바른지 확인해주세요"
                    );
                    return false;
                  } else {
                    _o.tokenfield("createToken", {
                      value: tokenValue,
                      label: tokenLabel,
                    });

                    _fieldContaner
                      .find(".tokenfield .close")
                      .unbind("click")
                      .bind("click", function (e) {
                        _o.tokenfield("remove", e);
                        setData(_fieldContaner);
                      });
                  }

                  setData(_fieldContaner);

                  var _inputval = "";
                  if (type == "img") {
                    if (_o.attr("data") != undefined) {
                      _inputval = _o.attr("data");
                    }
                  } else {
                    _inputval = _o.val();
                  }

                  if (
                    option.filterData != undefined &&
                    option.filterData != ""
                  ) {
                    // alert(option.filterData + ' /
                    // ' + _inputval);
                    var _fil = $(
                      ".ShowPopUpTableJson .fieldContaner[field='" +
                        option.filterData +
                        "']"
                    );
                    if (_inputval != "") {
                      _fil
                        .attr("value", _inputval)
                        .removeClass("fldChange")
                        .addClass("fldChange");
                      _fil.find("input").val(_inputval);
                    }
                    $("#ShowPopUpTableJson_1").superContaner("List");
                  }

                  $(this).val("");
                  _fieldContaner.attr("linkvalue", key);
                }
              }
            );
          }

          function setData(_fieldContaner) {
            var viewText = "";
            var viewLength = _fieldContaner.find(".token-label").size();
            if (viewLength > 1) {
              _fieldContaner.find(".token-label").each(function (ind, lab) {
                if (viewLength - 1 == ind) {
                  viewText += $(lab).text();
                } else {
                  viewText += $(lab).text() + ", ";
                }
              });
            } else {
              viewText = _fieldContaner.find(".token-label").text();
            }

            _fieldContaner.superContaner("setFieldValue", viewText);
            _fieldContaner.trigger("change");
          }

          _img.click(function (e) {
            var _fieldContaner = $(this).parents(".fieldContaner");

            setToken(_fieldContaner, "img");
          });

          _o.keydown(function (e) {
            if (e.keyCode == "13") {
              var _fieldContaner = $(this).parents(".fieldContaner");

              setToken(_fieldContaner, "key");
            }
          });

          _o.tokenfield();

          if (undefined == option.width || "" == option.width) {
            alert("토큰 필드의 width 값이 없습니다. % 단위를 권장합니다.");
          } else {
            if (option.width.indexOf("px") < 0) {
              _o.parent().css("width", option.width.replace("%", "") - 4 + "%");
            } else {
              alert(
                "토큰 필드의 width 값을 픽셀로 지정하셨습니다. % 단위를 권장합니다."
              );
              _o.parent().css("width", option.width);
            }
          }

          if (
            option.tokenFldOption.selectOnly == true ||
            undefined == option.tokenFldOption.selectOnly
          ) {
            _o.parent().find(".token-input").attr("readonly", "readonly");
          }

          if (option.linkKey == "UID") {
            _o.parents(".fieldContaner").attr("value", _M.UserInfo.id);
            _o.parents(".fieldContaner")
              .find(".fieldView")
              .text(_M.UserInfo.name);
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;

        case "lunardate":
          $(
            "<span class='align-middle' id='solarArea'></span><span class='align-middle' id='lunarArea' style='color:#4d4d4d; font-size:8pt; margin-left:4px;'></span>"
          ).appendTo(_fieldView);
          // 2018.08.05 dmjung ::
          var _store = _fieldEdit;
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);

          var _type = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' id='lunartype' style='width:55px;'><option value='0'>양력</option><option value='1'>음력</option></select>"
          ).appendTo(_span);
          var _solarWrap = $(
            "<span id='solarWrap' style='display:inline-block;'></span>"
          ).appendTo(_span);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic  align-middle' type='text' value='' />"
          )
            .appendTo(_solarWrap)
            .attr("maxlength", 10)
            .css("width", "80px")
            .datepicker({
              constrainInput: true,
            })
            .change(function () {
              $(this)
                .parents(".fieldContaner")
                .removeClass("fldChange")
                .addClass("fldChange");
            });
          $(
            "<span class='icon i-20 icon-calendar align-middle'></span>"
          ).appendTo(_solarWrap);

          var _lunarWrap2 = $(
            "<span id='lunarWrap' style='display:none;'></span>"
          ).appendTo(_span);
          var _year = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' id='lunaryear' style='width:65px;'></select>"
          )
            .appendTo(_lunarWrap2)
            .change(function () {
              var fieldEdit = $(this).parents(".fieldEdit");
              if (fieldEdit.find("input#yundal").prop("checked")) {
                fieldEdit.superContaner("LunardateSet", "Yun", _store);
              } else {
                fieldEdit.superContaner("LunardateSet", "Lunar", _store);
              }
              $(this)
                .parents(".fieldContaner")
                .removeClass("fldChange")
                .addClass("fldChange");
            });
          $.SvcGetSvcCode(
            "MON_COMMON",
            "LUNAR_CAL_LYEAR_LIST",
            function (data) {
              $.each(data.resultData, function (index, row) {
                _year.get(0).options[0] = new Option("선택", "default");
                index++;
                _year.get(0).options[index] = new Option(
                  row["LUN_YEARS"] + "년",
                  row["LUN_YEARS"]
                );
              });
            },
            false
          );

          var _month = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' id='lunarmonth' style='width:50px;'></select>"
          )
            .appendTo(_lunarWrap2)
            .change(function () {
              var fieldEdit = $(this).parents(".fieldEdit");
              if (fieldEdit.find("input#yundal").prop("checked")) {
                fieldEdit.superContaner("LunardateSet", "Yun", _store);
              } else {
                fieldEdit.superContaner("LunardateSet", "Lunar", _store);
              }
              $(this)
                .parents(".fieldContaner")
                .removeClass("fldChange")
                .addClass("fldChange");
            });
          _M.f.c.SetOptionCode(_month, "Month", "선택", false);

          var _day = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' id='lunarday' style='width:50px;'></select>"
          )
            .appendTo(_lunarWrap2)
            .change(function () {
              var fieldEdit = $(this).parents(".fieldEdit");
              if (fieldEdit.find("input#yundal").prop("checked")) {
                fieldEdit.superContaner("LunardateSet", "Yun", _store);
              } else {
                fieldEdit.superContaner("LunardateSet", "Lunar", _store);
              }
              $(this)
                .parents(".fieldContaner")
                .removeClass("fldChange")
                .addClass("fldChange");
            });

          var _chk = $(
            "<input type='checkbox' class='align-middle yundal' id='yundal' style='margin-left:4px;' value='0' /><span class='align-middle yundal'>윤달</span>"
          )
            .appendTo(_lunarWrap2)
            .click(function () {
              var fieldEdit = $(this).parents(".fieldEdit");
              if ($(this).prop("checked")) {
                $(this).attr("value", "1");
                fieldEdit.superContaner("LunardateSet", "Yun", _store);
              } else {
                $(this).attr("value", "0");
                fieldEdit.superContaner("LunardateSet", "Unyun", _store);
              }
              $(this)
                .parents(".fieldContaner")
                .removeClass("fldChange")
                .addClass("fldChange");
            });

          var _toSolar = $(
            "<span class='align-middle' style='color:#4d4d4d; font-size:8pt; margin-left:4px;'> 양력 : </span><span class='align-middle' id='solar' style='color:#4d4d4d; font-size:8pt;'></span>"
          ).appendTo(_lunarWrap2);

          $(_solarWrap).click(function (e) {
            $("input", $(this)).datepicker("show");
          });

          _type.change(function () {
            var diff = $(this).val();
            if (diff == "1") {
              if (
                $(".hasDatepicker", _store).val() == undefined ||
                $(".hasDatepicker", _store).val() == ""
              ) {
                $("#solarWrap", _store).hide();
                $("#lunarWrap", _store).show();
                $("#lunaryear, #lunarmonth, #lunarday", _store).val("default");
              } else {
                $(this)
                  .parents(".fieldEdit")
                  .superContaner("LunardateSet", "Solar", _store);
                $("#solarWrap", _store).hide();
                $("#lunarWrap", _store).show();
              }
            } else {
              $("#solar", _store).text();
              $("#solarWrap", _store).show();
              $("#lunarWrap", _store).hide();
              $("#yundal", _store).attr("checked", false);
            }
          });

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "multiaddress":
          if (
            _fieldContaner.attr("jobType") == undefined ||
            _fieldContaner.attr("jobType") == ""
          ) {
            alert("jobType이 없습니다");
            return false;
          }
          var _arFld = option.field.split(",");
          var _zipspan = $("<div class='ziplines'></div>").appendTo(_fieldEdit);

          var _select = $(
            "<select id='addrtype' class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' style='width:60px;'></select>"
          ).appendTo(_zipspan);
          _M.f.c.SetOptionCode(_select, "ADDR_TYPE", "선택", false);
          $(
            "<input id='zipcode' class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' style='width:60px;' readonly='readonly' type='text' value='' />"
          ).appendTo(_zipspan);
          _zipfind = $(
            "<span class='icon i-20 icon-geolocate align-middle'></span>"
          ).appendTo(_zipspan);
          _zipspan2 = $("<div class='ziplines'></div>").appendTo(_fieldEdit);
          $(
            "<input id='address' class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' readonly='readonly' type='text' value='' />"
          ).appendTo(_zipspan2);
          _zipspan3 = $("<div class='ziplines'></div>").appendTo(_fieldEdit);
          $(
            "<input id='address2' class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          ).appendTo(_zipspan3);
          _zipfind.click(function (e) {
            var _fC = $(this).parents(".fieldContaner");
            var addrtype = $("#addrtype", _fC).val();

            // $.ZipPopUp(function(zipCode, state, city, street,
            // address, tr) {
            $.ZipPopUp(function (type, addr) {
              // 20140331 jwkim 도로명주소
              // type: [1] 도로명 , [2] 지번
              var zipCode =
                addr.ZIPCODE.substring(0, 3) +
                "-" +
                addr.ZIPCODE.substring(3, 6);
              $("input:eq(0)", _fC).val(zipCode);
              $("input:eq(1)", _fC).val(addr.ADDRESS_1);

              // todo 멀티주소 도로명 관련 변경 부분 수정 필요함. 20140331 jwkim

              /*
               * $('input:eq(0)', _fC).val(zipCode); $('input:eq(1)',
               * _fC).val(state + " " + city); $('input:eq(2)',
               * _fC).val(street) .attr('ADDR_TYPE',
               * addrtype).attr('ZIP_CODE', zipCode).attr('STATE',
               * state).attr('CITY', city).attr('STREET',
               * street).attr('ADDRESS', address); //_fC.attr('value',
               * addrtype + "," + zipCode + "," + state + "," + city +
               * "," + street).trigger('change');
               */
              _fC.trigger("change");
            });
          });

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _zipspan);
          }
          break;
        case "multitel":
          if (
            _fieldContaner.attr("jobType") == undefined ||
            _fieldContaner.attr("jobType") == ""
          ) {
            alert("jobType이 없습니다");
            return false;
          }
          var _store = _fieldEdit;
          var _span = $("<span class='pinset'></span>").appendTo(_store);

          var _select = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle teltype' style='width:60px;'></select>"
          ).appendTo(_span);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle telno' style='width:65%;' type='text' value='' />"
          ).appendTo(_span);

          _M.f.c.SetOptionCode(_select, "TEL_TYPE", "선택", false);

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "multiemail":
          if (
            _fieldContaner.attr("jobType") == undefined ||
            _fieldContaner.attr("jobType") == ""
          ) {
            alert("jobType이 없습니다");
            return false;
          }
          var _store = _fieldEdit;
          var _span = $("<span class='pinset'></span>").appendTo(_store);
          var _select = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle emailtype' style='width:60px;'></select>"
          ).appendTo(_span);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle email' style='width:65%;' type='text' value='' />"
          ).appendTo(_span);

          _M.f.c.SetOptionCode(_select, "EMAIL_TYPE", "선택", false);

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
          
          //khma 20240329 이메일 타입 신규 추가
        case "email":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle email' type='text' value='' />"
          ).appendTo(_span); 
		  
		  //khma 20240326 Adding Validation
          _o.change(function () {
			  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			   if (!reg.test($(this).val())) {
				   alert('이메일 정보가 부정확합니다.');
				   $(this).val("");
				}
          });
		  
          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
          
        case "text":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          ).appendTo(_span); // CSS JDM

          if (option.inputLimit != undefined) {
            //inputLimit 속성이 있을경우는 type을 셋팅한다
            var il = option.inputLimit;
            var ilType = il.type;
            if (ilType == "numberOnly") {
              //숫자만 입력가능
              _o.addClass("ilNumberOnly");
            } else {
              //현재 기타 타입은 regex로 처리
              //TODO 정규식 적용 처리는 차후 진행...jwkim 20150414
              if (il.regex == undefined) {
                alert("해당 필드에 정규식값을 설정해 주십시요.");
              }
              var regex = il.regex;
            }
          }

          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }
          if (option.AutoSearch != undefined) {
            _o.superContaner("AutoSearch", option.AutoSearch, "text");
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "password":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='password' value='' />"
          ).appendTo(_span); // CSS JDM
          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "passwordcheck":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='password' value='' />"
          ).appendTo(_span); // CSS JDM
          _o.change(function () {
            if (!validatePassword($(this).val())) {
              $(this).val("");
            }
          });

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "linkKey":
          var customIcon = option.customIcon;
          if (undefined == customIcon || "" == customIcon) {
            customIcon = "icon-search";
          }

          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input  class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' for='linkkey' />"
          )
            .appendTo(_span)
            .change(function () {
              // CSS JDM
              _o.attr("data", $(this).val());
            });

          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }

          var _img = $(
            "<span class='icon i-20 " + customIcon + " align-middle'></span>"
          ).appendTo(_span);
          _img.click(function (e) {
            /*
             * var _inputval = ""; if(_o.attr("data") != undefined){
             * _inputval = _o.attr("data"); }
             */ // 20180909
            var _fieldContaner = $(this).parents(".fieldContaner");
            $.ShowPopUpTableJson(
              _fieldContaner.attr("linkJson"),
              _fieldContaner,
              function (key, display, trobj) {
                if (key != undefined) {
                  $("input", _fieldContaner).val($.decHTML(display));
                  $("input", _fieldContaner).attr("data", $.decHTML(display));
                  _fieldContaner.attr("linkvalue", key);
                  _fieldContaner.trigger("change");
                }
              }
            );
            /*
             * if(option.filterData != undefined && option.filterData !=
             * ""){ //alert(option.filterData + ' / ' + _inputval); var
             * _fil = $(".ShowPopUpTableJson .fieldContaner[field='" +
             * option.filterData + "']"); if(_inputval != ""){
             * _fil.attr("value",_inputval).removeClass("fldChange").addClass("fldChange");
             * _fil.find("input").val(_inputval); }
             * $("#ShowPopUpTableJson_1").superContaner('List'); }
             */ // 20180909
          });
          if (option.AutoSearch != undefined) {
            _o.superContaner("AutoSearch", option.AutoSearch, "linkKey");
          } else {
            _o.keydown(function (e) {
              var _fieldContaner = $(this).parents(".fieldContaner");
              if (e.keyCode == "13") {
                // var _inputval = _o.val();
                e.preventDefault();
                $.ShowPopUpTableJson(
                  _fieldContaner.attr("linkJson"),
                  _fieldContaner,
                  function (key, display, trobj) {
                    if (key != undefined) {
                      $("input", _fieldContaner).val(display);
                      _fieldContaner.attr("linkvalue", key);
                      _fieldContaner.trigger("change");
                    }
                  }
                );
                /*
                 * if(option.filterData != undefined &&
                 * option.filterData != ""){
                 * //alert(option.filterData + ' / ' + _inputval);
                 * var _fil = $(".ShowPopUpTableJson
                 * .fieldContaner[field='" + option.filterData +
                 * "']"); if(_inputval != ""){
                 * _fil.attr("value",_inputval).removeClass("fldChange").addClass("fldChange");
                 * _fil.find("input").val(_inputval); }
                 * $("#ShowPopUpTableJson_1").superContaner('List'); }
                 */ // 20180909
              }
            });
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
		case "linkKey2": //20240621
          var customIcon = option.customIcon;
          if (undefined == customIcon || "" == customIcon) {
            customIcon = "icon-search";
          }

          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input  class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' for='linkkey' />"
          )
            .appendTo(_span)
            .change(function () {
              // CSS JDM
              _o.attr("data", $(this).val());
            });

          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }

          var _img = $(
            "<span class='icon i-20 " + customIcon + " align-middle'></span>"
          ).appendTo(_span);
          _img.click(function (e) {
            /*
             * var _inputval = ""; if(_o.attr("data") != undefined){
             * _inputval = _o.attr("data"); }
             */ // 20180909
            var _fieldContaner = $(this).parents(".fieldContaner");
            $.ShowPrevSignPopUpJson(
              _fieldContaner.attr("linkJson"),
              _fieldContaner,
              function (key, display, trobj) {
                if (key != undefined) {
                  $("input", _fieldContaner).val($.decHTML(display));
                  $("input", _fieldContaner).attr("data", $.decHTML(display));
                  _fieldContaner.attr("linkvalue", key);
                  _fieldContaner.trigger("change");
                }
              }
            );
            /*
             * if(option.filterData != undefined && option.filterData !=
             * ""){ //alert(option.filterData + ' / ' + _inputval); var
             * _fil = $(".ShowPopUpTableJson .fieldContaner[field='" +
             * option.filterData + "']"); if(_inputval != ""){
             * _fil.attr("value",_inputval).removeClass("fldChange").addClass("fldChange");
             * _fil.find("input").val(_inputval); }
             * $("#ShowPopUpTableJson_1").superContaner('List'); }
             */ // 20180909
          });
          if (option.AutoSearch != undefined) {
            _o.superContaner("AutoSearch", option.AutoSearch, "linkKey");
          } else {
            _o.keydown(function (e) {
              var _fieldContaner = $(this).parents(".fieldContaner");
              if (e.keyCode == "13") {
                // var _inputval = _o.val();
                e.preventDefault();
                $.ShowPopUpTableJson(
                  _fieldContaner.attr("linkJson"),
                  _fieldContaner,
                  function (key, display, trobj) {
                    if (key != undefined) {
                      $("input", _fieldContaner).val(display);
                      _fieldContaner.attr("linkvalue", key);
                      _fieldContaner.trigger("change");
                    }
                  }
                );
                $.ShowPrevSignPopUpJson(
                  _fieldContaner.attr("linkJson"),
                  _fieldContaner,
                  function (key, display, trobj) {
                    if (key != undefined) {
                      $("input", _fieldContaner).val(display);
                      _fieldContaner.attr("linkvalue", key);
                      _fieldContaner.trigger("change");
                    }
                  }
                );
                /*
                 * if(option.filterData != undefined &&
                 * option.filterData != ""){
                 * //alert(option.filterData + ' / ' + _inputval);
                 * var _fil = $(".ShowPopUpTableJson
                 * .fieldContaner[field='" + option.filterData +
                 * "']"); if(_inputval != ""){
                 * _fil.attr("value",_inputval).removeClass("fldChange").addClass("fldChange");
                 * _fil.find("input").val(_inputval); }
                 * $("#ShowPopUpTableJson_1").superContaner('List'); }
                 */ // 20180909
              }
            });
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "linktext":
          var customIcon = option.customIcon;
          if (undefined == customIcon || "" == customIcon) {
            customIcon = "icon-search";
          }

          var _arFld = option.field.split(",");
          if (_arFld.length != 2) {
            alert(
              "필드정보 생성시에 'linktext' 타입인 경우는 2개의 필드[키번호, 명칭]가 정의되어야 합니다."
            );
          }
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .css("width", "30%")
            .css("margin-right", "6px");
          $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .css("width", "60%");
          var _img = $(
            "<span class='icon i-20 " + customIcon + " align-middle'></span>"
          )
            .appendTo(_span)
            .click(function (e) {
              var _fieldContaner = $(this).parents(".fieldContaner");
              $.ShowPopUpTableJson(
                _fieldContaner.attr("linkJson"),
                _fieldContaner,
                function (key, display, trobj) {
                  if (key != undefined) {
                    $("input:eq(0)", _fieldContaner).val(key);
                    $("input:eq(1)", _fieldContaner).val(display);
                    _fieldContaner.trigger("change");
                  }
                }
              );
            });
          if (option.AutoSearch != undefined) {
            $("input", _fieldContaner).superContaner(
              "Autocomplete",
              {
                Method: option.AutoSearch,
              },
              function (rlt) {
                var _fieldContaner = rlt.obj.parents(".fieldContaner");
                $("input:eq(0)", _fieldContaner).val(rlt.key);
                $("input:eq(1)", _fieldContaner).val(rlt.display);
                _fieldContaner.trigger("change");
              }
            );
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "date": // layout='centering' 속성 임시 제거
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit); // CSS JDM
          var _calimg = $(
            "<span class='icon i-20 icon-calendar align-middle'></span>"
          );
          if (eval(option.popup)) {
            var _o = $(
              "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
            )
              .appendTo(_span)
              .attr({
                for: "datepicker",
                maxlength: "10",
              })
              .css("width", "80px")
              .change(function () {
                if (isDate($(this).val())) {
                  //date포멧 yyyy-mm-dd로 변경후 셋팅
                  var dt = $(this).val();
                  dt = dt.replace(/-/gi, "");
                  dt = _M.f.c.convDate8(dt);
                  $(this).val(dt);
                } else {
                  if ($(this).val() != "") {
                    $(this).val("");
                    alert("정상적인 날짜가 아닙니다.");
                    $.datepicker._clearDate($(this));
                  }
                }
              });
            _calimg.appendTo(_span).click(function (e) {
              var _ndate = _o.val();
              // var _left =
              // e.srcElement.getBoundingClientRect().left;
              var _left = e.screenX;
              var _top = e.screenY;
              var _date = window.showModalDialog(
                "/ui/popup/datepicker.html?date=" + _ndate,
                "datepicker",
                "scroll:no;status:no;dialogWidth:120px;dialogHeight:234px;dialogLeft:" +
                  _left +
                  "px;dialogTop:" +
                  _top +
                  "px"
              );
              if (_date == undefined) {
                _date = _ndate;
              }
              _o.val(_date);
            });
          } else {
            var _o = $(
              "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
            )
              .appendTo(_span)
              .attr({
                for: "datepicker",
                maxlength: "10",
              })
              .css("width", "80px")
              .datepicker({
                constrainInput: true,
              })
              .change(function () {
                if (isDate($(this).val())) {
                  //date포멧 yyyy-mm-dd로 변경후 셋팅
                  var dt = $(this).val();
                  dt = dt.replace(/-/gi, "");
                  dt = _M.f.c.convDate8(dt);
                  $(this).val(dt);
                } else {
                  if ($(this).val() != "") {
                    $(this).val("");
                    alert("정상적인 날짜가 아닙니다.");
                    $.datepicker._clearDate($(this));
                  }
                }
              });
            $(_fieldEdit).click(function (e) {
              $("input", $(this)).datepicker("show");
            });

            // 2018.08.13 dmjung :: firefox 에서 아이콘이 인풋박스 보다 선행해서 그려지는 문제
            // 잡기 위해 append 마지막에 실행
            _calimg.appendTo(_span);
          }

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "date8": // centering 속성 제거
          _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic  align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .attr("maxlength", 10)
            .css("width", "80px")
            .datepicker({
              constrainInput: true,
            });
          $(_fieldEdit).click(function (e) {
            $("input", $(this)).datepicker("show");
          });
          $(
            "<span class='icon i-20 icon-calendar align-middle'></span>"
          ).appendTo(_span);

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "dateBetween": // centering 속성 제거 : gen
          // option.field
          var _arFld = option.field.split(",");
          if (_arFld.length != 2) {
            alert(
              "필드정보 생성시에 'dateBetween' 타입인 경우는 2개의 필드[시작일,종료일]가 정의되어야 합니다."
            );
          }

          _fieldEdit
            .css("width", _dateWidth + 40)
            .css("display", "inline-block");
          fromid = "dateBetween" + formCID++;
          _fromspan = $("<span class='pinset'></span>").appendTo(_fieldEdit);

          // 2018.08.19 dmjung :: fromdate 클래스 추가
          _from = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle fromdate' type='text' value='' id='" +
              fromid +
              "' />"
          )
            .appendTo(_fromspan)
            .css("width", _dateWidth)
            .change(function () {
              if (isDate($(this).val())) {
              } else {
                $(this).val("");
                alert("정상적인 날짜가 아닙니다.");
                $.datepicker._clearDate($(this));
              }
            });
          $("<span class='icon i-20 icon-calendar align-middle'></span>")
            .appendTo(_fromspan)
            .click(function (e) {
              $("input", $(this).parent()).datepicker("show");
            });

          $("<a class='fieldSpace align-middle'>~</a>")
            .appendTo(_fromspan)
            .css("padding", "0 0 0 0")
            .css("width", "15px")
            .css("margin-right", "6px")
            .css("margin-left", "6px");

          if (option.beforeLabel != undefined) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fromspan);
          }

          _fieldEdit2 = $(
            "<div class='fieldEdit' style='display:inline-block'></div>"
          )
            .appendTo(_fieldContaner)
            .css("width", _dateWidth + 40);
          toid = "dateBetween" + formCID++;
          _tospan = $("<span class='pinset'></span>").appendTo(_fieldEdit2);

          // 2018.08.19 dmjung :: todate 클래스 추가
          $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle todate' type='text' value='' id='" +
              toid +
              "' />"
          )
            .appendTo(_tospan)
            .css("width", _dateWidth)
            .change(function () {
              if (isDate($(this).val())) {
              } else {
                $(this).val("");
                alert("정상적인 날짜가 아닙니다.");
                $.datepicker._clearDate($(this));
              }
            });
          $("<span class='icon i-20 icon-calendar align-middle'></span>")
            .appendTo(_tospan)
            .click(function (e) {
              $("input", $(this).parent()).datepicker("show");
            });

          // TO-DO
          // 이미지로 로딩되는 부분 단순 이미지로 교체해야 함.
          var dates = $("#" + fromid + ", #" + toid).datepicker({
            changeMonth: true,
            numberOfMonths: 1,
            onSelect: function (selectedDate) {
              // 2018.08.19 dmjung :: classList[9] 에
              // fromdate or todate 클래스 string 값이 들어옴
              var type = "maxDate";
              if ($(this).attr("class").indexOf("fromdate") > 0)
                type = "minDate";
              var option = type,
                instance = $(this).data("datepicker"),
                date = $.datepicker.parseDate(
                  instance.settings.dateFormat ||
                    $.datepicker._defaults.dateFormat,
                  selectedDate,
                  instance.settings
                );
              dates.not(this).datepicker("option", option, date);
              $(this).parent().parent().trigger("change");
            },
          });

          if (option.afterLabel != undefined) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _tospan);
          }
          break;
        case "datetime": // centering 속성 제거
          /* 20141226 datetime타입을 두개의 컬럼이 아닌 하나의 컬럼으로 관리 하도록 처리 Start */
          // var _arFld = option.field.split(',');
          // if (_arFld.length != 2) {
          // alert("필드정보 생성시에 'datetime' 타입인 경우는 2개의 필드[날짜,시간]가 정의되어야
          // 합니다.");
          // }
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _i1 = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .attr("maxlength", 10)
            .datepicker({
              constrainInput: true,
            })
            .css("width", "80px")
            .change(function () {
              if (isDate($(this).val())) {
              } else {
                $(this).val("");
                alert("정상적인 날짜가 아닙니다.");
                $.datepicker._clearDate($(this));
              }
            });
          if (option.mindate != undefined) {
            _i1.datepicker("option", "minDate", option.mindate);
          }
          if (option.maxdate != undefined) {
            _i1.datepicker("option", "maxDate", option.maxdate);
          }
          $("<span class='icon i-20 icon-calendar align-middle'></span>")
            .appendTo(_span)
            .click(function (e) {
              $("input", $(this).parent()).datepicker("show");
            }); // .css("float", "left")
          var _o1 = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select> "
          )
            .appendTo(_span)
            .css("width", "80px"); // .css("vertical-align",
          // "5px"); JDM
          // CSS
          _M.f.c.SetOptionCode(_o1, "TimeHours");
          var _o2 = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>"
          )
            .appendTo(_span)
            .css("width", "60px"); // .css("vertical-align",
          // "5px");
          _M.f.c.SetOptionCode(_o2, "TimeMinutes");
          var _e = $("<span class='icon i-20 icon-clock align-middle'></span>")
            .appendTo(_span)
            .click(function () {
              // .css("float",
              // "inherit") JDM
              // CSS
              _Time = _M.f.d.getTime();
              _i1.val(_M.f.d.getDate()).trigger("change");
              _o1.val(_Time.substr(0, 2)).trigger("change");
              _o2.val(_Time.substr(2, 2)).trigger("change");
            });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        /* 20141226 datetime타입을 두개의 컬럼이 아닌 하나의 컬럼으로 관리 하도록 처리 End */
        /*
         * var _arFld = option.field.split(','); if (_arFld.length != 2) {
         * alert("필드정보 생성시에 'datetime' 타입인 경우는 2개의 필드[날짜,시간]가 정의되어야 합니다."); }
         * var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
         * var _i1 = $("<input class='input-bg input-ft b-t b-r b-b b-l
         * b-co b-co-basic align-middle' type='text' value=''
         * />").appendTo(_span).attr('maxlength', 10).datepicker({
         * constrainInput: true }).css("width", "80px").change(function() {
         * if (isDate($(this).val())) { } else { $(this).val("");
         * alert("정상적인 날짜가 아닙니다."); $.datepicker._clearDate($(this)); } });
         * if (option.mindate != undefined) { _i1.datepicker("option",
         * "minDate", option.mindate); } if (option.maxdate != undefined) {
         * _i1.datepicker("option", "maxDate", option.maxdate); } $("<span
         * class='icon i-20 icon-calendar align-middle'></span>").appendTo(_span).click(function(e) {
         * $('input', $(this).parent()).datepicker("show")
         * });//.css("float", "left") var _o1 = $("<select class='input-bg
         * input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>
         * ").appendTo(_span).css('width', "80px");//.css("vertical-align",
         * "5px"); JDM CSS _M.f.c.SetOptionCode(_o1, "TimeHours"); var _o2 =
         * $("<select class='input-bg input-ft b-t b-r b-b b-l b-co
         * b-co-basic align-middle'></select>").appendTo(_span).css('width',
         * "60px");//.css("vertical-align", "5px");
         * _M.f.c.SetOptionCode(_o2, "TimeMinutes"); var _e = $("<span
         * class='icon i-20 icon-clock align-middle'></span>").appendTo(_span).click(function() {
         * //.css("float", "inherit") JDM CSS _Time = _M.f.d.getTime();
         * _i1.val(_M.f.d.getDate()).trigger("change");
         * _o1.val(_Time.substr(0, 2)).trigger("change");
         * _o2.val(_Time.substr(2, 2)).trigger("change"); }); if (
         * option.beforeLabel != undefined || option.afterLabel != undefined ) {
         * var value = { before : option.beforeLabel ? option.beforeLabel :
         * undefined, after : option.afterLabel ? option.afterLabel :
         * undefined } attachLabels(value, _span); } break;
         */
        case "datetimeBetween": // 추가대기
          var _arFld = option.field.split(",");
          if (_arFld.length != 4) {
            alert(
              "필드정보 생성시에 'datetimeBetween' 타입인 경우는 4개의 필드[시작일자,시작시간,종료일자,종료시간]가 정의되어야 합니다."
            );
          }

          // 시작일자,시작시간
          _fieldEdit.css("display", "inline-block");
          _fromspan = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _fi1 = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_fromspan)
            .attr("maxlength", 10)
            .css("width", "80px")
            .datepicker({
              changeMonth: true,
            })
            .change(function () {
              _ti1.datepicker("option", "minDate", _fi1.val());
              if (isDate($(this).val())) {
              } else {
                $(this).val("");
                alert("정상적인 날짜가 아닙니다.");
                $.datepicker._clearDate($(this));
              }
            });
          $("<span class='icon i-20 icon-calendar align-middle'></span>")
            .appendTo(_fromspan)
            .click(function (e) {
              $("input", $(this).parent()).datepicker("show");
            });
          var _fo1 = $(
            "<select class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic  align-middle'></select>"
          )
            .appendTo(_fromspan)
            .css("width", "80px");
          _M.f.c.SetOptionCode(_fo1, "TimeHours");

          var _fo2 = $(
            "<select class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic  align-middle'></select>"
          )
            .appendTo(_fromspan)
            .css("width", "60px");
          _M.f.c.SetOptionCode(_fo2, "TimeMinutes");

          // 가운데
          $("<a class='fieldSpace align-middle'>~</a>")
            .appendTo(_fieldContaner)
            .css("padding", "0 0 0 0")
            .css("width", "15px")
            .css("margin-right", "10px");
          if (option.beforeLabel != undefined) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fromspan);
          }

          // 종료일자,종료시간
          _fieldEdit2 = $("<div class='fieldEdit'></div>")
            .css("display", "inline-block")
            .appendTo(_fieldContaner);
          _tospan = $("<span class='pinset'></span>").appendTo(_fieldEdit2);
          var _ti1 = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_tospan)
            .attr("maxlength", 10)
            .css("width", "80px")
            .datepicker({
              changeMonth: true,
            })
            .change(function () {
              _fi1.datepicker("option", "maxDate", _ti1.val());
              if (isDate($(this).val())) {
              } else {
                $(this).val("");
                alert("정상적인 날짜가 아닙니다.");
                $.datepicker._clearDate($(this));
              }
            });
          $("<span class='icon i-20 icon-calendar align-middle'></span>")
            .appendTo(_tospan)
            .click(function (e) {
              $("input", $(this).parent()).datepicker("show");
            });
          var _to1 = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>"
          )
            .appendTo(_tospan)
            .css("width", "80px");
          _M.f.c.SetOptionCode(_to1, "TimeHours");
          var _to2 = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>"
          )
            .appendTo(_tospan)
            .css("width", "60px");
          _M.f.c.SetOptionCode(_to2, "TimeMinutes");

          if (option.afterLabel != undefined) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _tospan);
          }
          break;
        case "number":
          _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle t_Number' type='text' value='' />"
          ).appendTo(_span); // .css('text-align', 'right');
          var maxLen = 11; // deafult length
          if (option.maxlength != undefined) {
            maxLen = option.maxlength;
          }
          _o.attr("maxlength", maxLen);

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "money":
          _fieldView.css("text-align", "right");
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle t_Money' type='text' value='' />"
          ).appendTo(_span); // .css('text-align', 'right');
          var maxLen = 11; // deafult length
          if (option.maxlength != undefined) {
            maxLen = option.maxlength;
          }
          _o.attr("maxlength", maxLen);
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "select":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>"
          ).appendTo(_span);
          if (undefined != option.selectOption) {
            // 20180415 jwkim
            // multiple관련 옵션추가
            if (true == option.selectOption.multiple) {
              _o.attr("multiple", true);
            }
            if (undefined != option.selectOption.size) {
              _o.attr("size", option.selectOption.size);
            }
            if (undefined != option.selectOption.noblank) {
              _o.attr("noblank", option.selectOption.noblank);
            }
          }
          var _firstOption = "선택";
          var _syncFlag = _M.aSync.sync;
          if (option.firstOption != undefined) {
            _firstOption = option.firstOption;
          }
          if (option.syncTf != undefined) {
            _syncFlag = option.syncTf;
          }
          if (_fieldContaner.attr("parentfield") == undefined) {
            _M.f.c.SetOptionCode(_o, option.codes, _firstOption, _syncFlag);
          } else {
            _o.append("<option value=''>선택</option>");
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          // _o.trigger($.Event('changeCombobox'));
          // input change function in selectbox
          // _o.unbind("changeCombobox").bind("changeCombobox", function
          // (e) {
          _o.change(function (e) {
            var selectObj = $(this);
            var optionValue = selectObj.val();
            var childrenList = $(
              "div[parentField='" + option.field + "']",
              _Obj
            );
            // there's no childfields
            if (childrenList.length < 1) return;

            var selectList = $("select", childrenList);
            selectList.find("option").remove();
            if (optionValue != "") {
              var upperCode = optionValue;
              // service
              selectList.each(function (i) {
                // _M.f.c.SetOptionCode($(this), optionValue,
                // _firstOption, _syncFlag, upperCode);
                _M.f.c.SetOptionCode(
                  $(this),
                  childrenList.eq(i).attr("codes"),
                  _firstOption,
                  _syncFlag,
                  upperCode,
                  childrenList.eq(i).attr("parentfield")
                ); // 20140331
                // jwkim
              });
            } else {
              selectList.append("<option value=''>선택</option>");
            }
            selectList.change(); // trigger("changeCombobox");
          });

          /*
           * _o.change(function(e) { _o.trigger('changeCombobox'); });
           */
          break;
        case "context":
          $("<span class='menuimg'></span>").appendTo(_fieldEdit);
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .attr("readonly", "readonly");
          $.SetContextCode(
            _fieldEdit,
            option.codes,
            "mousedown",
            "DivContextMenu",
            function (li) {
              _o.val(li.attr("cmd")).trigger("change");
            }
          );
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "phone":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle ' type='text' value='' />"
            //"<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle t_Number' type='text' value='' />"
          ).appendTo(_span);
          $("<span class='view-telephone'></span>").appendTo(_span);
          
		  //khma 20240328 Adding Validation
          _o.change(function (e) {
			  let _phoneNumber = $(this).val().replace(/[^0-9]/g,"");
			  if(_phoneNumber.length > 6 && _phoneNumber.length < 9) {
				  _phoneNumber = _phoneNumber.replace(/^(\d+)(\d{4})$/, "$1-$2").replace(/(\-{1,2})$/g, "");
			  } else if(_phoneNumber.length > 8 && _phoneNumber.substr(0,2) == "82") {
				  _phoneNumber = "82-" + _phoneNumber.substr(2).replace(/^(02|\d{3})(\d+)(\d{4})$/, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
			  } else if(_phoneNumber.length > 8 && _phoneNumber.length < 12) {
				  _phoneNumber = _phoneNumber.replace(/^(02|\d{3})(\d+)(\d{4})$/, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
			  } else if(_phoneNumber.length == 0) {
				  _phoneNumber = _phoneNumber.replace(/^(02|\d{3})(\d+)(\d{4})$/, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
			  }else {
				   alert('번호가 부정확합니다.');
				  _phoneNumber = "";
			  }
			  $(this).val(_phoneNumber);
          });
          
          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          } else {
            _o.attr("maxlength", 20);
          }
          /*
           * $.SetContextMenu(_fieldEdit, _M.Menus.phone, "mousedown",
           * "DivContextMenu", function(e) { _o.val($(e).attr("cmd")); });
           */
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "chkselect":
          $("<span class='menuimg'></span>").appendTo(_fieldEdit);
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .attr("readonly", "readonly");
          $.SetChkList(
            _fieldEdit,
            option.codes,
            "mousedown",
            "DivTableMenu",
            function (value) {
              _o.val(value).trigger("change");
            }
          );
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "radio":
          /*
           * var cols = ""; if(option.cols == undefined){ cols = 4; }else{
           * cols = option.cols; }
           */
          var colwidth = 0;
          var colcss = "";
          if (option.colwidth != undefined) {
            colwidth = option.colwidth;
          }

          if (option.colcss != undefined) {
            colcss = option.colcss;
          }

          // _M.f.c.SetRadioCode(_fieldEdit, option.codes, colwidth);
          _M.f.c.SetRadioCodeCss(_fieldEdit, option.codes, colwidth, colcss);
          _M.f.c.SetRadioCodeCss(
            _fieldView,
            option.codes,
            colwidth,
            colcss,
            true
          ); // 20150129 fieldView도 같은 디자인 형태로처리

          break;
        case "multicheck":
          /*
           * var cols = ""; if(option.cols == undefined){ cols = 4; }else{
           * cols = option.cols; }
           */
          var colwidth = 0;
          if (option.colwidth != undefined) {
            colwidth = option.colwidth;
          }
          _M.f.c.SetMultiCheckCode(_fieldEdit, option.codes, colwidth);
          _M.f.c.SetMultiCheckCode(_fieldView, option.codes, colwidth, true); // 20150129 fieldView도 같은 디자인 형태로처리
          break;
        case "multiiconcheck": {
          var colwidth = 0;
          if (option.colwidth != undefined) {
            colwidth = option.colwidth;
          }
          _fieldContaner
            .attr("oldValue", "0")
            .attr("Value", "0")
            .attr(
              "selectIcon",
              uf(option.selectIcon, option.selectIcon, "likecheck02")
            )
            .attr(
              "unselectIcon",
              uf(option.unselectIcon, option.unselectIcon, "likecheck01")
            );
          _M.f.c.SetMultiiconCheckCode(_fieldEdit, option.codes, colwidth);
          break;
        }
        case "check":
          checkid = "check" + formCID++;
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          $(
            "<input type='checkbox' value='1' id='" +
              checkid +
              "' /><label for='" +
              checkid +
              "'>" +
              option.label +
              "</label>"
          )
            .appendTo(_span)
            .css("width", "auto");
          checkid = "check" + formCID++;
          var _span2 = $("<span class='pinset'></span>").appendTo(_fieldView);
          $(
            "<input type='checkbox' value='1' id='" +
              checkid +
              "' disabled /><label for='" +
              checkid +
              "'>" +
              option.label +
              "</label>"
          )
            .appendTo(_span2)
            .css("width", "auto");
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
            attachLabels(value, _span2);
          }
          break;
        case "iconcheck": {
          $(
            "<span class='clsiconcheck'><span class='cmdicon likecheck01'></span><a class='cmdiconLabel'>" +
              option.label +
              "</a></span>"
          ).appendTo(_fieldEdit);
          _fieldContaner
            .attr("oldValue", "0")
            .attr("Value", "0")
            .attr("Value", "0")
            .attr(
              "selectIcon",
              uf(option.selectIcon, option.selectIcon, "icon-cbblue")
            )
            .attr(
              "unselectIcon",
              uf(option.unselectIcon, option.unselectIcon, "btn-delete")
            );
          break;
        }
        case "Isuse":
          checkid = "check" + formCID++;
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          $(
            "<input type='checkbox' value='1' id='" +
              checkid +
              "' /><label for='" +
              checkid +
              "'>" +
              option.label +
              "</label>"
          )
            .appendTo(_span)
            .css("width", "auto");
          break;

        case "tel":
          var _arFld = option.field.split(",");
          if (_arFld.length != 3) {
            alert(
              "필드정보 생성시에 'tel' 타입인 경우는 3개[전화번호1,전화번호2,전화번호3]의 필드가 정의되어야 합니다."
            );
          }
          _fieldEdit.css("width", "40px").css("display", "inline-block");
          _tel1span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          ).appendTo(_tel1span);
          _tel2edit = $("<span class='fieldEdit'></span>")
            .appendTo(_fieldContaner)
            .css("width", "40px")
            .css("display", "inline-block");
          _tel2span = $("<span class='pinset'></span>").appendTo(_tel2edit);
          $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_tel2span)
            .attr("maxlength", 4);
          _tel3edit = $("<span class='fieldEdit'></span>")
            .appendTo(_fieldContaner)
            .css("width", "40px")
            .css("display", "inline-block");
          _tel3span = $("<span class='pinset'></span>").appendTo(_tel3edit);
          $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_tel3span)
            .attr("maxlength", 4);
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fieldEdit);
          }
          break;
        case "multicombo":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _arFld = option.field.split(",");
          $.each(_arFld, function (index, value) {
            var _o = $(
              "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
            )
              .appendTo(_span)
              .attr("readonly", "readonly");
            _o.css("width", 90 / _arFld.length + "%");
          });
          if (option.codes != undefined) {
            $.SetMultiCombo(
              _fieldContaner,
              option.codes,
              "mousedown",
              "DivContextMenu",
              function (value, _fC) {
                var _arValue = value.split(",");
                $.each(_arValue, function (index, _v) {
                  $("input:eq(" + index + ")", _fC).val(_v);
                });
                _fC.trigger("change");
              }
            );
          } else {
            $.SetMultiSvcCombo(
              _fieldContaner,
              option.service,
              option.method,
              "mousedown",
              "DivContextMenu",
              function (value, _fC) {
                var _arValue = value.split(",");
                $.each(_arValue, function (index, _v) {
                  $("input:eq(" + index + ")", _fC).val(_v);
                });
                _fC.trigger("change");
              }
            );
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "multilist":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _arFld = option.field.split(",");
          $.each(_arFld, function (index, value) {
            var _o = $(
              "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
            )
              .appendTo(_span)
              .attr("readonly", "readonly")
              .attr("level", index);
            _o.css("width", 98 / _arFld.length + "%");
          });
          if (option.codes != undefined) _fieldEdit.attr("codes", option.codes);
          if (option.service != undefined)
            _fieldEdit.attr("service", option.service);
          if (option.method != undefined)
            _fieldEdit.attr("method", option.method);
          $("input", _span).click(function (e) {
            var _in = $(this);
            $.SetMultiList(_in, function (val, _obj) {
              _in.val(val).trigger("change");
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "zip":
          var _arFld = option.field.split(",");
          if (_arFld.length != 3) {
            alert(
              "필드정보 생성시에 'zip' 타입인 경우는 3개의 필드[우편번호,주소1,주소2]가 정의되어야 합니다."
            );
          }
          if (option.onerow) {
            _fieldEdit.css("width", "95%");
            $(
              "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
            )
              .appendTo(_fieldEdit)
              .css("width", "60px");
            _zipfind = $(
              "<span class='icon i-20 icon-geolocate align-middle'></span>"
            )
              .appendTo(_fieldEdit)
              .css("display", "inline-block");
            $(
              "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' style='margin-right:4px;' type='text' value='' />"
            )
              .appendTo(_fieldEdit)
              //.css("width", "240px");
              .css("width", "340px"); //khma 20240322 size change
            if (option.maxlength != undefined) {
              // 2015.04.15 hycho : 상세주소 maxlength 추가
              $(
                "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
              )
                .appendTo(_fieldEdit)
                //.css("width", "350px")
                .css("width", "240px") //khma 20240322 size change
                .attr("maxlength", option.maxlength);
            } else {
              $(
                "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
              )
                .appendTo(_fieldEdit)
                //.css("width", "350px");
                .css("width", "240px"); //khma 20240322 size change
            }
            $(
                "<span>※ 주소란에 회사, 부서, 직위, 직책 정보 입력 금지.</span>"
              )
              .appendTo(_fieldEdit)
                .css("padding-left", "10px");
          } else {
            // 2018.07.10 dmjung :: 새롭게 HTML 생성..
            _zipspan = $("<div class='ziplines'></div>").appendTo(_fieldEdit);
            $(
              "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' readonly='readonly' type='text' value='' />"
            )
              .css("width", "60px")
              .appendTo(_zipspan);
            _zipfind = $(
              "<span class='icon i-20 icon-geolocate align-middle'></span>"
            ).appendTo(_zipspan);
            _zipspan2 = $("<div class='ziplines'></div>").appendTo(_fieldEdit);
            $(
              "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' readonly='readonly' type='text' value='' />"
            )
              .css("width", "326px")
              .appendTo(_zipspan2);
            if (option.maxlength != undefined) {
              // 2015.04.15 hycho : 상세주소 maxlength 추가
              _zipspan3 = $("<div class='ziplines'></div>").appendTo(
                _fieldEdit
              );
              $(
                "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
              )
                .css("width", "326px")
                .attr("maxlength", option.maxlength)
                .appendTo(_zipspan3);
            } else {
              _zipspan3 = $("<div class='ziplines'></div>").appendTo(
                _fieldEdit
              );
              $(
                "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
              )
                .css("width", "326px")
                .appendTo(_zipspan3);
            }
          }
          //_zipfind.click(function(e) {
          //	var _fC = $(this).parents('.fieldContaner');
          //
          //	// 2018.07.10 dmjung :: 파라메터 추가, 속성 추가 ( 임시 )
          //	// $.ZipPopUp(function(zipCode, sido, gugun, dong, bunji,
          //	// tr) {
          //	$.ZipPopUp(function(addrType, addr) { // 20140331 jwkim ::
          //											// 도로명 주소 추가 및 파라메터
          //											// 통합전달 start
          //		// addrType: [1] 도로명 , [2] 지번
          //		//var zipCode = addr.ZIPCODE.substring(0, 3) + '-'+ addr.ZIPCODE.substring(3, 6);
          //		$('input:eq(0)', _fC).val(addr.ZIPCODE);
          //		$('input:eq(1)', _fC).val(addr.ADDRESS_1);
          //
          //		/*
          //		 * $('input:eq(0)', _fC).val(zipCode); $('input:eq(1)',
          //		 * _fC).val(sido + " " + gugun + " " + dong + " " +
          //		 * bunji) .attr('zipcode', zipCode).attr('SIDO',
          //		 * sido).attr('GUGUN', gugun).attr('DONG',
          //		 * dong).attr('BUNJI', bunji);
          //		 */
          //		_fC.trigger('change');
          //		// 20140331 jwkim :: 도로명 주소 추가 및 파라메터 통합전달 end
          //	});
          //});

          _zipfind.click(function (e) {
            var _fC = $(this).parents(".fieldContaner");
            new daum.Postcode({
              oncomplete: function (data) {
                var fullAddr = ""; // 최종 주소 변수
                var extraAddr = ""; // 조합형 주소 변수

                // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === "R") {
                  // 사용자가 도로명 주소를 선택했을 경우
                  fullAddr = data.roadAddress;
                } else {
                  // 사용자가 지번 주소를 선택했을 경우(J)
                  fullAddr = data.jibunAddress;
                }

                // 사용자가 선택한 주소가 도로명 타입일때 조합한다.
                if (data.userSelectedType === "R") {
                  //법정동명이 있을 경우 추가한다.
                  if (data.bname !== "") {
                    extraAddr += data.bname;
                  }
                  // 건물명이 있을 경우 추가한다.
                  if (data.buildingName !== "") {
                    extraAddr +=
                      extraAddr !== ""
                        ? ", " + data.buildingName
                        : data.buildingName;
                  }
                  // 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
                  fullAddr += extraAddr !== "" ? " (" + extraAddr + ")" : "";
                }
                $("input:eq(0)", _fC).val(data.zonecode);
                $("input:eq(1)", _fC).val(fullAddr);
                _fC.trigger("change");

                // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분입니다.
                // 예제를 참고하여 다양한 활용법을 확인해 보세요.
              },
            }).open();
            return;
            $.ZipOnePopUp(function (우편번호, 주소상, 주소하, tr) {
              $("input:eq(0)", _fC).val(우편번호);
              $("input:eq(1)", _fC).val(주소상 + " " + 주소하);
              _fC.trigger("change");
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fieldEdit);
          }
          break;
        case "zipone":
          var _arFld = option.field.split(",");
          if (_arFld.length != 2) {
            alert(
              "'zip' 타입의 필드정보에 [우편번호,주소]필드명이 정확하게 정의되어 있지 않습니다."
            );
          }
          _fieldEdit.css("width", "95%");
          $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_fieldEdit)
            .css("width", "60px");
          _zipfind = $(
            "<span class='icon i-20 icon-geolocate align-middle'></span> "
          )
            .appendTo(_fieldEdit)
            .css("display", "inline-block");
          $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_fieldEdit)
            .css("width", "600px")
            .keydown(function (e) {
              if (e.keyCode == "13") {
                var _inputval = $(this).val();
                var _fC = $(this).parents(".fieldContaner");
                $.ZipOnePopUp(function (zipCode, addr1, addr2, tr) {
                  $("input:eq(0)", _fC).val(zipCode);
                  $("input:eq(1)", _fC).val(addr1 + " " + addr2);
                  _fC.trigger("change");
                });

                var _fil = $(".ZipOnePopUp .fieldContaner[field='동']");
                _fil
                  .attr("value", _inputval)
                  .removeClass("fldChange")
                  .addClass("fldChange");
                _fil.find("input").val(_inputval);
                $("#ZipOnePopUp_1").superContaner("List");
              }
            });
          _zipfind.click(function (e) {
            var _fC = $(this).parents(".fieldContaner");

            $.ZipOnePopUp(function (zipCode, addr1, addr2, tr) {
              $("input:eq(0)", _fC).val(zipCode);
              $("input:eq(1)", _fC).val(addr1 + " " + addr2);
              _fC.trigger("change");
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fieldEdit);
          }
          break;
        case "slider":
          _fieldEdit.addClass("sliderEdit");
          var _SliderRead = $(
            "<span class='slider align-middle'></span>"
          ).appendTo(_fieldView);
          _min = 0;
          _max = 100;
          _mid = 50;
          if (option.min) {
            _min = option.min;
          }
          if (option.max) {
            _max = option.max;
          }
          _mid = (_min * 1 + _max * 1) / 2;

          _sliderOpt = {
            range: "min",
            value: 50,
            min: 0,
            max: 100,
            slide: function (event, ui) {
              _Text.val(ui.value).trigger("change");
            },
          };
          _sliderOpt.value = _mid * 1;
          _sliderOpt.min = _min * 1;
          _sliderOpt.max = _max * 1;

          _SliderRead.slider(_sliderOpt);
          _SliderRead.slider("disable");
          if (option.sliderColor != undefined) {
            $(".ui-slider-range", _SliderRead).css(
              "background",
              option.sliderColor
            );
          } else {
            $(".ui-slider-range", _SliderRead).css(
              "background",
              $(".Title").css("background-color")
            );
          }
          var _Text = $(
            "<input class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='0' />"
          )
            .appendTo(_fieldEdit)
            .css("width", "40")
            .change(function () {
              $(this).find("~ .slider").slider("value", $(this).val());
            });
          var _Slider = $("<span class='slider'></span>").appendTo(_fieldEdit);
          _Slider.slider(_sliderOpt);
          if (option.sliderColor != undefined) {
            $(".ui-slider-range", _Slider).css(
              "background",
              option.sliderColor
            );
          } else {
            $(".ui-slider-range", _Slider).css(
              "background",
              $(".Title").css("background-color")
            );
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fieldEdit);
          }
          break;

        case "textarea":
          if (_fieldEdit.parent().parent().hasClass("fldTdLabel") == true) {
            // 2018.05.22 dmjung :: Textarea 가 dataTD 가 아니라 LabelTD 에 있는
            // 경우.
            _fieldEdit
              .parent()
              .parent()
              .addClass("hasTextarea b-co b-co-basic");
          }
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' rows='5' cols='5'></textarea>"
          ).appendTo(_span);
          if (option.height != undefined) {
            _o.css("height", option.height);
            // 2018.05.27 dmjung :: 텍스트에리어를 갖고 있을 경우, fieldContaner 에
            // height 값 할당하지 않음.
            // :::::::::::::::::::: fieldContaner height 때문에 textarea
            // 하단부 잘리던 부분 수정.
            _o.parents(".fieldContaner").css("height", "auto");
          }
          if (option.maxlength != undefined) {
            _o.keypress(function () {
              checkTextareaLimit($(this), option.maxlength);
            });
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _fieldEdit);
          }
          break;

        case "codeEditor":
          if (_fieldEdit.parent().parent().hasClass("fldTdLabel") == true) {
            _fieldEdit
              .parent()
              .parent()
              .addClass("hasTextarea b-co b-co-basic");
          }
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' rows='5' cols='5'></textarea>"
          ).appendTo(_span);

          // 2018.06.05 dmjung :: option.codemode 가 지정되어있지 않을 경우 default
          // 값을 javascript 로 셋팅
          if (
            option.codemode == undefined ||
            option.codemode == "" ||
            option.codemode == null
          ) {
            option.codemode = "javascript";
          }

          var myCodeMirror = CodeMirror.fromTextArea(_o[0], {
            lineNumbers: true,
            mode: option.codemode,
          });

          myCodeMirror.on("update", function (cm, obj) {
            var cmVal = cm.getValue();
            _o.parents(".fieldContaner[type=codeEditor]").attr("Value", cmVal);
            _o.parents(".fieldContaner[type=codeEditor]")
              .removeClass("fldChange")
              .addClass("fldChange");
          });

          _fieldEdit.parent().data("CodeMirrorInstance", myCodeMirror);

          if (option.height != undefined) {
            _o.css("height", option.height);
            // 2018.06.11 dmjung :: height 지정시 코드에디터에도 적용되도록 추가.
            $(".CodeMirror").css("height", option.height);
            _o.parents(".fieldContaner").css("height", "auto");
          }
          if (option.maxlength != undefined) {
            _o.keypress(function () {
              checkTextareaLimit($(this), option.maxlength);
            });
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "textedit":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' rows='5' cols='5'></textarea>"
          ).appendTo(_span);
          if (option.height != undefined) {
            _o.css("height", option.height);
          }
          _o.tabby();
          if (option.maxlength != undefined) {
            _o.keypress(function () {
              checkTextareaLimit($(this), option.maxlength);
            });
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "textword":
          // 20140521 같은 객체 중복생성 방지 처리
          var taId =
            _Obj.attr("jsonName") +
            "_" +
            _fieldContaner.attr("field") +
            "_editor"; // 자기 구조체의 필드명 기반으로 ID 생성
          for (var i = 0; i < tinymce.editors.length; i++) {
            var o = tinymce.editors[i];
            if (o.id == taId) {
              o.remove();
            }
          }
          if (_fieldContaner.attr("readonly") != "readonly") {
            _fieldEdit.css("height", "100%");
            _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
            var _o = $(
              "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></textarea>"
            ).appendTo(_span);
            // _o.attr("id", 'textword' + formCID++);
            _o.attr("id", taId);
            // 2018.05.27 dmjung :: -20 높이값 마이너스 계산 삭제, 그리고
            // fieldContaner 에 height 값 제거. 텍스트 에디터 하단이 잘리는 문제 수정.
            _M.WordOption.height = _fieldEdit.outerHeight();
            _fieldContaner.css("height", "5px").css("height", "auto");
            if (option.css) {
              _M.WordOption.content_css = option.css;
            }
            // _o.tinymce(_M.WordOption); // 2018.10.23 jwkim :: tinymce
            // 버전업
            // var taId ='#'+ _o.attr("id"); // khma
            _M.WordOption.selector = "#" + taId;
            // removeEditor(); //같은 객체에 대해서만 삭제 처리하도록 함.

            if (option.editorDisable) {
              _M.WordOption.readonly = true;
              _M.WordOption.toolbar1 = "print preview";
              _M.WordOption.toolbar2 = "";
            } else {
              _M.WordOption.readonly = false;
              _M.WordOption.toolbar1 = _M.WordOption.toolbar1_default;
              _M.WordOption.toolbar2 = _M.WordOption.toolbar2_default;
            }

            setTimeout(function () {
              tinymce.init(_M.WordOption);
            }, 1000);
          }
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case _M.DataType.img:
          var clickEvent = function (e) {
            var _o = $(this);
            $.GetImg(function (url, filename) {
              // 2018.09.17 dmjung :: 선택취소 눌렀을 경우, img src 속성 공백 갱신해도
              // 이미지가 지워지지 않아서 url 정보가 없을 경우 hide 처리로 변경.
              if (url == undefined || url == "") {
                $(".fldimg", _o).attr("src", url).hide().trigger("change");
              } else {
                $(".fldimg", _o).attr("src", url).show().trigger("change");
              }
              // alert(filename);
            });
          };

          if (option.size == undefined) {
            alert("이미지생성을 위한 옵션사항이 정의되지 않았습니다");
            return;
          }
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _a = $(
            "<div class='imgSize imgSize-bg b-t b-r b-b b-l b-co b-co-basic align-middle'></div>"
          )
            .appendTo(_span)

            .click(clickEvent);

          var _i = $(
            "<img src='#' alt='' class='fldimg align-middle' />"
          ).appendTo(_a);
          _i.attr("width", option.size.width);
          _i.attr("height", option.size.height);
          _fieldEdit.css("height", option.size.height);
          _fieldEdit
            .attr(
              "title",
              "이미지를 클릭하시면 파일을 업로드할수 있습니다. 크기는 가로:" +
                option.size.width +
                ", 세로:" +
                option.size.height +
                " 입니다."
            )
            .addClass("hasimgSize");
          var _o = $("<img src='#' alt='' class='fldimg' />").appendTo(
            _fieldView
          );
          _o.attr("width", option.size.width);
          _o.attr("height", option.size.height);
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }

          _a.css("width", option.size.width);
          _a.css("height", option.size.height);
          _a.css("position", "relative");

          var overlayBox = $("<div id='imgOverlay'></div>")
            .appendTo(_a)
            .css("width", option.size.width)
            .css("height", option.size.height)
            .css("position", "absolute")
            .css("top", 0)
            .css("left", 0)
            .css("opacity", 0.6)
            .css("background-color", "#555555")
            .hide();

          var overlayIcon = $(
            "<span class='icon i-20 icon-cancel align-middle'></span></div>"
          )
            .appendTo(_a)
            .attr("title", "선택된 이미지를 초기화합니다.")
            .css("top", "-9px")
            .css("right", "-10px")
            .css("position", "absolute")
            .mousedown(function (e) {
              _a.unbind("click");
              _a.find("img")
                .attr("src", "#")
                .parents(".fieldContaner")
                .trigger("change");
              overlayBox.fadeOut(300);
              overlayIcon.fadeOut(300);
            })
            .hide();

          _a.unbind("mouseenter")
            .bind("mouseenter", function (e) {
              e.stopImmediatePropagation();
              if (
                _a.find("img").attr("src") == "#" ||
                _a.find("img").attr("src") == ""
              ) {
                _a.unbind("click").bind("click", clickEvent);
                overlayBox.hide();
              } else {
                if (limitBtnClick(overlayBox, 0.8) == true) {
                  overlayBox.fadeIn(500);
                  overlayIcon.show(200);
                }
              }
            })
            .unbind("mouseleave")
            .bind("mouseleave", function (e) {
              overlayIcon.fadeOut(200);
              overlayBox.fadeOut(200);
            });
          break;
        case "qr":
          if (option.size == undefined) {
            alert("이미지생성을 위한 옵션사항이 정의되지 않았습니다");
            return;
          }
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<div class='imgSize b-t b-r b-b b-l b-co b-co-basic'></div>"
          ).appendTo(_span);
          _o.css("width", option.size.width);
          _o.css("height", option.size.height);
          var _i = $(
            "<img src='#' alt='' class='fldimg align-middle' />"
          ).appendTo(_o);
          _i.attr("width", option.size.width);
          _i.attr("height", option.size.height);
          _fieldEdit.css("height", option.size.height);
          _o = $("<img src='#' alt='' class='fldimg align-middle' />").appendTo(
            _fieldView
          );
          _o.attr("width", option.size.width);
          _o.attr("height", option.size.height);
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "file": // 기존 디비업로드방식
          var _span = $("<span class='fldfiledown'></span>").appendTo(
            _fieldEdit
          );
          $("<span class='fileSelectBox icon i-20 icon-file'></span>").appendTo(
            _fieldEdit
          ); // JDM CSS, 상하 그리는 순서 바뀜...
          $("<span class='fldfiledown'></span>").appendTo(_fieldView);
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "signfile": // 20240619
  
          var jobType = "";
          if (option.jobType != undefined) {
            jobType = option.jobType;
          }
          var signFileOption; // 20140324 jwkim 확장자 제한 start
          var extenders;
          if (
            isNotEmpty(option.signFileOption) &&
            isNotEmpty(option.signFileOption.extenders)
          ) {
            // 옵션이
            // 존재할때
            extenders = option.signFileOption.extenders;
            _fieldEdit.data("extenders", extenders);
          } // 20140324 jwkim 확장자 제한 end

          _fieldEdit.attr("jobType", jobType).css("position", "relative");
          _span = $(
            "<span class='fldfiledown' style='display:block;'></span>"
          ).appendTo(_fieldEdit);
          $(
            "<div class='tempdiv'><label class='align-middle' style='font-weight:bold;'> 파일 업로드</label><span class='fileSelectBox icon i-20 icon-attachment'></span></div>"
          ).appendTo(_fieldEdit);
          $(".tempdiv")
            .css("padding", "6px 0px")
            .css("border-top", "2px solid #000")
            .css("margin-top", "6px")
            .css("width", "350px");
          $(
            "<span class='fldfiledown' style='display:block;'></span>"
          ).appendTo(_fieldView);
          // TODO 필드값 초기화 필요
          $(this).superContaner(
            "setFieldNameValue",
            _fieldEdit.parent(".fieldContaner").attr("field"),
            ""
          );
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "multifile": // 20170717 실제경로 파일업로드방식
          // 작업종류를 셋팅

          // :: gen mutifile
          var jobType = "";
          if (option.jobType != undefined) {
            jobType = option.jobType;
          }
          var multifileOption; // 20140324 jwkim 확장자 제한 start
          var extenders;
          if (
            isNotEmpty(option.multifileOption) &&
            isNotEmpty(option.multifileOption.extenders)
          ) {
            // 옵션이
            // 존재할때
            extenders = option.multifileOption.extenders;
            _fieldEdit.data("extenders", extenders);
          } // 20140324 jwkim 확장자 제한 end

          _fieldEdit.attr("jobType", jobType).css("position", "relative");
          _span = $(
            "<span class='fldfiledown' style='display:block;'></span>"
          ).appendTo(_fieldEdit);
          $(
            "<div class='tempdiv'><label class='align-middle' style='font-weight:bold;'> 파일 업로드</label><span class='fileSelectBox icon i-20 icon-attachment'></span></div>"
          ).appendTo(_fieldEdit);
          $(".tempdiv")
            .css("padding", "6px 0px")
            .css("border-top", "2px solid #000")
            .css("margin-top", "6px");
          $(
            "<span class='fldfiledown' style='display:block;'></span>"
          ).appendTo(_fieldView);
          // TODO 필드값 초기화 필요
          $(this).superContaner(
            "setFieldNameValue",
            _fieldEdit.parent(".fieldContaner").attr("field"),
            ""
          );
          // _fieldEdit.parent(".fieldContaner").attr("field")
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "olap":
          var _id = _Obj.attr("id") + "_olap";
          PtStr =
            "<OBJECT id='" +
            _id +
            "'  classid='CLSID:0002E55A-0000-0000-C000-000000000046' VIEWASTEXT>";
          PtStr += "</OBJECT>";
          _fieldContaner.html(PtStr);
          _fieldContaner.attr("olapid", _id);
          break;
        case "time":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select> "
          ).appendTo(_span);
          _M.f.c.SetOptionCode(_o, "TimeHours");
          _o.css("width", "80px");
          var _o = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' style='width:60px'></select>"
          ).appendTo(_span);
          _M.f.c.SetOptionCode(_o, "TimeMinutes");

          var _img = $(
            "<span class='icon i-20  icon-clock align-middle'></span>"
          ).appendTo(_span);
          _img.click(function (e) {
            var currTimes = _M.f.d.getTime();
            var currHour = currTimes.substring("0", "2");
            var currMinute = currTimes.substring("2", "4");
            alert(currHour + ":" + currMinute);
            $(this).parent().find("select:eq(0)").val(currHour);
            $(this).parent().find("select:eq(1)").val(currMinute);
            $(this).parent().find("select").change();
          });

          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "month":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>"
          ).appendTo(_span);
          _M.f.c.SetOptionCode(_o, "Month");
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "year":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle'></select>"
          ).appendTo(_span);
          _M.f.c.SetYearCode(_o, option.min, option.max);
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "map":
          var view_map = $("<span class='menuimg'></span>").appendTo(
            _fieldEdit
          );
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_span)
            .attr("maxlength", 20);
          view_map.click(function (e) {
            var _fC = $(this).parents(".fieldContaner");
            var _oldmap = $("input", _fC).val();
            var _x = "37.525201",
              _y = "127.027152";

            if (_oldmap != "") {
              var _armap = _oldmap.split(",");
              if (_armap.length == 2) {
                _x = _armap[0];
                _y = _armap[1];
              }
            }
            $.MapPopUp(_x, _y, "Map", function (zd, o) {
              $("input", _fC).val(o.$a + " , " + o.ab);
              _fC.trigger("change");
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "url":
          var _img = $("<span class='ui-filetype-html'></span>").appendTo(
            _fieldEdit
          ); // .css('float', 'right');
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          ).appendTo(_span);

          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }
          _img.click(function (e) {
            var _url = _o.val();
            if (_url != undefined && _url != "") {
              window.open(_url);
            }
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "mail":
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .css("width", "250px")
            .appendTo(_span);
          var _img = $(
            "<span class='icon i-20 icon-mail align-middle'></span>"
          ).appendTo(_span);
          if (option.maxlength != undefined) {
            _o.attr("maxlength", option.maxlength);
          }
          _img.click(function (e) {
            var _mailaddr = _o.val();
            if (_mailaddr != undefined && _mailaddr != "") {
              location.href = "mailto:" + _mailaddr;
            }
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "sms":
          var customIcon = option.customIcon;
          if (undefined == customIcon || "" == customIcon) {
            customIcon = "icon-search";
          }

          _fieldEdit.addClass("sms");
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' rows='5' cols='5' ></textarea>"
          ).appendTo(_span);
          _sizediv = $("<div></div>").appendTo(_fieldEdit);
          _sizespan = $("<span class='pinset'></span>").appendTo(_sizediv);
          var _size = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_sizespan)
            .attr("readonly", "readonly");
          var _img = $(
            "<span class='icon i-20 " +
              customIcon +
              " content-sms align-middle'></span>"
          ).appendTo(_sizespan); // JDM CSS 위치 변경
          if (option.height != undefined) {
            _o.css("height", option.height);
          }

          var _maxlength = 80;
          if (option.maxlength != undefined) {
            _maxlength = option.maxlength;
          }

          _o.keyup(function () {
            var li_byte = 0;
            var lastStr = "";
            var showByte = 0;

            for (var i = 0; i < $(this).val().length; i++) {
              if (escape($(this).val().charAt(i)).length > 4) {
                li_byte += 2;
              } else {
                li_byte++;
              }
              if (li_byte <= _maxlength) {
                lastStr += $(this).val().charAt(i);
              } else {
                $(this).blur();
                $(this).focus();
                alert("SMS발송은 " + _maxlength + "byte까지 가능합니다.");
                $(this).val(lastStr);
                break;
              }
            }

            for (var i = 0; i < lastStr.length; i++) {
              if (escape(lastStr.charAt(i)).length > 4) {
                showByte += 2;
              } else {
                showByte++;
              }
            }

            $(this)
              .parents(".fieldEdit")
              .find("input")
              .val(showByte + "/" + _maxlength);
          });

          _fieldEdit.find(".content-sms").click(function (e) {
            var contentJson = "MON_ADM_컨텐츠POPUP_TBL";
            var rstData = "";
            var _obj = $(this).parents(".fieldContaner").find("textarea");
            $.ContentPopUp(contentJson, $(this), "SMS", function (data) {
              if (data != undefined) {
                rstData = unescapeHtml(data);
                _obj
                  .parents(".fieldContaner")
                  .superContaner("setFieldValue", rstData);
                _obj.val(rstData);
                _obj.trigger("keyup");
                _obj
                  .parents(".fieldContaner")
                  .removeClass("fldChange")
                  .addClass("fldChange");
              }
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "lms":
          var customIcon = option.customIcon;
          if (undefined == customIcon || "" == customIcon) {
            customIcon = "icon-search";
          }

          // 필드컨테이너 높이를 임의로 올림
          _fieldContaner.css("height", 275);
          _fieldEdit.addClass("lms");
          var _img = $(
            "<span class='icon i-20 " + customIcon + " content-lms'></span>"
          ).appendTo(_fieldEdit);
          var _span = $("<span class='pinset'></span>").appendTo(_fieldEdit);
          var _o = $(
            "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' rows='5' cols='5' ></textarea>"
          ).appendTo(_span);
          _sizediv = $("<div></div>").appendTo(_fieldEdit);
          _sizespan = $("<span class='pinset'></span>").appendTo(_sizediv);
          var _size = $(
            "<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle' type='text' value='' />"
          )
            .appendTo(_sizespan)
            .attr("readonly", "readonly");

          if (option.height != undefined) {
            _o.css("height", option.height);
          }

          var _maxlength = 2000;
          if (option.maxlength != undefined) {
            _maxlength = option.maxlength;
          }

          _o.keyup(function () {
            var li_byte = 0;
            var lastStr = "";
            var showByte = 0;

            for (var i = 0; i < $(this).val().length; i++) {
              if (escape($(this).val().charAt(i)).length > 4) {
                li_byte += 2;
              } else {
                li_byte++;
              }
              if (li_byte <= _maxlength) {
                lastStr += $(this).val().charAt(i);
              } else {
                $(this).blur();
                $(this).focus();
                alert("LMS발송은 " + _maxlength + "byte까지 가능합니다.");
                $(this).val(lastStr);
                break;
              }
            }

            for (var i = 0; i < lastStr.length; i++) {
              if (escape(lastStr.charAt(i)).length > 4) {
                showByte += 2;
              } else {
                showByte++;
              }
            }

            $(this)
              .parents(".fieldEdit")
              .find("input")
              .val(showByte + "/" + _maxlength);
          });

          _fieldEdit.find(".content-lms").click(function (e) {
            var contentJson = "MON_ADM_컨텐츠POPUP_TBL";
            var rstData = "";
            var _obj = $(this).parent().find("textarea");
            $.ContentPopUp(contentJson, $(this), function (data) {
              if (data != undefined) {
                rstData = unescapeHtml(data);
                _obj.val(rstData);
                _obj.trigger("keyup");
              }
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        case "sticker":
          // 2018.05.22 dmjung :: qtip 플러그인 활용하여 아이콘 선택창 열었던 것, 불안정한 이유로
          // 기본 클릭 이벤트로 액션 대체.
          var _span = $(
            "<span class='pinset' style='position:relative; overflow:visible;'></span>"
          ).appendTo(_fieldEdit);
          var _cal = $(
            "<div class='caliconSelect input-bg input-ft align-middle' css='' style='cursor:pointer;'><span class='caliconText align-middle'>아이콘</span></div>"
          ).appendTo(_span);
          var _o = $(
            "<span class='calicon-default icon calicon icon-sortdesc align-middle'></span>"
          ).appendTo(_cal);
          var _box = $(
            "<ul class='caliconlist b-t b-r b-b b-l b-co b-co-basic' style='display:none; width:285px; cursor:pointer; padding:16px; background-color:white; position:absolute; z-index:9999; top:21px; left:0px;'></ul>"
          ).appendTo(_span);
          // 2018.06.20 dmjung :: XP IE8 에서 caliconlist 에 고정값이 없을 경우에 요소가
          // 자동으로 늘어나지 않으므로, 고정값 285px 추가. 아이콘 추가될 시 그에 따라 고정값도 늘려줘야 함.
          _fieldEdit.parent().parent().css("overflow", "visible");
          var counting = 0;
          $(".ui-dialog-titlebar-close, .ui-button-text").click(function () {
            _box.remove();
            // counting = 0;
          });

          $(".caliconSelect", _span).click(function () {
            if (counting == 0) {
              var iconList = new Array();
              iconList = [
                "calicon-balloon",
                "calicon-bookmark",
                "calicon-cake",
                "calicon-calendar",
                "calicon-contact",
                "calicon-email",
                "calicon-frame",
                "calicon-graph",
                "calicon-heart",
                "calicon-money",
                "calicon-ring",
                "calicon-time",
                "calicon-wballoon",
                "calicon-noicon",
              ];

              $(iconList).each(function (index, value) {
                $(
                  "<li class='icon calicon calicon-default " +
                    value +
                    "' css='" +
                    value +
                    "' title='" +
                    value +
                    "'></li>"
                )
                  .css("cursor", "pointer")
                  .appendTo(_box);
              });
              _box.show();
              counting++;
            } else if (counting == 1 || counting > 1) {
              _box.empty();
              _box.hide();
              counting = 0;
            }
            $(".calicon", _box).click(function () {
              var css = $(this).attr("css");

              // 2018.05.24 dmjung ::
              // 켈린더 스티커에서 노아이콘 선택시
              // 화살표 아이콘이 노아이콘 모양으로
              // 바뀌는 문제 방지하기 위해 조건 추가.
              if ($(this).hasClass("calicon-noicon") == true) {
                $(".caliconText").show();
                $(".caliconSelect")
                  .css("text-align", "center")
                  .css("width", "50px");
                $(".Firstone")
                  .find(".fieldContaner:eq(0)")
                  .attr("value", css)
                  .trigger("change");
                $(".calicon-default")
                  .attr("css", css)
                  .removeClass()
                  .addClass(
                    "icon calicon icon-sortdesc calicon-default align-middle"
                  );
                _box.empty();
                _box.hide();
                counting = 0;

                return "";
              }
              $(".caliconSelect").attr("css", css);
              $(".calicon-default")
                .removeClass()
                .attr("css", css)
                .addClass(css + " icon calicon calicon-default");
              $(".caliconText").hide();
              $(".caliconSelect")
                .css("text-align", "center")
                .css("width", "20px");
              $(".Firstone")
                .find(".fieldContaner:eq(0)")
                .attr("value", css)
                .trigger("change");
              _box.empty();
              _box.hide();
              counting = 0;
            });
          });
          if (
            option.beforeLabel != undefined ||
            option.afterLabel != undefined
          ) {
            var value = {
              before: option.beforeLabel ? option.beforeLabel : undefined,
              after: option.afterLabel ? option.afterLabel : undefined,
            };
            attachLabels(value, _span);
          }
          break;
        default:
          $("<a></a>").appendTo(_fieldEdit);
          break;
      }

      // readonly 속성이라면
      if (_fieldContaner.attr("readonly") == "readonly") {
        if (_fieldContaner.parent().find(".fieldContaner").size() > 1) {
          _fieldView.toggle(true);
          _fieldEdit.toggle(true);
        } else {
          _fieldView.toggle(true);
          _fieldEdit.toggle(false);
        }
      }

      // required 속성이 있으면 포함되어있는 모든 fieldEdit에 Required Class부여하도록 변경
      if (option.required) {
        $(".fieldEdit", _fieldContaner).addClass("Required"); // Label로
        // 필수 표시
        // 이동
        var _fldTdLbl = _fieldContaner.parent().prev();
        if (_fldTdLbl.find("a").hasClass("havta")) {
        } else if (_fldTdLbl.hasClass("fldTdData")) {
          // 2018.05.22 dmjung :: 필수 입력란 표시인 별표가 fldTdData 영역에 추가되는 것을
          // 방지하기 위해 조건 추가.
          _fldTdLbl = _fldTdLbl.prev();
          $("<a class='havta'>*</a>").appendTo(_fldTdLbl);
        } else {
          // $("<a
          // class='havta'>*</a>").appendTo(_fldTdLbl).css("height",
          // _fldTdLbl.height() + 2);
          $("<a class='havta'>*</a>").appendTo(_fldTdLbl);
        }
      }
    },

    /* ------------------------------------------------------- */
    /* 잡버턴실행 */
    /* ------------------------------------------------------- */
    jobClick: function (oCmd) {
      var _Obj = $(this);
      option = $(this).data("jsonData");

      // alert("전처리작업이 실패하였습니다");
      if (option.beforeJobCallBack != undefined) {
        if (!eval(option.beforeJobCallBack)(oCmd, _Obj)) return false;
      }
      // 고유명령실행
      if (oCmd.attr("inComm") != "" && oCmd.attr("inComm") != "makeViewPopup") {
        _Obj.superContaner(oCmd.attr("inComm"), oCmd, oCmd);
        //_Obj.displayButtons(_Obj);
      }
      // alert("후처리작업이 실패하였습니다");
      if (option.afterJobCallBack != undefined) {
        eval(option.afterJobCallBack)(oCmd, _Obj);
      }
    },
    /* ------------------------------------------------------- */
    /* tr 레코드 선택실행 */
    /* ------------------------------------------------------- */
    trClick: function (tr, event) {
      // console.log('tr has been clicked');
      var _Obj = $(this);
      var option = $(this).data("jsonData");

      if (option.tdActions != undefined) return;

      $("tr", tr.parent()).removeClass("SelectTR");
      tr.addClass("SelectTR");

      _keyvalue = tr.attr("keyvalue");

      // alert("Row클릭 : " + $('tr', tr.parent()).index(tr));
      if (option.isTrClickSelect) {
        if (event.target == $("td:eq(0) input", tr)[0]) {
        } else {
          if (tr.attr("selected") == undefined) {
            tr.attr("selected", "selected");
            $("td:eq(0) input", tr).attr("checked", true);
          } else {
            tr.removeAttr("selected");
            $("td:eq(0) input", tr).attr("checked", false);
          }
        }
      } else {
        // -----------------------------------------------
        // MainView link
        // -----------------------------------------------
        if (option.mainViewID != undefined) {
          if ($(option.mainViewID).hasClass("SuperView")) {
            // 2014.02.26 dmjung :: mainViewToggle 기능을 workflow 이전
            // 타이밍으로 옮김.
            if (option.mainViewToggle) {
              _Obj.toggle(false);
              $(option.mainViewID).toggle(true);
            }
            if ($(option.mainViewID).hasClass("campaignWorkFlow")) {
              $(option.mainViewID).superContaner("Read", _keyvalue);
              $(option.mainViewID).campaignWorkFlow("loadWorkFlow", _keyvalue);
            } else {
              $(option.mainViewID).superContaner("Read", _keyvalue);
            }
          } else if ($(option.mainViewID).hasClass("SuperOlap")) {
            $(option.mainViewID).superContaner("olapRead", _keyvalue);
            if (option.mainViewToggle) {
              _Obj.toggle(false);
              $(option.mainViewID).toggle(true);
            }
          } else if ($(option.mainViewID).hasClass("SuperiFrame")) {
            $(option.mainViewID).superContaner("iFrameRead", _keyvalue);
            if (option.mainViewToggle) {
              _Obj.toggle(false);
              $(option.mainViewID).toggle(true);
            }
          } else if ($(option.mainViewID).hasClass("SuperAnswer")) {
            var optionAns = $(option.mainViewID).data("jsonData");
            $(option.mainViewID).superContaner(
              "SuperAnswer",
              optionAns,
              _keyvalue
            );
            if (option.mainViewToggle) {
              _Obj.toggle(false);
              $(option.mainViewID).toggle(true);
            }
          }
        } else if (option.isSubTable != undefined) {
          // -----------------------------------------------
          // Sub SuperTable
          // -----------------------------------------------
          switch (option.isSubTable.mode) {
            case "SuperSubView":
              $.ShowEditJson(option.isSubTable.jsonName, _Obj);
              break;
          }
        }
      }
      // 콜백함수 실행
      if (option.trClickCallBack != undefined)
        eval(option.trClickCallBack)(_keyvalue, _Obj);
    },
    /* ------------------------------------------------------- */
    /* tr Double Click (PopUp에서만 동작하도록 Design) */
    /* ------------------------------------------------------- */
    trDblClick: function (tr, event) {
      var _Obj = tr;
      var _PObj = _Obj.parents(".SuperTable:eq(0)").parent();
      if (_PObj.hasClass("EditPopUp")) {
        if (event.target == $("td:eq(0) input", tr)[0]) {
        } else {
          tr.attr("selected", "selected");
          $("td:eq(0) input", tr).attr("checked", true);
        }

        $.each(_PObj.parent().find(".ui-button-text"), function (index, row) {
          var _btn = $(this).html();
          if (
            _btn == "save" ||
            _btn == "select" ||
            _btn == "추가" ||
            _btn == "선택" ||
            _btn == "기록" ||
            _btn == "저장"
          ) {
            $(this).parent().trigger("click");
          }
        });
      }
    },
    /* ------------------------------------------------------- */
    /* 이미지 선택시실행 */
    /* ------------------------------------------------------- */
    GalleryClick: function (li, event) {
      var _Obj = $(this);
      var option = $(this).data("jsonData");

      $("li", li.parent()).removeClass("li_selected");
      li.addClass("li_selected");

      // 콜백함수 실행
      // if (option.trClickCallBack != undefined)
      // eval(option.trClickCallBack)(_keyvalue,_Obj) ;
    },
    /* ------------------------------------------------------- */
    /* superTable Cell 선택실행 */
    /* ------------------------------------------------------- */
    tdClick: function (td, event) {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      _clickAction = td.attr("clickAction");
      tr = td.parents("tr");

      _keyvalue = tr.attr("keyvalue");
      var _tdValue = td.attr("value");
      var _tdSubValue = td.attr("subkey");
      var _tbl = option.tbObj;
      if (_tbl == undefined) _tbl = option.tbObjservice;

      _index = $("td", td.parent()).index(td);
      _field = td.attr("field");

      // _keyvalue = tr.attr('keyvalue');
      // 콜백함수 실행
      if (_clickAction != undefined) {
        $("tr", tr.parent()).removeClass("SelectTR");
        tr.addClass("SelectTR");

        switch (_clickAction) {
          case "df사용변경": // bool형태의 값인 경우 변경하여 줌 대표적인 경우 - 사용여부체크
            // 현재값을 체크하여 사용인
            if (_tdValue == "1") _tdValue = "0";
            else _tdValue = "1";
            td.attr("value", _tdValue)
              .attr("title", _tdValue)
              .attr("oldvalue", _tdValue);
            break;
          case "ShowView": // ShowView
            // -----------------------------------------------
            // MainView link
            // -----------------------------------------------
            var _tdName = td.attr("name");
            var _tdjsonName = "";
            var _tdMode = "";
            $.each(option.tdActions, function (index, row) {
              if (row.name == _tdName) {
                _tdjsonName = row.jsonName;
                if (
                  row.mode != undefined &&
                  row.mode != null &&
                  row.mode != ""
                ) {
                  _tdMode = row.mode;
                }
              }
            });
            if (_tdjsonName != undefined) {
              var _subkey = 0;
              if (_tdSubValue) {
                _subkey = _tdSubValue;
              } else {
                _subkey = _keyvalue;
              }

              if (option.isSubTable) {
                if (option.isSubTable.popup) {
                  var url = "ViewPop.htm?q1=" + _tdjsonName + "&q2=" + _subkey;
                  var option = "width=800,height=600";
                  window.open(url, "ViewPop", option);
                } else {
                  if (_tdMode == "view") {
                    var SubView = $.ShowViewJson(_tdjsonName, _Obj);
                  } else {
                    var SubView = $.ShowEditJson(_tdjsonName, _Obj);
                  }
                  SubView.superContaner("Read", _subkey);
                }
              } else {
                if (_tdMode == "view") {
                  var SubView = $.ShowViewJson(_tdjsonName, _Obj);
                } else {
                  var SubView = $.ShowEditJson(_tdjsonName, _Obj);
                }
                SubView.superContaner("Read", _subkey);
              }
            } else if (option.mainViewID != undefined) {
              if ($(option.mainViewID).hasClass("SuperView")) {
                $(option.mainViewID).superContaner("Read", _keyvalue);
                if (option.mainViewToggle) {
                  _Obj.toggle(false);
                  $(option.mainViewID).toggle(true);
                }
              } else if ($(option.mainViewID).hasClass("SuperOlap")) {
                $(option.mainViewID).superContaner("olapRead", _keyvalue);
                if (option.mainViewToggle) {
                  _Obj.toggle(false);
                  $(option.mainViewID).toggle(true);
                }
              } else if ($(option.mainViewID).hasClass("SuperiFrame")) {
                $(option.mainViewID).superContaner("iFrameRead", _keyvalue);
                if (option.mainViewToggle) {
                  _Obj.toggle(false);
                  $(option.mainViewID).toggle(true);
                }
              }
            } else if (option.isSubTable != undefined) {
              // -----------------------------------------------
              // Sub SuperTable
              // -----------------------------------------------
              switch (option.isSubTable.mode) {
                case "SuperSubView":
                  if (option.isSubTable.popup) {
                    var url =
                      "ViewPop.htm?q1=" +
                      option.isSubTable.jsonName +
                      "&q2=" +
                      _keyvalue;
                    var option = "width=800,height=600";
                    window.open(url, "ViewPop", option);
                  } else {
                    if (_tdMode == "view") {
                      var SubView = $.ShowViewJson(
                        option.isSubTable.jsonName,
                        _Obj
                      );
                    } else {
                      var SubView = $.ShowEditJson(
                        option.isSubTable.jsonName,
                        _Obj
                      );
                    }
                    SubView.superContaner("Read", _keyvalue);
                  }
                  break;
              }
            }
            break;
          case "ShowTable": // ShowTable
            var _tdName = td.attr("name");
            var _tdjsonName = "";
            $.each(option.tdActions, function (index, row) {
              if (row.name == _tdName) {
                _tdjsonName = row.jsonName;
              }
            });
            if (_tdjsonName != undefined) {
              var _subkey = 0;
              if (_tdSubValue) {
                _subkey = _tdSubValue;
              } else {
                _subkey = _keyvalue;
              }
              if (option.isSubTable) {
                if (option.isSubTable.popup) {
                  alert("ShowTable 에서는 Popup Option이 적용되지 않습니다.");
                } else {
                  var pop = $.ShowSubTableJson(_tdjsonName, _Obj, _subkey);
                  if (_Obj.attr("jobType") != undefined) {
                    pop.attr("jobType", _Obj.attr("jobType"));
                  }
                }
              } else {
                var pop = $.ShowSubTableJson(_tdjsonName, _Obj, _subkey);
                if (_Obj.attr("jobType") != undefined) {
                  pop.attr("jobType", _Obj.attr("jobType"));
                }
              }
            }
            break;

          default:
            eval("option." + _clickAction)(_keyvalue, td);
        }
      }
      if (option.tdClickCallBack != undefined)
        eval(option.tdClickCallBack)(_keyvalue, _field, _index, _tdValue);
    },
    /* ------------------------------------------------------- */
    /* superTable th head 선택실행 */
    /* ------------------------------------------------------- */
    thClick: function (th, event) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      if (!_json.isSort) return;
      if (th.attr("orderyn") == "false") return;

      _sortClass = "";
      _sortField = "";
      if (th.hasClass("SortNone")) {
        _sortClass = "SortDesc";
        _sortField = th.attr("orderDesc");
      } else if (th.hasClass("SortDesc")) {
        _sortClass = "SortAsc";
        _sortField = th.attr("orderAsc");
      } else if (th.hasClass("SortAsc")) {
        _sortClass = "SortDesc";
        _sortField = th.attr("orderDesc");
      }
      $("th", th.parent())
        .removeClass("SortDesc")
        .removeClass("SortAsc")
        .addClass("SortNone");
      th.removeClass("SortNone").addClass(_sortClass);
      if (_json.sort != undefined && _json.sort != "") {
        _Obj.attr("_sort", _sortField); // 20180124 jwkim sort속성 추가
      } else {
        _Obj.attr("_order", _sortField);
      }
      // _Obj.attr("_order", _sortField);
      _Obj.superContaner("List");
    },
    /* ------------------------------------------------------- */
    /* Clear 화면을 초기화함 */
    /* ------------------------------------------------------- */
    Clear: function () {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      _Obj.attr("keyvalue", "");
      $(".fieldContaner.fldChange", _Obj).removeClass("fldChange");
      // --------------------------------------------------------
      // 전체 초기화 작업실시
      $("table:eq(0) .fieldContaner", _Obj).each(function (e) {
        $(this).superContaner("setFieldValue", "");
      });
      $(".SuperTable", _Obj).each(function () {
        $(this).superContaner("tableClear");
      });
    },
    /* ------------------------------------------------------- */
    /* new 추가버턴동작시에 화면을 초기화함 */
    /* ------------------------------------------------------- */
    New: function () {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      _Obj.superContaner("Clear");
      _Obj.superContaner("SetDefault");
      // 추가버튼 클릭시 View의 Tab이 존재할경우 parentKey 제거, 데이터 유무 표시(.filled) 제거
      if (_json.tabs != undefined) {
        if (option.isTabMode) {
          $(".Tabs .SuperContaner").removeAttr("parentkeyvalue");
          $(".Tabs ul li").removeClass("filled");
        } else {
          $(".TabLists .SuperContaner").removeAttr("parentkeyvalue");
        }
      }
      _Obj.attr("viewstatus", "N");
      _Obj.superContaner("modeChange", true);

      if (_json.afterNewCallBack != undefined)
        eval(_json.afterNewCallBack)(_Obj);
    },
    /* ------------------------------------------------------- */
    /* 저장버턴동작시에 화면을 초기화함 */
    /* ------------------------------------------------------- */
    Save: function (callBackFn) {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      var _key = _Obj.attr("keyvalue");
      var _pl = _Obj.superContaner("getValue");
      var _reqFld = _Obj.superContaner("isRequired");
      if (_reqFld.toKeyString() != "") {
        alert(
          "필수항목중 [" + _reqFld.toKeyString() + "] 의 입력이 누락되었습니다."
        );
        return false;
      }

      // 저장은 되지만 필드에 값이 Null인 것에 대하여 MsgBox출력
      if (option.isSaveNullMsg) {
        _saveNullFld = _Obj.superContaner("isSaveNullMsg");
        if (_saveNullFld.toKeyString() != "") {
          $.MessageBox(
            "저장 알림[! 저장은 진행 됩니다.]",
            "입력 필드중 [" +
              _saveNullFld.toKeyString() +
              "] 의 입력이 누락되었습니다."
          );
        }
      }
      if (option.beforeSaveCallBack != undefined) {
        if (!eval(option.beforeSaveCallBack)(_Obj)) return false;
      }
      // alert(_pl);
      var exeType = "";
      if (_key == "") {
        exeType = "Create";
        /*
         * _Obj.superContaner("Create", _pl, function(result){
         * callBackFn(result); });
         */
      } else {
        exeType = "Update";
        /*
         * _Obj.superContaner("Update", _pl, function(result){
         * callBackFn(result); });
         */
      }
      _Obj.superContaner(
        exeType,
        _pl,
        function (result) {
          if (typeof callBackFn == "function") callBackFn(result);
        },
        function (result) {
          if (typeof callBackFn == "function") callBackFn(result);
        }
      );
    },
    Query: function () {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      pl = _Obj.superContaner("getValue");
      _reqFld = _Obj.superContaner("isRequired");
      if (_reqFld.toKeyString() != "") {
        alert(
          "필수항목중 [" + _reqFld.toKeyString() + "] 의 입력이 누락되었습니다."
        );
        return false;
      }

      pl.add("service", option.service);
      pl.add("method", option.method.Query);
      // parent 키가 있는 경우 해당 정보를 조건에 추가한다.
      if (option.parentKey != undefined) {
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add(option.parentKey, _Obj.attr("parentKeyValue"));
        }
      }

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          // alert("Query .. ok");
          if (option.mainListID != undefined) {
            $(option.mainListID).superContaner(
              "tableRefresh",
              _data.resultData.rltKey
            );
          }
        },
        function (response) {
          alert(response.Message);
        },
        _M.aSync.sync
      );

      return _Obj;
    },
    /* ------------------------------------------------------- */
    /* 신규저장시 데이터를 저장함 */
    /* ------------------------------------------------------- */
    Create: function (pl, callBackFn) {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      pl.add("service", option.service);
      pl.add("method", option.method.Create);
      // parent 키가 있는 경우 해당 정보를 조건에 추가한다.
      if (option.parentKey != undefined) {
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add(option.parentKey, _Obj.attr("parentKeyValue"));
        }
      }
      if (_Obj.attr("jobType") != undefined) {
        pl.add("JOB_TYPE", _Obj.attr("jobType"));
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add("JOB_KEY", _Obj.attr("parentKeyValue"));
        }
      }

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          $(".fieldContaner.fldChange", _Obj).removeClass("fldChange");
          if (option.showMessage) {
            if (option.saveMessage) {
              alert(option.saveMessage);
            } else {
              alert("저장되었습니다.");
            }
          }
          if (_data.resultInfo.jobType == "CREATEIDENTITY") {
            if (option.afterCreateCallBack != undefined)
              eval(option.afterCreateCallBack)(_Obj);
            _Obj.superContaner("Read", _data.resultData[0].rltKey);
            if (_Obj.hasClass("campaignWorkFlow")) {
              var keyvalue = _data.resultData[0].rltKey;
              if (keyvalue != undefined) {
                jsPlumb.Defaults.Container.parent().campaignWorkFlow(
                  "receiveKey",
                  keyvalue
                );
              }
            }
          } else {
            if (option.afterCreateCallBack != undefined)
              eval(option.afterCreateCallBack)(_Obj);
          }
          // 만일링크가 걸린 테이블이 있으면 새로고침 합니다.
          if (
            option.mainListID != undefined &&
            _data.resultInfo.jobType == "CREATEIDENTITY"
          ) {
            var targetOption = $(option.mainListID).data("jsonData");
            if (targetOption.ContanerType == "superTree") {
              // $(option.mainListID).superContaner('TreeList');
              var targetId = "#" + _data.resultData[0].rltKey; // deptno일경우
              $(option.mainListID + ">#treeArea").jstree("refresh");
            } else {
              if (_Obj.hasClass("campaignWorkFlow")) {
                var keyvalue =
                  jsPlumb.Defaults.Container.parent().attr("keyvalue");
                $(option.mainListID).superContaner("tableRefresh", keyvalue);
              } else {
                $(option.mainListID).superContaner(
                  "tableRefresh",
                  _data.resultData[0].rltKey
                );
              }
            }
          } else if (option.mainListID != undefined) {
            $(option.mainListID).superContaner("tableRefresh");
          }
          callBackFn(true);
        },
        function (response) {
          callBackFn(false);
          // alert(response.Message);
        },
        _M.aSync.sync
      );

      return _Obj;
    },
    /* ------------------------------------------------------- */
    /* 조회시 데이터를 읽어옴 */
    /* ------------------------------------------------------- */
    Make: function () {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      var key = "";
      _Obj.superContaner("Clear");
      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Create);
      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          // 결과자료시험
          // alert($.Json2Str(_data));
          key = _data.resultData[0][option.keyName];
          _Obj.attr("keyvalue", _data.resultData[0][option.keyName]);
          _Obj.superContaner("setValue", _data.resultData[0]);
          if (option.afterReadCallBack != undefined)
            eval(option.afterReadCallBack)(key, _Obj);
        },
        function (response) {
          // $("#hm").html('Error : ' + response.Message);
          alert(response.Message);
        },
        _M.aSync.sync
      );

      return _Obj;
    },
    /* ------------------------------------------------------- */
    /* 조회시 데이터를 읽어옴 */
    /* ------------------------------------------------------- */
    Read: function (key) {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      _Obj.superContaner("Clear");
      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Read);
      pl.add("key", key);
      pl.add(option.keyName, key);

      if (_Obj.data("ParentData") != undefined) {
        // tableViewExt 함수 동작을
        // 위한 부분 추가.
        var _ext = _Obj.data("ParentData");
        var ppl = _ext.toArray();
        for (var p in ppl) {
          pl.add(p, ppl[p]);
        }
      }
      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          // 결과자료시험
          // alert($.Json2Str(_data));
          if (_data.resultData.length == 0) {
            alert(
              "Read Data Not Found... Service : " +
                option.service +
                " method : " +
                option.method.Read
            );
            return;
          }
          _Obj.attr("keyvalue", key);
          _Obj.superContaner("setValue", _data.resultData[0]);
          if (option.afterReadCallBack != undefined)
            eval(option.afterReadCallBack)(key, _Obj);
        },
        function (response) {
          // fail일때
        },
        _M.aSync.sync
      );

      // 2018.10.04 dmjung :: Read 성공시 최종 viewstatus 결정
      if (
        _Obj.attr("viewstatus") == "N" ||
        (_Obj.attr("viewstatus") == "E" && option.isEditMode == true) ||
        option.isEditMode == undefined
      ) {
        _Obj.attr("viewstatus", "E");
      }
      if (_Obj.attr("viewstatus") == "E" && option.isEditMode == false) {
        _Obj.attr("viewstatus", "V");
        _Obj.superContaner("modeChange", false);
      }

      _Obj.displayButtons(_Obj);

      return _Obj;
    },
    ReadParent: function (parentKey) {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      _Obj.superContaner("Clear");
      _Obj.attr("parentKeyValue", parentKey);

      if (option.method.Read == undefined) return;

      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Read);

      // parent 키가 있는 경우 해당 정보를 조건에 추가한다.
      if (option.parentKey != undefined) {
        if (_Obj.attr("parentKeyValue") != undefined) {
          pl.add(option.parentKey, _Obj.attr("parentKeyValue"));
        }
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            // 결과자료시험
            // alert($.Json2Str(_data));
            _Obj.attr("keyvalue", _data.resultData[0][option.keyName]);
            _Obj.superContaner("setValue", _data.resultData[0]);
            if (option.afterReadCallBack != undefined)
              eval(option.afterReadCallBack)(parentKey, _Obj);
          },
          function (response) {
            // fail일때
          },
          _M.aSync.sync
        );
      }

      return _Obj;
    },

    /* ------------------------------------------------------- */
    /* update 수정동작시에 데이터를 저장함 */
    /* ------------------------------------------------------- */
    Update: function (pl, callBackFn) {
		var _Obj = $(this);
		_key = _Obj.attr("keyvalue");
		option = $(this).data("jsonData");
	  
		// khma 20240806 수정이력 추가 시작
		//var _pcode = "";			
		//_Obj.find("table:eq(0) .fieldContaner:.fldChange").each(function(e) {
		//	var _pfield = $(this).attr('field');
		//	if(_pfield == "PCODE"){
		//		_pcode = $(this).superContaner('getFieldValue', pl);
		//	}
		//});
		// khma 20240806 수정이력 추가 종료
	  
		pl.add("service", option.service);
		pl.add("method", option.method.Update);
		pl.add("key", _key);
		pl.add(option.keyName, _key);

		PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {
        
		// khma 20240806 수정이력 추가 시작
			// 수정기록이 있으면 수정기록 로그를 관리한다        
			_Obj.find(".fieldContaner.fldChange").each(function(e) {
				var _fieldType = $(this).attr('type');
				var _logfield = $(this).attr('field');
				var _logLabel = $(this).parent().prev().text();
				var _logval = $(this).superContaner('getFieldValue', pl);
				if(_logval == undefined || _logval == "") _logval = $(this).attr('value');
				var _logOld = $(this).attr('oldvalue');
				if(_fieldType == "date" || _fieldType == "dateBetween") _logOld = _M.f.d.DateGetDate(getDateIE8Compatible(_logOld));
				//alert('fld:' + _logfield +' - old:' + _logOld+' - new:' + _logval);
				if (option.jobType != undefined) {
					option.UpdateLogName = option.jobKey;
				}
				if (option.jobKey != undefined) {
					option.UpdateLogName = option.jobKey;
				}
				if (option.UpdateLogName == undefined) { 
					option.UpdateLogName = option.service;
				}
				if ($(this).attr('label') != undefined) { 
					_logfield = $(this).attr('label');
				}
				
				if (option.UpdateLogName != "" && _logval != undefined && _logval != "") {
					var pl = new JSONClientParameters();
					pl.add("service", "데이터수정이력");
					pl.add("method", "CREATE");
					pl.add("데이터명", option.UpdateLogName);
					pl.add("키번호", _key);
					pl.add("필드명", _logfield);
					pl.add("이전값", _logOld.substring(0,500));
					pl.add("이후값", _logval.substring(0,500));
					
					
					pl.add("jobType", option.UpdateLogName);
					pl.add("jobKey", _key);
					pl.add("Targ_Field", _logfield);
					pl.add("Field_Name", _logLabel);
					pl.add("Prev_Value", _logOld.substring(0,500));
					pl.add("Aftr_value", _logval.substring(0,500));
					
					//if(_pcode != ""){
					//	pl.add("수정메모", _pcode);
					//}
					
					if(_logOld.substring(0,500) != _logval.substring(0,500) ){
						PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(_data) {}, function(response) {
							//alert(response);
						}, _M.aSync.sync);
						
					}
					
				}
			});
		// khma 20240806 수정이력 추가 종료
			
          $(".fieldContaner.fldChange", _Obj).removeClass("fldChange");
          if (option.showMessage) {
            if (option.updateMessage) {
              alert(option.updateMessage);
            } else {
              alert("수정되었습니다.");
            }
          }
          // 만일링크가 걸린 테이블이 있으면 새로고침 합니다.
          if (option.mainListID != undefined) {
            var targetOption = $(option.mainListID).data("jsonData");
            if (targetOption.ContanerType == "superTree") {
              // $(option.mainListID).superContaner('TreeList');
              $(option.mainListID + ">#treeArea").jstree("refresh");
            } else {
              $(option.mainListID).superContaner("tableRefresh");
            }
          }

          if (
            undefined != option.mainViewToggle &&
            option.mainViewToggle == true
          ) {
            // 처리후 해당 화면의 리드처리를 재실행하고 View모드로 변경시킨다.
            var targetOption = $(option.mainListID).data("jsonData");
            $(targetOption.mainViewID).superContaner("Read", _key);
            $(targetOption.mainViewID).superContaner("modeChange", false);
          }

          if (option.afterUpdateCallBack != undefined)
            eval(option.afterUpdateCallBack)(_key, _Obj);
          callBackFn(true);
        },
        function (response) {
          // fail일때
          callBackFn(false);
        },
        _M.aSync.sync
      );

      return _Obj;
    },
    /* ------------------------------------------------------- */
    /* delete 동작시에 데이터를 저장함 */
    /* ------------------------------------------------------- */
    Delete: function () {
      var _Obj = $(this);
      _key = _Obj.attr("keyvalue");
      option = $(this).data("jsonData");
      var pl = new JSONClientParameters();
      pl.add("service", option.service);
      pl.add("method", option.method.Delete);
      pl.add("key", _key);
      pl.add(option.keyName, _key);

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          if (option.showMessage) {
            if (option.deleteMessage) {
              alert(option.deleteMessage);
            } else {
              alert("삭제되었습니다.");
            }
          }
          if (
            undefined != option.mainViewToggle &&
            option.mainViewToggle == true
          ) {
            _Obj.toggle(false);
            $(option.mainListID).toggle(true);
          }
          _Obj.superContaner("New"); // 슈퍼테이블 클리어
          // 만일링크가 걸린 테이블이 있으면 새로고침 합니다.
          if (option.mainListID != undefined) {
            var targetOption = $(option.mainListID).data("jsonData");
            if (targetOption.ContanerType == "superTree") {
              $(option.mainListID + ">#treeArea").jstree("refresh");
            } else {
              $(option.mainListID).superContaner("tableRefresh");
            }
          }
          if (option.afterDeleteCallBack != undefined)
            eval(option.afterDeleteCallBack)(_key, _Obj);
        },
        function (response) {
          // fail일때
        },
        _M.aSync.async
      );
    },
    /* ------------------------------------------------------- */
    /* 개발 > 쿼리관리 > 쿼리생성버튼(incomm) 쿼리생성 */
    /* ------------------------------------------------------- */
    GenService: function () {
      var _Obj = $(this);
      _key = _Obj.attr("keyvalue");
      option = $(this).data("jsonData");

      // 2018.06.24 dmjung :: 셀렉터 간소화를 위한 변수 추가, 테이블명 / 메소드명없을 경우 경고창 띄움
      var TableName = $("div[field='TABLE_NAME'] input", _Obj);
      var ExecName = $("div[field='EXEC_TYPE'] select", _Obj);
      var MethodName = $("div[field='METHOD_NAME'] input", _Obj);

      if (TableName.val() == undefined || TableName.val() == "") {
        alert("테이블명이 없습니다.");
        return;
      } else if (MethodName.val() == undefined || MethodName.val() == "") {
        alert("메소드명이 없습니다.");
        return;
      }

      var pl = new JSONClientParameters();
      pl.add("service", "MON_COMMON");
      pl.add("method", "SERVICE_GENERATOR");
      pl.add("TABLE_NAME", TableName.val());
      pl.add("EXEC_TYPE", ExecName.val().substring(0, 1));

      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          // alert(_data[0].query);
          $("div[field='QUERY_STMT'] textarea", _Obj)
            .attr("value", _data.resultData[0].query)
            .trigger("change");

          // 2018.06.24 dmjung :: 해당 셋팅값을 코드미러에 적용한다.
          var cmInst = $("div[field='QUERY_STMT']", _Obj).data(
            "CodeMirrorInstance"
          );
          cmInst.setValue(_data.resultData[0].query);
        },
        function (response) {
          alert(response.Message);
        },
        _M.aSync.async
      );
    },
    /* ------------------------------------------------------- */
    /* view CopyNew 동작시에 데이터를 저장함 */
    /* ------------------------------------------------------- */
    CopyNew: function () {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      _key = _Obj.attr("keyvalue", "");
      $(".fieldContaner", $(this)).each(function (e) {
        $(this).attr("oldvalue", "");
        $(this).superContaner("ContanerChange");
      });
      $(".fieldContaner[type='readonly']", $(this)).each(function (e) {
        $(this).html("");
      });

      _Obj.attr("viewstatus", "N");
      _Obj.superContaner("modeChange", true);

      $.blockUI({
        message:
          '<div class="Title" style="line-height:28px"><span class="icon i-20 icon-copy align-middle"></span><span class="align-middle bold">복사되었습니다.</span></div>',
        baseZ: 100000,
        css: {
          color: "#000000",
          backgroundColor: "#FFFFFF",
        },
      });
      setTimeout($.unblockUI, 300);
      return pl;
    },
    ContanerChange: function () {
      var _Obj = $(this);
      var _ViewObj = $(this).parents(".SuperView");
      var option = _ViewObj.data("jsonData");

      var _Value = _Obj.superContaner("getFieldValue");
      var _oldValue = _Obj.attr("oldValue");
      if (_oldValue == _Value) {
        _Obj.removeClass("fldChange");
      } else {
        _Obj.addClass("fldChange");
      }
      if (option == undefined) return;
      if (option.ChangeCallBack != undefined)
        eval(option.ChangeCallBack)(_Obj, _ViewObj);
    },

    ContanerKeyDown: function () {
      var _Obj = $(this);
      var _Value = _Obj.val();

      var _fieldContaner = $(this).parents(".fieldContaner");
      var _ViewObj = $(this).parents(".SuperView");
      var option = _ViewObj.data("jsonData");
      if (option == undefined) return;
      if (option.KeyDownCallBack != undefined)
        eval(option.KeyDownCallBack)(_Value, _fieldContaner, _ViewObj);
    },
    ContanerChangeTable: function () {
      var _Obj = $(this);
      var _ViewObj = $(this).parents(".SuperTable");
      var option = _ViewObj.data("jsonData");

      _Value = _Obj.superContaner("getFieldValue");
      _oldValue = _Obj.attr("oldValue");
      if (_oldValue == _Value) {
        _Obj.removeClass("fldChange");
      } else {
        _Obj.addClass("fldChange");
      }
      if (option == undefined) return;
      if (option.ChangeCallBack != undefined)
        eval(option.ChangeCallBack)(_Obj, _ViewObj);
    },
    ContanerBlur: function () {
      var _Obj = $(this);
      var _field = _Obj.attr("field");
      var _type = _Obj.attr("type");
      var _ViewObj = $(this).parents(".SuperView");
      var option = _ViewObj.data("jsonData");
      if (_type == "linkKey") {
        if (_Obj.attr("value") == "") {
          //$('input', _Obj).val('');
          //$('input', _Obj).attr('data', '');
        }
        if ($("input", _Obj).val() == "") {
          _Obj.attr("linkvalue", "");
          _Obj.trigger("change");
        }
      }
      _Value = _Obj.superContaner("getFieldValue");

      if (option != undefined) {
        if (option.BlurCallBack != undefined)
          eval(option.BlurCallBack)(_field, _Value, _ViewObj);
      }
    },
    /* ------------------------------------------------------- */
    /* view에서 테이블tr을 이동시키면서 조회변경 */
    /* ------------------------------------------------------- */
    MovePrevTr: function () {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      _key = _Obj.attr("keyvalue");
      // 만일링크가 걸린 테이블이 있으면 새로고침 합니다.
      if (option.mainListID != undefined) {
        var _table = $(option.mainListID);
        var _tr = $("tr[keyvalue='" + _key + "']", _table);

        if (_tr.prev().attr("keyvalue") != undefined) {
          _tr.removeClass("SelectTR bg-c1d1e1");
          _tr = _tr.prev();
          _tr.addClass("SelectTR bg-c1d1e1");
          _Obj.superContaner("Read", _tr.attr("keyvalue"));
        } else {
          // alert('페이지이동을 하세요');
        }
      }
    },
    MoveNextTr: function () {
      var _Obj = $(this);
      var option = $(this).data("jsonData");
      _key = _Obj.attr("keyvalue");
      // 만일링크가 걸린 테이블이 있으면 새로고침 합니다.
      if (option.mainListID != undefined) {
        var _table = $(option.mainListID);
        var _tr = $("tr[keyvalue='" + _key + "']", _table);

        if (_tr.next().attr("keyvalue") != undefined) {
          _tr.removeClass("SelectTR bg-c1d1e1");
          _tr = _tr.next();
          _tr.addClass("SelectTR bg-c1d1e1");
          _Obj.superContaner("Read", _tr.attr("keyvalue"));
        } else {
          // alert('페이지이동을 하세요');
        }
      }
    },
    /* ------------------------------------------------------- */
    /* ModeChange 조회모드/편집모드 전환 */
    /* true 편집모드, false 조회모드 */
    /* ------------------------------------------------------- */
    modeChange: function (bMode) {
      var status = $(this).attr("viewstatus");
      switch (bMode) {
        case true: // editmode
          $(
            ".fieldContaner .fieldEdit,.fieldContaner  .fieldSpace",
            $(this)
          ).toggle(true);
          $(".fieldContaner .fieldView", $(this)).toggle(false);
          if ($(this).attr("viewstatus") == "N") {
            $(this).attr("viewstatus", "N");
          } else {
            $(this).attr("viewstatus", "E");
          }
          break;
        case false: // viewmode
          $(
            ".fieldContaner .fieldEdit,.fieldContaner  .fieldSpace",
            $(this)
          ).toggle(false);
          $(".fieldContaner .fieldView", $(this)).toggle(true);
          $(this).attr("viewstatus", "V");
          break;
        default:
          // $(".fieldContaner .fieldEdit,.fieldContaner .fieldSpace",
          // $(this)).toggle();
          // $(".fieldContaner .fieldView", $(this)).toggle();
          if (status == "E") {
            $(this).attr("viewstatus", "V").superContaner("modeChange", false);
          } else if (status == "V") {
            $(this).attr("viewstatus", "E").superContaner("modeChange", true);
          } else if (status == "N") {
            alert("추가 상태에선 모드변경을 할 수 없습니다.");
          }
          break;
      }

      $(".fieldContaner[readonly='readonly']", $(this)).each(function (
        index,
        value
      ) {
        $(".fieldEdit,.fieldSpace", $(this)).toggle(false);
        $(".fieldView", $(this)).toggle(true);
      });
    },
    tableModeChange: function (bMode) {
      $(
        ".SuperFilter .fieldContaner .fieldEdit,.SuperFilter .fieldContaner  .fieldSpace",
        $(this)
      ).toggle(true);
      $(".SuperFilter .fieldContaner .fieldView", $(this)).toggle(false);

      switch (bMode) {
        case true:
          $(
            ".body .fieldContaner .fieldEdit,.body .fieldContaner  .fieldSpace",
            $(this)
          ).toggle(true);
          $(".body .fieldContaner .fieldView", $(this)).toggle(false);
          break;
        case false:
          $(
            ".body .fieldContaner .fieldEdit,.body .fieldContaner  .fieldSpace",
            $(this)
          ).toggle(false);
          $(".body .fieldContaner .fieldView", $(this)).toggle(true);
          break;
        default:
          $(
            ".body .fieldContaner .fieldEdit,.body .fieldContaner  .fieldSpace",
            $(this)
          ).toggle();
          $(".body .fieldContaner .fieldView", $(this)).toggle();
          break;
      }
      $(".fieldContaner[readonly='readonly']", $(this)).each(function (
        index,
        value
      ) {
        $(".fieldEdit,.fieldSpace", $(this)).toggle(false);
        $(".fieldView", $(this)).toggle(true);
      });
      var jobArea = $(this).find(".jobArea");
      jobArea.find('.cmdbtn[ishide="hide"]').toggle();
    },
    isRequired: function () {
      var _Obj = $(this);
      var pl = new JSONClientParameters();
      $("table:eq(0) .fieldContaner .Required", $(this)).each(function (e) {
        // tab 부분 제외하기 위해 table추가
        _field = $(this).parent().parent().prev().text().replace(/\*/gi, ""); // field 값으로 표시하는것이 아니라
        // 해당 Label값으로 표시하도록 수정
        _val = $(this).parent().attr("Value");
        if (_val == "") {
          pl.add(_field, _val);
        }
      });

      return pl;
    },
    isSaveNullMsg: function () {
      var _Obj = $(this);
      var pl = new JSONClientParameters();
      $(".fieldContaner", $(this)).each(function (e) {
        _field = $(this).attr("field");
        _val = $(this).attr("Value");
        if (_val == "") {
          pl.add(_field, _val);
        }
      });

      return pl;
    },
    /* ------------------------------------------------------- */
    /* list view의 동작이 토글모드로 실행될때 */
    /* view화면을 닫고 list를 표시하는 함수 */
    /* ------------------------------------------------------- */
    ViewToggleClose: function (e) {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      if (option.mainListID != undefined) {
        if (option.mainViewToggle) {
          _Obj.toggle(false);
          $(option.mainListID).toggle(true);
        }
      }
    },
    /* ------------------------------------------------------- */
    /* 입력된 객체값읽어오기 */
    /* ------------------------------------------------------- */
    getValue: function (bMode) {
      var _Obj = $(this);
      var pl = new JSONClientParameters();
      $("table:eq(0) .fieldContaner.fldChange", $(this)).each(function (e) {
        _field = $(this).attr("field");
        _val = $(this).superContaner("getFieldValue", pl);
        // pl.add(_field, _val);
      });
      return pl;
    },

    /* ------------------------------------------------------- */
    /* 입력된 필드별값읽어오기 */
    /* ------------------------------------------------------- */
    getFieldNameValue: function (fldName) {
      var _Obj = $(this);
      var _rlt = $(
        ".fieldContaner[field='" + fldName + "']",
        _Obj
      ).superContaner("getFieldValue");
      return _rlt;
    },
    getFieldValue: function (apl) {
      var _Obj = $(this);
      _retVal = "";
      switch (_Obj.attr("type")) {
        case "tokenField": // 일반형
          _o = $("input", _Obj);
          _retVal = _o.val();
          _retVal = _retVal.replace(/ /g, ""); // 2018.02.10 dmjung ::
          // 벨류 삽입시 공백 제거
          _Obj.attr("Value", _retVal);
          if (_Obj.find("div.token").length == 0) {
            _Obj.find(".fieldView").html("");
          }
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "lunardate":
          // dmjung ::
          var type = _Obj.find("select#lunartype").val(); // 양력/음력 구분
          var year = _Obj.find("select#lunaryear").val(); // 년
          var month = _Obj.find("select#lunarmonth").val(); // 월
          var day = _Obj.find("select#lunarday").val(); // 일
          day = day == "default" ? "01" : day;
          var pick = _Obj.find(".hasDatepicker").val(); // 년-월-일
          // "yyyy-mm-dd"
          var yun = $("input#yundal", _Obj).prop("checked") ? "1" : "0"; // 윤달
          // 여부
          var dateValue = type == "0" ? pick : year + "-" + month + "-" + day; // 날짜값
          _retVal = type + "," + dateValue + "," + yun;
          _Obj.attr("value", _retVal);
          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            apl.add(_arFld[0], type); // 날짜
            apl.add(_arFld[1], dateValue); // 양력/음력 구분
            apl.add(_arFld[2], yun); // 윤달 여부
          }

          break;
        case "multiaddress":
          var parentKey = _Obj.parents(".SuperView").attr("keyvalue");
          var searchKey = _Obj.attr("value");

          if (isEmpty(parentKey)) {
            searchKey = makeUniqueKey(_Obj.attr("jobType"), _M.UserInfo.id);
            _Obj.attr("value", searchKey);
            _Obj.removeClass("fldChange").addClass("fldChange");

            if (_Obj.find(".ziplines:hidden").length > 1) {
              $(
                "select#addrtype, input#zipcode, input#address, input#address2",
                _Obj
              ).val("");
              $(".contactlines", _Obj).remove();
              $(".templines", _Obj).remove();
              $(".ziplines", _Obj).show();
              _Obj.find(".fieldView").html("");
            } else {
              _retVal = searchKey;
              var addrtype = $("select#addrtype", _Obj).attr("ADDR_TYPE");

              if (addrtype == undefined) {
                addrtype = "1";
              }

              if (apl != undefined) {
                var _field = _Obj.attr("field");
                var _arFld = _field.split(",");
                apl.add("ADDR_TYPE", addrtype);
                apl.add("ZIP_CODE", $("input#address2", _Obj).attr("ZIP_CODE"));
                apl.add("STATE", $("input#address2", _Obj).attr("STATE"));
                apl.add("CITY", $("input#address2", _Obj).attr("CITY"));
                apl.add("STREET", $("input#address2", _Obj).val());
                apl.add("JOB_TYPE", _Obj.attr("jobType"));
                apl.add(_Obj.attr("field"), searchKey);
              }
            }
          }
          break;
        case "multitel":
          // 2018.07.18 dmjung :: get.. retVal2 는 이메일 타입 코드 값을 가져오기 위함.
          var parentKey = _Obj.parents(".SuperView").attr("keyvalue");
          var searchKey = _Obj.attr("value");

          if (isEmpty(parentKey)) {
            searchKey = makeUniqueKey(_Obj.attr("jobType"), _M.UserInfo.id);
            _Obj.attr("value", searchKey);
            _Obj.removeClass("fldChange").addClass("fldChange");

            if (_Obj.find(".pinset:hidden").length == 1) {
              _Obj.find(".fieldEdit .contactlines").remove();
              _Obj.find(".fieldEdit .templines").remove();
              _Obj.attr("reptel", "");
              $(".pinset", _Obj).show().find(".telno").val("");
              $(".pinset", _Obj).show().find(".teltype").val("");
              _Obj.find(".fieldView").html("");
            } else {
              // TODO 신규등록일때에만 초기 입력항목값을 파라메터로 던짐.
              _retVal = searchKey;
              if (apl != undefined) {
                apl.add("TEL_TYPE", $(".teltype", _Obj).attr("value"));
                apl.add("TEL_NO", $(".telno", _Obj).val());
                apl.add("JOB_TYPE", _Obj.attr("jobType"));
                apl.add(_Obj.attr("field"), searchKey);
              }
            }
          }
          break;
        case "multiemail":
          var parentKey = _Obj.parents(".SuperView").attr("keyvalue");
          var searchKey = _Obj.attr("value");

          if (isEmpty(parentKey)) {
            searchKey = makeUniqueKey(_Obj.attr("jobType"), _M.UserInfo.id);
            _Obj.attr("value", searchKey);
            _Obj.removeClass("fldChange").addClass("fldChange");

            if (_Obj.find(".pinset:hidden").length == 1) {
              // 복사시 클리어를
              // 위한 처리임.
              _Obj.find(".fieldEdit .contactlines").remove();
              _Obj.find(".fieldEdit .templines").remove();
              _Obj.attr("repemail", "");
              $(".pinset", _Obj).show().find(".email").val("");
              $(".pinset", _Obj).show().find(".emailtype").val("");
              _Obj.find(".fieldView").html("");
            } else {
              // TODO 신규등록일때에만 초기 입력항목값을 파라메터로 던짐.
              _retVal = searchKey;
              if (apl != undefined) {
                // EMAIL_TYPE,EMAIL,REP_EMAIL_FLAG,JOB_TYPE
                apl.add("EMAIL_TYPE", $(".emailtype", _Obj).attr("value"));
                apl.add("EMAIL", $(".email", _Obj).val());
                apl.add("JOB_TYPE", _Obj.attr("jobType"));
                apl.add(_Obj.attr("field"), searchKey);
              }
            }
          }
          break;
          
          //khma 20240329 이메일 타입 신규 추가
        case "email": // email validation 추가 
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
          
        case "text": // 일반형
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "password": // 일반형
          _o = $("input", _Obj);
          _retVal = _o.val();
          // _retVal = $.md5(_retVal);
          _retVal = SHA256(_retVal);
          if (_o.val() != "") {
            _Obj.attr("Value", _retVal);
          } else {
            _Obj.attr("Value", "");
          }
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "passwordcheck": // 일반형
          _o = $("input", _Obj);
          _retVal = _o.val();
          // _retVal = $.md5(_retVal);
          _retVal = SHA256(_retVal);
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "linkKey":
          _retVal = _Obj.attr("linkvalue");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "linkKey2": //20240621
          _retVal = _Obj.attr("linkvalue");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "linktext":
          _key = $("input:eq(0)", _Obj);
          _display = $("input:eq(1)", _Obj);
          _retVal = _key.val() + "," + _display.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            apl.add(_arFld[0], _key.val());
            apl.add(_arFld[1], _display.val());
          }
          break;
        case "date": //
          _o = $("input", _Obj);
          _retVal = _o.val();
          //_retVal = _retVal.replace(/-/gi, "");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "date8": //
          _o = $("input", _Obj);
          _retVal = _o.val();
          _retVal = _retVal.replace(/-/gi, "");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;

        case "dateBetween": // : get
          _from = $("input:eq(0)", _Obj);
          _to = $("input:eq(1)", _Obj);
          // _retVal = _from.val() + ',' + _to.val()

          if (_from.val().length <= 1 && _to.val().length <= 1) {
            _retVal = "";
          } else {
//			  if(_from.val().length > 0 && _to.val().length > 0){
//				  if(_from.val() <= _to.val()){
//					_retVal = _from.val() + "," + _to.val();
//				  } else {
//					_from.val(_to.val());
//					_retVal = _to.val() + "," + _to.val();
//				  }
//			  } else {
//				  _retVal = _from.val() + "," + _to.val();
//			  }
			  _retVal = _from.val() + "," + _to.val();
          }
          _Obj.attr("Value", _retVal);
          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            if (
              _from.val() != "" &&
              _from.val() != undefined &&
              _from.val() != null
            ) {
              apl.add(_arFld[0], _from.val());
            }
            if (
              _to.val() != "" &&
              _to.val() != undefined &&
              _to.val() != null
            ) {
              apl.add(_arFld[1], _to.val());
            }
          }
          break;
        case "datetime":
          /* 20141226 datetime타입을 두개의 컬럼이 아닌 하나의 컬럼으로 관리 하도록 처리 Start */
          var _Obj1 = $("input", _Obj);
          var _Obj2 = $("select:eq(0)", _Obj);
          var _Obj3 = $("select:eq(1)", _Obj);

          _Obj1Val = _Obj1.val();
          _Obj1Val = _Obj1Val.replace(/-/gi, "");
		  
		  /* 20240523 khma 추가 datetime null 선택시 기본값이 00으로 세팅 start */
		  if(_Obj2.val() == undefined || _Obj2.val() == ""){
			  _Obj2.val("00");
		  }
		  if(_Obj3.val() == undefined || _Obj3.val() == ""){
			  _Obj3.val("00");
		  }
		  /* 20240523 khma 추가 datetime null 선택시 기본값이 00으로 세팅 end */

          _retVal = _Obj1Val + _Obj2.val() + _Obj3.val() + "00";
          _Obj.attr("Value", _retVal);

          if (apl != undefined) {
            var _field = _Obj.attr("field");
            apl.add(_field, _retVal);
          }
          /* 20141226 datetime타입을 두개의 컬럼이 아닌 하나의 컬럼으로 관리 하도록 처리 End */
          /*
           * var _Obj1 = $('input', _Obj); var _Obj2 = $('select:eq(0)',
           * _Obj); var _Obj3 = $('select:eq(1)', _Obj);
           *
           * _Obj1Val = _Obj1.val(); _Obj1Val = _Obj1Val.replace(/-/gi,
           * '');
           *
           * _retVal = _Obj1Val + ',' + _Obj2.val() + ',' + _Obj3.val();
           * _Obj.attr('Value', _retVal);
           *
           * if (apl != undefined) { var _field = _Obj.attr('field'); var
           * _arFld = _field.split(','); apl.add(_arFld[0], _Obj1.val());
           * apl.add(_arFld[1], _Obj2.val() + _Obj3.val()); }
           */
          break;
        case "datetimeBetween":
          var _Obj1 = $("input:eq(0)", _Obj);
          var _Obj2 = $("select:eq(0)", _Obj);
          var _Obj3 = $("select:eq(1)", _Obj);
          var _Obj4 = $("input:eq(1)", _Obj);
          var _Obj5 = $("select:eq(2)", _Obj);
          var _Obj6 = $("select:eq(3)", _Obj);

          _Obj1Val = _Obj1.val();
          _Obj1Val = _Obj1Val.replace(/-/gi, "");

          _Obj4Val = _Obj4.val();
          _Obj4Val = _Obj4Val.replace(/-/gi, "");

          _retVal =
            _Obj1Val +
            "," +
            _Obj2.val() +
            "," +
            _Obj3.val() +
            "," +
            _Obj4Val +
            "," +
            _Obj5.val() +
            "," +
            _Obj6.val();
          _Obj.attr("Value", _retVal);

          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            apl.add(_arFld[0], _Obj1.val());
            apl.add(_arFld[1], _Obj2.val() + _Obj3.val());
            apl.add(_arFld[2], _Obj4.val());
            apl.add(_arFld[3], _Obj5.val() + _Obj6.val());
          }
          break;
        case "number":
          _o = $("input", _Obj);
          _retVal = _o.val();
          _retVal = _retVal.replace(/,/gi, "");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "money":
          _o = $("input", _Obj);
          _retVal = _o.val();
          _retVal = _retVal.replace(/,/gi, "");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "select":
          _o = $("select", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined && _Obj.attr("Value") != undefined)
            apl.add(_Obj.attr("field"), _Obj.attr("Value").toString());
          break;

        case "textarea":
          _o = $(".fieldEdit textarea", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;

        case "codeEditor":
          _retVal = _Obj.attr("Value");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;

        case "textedit":
          _o = $("textarea", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;

        case "tel":
          _Obj1 = $("select", _Obj);
          _Obj2 = $("input:eq(0)", _Obj);
          _Obj3 = $("input:eq(1)", _Obj);
          _retVal = _Obj1.val() + "," + _Obj2.val() + "," + _Obj3.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            apl.add(_arFld[0], _Obj1.val());
            apl.add(_arFld[1], _Obj2.val());
            apl.add(_arFld[2], _Obj3.val());
          }
          break;
        case "multicombo":
          var _field = _Obj.attr("field");
          var _arFld = _field.split(",");
          var DataArr = [];

          $("input", _Obj).each(function (index) {
            DataArr.push($(this).val());
            if (apl != undefined) {
              apl.add(_arFld[index], $(this).val());
            }
          });
          _retVal = DataArr.join(",");
          _Obj.attr("Value", _retVal);
          break;
        case "multilist":
          var _field = _Obj.attr("field");
          var _arFld = _field.split(",");
          var DataArr = [];

          $("input", _Obj).each(function (index) {
            DataArr.push($(this).val());
            if (apl != undefined) {
              apl.add(_arFld[index], $(this).val());
            }
          });
          _retVal = DataArr.join(",");
          _Obj.attr("Value", _retVal);
          break;

        case "phone":
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "zip":
          _Obj1 = $("input:eq(0)", _Obj);
          _Obj2 = $("input:eq(1)", _Obj);
          _Obj3 = $("input:eq(2)", _Obj);
          _retVal = _Obj1.val() + "," + _Obj2.val() + "," + _Obj3.val();
          //_retVal = _Obj1.val().replace(/-/gi, '') + ',' + _Obj2.val() + ',' + _Obj3.val(); // 20140331 우편번호 -표시로 인한 수정사항
          _Obj.attr("Value", _retVal);
          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            apl.add(_arFld[0], _Obj1.val());
            //apl.add(_arFld[0], _Obj1.val().replace(/-/gi, ''));
            apl.add(_arFld[1], _Obj2.val());
            apl.add(_arFld[2], _Obj3.val());
          }
          break;
        case "zipone":
          _Obj1 = $("input:eq(0)", _Obj);
          _Obj2 = $("input:eq(1)", _Obj);
          _retVal = _Obj1.val().replace("-", "") + "," + _Obj2.val(); // 20140331
          // 우편번호
          // -표시로
          // 인한
          // 수정사항
          _Obj.attr("Value", _retVal);
          if (apl != undefined) {
            var _field = _Obj.attr("field");
            var _arFld = _field.split(",");
            apl.add(_arFld[0], _Obj1.val());
            apl.add(_arFld[1], _Obj2.val());
          }
          break;
        case "radio":
          _o = $(".fieldEdit input:checked", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "check":
          _o = $(".fieldEdit input", _Obj);
          _retVal = _o.is(":checked") ? "1" : "0";
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "iconcheck":
          var _oc = _Obj.find(".cmdicon");
          _retVal = _oc.hasClass(_Obj.attr("selectIcon")) ? "1" : "0";
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;

        case "multicheck":
          var DataArr = [];
          var _filterObj = _Obj.parent().parent().parent().parent();
          if (_filterObj.hasClass("SuperFilter")) {
            $(".fieldEdit input ", _Obj).each(function (e) {
              if ($(this).is(":checked"))
                //DataArr.push("&#39;" + $(this).val() + "&#39;");
                DataArr.push($(this).val());
            });
            _retVal = DataArr.join(",");
          } else {
            $(".fieldEdit input ", _Obj).each(function (e) {
              if ($(this).is(":checked")) DataArr.push($(this).val());
            });
            _retVal = DataArr.join(",");
          }
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "multiiconcheck":
          var DataArr = [];
          var _filterObj = _Obj.parent().parent().parent().parent();
          if (_filterObj.hasClass("SuperFilter")) {
            _Obj.find("." + _Obj.attr("selectIcon")).each(function (e) {
              DataArr.push("&#39;" + $(this).attr("value") + "&#39;");
            });
            _retVal = DataArr.join(",");
          } else {
            _Obj.find("." + _Obj.attr("selectIcon")).each(function (e) {
              DataArr.push($(this).attr("value"));
            });
            _retVal = DataArr.join(",");
          }
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "context": // context
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "chkselect": // money
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "slider": //
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case _M.DataType.img:
          _o = $(".fieldEdit  img", _Obj);
          _retVal = _o.attr("src");
          if (_retVal == "#") _retVal = "";
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "qr":
          // 추가&수정시 아무런 작업 하지 않음.
          break;
        case "textword":
          _o = $("textarea", _Obj);
          // _retVal = _o.html(); //khma 20181023 에디터변경으로 수정
          if (undefined != tinymce.activeEditor) {
            _retVal = tinymce.activeEditor.getContent(); // khma 20181023 에디터변경으로 수정
          }
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "file":
          _o = $(".fldfiledown", _Obj);
          _retVal = _o.attr("src");
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "signfile": //20240619
          // :: get multifile
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "multifile":
          // :: get multifile
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "time":
          _retVal =
            $("select:eq(0)", _Obj).val() + $("select:eq(1)", _Obj).val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "month":
          _retVal = $("select:eq(0)", _Obj).val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "year":
          _retVal = $("select:eq(0)", _Obj).val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "map":
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "url":
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "mail":
          _o = $("input", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "sms": // sms
          _o = $("textarea", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "lms": // lms
          _o = $("textarea", _Obj);
          _retVal = _o.val();
          _Obj.attr("Value", _retVal);
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
        case "sticker": // 일반형
          // 2018.07.08 dmjung :: .icon 을 li 가 아닌 span 요소만 선택하도록 셀렉터 수정 (
          // IE9 에서 아이콘 바깥 영역 클릭시 클래스 전부 적용되던 문제 수정 )
          _Obj.find("span.icon").addClass(_Obj.attr("Value"));
          // 2018.05.24 dmjung :: 켈린더 스티커에서 노아이콘 선택 후 저장시 화살표 아이콘이 노아이콘
          // 모양으로 바뀌는 문제 방지하기 위해 조건 추가.
          if (_Obj.find("span.icon").hasClass("calicon-noicon") == true) {
            _Obj.find("span.icon").removeClass("calicon-noicon");
          }
          _retVal = _Obj.attr("Value");
          if (apl != undefined) apl.add(_Obj.attr("field"), _Obj.attr("Value"));
          break;
      }
      return _retVal;
    },

    /* ------------------------------------------------------- */
    /* 조회된 객체값 표시하기 */
    /* ------------------------------------------------------- */
    setValue: function (data) {
      var _Obj = $(this);
      var _json = $(this).data("jsonData");
      // 2014.02.28 neh :: selectbox binding일 경우 부모 값 세팅 후 자식 값 세팅
      var fieldContainer = (fieldContainer = $("tbody .fieldContaner", _Obj));

      // 2014.11.26 dmjung :: Tab 테이블의 isAutuRun 옵션 처리 시작.
      if (_json.tabs != undefined) {
        if (_json.tabs.length > 0 && _json.isTabMode == true) {
          var ind = $("ul.ui-tabs-nav .ui-tabs-active", _Obj).attr(
            "aria-controls"
          ); // .index();
          var tab = $(".Tabs .SuperContaner#" + ind);
          var opt = tab.data("jsonData");

          if (
            (opt != undefined && opt.isAutoRun == true) ||
            opt.isAutoRun == undefined
          ) {
            fieldContainer = "";
            fieldContainer = $("tbody .fieldContaner", _Obj).not(
              $(".SuperFilter", ".Tabs").find("div.fieldContaner")
            );
            if (tab.find(".SuperFilter").find("div.fieldContaner").size() > 0) {
              fieldContainer.push(
                tab.find(".SuperFilter").find("div.fieldContaner")
              );
            }
          } else {
            fieldContainer = "";
            fieldContainer = $("tbody .fieldContaner", _Obj).not(
              tab.find(".SuperFilter").find("div.fieldContaner")
            );
            tab
              .find(".SuperFilter")
              .find("div.fieldContaner")
              .removeAttr("orders");
          }
        }
      }
      // 2014.11.26 dmjung :: Tab 테이블의 isAutuRun 옵션 처리 종료.

      fieldContainer.not("[orders]").attr("orders", 0); // initialize
      // element
      // number = 0

      var index = 0;
      var container = $("div.fieldContaner[orders='0']", _Obj);
      while (container.length > 0) {
        // set values in containers
        container.each(function (e) {
          var _ofld = $(this);
          _ofld.removeClass("fldChange");
          _field = _ofld.attr("field");
          var _arFld = _field.split(",");

          $.each(_arFld, function (index, value) {
            _value = $.trim(data[value] == undefined ? "" : data[value]);
            _ofld.superContaner("setFieldValue", _value, index, data);
          });
          if (_json.setValueCallBack != undefined)
            eval(_json.setValueCallBack)(_ofld, _Obj);
        });
        container = $("div.fieldContaner[orders='" + ++index + "']", _Obj);
      }

      // 하위객체가 참조할수 있도록 상위객체에 자료를 기록해둔다.
      var parentPl = new JSONClientParameters();
      parentPl.add(_json.keyName, data[_json.keyName]);

      $.each($(".SuperTable", _Obj), function (index, element) {
        if (_json.isTabMode == false) {
          $(element).superContaner("tableListParent", _Obj.attr("keyvalue"));
        }
        $(element).attr("parentKeyValue", _Obj.attr("keyvalue"));
      });
      $(".SuperView", _Obj).each(function () {
        if (_json.isTabMode == false) {
          $(this).superContaner("ReadParent", _Obj.attr("keyvalue"));
        }
        $(this).attr("parentKeyValue", _Obj.attr("keyvalue"));
      });
      $(".SuperCalendar", _Obj).each(function () {
        $(this).superContaner("CalendarListParent", _Obj.attr("keyvalue"));
      });
      $(".Tabs > .SuperContaner", _Obj).each(function (index) {
        // 2014.11.26 dmjung :: Tab 테이블의 isAutuRun 옵션 처리 관련 코드1.
        var opt = $(this).data("jsonData");

        if (!$(this).hasClass("ui-tabs-hide")) {
          if ($(this).hasClass("SuperTable")) {
            // 2014.11.26 dmjung :: Tab 테이블의 isAutuRun 옵션 처리
            // 관련 조건
            if (
              (opt != undefined && opt.isAutoRun == true) ||
              opt.isAutoRun == undefined
            ) {
              $(this).superContaner("tableListParent", _Obj.attr("keyvalue"));
            }
          } else if ($(this).hasClass("SuperView")) {
            $(this).superContaner("ReadParent", _Obj.attr("keyvalue"));
          }
        }
      });
    },
    /* ------------------------------------------------------- */
    /* 조회된 객체값 표시하기 */
    /* ------------------------------------------------------- */
    setTrValue: function (data) {
      var _Obj = $(this);
      $("td", _Obj).each(function (index, td) {
        var _td = $(this);
        var _field = _td.attr("field");
        if (_field != undefined) {
          var _arFld = _field.split(",");
          $.each(_arFld, function (index, value) {
            _value = $.trim(
              data[value] == undefined ? "" : $.decHTML(data[value])
            );
            _td.superContaner("setFieldValue", _value, index);
            if ($(".fieldContaner", _td).length > 0) {
              $(".fieldContaner", _td).superContaner(
                "setFieldValue",
                _value,
                index
              );
            }
          });
        }
      });
    },
    /* ------------------------------------------------------- */
    /* 조회된 필드별값 표시하기 */
    /* ------------------------------------------------------- */
    setFieldNameValue: function (fldName, _value) {
      _fc = $(".fieldContaner[field='" + fldName + "']", $(this));
      _type = _fc.attr("type");
      _oldValueBak = _fc.attr("oldValue");
      _fc.superContaner("setFieldValue", _value);
      _fc.attr("oldValue", _oldValueBak).trigger("change");
    },
    setFieldValue: function (_value, index, DataRow) {
      var _Obj = $(this);
      _Obj.attr("oldValue", _value);
      _Obj.attr("Value", _value);

      switch (_Obj.attr("type")) {
        case "tokenField":
          $(".fieldView", _Obj).html(_value);
          break;
        case "lunardate":
          if (_value == undefined || _value == "") {
            $(".hasDatepicker", _Obj).datepicker("setDate", "");
            $("#solarWrap", _Obj).show();
            $("#lunartype", _Obj).val(0);
            $("#yundal", _Obj).attr("checked", false);
            $("#lunarWrap", _Obj).hide();
            $("#solarArea", _Obj).text("");
            $("#lunarArea", _Obj).text("");
            return;
          }
          // _M.f.d.DateGetDate(getDateIE8Compatible(_value));
          if (index == 0) {
            // 양력/음력 구분
            $("#lunartype", _Obj).val(_value);
          } else if (index == 1) {
            // 날짜
            $("#lunartype", _Obj).attr("dateval", _value); // _value 형식
            // :
            // 'yyyy-mm-dd'
          } else if (index == 2) {
            // 윤달 여부
            var dateValue = $("#lunartype", _Obj).attr("dateval");
            var dateType = $("#lunartype", _Obj).val();
            var dateYun = _value;

            // 양력
            if (dateType == "0") {
              $("#lunarWrap", _Obj).hide(); // 음력 영역 hide
              $("#solarWrap", _Obj).show(); // 양력 영역 show
              $("#yundal", _Obj).prop("checked", false);

              // 날짜 값 세팅 "yyyy-mm-dd"
              $(".hasDatepicker", _Obj).datepicker("setDate", dateValue);

              // fieldView 영역 채우기
              // $('.fieldView', _Obj).html(dateValue);
              $("#solarArea", _Obj).text(dateValue);
              $("#lunarArea", _Obj).text("");
            }
            // 음력
            else if (dateType == "1") {
              $("#solarWrap", _Obj).hide(); // 양력 영역 hide
              $("#lunarWrap", _Obj).show(); // 음력 영역 show

              $("#lunaryear", _Obj).val(dateValue.substring(0, 4)); // 년 표시
              $("#lunarmonth", _Obj).val(dateValue.substring(5, 7)); // 월 표시

              // 음력 날짜 일 표시 (윤달로 구분함)
              $("#lunarday", _Obj).get(0).options[0] = new Option(
                "선택",
                "default"
              );
              $("#lunarday", _Obj).val("default");
              if (dateYun == 1) {
                var _fieldEdit = $(".fieldEdit", _Obj);
                _fieldEdit.superContaner("LunardateSet", "Yun", _fieldEdit);
              } else {
                _Obj.superContaner("LunardateSet", "Unyun", _Obj);
              }
              $("#lunarday", _Obj).val(dateValue.substring(8, 10)); // 일 표시

              // 음력일 경우 윤달 체크
              $("#yundal", _Obj).prop("checked", dateYun == 1 ? true : false);

              // fieldView 영역 채우기
              var solarDate = $("#solar", _Obj).text();
              $("#solarArea", _Obj).html(solarDate);
              $("#lunarArea", _Obj).html("(음) " + dateValue);
            }

            // oldvalue 데이터 입력
            _Obj.attr("oldvalue", dateValue + "," + dateType + "," + dateYun);
          } else {
          }
          /*
           * // dmjung : var keyvalue =
           * _Obj.parents('#MainView').attr('keyvalue'); if ( keyvalue ==
           * undefined || keyvalue == "" ) { $('.hasDatepicker',
           * _Obj).datepicker("setDate", "dd/mm/yyyy"); $('#solarWrap',
           * _Obj).show(); $('#lunartype', _Obj).val(0); $('#yundal',
           * _Obj).attr('checked', false); $('#lunarWrap', _Obj).hide();
           * $('.fieldView', _Obj).html(""); } else { if ( index == 0 ) {
           * var dataset; var pl = new JSONClientParameters();
           * pl.add('service', 'MON_COMMON'); pl.add('method',
           * 'ANNIV_READ'); pl.add('KEY', keyvalue);
           * PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl,
           * function(_data) { dataset = _data; }, function(response) {
           * alert(response.Message); }, _M.aSync.sync);
           *
           * var type = dataset.resultData[0]['LUNAR_TYPE']; var date =
           * dataset.resultData[0]['ANNIV_DAY']; var yy =
           * date.substring('0', '4'); var mm = date.substring('4', '6');
           * var dd = date.substring('6', '8'); var yn =
           * dataset.resultData[0]['YUN_FLAG']; if ( type == 0 ) {
           * $('#solarWrap', _Obj).show(); $('#lunarWrap', _Obj).hide();
           * $('#lunartype', _Obj).val(type); $('.hasDatepicker',
           * _Obj).datepicker("setDate", yy + '-' + mm + '-' + dd);
           * $('.fieldView', _Obj).html("양력 : " + yy + '-' + mm + '-' +
           * dd); } else { $('#solarWrap', _Obj).hide(); $('#lunarWrap',
           * _Obj).show(); $('#lunartype', _Obj).val(type);
           * $('#lunaryear', _Obj).val(yy); $('#lunarmonth',
           * _Obj).val(mm); _Obj.superContaner('LunardateSet', 'Unyun',
           * _Obj); $('#lunarday', _Obj).val(dd); $('.fieldView',
           * _Obj).html("음력 : " + yy + '-' + mm + '-' + dd); if ( yn == 1 ) {
           * _fieldEdit.superContaner('LunardateSet', 'Yun', _fieldEdit);
           * $('#yundal', _Obj).attr('checked', true); $('.fieldView',
           * _Obj).html("음력 : " + yy + '-' + mm + '-' + dd + "(윤달)"); } }
           * _Obj.attr('oldvalue', type+','+date); } }
           */
          break;
        case "multiaddress":
          var parentKey = _Obj.parents(".SuperView").attr("keyvalue");
          var jobType = _Obj.attr("jobType");
          var searchKey = "";
          if (isEmpty(parentKey)) {
            searchKey = makeUniqueKey(jobType, _M.UserInfo.id); // 유니크키
            // 생성
            // khma
            _Obj.attr("value", searchKey); // value에 검색키 셋팅
            _Obj.removeClass("fldChange").addClass("fldChange");
            $(
              "select#addrtype, input#zipcode, input#address, input#address2",
              _Obj
            ).val("");
            $(".contactlines", _Obj).remove();
            $(".templines", _Obj).remove();
            $(".ziplines", _Obj).show();
            $(".fieldView", _Obj).html("").attr("title", "");
          } else {
            if (index == 0) {
              // ADDR_TYPE 셋
              // $('select#addrtype', _Obj).val(_value);
              // $('input#zipcode', _Obj).val(_value);
              // $('input#address').val(_value);
              // $('input#address').val(_value);

              var repaddr;
              var addrtype;
              var zipcode;
              var state;
              var city;
              var street;
              var address;
              var bflag;
              searchKey = _Obj.attr("value");

              var ds = _Obj.superContaner(
                "MultiContactList",
                searchKey,
                "LIST",
                "ADDR_MGMT",
                "ADDR",
                jobType
              );
              if (ds.resultData.length == 0) {
                $(
                  "select#addrtype, input#zipcode, input#address, input#address2",
                  _Obj
                ).val("");
                _Obj.attr("value", "");
                $(".ziplines", _Obj).hide();
                $(
                  '<div class="templines"><span class="icon i-20 icon-approval mtctadd align-middle"></span><span class="align-middle mtctadd"> 주소 추가</span></div>'
                ).appendTo(_Obj.find(".fieldEdit"));
                $(".mtctadd", _Obj).click(function () {
                  $.MultiAddress(
                    "주소 추가",
                    350,
                    "",
                    searchKey,
                    _Obj.find(".fieldEdit"),
                    function () {
                      var ds = _Obj.superContaner(
                        "MultiContactList",
                        searchKey,
                        "LIST",
                        "ADDR_MGMT",
                        "ADDR",
                        jobType
                      );
                      if (ds.resultData.length == 0) {
                        return;
                      }
                      $(".SelectTR").trigger("click");
                    }
                  );
                });
                return;
              }

              $(ds.resultData).each(function (index, data) {
                repaddr = data.REP_ADDR_FLAG;
                addrtype = data.ADDR_TYPE;
                addrtext = $("#addrtype", _Obj)
                  .val(addrtype)
                  .children("option:selected")
                  .text();
                zipcode = data.ZIP_CODE;
                state = data.STATE;
                city = data.CITY;
                street = data.STREET;
                if (
                  data.BAD_ADDR_FLAG == null ||
                  data.BAD_ADDR_FLAG == undefined
                ) {
                  data.BAD_ADDR_FLAG = "0";
                }
                bflag = data.BAD_ADDR_FLAG;
                var _div = $(
                  "<div class='contactlines' repaddr='" +
                    repaddr +
                    "' badaddr='" +
                    bflag +
                    "'></div>"
                ).appendTo(_Obj.find(".fieldEdit"));
                var _label = $(
                  "<span class='contactLabel align-middle'>" +
                    addrtext +
                    "<span>"
                ).appendTo(_div);
                var _data = $(
                  "<span class='align-middle' style='text-decoration:none;'> : </span><span class='contactData align-middle'>" +
                    zipcode +
                    " <b style='font-size:8pt; font-weight:normal;'>(우편번호)</b> </span><br/>"
                ).appendTo(_div);
                var _addr = $(
                  "<span class='contactData address align-middle'> " +
                    state +
                    " " +
                    city +
                    " " +
                    street +
                    "</span><br/>"
                ).appendTo(_div);
                _Obj.attr("repaddr", repaddr);
                if (index == 0) {
                  $(".contactData:eq(0)", _Obj).after(
                    "<span class='icon i-20 extrabtn icon-xx popup align-middle' style='float:right;'><span>"
                  );
                } else {
                }
              });

              $(".popup", _Obj).click(function () {
                $.MultiAddress(
                  "주소 추가",
                  350,
                  "",
                  searchKey,
                  _Obj.find(".fieldEdit"),
                  function () {
                    var ds = _Obj.superContaner(
                      "MultiContactList",
                      searchKey,
                      "LIST",
                      "ADDR_MGMT",
                      "ADDR",
                      jobType
                    );
                    if (ds.resultData.length == 0) {
                      return;
                    }
                    $(".SelectTR").trigger("click");
                  }
                );
              });

              if (undefined != addrtype && $.trim(addrtype) != "") {
                var viewname = $("#addrtype", _Obj)
                  .val(addrtype)
                  .children("option:selected")
                  .text();
              }
              // _Obj.attr('Value', addrtype +","+zipcode
              // +","+state+","+city+","+street);
              $(".fieldView", _Obj)
                .html($(".fieldEdit", _Obj).html())
                .find(".icon-xx")
                .remove();
              $(".ziplines", _Obj).hide();
            }
          }
          break;
        case "multitel":
          var parentKey = _Obj.parents(".SuperView").attr("keyvalue");
          var jobType = _Obj.attr("jobType");
          var searchKey = "";
          if (isEmpty(parentKey)) {
            searchKey = makeUniqueKey(jobType, _M.UserInfo.id); // 유니크키
            // 생성
            // khma
            _Obj.attr("value", searchKey); // value에 검색키 셋팅
            _Obj.find(".fieldEdit .contactlines").remove();
            _Obj.removeClass("fldChange").addClass("fldChange");
            _Obj.find(".fieldEdit .templines").remove();
            _Obj.attr("reptel", "");
            $(".pinset", _Obj).show().find(".telno").val("");
            $(".pinset", _Obj).show().find(".teltype").val("");
            $(".fieldView", _Obj).html("");
          } else {
            if (index == 0) {
              var reptel;
              var teltype;
              var teltext;
              var telno;
              searchKey = _Obj.attr("value");
              var ds = _Obj.superContaner(
                "MultiContactList",
                searchKey,
                "LIST",
                "TEL_MGMT",
                "TEL",
                jobType
              );
              if (ds.resultData.length == 0) {
                $(".teltype", _Obj).val("");
                $(".telno", _Obj).val("");
                _Obj.attr("value", "");
                _Obj.attr("reptel", "");
                $(".pinset", _Obj).hide();
                $(".contactlines", _Obj).hide();
                $(
                  '<div class="templines"><span class="icon i-20 icon-approval mtctadd align-middle"></span><span class="align-middle mtctadd"> 연락처 추가</span></div>'
                ).appendTo(_Obj.find(".fieldEdit"));
                $(".mtctadd", _Obj).click(function () {
                  $.MultiTel(
                    "연락처 추가",
                    350,
                    "",
                    searchKey,
                    _Obj.find(".fieldEdit"),
                    function () {
                      var ds = _Obj.superContaner(
                        "MultiContactList",
                        searchKey,
                        "LIST",
                        "TEL_MGMT",
                        "TEL",
                        jobType
                      );
                      if (ds.resultData.length == 0) {
                        return;
                      }
                      $(".SelectTR").trigger("click");
                    }
                  );
                });
                return;
              }

              $(ds.resultData).each(function (index, data) {
                reptel = data.REP_TEL_FLAG;
                teltype = data.TEL_TYPE;
                teltext = $(".teltype", _Obj)
                  .val(teltype)
                  .children("option:selected")
                  .text();
                telno = data.TEL_NO;
                if (
                  data.BAD_TEL_FLAG == null ||
                  data.BAD_TEL_FLAG == undefined
                ) {
                  data.BAD_TEL_FLAG = "0";
                }
                bflag = data.BAD_TEL_FLAG;
                var _div = $(
                  "<div class='contactlines' reptel='" +
                    reptel +
                    "' badtel='" +
                    bflag +
                    "'></div>"
                ).appendTo(_Obj.find(".fieldEdit"));
                var _label = $(
                  "<span class='contactLabel align-middle'>" +
                    teltext +
                    "<span>"
                ).appendTo(_div);
                var _data = $(
                  "<span class='align-middle' style='text-decoration:none;'> : </span><span class='contactData align-middle'> " +
                    telno +
                    "</span>"
                ).appendTo(_div);
                _Obj.attr("reptel", reptel);
                if (index == 0) {
                  var _edit = $(
                    "<span class='icon i-20 extrabtn icon-xx popup align-middle'  style='float:right;'><span>"
                  ).appendTo(_div);
                } else {
                }
              });

              $(".popup", _Obj).click(function () {
                $.MultiTel(
                  "연락처 추가",
                  350,
                  "",
                  searchKey,
                  _Obj.find(".fieldEdit"),
                  function () {
                    var ds = _Obj.superContaner(
                      "MultiContactList",
                      searchKey,
                      "LIST",
                      "TEL_MGMT",
                      "TEL",
                      jobType
                    );
                    if (ds.resultData.length == 0) {
                      return;
                    }
                    $(".SelectTR").trigger("click");
                  }
                );
              });

              if (undefined != teltype && $.trim(teltype) != "") {
                var viewname = $(".teltype", _Obj)
                  .val(teltype)
                  .children("option:selected")
                  .text();
              }
              $(".telno").attr("value", telno);
              // _Obj.attr('Value', teltype +","+telno +","+reptel);
              $(".fieldView", _Obj)
                .html($(".fieldEdit", _Obj).html())
                .find(".icon-xx")
                .remove();
              $(".pinset", _Obj).hide();
            }
          }
          break;

        case "multiemail":
          var parentKey = _Obj.parents(".SuperView").attr("keyvalue");
          var jobType = _Obj.attr("jobType");
          var searchKey = "";
          if (isEmpty(parentKey)) {
            // 신규일때
            searchKey = makeUniqueKey(jobType, _M.UserInfo.id); // 유니크키
            // 생성
            // khma
            _Obj.attr("value", searchKey); // value에 검색키 셋팅
            _Obj.removeClass("fldChange").addClass("fldChange");
            _Obj.find(".fieldEdit .contactlines").remove();
            _Obj.find(".fieldEdit .templines").remove();
            _Obj.attr("repemail", "");
            $(".pinset", _Obj).show().find(".email").val("");
            $(".pinset", _Obj)
              .show()
              .find(".emailtype")
              .val("")
              .attr("value", "");
            $(".fieldView", _Obj).html("");
          } else {
            // 수정일때
            if (index == 0) {
              var emailuse;
              var emailtype;
              var emailtext;
              var email;
              searchKey = _Obj.attr("value");
              var ds = _Obj.superContaner(
                "MultiContactList",
                searchKey,
                "LIST",
                "EMAIL_MGMT",
                "EMAIL",
                jobType
              );
              if (ds.resultData.length == 0) {
                // 마스터정보에 해당하는 목록이
                // 존재하지 않을때
                $(".emailtype", _Obj).val("");
                $(".email", _Obj).val("");
                _Obj.attr("Value", "");
                _Obj.attr("repemail", "");
                $(".pinset", _Obj).hide();
                $(".contactlines", _Obj).hide();
                $(
                  '<div class="templines"><span class="icon i-20 icon-approval mtctadd align-middle"></span><span class="align-middle mtctadd"> 이메일 추가</span></div>'
                ).appendTo(_Obj.find(".fieldEdit"));
                $(".mtctadd", _Obj).click(function () {
                  $.MultiEmail(
                    "이메일 추가",
                    350,
                    "",
                    searchKey,
                    _Obj.find(".fieldEdit"),
                    function () {
                      var ds = _Obj.superContaner(
                        "MultiContactList",
                        searchKey,
                        "LIST",
                        "EMAIL_MGMT",
                        "EMAIL",
                        jobType
                      );
                      if (ds.resultData.length == 0) {
                        return;
                      }
                      $(".SelectTR").trigger("click");
                    }
                  );
                });
                return;
              }

              $(ds.resultData).each(function (index, data) {
                emailuse = data.REP_EMAIL_FLAG;
                emailtype = data.EMAIL_TYPE;
                emailtext = $(".emailtype", _Obj)
                  .val(emailtype)
                  .children("option:selected")
                  .text();
                email = data.EMAIL;
                if (
                  data.BAD_EMAIL_FLAG == null ||
                  data.BAD_EMAIL_FLAG == undefined
                ) {
                  data.BAD_EMAIL_FLAG = "0";
                }
                bflag = data.BAD_EMAIL_FLAG;
                var _div = $(
                  "<div class='contactlines' repemail='" +
                    emailuse +
                    "' bademail='" +
                    bflag +
                    "'></div>"
                ).appendTo(_Obj.find(".fieldEdit"));
                var _label = $(
                  "<span class='contactLabel align-middle'>" +
                    emailtext +
                    "<span>"
                ).appendTo(_div);
                var _data = $(
                  "<span class='align-middle' style='text-decoration:none;'> : </span><span class='contactData align-middle'> " +
                    email +
                    "</span>"
                ).appendTo(_div);
                _Obj.attr("repemail", emailuse);
                if (index == 0) {
                  var _edit = $(
                    "<span class='icon i-20 extrabtn icon-xx popup align-middle'  style='float:right;'><span>"
                  ).appendTo(_div);
                } else {
                }
              });

              $(".popup", _Obj).click(function () {
                $.MultiEmail(
                  "이메일 추가",
                  350,
                  "",
                  searchKey,
                  _Obj.find(".fieldEdit"),
                  function () {
                    var ds = _Obj.superContaner(
                      "MultiContactList",
                      searchKey,
                      "LIST",
                      "EMAIL_MGMT",
                      "EMAIL",
                      jobType
                    );
                    if (ds.resultData.length == 0) {
                      return;
                    }
                    $(".SelectTR").trigger("click");
                  }
                );
              });

              if (undefined != emailtype && $.trim(emailtype) != "") {
                var viewname = $(".emailtype", _Obj)
                  .val(emailtype)
                  .children("option:selected")
                  .text();
              }
              $(".fieldView", _Obj).html(viewname);

              $(".email").attr("value", email);
              // _Obj.attr('Value', emailtype +","+email
              // +","+emailuse);
              $(".fieldView", _Obj)
                .html($(".fieldEdit", _Obj).html())
                .find(".icon-xx")
                .remove();
              $(".pinset", _Obj).hide();
            }
          }
          break;
          
          //khma 20240329 이메일 타입 신규 추가
        case "email":
          if (typeof _value === "string")
            $("input", _Obj).val($.decHTML(_value));
          else $("input", _Obj).val(_value);
          $(".fieldView", _Obj).html(_value);
          // if (!_Obj.find('.fieldEdit').length) _Obj.html(_value);
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(_Obj.text(_value).html());
          break;
          
        case "text":
          if (typeof _value === "string")
            $("input", _Obj).val($.decHTML(_value));
          else $("input", _Obj).val(_value);
          $(".fieldView", _Obj).html(_value);
          // if (!_Obj.find('.fieldEdit').length) _Obj.html(_value);
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(_Obj.text(_value).html());
          break;
        case "password":
          $("input", _Obj).val("");
          $(".fieldView", _Obj).html("");
          if (!_Obj.find(".fieldEdit").length) _Obj.html("");
          break;
        case "passwordcheck":
          $("input", _Obj).val("");
          $(".fieldView", _Obj).html("");
          if (!_Obj.find(".fieldEdit").length) _Obj.html("");
          break;
        case "linkKey":
          _Obj.attr("linkvalue", _value);
          var _linkKey = _Obj.attr("linkfield");
          if (DataRow == undefined) {
            _value = "";
          } else {
            _value = DataRow[_linkKey];
          }

          $("input", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "linkKey2": //20240621
          _Obj.attr("linkvalue", _value);
          var _linkKey = _Obj.attr("linkfield");
          if (DataRow == undefined) {
            _value = "";
          } else {
            _value = DataRow[_linkKey];
          }

          $("input", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "linktext":
          if (index == 0) {
            $("input:eq(0)", _Obj).val(_value);
          } else if (index == 1) {
            $("input:eq(1)", _Obj).val(_value);
          } else {
            $("input", _Obj).val("");
          }
          $(".fieldView", _Obj).html(
            "[" +
              $("input:eq(0)", _Obj).val() +
              "] " +
              $("input:eq(1)", _Obj).val()
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(
              "[" +
                $("input:eq(0)", _Obj).val() +
                "] " +
                $("input:eq(1)", _Obj).val()
            );
          break;
        case "date": //
          if ($.trim(_value) != "") {
            /*
             * if (_value.indexOf('Date') > 0) { //2014년08월 이후 이슈사항 생기지
             * 않으면 삭제할것 var _o =
             * eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
             * Date($1)")); _value = _M.f.d.DateGetDate(_o); }else
             * if(_value.indexOf('Date') <=0 && _value.indexOf('-') < 2 ){
             * //오라클일때 value가number로 넘어와서 string으로 셋팅됨... var _o =
             * eval("new Date("+_value+")"); _value =
             * _M.f.d.DateGetDate(_o);
             *
             * }else if(_value.indexOf('Date') <= 0 ){ //(yyyy-mm-dd형태의
             * 스트링으로 넘어올때 //var _o = eval(new Date(_value));//lghausys
             * ie8.0 에서 하이픈- 인식오류 //_value = _M.f.d.DateGetDate(_o);
             *
             * }else{ var _o = eval(new Date(_value)); _value =
             * _M.f.d.DateGetDate(_o); }
             */
            if (_value == "" || _value == undefined) {
              // 20140407
              // jwkim date 취득
              // 처리 함수화시킴
              $("input", _Obj).val("");
            } else {
              _value = _M.f.d.DateGetDate(getDateIE8Compatible(_value));
            }
          }
          $("input", _Obj).val(_value);
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "date8": //
          $("input", _Obj).val(_M.f.c.convDate8(_value));
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "dateBetween": // : set
          /*
           * if (_value.indexOf('Date') > 0) { //2014년08월 이후 이슈사항 생기지 않으면
           * 삭제할것 var _o = eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * _value = _M.f.d.DateGetDate(_o); } else if ( _value == "" ||
           * _value == undefined ){ // 2018.08.20 dmjung :: else if 분기점
           * 추가, _value 가 없고, 탭 화면일 때 필드값에 현재 날짜가 셋팅되는 현상 방지하기 위함. //
           * TO-DO :: 테스트 케이스가 부족해서 값이 있는 경우, 없는 경우, view에서 해당 타입을 사용할 경우에
           * 대한 테스트 필요. $('input', _Obj).val(''); } else
           * if(_value.indexOf('-') < 0){ //오라클일때 value가number로 넘어와서
           * string으로 셋팅됨... var _o = eval("new Date("+_value+")"); _value =
           * _M.f.d.DateGetDate(_o); } else if(_value.indexOf('-') > 1 ){
           * //(yyyy-mm-dd형태의 스트링으로 넘어올때 var _o = eval(new Date(_value));
           * _value = _M.f.d.DateGetDate(_o); }
           */
          if (_value == "" || _value == undefined) {
            // 20140407 jwkim
            // date 취득 처리 함수화시킴
            $("input", _Obj).val("");
          } else {
            _value = _M.f.d.DateGetDate(getDateIE8Compatible(_value));
          }

          if (index == 0) {
            $("input:eq(0)", _Obj).val(_value);
          } else if (index == 1) {
            $("input:eq(1)", _Obj).val(_value);
          } else {
            $("input", _Obj).val("");
          }
          $(".fieldView", _Obj).html(
            $("input:eq(0)", _Obj).val() + " ~ " + $("input:eq(1)", _Obj).val()
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(
              $("input:eq(0)", _Obj).val() +
                " ~ " +
                $("input:eq(1)", _Obj).val()
            );
          break;
        case "datetime":
          /*
           * if (_value.indexOf('Date') > 0 && index == 0) { //2014년08월 이후
           * 이슈사항 생기지 않으면 삭제할것 var _o =
           * eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * _value = _M.f.d.DateGetDate(_o); $('input',
           * _Obj).val(_value); _valueTS = _M.f.d.DateGetTimeStamp(_o); if
           * (!_Obj.find('.fieldEdit').length){ _Obj.html(_valueTS);}; }
           * else if(_value.indexOf('Date') < 0 && index == 0) {
           *
           * var _o = eval("new Date("+_value+")"); _value =
           * _M.f.d.DateGetDate(_o); $('input', _Obj).val(_value);
           * _valueTS = _M.f.d.DateGetTimeStamp(_o); if
           * (!_Obj.find('.fieldEdit').length){ _Obj.html(_valueTS);}; }
           * else if(index == 1) { var _o =
           * eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * $('select:eq(0)', _Obj).val( (_o.getHours() < 10 ? '0' : '') +
           * _o.getHours() ); var minites = Math.floor(_o.getMinutes()/5) *
           * 5; $('select:eq(1)', _Obj).val((minites < 10 ? '0' : '') +
           * minites); //$('select:eq(0)', _Obj).val(_value.substr(0, 2));
           * //$('select:eq(1)', _Obj).val(_value.substr(2, 2)); } else {
           * $('input', _Obj).val(''); $('select:eq(0)', _Obj).val('');
           * $('select:eq(1)', _Obj).val(''); }
           */

          /* 20141226 datetime타입을 두개의 컬럼이 아닌 하나의 컬럼으로 관리 하도록 처리 Start */
          var datetimeConvert = getDateIE8Compatible(_value);
          if (_value == "" || _value == undefined) {
            // 20140407 jwkim
            // date 취득 처리 함수화시킴
            $("input", _Obj).val("");
            $("select:eq(0)", _Obj).val("");
            $("select:eq(1)", _Obj).val("");
          } else {
            var rstDate = getDateIE8Compatible(_value);
            $("select:eq(0)", _Obj).val(
              (rstDate.getHours() < 10 ? "0" : "") + rstDate.getHours()
            );
            var minites = Math.floor(rstDate.getMinutes() / 5) * 5;
            $("select:eq(1)", _Obj).val((minites < 10 ? "0" : "") + minites);
            _value = _M.f.d.DateGetDate(rstDate);
            $("input", _Obj).val(_value);
          }

          var datetimeString = "";
          if (isNotEmpty(datetimeConvert)) {
            datetimeString =
              _value +
              " " +
              datetimeConvert.getHours() +
              "시 " +
              datetimeConvert.getMinutes() +
              "분";
            $(".fieldView", _Obj).html(datetimeString);
            if (!_Obj.find(".fieldEdit").length)
              _Obj.html(_M.f.d.DateGetTimeStamp(datetimeConvert));
          }
          /* 20141226 datetime타입을 두개의 컬럼이 아닌 하나의 컬럼으로 관리 하도록 처리 End */
          /*
           * var datetimeConvert = getDateIE8Compatible(_value); if (
           * _value == "" || _value == undefined ){ //20140407 jwkim date
           * 취득 처리 함수화시킴 $('input', _Obj).val(''); $('select:eq(0)',
           * _Obj).val(''); $('select:eq(1)', _Obj).val(''); }else if
           * (index == 1) { //시분정보 var rstDate =
           * getDateIE8Compatible(_value); $('select:eq(0)', _Obj).val(
           * (rstDate.getHours() < 10 ? '0' : '') + rstDate.getHours() );
           * var minites = Math.floor(rstDate.getMinutes()/5) * 5;
           * $('select:eq(1)', _Obj).val((minites < 10 ? '0' : '') +
           * minites); } else { _value =
           * _M.f.d.DateGetDate(getDateIE8Compatible(_value)); $('input',
           * _Obj).val(_value); }
           *
           * var datetimeString = ""; if(isNotEmpty(datetimeConvert)){
           * datetimeString = _value + " " + datetimeConvert.getHours() +
           * "시 " + datetimeConvert.getMinutes() + "분"; $(".fieldView",
           * _Obj).html(datetimeString); //$('.fieldView',
           * _Obj).html($('input', _Obj).val() + ' ' + $('select:eq(0)',
           * _Obj).val() + '시 ' + $('select:eq(1)', _Obj).val() + ' 분');
           * //if (!_Obj.find('.fieldEdit').length) _Obj.html($('input',
           * _Obj).val() + ' ' + $('select:eq(0)', _Obj).val() + '시 ' +
           * $('select:eq(1)', _Obj).val() + ' 분'); if
           * (!_Obj.find('.fieldEdit').length)
           * _Obj.html(_M.f.d.DateGetTimeStamp(datetimeConvert)); }
           */
          break;
        case "datetimeBetween":
          /*
           * if (_value.indexOf('Date') > 0 && index == 0) { //2014년08월 이후
           * 이슈사항 생기지 않으면 삭제할것 var _o =
           * eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * _value = _M.f.d.DateGetDate(_o); $('input:eq(0)',
           * _Obj).val(_value); } else if (_value.indexOf('Date') < 0 &&
           * index == 0) { var _o = eval("new Date("+_value+")"); _value =
           * _M.f.d.DateGetDate(_o); $('input:eq(0)', _Obj).val(_value); }
           * else if (index == 1) { var _o =
           * eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * $('select:eq(0)', _Obj).val( (_o.getHours() < 10 ? '0' : '') +
           * _o.getHours() ); var minites = Math.floor(_o.getMinutes()/5) *
           * 5; $('select:eq(1)', _Obj).val((minites < 10 ? '0' : '') +
           * minites); } else if (_value.indexOf('Date') > 0 && index ==
           * 2) { var _o = eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * _value = _M.f.d.DateGetDate(_o); $('input:eq(1)',
           * _Obj).val(_value); } else if (_value.indexOf('Date') < 0 &&
           * index == 2) { $('input:eq(1)', _Obj).val(_value); } else if
           * (index == 3) { var _o =
           * eval(_value.replace(/\/Date\((\d+)\)\//gi, "new
           * Date($1)").replace(/\/Date\((\-\d+)\)\//gi, "new Date($1)"));
           * $('select:eq(2)', _Obj).val( (_o.getHours() < 10 ? '0' : '') +
           * _o.getHours() ); var minites = Math.floor(_o.getMinutes()/5) *
           * 5; $('select:eq(3)', _Obj).val((minites < 10 ? '0' : '') +
           * minites); } else { $('input:eq(0)', _Obj).val('');
           * $('select:eq(0)', _Obj).val(''); $('select:eq(1)',
           * _Obj).val(''); $('input:eq(1)', _Obj).val('');
           * $('select:eq(2)', _Obj).val(''); $('select:eq(3)',
           * _Obj).val(''); }
           */

          if (_value == "" || _value == undefined) {
            // 20140407 jwkim
            // date 취득 처리 함수화시킴
            $("input:eq(0)", _Obj).val("");
            $("select:eq(0)", _Obj).val("");
            $("select:eq(1)", _Obj).val("");
            $("input:eq(1)", _Obj).val("");
            $("select:eq(2)", _Obj).val("");
            $("select:eq(3)", _Obj).val("");
          } else if (index == 1) {
            // 시분정보
            var rstDate = getDateIE8Compatible(_value);
            _value = _M.f.d.DateGetDate(rstDate);
            $("input:eq(0)", _Obj).val(_value);
            $("select:eq(0)", _Obj).val(
              (rstDate.getHours() < 10 ? "0" : "") + rstDate.getHours()
            );
            var minites = Math.floor(rstDate.getMinutes() / 5) * 5;
            $("select:eq(1)", _Obj).val((minites < 10 ? "0" : "") + minites);
          } else if (index == 2) {
            // 시분정보
            var rstDate = getDateIE8Compatible(_value);
            _value = _M.f.d.DateGetDate(rstDate);
            $("input:eq(1)", _Obj).val(_value);
            $("select:eq(2)", _Obj).val(
              (rstDate.getHours() < 10 ? "0" : "") + rstDate.getHours()
            );
            var minites = Math.floor(rstDate.getMinutes() / 5) * 5;
            $("select:eq(3)", _Obj).val((minites < 10 ? "0" : "") + minites);
          } else {
            // blank
          }

          $(".fieldView", _Obj).html(
            $("input:eq(0)", _Obj).val() +
              " " +
              $("select:eq(0)", _Obj).val() +
              "시 " +
              $("select:eq(1)", _Obj).val() +
              " 분 ~ " +
              $("input:eq(1)", _Obj).val() +
              " " +
              $("select:eq(2)", _Obj).val() +
              "시 " +
              $("select:eq(3)", _Obj).val() +
              " 분"
          );
          // if (!_Obj.find('.fieldEdit').length) _Obj.html($('input',
          // _Obj).val() + ' ' + $('select:eq(0)', _Obj).val() + '시 ' +
          // $('select:eq(1)', _Obj).val() + ' 분');
          break;
        case "number":
          if (typeof _value === "string") _value = $.decHTML(_value);
          $("input", _Obj).val(_value).setComma();
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(_M.f.c.setComma(_value));
          break;
        case "money":
          if (typeof _value === "string") _value = $.decHTML(_value);
          $("input", _Obj).val(_value).setComma();
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(_M.f.c.setComma(_value));
          break;
        case "select":
          $("select", _Obj).val($.decHTML(_value));
          $("select", _Obj).change();
          // $('select', _Obj).trigger("changeCombobox");
          // $('.fieldView', _Obj).html($('select', _Obj).val());
          var cdNm = "";
          if (undefined != _value && $.trim(_value) != "")
            cdNm = $("select", _Obj).children("option:selected").text();
          $(".fieldView", _Obj).html(cdNm);

          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "textarea":
          $("textarea", _Obj).val($.decHTML(_value));
          var _fldheight = $("textarea", _Obj).height();
          var _fldview = $(".fieldView", _Obj).html(
            '<pre class="readonlyPre input-bg" style="height:' +
              _fldheight +
              'px">' +
              _value +
              "</pre>"
          );
          // CSS JDM_fldview.parent().css("overflow","auto");
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;

        case "codeEditor":
          var cmInst = _Obj.data("CodeMirrorInstance");
          cmInst.setValue($.decHTML(_value));

          var _fldheight = $("textarea", _Obj).height();
          var _fldview = $(".fieldView", _Obj).html(
            '<pre class="readonlyPre input-bg" style="height:' +
              _fldheight +
              'px">' +
              _value +
              "</pre>"
          );
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);

          break;

        case "textedit":
          $("textarea", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "tel":
          // if (index==0) $('select:eq(0)', _Obj).val(_value);
          // if (index==1) $('input:eq(0)', _Obj).val(_value);
          // if (index==2) $('input:eq(1)', _Obj).val(_value);
          if (index == 0) {
            $("select:eq(0)", _Obj).val(_value);
          } else if (index == 1) {
            $("input:eq(1)", _Obj).val(_value);
          } else if (index == 2) {
            $("input:eq(2)", _Obj).val(_value);
          } else {
            $("input, select", _Obj).val("");
          }

          $(".fieldView", _Obj).html(
            $("select:eq(0)", _Obj).val() +
              " " +
              $("input:eq(0)", _Obj).val() +
              " " +
              $("input:eq(1)", _Obj).val()
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(
              $("select:eq(0)", _Obj).val() +
                " " +
                $("input:eq(0)", _Obj).val() +
                " " +
                $("input:eq(1)", _Obj).val()
            );

          break;
        case "multicombo":
          var DataArr = [];
          if (index != undefined) {
            // New(clear)일때 데이터가 안지워 지는 현상이 있어서
            // 수정
            $("input:eq(" + index + ")", _Obj).val(_value);
          } else {
            $("input", _Obj).each(function (index) {
              $("input:eq(" + index + ")", _Obj).val(_value);
            });
          }

          $("input", _Obj).each(function (index) {
            DataArr.push($(this).val());
          });
          _retVal = DataArr.join(",");
          $(".fieldView", _Obj).html(_retVal);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_retVal);
          break;
        case "multilist":
          var DataArr = [];
          if (index != undefined) {
            // New(clear)일때 데이터가 안지워 지는 현상이 있어서
            // 수정
            $("input:eq(" + index + ")", _Obj).val(_value);
          } else {
            $("input", _Obj).each(function (index) {
              $("input:eq(" + index + ")", _Obj).val(_value);
            });
          }

          $("input", _Obj).each(function (index) {
            DataArr.push($(this).val());
          });
          _retVal = DataArr.join(",");
          $(".fieldView", _Obj).html(_retVal);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_retVal);
          break;
        case "phone":
          $("input", _Obj).val(_value);
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "zip":
          // if (index==0) $('input:eq(0)', _Obj).val(_value);
          // if (index==1) $('input:eq(1)', _Obj).val(_value);
          // if (index==2) $('input:eq(2)', _Obj).val(_value);
          var decValue = $.decHTML(_value);
          if (index == 0) {
            $("input:eq(0)", _Obj).val(decValue);
            /*
						if (decValue.length > 0) {
							$('input:eq(0)', _Obj).val(decValue.substring(0, 3) + '-'+ decValue.substring(3, 6)); 
						} else {
							$('input:eq(0)', _Obj).val(decValue);
						}
						*/
          } else if (index == 1) {
            $("input:eq(1)", _Obj).val(decValue);
          } else if (index == 2) {
            $("input:eq(2)", _Obj).val(decValue);
          } else {
            $("input", _Obj).val("");
          }
          $(".fieldView", _Obj).html(
            $("input:eq(0)", _Obj).val() +
              " " +
              $("input:eq(1)", _Obj).val() +
              " " +
              $("input:eq(2)", _Obj).val()
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(
              $("input:eq(0)", _Obj).val() +
                " " +
                $("input:eq(1)", _Obj).val() +
                " " +
                $("input:eq(2)", _Obj).val()
            );
          break;
        case "zipone":
          var decValue = $.decHTML(_value);
          if (index == 0) {
            // $('input:eq(0)', _Obj).val(_value);
            if (decValue != undefined && decValue != "") {
              decValue =
                decValue.substring(0, 3) + "-" + decValue.substring(3, 6);
            }
            // $('input:eq(0)', _Obj).val(decValue); //20140331 우편번호
            // -표시로 인한 수정사항
          } else if (index == 1) {
            $("input:eq(1)", _Obj).val(decValue);
          } else {
            $("input", _Obj).val("");
          }
          // var viewText = $(".fieldView", _Obj).html();
          // viewText += _value;
          // $(".fieldView", _Obj).html(viewText);
          $(".fieldView", _Obj).html(
            $("input:eq(0)", _Obj).val() + " " + $("input:eq(1)", _Obj).val()
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(
              $("input:eq(0)", _Obj).val() + " " + $("input:eq(1)", _Obj).val()
            );
          break;

        case "radio":
          // $("input[value='']", _Obj).attr("checked", "checked");
          $("input[value='" + _value + "']", _Obj).prop("checked", true);
          if (_value == "") {
            $("input", _Obj).removeAttr("checked");
          }
          var cdNm = "";
          // $('.fieldView', _Obj).html(_value);
          // if(undefined != _value && $.trim(_value) !='') cdNm =
          // $("input:radio:checked", _Obj).next().text(); //20140916
          // 뷰모드시에 제대로 동작안함
          if (undefined != _value && $.trim(_value) != "")
            cdNm = $("input:checked", _Obj).next().text();
          // $('.fieldView', _Obj).html(cdNm);

          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;

        case "check":
          // $('input', _Obj).attr("checked", _value == "1" ? true :
          // false);
          $("input", _Obj).prop("checked", _value == "1" ? true : false);
          var cdNm = "";
          // $('.fieldView', _Obj).html(_value);
          if (undefined != _value && $.trim(_value) != "")
            cdNm =
              "<span class='icon i-20 icon-approval'></span>" +
              $("input:checkbox:checked", _Obj).next().text();
          // $('.fieldView', _Obj).html( cdNm);

          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "iconcheck":
          var _oc = _Obj.find(".cmdicon");
          if (_value == "1") {
            _oc
              .removeClass(_Obj.attr("unselectIcon"))
              .addClass(_Obj.attr("selectIcon"));
            $(".fieldView", _Obj).html(
              "<span class='cmdicon icon i-20 " +
                _Obj.attr("selectIcon") +
                "></span>"
            );
            if (!_Obj.find(".fieldEdit").length)
              _Obj.html(
                "<span class='cmdicon " + _Obj.attr("selectIcon") + "></span>"
              );
          } else {
            _oc
              .removeClass(_Obj.attr("selectIcon"))
              .addClass(_Obj.attr("unselectIcon"));
            $(".fieldView", _Obj).html(
              "<span class='cmdicon icon i-20 " +
                _Obj.attr("unselectIcon") +
                "></span>"
            );
            if (!_Obj.find(".fieldEdit").length)
              _Obj.html(
                "<span class='cmdicon icon i-20 " +
                  _Obj.attr("unselectIcon") +
                  "></span>"
              );
          }
          break;
        case "multicheck":
          var dataArr = _value.split(",");
          $("input", _Obj).prop("checked", false);
          $.each(dataArr, function (index, value) {
            // $.each($("input[value='" + value + "']", _Obj),
            // function(index, value){
            // $(this).attr("checked", true);
            //
            // });
            $("input[value='" + value + "']", _Obj).prop("checked", true);
          });
          // $('.fieldView', _Obj).html(_value); //20150129 디자인 체크박스 그대로
          // 보이도록 변경 jwkim

          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "multiiconcheck":
          var dataArr = _value.split(",");
          _Obj
            .find(".cmdicon")
            .removeClass(_Obj.attr("selectIcon"))
            .addClass(_Obj.attr("unselectIcon"));
          $.each(dataArr, function (index, value) {
            _Obj
              .find(".cmdicon[value='" + value + "']")
              .addClass(_Obj.attr("selectIcon"));
          });
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "context": // context
          $("input", _Obj).val(_value);
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "chkselect":
          $("input", _Obj).val(_value);
          $(".fieldView", _Obj).html($("input", _Obj).val());
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "slider": //
          $("input", _Obj).val(_value).trigger("change");
          $(".fieldView .slider", _Obj).slider("value", _value);

          // $('.fieldView',_Obj).html($('input', _Obj).val());
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "textword":
          /*
           * try { $('textarea', _Obj).val(_value).trigger('change'); }
           * catch (e1) { }
           */
          var editor = tinyMCE.get(_Obj.find("textarea").attr("id"));
          var _decValue = $.decHTML(_value)
            .replace(/\s/g, " ")
            .replace(/<script[^>]*>(.*?)<\/script>/gi, ""); //todo 2015-05-20 hycho : 정규식을 이용한 스크립트태그 제거 XSS 취약점 대응
          if (undefined != editor) {
            editor.setContent(_decValue); // khma 20181023
            // 에디터변경으로 수정
          } else {
            // setTimeout(function(){
            // tinymce.activeEditor.setContent(_value); //khma 20181031
            // 에디터변경으로 수정
            // },500);
          }
          var _fldview = $(".fieldView", _Obj).html(_decValue); //todo 현재 textarea를 통해 표시하고 있지만 차후 에디터자체로 표시하도록 처리해야됨.
          if (_fldview.parent().attr("readonly") == "readonly") {
            _fldview.parent().css("overflow-y", "scroll");
          }

          if (!_Obj.find(".fieldEdit").length) {
            // superTable일때에
            // fieldEdit가 없으므로 대응하기
            // 위한 처리
            _Obj.html(_value); // khma 20181023 에디터변경으로 수정
          }
          break;
        case _M.DataType.img:
          $(".fieldEdit img", _Obj).attr("src", _value);
          $(".fieldView img", _Obj).attr("src", _value);

          var _sizewidth = _Obj.attr("sizewidth");
          if (_sizewidth == undefined) {
            _sizewidth = "100%";
          }
          var _sizeheight = _Obj.attr("sizeheight");
          if (_sizeheight == undefined) {
            _sizeheight = "100%";
          }

          if (!_Obj.find(".fieldEdit").length) {
            _Obj.html(
              "<img src='" +
                _value +
                "' style='width:" +
                _sizewidth +
                ";height:" +
                _sizeheight +
                ";' />"
            );
          }
          break;
        case "qr":
          /*if (_value == "") {
						$('.fieldEdit img', _Obj)
								.attr(
										'src',
										'http://chart.apis.google.com/chart?cht=qr&chs=500x500&chl=http://222.234.0.180/');
						$('.fieldView img', _Obj)
								.attr(
										'src',
										'http://chart.apis.google.com/chart?cht=qr&chs=500x500&chl=http://222.234.0.180/');
					} else {
						$('.fieldEdit img', _Obj).attr(
								'src',
								"http://chart.apis.google.com/chart?cht=qr&chs=500x500&chl="
										+ _value);
						$('.fieldView img', _Obj).attr(
								'src',
								"http://chart.apis.google.com/chart?cht=qr&chs=500x500&chl="
										+ _value);
					}
					if (!_Obj.find('.fieldEdit').length)
						_Obj.html("<img src='" + _value + "' />");*/
          break;
        case "file":
          _o = $(".fldfiledown", _Obj);
          _o.removeClass("fileSelect fileAttch");
          var _htm = "";
          if (_value == "") {
            _htm = "<a>파일없음</a>";
          } else {
            _htm = "<a href='" + _value + "'>다운로드</a>";
          }
          _o.html(_htm);
          $(".fieldView", _Obj).html(_htm);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_htm);

          break;
        case "zipfile":
          var _htm = $("<a id='zipDown'></a>");

          _Obj.append(_htm);

          if (_value == "") {
            _Obj.find("a").text("파일없음");
          } else {
            _Obj
              .find("a")
              .text("다운로드")
              .attr("skey", _value)
              .attr(
                "href",
                _M.urlPath +
                  "/" +
                  _M.svcUrl[_M.Webtype].zipFileDownload +
                  "?skey=" +
                  _value
              );
          }
          break;
        case "signfile": //20240619
           _o = $(".fldfiledown", _Obj);
          _o.removeClass("fileSelect fileAttch");
          _o.find("input").remove();
          _o.find("ul").remove();
          var _htm = "";
          if (_value == "") {
            var timestamp = new Date().getTime(); // 20170717
           // var fileSearchKey =
              //_M.UserInfo.id.toString() + timestamp.toString();
            _htm =
              "<input id ='fileSearchKey' name='fileSearchKey' mode='new' type='hidden' value='' />";
            $(".tempdiv")
              .css("padding", "0px 0px")
              .css("border-top", "0px solid transparent")
              .css("margin-top", "0px");
            // _htm += "<ul><li>파일없음</li></ul>";

            $(_htm).appendTo(_o);
            // _o.append(_htm);
            $(".fieldView input", _Obj).remove();
            $(".fieldView ul", _Obj).remove();
            $(".fieldView .fldfiledown", _Obj).append(_htm);
            // $("#MainView
            // .fieldContaner[field='ATTC_FILE_KEY']").removeClass("fldChange").addClass("fldChange");
            $(this).removeClass("fldChange").addClass("fldChange");
            $(this).attr("value", fileSearchKey);

            // if (!_Obj.find('.fieldEdit').length) _Obj.html(_htm);
          } else {
            $(".tempdiv")
              .css("padding", "6px 0px")
              .css("border-top", "2px solid #000")
              .css("margin-top", "6px")
              .css("width", "350px");
            _htm =
              "<input id ='fileSearchKey' name='fileSearchKey' mode='modify' type='hidden' value='' /><input id ='uploadYn' name='' type='hidden' value='' />";
            _o.append(_htm);
            $(".fieldView input", _Obj).remove();
            $(".fieldView .fldfiledown", _Obj).append(_htm);
            if (!_Obj.find(".fieldEdit").length) _Obj.html(_htm);
            // 파일목록을 뿌린다.
            var _file = _o.parents(".fieldEdit");
            var fileSearchKey = _file.find("#fileSearchKey").attr("value");
            var jobType = _file.attr("jobType");
            _Obj.superContaner(
              "GetSignFileList",
              _file,
              jobType,
              fileSearchKey
            );
          }

          break;
        case "multifile":
          // :: set multifile
          _o = $(".fldfiledown", _Obj);
          _o.removeClass("fileSelect fileAttch");
          _o.find("input").remove();
          _o.find("ul").remove();
          var _htm = "";
          if (_value == "") {
            var timestamp = new Date().getTime(); // 20170717
            var fileSearchKey =
              _M.UserInfo.id.toString() + timestamp.toString();
            _htm =
              "<input id ='fileSearchKey' name='fileSearchKey' mode='new' type='hidden' value='" +
              fileSearchKey +
              "' />";
            $(".tempdiv")
              .css("padding", "0px 0px")
              .css("border-top", "0px solid transparent")
              .css("margin-top", "0px");
            // _htm += "<ul><li>파일없음</li></ul>";

            $(_htm).appendTo(_o);
            // _o.append(_htm);
            $(".fieldView input", _Obj).remove();
            $(".fieldView ul", _Obj).remove();
            $(".fieldView .fldfiledown", _Obj).append(_htm);
            // $("#MainView
            // .fieldContaner[field='ATTC_FILE_KEY']").removeClass("fldChange").addClass("fldChange");
            $(this).removeClass("fldChange").addClass("fldChange");
            $(this).attr("value", fileSearchKey);

            // if (!_Obj.find('.fieldEdit').length) _Obj.html(_htm);
          } else {
            $(".tempdiv")
              .css("padding", "6px 0px")
              .css("border-top", "2px solid #000")
              .css("margin-top", "6px");
            _htm =
              "<input id ='fileSearchKey' name='fileSearchKey' mode='modify' type='hidden' value='" +
              _value +
              "' />";
            _o.append(_htm);
            $(".fieldView input", _Obj).remove();
            $(".fieldView .fldfiledown", _Obj).append(_htm);
            if (!_Obj.find(".fieldEdit").length) _Obj.html(_htm);
            // 파일목록을 뿌린다.
            var _file = _o.parents(".fieldEdit");
            var fileSearchKey = _file.find("#fileSearchKey").attr("value");
            var jobType = _file.attr("jobType");
            _Obj.superContaner(
              "GetMultiFileList",
              _file,
              jobType,
              fileSearchKey
            );
          }

          break;
        case "readOnly": //
          _Obj.html(_value);
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "time":
          $("select:eq(0)", _Obj).val(_value.substr(0, 2));
          $("select:eq(1)", _Obj).val(_value.substr(2, 2));
          $(".fieldView", _Obj).html(
            _value.substr(0, 2) + "시 " + _value.substr(2, 2) + " 분"
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html(
              _value.substr(0, 2) + "시 " + _value.substr(2, 2) + " 분"
            );
          break;
        case "month":
          $("select:eq(0)", _Obj).val(_value);
          $(".fieldView", _Obj).html(_value + "월");
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value + "월");
          break;
        case "year":
          $("select:eq(0)", _Obj).val(_value);
          $(".fieldView", _Obj).html(_value + "년");
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value + "년");
          break;

        case "map":
          $("input", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          break;
        case "url":
          if (index == 0) {
            $("input", _Obj).val($.decHTML(_value));
            $(".fieldView", _Obj).html(
              "<a href='" + _value + "' target='_self'>" + _value + "</a>"
            );
            if (!_Obj.find(".fieldEdit").length)
              _Obj.html(
                "<a href='" + _value + "' target='_blank'>" + _value + "</a>"
              );
          } else if (index == 1) {
            $(".fieldView a", _Obj).text($.decHTML(_value));
          }
          break;
        case "mail":
          $("input", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(
            "<a href='mailto:" + _value + "' >" + _value + "</a>"
          );
          if (!_Obj.find(".fieldEdit").length)
            _Obj.html("<a href='mailto:" + _value + "' >" + _value + "</a>");
          break;
        case "sms":
          $("textarea", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          $("textarea", _Obj).trigger("keyup");
          break;
        case "lms":
          $("textarea", _Obj).val($.decHTML(_value));
          $(".fieldView", _Obj).html(_value);
          if (!_Obj.find(".fieldEdit").length) _Obj.html(_value);
          $("textarea", _Obj).trigger("keyup");
          break;
        case "sticker":
          _Obj.val(_value);
          if (
            _value == "" ||
            _value == undefined ||
            _value == "icon-sortdesc" ||
            _value == "calicon-noicon"
          ) {
            if (_value == "calicon-noicon") _value = "icon-sortdesc";
            _Obj.find(".caliconText").show();
            $(".caliconSelect").css("width", "50px").css("text-align", "left");
          } else {
            _Obj.find(".caliconText").hide();
            $(".caliconSelect")
              .css("width", "20px")
              .css("text-align", "center");
          }
          _Obj.next().find("input").css("width", "100%");
          _Obj.find(".icon").addClass(_value).attr("css", _value);
          break;
        default:
          _Obj.html(_value);
          // _Obj.html(_Obj.text(_value).html());
          break;
      }

      if (_Obj.attr("errFlgField") != undefined && DataRow != undefined) {
        // TODO errFldField 옵션이 존재할때에는 해당 옵션에 해당하는 컬럼의 값을 체크한다.
        if ("1" == DataRow[_Obj.attr("errFlgField")]) {
          // TODO 체크값이 1일경우는 오류데이터CSS를 지정
          $(".fieldView", _Obj).css({
            color: "red",
            "text-decoration": "line-through",
          });
        } else {
          // TODO 체크값이 0일경우는 지정하지 않음
          $(".fieldView", _Obj).css({
            color: "black",
            "text-decoration": "blink",
          });
        }
      }
    },

    /* ------------------------------------------------------- */
    /* default 초기값으로 화면을 초기화함 */
    /* ------------------------------------------------------- */
    SetDefault: function () {
      var _Obj = $(this);
      _json = $(this).data("jsonData");
      // --------------------------------------------------------
      // 초기값이 있는 경우 초기화 실시
      // $(".fieldContaner[defaultValue != undefined]",
      // _Obj).each(function (e) {
      $(".fieldContaner", _Obj).each(function (e) {
        var pl = {};
        if ($(this).attr("defaultValue") != undefined) {
          _field = $(this).attr("field");
          _value = $(this).attr("defaultValue");
          _type = $(this).attr("type");
          _linkfield = $(this).attr("linkfield");

          _Display = "";
          switch (_value) {
            case "TODAY":
              _value = _M.f.d.getDate();
              break;
            case "YEAR":
              var year = _M.f.d.getDate().split("-");
              _value = year[0];
              break;
            case "MONTH":
              var month = _M.f.d.getDate().split("-");
              _value = month[1];
              break;
            case "TIME":
              _value = _M.f.d.getTime();
              break;
            case "DATETIME":
              _value = _M.f.d.getTimeStamp();
              break;
            case "UNM":
              _value = _M.UserInfo.name;
              break;
            case "UID":
              _value = _M.UserInfo.id;
              _Display = _M.UserInfo.name;
              pl = eval("({" + _linkfield + ':"' + _Display + '"})'); // records 객체처럼 임의로 만들어서
              // 전송하여줌.
              break;
            case "UDEPART":
              _value = _M.UserInfo.depart;
              _Display = _M.UserInfo.departnm;
              pl = eval("({" + _linkfield + ':"' + _Display + '"})'); // records 객체처럼 임의로 만들어서
              // 전송하여줌.
              break;
          }

			if (_type == "datetime" && _value == "NOW") {
			  //_Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 0, pl);
			  //_Obj.superContaner("changeValue", $(this), _M.f.d.getTime(), 1, pl);
			  $(this).find('.icon-clock').click();
			} else if (_type == "datetimeBetween" && _value == "NOW") {
			  _Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 0, pl);
			  _Obj.superContaner("changeValue", $(this), _M.f.d.getTime(), 1, pl);
			  _Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 2, pl);
			  _Obj.superContaner("changeValue", $(this), _M.f.d.getTime(), 3, pl);
			} else if (_type == "dateBetween" && _value == "NOW") {
			  _Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 0, pl);
			  _Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 1, pl);
			} else if (_type == "dateBetween" && isNotEmpty(_value)) {
				if(_value.substring(0,1).toLowerCase() == "y"
					|| _value.substring(0,1).toLowerCase() == "m"
					|| _value.substring(0,1).toLowerCase() == "d"
					) {
					_Obj.superContaner("changeValue", $(this), _M.f.d.getDateChange(_value), 0, pl);
					_Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 1, pl);
					
				} else if (_value.substring(0,2).toLowerCase() == "fy"
					|| _value.substring(0,2).toLowerCase() == "fm"
					) {
					_Obj.superContaner("changeValue", $(this), _M.f.d.getFDateChange(_value), 0, pl);
					_Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 1, pl);
					
				} else if (_value.substring(0,2).toLowerCase() == "by"
					|| _value.substring(0,2).toLowerCase() == "bm"
					) {
					_Obj.superContaner("changeValue", $(this), _M.f.d.getDate(), 0, pl);
					_Obj.superContaner("changeValue", $(this), _M.f.d.getDateChange(_value.substring(1,4).toLowerCase()), 1, pl);
				} 
			} else {
			  _Obj.superContaner("changeValue", $(this), _value, 0, pl);
			}
        }
      });
      // Sub View페이지에서 상위객체 초기화가 있다면 처리한다
      if (_json.parentKey != undefined) {
        if (_json.parentSetDefault != undefined)
          eval(_json.parentSetDefault)(_Obj.attr("parentKeyValue"), _Obj);
      }
    },
    /* ------------------------------------------------------- */
    /* 외부에서 호출하여 필드값을 변경시킨다. */
    /* ------------------------------------------------------- */
    changeValue: function (fieldContaner, _value, index, Rows) {
      _type = fieldContaner.attr("type");
      _oldValueBak = fieldContaner.attr("oldValue");
      fieldContaner.superContaner("setFieldValue", _value, index, Rows);
      fieldContaner.attr("oldValue", _oldValueBak).trigger("change");
    },
    /* ------------------------------------------------------- */
    /* 외부에서 호출하여 필드값을 변경시킨다. */
    /* ------------------------------------------------------- */
    changeField: function (fieldName, _value, index, Rows) {
      fieldContaner = $(".fieldContaner[field='" + fieldName + "']", $(this));
      if (fieldContaner == undefined) return;
      _type = fieldContaner.attr("type");
      _oldValueBak = fieldContaner.attr("oldValue");
      fieldContaner.superContaner("setFieldValue", _value, index, Rows);
      fieldContaner.attr("oldValue", _oldValueBak).trigger("change");
    },

    /* ------------------------------------------------------- */
    /* DataService */
    /* ------------------------------------------------------- */
    serviceCall: function (method, pl) {
      var _Obj = $(this);
      option = $(this).data("jsonData");
      alert(option.method.Read);
      // PostJsonData(_M.svcUrl.crudUrl, pl, function (response) {
      // $("#hm").html($.Json2Str(response));
      // $("#hm2").html(response.Table.Rows[0]["날짜"]);
      // }, function (response) {
      // $("#hm").html('Error : ' + response.Message);
      // }, false);
    },
    /* ------------------------------------------------------- */
    /* 버전 도움말 */
    /* ------------------------------------------------------- */
    /* ------------------------------------------------------- */
    /* 메뉴처리 */
    /* ------------------------------------------------------- */

    SetPageContaner: function (_jsonName) {
      if (_jsonName == "keep") return;
      $(this).empty().removeAttr("style").removeAttr("jsonname").removeClass();
      if (_jsonName == undefined || _jsonName == "") return;
      if (_jsonName == "clear") return;

      var jsonNameStr = "";
      if (typeof _jsonName == "string") {
        option = GETJSON(_jsonName);
        jsonNameStr = _jsonName;
      }
      if (option == undefined) {
        option = _jsonName;
      }
      if (option == undefined) {
        option = viewOption;
      }
      var _ContanerType = option.ContanerType;

      if (_ContanerType == undefined) {
        alert(
          "[" +
            _jsonName +
            "] 구조체의 ContanerType이 지정되어 있지 않습니다. Type을 지정하세요."
        );
        /*
         * if (option.imgSize != undefined) { _ContanerType =
         * "superGallery"; } else if (option.colModel != undefined) {
         * _ContanerType = "superTable"; } else { _ContanerType =
         * "superView"; }
         */
      }
      if (jsonNameStr != "") $(this).attr("jsonName", jsonNameStr);

      switch (_ContanerType) {
        case "campaignWorkFlow":
          $(this).campaignWorkFlow("makePanel", option, $(this));
          break;
        default:
          $(this).superContaner(_ContanerType, option);
          break;
      }
    },
    getJson: function (oCmd) {
      if (oCmd.parents(".gs-wd").length > 0) {
        //위젯일 경우 우선적으로 처리함.
        var wd = oCmd.parents(".gs-wd");
        _nm = wd.attr("id");
        $.JsonEditPop(_nm);
      } else if ($(this).attr("jsonName") != undefined) {
        _nm = $(this).attr("jsonName");
        // _js = $.Json2Str($(this).data("jsonData"));
        $.JsonEditPop(_nm);
      }
    },
    testJson: function (Str) {
      $.TestJson(Str);
    },
    ActionCmd: function () {
      _o = $(this);
      _Obj = _o.parents(".SuperContaner");
      _clickAction = _o.attr("Action");

      if (_clickAction != undefined) {
        _option = _Obj.data("jsonData");
        if (_option != undefined) {
          eval("_option." + _clickAction)(_o, _Obj);
        }
      }
    },

    /* ----------------------------------------------------------------------------- */
    // 구조체권한검색
    /* ----------------------------------------------------------------------------- */
    SecurityCheck: function () {
      _Obj = $(this);
      var option = $(this).data("jsonData");
      var sRlt = true;
      option.Security ? option.Security : undefined;
      if (option.Security != undefined) {
        var pl = new JSONClientParameters();
        pl.add("모듈명", option.Security.Module);
        $.SvcCallPl(
          "M_ROLE_MODULE",
          "READ",
          pl,
          function (data) {
            if (data.resultData.length == 0) {
              $(
                "<div class='SuperSecurity'><h3>접근권한이 없습니다.</h3></div>"
              ).appendTo(_Obj);
              sRlt = false;
              return;
            }
            if (data.resultData[0]["SECU_LEVEL"] < option.Security.Level) {
              $(
                "<div class='SuperSecurity'><h3>현재보안등급으로는 권한이 없습니다.</h3></div>"
              ).appendTo(_Obj);
              sRlt = false;
              return;
            }
            if (data.resultData[0]["READ_FLAG"] == 0) {
              $(
                "<div class='SuperSecurity'><h3>구조체를 사용하기 위한 최소한의 조회권한이 없습니다.</h3></div>"
              ).appendTo(_Obj);
              sRlt = false;
              return;
            }
            option.Security.Permissions.C =
              data.resultData[0]["CREATE_FLAG"] > 0 ? true : false;
            option.Security.Permissions.R =
              data.resultData[0]["READ_FLAG"] > 0 ? true : false;
            option.Security.Permissions.U =
              data.resultData[0]["UPDATE_FLAG"] > 0 ? true : false;
            option.Security.Permissions.D =
              data.resultData[0]["DELETE_FLAG"] > 0 ? true : false;
            option.Security.Permissions.M =
              data.resultData[0]["MANAGEMENT"] > 0 ? true : false;
            option.Security.Permissions.S = data.resultData[0]["SECU_LEVEL"];
            $(this).data("jsonData", option);
          },
          _M.aSync.sync
        );

        if (sRlt == false) {
          $(
            "<div class='SuperSecurityGetJson'><a>구조체확인</a></div>"
          ).appendTo(_Obj);
        }
      }
      return sRlt;
    },

    /* ----------------------------------------------------------------------------- */
    // getMultiFileList
    /* ----------------------------------------------------------------------------- */
    GetMultiFileList: function (obj, jobType, fileSearchKey, callBackFn) {
      // obj : fieldEdit객체 :: list
      var pl = new JSONClientParameters();
      pl.add("service", "MON_COMMON");
      pl.add("method", "MULTIFILE_LIST");
      pl.add("USITE", _M.UserInfo.SID);
      pl.add("UID", _M.UserInfo.id);
      pl.add("JOB_TYPE", jobType);
      pl.add("FILE_SEARCH_KEY", fileSearchKey);
      var ulTag = "<ul>";
      var liTag = "";
      PostJsonData(
        _M.svcUrl[_M.Webtype].crudUrl,
        pl,
        function (_data) {
          var rstData = _data.resultData;
          for (var i = 0, j = rstData.length; i < j; i++) {
            var f = rstData[i];
            liTag +=
              "<li class='filelist' title='" +
              f.FILE_NAME +
              "' style='padding:1px 0px; margin:3px 0px; font-weight:bold;'><a href='" +
              _M.svcUrl[_M.Webtype].fileDownload +
              "?fid=" +
              f.M_FILE_MGMT_NO +
              "'><span class='icon i-20 icon-downward align-middle'></span> <label class='align-middle' style='height:20px; line-height:20px; font-weight:bold; color:initial; cursor:pointer;'>" +
              f.FILE_NAME +
              "</label></a><label class='align-middle' style='height:20px; line-height:20px; font-weight:normal; font-size:10px;'> (" +
              _M.f.c.setComma((f.FILE_SIZE / 1024).toString().substring(0, 5)) +
              "kb)</label></li>";
          }

          if (undefined == rstData || rstData.length <= 0) {
            // liTag +="<li class='filelist'>파일없음</li>";
            $(".tempdiv")
              .css("padding", "0px 0px")
              .css("border-top", "0px solid transparent")
              .css("margin-top", "0px");
          }
        },
        function () {
          alert("예상하지 못한 에러가 발생하였습니다.");
        },
        false
      );

      ulTag += liTag + "</ul>";
      var _o = $(".fldfiledown", obj);

      _o.find("ul").remove();
      // _o.find('li').remove();
      // $(uiTag).appendTo(_o);
      _o.append(ulTag);
      // _o.append(liTag);
      var _fieldContaner = obj.parents(".fieldContaner");
      var _fieldView = _fieldContaner.find(".fieldView .fldfiledown");
      // _fieldView.find('ui').remove();
      _fieldView.find("ul").remove();
      _fieldView.append(ulTag);
      _fieldContaner.attr("value", fileSearchKey);
      option = _fieldContaner.parents(".SuperView").data("jsonData");
      if (option.isEditMode) {
        _fieldContaner.removeClass("fldChange").addClass("fldChange");
      }
    },
    

	//계약 파일 목록 조회 20240619
	GetSignFileList : function(obj, jobType, callBackFn, fileSearchKey) {
		
			if(fileSearchKey == undefined || fileSearchKey == ""){
				var readKey = $(".fieldContaner[field='FILE_SEARCHKEY']").attr('value');
				if(readKey != ""){
					fileSearchKey = readKey;
				}else{
					return false;
				}	
			}

			var pl = new JSONClientParameters();
			pl.add("service", "MON_COMMON");
      		pl.add("method", "SIGNFILE_LIST");
			pl.add("UPPER_INFO", fileSearchKey);
			pl.add("_viewpage", 1);
			pl.add("_pagecnt", 999);
			var ulTag = "<ul>";
			var liTag = "";
			
			PostJsonData(
		        _M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {

					var rstData = _data.resultData;
					for (var i = 0, j = rstData.length; i < j; i++) {
						var f = rstData[i];
						liTag += "<li class='filelist' title='"
								+ f.FILE_NAME
								+ "' style='padding:1px 0px; margin:3px 0px; font-weight:bold;'><a href='"
								+ _M.svcUrl[_M.Webtype].signFileDownload
								+ "?fid="
								+ f.M_IMAGE_GAL_NO
								+ "'><span class='icon i-20 icon-downward align-middle'></span> <label class='align-middle' style='height:20px; line-height:20px; font-weight:bold; color:initial; cursor:pointer;'>"
								+ f.FILE_NAME
								+ "</label></a><label class='align-middle' style='height:20px; line-height:20px; font-weight:normal; font-size:10px;'> ("
								+ _M.f.c.setComma((f.FILE_SIZE / 1024).toString().substring(0, 5))
									  
								+ "kb)</label>"
								//+ "<a href='"+ _M.svcUrl[_M.Webtype].signFileDelete + "?fid=" + f.M_IMAGE_GAL_NO + "&uid=" + _M.UserInfo.id +"'>"
								//+ "<span class='icon i-20 icon-cancel align-middle'></span></a>"
								+ "</li>";
					}

					if (undefined == rstData || rstData.length <= 0) {
						// liTag +="<li class='filelist'>파일없음</li>";
						$('.tempdiv').css('padding', '0px 0px').css('border-top', '0px solid transparent').css('margin-top', '0px');
												   
							 
					}
			}, function() {
				alert("예상하지 못한 에러가 발생하였습니다.");
			}, false);
			

			ulTag += liTag + "</ul>";
			var _o = $('.fldfiledown', obj);

			_o.find('ul').remove();
			// _o.find('li').remove();
			// $(uiTag).appendTo(_o);
			_o.append(ulTag);
			// _o.append(liTag);
			var _fieldContaner = obj.parents(".fieldContaner");
			var _fieldView = _fieldContaner.find(".fieldView .fldfiledown");
			// _fieldView.find('ui').remove();
			_fieldView.find('ul').remove();
			_fieldView.append(ulTag);
			_fieldContaner.attr("value", fileSearchKey);
			option = _fieldContaner.parents(".SuperView").data("jsonData");
			if (option.isEditMode) {
				_fieldContaner.removeClass("fldChange").addClass("fldChange");
			}

		},
		

    /* ----------------------------------------------------------------------------- */
    // AutoSearch
    /* ----------------------------------------------------------------------------- */
    AutoSearch: function (Method, fldType) {
      var SuperAuto = $(this);
      SuperAuto.autocomplete({
        source: function (request, response) {
          var pl = new JSONClientParameters();
          pl.add("service", "MON_AUTOSEARCH");
          pl.add("method", Method);
          pl.add("findtxt", SuperAuto.val());
          PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {
            response(
              $.map(_data.resultData, function (item) {
                return {
                  label: item.KEYNAME,
                  value: item.KEYNAME,
                  key_value: item.KEYID,
                };
              })
            );
          });
        },
        minLength: 2,
        select: function (event, ui) {
          SuperAuto.parents(".fieldContaner").attr(
            "linkvalue",
            ui.item.key_value
          );
          SuperAuto.parents(".fieldContaner").trigger("change");
        },
        open: function (event, ui) {
          // $( this ).removeClass( "ui-corner-all" ).addClass(
          // "ui-corner-top" );
        },
        close: function () {
          // $( this ).removeClass( "ui-corner-top" ).addClass(
          // "ui-corner-all" );
        },
      });
    },
    AutoSearch_old: function (Method, fldType) {
      // fldType : text, linkKey
      var SuperAuto = $(this);
      if (SuperAuto == undefined) return false;

      SuperAuto.focusout(function (e) {
        $(document.body).find("#AutoCompleteDiv").delay(500).remove();
        if ($(this).parents(".fieldContaner").attr("linkvalue") == "") {
          // $(this).val("");
        }
        // $(this).parents('.fieldContaner').trigger('change');
      });
      SuperAuto.keydown(function (e) {
        var SuperAuto = $(this);
        if ($("#AutoCompleteUl").length == 0) return;
        if (e.keyCode == "13") {
          // 엔터키
          $(this).val($("#AutoCompleteUl").data("select").attr("val"));
          SuperAuto.parents(".fieldContaner").attr(
            "linkvalue",
            $("#AutoCompleteUl").data("select").attr("data")
          );
          SuperAuto.parents(".fieldContaner").trigger("change");
          $(document.body).find("#AutoCompleteDiv").delay(500).remove();
        }
        if (e.keyCode == "38") {
          // down
          var i = $("#AutoCompleteUl").data("index");
          var _li = $("#AutoCompleteUl").data("select");
          if (i == 0) {
            _li.removeClass("ui-state-hover");
            $("#AutoCompleteUl li").last().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index($("#AutoCompleteUl li").last())
            );
            $("#AutoCompleteUl").data("select", $("#AutoCompleteUl li").last());
          } else {
            _li.removeClass("ui-state-hover");
            _li.prev().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index(_li.prev())
            );
            $("#AutoCompleteUl").data("select", _li.prev());
          }
          SuperAuto.val($("#AutoCompleteUl").data("select").attr("val"));
          SuperAuto.parents(".fieldContaner").attr(
            "linkvalue",
            $("#AutoCompleteUl").data("select").attr("data")
          );
          SuperAuto.parents(".fieldContaner").trigger("change");
        }
        if (e.keyCode == "40") {
          // up
          var i = $("#AutoCompleteUl").data("index");
          var _li = $("#AutoCompleteUl").data("select");

          if (
            i == $("#AutoCompleteUl li").index($("#AutoCompleteUl li").last())
          ) {
            // 현재가 마지막자료라면
            _li.removeClass("ui-state-hover");
            $("#AutoCompleteUl li").first().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index($("#AutoCompleteUl li").first())
            );
            $("#AutoCompleteUl").data(
              "select",
              $("#AutoCompleteUl li").first()
            );
          } else {
            _li.removeClass("ui-state-hover");
            _li.next().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index(_li.next())
            );
            $("#AutoCompleteUl").data("select", _li.next());
          }
          SuperAuto.val($("#AutoCompleteUl").data("select").attr("val"));
          SuperAuto.parents(".fieldContaner").attr(
            "linkvalue",
            $("#AutoCompleteUl").data("select").attr("data")
          );
          SuperAuto.parents(".fieldContaner").trigger("change");
        }
        if (e.keyCode == "27") {
          // esc
          $(document.body).find("#AutoCompleteDiv").remove();
          $(this).val("");
          SuperAuto.parents(".fieldContaner").attr("linkvalue", "");
          $(this).parents(".fieldContaner").trigger("change");
        }
      });
      SuperAuto.keyup(function (e) {
        if (e.keyCode == "37") {
          return;
        }
        if (e.keyCode == "39") {
          return;
        }
        if (e.keyCode == "38") {
          return;
        }
        if (e.keyCode == "40") {
          return;
        }
        if (e.keyCode == "13") {
          return;
        }
        if (e.keyCode == "229") {
          return;
        }

        // 이전값은 지운다
        SuperAuto.attr("linkvalue", "");
        if ($(this).val().length < 2) return 0;

        $(document.body).find("#AutoCompleteDiv").remove();

        var pl = new JSONClientParameters();
        pl.add("service", "MON_AUTOSEARCH");
        pl.add("method", Method);
        pl.add("findtxt", $(this).val());
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            var _data = _data.resultData;
            var Rows = _data.length;
            $("#AutoCompleteUl").html("");
            if (Rows == 0) {
              return;
            }

            $(document.body).append(
              "<div id='AutoCompleteDiv' class='ui-widget-content'><ul id='AutoCompleteUl' ></ul></div>"
            );
            $("#AutoCompleteDiv").css(
              "top",
              SuperAuto.offset().top + SuperAuto.outerHeight()
            );
            $("#AutoCompleteDiv").css("left", SuperAuto.offset().left);

            for (var i = 0; i < Rows; i++) {
              var DataRow = _data[i];
              var datali =
                "<li class='AutoSearchItem' data='" +
                DataRow["KEYID"] +
                "' val='" +
                DataRow["KEYNAME"] +
                "'>" +
                DataRow["KEYALIAS"] +
                "</li>";
              $("#AutoCompleteUl").append(datali);
            }

            $("#AutoCompleteUl li").mousedown(function (e) {
              // alert($(this).attr("val"));

              SuperAuto.val($(this).attr("val"));
              // $(this).val($("#AutoCompleteUl").data('select').attr("val"));

              SuperAuto.parents(".fieldContaner").attr(
                "linkvalue",
                $(this).attr("data")
              );
              // SuperAuto.parents('.fieldContaner').attr('linkvalue',
              // $("#AutoCompleteUl").data('select').attr("data"));

              $(document.body).find("#AutoCompleteDiv").remove();
              // $(document.body).find('#AutoCompleteDiv').delay(500).remove();

              SuperAuto.parents(".fieldContaner").trigger("change");
              // SuperAuto.parents('.fieldContaner').trigger('change');
            });

            $("#AutoCompleteUl li").hover(
              function () {
                $(this).addClass("ui-state-hover");
                $("#AutoCompleteUl").data(
                  "index",
                  $("#AutoCompleteUl li").index($(this))
                );
                $("#AutoCompleteUl").data("select", $(this));
                SuperAuto.val($(this).attr("val"));
              },
              function () {
                $(this).removeClass("ui-state-hover");
              }
            );

            $("#AutoCompleteUl").data("index", 0);
            $("#AutoCompleteUl").data(
              "select",
              $("#AutoCompleteUl li").first()
            );

            $("#AutoCompleteUl li:eq(0)").addClass("ui-state-hover");
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.async
        );
      });
    },
    /* ----------------------------------------------------------------------------- */
    // Autocomplete => AutoSearch 개선버전
    // 'linktext'에서 사용함
    /* ----------------------------------------------------------------------------- */
    Autocomplete: function (option, callback) {
      var SuperAuto = $(this);
      if (SuperAuto == undefined) return false;
      SuperAuto.focusout(function (e) {
        $(document.body).find("#AutoCompleteDiv").delay(500).remove();
        if ($(this).parents(".fieldContaner").attr("linkvalue") == "") {
        }
      });
      SuperAuto.keydown(function (e) {
        var SuperAuto = $(this);
        if ($("#AutoCompleteUl").length == 0) return;
        if (e.keyCode == "13") {
          // 엔터키
          var _key = $("#AutoCompleteUl").data("select").attr("key");
          var _display = $("#AutoCompleteUl").data("select").attr("display");
          callback({
            key: _key,
            display: _display,
            event: e,
            obj: SuperAuto,
          });
          $(document.body).find("#AutoCompleteDiv").delay(500).remove();
        }
        if (e.keyCode == "38") {
          // down
          var i = $("#AutoCompleteUl").data("index");
          var _li = $("#AutoCompleteUl").data("select");
          if (i == 0) {
            _li.removeClass("ui-state-hover");
            $("#AutoCompleteUl li").last().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index($("#AutoCompleteUl li").last())
            );
            $("#AutoCompleteUl").data("select", $("#AutoCompleteUl li").last());
          } else {
            _li.removeClass("ui-state-hover");
            _li.prev().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index(_li.prev())
            );
            $("#AutoCompleteUl").data("select", _li.prev());
          }
          var _key = $("#AutoCompleteUl").data("select").attr("key");
          var _display = $("#AutoCompleteUl").data("select").attr("display");
          // callback({"key":_key,"display":_display, "event":e,
          // "obj": SuperAuto});
        }
        if (e.keyCode == "40") {
          // up
          var i = $("#AutoCompleteUl").data("index");
          var _li = $("#AutoCompleteUl").data("select");
          if (
            i == $("#AutoCompleteUl li").index($("#AutoCompleteUl li").last())
          ) {
            // 현재가 마지막자료라면
            _li.removeClass("ui-state-hover");
            $("#AutoCompleteUl li").first().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index($("#AutoCompleteUl li").first())
            );
            $("#AutoCompleteUl").data(
              "select",
              $("#AutoCompleteUl li").first()
            );
          } else {
            _li.removeClass("ui-state-hover");
            _li.next().addClass("ui-state-hover");
            $("#AutoCompleteUl").data(
              "index",
              $("#AutoCompleteUl li").index(_li.next())
            );
            $("#AutoCompleteUl").data("select", _li.next());
          }
          var _key = $("#AutoCompleteUl").data("select").attr("key");
          var _display = $("#AutoCompleteUl").data("select").attr("display");
          // callback({"key":_key,"display":_display, "event":e,
          // "obj": SuperAuto});
        }
        if (e.keyCode == "27") {
          // esc
          $(document.body).find("#AutoCompleteDiv").remove();
          var _key = "";
          var _display = "";
          // callback({"key":_key,"display":_display, "event":e,
          // "obj": SuperAuto});
        }
      });
      SuperAuto.keyup(function (e) {
        if (e.keyCode == "37") {
          return;
        }
        if (e.keyCode == "39") {
          return;
        }
        if (e.keyCode == "38") {
          return;
        }
        if (e.keyCode == "40") {
          return;
        }
        if (e.keyCode == "13") {
          return;
        }
        if (e.keyCode == "229") {
          return;
        }
        if (e.keyCode == "9") {
          return;
        }

        // 이전값은 지운다
        SuperAuto.attr("linkvalue", "");
        if ($(this).val().length < 2) return 0;
        $(document.body).find("#AutoCompleteDiv").remove();
        var pl = new JSONClientParameters();
        pl.add("service", "AutoSearch");
        pl.add("method", option.Method);
        pl.add("findtxt", $(this).val());
        PostJsonData(
          _M.svcUrl[_M.Webtype].crudUrl,
          pl,
          function (_data) {
            var _data = _data.resultData;
            var Rows = _data.length;
            $("#AutoCompleteUl").html("");
            if (Rows == 0) {
              return;
            }

            $(document.body).append(
              "<div id='AutoCompleteDiv' class='ui-widget-content'><ul id='AutoCompleteUl' ></ul></div>"
            );
            $("#AutoCompleteDiv").css(
              "top",
              SuperAuto.offset().top + SuperAuto.outerHeight()
            );
            $("#AutoCompleteDiv").css("left", SuperAuto.offset().left);

            for (var i = 0; i < Rows; i++) {
              var DataRow = _data[i];
              var datali =
                "<li class='AutoSearchItem' key='" +
                DataRow["KEYID"] +
                "' display='" +
                DataRow["KEYNAME"] +
                "'>" +
                DataRow["KEYALIAS"] +
                "</li>";
              $("#AutoCompleteUl").append(datali);
            }

            $("#AutoCompleteUl li").mousedown(function (e) {
              var _key = $(this).attr("key");
              var _display = $(this).attr("display");
              callback({
                key: _key,
                display: _display,
                event: e,
                obj: SuperAuto,
              });
              $(document.body).find("#AutoCompleteDiv").remove();
            });

            $("#AutoCompleteUl li").hover(
              function () {
                $(this).addClass("ui-state-hover");
                $("#AutoCompleteUl").data(
                  "index",
                  $("#AutoCompleteUl li").index($(this))
                );
                $("#AutoCompleteUl").data("select", $(this));
                // SuperAuto.val($(this).attr("val"));
              },
              function () {
                $(this).removeClass("ui-state-hover");
              }
            );
            $("#AutoCompleteUl").data("index", 0);
            $("#AutoCompleteUl").data(
              "select",
              $("#AutoCompleteUl li").first()
            );
            $("#AutoCompleteUl li:eq(0)").addClass("ui-state-hover");
          },
          function (response) {
            alert(response.Message);
          },
          _M.aSync.async
        );
      });
    },

    whois: function (option) {
      alert("superContaner id-" + $(this).attr("id") + " / superForm 1.0");
    },
  };
})(jQuery);

/*
 * Tabby jQuery plugin version 0.12
 *
 * Ted Devito - http://teddevito.com/demos/textarea.html
 *
 * Copyright (c) 2009 Ted Devito
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer. 2. Redistributions in
 * binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution. 3. The name of the author may not
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

// create closure
(function ($) {
  // plugin definition

  $.fn.tabby = function (options) {
    // debug(this);
    // build main options before element iteration
    var opts = $.extend({}, $.fn.tabby.defaults, options);
    var pressed = $.fn.tabby.pressed;

    // iterate and reformat each matched element
    return this.each(function () {
      $this = $(this);

      // build element specific options
      var options = $.meta ? $.extend({}, opts, $this.data()) : opts;

      $this
        .bind("keydown", function (e) {
          var kc = $.fn.tabby.catch_kc(e);
          if (16 == kc) pressed.shft = true;
          /*
           * because both CTRL+TAB and ALT+TAB default to
           * an event (changing tab/window) that will
           * prevent js from capturing the keyup event,
           * we'll set a timer on releasing them.
           */
          if (17 == kc) {
            pressed.ctrl = true;
            setTimeout("$.fn.tabby.pressed.ctrl = false;", 1000);
          }
          if (18 == kc) {
            pressed.alt = true;
            setTimeout("$.fn.tabby.pressed.alt = false;", 1000);
          }

          if (9 == kc && !pressed.ctrl && !pressed.alt) {
            e.preventDefault; // does not work in
            // O9.63 ??
            pressed.last = kc;
            setTimeout("$.fn.tabby.pressed.last = null;", 0);
            process_keypress($(e.target).get(0), pressed.shft, options);
            return false;
          }
        })
        .bind("keyup", function (e) {
          if (16 == $.fn.tabby.catch_kc(e)) pressed.shft = false;
        })
        .bind("blur", function (e) {
          // workaround for Opera --
          // http://www.webdeveloper.com/forum/showthread.php?p=806588
          if (9 == pressed.last)
            $(e.target)
              .one("focus", function (e) {
                pressed.last = null;
              })
              .get(0)
              .focus();
        });
    });
  };

  // define and expose any extra methods
  $.fn.tabby.catch_kc = function (e) {
    return e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which;
  };
  $.fn.tabby.pressed = {
    shft: false,
    ctrl: false,
    alt: false,
    last: null,
  };

  // private function for debugging
  function debug($obj) {
    if (window.console && window.console.log)
      window.console.log("textarea count: " + $obj.size());
  }
  function process_keypress(o, shft, options) {
    var scrollTo = o.scrollTop;
    // var tabString = String.fromCharCode(9);

    // gecko; o.setSelectionRange is only available when the text box has
    // focus
    if (o.setSelectionRange) gecko_tab(o, shft, options);
    // ie; document.selection is always available
    else if (document.selection) ie_tab(o, shft, options);

    o.scrollTop = scrollTo;
  }

  // plugin defaults
  $.fn.tabby.defaults = {
    tabString: String.fromCharCode(9),
  };

  function gecko_tab(o, shft, options) {
    var ss = o.selectionStart;
    var es = o.selectionEnd;

    // when there's no selection and we're just working with the caret,
    // we'll add/remove the tabs at the caret, providing more control
    if (ss == es) {
      // SHIFT+TAB
      if (shft) {
        // check to the left of the caret first
        if ("\t" == o.value.substring(ss - options.tabString.length, ss)) {
          o.value =
            o.value.substring(0, ss - options.tabString.length) +
            o.value.substring(ss); // put it back together
          // omitting one
          // character to the left
          o.focus();
          o.setSelectionRange(
            ss - options.tabString.length,
            ss - options.tabString.length
          );
        }
        // then check to the right of the caret
        else if ("\t" == o.value.substring(ss, ss + options.tabString.length)) {
          o.value =
            o.value.substring(0, ss) +
            o.value.substring(ss + options.tabString.length); // put
          // it
          // back
          // together
          // omitting
          // one
          // character
          // to
          // the
          // right
          o.focus();
          o.setSelectionRange(ss, ss);
        }
      }
      // TAB
      else {
        o.value =
          o.value.substring(0, ss) + options.tabString + o.value.substring(ss);
        o.focus();
        o.setSelectionRange(
          ss + options.tabString.length,
          ss + options.tabString.length
        );
      }
    }
    // selections will always add/remove tabs from the start of the line
    else {
      // split the textarea up into lines and figure out which lines are
      // included in the selection
      var lines = o.value.split("\n");
      var indices = new Array();
      var sl = 0; // start of the line
      var el = 0; // end of the line
      var sel = false;
      for (var i in lines) {
        el = sl + lines[i].length;
        indices.push({
          start: sl,
          end: el,
          selected:
            (sl <= ss && el > ss) ||
            (el >= es && sl < es) ||
            (sl > ss && el < es),
        });
        sl = el + 1; // for "\n"
      }

      // walk through the array of lines (indices) and add tabs where
      // appropriate
      var modifier = 0;
      for (var i in indices) {
        if (indices[i].selected) {
          var pos = indices[i].start + modifier; // adjust for tabs
          // already
          // inserted/removed
          // SHIFT+TAB
          if (
            shft &&
            options.tabString ==
              o.value.substring(pos, pos + options.tabString.length)
          ) {
            // only
            // SHIFT+TAB
            // if
            // there's a
            // tab at
            // the start
            // of the
            // line
            o.value =
              o.value.substring(0, pos) +
              o.value.substring(pos + options.tabString.length); // omit
            // the
            // tabstring
            // to
            // the
            // right
            modifier -= options.tabString.length;
          }
          // TAB
          else if (!shft) {
            o.value =
              o.value.substring(0, pos) +
              options.tabString +
              o.value.substring(pos); // insert the
            // tabstring
            modifier += options.tabString.length;
          }
        }
      }
      o.focus();
      var ns =
        ss +
        (modifier > 0
          ? options.tabString.length
          : modifier < 0
          ? -options.tabString.length
          : 0);
      var ne = es + modifier;
      o.setSelectionRange(ns, ne);
    }
  }

  function ie_tab(o, shft, options) {
    var range = document.selection.createRange();

    if (o == range.parentElement()) {
      // when there's no selection and we're just working with the caret,
      // we'll add/remove the tabs at the caret, providing more control
      if ("" == range.text) {
        // SHIFT+TAB
        if (shft) {
          var bookmark = range.getBookmark();
          // first try to the left by moving opening up our empty
          // range to the left
          range.moveStart("character", -options.tabString.length);
          if (options.tabString == range.text) {
            range.text = "";
          } else {
            // if that didn't work then reset the range and try
            // opening it to the right
            range.moveToBookmark(bookmark);
            range.moveEnd("character", options.tabString.length);
            if (options.tabString == range.text) range.text = "";
          }
          // move the pointer to the start of them empty range and
          // select it
          range.collapse(true);
          range.select();
        } else {
          // very simple here. just insert the tab into the range and
          // put the pointer at the end
          range.text = options.tabString;
          range.collapse(false);
          range.select();
        }
      }
      // selections will always add/remove tabs from the start of the line
      else {
        var selection_text = range.text;
        var selection_len = selection_text.length;
        var selection_arr = selection_text.split("\r\n");

        var before_range = document.body.createTextRange();
        before_range.moveToElementText(o);
        before_range.setEndPoint("EndToStart", range);
        var before_text = before_range.text;
        var before_arr = before_text.split("\r\n");
        var before_len = before_text.length; // - before_arr.length +
        // 1;

        var after_range = document.body.createTextRange();
        after_range.moveToElementText(o);
        after_range.setEndPoint("StartToEnd", range);
        var after_text = after_range.text; // we can accurately
        // calculate distance to the
        // end because we're not
        // worried about MSIE
        // trimming a \r\n

        var end_range = document.body.createTextRange();
        end_range.moveToElementText(o);
        end_range.setEndPoint("StartToEnd", before_range);
        var end_text = end_range.text; // we can accurately calculate
        // distance to the end because
        // we're not worried about MSIE
        // trimming a \r\n

        var check_html = $(o).html();
        $("#r3").text(
          before_len +
            " + " +
            selection_len +
            " + " +
            after_text.length +
            " = " +
            check_html.length
        );
        if (before_len + end_text.length < check_html.length) {
          before_arr.push("");
          before_len += 2; // for the \r\n that was trimmed
          if (
            shft &&
            options.tabString ==
              selection_arr[0].substring(0, options.tabString.length)
          )
            selection_arr[0] = selection_arr[0].substring(
              options.tabString.length
            );
          else if (!shft)
            selection_arr[0] = options.tabString + selection_arr[0];
        } else {
          if (
            shft &&
            options.tabString ==
              before_arr[before_arr.length - 1].substring(
                0,
                options.tabString.length
              )
          )
            before_arr[before_arr.length - 1] = before_arr[
              before_arr.length - 1
            ].substring(options.tabString.length);
          else if (!shft)
            before_arr[before_arr.length - 1] =
              options.tabString + before_arr[before_arr.length - 1];
        }

        for (var i = 1; i < selection_arr.length; i++) {
          if (
            shft &&
            options.tabString ==
              selection_arr[i].substring(0, options.tabString.length)
          )
            selection_arr[i] = selection_arr[i].substring(
              options.tabString.length
            );
          else if (!shft)
            selection_arr[i] = options.tabString + selection_arr[i];
        }

        if (1 == before_arr.length && 0 == before_len) {
          if (
            shft &&
            options.tabString ==
              selection_arr[0].substring(0, options.tabString.length)
          )
            selection_arr[0] = selection_arr[0].substring(
              options.tabString.length
            );
          else if (!shft)
            selection_arr[0] = options.tabString + selection_arr[0];
        }

        if (
          before_len + selection_len + after_text.length <
          check_html.length
        ) {
          selection_arr.push("");
          selection_len += 2; // for the \r\n that was trimmed
        }

        before_range.text = before_arr.join("\r\n");
        range.text = selection_arr.join("\r\n");

        var new_range = document.body.createTextRange();
        new_range.moveToElementText(o);

        if (0 < before_len) new_range.setEndPoint("StartToEnd", before_range);
        else new_range.setEndPoint("StartToStart", before_range);
        new_range.setEndPoint("EndToEnd", range);

        new_range.select();
      }
    }
  }

  // end of closure
})(jQuery);

function showAddress(address, title) {
  geocoder = new google.maps.Geocoder();

  address = decodeURI(address);
  title = decodeURI(title);

  this.geocoder.geocode(
    {
      address: address,
    },
    function (results, status) {
      // if (status == google.maps.GeocoderStatus.OK) {

      for (var i = 0; i < results.length; i++) {
        var vposition = results[0].geometry.location;
        // 마커 생성.
        var vmarker = new google.maps.Marker({
          position: vposition,
          map: map,
        });
        // var j = i + 1;
        // vmarker.setTitle(j.toString());

        map.setCenter(vposition);
        vmarker.setPosition(vposition);
        vmarker.setTitle(address);
        // infowindow = new google.maps.InfoWindow();

        var infowindow = new google.maps.InfoWindow({
          content: title,
          size: new google.maps.Size(50, 50),
        });
        infowindow.setContent("<b>" + title + "</b><p>" + address + "</p>");
        // infowindow.open(map, vmarker);

        google.maps.event.addListener(vmarker, "click", function () {
          infowindow.open(map, vmarker);
        });
      }
      // }
    }
  );

  NavigatorGeolocation();
}
function NavigatorGeolocation() {
  // 현재위치
  // Try W3C Geolocation (Preferred)
  if (navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(
      function (position) {
        initialLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        map.setCenter(initialLocation);

        var vmarker = new google.maps.Marker({
          position: initialLocation,
          map: map,
        });

        var infowindow = new google.maps.InfoWindow({
          content: "내위치",
          size: new google.maps.Size(50, 50),
        });
        infowindow.open(map, vmarker);

        google.maps.event.addListener(vmarker, "click", function () {
          infowindow.open(map, vmarker);
        });
      },
      function () {
        // handleNoGeolocation(browserSupportFlag);
      }
    );
    // Try Google Gears Geolocation
  } else if (google.gears) {
    browserSupportFlag = true;
    var geo = google.gears.factory.create("beta.geolocation");
    geo.getCurrentPosition(
      function (position) {
        initialLocation = new google.maps.LatLng(
          position.latitude,
          position.longitude
        );
        map.setCenter(initialLocation);

        var vmarker = new google.maps.Marker({
          position: initialLocation,
          map: map,
        });

        var infowindow = new google.maps.InfoWindow({
          content: "내위치",
          size: new google.maps.Size(50, 50),
        });
        infowindow.open(map, vmarker);

        google.maps.event.addListener(vmarker, "click", function () {
          infowindow.open(map, vmarker);
        });
      },
      function () {
        // handleNoGeoLocation(browserSupportFlag);
      }
    );
    // Browser doesn't support Geolocation
  } else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }
}

function uf(p1, d1, d2) {
  d2 = d2 == undefined ? "" : d2;
  d1 = d1 == undefined ? p1 : d1;
  return p1 == undefined ? d2 : d1;
}

function Bordercontroll() {
  $(".SuperView tbody:eq(0)").addClass("tbody");
  var trs = $(".tbody .fldTdLabel").parent();
  var first = trs.first();
  var last = trs.eq(-1);
  $(first).addClass("Firstone");
  $(last).addClass("Lastone");

  $(".viewGroup").next().addClass("Firstone");
  $(".viewGroup").removeClass("b-t b-r b-l");
  $(".jobAreaTR").addClass("b-co-transparent");
}

/* 슈퍼테이블 목록 TH작성 메소드 */
function makeTalbleTh(colModel, option) {
  var _name = colModel.name;
  var _label = colModel.label == undefined ? _name : colModel.label;
  var _field = colModel.field == undefined ? _name : colModel.field;
  /* SQLInjection관련 20180124 jwkim Start */
  var _orderAsc = "";
  var _orderDesc = "";
  if (option.sort != undefined) {
    _orderAsc =
      colModel.orderAsc == undefined
        ? "name:" + _field + ",sorting:A"
        : colModel.orderAsc;
    _orderDesc =
      colModel.orderDesc == undefined
        ? "name:" + _field + ",sorting:D"
        : colModel.orderDesc;
  } else {
    _orderAsc =
      colModel.orderAsc == undefined ? _field + " ASC" : colModel.orderAsc;
    _orderDesc =
      colModel.orderDesc == undefined ? _field + " DESC" : colModel.orderDesc;
  }
  /* SQLInjection관련 20180124 jwkim End */
  var _orderYN = colModel.orderYN == undefined ? "Y" : colModel.orderYN;

  if (_label == "") return; // th-text , th-orderby HTML 요소 추가.

  var realColspan = 1;
  var realRowspan = 1;
  if (colModel.colspan != undefined)
    realColspan = colModel.colspan + (colModel.colspan - 1);
  if (colModel.rowspan != undefined) realRowspan = colModel.rowspan;
  var th =
    "<th class='SortNone th th-bg th-ft b-b b-co b-co-basic' colspan=" +
    realColspan +
    " rowspan=" +
    realRowspan +
    " orderAsc='" +
    _orderAsc +
    "' orderDesc='" +
    _orderDesc +
    "' orderYN='" +
    _orderYN +
    "' label='" +
    _label +
    "' field='" +
    _field +
    "'><span class='th-orderby icon i-20 icon-sortdesc align-middle'></span><span class='th-text align-middle'>" +
    _label +
    "</span><div class='listBlock align-middle'></div></th><th class='resizeBar th th-bg th-ft b-b b-co b-co-basic' rowspan=" +
    realRowspan +
    "></th>";
  return th;
}

/* 슈퍼테이블 목록 TD작성 메소드 */
function makeTalbleTd(colModel, tr) {
  // json의 컬럼설정값을 읽어서 td에 데이터용 필드를 설정한다.
  if (colModel == undefined) return;
  var _name = colModel.name;
  var _label = colModel.label == undefined ? colModel.name : colModel.label;
  var _field = colModel.field == undefined ? colModel.name : colModel.field;

  var td = "<td class='b-b b-co b-co-basic";

  if (colModel.css != undefined) td += " " + colModel.css; // _td.addClass(colModel.css);

  if (colModel.clickAction != undefined) {
    td += " tdAuction'";
    td += " clickAction='" + colModel.clickAction + "'";
  } else {
    td += "'";
  }

  td += " name='" + _name + "'";
  td += " field='" + _field + "'";
  td += " style='text-align: " + colModel.align + ";'";
  td += " type='" + colModel.type + "'";
  if (colModel.subfield) {
    td += " subfield='" + colModel.subfield + "'";
  }
  if (colModel.size != undefined) {
    if (colModel.size.width != undefined)
      td += " sizewidth='" + colModel.size.width + "'";
    if (colModel.size.height != undefined)
      td += " sizeheight='" + colModel.size.height + "'";
  }

  if (colModel.showText != undefined)
    td += " showText='" + colModel.showText + "'";
  if (colModel.dynamicCss != undefined)
    td += " dynamicCss='" + colModel.dynamicCss + "'";

  // if (value.css != undefined) _td.append("<span
  // class='"+value.css+"'></span>");

  td += "></td><td class='resizeBar b-b b-co b-co-basic'></td>";
  tr.append(td);
  var _td = $("td[field='" + _field + "']", tr);

  // return td;

  if (colModel.mode != undefined) {
    _td.attr("mode", colModel.mode);
    if (colModel.mode == "edit") {
      _Obj.superContaner("fieldGen", _td, colModel);
    }
  }
  // if (colModel.clickAction != undefined) _td.attr('clickAction',
  // colModel.clickAction).addClass('tdAuction');
}

// 2018.01.11 dmjung :: 자동 브라우저 height 로 화면 높이 설정하기, 리사이즈 할 때마다 화면 맞춤
$(window).resize(function () {
  var _height = $(window).height();
  var _result = _height - 92;
  $(".Holder").css("min-height", _result);

  var check = $(".thead").size();
  if (check >= 1) {
    $(".thead").each(function (index, thead) {
      syncThead($(thead), $(thead).next());
    });
  }

  var top = $("#Top").height();
  var title = $(".Title").outerHeight();
  var bottom = $("#Footer").outerHeight();
  var sum = top + title - (bottom + 10);
  var total = _result - sum;

  // 2018.12.16 dmjung :: chatting window 값 구하기 추가
  if ($(".icon-chat-white-active").size() == 0) {
    $(".window-chatting").attr("data-mcm-height", total);
    $("#window-chatting-body").attr("data-mcm-height", total - 60);
  } else {
    $(".window-chatting").css("height", total);
    $("#window-chatting-body").css("height", total - 60);
    $(".window-chatting").attr("data-mcm-height", total);
    $("#window-chatting-body").attr("data-mcm-height", total - 60);
  }

  // 2014.02.28 dmjung :: custom event, menuResize 함수 트리거
  if ($(".Mon").hasClass("layoutTop")) {
    $("#TopMenu").trigger("menuResize");
  }
});

/* left div영역 width할당 하는 함수 */
function setRatio(selector, width) {
  if (selector == undefined || $.trim(selector) == "") return false;

  if (width != undefined) {
    $(selector).css("width", width + "%");
  } else {
    $(selector).css("width", "auto");
  }
  // 2018.05.29 dmjung :: left에 컨텐츠가 없을 경우, 요소를 숨겨서 2px 차지하는 현상 방지
  if ($(".left").width() < 3) {
    $(".left").hide();
  } else {
    $(".left").show();
  }
}

function syncThead(thead, tbody) {
  // 2014.04.07 dmjung :: scroll 여부 체크 후 고정된 thead 싱크 맞춤.
  var thick = getScrollbarWidth();

  var version = $.getInternetVersion();

  switch (version) {
    case "33": // chrome
      break;
    default:
      thead.css("margin-right", "2px");
      break;
  }

  var result = tbody.hasScrollBar();
  if (result.horizontal == true && result.vertical == true) {
    if (version != "33") {
      thead.css("margin-right", thick + 2);
    } else {
      thead.css("margin-right", thick);
    }
  } else {
    if (version != "33") {
      thead.css("margin-right", 2);
    } else {
      thead.css("margin-right", 0);
    }
  }
}