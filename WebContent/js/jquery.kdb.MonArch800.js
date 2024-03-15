/// <reference path="../Resource.js" />
/// <reference path="MonArchResource.js" />
/* jQuery grid plugin: 
* version 0.1 2011-07-21
* Requires jQuery v1.6.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DB
*/

(function ($, undefined) {
    $.cookie = function (key, value, options) {
        // key and at least value given, set cookie...
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = jQuery.extend({}, options);

            if (value == null || value == undefined) {
                options.expires = -1;
            }

            if (typeof options.expires == 'number') {
                var times = options.expires;
                var t = new Date();
                //t.setDate(t.getDate() + days);
                t.setTime(t.getTime() + times);
                options.expires = t;
            }

            value = String(value);

            return (document.cookie = [
        encodeURIComponent(key), '=',
        options.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''

    ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;

    };

    //===============================================================================
    //   문자열처리기본함수들
    //===============================================================================

    $.number_format = function (num) {
        /// <summary>천단위로 , 처리하는 함수.</summary>
        /// <param name="num" type="string">숫자로구성된 문자열.</param>
        /// <returns type="string">문자열의 뒤에서부터 1000단위 ,표시.</returns>
        num = num.split(",").join("");
        var arr = num.split(".");
        var num = new Array();
        for (i = 0; i <= arr[0].length - 1; i++) {
            num[i] = arr[0].substr(arr[0].length - 1 - i, 1);
            if (i % 3 == 0 && i != 0)
                num[i] += ",";
        }
        num = num.reverse().join("");

        if (!arr[1]) {
            return num;
        } else {
            return num + "." + arr[1];
        }
    };

    /* 숫자만 추출하는 함수 */
    $.getNumberOnly = function (val) {
        val = new String(val);
        var regex = /[^0-9]/g;
        val = val.replace(regex, '');
        return val;
    };
    /* html을 화면출력용으로 변환 */
    $.encHTML = function (html) {
        if (html == undefined) return '';
        return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\/g, '&#92;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
    };
    /* 화면표시용을 html로 변환 */
    $.decHTML = function (html) {
        if (html == undefined) return '';
		if ( typeof html !== "string" ) { return html; }
        return html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#92;/g, '\\').replace(/&nbsp;/g, ' ').replace(/<br>/g, "\n").replace(/&apos;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&");
    };
    $.isEncHTML = function (str) {
        if (str.search(/&amp;/g) != -1 || str.search(/&lt;/g) != -1 || str.search(/&gt;/g) != -1)
            return true;
        else
            return false;
    };
    // json 객체에서 찾아내기
    $.getObjects = function (obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat($.getObjects(obj[i], key, val));
            } else if (i == key && obj[key] == val) {
                objects.push(obj);
            }
        }
        return objects;
    }
    //*******************************************************************************
    //   페이지이동함수
    //*******************************************************************************
    $.pageMove = function (url, target) {
        window.open(url);
    };

    //===============================================================================
    //*******************************************************************************
    //   상호작용함수들...
    //*******************************************************************************
    //===============================================================================
    // 2013.08.02 dmjung :: 임시로 height 파라메터 추가
    $.MessageBox = function (title, msg, width, height, callback) {

        $('#yesnodailog').remove();
        $(document.body).append('<div id="yesnodailog"></div>');
        $('#yesnodailog').html(msg);
        var dlgWidth = 400;
        if (width != undefined && width != '') {
            dlgWidth = width;
        }
        var dlgHeight = 400;
        if (height != undefined && height != '') {
            dlgHeight = height;
        }
        $('#yesnodailog').dialog({ autoOpen: false,
            width: dlgWidth,
            height: dlgHeight,
            modal: true,
            closeOnEscape: false,
            title: title,
            buttons: {
                "확인": function () {
                    $('#yesnodailog').dialog("close");
                    if (callback != undefined) callback(true);
                }
            }
        });
        $('#yesnodailog').dialog('open');
    };








    // 2013.07.22 dmjung :: pop.. MultiEmail 팝업용 메시지 박스 생성. 팝업 제목, 크기, 키 값, 확인 버튼 이후의 콜백을 파라메터로 받는다.
    $.MultiEmail = function (title, width, height, key, object, callback) {

        $('#MultiEmail').remove();
        $(document.body).append('<div id="MultiEmail"></div>');
        var dlgWidth = 400;
        if (width != undefined && width != '') {
            dlgWidth = width;
        }
        var dlgHeight = 400;
        if (height != undefined && height != '') {
            dlgHeight = height;
        }

        // 2013.07.22 dmjung :: GenField, 데이터 입력 Row 를 생성해 줌. 체크박스, 이메일 유형, 이메일 주소와 버튼 포함.
        function GenField() {

            var _div = $("<div class='contactlines'></div>").appendTo($('#MultiEmail'));
            $("<input type='radio' name='selectRep' class='repflag align-middle' value='0' />").appendTo(_div).click(function () {
                $('.repflag').removeClass('selected').attr('value', '0');
                $(this).addClass('selected').attr('value', '1');
            });
            if ($('.repflag', '#MultiEmail').size() == 1) {
                $('.repflag', '#MultiEmail').attr('value', '1').trigger('click');
            };

            var _select = $("<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle emailtype'></select>").appendTo(_div).click(function () {
                $(this).parent().removeClass('last');
            });
            _M.f.c.SetOptionCode(_select, 'EMAIL_TYPE', '선택', false);

            $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle email' type='text' value='' />").appendTo(_div).keypress(function () {
                $(this).parent().removeClass('last');
            });
            $("<span class='icon i-20 icon-x extrabtn del align-middle'></span>").appendTo(_div);

            $("<span class='icon i-20 icon-xx extrabtn gen align-middle'></span>").appendTo(_div).click(function () {
                GenField();
                attachQtip();
                $('.gen').css('visibility', 'hidden');
                $('.gen:last').css('visibility', 'visible');
            });

            $("<input type='checkbox' class='badflag align-middle' value='0'/>").appendTo(_div);
        };

        var _key = key;

        // 2013.07.22 dmjung :: 신규생성한 MultiEmailList 를 LIST 메소드 형태로 호출하여 데이터를 받아옴
        var option = object.parents('.SuperView').data('jsonData');
        var jobType = object.parents('.fieldContaner').attr('jobType');
        var ds = _Obj.superContaner('MultiContactList', _key, 'LIST', 'EMAIL_MGMT', 'EMAIL', jobType);

        // 2013.07.22 dmjung :: 데이터가 있는 경우, 해당 데이터 수 만큼 MultiEmail 팝업 박스에 데이터들을 표시해준다.
        if (ds.resultData.length != 0) {
            $(ds.resultData).each(function (index, data) {
                var _div = $("<div class='contactlines' no='" + data.M_EMAIL_MGMT_NO + "'></div>").appendTo($('#MultiEmail'));

                $("<input type='radio' name='selectRep' class='repflag align-middle' value='" + data.REP_EMAIL_FLAG + "' />").appendTo(_div).click(function () {
                    $('.repflag').removeClass('selected').attr('value', '0');
                    $(this).addClass('selected').attr('value', '1');
                });

                var _select = $("<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle emailtype'></select>").appendTo(_div);
                _M.f.c.SetOptionCode(_select, 'EMAIL_TYPE', '선택', false);
                $(_select).val(data.EMAIL_TYPE);

                $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle email' value='" + data.EMAIL + "' />").appendTo(_div);
                $("<span class='icon i-20 icon-x extrabtn del align-middle'></span>").appendTo(_div);
                $("<span class='icon i-20 icon-xx extrabtn gen align-middle'></span>").appendTo(_div).click(function () {
                    GenField();
                    attachQtip();
                    $('.gen').css('visibility', 'hidden');
                    $('.gen:last').css('visibility', 'visible');
                });

                if (data.BAD_EMAIL_FLAG == null || data.BAD_EMAIL_FLAG == undefined) { data.BAD_EMAIL_FLAG = '0'; };
                $("<input type='checkbox' class='badflag align-middle' value='" + data.BAD_EMAIL_FLAG + "' />").appendTo(_div);

                $('#MultiEmail').attr('mode', 'edit');
            });
        } else { // 2013.07.22 dmjung :: 데이터가 없을 경우, 입력란 하나 생성
            GenField();
            var emailtype = $('.emailtype', object).val();
            var email = $('.email', object).val();
            $('.emailtype', '#MultiEmail').val(emailtype);
            $('.email', '#MultiEmail').val(email);
            $('#MultiEmail').attr('mode', 'new');
        };
        $('.repflag[value=1]', '#MultiEmail').trigger('click').attr('checked', true);
        $('.badflag[value=1]', '#MultiEmail').trigger('click').attr('checked', true);
        $('.gen').css('visibility', 'hidden');
        $('.gen:last').css('visibility', 'visible');

        $('#MultiEmail').dialog({ autoOpen: false,
            width: dlgWidth,
            height: 'auto',
            modal: true,
            closeOnEscape: false,
            resizable: false,
            title: title,
            buttons: {
                "이메일 저장": function () {
                    //var requireFlg = true;  //TODO 부모필드 속성의 필수 여부
                    var notRowsFlg = false;
                    if ($('.contactlines', '#MultiEmail').size() == 1 && $('.contactlines', '#MultiEmail').hasClass('last') == true) {
                        notRowsFlg = true;
                    }
                    var cnt = 0;
                    var cnt2 = 0;
                    var cnt3 = 0;
                    if (notRowsFlg == false) {
                        $('.email', '#MultiEmail').each(function (index) {
                            if ($(this).val() == undefined || $(this).val() == '') {
                                cnt++;
                            }
                        });
                        $('.emailtype', '#MultiEmail').each(function (index) {
                            if ($(this).val() == '' || $(this).val() == undefined || $(this).val() == null) {
                                cnt2++;
                            }
                        });
                        if ($('.repflag[value=1]').size() == 0) {
                            cnt3++;
                        } else if (cnt3 != 0) {
                            alert('대표이메일을 선택해주세요');
                            return;
                        } else if (cnt2 != 0) {
                            alert('이메일 유형을 선택해주세요');
                            cnt = 0;
                            cnt2 = 0;
                            return;
                        } else if (cnt != 0) {
                            alert('입력되지 않은 이메일 주소가 있습니다.');
                            cnt = 0;
                            cnt2 = 0;
                            return;
                        }
                    }

                    $(document.body).append('<div id="tabledailog"></div>');
                    $('#tabledailog').html("데이터를 저장하시겠습니까?");
                    $('#tabledailog').dialog({ autoOpen: false, width: 320, height: 200, modal: true, closeOnEscape: false,
                        title: '이메일 저장',
                        buttons: {
                            "확인": function () {
                                $('.badflag').attr('value', '0');
                                $('.badflag:checked').attr('value', '1');
                                var pl = new JSONClientParameters();
                                pl.add("service", 'MON_COMMON');
                                pl.add("method", 'EMAIL_MGMT_DELETE');
                                pl.add("JOB_TYPE", jobType);
                                pl.add("EMAIL_KEY", _key);
                                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
                                }, function (response) {
                                    alert(response.Message);
                                }, _M.aSync.sync);
                                if (notRowsFlg == false) {
                                    var mode = $('#MultiEmail').attr('mode');
                                    var pl = new JSONClientParameters();
                                    pl.add("service", 'MON_COMMON');
                                    pl.add("method", 'EMAIL_MGMT_CREATE');
                                    pl.add("JOB_TYPE", jobType);
                                    pl.add("EMAIL_KEY", _key);
                                    $('#MultiEmail').find('.contactlines').each(function (index) {
                                        pl.add("REP_EMAIL_FLAG", $(this).find('.repflag').val());
                                        pl.add("EMAIL_TYPE", $(this).find('.emailtype').val());
                                        pl.add("EMAIL", $(this).find('.email').val());
                                        pl.add("BAD_EMAIL_FLAG", $(this).find('.badflag').val());
                                        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
                                        }, function (response) {
                                            alert(response.Message);
                                        }, _M.aSync.sync);
                                    });
                                }
                                callback();
                                $('#MultiEmail').dialog("close");
                                $('#tabledailog').dialog('close');
                                $('.qtip').remove();
                                alert('저장되었습니다.');
                            },
                            "취소": function () {
                                $('#tabledailog').remove();
                                $('#tabledailog').dialog('close');
                            }
                        }
                    });
                    $('#tabledailog').dialog('open');
                },
                "닫기": function () {
                    $('#MultiAddress, #MultiTel, #MultiEmail').dialog('close');
                }
            }
        });
        $('#MultiEmail').dialog('open');

        // 2013.07.25 dmjung :: 대표이미지 안내용 qtip 셋팅 및 dialog close 시 제거
        $('.ui-dialog-titlebar-close').click(function () {
            $('.qtip').remove();
        });

        $(document).on('click', '.del', function () {
            $('.gen').css('visibility', 'hidden');
            $(this).parent().remove();
            if ($('.contactlines', '#MultiEmail').size() == 0) {
                GenField();
                $('.contactlines', '#MultiEmail').addClass('last');
                $('.repflag', '#MultiEmail').trigger('click');
                attachQtip();
            }
            $('.gen:last').css('visibility', 'visible');
        });

        attachQtip();
        function attachQtip() {
            $('.qtip').remove();
            $('.repflag').qtip({
                content: '<b>대표 이메일 지정</b>',
                position: {
                    corner: {
                        target: 'rightMiddle',
                        tooltip: 'rightMiddle'
                    },
                    adjust: {
                        x: -25,
                        y: 0
                    }
                },
                style: {
                    background: $('.ui-dialog-titlebar').css('background-color'),
                    color: '#FFFFFF',
                    border: {
                        width: 6,
                        radius: 4,
                        color: $('.ui-dialog').css('background-color')
                    },
                    tip: 'rightMiddle'
                }
            });
            $('.badflag').qtip({
                content: '<b>불량 이메일 체크</b>',
                position: {
                    corner: {
                        target: 'leftMiddle',
                        tooltip: 'leftMiddle'
                    },
                    adjust: {
                        x: 32,
                        y: 0
                    }
                },
                style: {
                    background: $('.ui-dialog-titlebar').css('background-color'),
                    color: '#FFFFFF',
                    border: {
                        width: 6,
                        radius: 4,
                        color: $('.ui-dialog').css('background-color')
                    },
                    tip: 'leftMiddle'
                }
            });
        };
    };

    // 2013.07.25 dmjung :: MultiEmail 팝업창 종료 ::::::::::::::::::::::::::::::::::::::::::::::::::::::









    // 2013.07.22 dmjung :: pop.. MultiTel 팝업용 메시지 박스 생성. 팝업 제목, 크기, 키 값, 확인 버튼 이후의 콜백을 파라메터로 받는다.
    $.MultiTel = function (title, width, height, key, object, callback) {

        $('#MultiTel').remove();
        $(document.body).append('<div id="MultiTel"></div>');
        var dlgWidth = 400;
        if (width != undefined && width != '') {
            dlgWidth = width;
        }
        var dlgHeight = 400;
        if (height != undefined && height != '') {
            dlgHeight = height;
        }

        // 2013.07.22 dmjung :: GenField, 데이터 입력 Row 를 생성해 줌. 체크박스, 이메일 유형, 이메일 주소와 버튼 포함.
        function GenField() {

            var _div = $("<div class='contactlines'></div>").appendTo($('#MultiTel'));
            $("<input type='radio' name='selectRep' class='repflag align-middle' value='0' />").appendTo(_div).click(function () {
                $('.repflag').removeClass('selected').attr('value', '0');
                $(this).addClass('selected').attr('value', '1');
            });
            if ($('.repflag', '#MultiTel').size() == 1) {
                $('.repflag', '#MultiTel').attr('value', '1').trigger('click');
            };

            var _select = $("<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle teltype'></select>").appendTo(_div).click(function () {
                $(this).parent().removeClass('last');
            });
            _M.f.c.SetOptionCode(_select, 'TEL_TYPE', '선택', false);

            $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle telno' type='text' value='' />").appendTo(_div).keypress(function () {
                $(this).parent().removeClass('last');
            });
            $("<span class='icon i-20 icon-x extrabtn del align-middle'></span>").appendTo(_div);

            $("<span class='icon i-20 icon-xx extrabtn gen align-middle'></span>").appendTo(_div).click(function () {
                GenField();
                attachQtip();
                $('.gen').css('visibility', 'hidden');
                $('.gen:last').css('visibility', 'visible');
            });

            $("<input type='checkbox' class='badflag align-middle' value='0'/>").appendTo(_div);
        };

        var _key = key;

        // 2013.07.22 dmjung :: 신규생성한 MultiEmailList 를 LIST 메소드 형태로 호출하여 데이터를 받아옴
        var option = object.parents('.SuperView').data('jsonData');
        var jobType = object.parents('.fieldContaner').attr('jobType');
        var ds = _Obj.superContaner('MultiContactList', _key, 'LIST', 'TEL_MGMT', 'TEL', jobType);

        // 2013.07.22 dmjung :: 데이터가 있는 경우, 해당 데이터 수 만큼 MultiEmail 팝업 박스에 데이터들을 표시해준다.
        if (ds.resultData.length != 0) {
            $(ds.resultData).each(function (index, data) {
                var _div = $("<div class='contactlines' no='" + data.M_TEL_MGMT_NO + "'></div>").appendTo($('#MultiTel'));

                $("<input type='radio' name='selectRep' class='repflag align-middle' value='" + data.REP_TEL_FLAG + "' />").appendTo(_div).click(function () {
                    $('.repflag').removeClass('selected').attr('value', '0');
                    $(this).addClass('selected').attr('value', '1');
                });

                var _select = $("<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle teltype'></select>").appendTo(_div);
                _M.f.c.SetOptionCode(_select, 'TEL_TYPE', '선택', false);
                $(_select).val(data.TEL_TYPE);

                $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle telno' value='" + data.TEL_NO + "' />").appendTo(_div);
                $("<span class='icon i-20 icon-x extrabtn del align-middle'></span>").appendTo(_div);
                $("<span class='icon i-20 icon-xx extrabtn gen align-middle'></span>").appendTo(_div).click(function () {
                    GenField();
                    attachQtip();
                    $('.gen').css('visibility', 'hidden');
                    $('.gen:last').css('visibility', 'visible');
                });

                if (data.BAD_TEL_FLAG == null || data.BAD_TEL_FLAG == undefined) { data.BAD_TEL_FLAG = '0'; };
                $("<input type='checkbox' class='badflag align-middle' value='" + data.BAD_TEL_FLAG + "' />").appendTo(_div);

                $('#MultiTel').attr('mode', 'edit');
            });
        } else { // 2013.07.22 dmjung :: 데이터가 없을 경우, 입력란 하나 생성
            GenField();
            var teltype = $('.teltype', object).val();
            var telno = $('.telno', object).val();
            $('.teltype', '#MultiTel').val(teltype);
            $('.telno', '#MultiTel').val(telno);
            $('#MultiTel').attr('mode', 'new');
        };
        $('.repflag[value=1]', '#MultiTel').trigger('click').attr('checked', true);
        $('.badflag[value=1]', '#MultiTel').trigger('click').attr('checked', true);
        $('.gen').css('visibility', 'hidden');
        $('.gen:last').css('visibility', 'visible');

        $('#MultiTel').dialog({ autoOpen: false,
            width: dlgWidth,
            height: 'auto',
            modal: true,
            closeOnEscape: false,
            resizable: false,
            title: title,
            buttons: {
                "연락처 저장": function () {
                    //var requireFlg = true;  //TODO 부모필드 속성의 필수 여부
                    var notRowsFlg = false;
                    if ($('.contactlines', '#MultiEmail').size() == 1 && $('.contactlines', '#MultiEmail').hasClass('last') == true) {
                        notRowsFlg = true;
                    }

                    var cnt = 0;
                    var cnt2 = 0;
                    var cnt3 = 0;
                    if (notRowsFlg == false) {
                        $('.telno', '#MultiTel').each(function (index) {
                            if ($(this).val() == undefined || $(this).val() == '') {
                                cnt++;
                            }
                        });
                        $('.teltype', '#MultiTel').each(function (index) {
                            if ($(this).val() == '' || $(this).val() == undefined || $(this).val() == null) {
                                cnt2++;
                            }
                        });
                        if ($('.repflag[value=1]').size() == 0) {
                            cnt3++;
                        } else if (cnt3 != 0) {
                            alert('대표 연락처를 선택해주세요');
                            return;
                        } else if (cnt2 != 0) {
                            alert('연락처 유형을 선택해주세요');
                            cnt = 0;
                            cnt2 = 0;
                            return;
                        } else if (cnt != 0) {
                            alert('입력되지 않은 연락처 주소가 있습니다.');
                            cnt = 0;
                            cnt2 = 0;
                            return;
                        }
                    }
                    $(document.body).append('<div id="tabledailog"></div>');
                    $('#tabledailog').html("데이터를 저장하시겠습니까?");
                    $('#tabledailog').dialog({ autoOpen: false, width: 320, height: 200, modal: true, closeOnEscape: false,
                        title: '연락처 저장',
                        buttons: {
                            "확인": function () {
                                $('.badflag').attr('value', '0');
                                $('.badflag:checked').attr('value', '1');
                                var pl = new JSONClientParameters();
                                pl.add("service", 'MON_COMMON');
                                pl.add("method", 'TEL_MGMT_DELETE');
                                pl.add("TEL_KEY", _key);
                                pl.add("JOB_TYPE", jobType);
                                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
                                }, function (response) {
                                    alert(response.Message);
                                }, _M.aSync.sync);
                                if (notRowsFlg == false) {
                                    var mode = $('#MultiTel').attr('mode');
                                    var pl = new JSONClientParameters();
                                    pl.add("service", 'MON_COMMON');
                                    pl.add("method", 'TEL_MGMT_CREATE');
                                    pl.add("JOB_TYPE", jobType);
                                    pl.add("TEL_KEY", _key);
                                    $('#MultiTel').find('.contactlines').each(function (index) {
                                        pl.add("REP_TEL_FLAG", $(this).find('.repflag').val());
                                        pl.add("TEL_TYPE", $(this).find('.teltype').val());
                                        pl.add("TEL_NO", $(this).find('.telno').val());
                                        pl.add("BAD_TEL_FLAG", $(this).find('.badflag').val());
                                        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
                                        }, function (response) {
                                            alert(response.Message);
                                        }, _M.aSync.sync);
                                    });
                                    callback();
                                    $('#MultiTel').dialog("close");
                                    $('#tabledailog').dialog('close');
                                    $('.qtip').remove();
                                    alert('저장되었습니다.');
                                }
                            },
                            "취소": function () {
                                $('#tabledailog').remove();
                                $('#tabledailog').dialog('close');
                            }
                        }
                    });
                    $('#tabledailog').dialog('open');
                },
                "닫기": function () {
                    $('#MultiAddress, #MultiTel, #MultiEmail').dialog('close');
                }
            }
        });
        $('#MultiTel').dialog('open');

        // 2013.07.25 dmjung :: 대표이미지 안내용 qtip 셋팅 및 dialog close 시 제거
        $('.ui-dialog-titlebar-close').click(function () {
            $('.qtip').remove();
        });

        $(document).on('click', '.del', function () {
            $('.gen').css('visibility', 'hidden');
            $(this).parent().remove();
            if ($('.contactlines', '#MultiTel').size() == 0) {
                GenField();
                $('.contactlines', '#MultiTel').addClass('last');
                $('.repflag', '#MultiTel').trigger('click');
                attachQtip();
            }
            $('.gen:last').css('visibility', 'visible');
        });

        attachQtip();
        function attachQtip() {
            $('.qtip').remove();
            $('.repflag').qtip({
                content: '<b>대표 연락처 지정</b>',
                position: {
                    corner: {
                        target: 'rightMiddle',
                        tooltip: 'rightMiddle'
                    },
                    adjust: {
                        x: -25,
                        y: 0
                    }
                },
                style: {
                    background: $('.ui-dialog-titlebar').css('background-color'),
                    color: '#FFFFFF',
                    border: {
                        width: 6,
                        radius: 4,
                        color: $('.ui-dialog').css('background-color')
                    },
                    tip: 'rightMiddle'
                }
            });
            $('.badflag').qtip({
                content: '<b>불량 연락처 체크</b>',
                position: {
                    corner: {
                        target: 'leftMiddle',
                        tooltip: 'leftMiddle'
                    },
                    adjust: {
                        x: 32,
                        y: 0
                    }
                },
                style: {
                    background: $('.ui-dialog-titlebar').css('background-color'),
                    color: '#FFFFFF',
                    border: {
                        width: 6,
                        radius: 4,
                        color: $('.ui-dialog').css('background-color')
                    },
                    tip: 'leftMiddle'
                }
            });
        };
    };

    // 2013.07.25 dmjung :: MultiTel 팝업창 종료 ::::::::::::::::::::::::::::::::::::::::::::::::::::::



















    // 2013.07.22 dmjung :: pop.. MultiAddress 팝업용 메시지 박스 생성. 팝업 제목, 크기, 키 값, 확인 버튼 이후의 콜백을 파라메터로 받는다.
    $.MultiAddress = function (title, width, height, key, object, callback) {

        $('#MultiAddress').remove();
        $(document.body).append('<div id="MultiAddress"></div>');
        var dlgWidth = 400;
        if (width != undefined && width != '') {
            dlgWidth = width;
        }
        var dlgHeight = 400;
        if (height != undefined && height != '') {
            dlgHeight = height;
        }

        // 2013.07.22 dmjung :: GenField, 데이터 입력 Row 를 생성해 줌. 체크박스, 이메일 유형, 이메일 주소와 버튼 포함.
        function GenField() {

            var _div = $("<div class='contactlines' style='width:340px; margin:6px auto 0px;'></div>").appendTo($('#MultiAddress'));
            $("<input type='radio' name='selectRep' class='repflag align-middle' value='0' />").appendTo(_div).click(function () {
                $('.repflag').removeClass('selected').attr('value', '0');
                $(this).addClass('selected').attr('value', '1');
            });

            if ($('.repflag', '#MultiAddress').size() == 1) {
                $('.repflag', '#MultiAddress').attr('value', '1').trigger('click');
            };

            var _select = $("<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle addrtype' style='width:60px; margin-left:4px;'></select>").appendTo(_div).click(function () {
                $(this).parent().removeClass('last');
            });
            _M.f.c.SetOptionCode(_select, 'ADDR_TYPE', '선택', false);

            $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle zipcode' readonly='readonly' type='text' style='width:60px;' value='' />").appendTo(_div).keypress(function () {
                $(this).parent().removeClass('last');
            });
            $("<span class='icon i-20 icon-geolocate align-middle'></span>").appendTo(_div).click(function (e) {
                var _fC = $(this).parents('.contactlines');
                $.ZipPopUp(function (zipCode, state, city, street, address, tr) {
                    $('input.zipcode', _fC).val(zipCode);
                    $('input.address', _fC).val(state + " " + city)
                    .attr('ZIP_CODE', zipCode).attr('STATE', state).attr('CITY', city).attr('STREET', street).attr('ADDRESS', address);
                    $('input.address2', _fC).val(street);
                    _fC.attr('value', zipCode + "," + state + "," + city + "," + street + "," + address);
                });
            });

            $("<input type='checkbox' class='badflag align-middle' style='margin:3px 3px 0px 0px; float:right;' value='0'/>").appendTo(_div);


            $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle address' readonly='readonly' type='text' style='width:78%; margin:1px 0px 1px 17px;' value='' />").appendTo(_div);
            $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle address2' type='text' style='width:78%; margin:0px 0px 1px 17px;' value='' />").appendTo(_div);

            $("<span class='icon i-20 icon-x extrabtn del align-middle'></span>").appendTo(_div);

            $("<span class='icon i-20 icon-xx extrabtn gen align-middle'></span>").appendTo(_div).click(function () {
                GenField();
                attachQtip();
                $('.gen').css('visibility', 'hidden');
                $('.gen:last').css('visibility', 'visible');
            });
        };

        var _key = key;

        // 2013.07.22 dmjung :: 신규생성한 MultiEmailList 를 LIST 메소드 형태로 호출하여 데이터를 받아옴
        var option = object.parents('.SuperView').data('jsonData');
        var jobType = object.parents('.fieldContaner').attr('jobType');
        var ds = _Obj.superContaner('MultiContactList', _key, 'LIST', 'ADDR_MGMT', 'ADDR', jobType);

        // 2013.07.22 dmjung :: 데이터가 있는 경우, 해당 데이터 수 만큼 MultiEmail 팝업 박스에 데이터들을 표시해준다.
        if (ds.resultData.length != 0) {
            $(ds.resultData).each(function (index, data) {
                var _div = $("<div class='contactlines' style='width:340px; margin:6px auto 0px;' no='" + data.M_ADDR_MGMT_NO + "'></div>").appendTo($('#MultiAddress'));

                $("<input type='radio' name='selectRep' class='repflag align-middle' value='" + data.REP_ADDR_FLAG + "' />").appendTo(_div).click(function () {
                    $('.repflag').removeClass('selected').attr('value', '0');
                    $(this).addClass('selected').attr('value', '1');
                });

                var _select = $("<select class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle addrtype' style='width:60px; margin-left:4px;'></select>").appendTo(_div);
                _M.f.c.SetOptionCode(_select, 'ADDR_TYPE', '선택', false);
                $(_select).val(data.ADDR_TYPE);

                $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle zipcode' type='text' style='width:60px;' value='" + data.ZIP_CODE + "' />").appendTo(_div);
                $("<span class='icon i-20 icon-geolocate align-middle'></span>").appendTo(_div).click(function (e) {
                    var _fC = $(this).parents('.contactlines');
                    $.ZipPopUp(function (zipCode, state, city, street, address, tr) {
                        $('input.zipcode', _fC).val(zipCode);
                        $('input.address', _fC).val(state + " " + city)
                        .attr('ZIP_CODE', zipCode).attr('STATE', state).attr('CITY', city).attr('STREET', street).attr('ADDRESS', address);
                        $('input.address2', _fC).val(street);
                        _fC.attr('value', zipCode + "," + state + "," + city + "," + street + "," + address);
                    });
                });

                if (data.BAD_ADDR_FLAG == null || data.BAD_ADDR_FLAG == undefined) { data.BAD_ADDR_FLAG = '0'; };
                $("<input type='checkbox' class='badflag align-middle' style='margin:3px 3px 0px 0px; float:right;' value='" + data.BAD_ADDR_FLAG + "'/>").appendTo(_div);


                $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle address' type='text' style='width:78%; margin:1px 0px 1px 17px;' state='" + data.STATE + "' city='" + data.CITY + "' value='" + data.STATE + " " + data.CITY + "' />").appendTo(_div);
                $("<input class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle address2' type='text' style='width:78%; margin:0px 0px 1px 17px;' value='" + data.STREET + "' />").appendTo(_div);


                $("<span class='icon i-20 icon-x extrabtn del align-middle'></span>").appendTo(_div);
                $("<span class='icon i-20 icon-xx extrabtn gen align-middle'></span>").appendTo(_div).click(function () {
                    GenField();
                    attachQtip();
                    $('.gen').css('visibility', 'hidden');
                    $('.gen:last').css('visibility', 'visible');
                });

                $('#MultiAddress').attr('mode', 'edit');
            });
        } else { // 2013.07.22 dmjung :: 데이터가 없을 경우, 입력란 하나 생성
            GenField();
            var addrtype = $('input.addrtype', object).val();
            var zip = $('input.zipcode', object).val();
            var addr = $('input.address', object).val();
            var addr2 = $('input.address2', object).val();
            $('input.addrtype', '#MultiAddress').val(addrtype);
            $('input.zipcode', '#MultiAddress').val(zip);
            $('input.address', '#MultiAddress').val(addr);
            $('input.address2', '#MultiAddress').val(addr2);
            $('#MultiAddress').attr('mode', 'new');
        };
        $('.repflag[value=1]', '#MultiAddress').trigger('click').attr('checked', true);
        $('.badflag[value=1]', '#MultiAddress').trigger('click').attr('checked', true);
        $('.gen').css('visibility', 'hidden');
        $('.gen:last').css('visibility', 'visible');

        $('#MultiAddress').dialog({ autoOpen: false,
            width: dlgWidth,
            height: 'auto',
            modal: true,
            closeOnEscape: false,
            resizable: false,
            title: title,
            buttons: {
                "주소 저장": function () {
                    var notRowsFlg = false;
                    if ($('.contactlines', '#MultiAddress').size() == 1 && $('.contactlines', '#MultiAddress').hasClass('last') == true) {
                        notRowsFlg = true;
                    }
                    var cnt = 0;
                    var cnt2 = 0;
                    var cnt3 = 0;
                    if (notRowsFlg == false) {
                        $('input.address', '#MultiAddress').each(function (index) {
                            if ($(this).val() == undefined || $(this).val() == '') {
                                cnt++;
                            }
                        });
                        $('select.addrtype', '#MultiAddress').each(function (index) {
                            if ($(this).val() == '' || $(this).val() == undefined || $(this).val() == null) {
                                cnt2++;
                            }
                        });
                        if ($('.repflag[value=1]').size() == 0) {
                            cnt3++;
                        } else if (cnt3 != 0) {
                            alert('대표 주소를 선택해주세요');
                            return;
                        } else if (cnt2 != 0) {
                            alert('주소 유형을 선택해주세요');
                            cnt = 0;
                            cnt2 = 0;
                            return;
                        } else if (cnt != 0) {
                            alert('입력되지 않은 주소가 있습니다.');
                            cnt = 0;
                            cnt2 = 0;
                            return;
                        }
                    }
                    $(document.body).append('<div id="tabledailog"></div>');
                    $('#tabledailog').html("주소 데이터를 저장하시겠습니까?");
                    $('#tabledailog').dialog({ autoOpen: false, width: 320, height: 200, modal: true, closeOnEscape: false,
                        title: '주소 저장',
                        buttons: {
                            "확인": function () {
                                $('.badflag').attr('value', '0');
                                $('.badflag:checked').attr('value', '1');
                                var pl = new JSONClientParameters();
                                pl.add("service", 'MON_COMMON');
                                pl.add("method", 'ADDR_MGMT_DELETE');
                                pl.add("JOB_TYPE", jobType);
                                pl.add("ADDR_KEY", _key);
                                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
                                }, function (response) {
                                    alert(response.Message);
                                }, _M.aSync.sync);
                                if (notRowsFlg == false) {
                                    var mode = $('#MultiAddress').attr('mode');
                                    var pl = new JSONClientParameters();
                                    pl.add("service", 'MON_COMMON');
                                    pl.add("method", 'ADDR_MGMT_CREATE');
                                    pl.add("JOB_TYPE", jobType);
                                    pl.add("ADDR_KEY", _key);
                                    $('#MultiAddress').find('.contactlines').each(function (index) {
                                        pl.add("REP_ADDR_FLAG", $(this).find('.repflag').val());
                                        pl.add("ADDR_TYPE", $(this).find('select.addrtype').val());
                                        pl.add("ZIP_CODE", $(this).find('input.zipcode').val());
                                        pl.add("STATE", $(this).find('input.address').attr('state'));
                                        pl.add("CITY", $(this).find('input.address').attr('city'));
                                        pl.add("STREET", $(this).find('input.address2').val());
                                        pl.add("BAD_ADDR_FLAG", $(this).find('.badflag').val());
                                        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
                                        }, function (response) {
                                            alert(response.Message);
                                        }, _M.aSync.sync);
                                    });
                                    callback();
                                    $('#MultiAddress').dialog("close");
                                    $('#tabledailog').dialog('close');
                                    $('.qtip').remove();
                                    alert('저장되었습니다.');
                                }
                            },
                            "취소": function () {
                                $('#tabledailog').remove();
                                $('#tabledailog').dialog('close');
                            }
                        }
                    });
                    $('#tabledailog').dialog('open');
                },
                "닫기": function () {
                    $('#MultiAddress, #MultiTel, #MultiEmail').dialog('close');
                }
            }
        });
        $('#MultiAddress').dialog('open');

        // 2013.07.25 dmjung :: 대표이미지 안내용 qtip 셋팅 및 dialog close 시 제거
        $('.ui-dialog-titlebar-close').click(function () {
            $('.qtip').remove();
        });

        $(document).on('click', '.del', function () {
            $('.gen').css('visibility', 'hidden');
            $(this).parent().remove();
            if ($('.contactlines', '#MultiAddress').size() == 0) {
                GenField();
                $('.contactlines', '#MultiAddress').addClass('last');
                $('.repflag', '#MultiAddress').trigger('click');
                attachQtip();
            }
            $('.gen:last').css('visibility', 'visible');
        });

        attachQtip();
        function attachQtip() {
            $('.qtip').remove();
            $('.repflag').qtip({
                content: '<b>대표 주소 지정</b>',
                position: {
                    corner: {
                        target: 'rightMiddle',
                        tooltip: 'rightMiddle'
                    },
                    adjust: {
                        x: -25,
                        y: 0
                    }
                },
                style: {
                    background: $('.ui-dialog-titlebar').css('background-color'),
                    color: '#FFFFFF',
                    border: {
                        width: 6,
                        radius: 4,
                        color: $('.ui-dialog').css('background-color')
                    },
                    tip: 'rightMiddle'
                }
            });
            $('.badflag').qtip({
                content: '<b>불량 주소 체크</b>',
                position: {
                    corner: {
                        target: 'leftMiddle',
                        tooltip: 'leftMiddle'
                    },
                    adjust: {
                        x: 32,
                        y: 0
                    }
                },
                style: {
                    background: $('.ui-dialog-titlebar').css('background-color'),
                    color: '#FFFFFF',
                    border: {
                        width: 6,
                        radius: 4,
                        color: $('.ui-dialog').css('background-color')
                    },
                    tip: 'leftMiddle'
                }
            });
        };
    };

    // 2013.07.25 dmjung :: MultiAddress 팝업창 종료 ::::::::::::::::::::::::::::::::::::::::::::::::::::::






















    $.Confirm = function (msg) {
        var result = false;
        var response = false;

        $.MessageBox("OK", msg, function (r) {
            result = r;
            response = true;
        });

        while (!response) continue; // wait
        return result;

    };
    $.MakeTwitterLink = function (Content, url) {
        var link = "https://twitter.com/intent/tweet?text=";
        link += encodeURIComponent(Content);
        link += encodeURIComponent(url);
        window.open(link, 'window', 'location=no, directories=no, status=yes,scrollbars=yes,resizable=yes, toolbar=yes,menubar=yes,width=800,height=500');
        return rlt;
    }

    //===============================================================================
    //*******************************************************************************
    //   서비스 콜 공용함수들..
    //*******************************************************************************
    //===============================================================================
    // 서비스를 실행하고 결과를 리스트형태로 받는다
    $.SvcCall = function (SvcID, CRUD, XmlParm) {
        var XmlParms = "<DataTable>";
        XmlParms += "<Record";
        XmlParms += " CRUD ='" + CRUD + "'";
        XmlParms += " SvcID ='" + SvcID + "'";
        XmlParms += " >";
        XmlParms += XmlParm;
        XmlParms += "<UID>" + MonArch.UINFO.id + "</UID>";
        XmlParms += "</Record></DataTable>";

        var pl = new JSONClientParameters();
        pl.add("SvcID", SvcID);
        pl.add("XmlParms", XmlParms);
        data = PostJsonSync(WSU, pl);
        if (data == undefined) return undefined;
        if (data.Records.length == 0) return undefined;
        return data.Records;
    };
    // 서비스를 실행하고 결과를 bool형태로 받는다
    $.SvcExcute = function (SvcID, CRUD, XmlParm) {
        var XmlParms = "<DataTable>";
        XmlParms += "<Record";
        XmlParms += " CRUD ='" + CRUD + "'";
        XmlParms += " SvcID ='" + SvcID + "'";
        XmlParms += " >";
        XmlParms += XmlParm;
        XmlParms += "<UID>" + MonArch.UINFO.id + "</UID>";
        XmlParms += "</Record></DataTable>";

        var pl = new JSONClientParameters();
        pl.add("SvcID", SvcID);
        pl.add("XmlParms", XmlParms);
        data = PostJsonSync(WSU, pl);
        if (data == undefined) return false;
        if (data.rlt != "OK") return false;
        return true;
    };

    $.M5 = function (_str) {
        var rlt = '';
        var pl = new JSONClientParameters();
        pl.add("str", _str);

        PostData(_M.svcUrl[_M.Webtype].M5Hash, pl, function (data) {
            rlt = data.rlt;
        }
        , function (response) {
            alert(response.Message);
        }, _M.aSync.sync);
        return rlt;
    };

    $.SvcGetRow = function (service, method, fldName, fldValue, CallBack) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", method);
        pl.add(fldName, fldValue);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            // CallBack(data.Table.Rows[0]);
            CallBack(data.resultData[0]); //20121206 khma
        }, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };

    $.HtmlGet = function (fldValue) {
        var rltHtml = '';
        var pl = new JSONClientParameters();
        //pl.add("service", "공통서비스");
        //pl.add("method", "HTMLREAD");
        //pl.add("구조체명", fldValue);
        pl.add("JsName", fldValue);
        pl.add("srcType", "html");

        PostJsonData(_M.svcUrl[_M.Webtype].GetJs, pl, function (data) {
            //rltHtml = data.Table.Rows[0]["HTML내용"];
            rltHtml = data.resultData["HTML_CONT"];

        }, function (response) {
            alert(response.Message);
        }, false);

        return rltHtml;
    };

    $.SvcRun = function (service, method, order, viewpage, pagecnt, CallBack) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", method);
        pl.add("_order", order);
        pl.add("_viewpage", viewpage);
        pl.add("_pagecnt", pagecnt);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            alert(response.Message);
        }, _M.aSync.async);
    };

    $.SvcGetCode = function (CodeGroup, CallBack, synctf) {
        if (CodeGroup == '1' || CodeGroup == '') return;
        var pl = new JSONClientParameters();
        //pl.add("service", "공통코드");
        //pl.add("method", "GETCODE");
        pl.add("CODE_GRP", CodeGroup);
        //var url = _M.svcUrl.crudUrl; 20120829캐쉬정보로 읽어오도록 수정
        var _syncTf = synctf;
        if (synctf == undefined) {
            _syncTf = _M.aSync.sync;
        }
        PostJsonData(_M.svcUrl[_M.Webtype].GetCode, pl, CallBack, function (response) {
            //alert(response.Message);
        }, _syncTf);
    };

    $.SvcGetSvcCode = function (svc, method, CallBack, synctf, parentKey, parentField) {
        var pl = new JSONClientParameters();
        pl.add("service", svc);
        pl.add("method", method);
		if(undefined != parentKey){
			pl.add(parentField, parentKey);
		}
        var _syncTf = synctf;
        if (synctf == undefined) {
            _syncTf = _M.aSync.sync;
        }
        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            //alert(response.Message);
        }, _syncTf);
    };


    $.SvcMultiCode = function (seObj, CodeGroup, Group1, Group2, Group3, service, method) { //815버전에서 미사용가능성있음 김정원
        var pl = new JSONClientParameters();
        pl.add("service", service == undefined ? "공통코드" : service);
        pl.add("method", method == undefined ? "GETMULTICODE" : method);
        pl.add("CODE_GRP", CodeGroup);
        pl.add("CODE_NAME", Group1 == undefined ? "" : Group1);
        pl.add("CODE_NAME2", Group2 == undefined ? "" : Group2);
        pl.add("CODE_NAME3", Group3 == undefined ? "" : Group3);

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            for (var i = seObj.get(0).length - 1; i >= 1; i--) { seObj.get(0).options[i] = null; };
            seObj.get(0).options[0] = new Option("", "");
            $.each(data.resultData, function (index, row) {
                seObj.get(0).options[index + 1] = new Option(row['DECODE'], row['CODE']);
            });
        }, function (response) {
            alert(response.Message);
        }, _M.aSync.sync);
    };
	
	$.SvcGetCodes = function (CodeGroup, CallBack, synctf) {
		if (CodeGroup == '1' || CodeGroup == '') return;
        var pl = new JSONClientParameters();
        pl.add("CODE_GRP", CodeGroup);
        //var url = _M.svcUrl.crudUrl; 20120829캐쉬정보로 읽어오도록 수정
        PostJsonData("GetCodes.json", pl, CallBack, function (response) {
            //alert(response.Message);
        }, ((synctf == undefined) ? _M.aSync.sync : synctf));
	};

    $.SvcCallPl = function (service, method, _pl, CallBack, _IsSync) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", method);

        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                pl.add(p, ppl[p]);
            }
        };
        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, CallBack, function (response) {
            //alert(response.Message);        	
            return false; //20121127 PKH 에러발생후 다음 진행 중단처리.
        }, _IsSync);
    };

    $.SvcDownCsv = function (service, _pl) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", "EXCEL");
        pl.add("type", "CSV");

        var param = "";
        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                param += ",'" + p + "':'" + ppl[p] + "'";
                pl.add(p, ppl[p]);
            }
        };

        //location.href = _M.svcUrl[_M.Webtype].exceldown + "?XmlParms={'service':'" + service + "','method':'EXCEL','type':'CSV'" + param + "}";
		
		var bodyObject = $("body");
		$("#csvForm", bodyObject).remove();
		var form = $("<form id='csvForm' name='csvForm' method='post'> </form>").appendTo(bodyObject);
		var value = "{'service':'" + service + "','method':'EXCEL','type':'CSV'" + param + "}";
		$("<input type='hidden' id='XmlParms' name='XmlParms' value='' />").appendTo(form);
		form.find("#XmlParms").val(value);
		form.attr("action", _M.svcUrl[_M.Webtype].exceldown);
		form.submit();
    };

    $.SvcDownXls = function (service, _pl) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", "EXCEL");
        pl.add("type", "XLS");

        var param = "";
        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                param += ",'" + p + "':'" + ppl[p] + "'";
                pl.add(p, ppl[p]);
            }
        };

        //location.href = _M.svcUrl[_M.Webtype].exceldown + "?XmlParms={'service':'" + service + "','method':'EXCEL','type':'XLS'" + param.replace("%", "%25") + "}";
		
		var bodyObject = $("body");
		$("#xlsForm", bodyObject).remove();
		var form = $("<form id='xlsForm' name='xlsForm' method='post'> </form>").appendTo(bodyObject);
		var value = "{'service':'" + service + "','method':'EXCEL','type':'XLS'" + param.replace("%", "%25") + "}";
		$("<input type='hidden' id='XmlParms' name='XmlParms' value='' />").appendTo(form);
		form.find("#XmlParms").val(value);
		form.attr("action", _M.svcUrl[_M.Webtype].exceldown);
		form.submit();
    };

    $.SvcDownXlsOld = function (service, _pl) {
        var pl = new JSONClientParameters();
        pl.add("service", service);
        pl.add("method", "EXCEL");
        pl.add("type", "XLS");

        var param = "";
        if (_pl != undefined) {
            var ppl = _pl.toArray();
            for (var p in ppl) {
                param += ",'" + p + "':'" + ppl[p] + "'";
                pl.add(p, ppl[p]);
            }
        };
        
        location.href = _M.svcUrl.exceldown + "?XmlParms={'service':'" + service + "','method':'EXCEL','type':'XLS'" + param + "}";
    };
    ///////////////////////////////////////////////////////////////////////////////////////////
    // PAGE 호출에 전달된 GET 파라메터를 읽어온다
    ///////////////////////////////////////////////////////////////////////////////////////////
    $.getUrlVars = function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    ///////////////////////////////////////////////////////////////////////////////////////////
    // Json2Str
    ///////////////////////////////////////////////////////////////////////////////////////////
    $.Json2Str = function (obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // array or object
            var json = [], arr = (obj && obj.constructor == Array);

            $.each(obj, function (k, v) {
                t = typeof (v);
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" & v !== null) v = $.serializeJSON(v);
                json.push((arr ? "" : '"' + k + '":') + String(v));
            });

            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////
    // 브라우즈 버전체크
    ///////////////////////////////////////////////////////////////////////////////////////////
    $.getInternetVersion = function () {
        ver = $.browserCheck();
        var rv = -1; // Return value assumes failure.      
        var ua = navigator.userAgent;
        var re = null;
        if (ver == "MSIE") {
            re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        } else {
            re = new RegExp(ver + "/([0-9]{1,}[\.0-9]{0,})");
        }
        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
        return rv;
    };
    //브라우저 종류 및 버전확인  
    $.browserCheck = function () {
        var ver = 0; // 브라우저  버전정보 
        if (navigator.appName.charAt(0) == "N") {
            if (navigator.userAgent.indexOf("Chrome") != -1) {
                return "Chrome";
            } else if (navigator.userAgent.indexOf("Firefox") != -1) {
                return "Firefox";
            } else if (navigator.userAgent.indexOf("Safari") != -1) {
                return "Safari";
            }
        } else if (navigator.appName.charAt(0) == "M") {
            return "MSIE";
        };
    };

    ///////////////////////////////////////////////////////////////////////////////////////////
    //  ContextMenu
    ///////////////////////////////////////////////////////////////////////////////////////////

    $.SetContextMenu = function (ulObj, mnJson, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('.kcontextMenu').remove();

            $(document.body).append("<div class='kcontextMenu DivContext contextMenu " + CssName + "'></div>");

            // json 데이터를 이용하여 메뉴채움
            $.each(mnJson,
                function (index, value) {
                    if (value.img == undefined) {
                        $('<li class="conMenu002" cmd="' + value.cmd + '"><span><a href="#">' + value.title + '</a></span></li>').appendTo($(document.body).find('.kcontextMenu'));
                    } else {
                        $('<li class="conMenu002" cmd="' + value.cmd + '"><span><img src="' + value.img + '"/><a href="#">' + value.title + '</a></span> </li>').appendTo($(document.body).find('.kcontextMenu'));
                    }
                });
            // 메뉴선택시 콜백함수 호출하도록 이벤트 추가함            
            if (callBackFn != undefined) {
                $(document.body).find('.kcontextMenu li').bind("click", function (e) {
                    $(document.body).find('.kcontextMenu').remove();
                    callBackFn($(this), ulObj);
                });
            }

            // 데이터입력형이 메뉴이면 닫기버턴의 클릭을 기다리고
            // 단순 메뉴이면 마우스 이탈시에 자동으로 닫게함
            if (CssName == 'DivContextInput') {
                $(document.body).find('.kcontextMenu').append("<div class='DivContextClose ui-icon ui-icon-circle-close icon i-20 icon-close'></div>");
                $(document.body).find('.DivContextClose').bind("click", function (e) {
                    $(document.body).find('.kcontextMenu').remove();
                });
            }
            else {
                $(document.body).find('.kcontextMenu').bind("mouseleave", function (e) {
                    $(this).remove();
                });
            }

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            $(document.body).find('.kcontextMenu').bind("mouseover", function (e) {
                $(document.body).find('.kcontextMenu').data("MouseOver", true);
            });

            $(document.body).find('.kcontextMenu').data("MouseOver", false);

            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            $(document.body).find('.kcontextMenu').delay(2000).queue(function () {
                if ($(document.body).find('.kcontextMenu').data("MouseOver") == false)
                    $(document.body).find('.kcontextMenu').remove();
            });

            var menutop = $(this).offset().top + $(this).outerHeight();
            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 11;
            $(document.body).find('.kcontextMenu li').css("width", menuwidth);

            if ($(window).width() < ($(this).offset().left + $(document.body).find('.kcontextMenu').width())) {
                menuleft = $(window).width() - $(document.body).find('.kcontextMenu').width() - 5;
            }

            $(document.body).find('.kcontextMenu').css("top", menutop);
            $(document.body).find('.kcontextMenu').css("left", menuleft);
            $(document.body).find('.kcontextMenu').removeClass('contextMenu');

        });
    };
    $.SetContextCode = function (ulObj, codes, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('.kcontextMenu').remove();

            var _pO = $("<div class='kcontextMenu DivContext " + CssName + "'><ul class='DivCodeUl'></ul><div class='DivCodeBtn'></div></div>").appendTo($(document.body));



            _M.f.c.SetLiCode($('.DivCodeUl', _pO), codes, function (li) {
                if (callBackFn != undefined) {
                    callBackFn(li, ulObj);
                    _pO.remove();
                }
            });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };


    $.SetMultiList = function (uiobj, callback) {  //815에서 미사용 예정.
        var fieldEdit = uiobj.parents('.fieldEdit');
        var service = fieldEdit.attr('service');
        var method = fieldEdit.attr('method');
        var codes = fieldEdit.attr('codes');

        var level = uiobj.attr('level');
        var SelVar0 = $('input:eq(0)', fieldEdit).val();
        var SelVar1 = $('input:eq(1)', fieldEdit).val();
        var SelVar2 = $('input:eq(2)', fieldEdit).val();
        var SelVar3 = $('input:eq(3)', fieldEdit).val();

        var pl = new JSONClientParameters();
        if (codes != undefined) {
            pl.add("공통코드분류", codes);
            service = "공통코드";
            method = "GETMULTICODE";
        }
        pl.add("service", service == undefined ? "공통코드" : service);
        pl.add("method", method == undefined ? "GETMULTICODE" : method);

        if (level == 0) {
            pl.add("대분류", "");
            pl.add("중분류", "");
            pl.add("소분류", "");
        }
        if (level == 1) {
            pl.add("대분류", SelVar0 == undefined ? "" : SelVar0);
            pl.add("중분류", "");
            pl.add("소분류", "");
        }
        if (level == 2) {
            pl.add("대분류", SelVar0 == undefined ? "" : SelVar0);
            pl.add("중분류", SelVar1 == undefined ? "" : SelVar1);
            pl.add("소분류", "");
        }
        if (level == 3) {
            pl.add("대분류", SelVar0 == undefined ? "" : SelVar0);
            pl.add("중분류", SelVar1 == undefined ? "" : SelVar1);
            pl.add("소분류", SelVar2 == undefined ? "" : SelVar2);
        }

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            $(document.body).find('.kcontextMenu').remove();
            var _pO = $("<div class='kcontextMenu DivContext DivContextMenu'><ul class='DivCodeUl'></ul></div>").appendTo($(document.body));
            $.each(data.resultData, function (index, row) {
                $('<li class="conMenu002" cmd="' + row['CODE'] + '"><span><a>' + row['DECODE'] + '</a></span></li>').appendTo($('.DivCodeUl', _pO));
            });
            $('.conMenu002', _pO).bind("click", function (e) {
                if (level == 0) {
                    $('input:eq(1)', fieldEdit).val("");
                    $('input:eq(2)', fieldEdit).val("");
                    $('input:eq(3)', fieldEdit).val("");
                }
                if (level == 1) {
                    $('input:eq(2)', fieldEdit).val("");
                    $('input:eq(3)', fieldEdit).val("");
                }
                if (level == 2) {
                    $('input:eq(3)', fieldEdit).val("");
                }
                callback($(this).attr('cmd'), $(this));
                _pO.remove();
            });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = uiobj.offset().top + uiobj.outerHeight();
            var menuleft = uiobj.offset().left;
            var menuwidth = uiobj.outerWidth() - 21;
            if ($(window).width() < (uiobj.offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);


        }, function (response) {
            alert(response.Message);
        }, _M.aSync.sync);

    };


    $.SetChkList = function (ulObj, codes, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('.kcontextMenu').remove();

            var _pO = $("<div class='kcontextMenu DivContext " + CssName + "'><div class='DivCodeLi'></div><div class='DivCodeBtn'></div></div>").appendTo($(document.body));

            // json 데이터를 이용하여 메뉴채움
            _M.f.c.SetMultiCheckCode($('.DivCodeLi', _pO), codes)

            // 데이터입력형이 메뉴이면 닫기버턴의 클릭을 기다리고
            // 단순 메뉴이면 마우스 이탈시에 자동으로 닫게함
            $("<span class='ui-icon ui-icon-check'></span>").appendTo($('.DivCodeBtn', _pO))
            .bind("click", function (e) {
                var DataArr = [];
                $("input[type='checkbox']", _pO).each(function () {
                    if ($(this).is(":checked")) {
                        DataArr.push($(this).val());
                    }
                });
                data = DataArr.join(",");
                callBackFn(data, $(this));
                _pO.remove();
            });
            $("<span class='ui-icon ui-icon-close icon i-20 icon-close'></span>").appendTo($('.DivCodeBtn', _pO)).bind("click", function (e) { _pO.remove(); });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };


    $.SetMultiCombo = function (ulObj, codes, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput

        $(ulObj).bind(event, function (e) {
            $(document.body).find('SetMultiCombo').remove();

            var _pO = $("<div class='SetMultiCombo DivContext " + CssName + "'><div class='DivCodeLi'></div><div class='DivCodeBtn'></div></div>").appendTo($(document.body));

            //            // json 데이터를 이용하여 메뉴채움
            var _arFld = ulObj.attr('field').split(',');
            var _Width = (100 / (_arFld.length + 1)) + "%";
            $.each(_arFld, function (index, value) {
                var se = $('<select></select>').appendTo($('.DivCodeLi', _pO)).css("width", _Width);
                if (index == 0) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(1)', _pO), codes, SelVar0, "", "");
                        $('.DivCodeLi select:eq(2),.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 1) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(2)', _pO), codes, SelVar0, SelVar1, "");
                        $('.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 2) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        var SelVar2 = $('.DivCodeLi select:eq(2)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(3)', _pO), codes, SelVar0, SelVar1, SelVar2);
                    })
                }
            });

            $.SvcMultiCode($('.DivCodeLi select:eq(0)', _pO), codes, "", "", "");

            $("<span class='ui-icon ui-icon-check'></span>").appendTo($('.DivCodeBtn', _pO))
            .bind("click", function (e) {
                var DataArr = [];
                $("선택", _pO).each(function () {
                    DataArr.push($(this).val());
                });
                data = DataArr.join(",");
                callBackFn(data, ulObj);
                _pO.remove();
            });
            $("<span class='ui-icon ui-icon-close icon i-20 icon-close'></span>").appendTo($('.DivCodeBtn', _pO)).bind("click", function (e) { _pO.remove(); });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.data("MouseOver", false);
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.bind("mouseleave", function (e) {
                if ((typeof e.fromElement != 'undefined' && !e.fromElement.length) || (typeof e.fromElement == 'undefined' && e.target.tagName != 'SELECT')) {
                    _pO.data("MouseOver", false);
                    _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); $(this).dequeue(); });
                }
            });

            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); $(this).dequeue(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };

    $.SetMultiSvcCombo = function (ulObj, service, method, event, CssName, callBackFn) {

        if (event == undefined) { event = "mousedown"; }; // mousedown or mouseover
        if (CssName == undefined) { CssName = "DivContextMenu"; }; // DivContextMenu or DivContextInput
        var codes = "";
        $(ulObj).bind(event, function (e) {
            $(document.body).find('SetMultiCombo').remove();

            var _pO = $("<div class='SetMultiCombo DivContext " + CssName + "'><div class='DivCodeLi'></div><div class='DivCodeBtn'></div></div>").appendTo($(document.body));

            //            // json 데이터를 이용하여 메뉴채움
            var _arFld = ulObj.attr('field').split(',');
            var _Width = (100 / (_arFld.length + 1)) + "%";
            $.each(_arFld, function (index, value) {
                var se = $('<select></select>').appendTo($('.DivCodeLi', _pO)).css("width", _Width);
                if (index == 0) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(1)', _pO), codes, SelVar0, "", "", service, method);
                        $('.DivCodeLi select:eq(2),.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 1) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(2)', _pO), codes, SelVar0, SelVar1, "", service, method);
                        $('.DivCodeLi select:eq(3)', _pO).val('');
                    })
                }
                if (index == 2) {
                    se.change(function (e) {
                        var SelVar0 = $('.DivCodeLi select:eq(0)', _pO).val();
                        var SelVar1 = $('.DivCodeLi select:eq(1)', _pO).val();
                        var SelVar2 = $('.DivCodeLi select:eq(2)', _pO).val();
                        $.SvcMultiCode($('.DivCodeLi select:eq(3)', _pO), codes, SelVar0, SelVar1, SelVar2, service, method);
                    })
                }
            });

            $.SvcMultiCode($('.DivCodeLi select:eq(0)', _pO), codes, "", "", "", service, method);

            $("<span class='ui-icon ui-icon-check'></span>").appendTo($('.DivCodeBtn', _pO))
            .bind("click", function (e) {
                var DataArr = [];
                $("선택", _pO).each(function () {
                    DataArr.push($(this).val());
                });
                data = DataArr.join(",");
                callBackFn(data, ulObj);
                _pO.remove();

            });
            $("<span class='ui-icon ui-icon-close icon i-20 icon-close'></span>").appendTo($('.DivCodeBtn', _pO)).bind("click", function (e) { _pO.remove(); });

            // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
            _pO.bind("mouseover", function (e) { _pO.data("MouseOver", true); });
            _pO.data("MouseOver", false);
            // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
            _pO.delay(2000).queue(function () { if (_pO.data("MouseOver") == false) _pO.remove(); });

            //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
            var menutop = $(this).offset().top + $(this).outerHeight();
            var menuleft = $(this).offset().left;
            var menuwidth = $(this).outerWidth() - 21;
            if ($(window).width() < ($(this).offset().left + _pO.width())) {
                menuleft = $(window).width() - _pO.width() - 5;
            }
            _pO.css("top", menutop).css("left", menuleft).css("width", menuwidth);

        });
    };

    $.GetExcelColumn = function (type, cols, service, pl) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu ExcelColumnPopUp' ></div>");

        // json 데이터를 이용하여 메뉴채움
        _t = $('<div class="row"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $('<a class="Label">컬럼을 선택하세요.</a><br/>').appendTo(_t);
        var seObj = $('<select id="excelcols" multiple size="20" style="width:40%;height:100%;float:left;" ></select>').appendTo(_t);
        var cnt = 0;
        for (var key in cols) {
            seObj.get(0).options[cnt] = new Option(cols[key], key);
            cnt++;
        }
        var _go = $("<span class='btn-arrow-right icon i-20 icon-pagenext' style='float:left;margin-top:110px;margin-left:15px;'></span>").appendTo(_t);
        var _back = $("<span class='btn-arrow-left icon i-20 icon-pageprev' style='float:left;margin-top:140px;margin-left:-23px;'></span>").appendTo(_t);
        var seObjgo = $('<select id="exceldowncols" multiple size="20" style="width:40%;height:100%;float:right;" ></select>').appendTo(_t);

        _go.click(function () {
            var cnt = 0;
            seObj.find("option:selected").each(function (index, value) {
                seObjgo.append($(this).clone());
                $(this).remove();
            });
        });

        _back.click(function () {
            seObjgo.find("option:selected").each(function (index, value) {
                seObj.append($(this).clone());
                $(this).remove();
            });
        });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 300,
            height: 450,
            title: "Excel Down 항목 선택",
            buttons: {
                "Down": function () {
                    var _downcols = "";
                    var _downlavs = "";
                    seObjgo.find("option").each(function () {
                        _downcols += "\"" + $(this).val() + "\"" + ",";
                        _downlavs += "\"" + $(this).text() + "\"" + ",";
                    });
                    _downcols = _downcols.substr(0, _downcols.length - 1);
                    pl.add("DOWNCOLS", _downcols);
                    pl.add("DOWNLAVS", _downlavs);

                    if (type == "XLS") {
                        $.SvcDownXls(service, pl);
                    } else if (type = "CSV") {
                        $.SvcDownCsv(service, pl);
                    } else {
                        alert("엑셀 다운 타입이 지정되지 않았습니다. XLS 또는 CSV를 지정해주세요.");
                    }
                    $(this).dialog("close");
                },
                "close": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
    };

    $.GetImg = function (callBackFn) {
        $(document.body).find('.GalleryPopUp').remove();
        $(document.body).append("<div class='GalleryPopUp' ></div>");

        // json 데이터를 이용하여 메뉴채움
        var _o = $('<form id="frmFile" name="frmFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.GalleryPopUp'));
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">파일을 선택하세요.</a>').appendTo(_t);
        $('<input type="file" size="30" name="Filename" id="Filename" title="PC파일" />').appendTo(_t);

        // 2013.07.08 dmjung :: value 업로드 속성 추가, icon i-20 클래스 제거 후 button button-upload 클래스 추가.
        $('<input type="button" class="GetImgFileUpload align-middle button button-upload" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">Url을 입력하세요.</a>').appendTo(_t);
        $('<input type="text"  name="Urlname" id="Urlname" />').css('width', '40%').appendTo(_t);
        $('<input type="button" class="GetImgFileUpload align-middle button button-upload" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">문서설명을 입력하세요.</a>').appendTo(_t);
        $('<input type="text" name="Note" />').css('width', '40%').appendTo(_t);
        // 2013.07.08 dmjung :: Chrome 에서 버튼 마우스 다운 동작 없으므로, 스크립팅 처리로 IE, Chrome 동일화.
        $('input[type=button].button-upload').bind('mousedown mouseup', function () {
            $(this).toggleClass('clicked');
            $(this).mouseleave(function () {
                $(this).removeClass('clicked');
            });
        });

        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentType" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentKey" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="WebFolder" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);

        $('<input type="hidden" name="UID" />').appendTo(_t).val(_M.UserInfo.id);
        $('<input type="hidden" name="USITE" />').appendTo(_t).val(_M.UserInfo.SID);

        $('<div id="GetImgGallery"></div>').appendTo(_o);
        $("#GetImgGallery").superContaner('superGallery', "MON_COM_겔러리POPUP_TBL");

        //선택
        $("#GetImgGallery").find(".cmdbtn[index='SelectGallery']").parent().click(function () {
            _li = $('.SuperGallery .body .li_selected');
            urlData = $('img', _li).attr('src');
            fileName = $('h3', _li).text();
            callBackFn(urlData, fileName);
            $(document.body).find('.GalleryPopUp').dialog("close");
            //$(document.body).find('.GalleryPopUp').remove();
        });

        //선택취소
        $("#GetImgGallery").find(".cmdbtn[index='CancelGallery']").parent().click(function () {
            callBackFn("", "");
            $(document.body).find('.GalleryPopUp').dialog("close");
            //$(document.body).find('.GalleryPopUp').remove();
        });

        //삭제
        $("#GetImgGallery").find(".cmdbtn[index='DeleteGallery']").parent().click(function () {
            _key = _li = $('.SuperGallery .body .li_selected').attr("key");
            option = $("#GetImgGallery").data("jsonData");
            var pl = new JSONClientParameters();
            pl.add("service", option.service);
            pl.add("method", option.method.Delete);
            pl.add("KEY", _key);

            PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (_data) {
                if (option.showMessage) {
                    if (option.deleteMessage) {
                        alert(option.deleteMessage);
                    } else {
                        alert("삭제되었습니다.");
                    }
                }
                $("#GetImgGallery").superContaner("ListGallery");
                if (option.afterDeleteCallBack != undefined) eval(option.afterDeleteCallBack)(_key, _Obj);
            }, function (response) { //fail일때
            }, _M.aSync.async);

            // 2013.09.17 dmjung :: 삭제시 기존 이미지가 지워지지 않아서 뷰영역 Refresh 처리.
            $('.fieldContaner[type="img"]').parents('.SuperView').superContaner('viewRefresh');
        });
        var frm = $('#frmFile');
        frm.ajaxForm(FileuploadCallback);
        frm.submit(function () { return false; });

        $(document.body).find('.GalleryPopUp').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 570,
            title: "이미지 겔러리",
            close: function (event, ui) {
                $(document.body).find('.GalleryPopUp').remove();
            }
        });
        $(document.body).find('.GalleryPopUp').dialog("open");
    };

    $.GetFile = function (callBackFn) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu GalleryPopUp' ></div>");

        // json 데이터를 이용하여 메뉴채움
        var _o = $('<form id="frmFile" name="frmFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.kcontextMenu'));
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">파일을 선택하세요.</a>').appendTo(_t);
        $('<input type="file" size="30" name="Filename" id="Filename" title="PC파일" />').appendTo(_t);
        // 2013.07.08 dmjung :: value 업로드 속성 추가, icon i-20 클래스 제거 후 button button-upload 클래스 추가.
        $('<input type="button" class="GetImgFileUpload button button-upload align-middle" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">Url을 입력하세요.</a>').appendTo(_t);
        $('<input type="text"  name="Urlname" id="Urlname" />').appendTo(_t);
        $('<input type="button" class="GetImgFileUpload button button-upload align-middle" value="업로드" onclick="GetImgFileUpload();" />').appendTo(_t);
        _t = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">문서설명을 입력하세요.</a>').appendTo(_t);
        $('<input type="text" name="Note" />').appendTo(_t);
        // 2013.07.08 dmjung :: Chrome 에서 버튼 마우스 다운 동작 없으므로, 스크립팅 처리로 IE, Chrome 동일화.
        $('input[type=button].button-upload').bind('mousedown mouseup', function () {
            $(this).toggleClass('clicked');
            $(this).mouseleave(function () {
                $(this).removeClass('clicked');
            });
        });

        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentType" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="ParentKey" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);
        //$('<input type="text" name="WebFolder" />').appendTo(_t);
        //_t = $('<div class="row"></div>').appendTo(_o);

        $('<input type="hidden" name="UID" />').appendTo(_t).val(_M.UserInfo.id);
        $('<input type="hidden" name="USITE" />').appendTo(_t).val(_M.UserInfo.SID);

        $('<div id="GetImgGallery"></div>').appendTo(_o);
        $("#GetImgGallery").superContaner('superGallery', "파일겔러리PopUp");

        var frm = $('#frmFile');
        frm.ajaxForm(FileuploadCallback);
        frm.submit(function () { return false; });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 650,
            title: "웹하드",
            buttons: {
                "delete": function () {
                    callBackFn("", "");
                    $(this).dialog("close");
                },
                "select": function () {
                    _li = $('.SuperGallery .body .li_selected', $(this));

                    urlData = $('img', _li).attr('src');
                    if (urlData == undefined) {
                        urlData = $('div', _li).attr('src');
                    }
                    fileName = $('h3', _li).text();

                    callBackFn(urlData, fileName);
                    $(this).dialog("close");
                },
                "close": function () {
                    $(this).dialog("close");
                }
                //..SuperGallery .body .li_selected
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
    };

    $.GetFileManager = function (jobType, fileSearchKey,extenders, callBackFn) {  //LG하우시스 수정 버전....

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu MultiFileManagerPopup' ></div>");
		
        // json 데이터를 이용하여 메뉴채움
        var _o = $('<form id="frmFile" name="frmFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.kcontextMenu'));
        _t = $('<div class="row"></div>').appendTo(_o);
        //JDM 파일 업로드 팝업 디자인 위해서 HTML 구조 변경
        $('<a class="Label">파일을 선택하세요.(최대20MB)</a><input type="file" size="30" name="Filename" id="Filename" title="PC파일" /><input type="button" class="align-middle button button-upload" value="업로드" onclick="GetMultiFileUpload(this);" /></a>').appendTo(_t);
        $('<input type="hidden" name="UID" />').appendTo(_t).val(_M.UserInfo.id);
        $('<input type="hidden" name="USITE" />').appendTo(_t).val(_M.UserInfo.SID);
        $('<input type="hidden" name="jobType" />').appendTo(_t).val(jobType);
        $('<input type="hidden" name="fileSearchKey" />').appendTo(_t).val(fileSearchKey);

        $('<div id="GetFileManager"></div>').appendTo(_o);
        $("#GetFileManager").attr("jobType", jobType);
        $("#GetFileManager").attr("fileSearchKey", fileSearchKey);
		$("#GetFileManager").data('extenders', extenders); //20140324 jwkim 확장자 체크용
        $("#GetFileManager").superContaner('superTable', "MON_COM_FILEMGNR_PTBL");

        var frm = $('#frmFile');


        frm.ajaxForm(function (data, state) {
            if (data == "error") {
                alert("파일전송중 에러 발생!!");
            } else {
                var _ar = data.split('^!^');
                $(".kcontextMenu").find(".jobArea").find("input[incomm='List']").trigger("click");
            }
        });
        frm.submit(function () { return false; });

        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 600,
            height: 400,
            title: "MultiFileUpload",
            buttons: {
                //"삭제": function () {
                //	callBackFn("","");
                //	$(this).dialog("close");
                //},
                "확인": function () {
                    //callBackFn();
                    $(this).dialog("close");
                }
                //"닫기": function () {
                //	$(this).dialog("close");
                //}
                //..SuperGallery .body .li_selected
            },
            close: function (event, ui) {
                callBackFn();
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
    };
    
    $.ShowDataUpdatePopupOld = function (popupInfo, callBackFn) {  //20121130 hsjung 유니코 대응버전

        var popTitle = "Excel 데이터 업로드";
        if (undefined != popupInfo.title) popTitle = popupInfo.title;

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu DataUploadPopup' ></div>");

        var _o = $('<form id="frmDataFile" name="frmDataFile" method="post" enctype="multipart/form-data"></form>').appendTo($(document.body).find('.kcontextMenu'));

        var _fileTag = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">파일선택</a>').appendTo(_fileTag);
        $('<input type="file" size="30" name="Filename" id="Filename" title="PCFile" />').appendTo(_fileTag);
        $('<input type="hidden" size="30" name="methodname" id="methodname" />').appendTo(_fileTag);
        $('<input type="hidden" size="30" name="GSITE" id="GSITE" />').appendTo(_fileTag);
        $('<input type="hidden" size="30" name="SID" id="SID" />').appendTo(_fileTag);
        $('<input type="hidden" size="30" name="UID" id="UID" />').appendTo(_fileTag);
        $('<input type="hidden" name="jsonParam" id="jsonParam" />').appendTo(_fileTag);
        $('<input type="hidden" size="30" name="jobType" id="jobType" />').appendTo(_fileTag);
        $('<input type="hidden" name="procName" id="procName" />').appendTo(_fileTag);

        var frm = $('#frmDataFile');
        frm.ajaxForm(function (data, state) {
            $(document.body).find('.kcontextMenu').dialog("close");
            $.unblockUI();
            if (data == "error") {
                alert("처리중 에러 발생!!" + date.toString());
            } else {
                alert("업로드완료");
            }
        });
        frm.submit(function () {
            return false;
        });

        //다이얼로그 열기
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 400,
            height: 110,
            title: popTitle,
            closeOnEscape: false,
            buttons: {
                "데이터업로드": function () {
                    ExeUploadDataFile(popupInfo);
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");

	}

    //$.ShowDataUpdatePopup = function (useExtender, upMode, json, callBackFn, pl) {  //LG하우시스 수정 버전....
	$.ShowDataUpdatePopup = function (json, param, callBackFn) {  //20140113개정판 khma
        var uploadList = json.uploadDataFile;
		var popupInfo; // 타겟업로드리스트
        var popTitle = "데이터 업로드";
        var exeMethod;
		var exeService;
		var errMsg = '데이터 업로드 처리 옵션이 정상적으로 정의되어 있지 않습니다.\n관리자에게 문의하여 주시기 바랍니다.';
		var upMode = param.upMode;
		
		
		//todo 해당 객체의 upload	
		
        if (upMode == "multi") {
			
			if(isNotEmpty(param.name)){
				for(var i=0; i < uploadList.length; i++){
					if(param.name == uploadList[i].name){
						popupInfo = uploadList[i];
						break;
					}
				}
			}
			
			
			if (undefined != popupInfo.title) {
				popTitle = popupInfo.title;
			}
			
        } else if(upMode == "single" ) { //20140113 khma 액셀업로드 개선
			
			if(isNotEmpty(param.title)) { //20140113 khma 액셀업로드 개선
				popTitle = param.title;
			}
			
			if(isNotEmpty(param.service)){
				exeService = param.service;
			}else{
				alert(errMsg);
				return;
			}
			
			if(isNotEmpty(param.method)){
				exeMethod = param.method;
			}else{
				alert(errMsg);
				return;
			}

		} 
		/*else { //20140113개정판 khma
			
			
            //싱글일때는 공통으로 사용하고 멀티일때는 확장클래스내부에서 직접 메소드 선언
            if (json.method.ExcelUpload != undefined) {
                exeMethod = json.method.ExcelUpload;
            } else {
                alert("데이터 업로드를 위한 메소드(ExcelUpload)가 지정되지 않았습니다.");
                return false;
            }
        }*/
		

		

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu DataUploadPopup' style='border-bottom: 1px solid #ccc; margin-bottom: 10px;'></div>");


        var _o = $('<form id="frmDataFile" name="frmDataFile" method="post" enctype="multipart/form-data" service="' + exeService + '" exeMethod="' + exeMethod + '" upmode="' + upMode + '" ></form>').appendTo($(document.body).find('.kcontextMenu'));

        //셀렉트TAG를 그림
        if (upMode == "multi") { //[single,multi]
	        var _updListTag = $('<div class="row"></div>').appendTo(_o);
            $('<a class="Label">서비스선택</a>').appendTo(_updListTag);

            var _selTag = $('<select name="uploadName" id="uploadName" size="1"></select>').appendTo(_updListTag);
            for (var i = 0; i < popupInfo.uploadList.length; i++) {
                var val = popupInfo.uploadList[i].name;
                var label = popupInfo.uploadList[i].name;
                $('<option value=' + val + '>' + label + '</option>').data('updJson', popupInfo.uploadList[i]).appendTo(_selTag);
            }
        }

        var _fileTag = $('<div class="row"></div>').appendTo(_o);
        $('<a class="Label">파일선택</a>').appendTo(_fileTag);
        var fileInputTag = "";
        $('<input type="file" size="30" name="Filename" id="Filename" title="PC파일" />').appendTo(_fileTag);
        $('<input type="hidden" name="upMode" id="upMode" />').val(upMode).appendTo(_fileTag);
        $('<input type="hidden" name="classname" id="classname" />').appendTo(_fileTag);
        $('<input type="hidden" name="ULID" id="ULID" />').appendTo(_fileTag);
        $('<input type="hidden" name="UID" id="UID" />').appendTo(_fileTag);
        $('<input type="hidden" name="jsonParam" id="jsonParam" />').appendTo(_fileTag);
        $('<input type="hidden" name="service" id="service" />').appendTo(_fileTag);
        $('<input type="hidden" name="exeMethod" id="exeMethod" />').appendTo(_fileTag);


        var frm = $('#frmDataFile');
        frm.ajaxForm(function (data, state) {
            if (data == "error") {
                alert("처리중 에러 발생!!");
            } else {
                $.unblockUI();
                //alert("처리가 완료되었습니다.");
                //var _ar = data.split('^!^');
                //$(".kcontextMenu").find(".jobArea").find("input[incomm='List']").trigger("click");
            }
        });
        frm.submit(function () {
            //$.unblockUI();
            return false;
        });

        //다이얼로그 열기
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 400,
            height: 170,
            title: popTitle,
            closeOnEscape: false,
            buttons: {
                "데이터업로드": function () {
                    ExeUploadDataFile(param);
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");

    }


    //메일 즉시발송처리 20120719 [처리방식 변경으로 미사용 예정 20140210]
    $.SendDirectMail = function (jobType, jobKey, contentsCode, service, method, callBackFn) {  //메일서비스콜
        //contensCode :컨텐츠코드, service:서비스, method :메소드

        var pl = new JSONClientParameters();
        var successFlag = true;
        pl.add("JOB_TYPE", jobType);
        pl.add("JOB_KEY", jobKey);
        pl.add("contentsCode", contentsCode);
        pl.add("service", service);
        pl.add("method", method);
        //서비스 호출 
        PostJsonData("/sendDirectMail.json", pl, function (data) {

            //CallBack(data.Table.Rows[0]);
            /*if(data.Table.Rows == true){
            alert("메일송신완료");
            }else{
            alert("메일송신실패");
            }*/
            successFlag = data.resultData;
            callBackFn(successFlag);
        }, function (response) {
            alert(response);
        }, _M.aSync.async);
    }


    //공통코드 초기화 20120830
    $.InitMetaCode = function (callBackFn) {  //공통코드를 DB로부터 새로 읽어 메모리적재하는 처리 콜

        var pl = new JSONClientParameters();
        var successFlag = true;
        //서비스 호출 
        PostJsonData("/initMetaCode.json", pl, function (data) {
            successFlag = data.resultInfo.result; //성공여부를 체크할것이므로 resultInfo로 사용함
            $.unblockUI();
            callBackFn(successFlag);
        }, function (response) {
            //alert(response);
            $.unblockUI();
        }, _M.aSync.async);
        $.blockUI({ message: '<h1><img src="/image/block_loading.gif" /><br> 처리중...</h1>',
            baseZ: 100000, css: { color: '#ffffff', border: '2px solid #888888', backgroundColor: '#000000' }
        });
    }


    //공통라벨 초기화 20121206 khma 신규추가
    $.InitMetaLabel = function (callBackFn) {  //공통라벨를 DB로부터 새로 읽어 메모리적재하는 처리 콜

        var pl = new JSONClientParameters();
        var successFlag = true;
        //서비스 호출 
        PostJsonData("/initMetaLabel.json", pl, function (data) {
            successFlag = data.resultInfo.result;
            $.unblockUI();
            callBackFn(successFlag);
        }, function (response) {
            alert(response);
        }, _M.aSync.async);
        $.blockUI({ message: '<h1><img src="/image/block_loading.gif" /><br> 처리중...</h1>',
            baseZ: 100000, css: { color: '#ffffff', border: '2px solid #888888', backgroundColor: '#000000' }
        });
    }


    $.ShowImg = function (_Obj) {
        $(document.body).find('.gcontextMenu').remove();
        $(document.body).append("<div class='gcontextMenu DivContext DivContextMenu contextMenu'></div>");

        var _o = $('<img  />').appendTo($(document.body).find('.gcontextMenu'));
        _o.attr('src', _Obj.attr('src'));

        // 마우스가 메뉴위에 가면 메뉴위에 있었다는 표시를 남김
        $(document.body).find('.gcontextMenu').bind("mouseover", function (e) {
            $(document.body).find('.gcontextMenu').data("MouseOver", true);
        });
        $(document.body).find('.gcontextMenu').bind("mouseleave", function (e) {
            $(this).remove();
        });
        $(document.body).find('.gcontextMenu').data("MouseOver", false);


        // 2초가 마우스가 메뉴위에 오지 않으면 자동으로 메뉴지움
        $(document.body).find('.gcontextMenu').delay(2000).queue(function () {
            if ($(document.body).find('.gcontextMenu').data("MouseOver") == false)
                $(document.body).find('.gcontextMenu').remove();
        });

        var menutop = _Obj.offset().top + _Obj.outerHeight();
        //alert("화면폭 : "+$(window).width() +", 객체위치 : "+$(this).offset().left);
        var menuleft = _Obj.offset().left;
        //var menuwidth = _Obj.outerWidth() - 11;
        //$(document.body).find('.kcontextMenu').css("width", menuwidth);
        if ($(window).width() < (_Obj.offset().left + $(document.body).find('.gcontextMenu').width())) {
            menuleft = $(window).width() - $(document.body).find('.gcontextMenu').width() - 5;
        }

        $(document.body).find('.gcontextMenu').css("top", menutop + 10);
        $(document.body).find('.gcontextMenu').css("left", menuleft + 10);
        $(document.body).find('.gcontextMenu').removeClass('contextMenu');
    };
    
    // TABLE에서 여러건 선택(monarch815 코어에서는 호출되는 부분이 존재하지 않음 20150420...)
    $.ShowTableJson = function (json, _Obj, callBackFn) {
        $(document.body).find('.ShowTableJson').remove();
        $(document.body).append("<div class='ShowTableJson EditPopUp DivContext'></div>");
        $('<div id="ShowTableJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowTableJson'));
        $("#ShowTableJson_ShowEdit").superContaner('superTable', json);

        $(document.body).find('.ShowTableJson').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    var tCnt = $("tr[selected='selected']", $("#ShowTableJson_ShowEdit")).length;
                    $("tr[selected='selected']", $("#ShowTableJson_ShowEdit")).each(function (index) {
                        _key = $(this).attr('keyvalue');
                        callBackFn(_key, tCnt, index + 1, $(this));
                    });
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ShowTableJson').remove();
            }
        });
        $(document.body).find('.ShowTableJson').dialog("open");
    };
    
   // TABLE에서 특정자료 1건만 선택
    $.ShowPopUpTableJson = function (json, _Obj, callBackFn) {
		if(_Obj.parents('.ui-dialog').length == 0){
			//todo 현재 팝업을 호출한 객체도 팝업일 경우 상위 팝업을 삭제하지 않는다.
			$(document.body).find('.ShowPopUpTableJson').remove();
		}

        var o = $("<div class='ShowPopUpTableJson EditPopUp DivContext'></div>");
        $(document.body).append(o);
        var $showPopupObj = $('<div id="ShowPopUpTableJson_1"></div>').appendTo(o);
        $showPopupObj.superContaner('superTable', json);
		var title = '정보';
		if(isNotEmpty($showPopupObj.data('jsonData').title )){
			title =$showPopupObj.data('jsonData').title;
		}
		o.dialog({
			autoOpen: false,
			modal: false,
			width: 800,
			title: title,
			buttons: {
				"선택": function () {
					//2014.01.23 dmjung :: 필요없는 것으로 간주 삭제 처리 전 주석.
					//var tCnt = $("tr[selected='selected']", $(".ShowPopUpTableJson")).length;
					var result;
					$(".SelectTR", $showPopupObj).each(function (index) {
						_key = $(this).attr('keyvalue');
						_display = $(this).attr('displayvalue');
						result = callBackFn(_key, _display, $(this), _Obj);
					});
					if ( result != false ) {
						$(this).dialog("close");
					}
				},
				"닫기": function () {
					callBackFn();
					$(this).dialog("close");
				}
			},
			open: function (event, ui) {

				/* 20130906 start */
				if (undefined != _Obj && null != _Obj && 'valuePart' != _Obj.attr('class')) {
					var autoBindingFld = _Obj.attr("bindField");
					//var data = $('input', _Obj).attr('data');
					var data = $('input', _Obj).val();
					if (autoBindingFld != undefined && autoBindingFld != "") {
						// $('.fieldContaner:[field="' + autoBindingFld + '"]');
						$(this).superContaner('setFieldNameValue', autoBindingFld, data);
						$showPopupObj.superContaner('List');
					}
				}
				/* 20130906 end */
			},
			close: function (event, ui) {
				o.remove();
			}
		});
		o.dialog("open");
    };


    // 컨텐츠 팝업 전용 20120809 khma 
    $.ShowContentPopUpJson = function (json, _Obj, contentType, callBackFn) {
        $(document.body).find('.ShowContentPopUpJson').remove();
        $(document.body).append("<div class='ShowContentPopUpJson EditPopUp DivContext'></div>");
        $('<div id="ShowContentPopUpJson_1"></div>').appendTo($(document.body).find('.ShowContentPopUpJson'));
        $("#ShowContentPopUpJson_1").attr("contenttype", contentType);
        $("#ShowContentPopUpJson_1").superContaner('superTable', json);
		var title = '정보';
		if(isNotEmpty($("#ShowContentPopUpJson_1").data('jsonData').title )){
			title = $("#ShowContentPopUpJson_1").data('jsonData').title;
		}
        $(document.body).find('.ShowContentPopUpJson').dialog({
            autoOpen: false,
            modal: true,
            width: 1000,
            title: title,
            buttons: {
                "선택": function () {
                    var tCnt = $("tr[selected='selected']", $("#ShowEdit")).length;
                    $(".SelectTR", $("#ShowContentPopUpJson_1")).each(function (index) {
                        _key = $(this).attr('keyvalue');
                        _display = $(this).attr('displayvalue');
                        callBackFn(_key, _display, $(this));
                    });
                    $(this).dialog("close");
                },
                "닫기": function () {
                    callBackFn();
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ShowContentPopUpJson').remove();
            }
        });
        $(document.body).find('.ShowContentPopUpJson').dialog("open");
    };


	//SeriCEO용 추가 - khma
    $.formMearge = function (formName, DataRow, callBack) {
        var formHtml = "";
        $.SvcGetRow("컨텐츠관리", "컨텐츠명READ", "컨텐츠코드", formName, function (data) {
            if (data != undefined) {
                formHtml = data.본문;
                // alert(formHtml);
                var strReg = new RegExp("\@{+[a-zA-Z0-9가-힣-_]*\}", "gim");
                var xArr = formHtml.match(strReg);
                if (xArr != null) {
                    $.each(xArr, function (k, v) {
                        _field = v.replace('@{', '').replace('}', '');
                        if (DataRow[_field] != undefined && DataRow[_field] != null) {
                            formHtml = formHtml.replace(v, DataRow[_field]);
                        } else {
                            formHtml = formHtml.replace(v, "&nbsp;");
                        }
                    });
                }
                callBack({ "fromName": data.발신자명,
                    "fromMail": data.발신메일,
                    "toMail": data.수신메일,
                    "title": data.제목,
                    "body": formHtml
                });
            } else {
                alert("컨텐츠코드 : [" + formName + "]을 찾을수 없습니다.");
            }

        });
    };


	//SeriCEO용 추가 - khma
    $.formSvcMearge = function (option) {
        var formHtml = "";
        var svc;
        if (option.formName == undefined) return;
        $.SvcGetRow("컨텐츠관리", "컨텐츠명READ", "컨텐츠코드", option.formName, function (data) {
            if (data != undefined) {
                if (data["병합서비스"] != undefined) {
                    svc = data["병합서비스"].split(".");
                }

                $.SvcGetRow(svc[0], svc[1], option.KeyField, option.keyData, function (DataRow) {
                    formHtml = data.본문;
                    // alert(formHtml);
                    var strReg = new RegExp("\@{+[a-zA-Z0-9가-힣-_]*\}", "gim");
                    var xArr = formHtml.match(strReg);
                    if (xArr != null) {
                        $.each(xArr, function (k, v) {
                            _field = v.replace('@{', '').replace('}', '');
                            if (DataRow[_field] != undefined && DataRow[_field] != null) {
                                formHtml = formHtml.replace(v, DataRow[_field]);
                            } else {
                                formHtml = formHtml.replace(v, "&nbsp;");
                            }
                        });
                    }
                    option.callBack({ "title": data.제목, "body": formHtml,
                        "sendname": DataRow["sendname"],
                        "sendemail": DataRow["sendemail"],
                        "sendphone": DataRow["sendphone"],
                        "rcvname": DataRow["rcvname"],
                        "rcvemail": DataRow["rcvemail"],
                        "rcvphone": DataRow["rcvphone"]
                    });
                });
            } else {
                alert("컨텐츠코드 : [" + option.formName + "]을 찾을수 없습니다.");
            }

        });
    };



    // viewJson팝업창
    $.ShowPopUpViewJson = function (json, _Obj, callBackFn, buttons) {
        $(document.body).find('.ShowPopUpViewJson').remove();
        $(document.body).append("<div class='ShowPopUpViewJson EditPopUp DivContext'></div>");
        $('<div id="ShowPopUpViewJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowPopUpViewJson'));
        var popObj = $("#ShowPopUpViewJson_ShowEdit").superContaner('superView', json);
        var popOptions = popObj.data("jsonData");
        var popupWidth = 800;
		var popupHeight;
        if (isNotEmpty(popOptions.bodyWidth)) popupWidth = popOptions.bodyWidth;
		if (isNotEmpty(popOptions.bodyHeight)) popupHeight = popOptions.bodyHeight;
        $("#ShowPopUpViewJson_ShowEdit").superContaner('SetDefault');
		var title = '정보';
		if(isNotEmpty($("#ShowPopUpViewJson_ShowEdit").data('jsonData').title )){
			title = $("#ShowPopUpViewJson_ShowEdit").data('jsonData').title;
		}
		var btns = [{
				"id": "saveBtn",
				"text": "저장",
				 click: function() {
					callBackFn($("#ShowPopUpViewJson_ShowEdit"), _Obj);
                    $(this).dialog("close");
				 }
				},
				{
				"id": "closeBtn",
				"text": "닫기",
				 click: function() {
					 $(this).dialog("close");
				 }
				}
			];
		
		
		if(undefined != buttons){
			btns = buttons;
		}
		
        $(document.body).find('.ShowPopUpViewJson').dialog({
            autoOpen: false,
            modal: true,
            width: popupWidth,			
            //height: 300,
            title: title,
			buttons: btns,
            /*buttons: {
                "저장": function () {
                    callBackFn($("#ShowPopUpViewJson_ShowEdit"), _Obj);
                    $(this).dialog("close");
                    //ShowPopUpViewJson 다이얼로그 클로즈 처리는 콜벡처리에서 반환값으로 처리
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },*/
            close: function (event, ui) {
                $(document.body).find('.ShowPopUpViewJson').remove();
            }
        });

        $(document.body).find('.ShowPopUpViewJson').dialog("open");
		if(undefined != popupHeight){
			$(document.body).find('.ShowPopUpViewJson').dialog('option', 'height', popupHeight);
		}
    };
    // sUB등록창
    $.ShowEditJson = function (json, _Obj, callBackFn) {
        var parentKeyValue = "";
        if (typeof (_Obj) == "string") {
            parentKeyValue = _Obj
        } else {
            parentKeyValue = _Obj.attr("parentKeyValue");
        };

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $("#ShowEdit").superContaner('superView', json, parentKeyValue);
        $("#ShowEdit").superContaner('SetDefault');
		var title = '정보';
		if(isNotEmpty($("#ShowEdit").data('jsonData').title )){
			title = $("#ShowEdit").data('jsonData').title;
		}
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            //width: 800,
            width: 1080, //lghausys요청으로 인한 사이즈수정
            //height: 300,
            title: title,
            buttons: {
                "저장": function () {
                    $("#ShowEdit").superContaner('Save', function (result) {
                        if (result) {
                            if (typeof (_Obj) == "string") {
                                //parentKeyValue = _Obj

                            } else {
                                option = _Obj.data("jsonData");
                                if (option.isParentRefresh) {
                                    _Obj.superContaner("ParentRefresh");
                                } else {
                                    _Obj.superContaner('tableRefresh');
                                }
                            };
                            if (callBackFn != undefined) {
                                callBackFn();
                            }
                            $(document.body).find('.kcontextMenu').dialog("close");

                        }
                    });
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    $.ShowViewJson = function (json, _Obj, callBackFn) {
        var parentKeyValue = "";
        if (typeof (_Obj) == "string") {
            parentKeyValue = _Obj
        } else {
            parentKeyValue = _Obj.attr("parentKeyValue");
        };

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $("#ShowEdit").superContaner('superView', json, parentKeyValue);
        $("#ShowEdit").superContaner('SetDefault');
		var title = '정보';
		if(isNotEmpty($("#ShowEdit").data('jsonData').title )){
			title = $("#ShowEdit").data('jsonData').title;
		}
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            //width: 800,
            width: 1080, //lghausys요청으로 인한 사이즈수정
            //height: 300,
            title: title,
            buttons: {
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    $.ShowCalEditJson = function (json, _Obj, start, end, allDay, calName,callBackFn) {
        var parentKeyValue = "";
        if (typeof (_Obj) == "string") {
            parentKeyValue = _Obj
        } else {
            parentKeyValue = _Obj.attr("parentKeyValue");
        };

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        $("#ShowEdit").superContaner('superView', json, parentKeyValue);
        $("#ShowEdit").superContaner('SetDefault');

        // 셀렉트한 날의 일자 설정
        $(".fieldContaner").each(function (index, value) {
            var _calType = $(this).attr("calType");
            var _fieldName = $(this).attr("field");
            if (_calType == 'startDate') {
                var sDate = lPadZero(start.getFullYear(), 4) + '-' + lPadZero(start.getMonth() + 1, 2) + '-' + lPadZero(start.getDate(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), sDate, 0);

            } else if (_calType == 'endDate') {
                var eDate = lPadZero(end.getFullYear(), 4) + '-' + lPadZero(end.getMonth() + 1, 2) + '-' + lPadZero(end.getDate(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), eDate, 0);
            } else if (_calType == 'startTime') {

                var sTimeHours = lPadZero(start.getHours(), 2)
                var sTimeMins = lPadZero(start.getMinutes(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), sTimeHours + sTimeMins);
            } else if (_calType == 'endTime') {

                var eTimeHours = lPadZero(end.getHours(), 2)
                var eTimeMins = lPadZero(end.getMinutes(), 2);
                $("#ShowEdit").superContaner("changeValue", $(".fieldContaner[field='" + _fieldName + "']", $("#ShowEdit")), eTimeHours + eTimeMins);
            }

        });

        var option = $("#ShowEdit").data('jsonData');
        var title = '정보';
        
        if (option.title != undefined && option.title != "") {
            title = option.title;
        }
        
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: title,
            buttons: {
                "저장": function () {
                    $("#ShowEdit").superContaner('Save', function (result) {
                        if (result) {
                            if (callBackFn != undefined) {
                                callBackFn();
                            }
                            $(document.body).find('.kcontextMenu').dialog("close");
                        }
                    });
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });

        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    //컨텐츠 가져오기 팝업
    $.ContentPopUp = function (json, parentObj, contentType, callBackFn) {
        var content = '';
        $.ShowContentPopUpJson(json, parentObj, contentType, function (key, display, trobj) {
            var jsData;
            var service = "MON_COMMON";
            var method = "CONTENTS_READ";
            var fieldName = "M_CONTENTS_NO";
            var fieldKey = key;
            if (undefined != key) {
                $.SvcGetRow(service, method, fieldName, fieldKey, function (data) {
                    if (data != undefined) {
                        callBackFn($.decHTML(data.CONT_BODY));
                    }

                });
            }
        });
    };

    $.ShowReadOnlyJson = function (json, _key, callBackFn) {
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));

        if (_superContanerRemoteMode) {
            $("#ShowEdit").superContanerRemote('superViewInit', { "jsonName": json, "ReadKey": _key });
        } else {
            $("#ShowEdit").superContaner('superView', json);
            $("#ShowEdit").superContaner('Read', _key);
            $("#ShowEdit").superContaner('modeChange', false);
        }

        var width = 800;
        
        var option = $("#ShowEdit").data('jsonData');
        var title = '정보';
        
        if (option.title != undefined && option.title != "") {
            title = option.title;
        }
        if (option.popupWidth != undefined && option.popupWidth != "") {
            width = option.popupWidth;
        }
        
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: title,
            buttons: {
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.kcontextMenu').remove();
            }
        });
        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };


    $.ShowReadEditJson = function (json, _key, callBackFn, delBtnFlag) {

    	
        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu EditPopUp DivContext'></div>");
        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
        if (_superContanerRemoteMode) {
            $("#ShowEdit").superContanerRemote('superViewInit', { "jsonName": json, "ReadKey": _key });
        } else {
            $("#ShowEdit").superContaner('superView', json);
            $("#ShowEdit").superContaner('Read', _key);
        }
        var option = $("#ShowEdit").data('jsonData');
        var width = 800;
        var title = '정보';
        
        if (option.title != undefined && option.title != "") {
            title = option.title;
        }
        if (option.popupWidth != undefined && option.popupWidth != "") {
            width = option.popupWidth;
        }


        if (undefined == delBtnFlag || delBtnFlag == false) {
            $(document.body).find('.kcontextMenu').dialog({
                autoOpen: false,
                modal: true,
                width: width,
                //height: 300,
                title: title,
                buttons: {
                    "저장": function () {
                        $("#ShowEdit").superContaner('Save', function (result) {
                            if (result) {
                                callBackFn(_key);
                                $(document.body).find('.kcontextMenu').dialog("close");
                            }
                        });
                    },
                    "닫기": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.kcontextMenu').remove();
                }
            });
        } else {
            $(document.body).find('.kcontextMenu').dialog({
                autoOpen: false,
                modal: true,
                width: 800,
                //height: 300,
                title: title,
                buttons: {
                    "저장": function () {
                        $("#ShowEdit").superContaner('Save', function (result) {
                            if (result) {
                                callBackFn(_key);
                                $(document.body).find('.kcontextMenu').dialog("close");
                            }
                        });
                    },
                    "삭제": function () {
                        $("#ShowEdit").superContaner('Delete');
                        callBackFn(_key);
                        $(this).dialog("close");
                    },
                    "닫기": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.kcontextMenu').remove();
                }
            });
        }

        $(document.body).find('.kcontextMenu').dialog("open");
        return $("#ShowEdit");

    };

    //    // 2013.07.17 dmjung :: 멀티연락처용 팝업 처리 추가
    //    $.MultiEmailPopUp = function (json, _key, modeFlag, callBackFn) {

    //        $(document.body).find('.kcontextMenu').remove();
    //        $(document.body).append("<div class='kcontextMenu MultiEmail DivContext'></div>");
    //        $('<div id="ShowEdit"></div>').appendTo($(document.body).find('.kcontextMenu'));
    //        if (_superContanerRemoteMode) {
    //            $("#ShowEdit").superContanerRemote('superViewInit', { "jsonName": json, "ReadKey": _key });
    //        } else {
    //            $("#ShowEdit").superContaner('superView', json);
    //            $("#ShowEdit").superContaner('Read', _key);
    //        }
    //        var option = $("#ShowEdit").data('jsonData');
    //        var width = 800;
    //        var title = '정보';
    //        if (option.title != undefined && option.title != "") {
    //            title = option.title;
    //        }
    //        if (option.popupWidth != undefined && option.popupWidth != "") {
    //            width = option.popupWidth;
    //        }

    //        // 2013.07.18 dmjung :: 컨텐츠 유형 option code 삽입..
    //        _M.f.c.SetOptionCode($('select', '.MultiEmail'), 'EMAILTYPE', 'type', 'false');

    //        $(document.body).find('.kcontextMenu').dialog({
    //            autoOpen: false,
    //            modal: true,
    //            width: width,
    //            //height: 300,
    //            title: title,
    //            buttons: {
    //                "저장": function () {

    //                    var pl = new JSONClientParameters();
    //                    pl.add("service", 'MON_COMMON');
    //                    pl.add("method", 'M_CUST_CREATE');
    //                    pl.add("JOB_TYPE", "TASK");
    //                    pl.add("CUST_NAME", "DMJUNG");
    //                    pl.add("EMAIL_TYPE", '3');                    
    //                    pl.add("EMAIL", $('#emailname', '.MultiEmail').val());

    //                    PostJsonData(_M.svcUrl.crudUrl, pl, function (data) {
    //                        // dataset 받아서 처리해야 함
    //                    }, function (response) {
    //                        alert(response.Message);
    //                    }, _M.aSync.sync);

    //                    callBackFn();
    //                    $(document.body).find('.kcontextMenu').dialog("close");
    //                },
    //                "닫기": function () {
    //                    $(this).dialog("close");
    //                }
    //            },
    //            close: function (event, ui) {
    //                $(document.body).find('.kcontextMenu').remove();
    //            }
    //        });

    //        $(document.body).find('.kcontextMenu').dialog("open");
    //        return $("#ShowEdit");

    //    };

    $.ShowSubTableJson = function (json, _Obj, parentKeyValue) {
        $(document.body).find('.ShowTableJson').remove();
        $(document.body).append("<div class='ShowTableJson EditPopUp DivContext'></div>");
        $('<div id="ShowTableJson_ShowEdit"></div>').appendTo($(document.body).find('.ShowTableJson')).attr("parentKeyValue", parentKeyValue);
        $("#ShowTableJson_ShowEdit").superContaner('superTable', json, _Obj);
		
		var title = '정보';
		if(isNotEmpty($("#ShowTableJson_ShowEdit").data('jsonData').title )){
			title = $("#ShowTableJson_ShowEdit").data('jsonData').title;
		}
        $(document.body).find('.ShowTableJson').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            //height: 300,
            title: title,
            buttons: {
                "추가": function () {
                    $("#ShowTableJson_ShowEdit").superContaner('tableSave');
                    _Obj.superContaner('List');
                    //$(this).dialog("close"); //저장후 PopUp 유지하도록 하여 데이터를 추가로 넣을 수 있게 하기 위해 주석처리
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ShowTableJson').remove();
            }
        });
        $(document.body).find('.ShowTableJson').dialog("open");
        return $("#ShowTableJson_ShowEdit");
    };
    // TABLE에서 특정자료 1건만 선택
	
	//SeriCEO용 추가 - khma
    $.ShowOpenViewJson = function (option) {
        $(document.body).find('.ShowOpenViewJson').remove();

        $(document.body).append("<div class='ShowOpenViewJson DivContext'></div>");
        $('<div id="ShowOpenViewShowEdit"></div>').appendTo($(document.body).find('.ShowOpenViewJson'));
        $("#ShowOpenViewShowEdit").superContaner('superView', option.json);
        $(document.body).find('.ShowOpenViewJson').dialog({
            autoOpen: false,
            modal: option.modal == undefined ? true : option.modal,
            width: option.size.width == undefined ? 800 : option.size.width,
            //height: 300,
            height: option.size.height == undefined ? 600 : option.size.height,
            title: option.title == undefined ? "정보" : option.title,
            buttons: {
                "close": function () {
                    $(this).dialog("close");
                }
            },
            open: function (event, ui) {
                if (option.openCallBack != undefined) {
                    option.openCallBack($("#ShowOpenViewShowEdit"));
                }
            },
            close: function (event, ui) {
                if (option.closeCallBack != undefined) {
                    option.closeCallBack();
                }
                $(document.body).find('.ShowOpenViewJson').remove();
            }
        });

        $(document.body).find('.ShowOpenViewJson').dialog("open");
        //$(document.body).find('.ShowOpenViewJson').parents('.ui-dialog').css('position','absolute');
        return $("#ShowOpenViewShowEdit");

    };




    $.ShowOpenJson = function (option) {
		debugger;
        var OpenPopid = 'OpenPopid' + formCID++;
        //$(document.body).find('.ShowOpenJson').remove();
        var ppPop = $("<div class='ShowOpenJson EditPopUp DivContext'></div>").appendTo($(document.body));
        var ppDiv = ppPop; // $('<div"></div>').appendTo(ppPop);
        ppDiv.superContaner(option.ContanerType, option.json);

        ppPop.dialog({
            autoOpen: false,
            modal: option.modal == undefined ? true : option.modal,
            width: option.size.width == undefined ? 800 : option.size.width,
            //height: 300,
            height: option.size.height == undefined ? 600 : option.size.height,
            title: option.title == undefined ? "정보" : option.title,
            "buttons": option.buttons,
            focus: function () { //새롭게 추가되는 코드부분

                $(':input', this).keydown(function (event) {
                    if (event.keyCode == 13) {
                        event.preventDefault();
                    }
                });
            }
        });

        ppPop.dialog("open");
        return ppDiv;

    };

    $.ZipPopUp = function (callBackFn) {
       // var json = "MON_ADM_우편번호_TBL";
        $(document.body).find('.ZipPopUp').remove();
        $(document.body).append("<div class='ZipPopUp EditPopUp DivContext'></div>");
        $('<div id="ZipPopUp_1"></div>').appendTo($(document.body).find('.ZipPopUp'));		 
		$("#ZipPopUp_1").append('<ul><li id="zipCodeLi-1"><a href="#zipCodeTab-1"> 도로명주소 검색</a></li><li id="zipCodeLi-2"><a href="#zipCodeTab-2"> 지번주소 검색</a></li></ul>');
		$("#ZipPopUp_1").append('<div id="zipCodeTab-1"></div>');
		$("#ZipPopUp_1").append('<div id="zipCodeTab-2"></div>');
		$("#zipCodeTab-1").superContaner('superTable', 'MON_COMM_ZIPCODE01_PTBL'); 
		$("#zipCodeTab-2").superContaner('superTable', 'MON_COMM_ZIPCODE02_PTBL');	
		$("#ZipPopUp_1").tabs();
        /*$("#ZipPopUp_1").superContaner('superTable', json);*/

		
		
        $(document.body).find('.ZipPopUp').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            title: "주소찾기",
            buttons: {
                // 2013.07.10 dmjung :: 저장에서 선택으로 버튼 명칭 변경, 주소 정보 변수 추가 및 파라메터 추가.
                "선택": function () {
				
					//지번 도로명으로 주소 방식 변경   20140331 jwkim start
					//var selTab = $($('.ui-tabs-selected > a', $('#ZipPopUp_1')));
					var tabId = $('#ZipPopUp_1 li[aria-selected="true"] a').attr('href');
//					var tabId = selTab.attr("href");
					var selTr = $(".SelectTR", tabId);
					var selKey = selTr.attr('keyvalue');
					var addrType;
					if(undefined == selKey) {
						alert('주소를 선택해 주십시요.');
						return;
					} 

					var pl = new JSONClientParameters();
					pl.add("service", "MON_COMMON");
					//todo 주소를 취득.
					if (tabId=='#zipCodeTab-1') { //도로명주소
						addrType = "1";
						pl.add("method", "DORO_POST_READ");
						pl.add("NUM",selKey);
					} else { // 지번주소
						addrType = "2";
						pl.add("method", "POST_READ");						
						pl.add("NUM", selKey);
					}
					
					 PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {						
						callBackFn(addrType,data.resultData[0]); //1:도로 2:지번
					}, function (response) {
						alert('주소정보 취득처리가 실패하였습니다.');
						return;
					}, _M.aSync.sync);
					
					$(this).dialog("close");
					/*
					
                    var tCnt = $("tr[selected='selected']", $("#ShowEdit")).length;					
                    $(".SelectTR", $("#ZipPopUp_1")).each(function (index) {
                        var 우편번호 = $("td:[field='ZIP_CODE']", $(this)).text();
                        var 시도 = $("td:[field='SIDO']", $(this)).text();
                        var 구군 = $("td:[field='GUGUN']", $(this)).text();
                        var 동 = $("td:[field='DONG']", $(this)).text();
                        var 번지 = $("td:[field='BUNJI']", $(this)).text();
                        callBackFn(우편번호, 시도, 구군, 동, 번지, $(this));
                    });
                    $(this).dialog("close");
					*/
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ZipPopUp').remove();
            }
        });
        $(document.body).find('.ZipPopUp').dialog("open");
    };

    $.ZipOnePopUp = function (callBackFn) {
        var json = "MON_ADM_우편번호_TBL";
        $(document.body).find('.ZipOnePopUp').remove();
        $(document.body).append("<div class='ZipOnePopUp EditPopUp DivContext'></div>");
        $('<div id="ZipOnePopUp_1"></div>').appendTo($(document.body).find('.ZipOnePopUp'));
        $("#ZipOnePopUp_1").superContaner('superTable', json);
        $('<div id="ZipOnePopUp_2"></div>').appendTo($(document.body).find('.ZipOnePopUp'));
        $("<br/><div><span>상세주소 : </span><input type='text' id='ziponeaddr2'style='width:80%' class='input-bg input-ft b-t b-r b-b b-l b-co b-co-basic' /></div>").appendTo("#ZipOnePopUp_2");
        $("#ziponeaddr2").keyup(function (e) {
            if (e.keyCode == '13') {
                $.each($(".ZipOnePopUp").parent().find(".ui-button-text"), function (index, row) {
                    var _btn = $(this).html()
                    if (_btn == "save" || _btn == "select" || _btn == "추가" || _btn == "선택" || _btn == "기록" || _btn == "저장") {
                        $(this).parent().trigger("click");
                    }
                });
            }
        });

        $(document.body).find('.ZipOnePopUp').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            title: "주소찾기",
            buttons: {
                // 2013.07.10 dmjung :: 저장에서 선택으로 버튼 명칭 변경, 주소 정보 데이터 추가.
                "선택": function () {
                    var tCnt = $("tr[selected='selected']", $("#ShowEdit")).length;
                    $(".SelectTR", $("#ZipOnePopUp_1")).each(function (index) {
                        var 우편번호 = $("td:[field='ZIP_CODE']", $(this)).text();
                        var 시도 = $("td:[field='SIDO']", $(this)).text();
                        var 구군 = $("td:[field='GUGUN']", $(this)).text();
                        var 동 = $("td:[field='DONG']", $(this)).text();
                        var 번지 = $("td:[field='BUNJI']", $(this)).text();
                        callBackFn(우편번호, 시도, 구군, 동, 번지, $(this));
                    });
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.ZipOnePopUp').remove();
            }
        });
        $(document.body).find('.ZipOnePopUp').dialog("open");
    };

    $.TestJson = function (jsonStr, callBack) {
        var _json = eval('(' + jsonStr + ')');
        var _ObjType = "";

        if (_json.colModel == undefined) {
            _ObjType = "superView";
        } else {
            _ObjType = "superTable";
            _json.mainViewID = undefined;

        }
        _json.isHtmlDown = false,

        $(document.body).find('.TestJson').remove();
        $(document.body).append("<div class='TestJson EditPopUp DivContext'></div>");
        $('<div id="TestJson_ShowEdit"></div>').appendTo($(document.body).find('.TestJson'));
        $("#TestJson_ShowEdit").superContaner(_ObjType, _json);

        $(document.body).find('.TestJson').dialog({
            autoOpen: false,
            modal: true,
            width: 900,
            height: 600,
            title: "정보",
            buttons: {
                "HTML 저장": function () {
                    var Html = $("#TestJson_ShowEdit").html();
                    callBack(Html);
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.TestJson').remove();
            }
        });
        $(document.body).find('.TestJson').dialog("open");
    };
    $.TestOlap = function (oxml, callBackFn) {
        $(document.body).find('.TestOlap').remove();
        $(document.body).append("<div class='TestOlap EditPopUp'></div>");
        $('<div id="TestOlap_ShowOlap"></div>').appendTo($(document.body).find('.TestOlap'));
        //$("#TestOlap_ShowOlap").superContaner('superOlap', oxml);
        $("#TestOlap_ShowOlap").superContaner('superOlap');
        $("#TestOlap_ShowOlap").superContaner('olapShowData', oxml);

        $(document.body).find('.TestOlap').dialog({
            autoOpen: false,
            modal: true,
            width: 900,
            height: 600,
            title: "정보",
            buttons: {
                "저장": function () {
                    var _xml = document.getElementById("TestOlap_ShowOlap_olap").XMLData;
                    callBackFn(_xml);
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            }
        });
        $(document.body).find('.TestOlap').dialog("open");
    };
    $.JsonEditPop = function (jsName, jsData) {
        var pl = new JSONClientParameters();
        pl.add("STRUCTURE_NAME", jsName);
        $.SvcCallPl("MON_COMMON", "GET_STRUCTURE_READ", pl, function (data) {
            jsData = data.resultData[0]["STRUCTURE_CONT"];

            $(document.body).find('.JsonEditPop').remove();
            $(document.body).append("<div class='JsonEditPop DivContext'></div>");
            var _o = $(document.body).find('.JsonEditPop');
            var _div = $("<div></div>").appendTo(_o);
            var _t = $("<div class='EditpopTitle'></div>").appendTo(_div);
            _t.text(jsName);
            var _div = $("<div></div>").appendTo(_o);
            var _e = $("<textarea class='SourceEdit' wrap='off' rows='50' cols='600'></textarea>").appendTo(_div);
            _e.val($.decHTML(jsData));
            _e.tabby();

            $(document.body).find('.JsonEditPop').dialog({
                autoOpen: false,
                modal: true,
                title: "정보",
                width: 1000,
                height: 800,
                buttons: {
                    "저장": function () {
                        //2013.06.03 dmjung :: CodeMirror 적용 후 저장 안되는 문제 수정 중
                        jsData = myCodeMirror.getValue();
                        var pl = new JSONClientParameters();
                        pl.add("STRUCTURE_NAME", jsName);
                        pl.add("STRUCTURE_CONT", jsData);

                        $.SvcCallPl("MON_COMMON", "GET_STRUCTURE_UPDATE", pl, function (Data) {
                            alert('수정되었습니다');
                        });
                        $(this).dialog("close");

                    },
                    "닫기": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.JsonEditPop').remove();
                }
            });
            $(document.body).find('.JsonEditPop').dialog("open");
            //2013.05.31 dmjung :: CodeMirror 적용 완료.
            //:::::::::::::::::::: TO-DO shift + tab 들여쓰기 취소 동작 이상.
            var myCodeMirror = CodeMirror.fromTextArea($('.SourceEdit')[0],
    		{
    		    lineNumbers: true,
    		    mode: "javascript"
    		});


        }, _M.aSync.sync);
    };

    $.ImportPopUp = function (CallBack) {
        $(document.body).find('.JsonEditPop').remove();
        $(document.body).append("<div class='JsonEditPop DivContext'></div>");
        var _o = $(document.body).find('.JsonEditPop');
        var _div = $("<div></div>").appendTo(_o);
        var _e = $("<textarea rows='5' cols='5'></textarea>").appendTo(_div);
        $(document.body).find('.JsonEditPop').dialog({
            autoOpen: false,
            modal: true,
            title: "정보",
            width: 1000,
            height: 800,
            buttons: {
                "저장": function () {
                    CallBack(_e.val());
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(document.body).find('.JsonEditPop').remove();
            }
        });
        $(document.body).find('.JsonEditPop').dialog("open");
    };

    $.PopUpUrl = function (Url, opt) {
    	var pTitle = "페이지정보";
    	var height = 700;
    	var width = 800;
    	if(isNotEmpty(opt.height)){
    		height = opt.height;
    	}
    	if(isNotEmpty(opt.width)){
    		width = opt.width;
    	}
    	if(isNotEmpty(opt.title)){
    		pTitle = opt.title;
    	}
        var $dialog = $('<div></div>')
        .html("<iframe style='border: 0px;' src='" + Url + "' width='100%' height='100%'></iframe>")
        .dialog({
            autoOpen: false,
            modal: true,
            width: width,
            height: height,
            resizable: false,
            title: pTitle
        });
        $dialog.dialog("open");
    };

    $.ImgPopUp = function (Url) {
        var $dialog = $('<div></div>')
        .html("<img src='" + Url + "' width='650px' height='650px'/>")
        .dialog({
            autoOpen: false,
            modal: true,
            width: 650,
            height: 720,
            resizable: false,
            title: "이미지정보"
        });
        $dialog.dialog("open");
    };



    $.LoginPop = function () {
        $(document.body).find('.LoginPop').remove();
        var _pop = $("<div class='LoginPop'></div>").appendTo(document.body);
        var _o = $("<div class='login'></div>").appendTo(_pop);

        $(document.body).find('.LoginPop').dialog({
            autoOpen: false,
            closeText: 'hide',
            closeOnEscape: true,
            disabled: false,
            modal: true,
            dialogClass: "login-dialog",
            resizable: false,
            width: 700,
            height: 430
        });
        $(document.body).find('.LoginPop').dialog("open");


    };

    $.MapPopUp = function (x, y, title, callBackFn) {
        var json = "MapJsonPopUp";
        $(document.body).find('.MapPopUp').remove();
        $(document.body).append("<div class='MapPopUp EditPopUp DivContext'></div>");
        $('<div id="MapPopUp_1"></div>').appendTo($(document.body).find('.MapPopUp'));
        $("#MapPopUp_1").superContaner('superMap', json, x, y, title);
        $(document.body).find('.MapPopUp').dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 600,
            title: "Map",
            buttons: {
                "기록": function () {
                    _maker = $("#MapPopUp_1").data("markers");
                    if (_maker.length > 0) {
                        callBackFn("지도좌표", _maker[0].position);
                    }
                    $(this).dialog("close");
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            }
        });
        $(document.body).find('.MapPopUp').dialog("open");
    };

    $.SignPopUp = function () {
        $(document.body).find('.SignPopUp').remove();
        var _SignPopUp = $("<div class='SignPopUp'></div>").appendTo(document.body);
        var _o = $("<canvas id='simple_sketch' width='400' height='200'></canvas>").appendTo(_SignPopUp);
        _o.sketch();
        _SignPopUp.dialog({
            autoOpen: false,
            modal: true,
            width: 450,
            //height: 300,
            title: "정보",
            buttons: {
                "저장": function () {
                    var dataUri = $('#simple_sketch')[0].toDataURL('image/png').split(",")[1];
                    $.post("bzService/UpSign.aspx", { data: dataUri }, function (data) {
                        alert("사인확인");
                        _SignPopUp.dialog("close");
                    });
                },
                "닫기": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                _SignPopUp.remove();
            }
        });
        _SignPopUp.dialog("open");
        return _SignPopUp;
    };


    //////////////////////////////////////////////////////////////////////
    $.Login = function (callBack) {
        //$.cookie('UKEY','');

        /* ssoLogin Start 20120730 khma */
        //var ssoUID = $.cookie('ssoUID'); //파라메터로 넘기는 경우

        //SSO로그인아이디가 쿠키에 존재하면 이키를 가지고 로그인한다.
        /*
        if (undefined != ssoUID && "" != ssoUID) {

            if (_Biz.인증.SSO로그인(ssoUID)) {
                $(document.body).find('.LoginPop').remove();
                callBack();
            }
        }
        */

        /* ssoLogin End */
        /*
        var ukey = $.cookie('UKEY');
        if (ukey != undefined && ukey != null && ukey != '') {
            if (_Biz.인증.정보(ukey)) {
                callBack();
                return;
            } else {
                //
            }
        }
        */

        //$(document.body).find('.LoginPop').remove();
        $(document.body).find('.LoginSeri').remove();
        //var _pop = $("<div class='LoginPop'></div>").appendTo(document.body);
        var _pop = $("<div class='LoginSeri'></div>").appendTo(document.body);
        var _o = $("<div class='login'></div>").appendTo(_pop);

        ////$("<div><a>ID:</a><input type='text'  class='loginID'/></div>").appendTo(_o);
        ////var _pw = $("<div><a>Password:</a><input type='password'  class='loginPS' /></div>").appendTo(_o);
        ////$("<div><span  class='loginBTN'>로그인</span></div>").appendTo(_o);

        //var _o3 = $("<div class='logright'></div>").appendTo(_o);
        //var _o1 = $("<div class='logleft'></div>").appendTo(_o);
        //var _o2 = $("<div class='logcenter'><div class='logtop'></div></div>").appendTo(_o);
        //var _o4 = $("<div class='logbottom'></div>").appendTo(_o);
        //var _o5 = $("<div class='logmain'></div>").appendTo(_o2);

        //$("<form id='loginForm' name='loginForm' method='post'> </form>").appendTo(_o5);
        
        var _o1 = $('<form id="loginForm" name="loginForm" method="post"></form>"').appendTo(_o);
        var _o2 = $('<div class="logo-img"><img src="/image/logo_CEO.png"><p>CRM Login</p></div>').appendTo(_o);
        var _o3 = $('<div class="form"></div>').appendTo(_o);
        
        var _id = $('<input type="text" class="loginID" placeholder="아이디를 입력해 주세요">').appendTo(_o3);
        var _pw = $('<input type="password" class="loginPS" placeholder="비밀번호를 입력해 주세요">').appendTo(_o3);
        $('<p class="text">※ 비밀번호는 대소문자를 구분합니다.</p>').appendTo(_o3);

        var _o4 = $('<a href="#" class="loginBTN btn-login">로그인 하기</a>').appendTo(_o);
        
        //khma	20240315 로그인 페이지 아이디 저장 체크박스 주석 처리 ==> 추후 해당 옵션 처리 필요 
        //var _o4 = $('<span class="checkbox"><input type="checkbox" id="chk-save"><label for="chk-save">아이디 저장</label></span>').appendTo(_o);

        ////$("<div><input type='text' for='login' class='loginSCODE b-t b-r b-l b-b b-co b-co-basic' /></div>").appendTo(_o5);
        //$("<div><input type='text' for='login' class='loginID b-t b-r b-l b-b b-co b-co-basic' /></div>").appendTo(_o5);
        //var _pw = $("<div><input for='login' type='password' class='loginPS b-t b-r b-l b-b b-co b-co-basic' /></div>").appendTo(_o5);
        //$("<div><span class='loginBTN'></span></div>").appendTo(_o5);
        //// 자동 브라우저 height 로 화면 높이 설정하기 :: 로그아웃 상태일 때, 로그인 화면에서 Footer 가 상단으로 올라오기 때문에 추가. JDM
        //$('.Holder').css('min-height', $(window).height() - 92);
        
        
        _pw.keydown(function (e) {
            if (e.keyCode == '13') {
                $(".loginBTN").trigger("click");
            }
        });
        $(".loginBTN").click(function (e) {
            //$.cookie('UKEY', '');

            var _id = $(".login .loginID").val();
            var _pass = $(".login .loginPS").val();
            //var _scode = $(".login .loginSCODE").val();
            var _scode = 'SERICEO';

            _Biz.인증.로그인(_id, _pass, _scode);
            /*
            if (_Biz.인증.로그인(_id, _pass, _scode)) {
                $(document.body).find('.LoginPop').remove();
                callBack();
            }*/
        });
		
		/*
        $(".loginID, .loginSCODE, .loginPS").focusin(function () {
            $(this).css('background', '#FFFFFF');
        });

        $(".loginID, .loginSCODE, .loginPS").focusout(function () {
            var targeImg = "";
            if ($(this).val() == undefined || $(this).val() == "") {
                if ($(this).hasClass('loginID')) {
                    targetImg = "/image/loginID.png";
                } else if ($(this).hasClass('loginSCODE')) {
                    targetImg = "/image/loginSCODE.png";
                } else if ($(this).hasClass('loginPS')) {
                    targetImg = "/image/loginPS.png";
                }
                $(this).css('background', 'url(' + targetImg + ') no-repeat 0px center #FFFFFF');
            }
        });
        */
    };


    $.Sum = function (p1, p2, p3, p4) {
        rlt = '';
        if (p1 != undefined) { rlt += p1; }
        if (p2 != undefined) { rlt += p2; }
        if (p3 != undefined) { rlt += p3; }
        if (p4 != undefined) { rlt += p4; }

        return rlt;
    };
    $.whois = function (date) {
        alert("i'M Monarch815.js");
    };

})(jQuery);

// 파일업로드 이벤트
function GetImgFileUpload() {
    //   $.mobile.pageLoading();
    if (!$("#Filename").val() && !$("#Urlname").val()) {
        alert("파일을 선택하세요.");
        $("#Filename").focus();
        return;
    }
    //파일전송
    var frm;
    frm = $('#frmFile');
//    frm.attr("action", "/bzService/Upload.aspx"); //오라클버전
    frm.attr("action", _M.svcUrl[_M.Webtype].imgUpload); //자바버전(파일 DB로 업로드)
    frm.submit();
}

// 멀티파일업로드 이벤트
function GetMultiFileUpload(obj) {
    //   $.mobile.pageLoading();	
    if (!$("#Filename").val()) {
        alert("파일을 선택하세요.");
        $("#Filename").focus();
        return;
    }
	
	// 20140324 jwkim 확장자체크 start
    if (undefined != $("#GetFileManager").data('extenders')) {
		var extenders = $("#GetFileManager").data('extenders');
		var extenderCheck = false;
		
		var ext = $('#Filename').val().split('.').pop().toUpperCase();
		if($.inArray(ext, extenders) == -1) {
			alert('확장자가 ['+extenders.toString()+ '] 인 파일만 업로드 가능합니다.');
			return;
		}
    } // 20140324 jwkim 확장자체크 end
	
 	//파일사이즈 체크
 	var Filename = $("#Filename").val();
 	var filesize = 0;
	//파일전송
	var frm;
	frm = $('#frmFile');
	frm.attr("action", _M.svcUrl[_M.Webtype].fileUpload); //자바버전(파일업로드)
	frm.submit();
}

//파일전송 후 콜백 함수
function FileuploadCallback(data, state) {
    if (data == "error") {
        alert("파일전송중 에러 발생!!");
    } else {
        var _ar = data.split('^!^');
        $("#GetImgGallery").superContaner('ListGallery');
        
    }
    return false;

}


// 데이터업로드 이벤트
//function ExeUploadDataFile(pl) { //20140113 khma 액셀업로드 개선
function ExeUploadDataFile(param) {
	var frm = $('#frmDataFile');
	
	if (!$("#Filename").val()) {
        alert("파일을 선택하세요.");
        $("#Filename").focus();
		
        return;
    }

	var className = "";
	//var extender = frm.attr("extender"); //20140113 khma 액셀업로드 개선
	var service = frm.attr("service");
	var method = frm.attr("exeMethod");
	
	/* //20140113 khma 액셀업로드 개선
	if(extender.length > 0 ){
		extender = extender.split(","); 
	}*/
	
	var upMode = frm.attr("upmode");
	var errMsg = '데이터 업로드 처리 옵션이 정상적으로 정의되어 있지 않습니다.\n관리자에게 문의하여 주시기 바랍니다.';
	if(upMode == "multi"){
		
		$("#uploadName").find('option:selected').attr('value');
	    var uploadjson = $("#uploadName").find('option:selected').data('updJson'); //선택된 항목의 uploadList구조체정보
		if(isNotEmpty(param.extClass)){
			className = uploadjson.extClass;
		}
		//validate
		if(isEmpty(uploadjson.service || uploadjson.method)){
			alert(errMsg);
			return;
		}
		service = uploadjson.service;
		method = uploadjson.method;
		//extender = uploadjson.useExtender; //별도지정기능은 미사용 //20140113 khma 액셀업로드 개선
		
	} else if(upMode == "single"){
		if(isNotEmpty(param.extClass)){
			className = param.extClass;
		}
	}
	
	
	//선택된 데이터의 정보를 취득하여 이하의 처리를 행한다.
	//파일확장자 체크
	//if(undefined != uploadjson.useExtender && 0 < uploadjson.useExtender.length)
	/* if(undefined != extender && 0 < extender.length)
	{
		var exts = extender;
		
		var filename = $("#Filename").val();
		var str_low   = filename.toLowerCase(filename);
		var str_dotlocation = str_low.lastIndexOf(".");
		var str_ext   = str_low.substring(str_dotlocation+1);
		var usableExt = "[";
		var extChk = false;
		for(var j=0; j < exts.length; j++){
			if(j!=0)usableExt += ",";
			usableExt += exts[j];
			chkTargetExt = exts[j].toLowerCase(exts[j]);
			if(chkTargetExt == str_ext){
				extChk = true;
			}
		}
		usableExt +="]";
		
		if(!extChk){
			alert("선택하신 파일은 사용가능한 확장자"+usableExt+"가 아닙니다.");
			return;		
		}
	} */ //20140113 khma 액셀업로드 개선
	
	//파일전송
	frm.attr("action", _M.svcUrl[_M.Webtype].dataFileUpload); //자바버전(데이터 파일 업로드 )
	$('#classname').val(className);
	$('#UID').val(_M.UserInfo.id);
	$('#ULID').val(_M.UserInfo.lid);
	$('#upMode').val(upMode);	
	if(pl == undefined){
		pl = new JSONClientParameters();
	}
	$('#jsonParam').val(pl.toJson());
	
	$('#service').val(service);
	$('#exeMethod').val(method);
	frm.submit();
	$.blockUI({ message: '<h1><img src="/image/block_loading.gif" /><br> 처리중...</h1>',
		baseZ: 100000,
		css: {
			color:'#ffffff', border:'2px solid #888888', backgroundColor:'#000000'}});
}

function lPadZero(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

// ***************************************************************
// 지정한 TextArea의 내용이 제한된 길이를 초과하는지 확인한다.
// ***************************************************************
function StringBuffer() {
	this.buffer = [];
}

StringBuffer.prototype.append = function append(string) {
	this.buffer.push(string);
	return this;
};

StringBuffer.prototype.toString = function toString() {
	return this.buffer.join("");
};

function checkTextareaLimit(obj, limitLength) {
	var length = obj.val().length;
	var byteLength = getByteLength(obj.val())
	//alert("byteLength : " + byteLength);
	if (byteLength > limitLength) {
		alert("입력한 내용이 제한된 길이를 초과했습니다.");
		obj.val(extract(obj.val(), limitLength));
		return;
	}
}

function extract(string, limitLength) {
	var length = 0;
	var esc = "%B2%B3%B4%B7%A8%AD%B1%D7%F7%B0%A7%B8%A1%BF%A4%B6%AE%C6%D0%AA%3F%3F%D8%BA%DE%BD%BC%BE%E6%F0%F8%DF%FE%B9";

	var buffer = new StringBuffer()
	for ( var index = 0; index < limitLength-1; index++) {
		var character = escape(string.charAt(index));
		if (character.length == 1) {
			length++;
		} else if (character.indexOf("%u") != -1) {
			length += 2;
		} else if (character.indexOf("%") != -1) {
			if (esc.indexOf(character) != -1) {
				length += 2;
			} else {
				length += character.length / 3;
			}
		}

		if (length < limitLength) {
			buffer.append(string.charAt(index));
		}
	}
	return buffer.toString();
}

function getByteLength(string) {
	var length = 0;
	var esc = "%B2%B3%B4%B7%A8%AD%B1%D7%F7%B0%A7%B8%A1%BF%A4%B6%AE%C6%D0%AA%3F%3F%D8%BA%DE%BD%BC%BE%E6%F0%F8%DF%FE%B9";

	for ( var index = 0; index < string.length; index++) {
		var character = escape(string.charAt(index));
		if (character.length == 1) {
			length++;
		} else if (character.indexOf("%u") != -1) {
			length += 2;
		} else if (character.indexOf("%") != -1) {
			if (esc.indexOf(character) != -1) {
				length += 2;
			} else {
				length += character.length / 3;
			}
		}
	}
	return length;
}

function isDate(val){
	var ret = false;
	var year = 0;
    var month = 0;
    var day = 0;
	var thisMonth, nextMonth, maxday;

	var formedVal = _M.f.c.convDate8(val.replace(/-/gi, ''));
	year = Number(formedVal.split("-")[0]);
	month = Number(formedVal.split("-")[1]);
	day = Number(formedVal.split("-")[2]);
	
	if(year >= 1900 && (month >= 1 && month <=12)) {
		thisMonth = new Date(year, month-1, 1);
		nextMonth = new Date(year, month, 1);
		maxDay = (nextMonth - thisMonth) / 1000 / 60 / 60 / 24;
		
		if(day >= 1 && day <= maxDay){
			ret = true;
		}
	}
		
	return ret;
}

function validatePassword(pw, options)
{
	debugger;
	var result = true;

	var o = {
				lower: 0,
				upper: 0,
				alpha: 0,
				numeric: 0,
				special: 0,
				length: [8, Infinity],
				custom: [],
				badWords: [],
				badSequenceLength: 0,
				noQwertySequences: true,
				noSequential: true
			};
			
	for (var property in options)
	{
		o[property] = options[property];
	}
	
	var	re = {
				lower:   /[a-z]/g,
				upper:   /[A-Z]/g,
				alpha:   /[A-Z]/gi,
				numeric: /[0-9]/g,
				special: /[\W_]/g
			 };
			 
	var rule, i;

	// 암호길이검사
	if (pw.length < o.length[0] || pw.length > o.length[1])
		result = false;//return false;
	// 문자/숫자/특수문자 조합 검사
	if(!pw.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)){
		result = false;
	}
	
	// 금지어인지 검사
	for (i = 0; i < o.badWords.length; i++) 
		if (pw.toLowerCase().indexOf(o.badWords[i].toLowerCase()) > -1)
			result = false;//return false;
	

	// 암호의 연속성 여부 검사
	var SamePass_0 = 0; //동일문자 카운트
	var SamePass_1 = 0; //연속성(+) 카운드
	var SamePass_2 = 0; //연속성(-) 카운드
	 
	var chr_pass_0;
	var chr_pass_1;
	 
	for(var i=0; i < pw.length; i++) 
	{
		chr_pass_0 = pw.charAt(i);
		chr_pass_1 = pw.charAt(i+1);
	
		//동일문자 카운트
		if(chr_pass_0 == chr_pass_1) 
		{
			SamePass_0 = SamePass_0 + 1
		}
	}
	if(SamePass_0 > 2) 
	{
		result = false;
	}
	
	if (o.badSequenceLength) {
		var	lower   = "abcdefghijklmnopqrstuvwxyz",
			upper   = lower.toUpperCase(),
			numbers = "0123456789",
			qwerty  = "qwertyuiopasdfghjklzxcvbnm",
			start   = o.badSequenceLength - 1,
			seq     = "_" + pw.slice(0, start);
		for (i = start; i < pw.length; i++) {
			seq = seq.slice(1) + pw.charAt(i);
			if (
				lower.indexOf(seq)   > -1 ||
				upper.indexOf(seq)   > -1 ||
				numbers.indexOf(seq) > -1 ||
				(o.noQwertySequences && qwerty.indexOf(seq) > -1)
			) {
				result = false;//return false;
			}
		}
	}
	
	if(pw.search(re.alpha) < 0 
		//khma 대소문자구분에서 영문존재만 체크 하도록 수정
		//|| pw.search(re.lower) < 0 
		//|| pw.search(re.upper) < 0 
		|| (pw.search(re.lower) < 0
		&& pw.search(re.upper) < 0) 
		
		|| pw.search(re.special) < 0 
		|| pw.search(re.numeric) < 0)
	{
		result = false;//return false;
	}
	
	if (!result)
	{
		alert("입력한 암호를 확인해 주십시오.\n\n" + 
		      "-----------------------------------------\n\n" + 
		      "1) 암호는 최소 8글자 이상이여야 합니다.\n\n" +
		      "2) 3회이상 연속된 숫자나 알파벳을 입력할 수 없습니다.\n\n" +
		      "3) 암호는 최소 숫자/소문자/대문자/특수문자를 각각 하나씩 포함해야 합니다."); 
	}

	return (result);				
}

 //20130124 jwkim sort형식 Start
 function getSortOption(arrSort){
     var sort= "";
    if(undefined != arrSort){
	    $.each(arrSort, function(i, v) {
		     sort += "name:" + v.name + ",sorting:" + v.sorting; 
		     if(arrSort.length -1 != i){
		     	sort +="/";
		     }
	     });
    }
     return sort;
}