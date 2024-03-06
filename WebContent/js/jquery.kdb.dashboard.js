/* jQuery monarch fiter component: 
* version 1.0 2015-02-27
* Authors: Kim Jungwon
* Company : Kongyoung DB
*/

(function ($) {
		const WIDGET_HEIGHT = 130; //디폴트 위젯 높이
		const WIDGET_WIDTH = 150; //디폴트 위젯 높이
       $.fn.monDashboard = function (options) {
        //플러그인 처리


        // method calling
        if (typeof options == 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            var res;
            this.each(function () {
                var monDashboard = $.data(this, 'monDashboard');
                if (monDashboard && $.isFunction(monDashboard[options])) {
                    var r = monDashboard[options].apply(monDashboard, args);
                    if (res === undefined) {
                        res = r;
                    }
                    if (options == 'destroy') {
                        $.removeData(this, 'monDashboard');
                    }					
                }
            });
            if (res !== undefined) {
                return res;
            }
            return this;
        }


        monDashboard = this;

        //디폴트 값을 구축
        var defaults = {
			widget_margins: [4, 4], //위젯간의 마진 
			widget_base_dimensions: [300, WIDGET_HEIGHT], //위젯의 기본사이즈
			max_cols: 6,
			resize: {
				enabled: false
			},
			draggable: {
				handle: 'header'
			}
        };
        
//        var setting = $.extend(defaults, options);
        var setting = $.extend(defaults, options);
		
        
        initialize(monDashboard, setting); //초기화


        monDashboard.redrawWidget = function () {
        
        	redrawWidget(monDashboard);
                    
        }  ;
		
		/*widgetId 는 monSCript명과 동일 */
		monDashboard.makeWidgetContent = function (widgetId) {
			var contDiv = getContentDiv(widgetId);
        	makeWidgetContent(contDiv, widgetId, true) ;
        }  ;
        
        
        
        
        

        /* 파라메터로 보낼 값 취득 */
//        monDashBoard.getParameters = function (type) {
//
//            var rst = "";
//            //필터 혹은 테이블 컬럼목록의 값을 취득
//            rst = getParameters($(this), type);
//            return rst;
//        }

//        /* 파라메터 디폴트 호출함수 */
//        superExtFilter.selectDefaultPreset = function () {
//            selectDefaultPreset($(this));
//        }

        return (this);
    };




    /* 초기화 처리 */
    function initialize(obj, opts) {
    	
    	clearAllChartObject(); //챠트관련 객체를 모드 클리어
    	buildSkeleton(obj, opts); //기본 대쉬보드 타입을 생성한다.
    	//TODO BODY 컨텐츠 생성
    	//TODO 기본 레이아웃 태그 생성
    	//TODO 상기 레이아웃 기반으로 위젯처리 호출
    	
    	var widgetResizable = false;
    	if ( true == opts.widgetResizable) widgetResizable = true;
    	
//		var maxSizeX = option.maxSizeX;
//		var maxSizeY = option.maxSizeY;
    	var base_dimensions = obj.width()/8 -10;
    	var gridster = $(".gridster > .gs-ul").gridster({
    		widget_margins: [4,6],
    		widget_base_dimensions: [base_dimensions, WIDGET_HEIGHT],
    		//min_cols: 1, //모나크에서는 디폴트로 6개로 구성한다.
    		max_cols: 8,
    		//min_rows: 15, //디폴트값이 15 
    		//max_size_x :maxSizeX,
    		//max_size_y :maxSizeY,
			draggable: {
				handle: 'header'
		    },
			resize: {
				enabled: widgetResizable
			},
		}).data('gridster');
    	
    	if ( true != opts.widgetDraggable) {
    		gridster.disable();
    	}

    	bulidWidgetLayout(obj, opts);
    	
    	
    	
    	
//    	var gridster = $('.gridster ul').gridster().data('gridster');
    	//gridster.resizable(true);
       // obj.data('superExtFilter', superExtFilter);
        //selectDefaultPreset(obj); //슈퍼테이블이 최초 표시될때 문제가 있으므로 외부에서 필요한 타이밍에 처리하도록 변경
    }

    /* 대쉬보드에 생성될 기본 위젯 레이아웃 새성 */
    function buildSkeleton(obj) {
//	    var ulTag = $('<ul class="gs-ul" style="height: 800px; width: 960px; position: relative;"></ul>');
	    var ulTag = $('<ul class="gs-ul" ></ul>');
	    obj.append(ulTag);
    }

    /* 구조체 정보를 이용하여 위젯 생성 */ 
    function bulidWidgetLayout(obj, opt){
    	// widget수만큼 반복하여 레이아웃을 생성한다.
    	$.each(option.widget, function(idx, targetWd){
    		addWidget(targetWd);
    	});
    }
    
    function addWidget( wd ) {
    	var gridster = $('.gridster .gs-ul').gridster().data('gridster');
		var dataCol = wd.dataCol;
		var dataRow = wd.dataRow;
		var dataSizeX = wd.dataSizeX;
		var dataSizeY = wd.dataSizeY;
		var monScript = wd.monScript;
		var headerTitle = wd.title;
		var type = wd.type;
		
		var lsTags=$('<li class="gs-wd" ></li>');
		lsTags.attr("data-row", dataRow);
		lsTags.attr("data-col", dataCol);
		lsTags.attr("data-sizex", dataSizeX);
		lsTags.attr("data-sizey", dataSizeY);
		var  headerTag = $('<header class="gs-wd-header" ></header>');
		var headerSpan = $('<span>' + headerTitle+ '</span>');
		var delBtn = $('<button>del</button>');
		var editBtn = $('<button>edit</button>');
//		var contentDiv = $('<div class="gs-wd-content"><div class="gs-wd-filter"></div><div class="gs-wd-chart"></div><div class="gs-wd-grid"></div></div>');
		var contentDiv = $('<div class="gs-wd-content"><div class="gs-wd-grid"></div><div class="gs-wd-chart"></div></div>');
		
		if ( false != wd.showHeader ) { //헤더를 표시하지 않으면 드래그가 불가능함.
			lsTags.append(headerTag);
		}
		
		lsTags.append(contentDiv);
		headerTag.append(headerSpan);
		if( false != wd.editable ) {
			headerTag.append(delBtn).append(editBtn);
		}
		
		
		gridster.add_widget(lsTags, parseInt(dataSizeX), parseInt(dataSizeY),parseInt(dataCol), parseInt(dataRow));
		makeWidgetContent(contentDiv, wd.monScript);
    }
    
    
    function makeWidgetContent(contentDiv, monScript) {
    	var liEl = contentDiv.parent();
    	var chartEl = $('.gs-wd-chart', contentDiv);
    	//구조체 정보를 취득하여 데이터를 취득
    	if(undefined == monScript) {
    		return false;
    	}else {
    		var wdMonScript = GETJSON(monScript);
    		
    		if(undefined == wdMonScript ) return false;

    		liEl.data('jsonData', wdMonScript);
    		//liEl.attr("id", wdMonScript.widgetId); //해당 위젯을 구분하는 아이디
			liEl.attr("id", monScript); //해당 위젯을 구분하는 아이디
    		//타입체크
    		if(wdMonScript.widgetType== 'chart') {
    			//챠트 그리기
    			
    		
    			//해당 챠트 데이터 취득
    	    	var pl = new JSONClientParameters();
    	         pl.add("service",wdMonScript.chartData.service);
    	         pl.add("method", wdMonScript.chartData.method);

				 //params가 존재할경우 파라메터를 추가적으로 입력.
				 if(undefined != wdMonScript.chartData && undefined != wdMonScript.chartData.params){
					var params =wdMonScript.chartData.params();
					for (var key in params) {
						pl.add(key, params[key]);
					}
					 /*$.each(params, function(key, val){
						console.log('key:' + key);
						pl.add(key, val);
					 });*/
				 };
				 
    	         PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function (data) {
    	        	 generateChartData(wdMonScript, data.resultData);
    	         }, function (response) {
    	             alert(response.Message);
    	         }, _M.aSync.sync);
    	         
    	         
    	         
//    	         Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
//    	             return {
//    	            	 radialGradient: { cx: -0.1, cy: 0.5, r: 1},
//    	                 stops: [
//    	                     [0, color],
//    	                     [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
//    	                 ]
//    	             };
//    	        });
    			chartEl.highcharts(wdMonScript.chartOption);
    			
    		} else if(wdMonScript.widgetType=='superTable'){
				/*
					contentDiv.find('.gs-wd-grid').superContaner('superTable', wdMonScript);
				//}*/
    			
				var stbDiv = $('<div></div>');
				contentDiv.find('.gs-wd-grid').empty().append(stbDiv);
				stbDiv.superContaner('superTable', wdMonScript);
    			
    		}
    		
    	}
    	
//    	filterEl.append('filterArea');
//    	
//    	chartEl.append('chartArea');
//    	
//    	gridEl.append('gridArea');
    }
    
    /* 타입에 따라 데이터를 셋팅 */
    function generateChartData(opt, rstData){
    	var type = opt.chartOption.chart.type;
    	
    	switch (type) {
			case 'funnel':
				//data
				opt.chartOption.series[0].data = makeFunnelData(rstData, opt.chartData.series) ;
				break;
			case 'column':
				//data
//				var ctrgs = getCategories(rstData, opt.chartData.categories);
//				var series = getColumnSeries(rstData, opt.chartData.series);
				var columnData;
    	
		    	//callback tes t
				if (undefined != opt.chartData.seriesData){
					columnData = eval(opt.chartData.seriesData)(rstData);
				}else {
					
					columnData = makeColumnData(rstData, opt.chartData) ;
				}
				
				if (undefined != opt.chartData.categoriesData){
					opt.chartOption.xAxis.categories = eval(opt.chartData.categoriesData)(rstData);
				}else if(opt.chartData.categories.type != undefined && opt.chartData.categories.type == 'field') {
					//카테고리 타입이 field이면 필드명에 적합한 결과값을 취득하여 셋팅함
					opt.chartOption.xAxis.categories = getCategories(rstData, opt.chartData.categories.data);
				}else {
					//카테고리 타입이 text이면 필드명으로 데이터를 바인딩하는것이 아니라 직접 옵션값을 셋팅함
					opt.chartOption.xAxis.categories = opt.chartData.categories.data;
				}
				opt.chartOption.series = columnData;
//				opt.chartOption.xAxis.categories = columnData['caegories'];
				break;
	
			default:
				break;
		}
    }
    
    
    function getCategories(rstData, ctgrFld){
    	
    	var ctgrArr = [];
    	var tmpCtgr = null;
		$.each(rstData, function(idx, data){
			var ctgr = data[ctgrFld];
			if(tmpCtgr != ctgr) {
				ctgrArr.push(ctgr);
				tmpCtgr = ctgr;
			}
		});
    	//console.log('category:' + ctgrArr);
    	return ctgrArr;
    }
//
//    function getColumnSeries(rstData, seriesOpt){
//    	
//    	
//    	var seriesArr = [];
//    	var nameArr = [];
//    	var tmpName= null;
//    	
//    	
//		$.each(rstData, function(idx, data){
//			var name = data[seriesOpt.name];
//			if(nameArr.indexOf(name) < 0 ){
//				nameArr.push(name);
//			}
//		});
//		console.log('nameArr:' + nameArr);
//    	$.each(nameArr,function(idx, targetName) {
//    		var seriesDtl = {name:targetName, data:[]};
//    		
//    		$.each(rstData, function(idx, data){
//    			if(targetName == data[seriesOpt.name]) {
//    				seriesDtl.data.push(data[seriesOpt.data]);
//    			}
//    		});
//    		
//    		seriesArr.push(seriesDtl);
//    	});
//    	console.log(seriesArr);
////		$.each(tmpName, function(idx, targetName){
////			var seriesDtl = {name:'', data:[]};
////			
////			var tmpDataArr = [];
////			$.each(rstData, function(idx, data){
////				if(name == data[seriesOpt.name]){
////					tmpDataArr.push(data[seriesOpt.data]);
////				}
////			});
////			
////			seriesDtl.name = name;
////			seriesDtl.data = tmpDataArr;
////			seriesArr.push(seriesDtl);
////			
////			tmpName = name;
////		});
////    	console.log(seriesArr);
//    	return seriesArr;
//    }
    
    
    function makeColumnData(rstData, chartOpt){
    	var makedSeries = [];
    	

    	$.each(rstData, function(idx, data){
    		//TODO name 셋팅
    		var defaultSeries = {name: null , data:[]};
    		var seriesName = data[chartOpt.series.name];
    		defaultSeries.name = seriesName;
//    		if(undefined != chartOpt.series.drilldown){
//    			defaultSeries.drilldown = chartOpt.series.drilldown;
//    		}
    		if(undefined != chartOpt.series.namedByOption && chartOpt.series.namedByOption.length > 0){
    			//nameByOption에 따라 추가 옵션이 존재할 경우
    			var namedByOption = chartOpt.series.namedByOption;
    			$.each(namedByOption, function (idx, nbo){
    				
    				if(seriesName == nbo.name) {
    					//todo 이름이 같을때 해당 옶션을 셋팅한다.
    					$.extend(defaultSeries, nbo.option);
    				}
    				
    				
    			});
    		}
    		
    		var dataFlds = chartOpt.series.data;
    		
    		$.each(dataFlds, function(idx, fldName){
    			defaultSeries.data.push(data[fldName]);
    		});
    		makedSeries.push(defaultSeries);
    	});
    	
    	
//    	if(true == chartOpt.showWithSpline) {
//	    	$.each(rstData, function(idx, data){
//	    		//TODO name 셋팅
//	    		var defaultSeries = {name: null , data:[], type:'spline'};
//	    		var seriesName = data[chartOpt.series.name];
//	    		defaultSeries.name = seriesName;
//	    		
//	    		if(undefined != chartOpt.series.namedByOption && chartOpt.series.namedByOption.length > 0){
//	    			//nameByOption에 따라 추가 옵션이 존재할 경우
//	    			var namedByOption = chartOpt.series.namedByOption;
//	    			$.each(namedByOption, function (idx, nbo){
//	    				
//	    				if(seriesName == nbo.name) {
//	    					//todo 이름이 같을때 해당 옶션을 셋팅한다.
//	    					$.extend(defaultSeries, nbo.option);
//	    				}
//	    				
//	    				
//	    			});
//	    		}
//	    		
//	    		var dataFlds = chartOpt.series.data;
//	    		
//	    		$.each(dataFlds, function(idx, fldName){
//	    			defaultSeries.data.push(data[fldName]);
//	    		});
//	    		makedSeries.push(defaultSeries);
//	    	});
//    	}
    	
////    	console.log(makedSeries);
////    	console.log(makedCtgr);
    	return makedSeries;
    }
    
    function makeFunnelData(rstData, series){
    	//TODO funnel 챠트 데이터 만들기
		//    	data: [
		//               ['Website visits',   15654],
		//               ['Downloads',       4064],
		//               ['Requested price list', 1987],
		//               ['Invoice sent',    976],
		//               ['Finalized',    846]
		//       ]

    	var makedDt =[];
    	var dataFld = series.data;
    	$.each(rstData, function(idx, data){
    		var tmpDt=[];
    		tmpDt.push(data[dataFld[0]]);
    		tmpDt.push(parseInt(data[dataFld[1]]));
    		makedDt.push(tmpDt);
    	});
    	return makedDt;
    }

    function clearAllChartObject() {
    	Highcharts.charts.sort();
    	$.each(Highcharts.charts, function(idx, obj){
    		Highcharts.charts.pop();
    	});
    }
	
	function getContentDiv(widgetId){
		return monDashboard.find('#'+widgetId).find(".gs-wd-content");
	}
    function redrawWidget (tObj){
	   		//TODO redraw가 정확하게 계산되기쩐까지는 고정..
//    		var gridster = $('.gridster ul').gridster().data('gridster');
//    		var base_dimensions = tObj.width()/6;
//    		gridster.options.widget_base_dimensions = [base_dimensions,WIDGET_HEIGHT];
//    		gridster.generate_grid_and_stylesheet();
	}
})(jQuery);


