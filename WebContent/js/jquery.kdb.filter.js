/* jQuery monarch fiter component: 
* version 1.0 2013-09-23
* Authors: Kim Jungwon
* Company : Kongyoung DB
*/

(function ($) {

    var serialNo = 0;
    var operators = {
        text: [
		{ label: "이다", value: "=" },
		{ label: "아니다", value: "!" },
		{ label: "포함되는 키워드", value: "~" },
		{ label: "포함하지 않는 키워드", value: "!~" },
        { label: "없음", value: "!*" },
		{ label: "모두", value: "*" }
	],
        select: [
		{ label: "이다", value: "=" },
		{ label: "아니다", value: "!" }
	],
        date: [
		{ label: "이다", value: "=" },
		{ label: ">=", value: ">=" },
        { label: "<=", value: "<=" },
        { label: "사이", value: "><" },
        // { label: "이전", value: ">t-" },
        // { label: "이후", value: "<t-" },
        // { label: "지난", value: "><t-" },
        // { label: "일전", value: "t-" },
        {label: "오늘", value: "t" },
        { label: "어제", value: "ld" },
        { label: "이번주", value: "w" },
        { label: "지난주", value: "lw" },
        { label: "최근2주", value: "l2w" },
        { label: "이번달", value: "m" },
        { label: "지난달", value: "lm" },
        { label: "다음달", value: "nm" },
        { label: "올해", value: "y" },
        { label: "없음", value: "!*" },
        { label: "모두", value: "*" }
	],
        number: [
		{ label: "이다", value: "=" },
        { label: ">=", value: ">=" },
        { label: "<=", value: "<=" },
        { label: "사이", value: "><" },
        { label: "없음", value: "!*" },
		{ label: "모두", value: "*" }
	],
        boolean: [
		{ label: "예", value: "1" },
		{ label: "아니오", value: "0" }
	],
        user: [
		{ label: "나", value: "me" },
		{ label: "이다", value: "=" },
		{ label: "아니다", value: "!" },
        { label: "없음", value: "!*" },
		{ label: "모두", value: "*" }
	],
       dept: [
		{ label: "내부서", value: "md" },
		{ label: "이다", value: "=" },
		{ label: "아니다", value: "!" },
        { label: "없음", value: "!*" },
		{ label: "모두", value: "*" }
	],
     defaults: [
		{ label: "이다", value: "=" },
		{ label: "아니다", value: "!" },
        { label: "없음", value: "!*" },
		{ label: "모두", value: "*" }
     ]
    };


    $.fn.superExtFilter = function (options) {
        //플러그인 처리


        // method calling
        if (typeof options == 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            var res;
            this.each(function () {
                var extFilter = $.data(this, 'superExtFilter');
                if (extFilter && $.isFunction(extFilter[options])) {
                    var r = extFilter[options].apply(extFilter, args);
                    if (res === undefined) {
                        res = r;
                    }
                    if (options == 'destroy') {
                        $.removeData(this, 'superExtFilter');
                    }					
                }
            });
            if (res !== undefined) {
                return res;
            }
            return this;
        }


        superExtFilter = this;

        //디폴트 값을 구축
        var defaults = {
			'exec': 'init', //init:초기화 getCurrentColsInfo:슈퍼테이블의 컬럼목록만 취득함
            'filters': [], //구조체 필터 목록
            'presets': []  //사용자정의 프리셋목록
        };
        var setting = $.extend(defaults, options);
		
		if(options.exec == 'getCurrentColsInfo'){
			var colsInfo = getParameters($(this), 'label');
			return colsInfo;
		}
		
        initialize(superExtFilter, setting); //초기화



        /* 파라메터로 보낼 값 취득 */
        superExtFilter.getParameters = function (type) {

            var rst = "";
            //필터 혹은 테이블 컬럼목록의 값을 취득
            rst = getParameters($(this), type);
            return rst;
        }

        /* 파라메터 디폴트 호출함수 */
        superExtFilter.selectDefaultPreset = function () {
            selectDefaultPreset($(this));
        }

        return (this);
    };




    /* 초기화 처리 */function initialize(obj, opts) {
        buildSkeleton(obj, opts); //테이블레이아웃 생성 
        displayButtons(obj); //버튼 초기 표시
        obj.data('superExtFilter', superExtFilter);
        //selectDefaultPreset(obj); //슈퍼테이블이 최초 표시될때 문제가 있으므로 외부에서 필요한 타이밍에 처리하도록 변경
    }


    /* 확장필터영역(table) 생성  */
    function buildSkeleton(obj, opts) {
        //대상 div에 확장필터영역 기본 테이블을 생성한다.

        var tblTag = $('<table class="SuperExtFilter"></table>');
        var headerTrTag = $('<tr class="SuperFilter-bg"></tr>'); //revised line
        //var headerTabTag = $('<tr class="SuperFilter-bg"><td></td></tr>'); //revised line
        var headerTdTag = $('<td id="presetTr" class="jobArea" style="height:30px;"><span class="SuperExtFilter_Title align-middle">확장 필터</span></td>');
        headerTdTag = headerTdTag.append(makePresetSelectBox(obj)); //프리셋선택셀렉트박스 생성
        headerTdTag = headerTdTag.append(makeButtons(obj)); //프리셋관련 버튼 생성
        headerTdTag = headerTdTag.append(makeFilterSelectBox(obj, opts.filters)); //확장필터항목셀렉트박스 생성
        headerTrTag = headerTrTag.append(headerTdTag);
        tblTag = tblTag.append(headerTrTag);
        obj.append(tblTag);
    }

    /*필드목록 다음에 저장/삭제/수정 버턴을 생성하는 메소드*/
    function makeButtons(obj) {

        var btnsTag = '<input id="presetSaveBtn" type="button" value="프리셋저장" class="align-middle b-all b-co b-co-basic SuperFlow-ft" alt="현재 검색조건을 새프리셋으로 저장합니다." />';
        btnsTag += '<input id="presetUpdBtn" type="button" value="프리셋수정" class="align-middle b-all b-co b-co-basic SuperFlow-ft"  alt="선택되어 있는 프리셋을 현재 검색조건으로 변경합니다." />';
        btnsTag += '<input id="presetDelBtn" type="button" value="프리셋삭제" class="align-middle b-all b-co b-co-basic SuperFlow-ft"  alt="선택되어 있는 프리셋을 삭제합니다." />';
        btnsTag += '<input id="presetSetColsBtn" type="button" value="표시항목설정" class="align-middle b-all b-co b-co-basic SuperFlow-ft"  alt="목록에 표시할 항목을 설정합니다." />';
        btnsTag = $(btnsTag);
        btnsTag.click(function (e) {
            var btnId = $(this).attr('id');
            switch (btnId) {
                case "presetSaveBtn":
                    savePreset('C', obj);
                    break;
                case "presetUpdBtn":
                    savePreset('U', obj);
                    break;
                case "presetDelBtn":
                    deletePreset(obj);
                    break;
                case "presetSetColsBtn":
                    setDisplayColumns(obj, function (dspOptList) {
                        // 슈퍼테이블 목록에 해당 항목을 적용하기
                        var spTbl = obj.parent();
                        displayColumns(spTbl, dspOptList);

                    });
                    break;

            }
        });
        return btnsTag;
    }

    /* 프리셋상태에 따른 버튼 표시제어 메소드 */
    function displayButtons(obj) {

        var val = obj.find('#presetSelectBox').val();
        //TODO OWNER여부 확인
        var owner = obj.find('#presetSelectBox option:selected').attr('owner');

        if ('default' == val) {
            //default면 저장..
            obj.find("#presetSaveBtn").show();
            obj.find("#presetUpdBtn").hide();
            obj.find("#presetDelBtn").hide();
        } else {
            //디폴트 이외일경우에는 프리셋수정
            obj.find("#presetSaveBtn").hide();
            if (_M.UserInfo.id == owner) { //프리셋이 소유자일때만 삭제 및 수정 가능
                obj.find("#presetUpdBtn").show();
                obj.find("#presetDelBtn").show();
            } else {
                obj.find("#presetUpdBtn").hide();
                obj.find("#presetDelBtn").hide();
            }

        }


    }

    /* 필트목록 셀렉트 박스를 생성하는 메소드 */
    function makeFilterSelectBox(obj, filters) {
        var rstTag = $('<select id="filterSelectBox" class="input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle"></select>'); //revised line
        var optionTag = '<option>컬럼 선택</option>';  //공백항목
        rstTag.append(optionTag);

        $.each(filters, function (idx, filter) {
            optionTag = $('<option value="' + filter.field + '">' + filter.label + '</option>')
            optionTag.data('filterInfo', filter);
            rstTag.append(optionTag);
        });

        rstTag.change(function (e) {
            var selObj = $(this);
            var selectedOpt = selObj.children("option:selected");
            //1. 해당 검색 필터를 표시
            var filter = selectedOpt.data('filterInfo');
            addFilter(selObj.parents('.SuperExtFilter'), filter); // 선택된 필터를 추가한다.
            //2. 선택한 항목은 disabled로 처리하여 선택되지 않도록 한다.
            selectedOpt.attr('disabled', true);
            //3. 필터선택목록은 최초 공백으로 이동한다
            selObj.val('');
        });
        return rstTag;
    }

    /* 사용자 프리셋 셀렉트 박스를 생성하는 메소드 */
    function makePresetSelectBox(obj) {
        var presets = getPresetList(obj); //프리셋 목록 취득
        obj.find('#presetSelectBox').remove();
        var rstTag = $('<select id="presetSelectBox" class="input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle"></select>'); //revised line
        var optionTag = '<option value="default">새로 등록</option><option value="default" disabled >[ 마이프리셋 목록 ]</option>';  //공백항목
        rstTag.append(optionTag);
        var shareOptFlg = false;
        $.each(presets, function (idx, preset) {

            if (preset.PRESET_SHARE_FLG == '1' && shareOptFlg == false) {
                //프리셋이 공유셋일경우
                optionTag = '<option value="default" disabled >[ 공유프리셋 목록 ]</option>';  //공유프리셋
                rstTag.append(optionTag);
                shareOptFlg = true;
            }
            optionTag = $('<option defaultFlg="' + preset.DEFAULT_FLG + '", owner="' + preset.REG_USER + '", value="' + preset.M_PRESETS_NO + '">' + preset.PRESET_NAME + '</option>');

            rstTag.append(optionTag);


        });


        //프리셋 선택시에 해당 프리셋 정보를 취득하여 확장필드를 새로 그린다.
        rstTag.change(function (e) {
            var selObj = $(this);
            displayButtons(obj); //버튼제어
            if ("default" == selObj.val()) return false; //디폴트이면 아무처리를 하지 않는다.

            var filterAreaTbl = selObj.parents('.SuperExtFilter');
            var selectedOpt = selObj.children("option:selected");

            //1. 선택된 프리셋 정보를 취득한다. 
            var presetNo = selObj.val();  //선택된 프리셋번호
            updateDefaultPreset(obj, presetNo); // 프리셋 디폴트 저장 처리
            var presetInfo = getPresetList(obj, presetNo);

            //2. 확장검색필터Select박스의 모든 disabled를 해제함.
            filterAreaTbl.find('#filterSelectBox>option').attr('disabled', false);
            //3. 확장 필터 영역을 클리어
            filterAreaTbl.find('tr:gt(0)').remove();
            //4. 프리셋 정보에 포함되어 있는 프리셋 정보를 취득하여 확장필터영역을 다시 그린다.
            if (presetInfo.length > 0) {
                var filters = '';
                var cols = '';
                if (undefined != presetInfo[0].FILTERS && "" != presetInfo[0].FILTERS) {
                    filters = eval('(' + presetInfo[0].FILTERS + ')');
                    filters = filters.extFilters;
                }

                $.each(filters, function (idx, filter) {
                    //필터추가
                    addFilter(obj.find('.SuperExtFilter'), filter);
                    //표시 필터 비활성화 
                    var tOpt = obj.find('#filterSelectBox').find('option[value="' + filter.field + '"]');
                    tOpt.attr('disabled', true);

                });

                if (undefined != presetInfo[0].COLMS && "" != presetInfo[0].COLMS) {
                    cols = eval('(' + presetInfo[0].COLMS + ')');
                    cols = cols.dispCols;
                    displayColumns(obj.parent(), cols);
                } else {
                    (obj.parent()).superContaner('List');
                }

            }

        });
        return rstTag;
    }

    /* 사용자정의된 검색정보 프리셋목록을 취득한다. */
    function getPresetList(obj, selKey) {
        //selKey가 존재할경우에는한건의 데이터를 취득한다.
        // 검색조건: 회원사번호, 사용자번호, 사용구조체명
        // 취득정보: 프리셋명(라벨), (옵션벨류), 프리셋정보(filter정보)
        var struName = obj.parent().attr('jsonname');
        var pl = new JSONClientParameters();
        pl.add('service', 'MON_COMMON');
        pl.add('STRUCTURE_NAME', struName);
        pl.add('CONFIG_NAME', struName+'_DEFAULT_PRESET');
        if (undefined != selKey) {
            pl.add('method', 'PRESETS_READ');
            pl.add('M_PRESETS_NO', selKey);
        } else {
            pl.add('method', 'PRESETS_LIST');
        }
        var rstData;

        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            rstData = data.resultData;

        }, function (response) {
            console.log('프리셋취득 실패');
            return null;
        }, _M.aSync.sync);

        return rstData;
    }

    /* 디폴트 프리셋 갱신 처리 */
    function updateDefaultPreset(obj, selKey) {
        //선택한 프리셋을 디폴트로 저장함
        // 검색조건: 회원사번호, 사용자번호, 사용구조체명
        var struName = obj.parent().attr('jsonname');
        var pl = new JSONClientParameters();
        var config_name = struName + "_DEFAULT_PRESET";
        pl.add('service', 'MON_COMMON');
        pl.add('method', 'CONFIG_UPDATE');
        pl.add("CONFIG_NAME", config_name);
        pl.add("CONFIG_VALUE", selKey);

        var rstData;
        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            rstData = data.resultData;

        }, function (response) {
            console.log('프리셋 디폴트 저장처리 실패');
        }, _M.aSync.sync);
    }

    /* 확장 필터 생성 메소드(filter추가메소드를  복수건 호출 ) */
    function makeFilters(obj, opts) {

        $.each(opts.filters, function (idx, filter) {
            addFilter(obj, filter);
        });

    }

    /* 확장필터를 추가하는 메소드 */
    function addFilter(obj, filter) {
        //확장필터 추가
        var label;
        var type;
        var field;

        label = filter.label;
        type = filter.type;
        field = filter.field;

        var trTag = $('<tr class="extFilterTr"></tr>');
        trTag.attr('field', field);
        trTag.attr('label', label);
        trTag.attr('type', type);
        trTag.attr('operator', '');
        trTag.attr('value', '');

        var tdTags;
        switch (type) {
            case 'text':
                tdTags = makeTextFilter(filter);
                break;
            case 'select':
                trTag.attr('codes', filter.codes);
                tdTags = makeSelectFilter(filter);
                break;
            case 'date':
                tdTags = makeDateFilter(filter);
                break;
            case 'number':
                tdTags = makeNumberFilter(filter);
                break;
            case 'boolean':
                tdTags = makeBooleanFilter(filter);
                break;
            case 'user':
                //linkefilter타입과 동일하게 사용하되 user인경우 operator목록만 상이함.
                filter.linkJson = "MON_COM_사용자POPUP_TBL";
                tdTags = makeLinkFilter(filter,trTag);
                break;
            case 'dept':
                filter.linkJson = "MON_COM_부서POPUP_TBL";
                tdTags = makeLinkFilter(filter,trTag);
                break;
            case 'linkkey':
                tdTags = makeLinkFilter(filter,trTag);
                break;
            default:
                alert('존재하지 않는  확장필터 타입이 존재합니다.');
                break;
        }

        trTag.append(tdTags);

        $('.operator', trTag).change(function (e) {
            //operator가 변경되었을때 처리
            operatorHandler(trTag, $(this));
        });


        $('.value01, .value02', trTag).keydown(function (e) {
            var cd = e.which;
            var st = String.fromCharCode(e.which);
            
            if (type == "number" && 
                cd!=8 && cd!=9 && cd!=45 && cd!=46 && cd!=36 && cd!=37 && cd!=39 && !(cd>=96 && cd <=105) &&
                "0123456789\b\r\t".indexOf(st, 0) < 0) {
                //number 타입일때에는 숫자만 입력하게 처리               
                $(this).val( $(this).val().replace(/[^0-9]/g,''));
                return false;
            }else if (type == "date" && 
                cd!=8 && cd!=9 && cd!=45 && cd!=46 && cd!=36 && cd!=37 && cd!=39 &&  cd!=189 && !(cd>=96 && cd <=105) && cd!=109 &&
                "0123456789-\b\r\t".indexOf(st, 0) < 0) {
                //date 타입일때에는 숫자만 입력하게 처리               
                $(this).val( $(this).val().replace(/[^0-9|^-]/g,''));
                return false;
            } else {
                return true;
            }
        });

        $('.value01, .value02', trTag).blur(function (e) {
          
           var valObj = $(this);

           if (type == "date") {
                //date 타입일때에는 숫자만 입력하게 처리               
                validExtFilter.date(valObj);
                return false;
            } else {
                return true;
            }
        });

        $('.value01, .value02', trTag).keyup(function (e) {         
            trTag.attr('value', (getFilterValue($(this).parents('tr'))));
        });

        $('.value01, .value02', trTag).change(function (e) {
            trTag.attr('value', (getFilterValue($(this).parents('tr'))));
        });

        //필터를 그린후에 해당 필터의 operator와 values를 셋팅하기위해 이벤트 강제 발생.
        $('.operator', trTag).trigger('change');
        $('.value01', trTag).trigger('change');
        if (type == "number") {
            $('.value02', trTag).trigger('change');
        }

        obj.append(trTag);
    }

    /* operator의 액션을 제어하는 함수 */
    function operatorHandler(trTag, operator) {
        // operator가 선택되었을때 처리
        var opVal = operator.val();
        trTag.attr('operator', operator.val());
        var type = trTag.attr('type');


        if (opVal == '*' || opVal == '!*'
            || opVal == 't' || opVal == 'ld' || opVal == 'w' || opVal == 'lw'
            || opVal == 'l2w' || opVal == 'm' || opVal == 'lm' || opVal == 'nm' || opVal == 'y' || opVal == 'me'|| opVal == 'md') {
            //모두일때에는 해당 values의 값을 클리어한다.
            $('span', trTag).find('.operatorPart').nextAll().hide(); //revised
            if (type == 'number') {
                $('.value02', trTag).val('').trigger('change');
            } else if (type == 'date') {
                $('.value01, .value02, .value03', trTag).val('').trigger('change');
            } else if (type == 'user' || type == 'dept') {
                
            } else {
                $('.value01', trTag).val('').trigger('change');
            }


        } else if (type == 'number') {
            if (opVal == '><') {
                $('.value01, .value02', trTag).show();
                $('.value01, .value02', trTag).trigger('change'); //비표시 인풋데이터 초기화
            } else {
                $('.value01', trTag).show();
                $('.value02', trTag).hide();
                $('.value02', trTag).val('').trigger('change'); //비표시 인풋데이터 초기화
            }

        } else if (type == 'date') {
            if (opVal == '><') { //사이 일때
                $('.value01, .value02', trTag).show();
                $('.value03', trTag).hide();
                $('.value01, .value02', trTag).trigger('change'); //비표시 인풋데이터 초기화
            } else if (opVal == '><t-' || opVal == 't-') { //지난 or 일전 일때
                $('.value01, .value02', trTag).hide();
                $('.value03', trTag).show();
                $('.value01, .value03', trTag).trigger('change'); //비표시 인풋데이터 초기화
            } else {
                $('.value01', trTag).show();
                $('.value02, .value03', trTag).hide();
                $('.value02, .value03', trTag).val('').trigger('change'); //비표시 인풋데이터 초기화
            }

        } else {
            $('span', trTag).find('.operatorPart').next().show();
          
        }

    }

    /* text 타입의 확장필터 생성 메소드 */
    function makeTextFilter(filter) {
        var rstTag = makeCommTag(filter);
        var spanTag = $('<span></span>');
        var operatorTag = makeOperatorTag(filter);
        var valTag = $('<input class="value01 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text" style="width:150px" />'); //revised line
        valTag.val(filter.values);
        spanTag = spanTag.append(operatorTag).append(valTag);
        rstTag = rstTag.append(spanTag);
        return rstTag;
    }

    /* number 타입의 확장필터 생성 메소드 */
    function makeNumberFilter(filter) {
        var rstTag = makeCommTag(filter);
        var spanTag = $('<span></span>');
        var operatorTag = makeOperatorTag(filter);
        var valTag1 = $('<input class="value01 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text" style="width:80px; margin-right:6px" />'); //revised line
        var valTag2 = $('<input class="value02 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text"  style="width:80px" />'); //revised line
       // valTag1.css(getVendorPrefix() +'ime-mode' , 'disabled'); //영숫자만 입력가능하도록 함.
       // valTag1.css('ime-mode' , 'disabled'); //영숫자만 입력가능하도록 함.
       // valTag2.css('ime-mode' , 'disabled');

        if (undefined != filter.values) {
            var arrVal = filter.values.split(',');
            if (arrVal.length > 1) {
                valTag1.val(arrVal[0]);
                valTag2.val(arrVal[1]);
            } else {
                valTag1.val(filter.values);
            }
        }
        spanTag = spanTag.append(operatorTag).append(valTag1).append(valTag2);
        rstTag = rstTag.append(spanTag);
        return rstTag;
    }

    /* date 타입의 확장필터 생성 메소드 */
    function makeDateFilter(filter) {
        var rstTag = makeCommTag(filter);
        var spanTag = $('<span></span>');
        var operatorTag = makeOperatorTag(filter);
      
        var valTag1 = $('<input class="value01 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text" style="width:80px;" maxlength=10 />'); //revised line
        var valTag2 = $('<input class="value02 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text"  style="width:80px;margin-left:6px;" maxlength=10 />'); //revised line
        var valTag3 = $('<input class="value03 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text"  style="width:80px;" maxlength=10 /> '); //revised line

        valTag1.datepicker();
        valTag2.datepicker();
        if (undefined != filter.values) {
            var arrVal = filter.values.split(',');
            if (arrVal.length > 1) {
                valTag1.val(arrVal[0]);
                valTag2.val(arrVal[1]);
            } else {
                valTag1.val(filter.values);
            }
        }

        spanTag = spanTag.append(operatorTag).append(valTag1).append(valTag2).append(valTag3);
        rstTag = rstTag.append(spanTag);
        return rstTag;
    }

    /* Select 타입의 확장필터 생성 메소드 */
    function makeSelectFilter(filter) {
        var rstTag = makeCommTag(filter);
        var spanTag = $('<span></span>');
        var operatorTag = makeOperatorTag(filter);
        var valTag = $('<select class="value01 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" ></select>'); //revised line
        //멀티처리에 대한 초기처리        
        if ('1' == filter.multiple) {
            valTag.attr('multiple', true).attr('size', '3');
        } else {

            valTag.attr('multiple', false).attr('size', '1');
        }

        var multiBtn = $('<span class="multiSelectBtn icon i-20 icon-stretch align-middle" value ="m"></span>'); //revised line

        multiBtn.click(function (e) { //멀티 버튼 클릭시 셀렉트 박스가 멀티모드로 변경(토글)된다.
            var multipleFlag = valTag.attr('multiple');
            if (!multipleFlag) {

                valTag.attr('multiple', true).attr('size', '3');
                multiBtn.removeClass('icon-stretch').addClass('icon-shrink'); //revised line
            } else {
                valTag.attr('multiple', false).attr('size', '1');
                multiBtn.removeClass('icon-shrink').addClass('icon-stretch'); //revised line
            }
        });

        var options = '';
        //codes정보를 이용하여 셀렉트정보를  취득한다.
        $.SvcGetCode(filter.codes, function (data) {
            $.each(data.resultData, function (index, row) {
                options += '<option value="' + row.CODE + '">' + row.DECODE + '</option>';
            });
        }, _M.aSync.sync);

        valTag = valTag.append(options);
        //멀티플인경우 데이터를 배열로 셋팅할 필요가 있음.
        var values = filter.values;
        if (undefined != values) values = values.split(',');
        valTag.val(values);

        spanTag = spanTag.append(operatorTag).append(valTag).append(multiBtn);
        rstTag = rstTag.append(spanTag);
        return rstTag;

    }

    /* Boolean 타입(예/아니오)의 확장필터 생성 메소드 */
    function makeBooleanFilter(filter) {
        var rstTag = makeCommTag(filter);
        var spanTag = $('<span></span>');
        var operatorTag = makeOperatorTag(filter); //boolean에는 오퍼레이터를체크/미체크로 처리
        //values와 오퍼레이터 동일사용.
        spanTag = spanTag.append(operatorTag); //.append(valTag);
        rstTag = rstTag.append(spanTag);
        return rstTag;
    }

    /* linkkey, user, dept 타입의 확장필터 생성 메소드 */
    function makeLinkFilter(filter, trTag) {

        var rstTag = makeCommTag(filter);
        var spanTag = $('<span></span>');
        var operatorTag = makeOperatorTag(filter);
        var linkKeyTag = $('<span class="valuePart"></span>');

        var linkJson = filter.linkJson;

        //var filterIcon = filter.icon; //todo 차후 추가
        linkKeyTag.attr('linkJson', linkJson);

        
        //버튼을 클릭하면 해당 팝업 표시.    
        linkKeyTag.click(function(e) {
            var valuePart = $(this);
            $.ShowPopUpTableJson(linkJson ,  valuePart, function(key, display, trobj, valuePart) {
                if (key != undefined) {
                    //value값 셋팅
                    valuePart.find('input').val(display);
                    valuePart.parents('tr').attr('value', key);
                }
                
            });
        });
        linkKeyTag.append('<input class="value01 input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="text" style="width:150px" readonly /><span class="icon i-20 icon-search align-middle"></span>');
        

        //todo value값을 설정하는 처리 추가
        //valTag.val(filter.values);
        if(undefined != filter.linkDispVal){
            linkKeyTag.find('input').val(filter.linkDispVal);
        }

        if(undefined != filter.values){
            trTag.attr('value', filter.values);
        }


        

        spanTag = spanTag.append(operatorTag).append(linkKeyTag);
        rstTag = rstTag.append(spanTag);
        return rstTag;
    }

    /* 확장필터 공통 preTag 생성 메소드 */
    function makeCommTag(filter) {
        var rstTag = $('<td></td>');
        var chkTag = makeChkTag(filter);
        rstTag = rstTag.append(chkTag);
        return rstTag;
    }

    /* 확장필터 선두의 checkbox생성 메소드 */
    function makeChkTag(filter) {
        var chkId = "filterChk" + serialNo++;
        var rstTag = $('<span class="chkPart"><input id="' + chkId + '" class="extFilterCheck input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" type="checkbox" checked="checked" /></span><span class="labelPart"><label for="' + chkId + '">' + filter.label + '</label></span>'); //revised line
        rstTag.click(function (e) {
            //체크박스 체크/해제 시의 처리
            var obj = $(this).find('input');
            if (obj.is(":checked")) {
                obj.attr("checked", true);
                obj.parent().parent().find('.labelPart').next().show();
            } else {
                obj.attr("checked", false);
                obj.parent().parent().find('.labelPart').next().hide();
            }
        });
        return rstTag;
    }

    /* OperationTag를 생성하는 메소드 */
    function makeOperatorTag(filter) {

        var operatorTag = '';
        var operator = filter.operator;
        operatorTag = $('<span class="operatorPart"><select class="operator input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle">' + getOperatorList(filter.type) + '</select></span>'); //revised line
        operatorTag.find('select').val(operator);
        return operatorTag;
    }

    /* OperationList를 취득하는 메소드 */
    function getOperatorList(type) {
        var opList = "";
        var _type = type;
        if(_type == 'linkkey'){
            _type = 'defaults';
        }
        $.each(operators[_type], function (idx, opts) {
            opList += '<option value="' + opts.value + '">' + opts.label + '</option>';
        });
        return opList;
    }

    function getFilterValue(filterTr) {
        var rstVal = "";
        var type = filterTr.attr('type');

        switch (type) {
            case 'text':
                rstVal = $('.value01', filterTr).val();
                break;
            case 'select':
                rstVal = $('.value01', filterTr).val();
                break;
            case 'boolean':
                //필요없음. operator만 가지고 처리함.
                break;
            case 'number':
                rstVal = $('.value01', filterTr).val();
                if ('><' == filterTr.attr('operator')) {
                    rstVal += ',' + $('.value02', filterTr).val();
                }
                break;
            case 'date':
                rstVal = $('.value01', filterTr).val();
                if ('><' == filterTr.attr('operator')) {
                    rstVal += ',' + $('.value02', filterTr).val();
                }
                break;
            case 'linkkey':
                rstVal = filterTr.attr('value');
                break;
            case 'user':
                rstVal = filterTr.attr('value');
                break;
            case 'dept':
                rstVal = filterTr.attr('value');
                break;
        }


        return rstVal;
    }

    /* extFilter로 request 파라메터값을 취득하는 메소드 */
    /* format: ["object": 객체화시켜리턴(eval로 감싸기)/ [미설정 or "string" : 변형없이 그대로 반환(문자열형태)]] */
    function getParameters(obj, type, format) {
        var rstParams;
        var keyword;
        if (type == 'filter') { //filter파라메터 취득
            rstParams = getExtFilterParam(obj);
            keyword = 'extfilters';
        } else if (type == 'column' || type == 'dispOpts' || type == 'label') { //컬럼파라메터 취득
            rstParams = getDispColsParam(obj, type);
            keyword = 'dispCols';
        }


        if ('object' == format) {
            rstParams = eval('(' + rstParams + ')');
            rstParams = rstParams[keyword];
        }

        return rstParams;

    }

    /* 필터파라메터 취득 메소드 */
    function getExtFilterParam(extFilterObj) {
        var header = '{"extFilters" :[';
        var params = '';
        var footer = ']}';
        var rst = '';

        //현제 체크된 검색필터 정보만 취득.
        var datas = $('.SuperExtFilter', extFilterObj).find('.extFilterCheck');
        var cnt = 0;
        $.each(datas, function () {
            //체크되어있는지 확인
            var flt = $(this);

            if ('checked' == flt.attr('checked')) {
                var trObj = flt.parents('.extFilterTr');
                var type = trObj.attr('type'); //타입에 따라서 벨류셋팅을 처리함.
                var label = trObj.attr('label'); //라벨
                var field = trObj.attr('field'); //필드명
                var operator = trObj.attr('operator'); //오퍼레이터
                var values = trObj.attr('value'); //벨류
                if (cnt > 0) params += ',';
                params += '{';
                params += 'field:"' + field + '" ,';
                params += 'type:"' + type + '" ,';
                params += 'label:"' + label + '" ,';
                params += 'operator:"' + operator + '" ,';
                //이사이에는 공통적 요소 이외의 타입일 경우의 타입을 지정한다.
                if (type == 'select') { //타입이 select일때 속성 셋팅
                    params += 'codes:"' + trObj.attr('codes') + '" ,';
                    if ('multiple' == trObj.find('.value01').attr('multiple')) {
                        params += 'multiple:"1" ,';
                    }
                }else if(type == 'linkkey' || type == 'user'|| type == 'dept'){
                    var valuePart = trObj.find('.valuePart');
                    params += 'linkJson: "' + valuePart.attr('linkJson') +'",';
                    params += 'linkDispVal: "' + valuePart.find('input').val() +'",';
                   // params += ',icon: ' + valuePart.attr('icon');

                }
                params += 'values:"' + values + '"';
                params += '}';
                cnt++;
            }
        });

        if (params.length > 0) {
            rst = header + params + footer;

        }
        return rst;

    }

    /* 컬럼목록파라메터 취득 메소드 */
    function getDispColsParam(obj, type) {
        var header = '{"dispCols" :[';
        var params = '';
        var footer = ']}';
        var rst = '';

        if (type == 'column') { //테이블목록 기준으로 취득
            //현제 표시되고 있는목록 컬럼정보 취득
            //ex) {dispColumns:[{field:'M_USITE_NO'},{field:'COMP_NAME'},{field:'CUST_NAME'}]}
            var trInfo = obj.parent().data('TRdata');
            var tdList = trInfo.find('td:not(".resizeBar"):gt(1)');

            $.each(tdList, function (idx, td) {
                //td목록 취득    
                var fieldName = $(td).attr('field');
                if (idx < tdList.length - 1) { //마지막 td는 사용하지 않음
                    if (idx > 0) {
                        params += ',';
                    }
                    params += '{ field: "' + fieldName + '" }';
                }
            });
        } else if (type == 'dispOpts') { //셀렉트박스 옵션목록 기준으로 취득
            $.each(obj, function (idx, opt) {
                if (idx > 0) {
                    params += ',';
                }
                params += '{ field: "' + opt.value + '" }';
            });
        } else if (type == 'label') { //superTable의 TH속성에서 label과 field를 취득 20140108
			var thTags = obj.find('.thead').find("th[field]");
			$.each(thTags, function(idx, opt){
				if (idx < thTags.length) { //마지막 td는 사용하지 않음
                    if (idx > 0) {
                        params += ',';
                    }
					var _opts = $(opt);
                    params += '{ colNo: "'+ (idx) +'", label: "'+ _opts.attr('label') +'", field: "' + _opts.attr('field') + '" }';
                }
			});
		}
		
        if (params.length > 0) {
            rst = header + params + footer;

        }
        return rst;

    }

    /* ------------------------------------------------------- */
    /* superExtFilter 확장필터 저장하기                        */
    /* ------------------------------------------------------- */
    function savePreset(crudType, obj) {
        //확장필터 저장 팝업 호출...20130923 khma
        //var superExtFilter = $('.head', $(this)).data('superExtFilter');
        var methodNm = '';


        $.ShowPopUpViewJson('MON_COM_EXTFILTER_PVIW', obj, function (popObj, _Obj) {

            var structureName = obj.parent().attr('jsonname');
            var extParams = getParameters(_Obj, 'filter');
            var dispCols = getParameters(_Obj, 'column');
            var popParams = popObj.superContaner("getValue");

            var _reqFld = popObj.superContaner("isRequired"); //필수체크
            if (_reqFld.toKeyString() != "") {
                alert("필수항목중 [" + _reqFld.toKeyString() + "] 의 입력이 누락되었습니다.");
                return false;
            }


            popParams.add("FILTERS", extParams);
            popParams.add("COLMS", dispCols);
            popParams.add("STRUCTURE_NAME", structureName);
            popParams.add("service", 'MON_COMMON');
            popParams.add("CONFIG_NAME", structureName+'_DEFAULT_PRESET');
            
            if ("C" == crudType) {
                methodNm = "PRESETS_CREATE";
            } else if ("U" == crudType) {
                methodNm = "PRESETS_UPDATE";
                popParams.add("M_PRESETS_NO", _Obj.find('#presetSelectBox').val());
            }
            popParams.add("method", methodNm);



            PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, popParams, function (data) {
                var selectKey = _Obj.find('#presetSelectBox').val();
                var selectTag = makePresetSelectBox(_Obj);
                $('#presetTr .SuperExtFilter_Title', _Obj).after(selectTag); //revised

                if (data.resultInfo.jobType == 'CREATEIDENTITY') {
                    //create일때에는 리턴키를 받아서 해당 프리셋을 선택
                    selectKey = data.resultData[0].rltKey;
                } else if (data.resultInfo.jobType == 'UPDATE') {
                    //update일때에는 현재 선택된 키로 프리셋 선택..
                }
                selectTag.val(selectKey).trigger('change');
                alert('프리셋이 정상적으로 저장되었습니다.');
                //프리셋을 리프레쉬함.


            }, function (response) {
                alert('프리셋 저장에 실패하였습니다.');
            }, _M.aSync.sync);
        });

        if ("U" == crudType) {
            $("#ShowPopUpViewJson_ShowEdit").superContaner("Read", obj.find('#presetSelectBox').val());
        }
    }
    /* 프리셋 삭제 메소드 */
    function deletePreset(obj) {
        delKey = obj.find('#presetSelectBox').val();
        var pl = new JSONClientParameters();
        pl.add('service', 'MON_COMMON');
        if (undefined != delKey || 'default' != delKey) {
            pl.add('method', 'PRESETS_DELETE');
            pl.add('M_PRESETS_NO', delKey);
        } else {
            return false;
        }
        PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
            var selectTag = makePresetSelectBox(obj);
            $('#presetTr .SuperExtFilter_Title', obj).after(selectTag); //revised
            displayButtons(obj); //버튼 초기 표시
            alert('해당 프리셋이 정상적으로 삭제되었습니다.');
        }, function (response) {
            alert('프리셋 삭제를 실패하였습니다.');
            return null;
        }, _M.aSync.sync);

    }
    /* 디폴트 프리셋을 선택하는 메소드 */
    function selectDefaultPreset(obj) {
        var presetOpts = obj.find('#presetSelectBox').find('option');
        var isDefault = false;
        $.each(presetOpts, function (idx, opt) {
            var optObj = $(opt);
            if (undefined != optObj.attr('defaultFlg') && '1' == optObj.attr('defaultFlg')) {
                isDefault = true;
                $('.head').find('#presetSelectBox').val(optObj.val());
                $('.head').find('#presetSelectBox').trigger('change');
            }
        });
        if (!isDefault) {
            obj.parent().superContaner('List');
        }
    }

    /* 표시항목설정을 위한 팝업 메소드 */
    function setDisplayColumns(obj, callback) {

        var _json = obj.parents().data("jsonData");
        //구조체의 cols정의 항목 취득
        var cols = _json.colModel;

        $(document.body).find('.kcontextMenu').remove();
        $(document.body).append("<div class='kcontextMenu setDispColumnPopUp' ></div>");
        _t = $('<div class="filterDiv leftPart"></div>').appendTo($(document.body).find('.kcontextMenu')); //revised line
        _t2 = $('<div class="filterDiv horiBtn"></div>').appendTo($(document.body).find('.kcontextMenu')); //revised line
        _t3 = $('<div class="filterDiv rightPart"></div>').appendTo($(document.body).find('.kcontextMenu')); //revised line
        _t4 = $('<div class="filterDiv vertBtn"></div>').appendTo($(document.body).find('.kcontextMenu')); //revised line
        $('<a>선택 가능한 컬럼.</a>').appendTo(_t); //revised line
        $('<a>선택된 컬럼.</a>').appendTo(_t3); //revised line
        var seObj = $('<select id="orgCols" class="input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" multiple size="20"></select>').appendTo(_t); //revised line

        //선택가능 컬럼 목록 설정
        $.each(cols, function (index, row) {
            seObj.get(0).options[index] = new Option(row.label, row.field);
        });

        var _moveRightBtn = $("<span class='btn-arrow-right icon i-20 icon-pagenext' title='선택된 컬럼으로'></span></br>").appendTo(_t2); //revised line
        var _moveLeftBtn = $("<span class='btn-arrow-left icon i-20 icon-pageprev' title='선택 가능한 컬럼으로'></span>").appendTo(_t2); //revised line

        var seDispObj = $('<select id="dispCols" class="input-bg input-ft b-t b-r b-b b-l b-co b-co-basic align-middle" multiple size="20"></select>').appendTo(_t3); //revised line
        var _sortUpBtn = $("<span class='btn-arrow-up icon i-20 icon-sortasc' title='한 단계 위로'></span></br>").appendTo(_t4); //revised line
        var _sortDownBtn = $("<span class='btn-arrow-down icon i-20 icon-sortdesc' title='한 단계 아래로'></span>").appendTo(_t4); //revised line
        _moveRightBtn.click(function () {//화살표→ 버튼 클릭
            seObj.find("option:selected").each(function (index, value) {
                seDispObj.append($(this).clone());
                $(this).remove();
            });
        });

        _moveLeftBtn.click(function () {//화살표← 버튼 클릭
            seDispObj.find("option:selected").each(function (index, value) {
                seObj.append($(this).clone());
                $(this).remove();
            });
        });
        _sortUpBtn.click(function (e) { //화살표↑ 버튼 클릭
            moveUpElement(seDispObj);
        });
        _sortDownBtn.click(function () {//화살표↓ 버튼 클릭
            moveDownElement(seDispObj);
        });

        var dispCols = getParameters(obj, 'column', 'object'); //현재 표시중인 컬럼목록을 eval로 객체화시켜 취득
        //선택가능 컬럼 목록 설정
        $.each(dispCols, function (idx, col) {
            //todo 취득한 컬럼 수만큼 반복하여 해당 컬럼과 동일한 필드명의 데이터를 셀렉트 하여 dispCols셀렉트박스로 이동시킴
            var test;
            seObj.val(col.field);
            _moveRightBtn.trigger('click');
            //col.field;
        });

        //팝업 호출
        //TODO 팝업에서 적용 클릭시 슈퍼테이블 목록의 재표시메소드 호출
        $(document.body).find('.kcontextMenu').dialog({
            autoOpen: false,
            modal: true,
            width: 450,
            height: 400,
            title: "표시항목설정",
            buttons: {
                "적용": function () {
                    var cols = getParameters($(this).find('#dispCols>option'), 'dispOpts');
                    cols = eval('(' + cols + ')');
                    cols = cols.dispCols;
                    callback(cols, 'dispOpts');
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
        $(document.body).find('.kcontextMenu').dialog("open");

    }

    /* 컬럼설정 위 버튼 클릭시 이벤트 메소드 */
    function moveUpElement(element) {
        var selectbox = element;
        var option_list = element.find('option');
        var first_opt = element.find('option:selected:first');
        for (var i = 0; i < option_list.length; i++) {

            if (i == 0 && first_opt.val() == option_list[i].value) {
                break;
            }
            if (option_list[i].selected && i > 0) {
                $(option_list[i]).prev().before($(option_list[i]));
            }


        }
    }

    /* 컬럼설정 아래 버튼 클릭시 이벤트 메소드 */
    function moveDownElement(element) {
        var selectbox = element;
        var last_opt = element.find('option:selected:last');
        var option_list = element.find('option');

        for (var i = option_list.length - 1; i >= 0; i--) {
            if (i == option_list.length - 1 && last_opt.val() == option_list[i].value) {
                break;
            }
            if (option_list[i].selected) {
                if (i < option_list.length - 1) {
                    $(option_list[i]).next().after($(option_list[i]));
                }
            }
        }
    }


    /* 슈퍼테이블 목록컬럼 표시 */
    function displayColumns(spTbl, dispOptList) {
        spTbl.superContaner('drawSuperTableBody', spTbl, dispOptList);
        spTbl.superContaner('List');
    }

    
    /* 확장필터 validation 처리 */
    var validExtFilter = {
    
        date: function(valObj){
            
            // todo 기본 date 타입 체크
            var thisVal = valObj.val().replace(/-/g, '');
            var fromDate;
            var toDate;
            var year;
            var month;
            var day;

            if(isEmpty(thisVal)){
                return;
            }

            //1.substring하여 date형 타당성 체크
            year = thisVal.substring(0,4);
            month = thisVal.substring(4,6);
            day = thisVal.substring(6,8);
            var dtVal =new Date(year,month-1,day);

            //alert(fromDate +'/' +toDate);
            if(year != dtVal.getFullYear() || (month-1) != dtVal.getMonth() || day != dtVal.getDate()){
                alert('잘못된 날짜이거나 형식이 잘못되었습니다. 다시입력해 주십시요.\n ( 입력형식: yyyymmdd 혹은 yyyy-mm-dd )');
                valObj.val('').trigger('change');   
                return;
            }
            
              valObj.val(year+"-" + month +"-" +day).trigger('change');           
            },
        isRequired: function(thisVal){
        // todo 필수 체크
        }
    }



    /* 날짜형 validation 체크 */
    function validDate(date1, date2){ //element: 해당요소 op: 오퍼레이터 구분
        
        //날짜의 형을 체크 한다. yyyy-mm-dd 인경우와 yyyymmdd인경우만 허용
        alert(date1.subString('0,4'));
        //todo op가 '><'(사이) 이고 element가 value01인경우
        //todo 정상적인 날짜값인지 체크하여 비정상일때는 경고메세지 표시후 해당 value를 클리어 한다.
        //todo 포멧이 yyyymmdd 인경우 yyyy-mm-dd의 형태로 포멧을 변경하여 value에 재설정한다.
    }
})(jQuery);


