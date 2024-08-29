﻿/*!
* jQuery grid plugin: 
* 
* version 0.1 2016-07-21
* Requires jQuery v1.6.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Kim Seoung Min
* Company : Kongyoung DB
*
*/

var _M = {
    Dateformat: "yy-mm-dd",
    DataType: {
        text: 'text',
        date: 'date',
        date8: 'date8',
        dateBetween: 'dateBetween',
        dateBetween8: 'dateBetween8',
        datetime: 'datetime',
        number: 'number',
        money: 'money',
        select: 'select',
        context: 'context',
        chkselect: 'chkselect',
        radio: 'radio',
        check: 'check',
        multicheck: 'multicheck',
        tel: 'tel',
        phone: 'phone',
        mail: 'mail',
        url: 'url',
        link: 'link',
        multicombo: 'multicombo',
        slider: 'slider',
        textarea: 'textarea',
        textword: 'textword',
        zip: 'zip',
        popup: 'popup',
        img: 'img',
        hidden: 'hidden'
    },
	 svcUrl : {
		NET : { //닷넷버전 서비스 URL
			crudUrl : "/bzService/SvcCRUD.asmx/DATACRUD",
			M5Hash : "/bzService/SvcCRUD.asmx/M5Hash",
			GetJs : "/bzService/SvcCRUD.asmx/GetJs",
			GetCode : "/bzService/SvcCRUD.asmx/GetCode",
			imgUpload : "/bzService/Upload.aspx", //DB 바이너리 저장방식
			fileUpload : "/bzService/fileupload.aspx", //물리파일 저장방식
            fileDownload : "/bzService/Down.aspx", //물리파일 다운로드
			exceldown : "/bzService/SvcCRUD.asmx/DATACRUD"
		},
		Java : { //자바버전 서비스 URL
			crudUrl: "DATACRUD.json",
			M5Hash: "M5Hash.json",
			GetJs: "GetJs.json",
			GetCode: "GetCode.json",
			imgUpload:"upload.mon", //DB 바이너리 저장방식
			fileUpload:"fileupload.mon", //물리파일 저장방식
            fileDownload : "filedownload.mon", //물리파일 다운로드
            signFileUpload:"signFileUpload.mon", //계약파일 업로드 20240619
            signFileDownload:"signFileDownload.mon", //계약파일 다운로드 20240619
			exceldown: "exceldown.mon",	
			exceldownOld: "exceldownOld.mon",	
			dataFileUpload:"doUploadDataFile.mon", //데이터파일 업로드
			dataFileUploadOld:"doUploadDataFileOld.mon", //데이터파일 업로드
			GetHtml: "GetHtml.json", //속도개선을 위한 html파싱후다운처리시 사용.
			sendIndvEmail: "sendIndvEmail.json", //개별 이메일 처리 요청
			extSvc: "extSvc.json", // 외부에서 처리 요청시 사용(crudUrl과 동일)
			getExtJs: "getExtJs.json" // 외부에서 처리 요청시 사용(getJs 동일)
		}
	},
    aSync: { sync: false, async: true },
    UserInfo: { id: '', lid: '', name: '', SID: '', depart: '', departnm: '', cardcd: '', key: '', dvl: '0', xlauth: '0', level: '0', lang: '', logo: '', gsite: '', gcorp:'', gcorpnm:'',tcorp:'',tcorpnm:'' },
    SubMenu: {},
    Permission: { C: true, R: true, U: true, D: true },
    PopUpDialog: { width: 950, height: 500 },
    Webtype: "Java", // JAVA, NET
    //IsPageShow: true, // true-전체페이지(빠른속도), false-권한있는페이지 
    //CssName: "silgi",
    Codes: {
        "TimeHours": [{ "CODE": "07", "DECODE": "오전 7시" },
                      { "CODE": "08", "DECODE": "오전 8시" },
                      { "CODE": "09", "DECODE": "오전 9시" },
                      { "CODE": "10", "DECODE": "오전 10시" },
                      { "CODE": "11", "DECODE": "오전 11시" },
                      { "CODE": "12", "DECODE": "오전 12시" },
                      { "CODE": "13", "DECODE": "오후 1시" },
                      { "CODE": "14", "DECODE": "오후 2시" },
                      { "CODE": "15", "DECODE": "오후 3시" },
                      { "CODE": "16", "DECODE": "오후 4시" },
                      { "CODE": "17", "DECODE": "오후 5시" },
                      { "CODE": "18", "DECODE": "오후 6시" },
                      { "CODE": "19", "DECODE": "오후 7시" },
                      { "CODE": "20", "DECODE": "오후 8시" },
                      { "CODE": "21", "DECODE": "오후 9시" },
                      { "CODE": "22", "DECODE": "오후 10시" },
                      { "CODE": "23", "DECODE": "오후 11시" },
                      { "CODE": "00", "DECODE": "오전 0시" },
                      { "CODE": "01", "DECODE": "오전 1시" },
                      { "CODE": "02", "DECODE": "오전 2시" },
                      { "CODE": "03", "DECODE": "오전 3시" },
                      { "CODE": "04", "DECODE": "오전 4시" },
                      { "CODE": "05", "DECODE": "오전 5시" },
                      { "CODE": "06", "DECODE": "오전 6시"}],
        "TimeMinutes": [{ "CODE": "00", "DECODE": "0분" },
                      { "CODE": "05", "DECODE": "5분" },
                      { "CODE": "10", "DECODE": "10분" },
                      { "CODE": "15", "DECODE": "15분" },
                      { "CODE": "20", "DECODE": "20분" },
                      { "CODE": "25", "DECODE": "25분" },
                      { "CODE": "30", "DECODE": "30분" },
                      { "CODE": "35", "DECODE": "35분" },
                      { "CODE": "40", "DECODE": "40분" },
                      { "CODE": "45", "DECODE": "45분" },
                      { "CODE": "50", "DECODE": "50분" },
                      { "CODE": "55", "DECODE": "55분"}],
        "Month": [{ "CODE": "01", "DECODE": "1월" },
                      { "CODE": "02", "DECODE": "2월" },
                      { "CODE": "03", "DECODE": "3월" },
                      { "CODE": "04", "DECODE": "4월" },
                      { "CODE": "05", "DECODE": "5월" },
                      { "CODE": "06", "DECODE": "6월" },
                      { "CODE": "07", "DECODE": "7월" },
                      { "CODE": "08", "DECODE": "8월" },
                      { "CODE": "09", "DECODE": "9월" },
                      { "CODE": "10", "DECODE": "10월" },
                      { "CODE": "11", "DECODE": "11월" },
                      { "CODE": "12", "DECODE": "12월"}]
    },
	FileExtenders:  //파일 확장자 종류 20140324 jwkim
	{			
		images : ["BMP","JPG","GIF","PNG","TIF","SVG","SVGZ","PCX"],
		docs :["TXT","XLS","XLSX","DOC","DOCX","PDF","PPT","DOTX","DOT","DPC","RTF","HWP","HWT","XML"],
		audios : ["MP3","WAV","OGG","WMA","FLAC","MID","MIDI","AC3","AAC","RA"],
		videos :["AVI","MPG","MPEG","MP4","RM","RAM","ASF","ASX","WMV","MOV","SWF","FLV","MKV"]
	},
	SignFileExtenders:  //계약파일 확장자 종류 20240620
	{			
		ext : ["JPG","PNG","HWP","DOC","DOCX","XLS","XLSX","PPT","PPTX","PDF"]
	},
    Jsons: {},

    PrevActGbn: {
		prevMenuId: "0000",
        currMenuId: "0000", //현재메뉴
        currStepMenu: "", //
        actionName: ""
    },
	WordOption: {
		selector: '',
		language :'ko_KR',
		theme: "modern",
		menubar : false,
		statusbar : false,
        toolbar_items_size: 'small',
		plugins: [
			"advlist autolink lists link image charmap print preview hr anchor pagebreak",
			"searchreplace wordcount visualblocks visualchars code fullscreen",
			"insertdatetime media nonbreaking save table contextmenu directionality",
			"emoticons template paste textcolor"
		],
		toolbar1: "newdocument GetContent GetImg | insertfile undo redo | cut copy paste pastetext | table | bullist numlist | outdent indent | link unlink image media | print preview code ",
		toolbar2: "formatselect fontselect fontsizeselect | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify ",
		toolbar1_default: "newdocument GetContent GetImg | insertfile undo redo | cut copy paste pastetext | table | bullist numlist | outdent indent | link unlink image media | print preview code ",
		toolbar2_default: "formatselect fontselect fontsizeselect | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify ",
		image_advtab: true,
		paste_data_images: true,
        paste_retain_style_properties : "all", // 허용할 style 속성을 지정.
        paste_strip_class_attributes : "none", // 클래스 속성 제거여부 결정.	
		templates: [
			{title: 'Test template 1', content: 'Test 1'},
			{title: 'Test template 2', content: 'Test 2'}
		],
		setup: function(ed) {
			ed.on('blur', function(e) {
			});	
			ed.on('change', function(e) {
				var _o = $('#' + ed.id ).parents('.fieldContaner');
                _o.superContaner('ContanerChange');
			});
			ed.addButton('GetImg', {
                title: '이미지 가져오기',
                image: 'image/mceicon-image.png',
                onclick: function () {
                    // Add you own code to execute something on click
                    $.GetImg(function (urlData, fileName) {
                        _img = "<img src='" + urlData + "' alt='" + fileName + "' />";

                        ed.focus();
                        ed.selection.setContent(_img);
                    });
                }
            });
			ed.addButton('GetContent', {
                title: '컨텐츠 가져오기',
                image: 'image/mceicon-template.png',
                onclick: function () {
                    // Add you own code to execute something on click
                    var contentJson = "MON_ADM_컨텐츠POPUP_TBL";

                    $.ContentPopUp(contentJson, $(this), '기타', function (content) {
                        ed.focus();
                        ed.setContent(content);
                    });
                }
            });
		},
		force_p_newlines : true,
		forced_root_block : false,
		relative_urls : false,
		remove_script_host : false,
		init_instance_callback: function(editor) {
			var object = $("#" + editor.id).parents(".fieldContaner");
			var editorDisable = object.attr('editorDisable');
			var value = object.attr("value");
			editor.setContent($.decHTML(value));
			
			// 2014.06.09 dmjung :: 에디터 readonly 시, 지정한 toolbar 버튼 active 시키기.
			if ( editorDisable == 'true' ) {
				tinymce.activeEditor.theme.panel.find('button').disabled(false);
			} 
			
			// 2014.06.09 dmjung :: resizingCell 바인딩.
			object.find('iframe').resizingCell({
                selector:'td',
                thick: 14
            });		
		}
	},

    fullCalendar: {
        header: {
            left: 'today prev,next',
            center: 'title ',
            right: 'month,agendaWeek,agendaDay'
        },
        timeFormat: { // for event elements
            '': 'HH:mm ' // default
            , 'agenda': 'HH:mm{ - HH:mm}'
        },
        editable: true,
        selectable: true,
        selectHelper: true,

        dayClick: function (date, allDay, jsEvent, view) {
            //날짜를 클릭시에 발생이벤트
            $(this).superContaner('CalDayClick', date, allDay, jsEvent, view, $(this));
        },
        eventClick: function (calEvent, jsEvent, view) {
            $(this).superContaner('CalClick', calEvent, jsEvent, view, $(this));
        },
        eventDragStop: function (event, jsEvent, ui, view) {
            $(this).superContaner('CalDragStop', event, jsEvent, ui, view, $(this));
        },
        eventResizeStop: function (event, jsEvent, ui, view) {
            $(this).superContaner('CalReSizeStop', event, jsEvent, ui, view, $(this));
        },
        select: function (start, end, allDay) {
            $(this).superContaner('CalAdd', start, end, allDay);
        },
        viewDisplay: function (view) {
            var option = $('.SuperCalendar').data("jsonData");
            if (option.calendarMode != 'subCalendar') {
                $(this).superContaner('CalList', view); //리스트표시
            } else {
                $(this).superContaner('CalendarListParent'); //리스트표시
            }
        },
        eventAfterRender: function (event, element, view) {
            $(this).superContaner('CalAfterRender', event, element, view);
        },
        eventDrop: function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
            $(this).superContaner('CalDrop', event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view, $(this));
        },
        eventResize: function (event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
            $(this).superContaner('CalResize', event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view, $(this));
        },
        eventRender: function (event, element) {
            $(this).superContaner('CalRender', event, element);
        }
    },

    f: {/// <summary>오늘날짜를 리턴함</summary>
        d: {
            DateGetDate: function (d) {
                /// <summary>오늘날짜를 리턴함</summary>
                var s = leadingZeros(d.getFullYear(), 4) + '-' +
						leadingZeros(d.getMonth() + 1, 2) + '-' +
						leadingZeros(d.getDate(), 2);

                return s;
            },
            DateGetTime: function (d) {
                /// <summary>오늘날짜를 리턴함</summary>
                var s = leadingZeros(d.getHours(), 2) + leadingZeros(d.getMinutes(), 2);
                return s;
            },
            DateGetTimeStamp: function (d) {
                /// <summary>오늘날짜를 리턴함</summary>
                var s = leadingZeros(d.getFullYear(), 4) + '-' +
						leadingZeros(d.getMonth() + 1, 2) + '-' +
						leadingZeros(d.getDate(), 2) + ' ' +
						leadingZeros(d.getHours(), 2) + ':' +
						leadingZeros(d.getMinutes(), 2) + ':' +
						leadingZeros(d.getSeconds(), 2);
                return s;
            },
            getDate: function () {
                /// <summary>오늘날짜를 리턴함</summary>
                var d = new Date();
                var s = leadingZeros(d.getFullYear(), 4) + '-' +
						leadingZeros(d.getMonth() + 1, 2) + '-' +
						leadingZeros(d.getDate(), 2);
                return s;
            },
            getTimeStamp: function () {
                var d = new Date();
                var s = leadingZeros(d.getFullYear(), 4) + '-' +
						leadingZeros(d.getMonth() + 1, 2) + '-' +
						leadingZeros(d.getDate(), 2) + ' ' +
						leadingZeros(d.getHours(), 2) + ':' +
						leadingZeros(d.getMinutes(), 2) + ':' +
						leadingZeros(d.getSeconds(), 2);
                return s;
            },
            getTime: function () {
                var d = new Date();
                var m = parseInt(d.getMinutes() / 5) * 5;
                var s = leadingZeros(d.getHours(), 2) +
						leadingZeros(m, 2);
                return s;
            },
            getDateAdd: function (nextDay) {
                var d = new Date();
                nextDay = nextDay * -1;
                var dt = d - nextDay * 24 * 60 * 60 * 1000;
                var nd = new Date(dt);
                var s = leadingZeros(nd.getFullYear(), 4) + '-' +
						leadingZeros(nd.getMonth() + 1, 2) + '-' +
						leadingZeros(nd.getDate(), 2);
                return s;
            },
            getDateChange: function (changeDate) {
				var nd = new Date();
                //var d = new Date();
                
                let stndDate = changeDate.substring(0,1).toLowerCase();
				let regex = /[^-\0-9]/g;
                let chgeDate = changeDate.substring(1).replace(regex, "") * 1;
                
                if(!isNaN(chgeDate) && isNotEmpty(chgeDate)) {
	                if(stndDate == 'y') {
						nd.setFullYear(nd.getFullYear() + chgeDate);
					} else if (stndDate == 'm') {
						nd.setMonth(nd.getMonth() + chgeDate);
					} else {
						nd.setDate(nd.getDate() + chgeDate);
					}
				}

                var s = leadingZeros(nd.getFullYear(), 4) + '-' +
						leadingZeros(nd.getMonth() + 1, 2) + '-' +
						leadingZeros(nd.getDate(), 2);
                return s;
            },
            getFDateChange: function (changeDate) {
				var nd = new Date();
                //var d = new Date();
                
                let stndDate = changeDate.substring(1,2).toLowerCase();
				let regex = /[^-\0-9]/g;
                let chgeDate = changeDate.substring(2).replace(regex, "") * 1;
                
                if(!isNaN(chgeDate) && isNotEmpty(chgeDate)) {
	                if(stndDate == 'y') {
						nd.setFullYear(nd.getFullYear() + chgeDate);
					} else if (stndDate == 'm') {
						nd.setMonth(nd.getMonth() + chgeDate);
					}
				}

                var s = leadingZeros(nd.getFullYear(), 4) + '-' +
						leadingZeros(nd.getMonth() + 1, 2) + '-01';
                return s;
            },
            e: ''
        },
        c: {
            SetLocalCode: function (cd, data) {
                var cdarr = new Array();
				var rstData = data.resultData;
                if (rstData.length > 0) {
                    $.each(rstData, function (index, row) {
                        cdarr.push({ "CODE": $.decHTML(row['CODE']), "DECODE": $.decHTML(row['DECODE']), "UPCODE": $.decHTML(row['UPCODE']) });
                    });
                    if (cd != "" && cd != undefined) {
                        eval("_M.Codes." + cd + " = cdarr");
                    }
                }
            },
            //            SetLiCode: function (seObj, Key, CallBack) {
            //                if (_M.Codes[Key] == undefined) {
            //                    $.SvcGetCode(Key, function (data) {
            //                        $.each(data, function (index, row) {
            //                            var _li = $("<li class='conMenu002' cmd='" + row['CODE'] + "'><span><a href='#'>" + row['DECODE'] + "</a></span></li>").appendTo(seObj).css('width', 'auto');
            //                            _li.bind("click", function (e) { CallBack($(this)); });
            //                        });
            //                        _M.f.c.SetLocalCode(Key, data);
            //                    });
            //                } else {
            //                    $.each(_M.Codes[Key],
            //                            function (index, value) {
            //                                var _li = $("<li class='conMenu002' cmd='" + value.CODE + "'><span><a href='#'>" + value.DECODE + "</a></span></li>").appendTo(seObj).css('width', 'auto');
            //                                _li.bind("click", function (e) { CallBack($(this)); });
            //                            });
            //                }
            //            },

            SetRadioCode: function (seObj, Key, colwidth, syncTf) {
                var _ServiceKey = Key.split('.');
                var radioname = 'radio' + Key + formCID++;
                //var _width = (90 / cols) + '%';
                var _syncTf = syncTf;
                if (syncTf == undefined) {
                    _syncTf = _M.aSync.sync;
                }
                //colwidth에서 %와 px입력에 대비
                if (colwidth != 0) {
                    var regex = /[^0-9]/g;
                    var numcolwidth = colwidth.replace(regex, '');
                }
                if (_ServiceKey.length == 1) { //일반적인 공통코드 사용시
                    if (_M.Codes[Key] == undefined) {
                        $.SvcGetCode(Key, function (data) {
                            $.each(data.resultData, function (index, row) {
                                var radioid = 'radio' + formCID++;
                                if (numcolwidth > 0) {
                                    $("<span class='radiospn'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] + "' /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj).css('width', colwidth);
                                } else {
                                    $("<span class='radiospn'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] + "' /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj);
                                }
                            });
                            _M.f.c.SetLocalCode(Key, data);
                        }, _syncTf);
                    } else {
                        $.each(_M.Codes[Key],
                        function (index, row) {
                            var radioid = 'radio' + formCID++;
                            if (numcolwidth > 0) {
                                $("<span class='radiospn'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] + "' /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj).css('width', colwidth);
                            } else {
                                $("<span class='radiospn'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] + "' /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj);
                            }
                        });
                    }
                } else { //공통코드 사용하지 않고 서비스 호출로 데이터 바인딩시
                    $.SvcGetSvcCode(_ServiceKey[0], _ServiceKey[1], function (data) {
                        $.each(data.resultData, function (index, row) {
                            var radioid = 'radio' + formCID++;
                            if (numcolwidth > 0) {
                                $("<span class='radiospn'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] + "' /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj).css('width', colwidth);
                            } else {
                                $("<span class='radiospn'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] + "' /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj);
                            }
                        });
                    }, _syncTf);
                }
            },

            SetRadioCodeCss: function (seObj, Key, colwidth, colcss,readOnly, syncTf) {
                var _ServiceKey = Key.split('.');
                var radioname = 'radio' + Key + formCID++;
                //var _width = (90 / cols) + '%';

                var _syncTf = syncTf;
                if (syncTf == undefined) {
                    _syncTf = _M.aSync.sync;
                }

                //colwidth에서 %와 px입력에 대비
                if (colwidth != 0) {
                    var regex = /[^0-9]/g;
                    var numcolwidth = colwidth.replace(regex, '');
                }
                if (colcss == "" || colcss == undefined) {
                    colcss = "radiospn";
                }

                var disabledOpt = "";
                if(readOnly) disabledOpt = "disabled";
                
                if (_ServiceKey.length == 1) { //일반적인 공통코드 사용시
                    if (_M.Codes[Key] == undefined) {
                        $.SvcGetCode(Key, function (data) {
                            $.each(data.resultData, function (index, row) {
                                var radioid = 'radio' + formCID++;
                                if (numcolwidth > 0) {
                                    $("<span class='" + colcss + "'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] +"'" +disabledOpt +" /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj).css('width', colwidth);
                                } else {
                                    $("<span class='" + colcss + "'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] +"'" +disabledOpt +" /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj);
                                }
                            });
                            _M.f.c.SetLocalCode(Key, data);
                        }, _syncTf);
                    } else {
                        $.each(_M.Codes[Key],
                        function (index, row) {
                            var radioid = 'radio' + formCID++;
                            if (numcolwidth > 0) {
                                $("<span class='" + colcss + "'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] +"'" +disabledOpt +" /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj).css('width', colwidth);
                            } else {
                                $("<span class='" + colcss + "'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] +"'" +disabledOpt +" /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj);
                            }
                        });
                    }
                } else { //공통코드 사용하지 않고 서비스 호출로 데이터 바인딩시
                    $.SvcGetSvcCode(_ServiceKey[0], _ServiceKey[1], function (data) {
                        $.each(data.resultData, function (index, row) {
                            var radioid = 'radio' + formCID++;
                            if (numcolwidth > 0) {
                                $("<span class='" + colcss + "'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE'] +"'" +disabledOpt +" /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj).css('width', colwidth);
                            } else {
                                $("<span class='" + colcss + "'><input type='radio' name='" + radioname + "' id='" + radioid + "' value='" + row['CODE']+"'" +disabledOpt +" /><label for='" + radioid + "'>" + row['DECODE'] + "</label></span>").appendTo(seObj);
                            }
                        });
                    }, _syncTf);
                }
            },

            SetMultiCheckCode: function (fieldObj, Key, colwidth, readOnly,syncTf) {
                var _ServiceKey = Key.split('.');
                //var _width = (90 / cols) + '%';

                var _syncTf = syncTf;
                if (syncTf == undefined) {
                    _syncTf = _M.aSync.sync;
                }
                
                var disabledOpt = "";
                if(readOnly) disabledOpt = "disabled";
                
                //colwidth에서 %와 px입력에 대비
                if (colwidth != undefined && colwidth != 0) {
                    var regex = /[^0-9]/g;
                    var numcolwidth = colwidth.replace(regex, '');
                }
                if (_ServiceKey.length == 1) { //일반적인 공통코드 사용시
                    if (_M.Codes[Key] == undefined) {
                        $.SvcGetCode(Key, function (data) {
                            $.each(data.resultData, function (index, row) {
                                var radioidEdit = 'check' + formCID++;
                                if (numcolwidth > 0) {
                                    $("<span class='multichkspn'><input type='checkbox'  id='" + radioidEdit + "' value='" + row['CODE'] +"'" +disabledOpt +" /><span class='multilblspn'><label for='" + radioidEdit + "' title='" + row['DECODE'] + "'>" + row['DECODE'] + "</label></span></span>").appendTo(fieldObj).css('width', colwidth);
                                } else {
                                    $("<span class='multichkspn'><input type='checkbox'  id='" + radioidEdit + "' value='" + row['CODE'] +"'" +disabledOpt +" /><span class='multilblspn'><label for='" + radioidEdit + "' title='" + row['DECODE'] + "'>" + row['DECODE'] + "</label></span></span>").appendTo(fieldObj);
                                }
                            });
                            _M.f.c.SetLocalCode(Key, data);
                        }, _syncTf);
                    } else {
                        var mcd = _M.Codes[Key];
                        $.each(mcd,
                    function (index, row) {
                        var radioidEdit = 'check' + formCID++;
                        if (numcolwidth > 0) {
                            $("<span class='multichkspn'><input type='checkbox'  id='" + radioidEdit + "' value='" + row['CODE'] +"'" +disabledOpt +" /><span class='multilblspn'><label for='" + radioidEdit + "' title='" + row['DECODE'] + "'>" + row['DECODE'] + "</label></span></span>").appendTo(fieldObj).css('width', colwidth);
                        } else {
                            $("<span class='multichkspn'><input type='checkbox'  id='" + radioidEdit + "' value='" + row['CODE'] +"'" +disabledOpt +" /><span class='multilblspn'><label for='" + radioidEdit + "' title='" + row['DECODE'] + "'>" + row['DECODE'] + "</label></span></span>").appendTo(fieldObj);
                        }
                    });


                    }
                } else { //공통코드 사용하지 않고 서비스 호출로 데이터 바인딩시
                    $.SvcGetSvcCode(_ServiceKey[0], _ServiceKey[1], function (data) {
                        $.each(data.resultData, function (index, row) {
                            var radioidEdit = 'check' + formCID++;
                            if (numcolwidth > 0) {
                                $("<span class='multichkspn'><input type='checkbox'  id='" + radioidEdit + "' value='" + row['CODE']+"'" +disabledOpt +"/><span class='multilblspn'><label for='" + radioidEdit + "' title='" + row['DECODE'] + "'>" + row['DECODE'] + "</label></span></span>").appendTo(fieldObj).css('width', colwidth);
                            } else {
                                $("<span class='multichkspn'><input type='checkbox'  id='" + radioidEdit + "' value='" + row['CODE'] +"'" +disabledOpt +"/><span class='multilblspn'><label for='" + radioidEdit + "' title='" + row['DECODE'] + "'>" + row['DECODE'] + "</label></span></span>").appendTo(fieldObj);
                            }
                        });
                    }, _syncTf);
                }
            },

            SetMultiiconCheckCode: function (seObj, Key, colwidth, syncTf) {
                //Key = Key.replace('.', '_');
                //var _ServiceKey = Key.split('_');
                var _ServiceKey = Key.split('.');

                var _syncTf = syncTf;
                if (syncTf == undefined) {
                    _syncTf = _M.aSync.sync;
                }

                //colwidth에서 %와 px입력에 대비
                if (colwidth != 0) {
                    var regex = /[^0-9]/g;
                    var numcolwidth = colwidth.replace(regex, '');
                }

                if (_M.Codes[Key] != undefined) {
                    $.each(_M.Codes[Key],
                    function (index, row) {
                        if (numcolwidth > 0) {
                            $("<span class='clsiconcheck' ><span class='cmdicon likecheck01'  value='" + row['CODE'] + "'></span><a class='cmdiconLabel'>" + row['DECODE'] + "</a></span>").appendTo(seObj).css('width', colwidth).css('float', 'left');
                        } else {
                            $("<span class='clsiconcheck' ><span class='cmdicon likecheck01'  value='" + row['CODE'] + "'></span><a class='cmdiconLabel'>" + row['DECODE'] + "</a></span>").appendTo(seObj).css('float', 'left');
                        }
                    });
                } else {
                    if (_ServiceKey.length == 1) { //일반적인 공통코드 사용시
                        $.SvcGetCode(Key, function (data) {
                            $.each(data.resultData, function (index, row) {
                                radioid = 'radio' + formCID++;
                                if (numcolwidth > 0) {
                                    $("<span class='clsiconcheck'><span class='cmdicon likecheck01' value='" + row['CODE'] + "'></span><a class='cmdiconLabel'>" + row['DECODE'] + "</a></span>").appendTo(seObj).css('width', colwidth).css('float', 'left');
                                } else {
                                    $("<span class='clsiconcheck'><span class='cmdicon likecheck01' value='" + row['CODE'] + "'></span><a class='cmdiconLabel'>" + row['DECODE'] + "</a></span>").appendTo(seObj).css('float', 'left');
                                }
                            });
                            _M.f.c.SetLocalCode(Key, data);
                        }, _syncTf);
                    } else {
                        $.SvcGetSvcCode(_ServiceKey[0], _ServiceKey[1], function (data) {
                            $.each(data.resultData, function (index, row) {
                                radioid = 'radio' + formCID++;
                                if (numcolwidth > 0) {
                                    $("<span class='clsiconcheck'><span class='cmdicon likecheck01' value='" + row['CODE'] + "'></span><a class='cmdiconLabel'>" + row['DECODE'] + "</a></span>").appendTo(seObj).css('width', colwidth).css('float', 'left');
                                } else {
                                    $("<span class='clsiconcheck'><span class='cmdicon likecheck01' value='" + row['CODE'] + "'></span><a class='cmdiconLabel'>" + row['DECODE'] + "</a></span>").appendTo(seObj).css('float', 'left');
                                }
                            });
                            _M.f.c.SetLocalCode(Key, data);
                        }, _syncTf);
                    }
                }
            },



            SetOptionCode: function (seObj, Key, setFoption, syncTf, parentKey, parentField) {
                var _ServiceKey = Key.split('.');
                var _fisrtOption = setFoption
                if (_fisrtOption == undefined) {
                    _fisrtOption = "";
                }
                var _syncTf = syncTf;
                if (syncTf == undefined) {
                    _syncTf = _M.aSync.sync;
                }
				
				var sIndex = 0;
                if(true != eval(seObj.attr('noBlank'))){
                    seObj.get(0).options[0] = new Option("", "");
                    sIndex = 1;
                }
				
                if (_ServiceKey.length == 1) { //일반적인 공통코드 사용시
                    for (var i = seObj.get(0).length - 1; i >= 1; i--) { seObj.get(0).options[i] = null; };
                    if (_M.Codes[Key] == undefined) {
					
                        if(sIndex == 1) seObj.get(0).options[0] = new Option(_fisrtOption, "");
                        $.SvcGetCode(Key, function (data) {
                            $.each(data.resultData, function (index, row) {
                            	var length = seObj.get(0).options.length;
                            	if ( parentKey!= undefined ) {
	                            	if ( $.decHTML(row['UPCODE']) == parentKey ) {
	                            		seObj.get(0).options[length] = new Option( $.decHTML(row['DECODE']), $.decHTML(row['CODE']), $.decHTML(row['UPCODE']) );
	                            	}
                            	}
                            	else {
                            		seObj.get(0).options[length] = new Option( $.decHTML(row['DECODE']), $.decHTML(row['CODE']) );
                            	}
                            });
                            _M.f.c.SetLocalCode(Key, data);
                        }, _syncTf, parentKey);
                    } else {
                        if(sIndex == 1) seObj.get(0).options[0] = new Option(_fisrtOption, "");
                        if (_M.Codes[Key] == undefined) return;
                        $.each(_M.Codes[Key],
                                function (index, value) {
                        			var length = seObj.get(0).options.length;
                        			if ( parentKey!= undefined ) {
                        				if ( value.UPCODE == parentKey ) {
                        					seObj.get(0).options[length] = new Option( value.DECODE, value.CODE, value.UPCODE );
                        				}
                        			}
                        			else {
                        				seObj.get(0).options[length] = new Option( value.DECODE, value.CODE );
                        			}
                                });
                    }
                } else { //공통코드 사용하지 않고 서비스 호출로 데이터 바인딩시
                    for (var i = seObj.get(0).length - 1; i >= 1; i--) { seObj.get(0).options[i] = null; };
                    if(sIndex == 1) seObj.get(0).options[0] = new Option(_fisrtOption, "");
                    $.SvcGetSvcCode(_ServiceKey[0], _ServiceKey[1], function (data) {
						
                        $.each(data.resultData, function (index, row) {
                           // seObj.get(0).options[index + sIndex] = new Option(row['DECODE'], row['CODE']);
						   var length = seObj.get(0).options.length;
							if ( parentKey!= undefined ) {
								if ( row['UPCODE'] == parentKey ) {
									seObj.get(0).options[length] = new Option( $.decHTML(row['DECODE']), $.decHTML(row['CODE']) );
								}
							} else {
								seObj.get(0).options[length] = new Option( $.decHTML(row['DECODE']), $.decHTML(row['CODE']) );
							}
                        });
                        //_M.f.c.SetLocalCode(Key, data);
                    }, _syncTf,parentKey,parentField);
                }
            },

            SetYearCode: function (seObj, min, max) {
                var d = new Date();
                if (min == undefined) min = d.getFullYear() - 10;
                if (max == undefined) max = d.getFullYear() + 5;
                seObj.get(0).options[seObj.get(0).options.length] = new Option('', '');
                for (var i = min; i <= max; i++) {
                    seObj.get(0).options[seObj.get(0).options.length] = new Option(i + '년', i);
                };
            },

            convDate8: function (str) {
                /// <summary>문자8바이트를 날짜로 변한</summary>
                var s = str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2);
                return s;
            },
            setComma: function (str) {
                var retValue = 0;
				if(typeof str == 'number') str = str.toString();
                var arr = str.split(".");
                var prenum = arr[0].replace(/-/gi, '');
                try {
                    prenum = parseFloat(prenum);
                    if (isNaN(prenum)) return 0;
                    prenum = "" + prenum + "";
                    var retValue = "";
                    for (i = 0; i < prenum.length; i++) {
                        if (i > 0 && (i % 3) == 0) {
                            retValue = prenum.charAt(prenum.length - i - 1) + "," + retValue;
                        } else {
                            retValue = prenum.charAt(prenum.length - i - 1) + retValue;
                        }
                    }

                    if (arr[1]) {
                        retValue = retValue + "." + arr[1];
                    }

                    if (str < 0) {
                        retValue = "-" + retValue;
                    }

                }
                catch (er) {
                    return 0;
                }
                return retValue;
            }
        }
    },
    Option: {
        date: { showOn: "both", buttonImage: "/image/btncarendar.gif", buttonImageOnly: true,
            closeText: '닫기',
            prevText: '이전달',
            nextText: '다음달',
            currentText: '오늘',
            monthNames: ['1월(JAN)', '2월(FEB)', '3월(MAR)', '4월(APR)', '5월(MAY)', '6월(JUM)', '7월(JUL)', '8월(AUG)', '9월(SEP)', '10월(OCT)', '11월(NOV)', '12월(DEC)'],
            monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dayNames: ['일', '월', '화', '수', '목', '금', '토'],
            dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
            dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
            weekHeader: 'Wk',
            dateFormat: 'yy-mm-dd',
            firstDay: 0,
            isRTL: false,
            showMonthAfterYear: true,
            yearSuffix: ''

        }
    },
    whois: "8.1.1"
};

$.datepicker.regional['ko'] = {
    closeText: '닫기',
    prevText: '이전',
    nextText: '다음',
    currentText: '오늘',
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    weekHeader: 'Wk',
    dateFormat: 'yy-mm-dd',
    firstDay: 0,
    isRTL: false,
    showMonthAfterYear: true,
    yearSuffix: '',
    changeMonth: true,
    changeYear: true
};

$.datepicker.setDefaults($.datepicker.regional['ko']);

//금방 사용한 액션 내용 셋팅 (화면 이동/ 버튼 클릭)
function setPrevActGbn(currMenuId, currStepMenu, actionName) {
    //undefined일때는 셋팅을 하지 않는다. 
    //"" 공백이 들어오면 공백으로 셋팅을 한다.
    if (undefined != currMenuId) {
		_M.PrevActGbn.prevMenuId = _M.PrevActGbn.currMenuId;
        _M.PrevActGbn.currMenuId = currMenuId;
    }
    if (undefined != currStepMenu) {
        _M.PrevActGbn.currStepMenu = currStepMenu;
    }
    if (undefined != actionName) {
        _M.PrevActGbn.actionName = actionName;
    }
}

// 숫자앞에 문자열을 0 문자로 채우
function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}

String.prototype.trim = function () {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function set_Comma(str) {
    var retValue = 0;
    try {
        str = parseFloat(str);
        if (isNaN(str)) return 0;
        str = "" + str + "";
        var retValue = "";
        for (i = 0; i < str.length; i++) {
            if (i > 0 && (i % 3) == 0) {
                retValue = str.charAt(str.length - i - 1) + "," + retValue;
            } else {
                retValue = str.charAt(str.length - i - 1) + retValue;
            }
        }
    }
    catch (er) {
        return 0;
    }
    return retValue;
};

// funTest
(function ($) {
    $.fn.funTest = function (options) {
        //  alert(this.attr("id")+" - funTest");
    };
    $.fn.setComma = function (str) {
        if ($(this).length == 0) return $(this); ;
        str = $(this).val().replace(/,/gi, '');

        var arr = str.split(".");
        var prenum = arr[0].replace(/-/gi, '');

        if (arr.length > 1 && (undefined == prenum || "" == prenum)) prenum = 0;

        var retValue = 0;
        try {
            prenum = parseFloat(prenum);
            if (isNaN(prenum)) return 0;
            prenum = "" + prenum + "";
            var retValue = "";
            for (i = 0; i < prenum.length; i++) {
                if (i > 0 && (i % 3) == 0) {
                    retValue = prenum.charAt(prenum.length - i - 1) + "," + retValue;
                } else {
                    retValue = prenum.charAt(prenum.length - i - 1) + retValue;
                }
            }

            if (arr.length > 1) {
                retValue = retValue + ".";
                if (arr[1]) {
                    retValue += arr[1];
                } else {
                    retValue += '';
                }
            }
            if (str < 0) {
                retValue = "-" + retValue;
            }

            if (retValue == '0.0') {
                retValue = 0;
            }

        }
        catch (er) {
            $(this).val(0)
            return $(this);
        }

        $(this).val(retValue)

        return $(this);
    };
    $.fn.SetDateFormat = function () {
        retValue = $(this).val();
        if (retValue.length == 8) {
            retValue = retValue.substr(0, 4) + "-" + retValue.substr(4, 2) + "-" + retValue.substr(6, 2);
        }
        $(this).val(retValue)

        return $(this);
    };
})(jQuery);
// prettynumber
(function ($) {
    $.fn.prettynumber = function (options) {
        var opts = $.extend({}, $.fn.prettynumber.defaults, options);
        return this.each(function () {
            $this = $(this);
            var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
            var str = $this.val();
            $this.val($this.val().toString().replace(new RegExp("(^\\d{" + ($this.val().toString().length % 3 || -1) + "})(?=\\d{3})"), "$1" + o.delimiter).replace(/(\d{3})(?=\d)/g, "$1" + o.delimiter));
        });
    };
    $.fn.prettynumber.defaults = {
        delimiter: '-'
    };
})(jQuery);