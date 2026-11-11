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
 * MonArch CRM 설문조사/답변(SuperAnswer) 동적 렌더링 및 응답 처리 코어 모듈
 *
 * [모듈 개요]
 * - 기존 jquery.kdb.superContaner.js 내부에 포함되어 있던 설문조사 및 답변 처리 관련
 *   메서드 5종을 독립 모듈(js/core/jquery.kdb.core.superAnswer.js)로 분리한 파일이다.
 * - $.fn.superContaner.answerMethods 네임스페이스에 메서드를 등록하며,
 *   호출 시 superContaner 본체 디스패처에서 본 모듈의 메서드로 위임(apply) 실행된다.
 *
 * [지원 문항 유형 (REPLY_TYPE)]
 * - "10" : 단답형 (단일 텍스트 입력창)
 * - "20" : 서술형 (멀티라인 텍스트 영역)
 * - "30" : 선택형 (단일 선택 라디오 버튼 목록)
 * - "40" : 복수선택형 (다중 선택 체크박스 목록)
 * - "50" : 기타서술형 (라디오 버튼 목록 + 기타 서술용 텍스트 영역)
 * - "70" : 응답자정보 (응답자 정보 텍스트 입력창)
 *
 * [제공 메서드 목록 (총 5종)]
 * 1. SuperAnswer   : 설문 컨테이너 초기화, 설문관리번호(M_SURVEY_NO) 확인 및 기응답 여부(AnswerCheck) 검증 후 설문 폼 생성 호출
 * 2. AnswerGenForm : 설문관리번호(M_SURVEY_NO) 기준으로 문항 목록을 백엔드(extSvc)에서 조회하여 AnswerForm으로 전달
 * 3. AnswerForm    : 조회된 문항 배열(JsonForm)을 순회하며 문항 유형(REPLY_TYPE)별 입력 UI 및 [응답완료] 버튼을 동적으로 생성
 * 4. AnswerSave    : 전체 문항 필수 응답 여부를 검증(Validation)한 뒤 문항별 답변을 SURVEY_ANSWER / ANSWER_CREATE로 동기 저장
 * 5. AnswerCheck   : 해당 설문(M_SURVEY_NO) 및 작업키(JOB_KEY)에 대해 이미 등록된 답변이 존재하는지(CHECK_ANSWER) 조회
 */
// 20261110 khma : superContaner.js 설문/답변(SuperAnswer) 컴포넌트 모듈 분리 추출 및 상세 주석 보강
(function ($) {
  // 20261110 khma : 상위 플러그인(superContaner) 선행 로드 여부 검증
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superAnswer.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  // 20261110 khma : 설문/답변 전용 메서드 네임스페이스 초기화
  if (!$.fn.superContaner.answerMethods) {
    $.fn.superContaner.answerMethods = {};
  }

  $.extend($.fn.superContaner.answerMethods, {
    /**
     * 설문조사(SuperAnswer) 컨테이너를 초기화하고 설문관리번호 조회 및 중복 응답 체크 후 설문 양식을 렌더링한다.
     *
     * @param {string|Object} option 화면 구조체 JSON 명칭 또는 구조체 옵션 객체
     * @param {string} key 설문 대상 작업 키(JOB_KEY)
     * @param {string} [mSurveyNo] 설문관리번호 (미전달 시 VOC설문지 또는 캠페인설문지 서비스에서 조회)
     * @param {string} mUsiteNo 회원사(사이트) 번호
     * @param {number} [dspmode] 표시 모드 (1: 미리보기 모드, 0: 실제 응답 등록 모드)
     */
    SuperAnswer: function (option, key, mSurveyNo, mUsiteNo, dspmode) {
      var _Obj = $(this);
      _Obj.html("");
      _Obj.show();

      // 1. 문자열 형태로 구조체명이 전달된 경우 서버/캐시에서 JSON 설정 객체를 로드한다.
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

      // 2. 컨테이너 DOM에 구조체 옵션을 바인딩하고 SuperAnswer 및 테마 클래스를 적용한다.
      $(this)
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperAnswer")
        .addClass(_theme);

      // 3. 설문 구분(type: 'V' VOC설문 / 'C' 캠페인설문), 작업키(key), 회원사번호(mUsiteNo)를 컨테이너 속성에 저장한다.
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

      // 4. 설문관리번호(mSurveyNo)가 직접 전달되지 않은 경우 JOB_KEY를 기준으로 백엔드에서 설문관리번호를 조회한다.
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

      // 5. 화면 구조체 권한 검사(SecurityCheck)를 수행한다.
      if (_Obj.superContaner("SecurityCheck")) {
        option = _Obj.data("jsonData");
      } else {
        return;
      }

      // 6. 설문 본문 영역(.ansbody)을 생성하고 크기(bodyHeight, bodyWidth)를 설정한다.
      var _body = $("<div class='ansbody'></div>").appendTo(_Obj);
      if (option.bodyHeight > 0) _body.css("min-height", option.bodyHeight);
      if (option.bodyWidth > 0) _body.css("width", option.bodyWidth);

      if (mSurveyNo == undefined) {
        if (option.AnswerNo != undefined) mSurveyNo = option.AnswerNo;
      }

      // 7. 미리보기 모드이거나 기응답 내역(AnswerCheck == 0)이 없는 경우 설문 문항 생성(AnswerGenForm)을 호출한다.
      if (mSurveyNo != undefined) {
        $(".ansbody", _Obj).empty();
        $(".ansbody", _Obj).attr("SNO", mSurveyNo);

        // 20261111 khma : 기존 대입 연산자(dspmode = 1) 오타로 인해 기응답 체크(AnswerCheck)가 생략되고 항상 미리보기 모드(1)로 고정되어 응답완료 버튼 이벤트가 바인딩되지 않던 오류를 비교 연산자(dspmode == 1)로 수정
        /*
        if ((dspmode = 1 || _Obj.superContaner("AnswerCheck") == 0)) {
        */
        if (dspmode == 1 || _Obj.superContaner("AnswerCheck") == 0) {
          _Obj.superContaner("AnswerGenForm", mSurveyNo, dspmode);
        } else {
          $.MessageBox("설문응답", "이미 등록된 설문입니다.");
        }
      }
      if (option.LoadCallBack != undefined) eval(option.LoadCallBack)(_Obj);
    },

    /**
     * 설문관리번호(mSurveyNo)에 해당하는 설문 문항 목록을 백엔드(extSvc)에서 조회하여 화면 렌더링(AnswerForm)으로 전달한다.
     *
     * @param {string} mSurveyNo 조회할 설문관리번호(M_SURVEY_NO)
     * @param {number} [dspmode] 표시 모드 (1: 미리보기 모드, 0: 실제 응답 모드)
     */
    AnswerGenForm: function (mSurveyNo, dspmode) {
      var _Obj = $(this);

      // SuperAnswer를 거치지 않고 AnswerGenForm을 단독 호출한 경우 .ansbody 영역을 보강 생성한다.
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

      // 백엔드 확장 서비스(extSvc)를 호출하여 설문 문항 리스트를 가져온다.
      PostJsonData(
        _M.svcUrl[_M.Webtype].extSvc,
        pl,
        function (_data) {
          if (_data.resultData.length > 0) {
            _Obj.superContaner("AnswerForm", _data.resultData, dspmode);
            if (option.afterListCallBack != undefined)
              eval(option.afterListCallBack)(_Obj);
          }
        },
        function (response) {
          loader.remove();
          _Obj.superContaner("tableShowMessage", response.Message);
        },
        _M.aSync.async
      );
    },

    /**
     * 조회된 설문 문항 배열(JsonForm)을 순회하며 문항 유형(REPLY_TYPE)에 맞는 입력 폼과 [응답완료] 버튼을 생성한다.
     *
     * @param {Array<Object>} JsonForm 설문 문항 메타데이터 배열 (M_SURVEY_QUESTION_NO, QUESTION_TITLE, REPLY_TYPE, ANSWER, SEQUENCE)
     * @param {number} [dspmode] 표시 모드 (1이면 미리보기 전용이므로 응답완료 저장 이벤트를 바인딩하지 않음)
     */
    AnswerForm: function (JsonForm, dspmode) {
      var _Obj = $(this);

      // 1. 각 문항 데이터를 순회하며 문항 블록(.SurveyArea.Qobj)과 유형별 입력 컨트롤을 생성한다.
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

        // 문항 번호 및 제목 표시
        var head = $(
          "<div  class='head'>" +
            (index + 1) +
            ". " +
            value.QUESTION_TITLE +
            "</div>"
        ).appendTo(Area);

        // 문항 응답 유형(_AnsType)에 따라 입력 엘리먼트를 구성한다.
        switch (_AnsType) {
          case "10": // 단답형 (단일 텍스트박스)
            rlt = $(
              "<input  class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic Qitem'  type='text' />"
            ).appendTo(Area);
            rlt.data("QnoObj", Area);
            break;
          case "20": // 서술형 (멀티라인 텍스트영역)
            rlt = $(
              "<textarea class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic Qitem'></textarea>"
            ).appendTo(Area);
            rlt.data("QnoObj", Area);
            break;
          case "30": // 선택형 (개행문자로 구분된 보기 항목별 라디오 버튼 생성)
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
          case "40": // 복수선택형 (개행문자로 구분된 보기 항목별 체크박스 생성)
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
          case "50": // 기타서술형 (라디오 버튼 목록 + 하단 기타 의견 입력용 textarea 생성)
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
          case "70": // 응답자정보 (단일 텍스트박스)
            rlt = $(
              "<input  class='input-bg input-ft  b-t b-r b-b b-l b-co b-co-basic Qitem'  type='text' />"
            ).appendTo(Area);
            rlt.data("QnoObj", Area);
            break;
        }
      });
      $("<br/>").appendTo($(".ansbody", _Obj));

      // 2. 하단 [응답완료] 버튼을 생성하고 실제 응답 모드(dspmode != 1)인 경우 저장(AnswerSave) 클릭 이벤트를 연결한다.
      $("<input id='BtnOK' type='button' value='응답완료' />").appendTo(
        $(".ansbody", _Obj)
      );
      if (dspmode != 1) {
        $("#BtnOK").bind("click", function (e) {
          _Obj.superContaner("AnswerSave");
        });
      }
    },

    /**
     * 사용자가 입력한 설문 문항별 답변의 필수 입력 여부를 검증하고 백엔드(SURVEY_ANSWER / ANSWER_CREATE)에 저장한다.
     *
     * @return {boolean|undefined} 대상 키가 없거나 저장 중 오류 발생 시 false 반환
     */
    AnswerSave: function () {
      var _Obj = $(this);
      var SNO = $(".ansbody", _Obj).attr("SNO"); // 설문관리번호
      var TYPE = _Obj.attr("type"); // 작업종류 ('V': VOC, 'C': 캠페인)
      var KEY = _Obj.attr("key"); // 작업키 (대상 고객/키맨 식별키)
      var mUsiteNo = _Obj.attr("mUsiteNo"); // 회원사번호

      if (KEY == "") {
        $.MessageBox("설문 오류", "설문 대상이 아닙니다.");
        return false;
      }

      // 1단계: 전체 설문 문항(.Qobj)을 순회하며 미입력/미선택 문항이 있는지 사전 검증(Validation)한다.
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
            // 마지막 보기(기타)를 선택한 경우 textarea 입력값을 답변으로 사용한다.
            if ($("input[type='radio']", $(this)).length == _QAnswerN) {
              _QAnswerS = $("textarea", $(this)).val();
            }
            break;
          case "70": // 응답자정보
            _QAnswerS = $("input", $(this)).val();
            break;
        }

        // 답변이 비어 있으면 해당 문항 번호(_qIdx)에서 검증 루프를 즉시 중단한다.
        if (undefined == _QAnswerS || "" == _QAnswerS) {
          validCheck = false;
          return false;
        }
      });

      if (validCheck == false) {
        alert(_qIdx + "번 설문에 답을 기록해주십시요.");
        return;
      }

      // 2단계: 검증을 통과한 모든 문항의 응답값을 추출하여 백엔드(SURVEY_ANSWER / ANSWER_CREATE)로 동기 저장한다.
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
            // 마지막 보기(기타)를 선택한 경우 textarea에 입력한 서술 내용을 답변으로 채택한다.
            if ($("input[type='radio']", $(this)).length == _QAnswerN) {
              _QAnswerS = $("textarea", $(this)).val();
            }
            break;
          case "70": // 응답자정보
            _QAnswerN = "0";
            _QAnswerS = $("input", $(this)).val();
            break;
        }

        var pl = new JSONClientParameters();
        pl.add("M_SURVEY_NO", SNO);
        pl.add("M_SURVEY_QUESTION_NO", _Qno);
        pl.add("JOB_TYPE", TYPE);
        pl.add("JOB_KEY", KEY);
        pl.add("SEQUENCE", _surveySeq);
        pl.add("ANSWER", _QAnswerS);
        pl.add("M_USITE_NO", mUsiteNo);
        pl.add("service", "SURVEY_ANSWER");
        pl.add("method", "ANSWER_CREATE");

        PostJsonData(
          _M.svcUrl[_M.Webtype].extSvc,
          pl,
          function (_data) {},
          function (response) {
            alert("설문 응답 완료 처리중 예기치 못할 오류가 발생하였습니다. ");
            return false;
          },
          _M.aSync.sync
        );
      });

      // 3단계: 저장 완료 후 기응답 건수(AnswerCheck)를 재확인하여 정상 등록 시 완료 안내 후 폼을 닫는다.
      if (_Obj.superContaner("AnswerCheck") == 0) {
        alert("설문응답 처리 실패");
      } else {
        $.MessageBox("설문 응답", "설문에 응답해주셔서 감사합니다.");
        _Obj.hide();
      }
    },

    /**
     * 현재 설문관리번호(M_SURVEY_NO)와 작업키(JOB_KEY)에 대해 이미 등록된 설문 응답이 존재하는지 확인한다.
     *
     * @return {string} "1": 이미 답변이 등록되어 있음, "0": 등록된 답변 없음
     */
    AnswerCheck: function () {
      var _Obj = $(this);
      var SNO = $(".ansbody", _Obj).attr("SNO"); // 설문관리번호
      var TYPE = _Obj.attr("type"); // 작업종류
      var KEY = _Obj.attr("key"); // 작업키
      var result = "0";

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
            result = "1"; // 이미 답변이 등록되어 있음
          } else {
            result = "0"; // 답변이 등록되어 있지 않음
          }
        },
        function (response) {
          return false; // 오류 발생 시 후속 진행 중단
        },
        false
      );

      return result;
    },
  });
})(jQuery);
