/* jQuery grid plugin:
* version 2.0 2026-11-10
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

// 20261110 khma : superContaner.js 설문/답변(SuperAnswer) 컴포넌트 모듈 분리 추출 (js/core 표준 구조 적용)
(function ($) {
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superAnswer.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  if (!$.fn.superContaner.answerMethods) {
    $.fn.superContaner.answerMethods = {};
  }

  $.extend($.fn.superContaner.answerMethods, {
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
  });
})(jQuery);
