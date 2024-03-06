/*
* version 1.0 2013-12-02
* Requires jQuery v1.4.2 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Dong Min Jung
* Company : Kongyoung DBM
*/

; (function ($, window, document, undefined) {
    // 관련 리소스 바인딩.
    document.writeln('<link type="text/css" href="/css/CampaignWorkflow.css" rel="stylesheet" />');



    // 플러그인 기본 셋팅
    var pluginName = "campaignWorkFlow",
        dataPlugin = "plugin_" + pluginName,
        settings = {
            Endpoint: "Blank",
            HoverPaintStyle: { strokeStyle: "#eaeaea", lineWidth: 2 },
            ConnectionOverlays: [
		        ["Arrow", {
                    width: 10,
		            location: 1,
		            length: 10
		        }]
	        ]
        };





    
    
    
    
    
    // jsPlumb 초기화 및 인스턴스 생성
    jsPlumb.bind("ready", function() {
        var resetRenderMode = function (desiredMode) {
            jsPlumb.init();
        };
        resetRenderMode(jsPlumb.SVG);
        jsPlumb.importDefaults(settings);
    });











    // 서브메뉴 지정 및 최종Node 지정용 변수 Hooker 생성
    var subMenu = '#Tooltip';
    var Hooker;
    var Popup;
    var MainList;
    var MainView;
    var lastCampaign;






    // 플러그인 프라이빗 메서드
    var privateMethod = function () {
        console.log("private method");
    };













    // 컨스트럭터 선언 후 옵션 병합
    var Plugin = function (element) {
        this.options = $.extend({}, settings);
    };



















    // 실제 플러그인 함수 선언
    Plugin.prototype = {
        
        // 키 받아오기..
        receiveKey: function(key) {
            lastCampaign = key;
        },
    
        
        
        
        
        
        
        
        
        // 워크플로우 영역 만들기        
        makePanel: function(option, object, parentKeyValue) {
            var mainHTML = object;
            var jsonName = option;
            var theme;
            if (typeof (jsonName) == "string") {
                option = GETJSON(jsonName);
                $(this).attr("jsonName", jsonName);
            };
            if (option == undefined) { option = eval(jsonName); };
            if (option == undefined) return;

            $(mainHTML).data("jsonData", option);
            $(mainHTML).removeClass().addClass('SuperContaner SuperView campaignWorkFlow').attr('keyvalue', '');
            $(mainHTML).removeClass();
            $(mainHTML).addClass('SuperContaner SuperView campaignWorkFlow').css('position', 'relative');            
            if (option.mainViewToggle) {
                $(mainHTML).css('display', 'none');
            }

            if (option.title != undefined) {
                var title = $("<div class='title'></div>").appendTo(mainHTML);
                $("<table id='job'></table>").appendTo(mainHTML);
                title.html(option.title.text);
                title.attr('titleform', option.title.text);
                title.addClass(option.title.Css);
            };

            if ( $(mainHTML).attr("parentKeyValue") != undefined ) $(mainHTML).attr("parentKeyValue", parentKeyValue);
            if (option.BeforeLoadCallBack != undefined) eval(option.BeforeLoadCallBack)(mainHTML);

            if (option.bodyHeight > 0) mainHTML.css('height', option.bodyHeight);
            if (option.bodyWidth > 0) mainHTML.css('width', option.bodyWidth);
            if (option.isPadding != undefined) {
                mainHTML.css("padding", option.isPadding);
            };

            var jobTr = $("<tr class='jobAreaTR'></tr>").appendTo($('#job'));
            var jobTd = $("<td class='jobArea jobArea-bg'><div class='buttonset'></div></td>").appendTo(jobTr);
            $(mainHTML).makeButtons(jobTr);
            $(jobTr).find('.cmdspan').each(function(index, value) {
                var functionName = $(value).find('input').attr('index');
                if ( functionName == 'makeViewPopup' ) {
                    $(value).click(function() {
                        Plugin.prototype.makeViewPopup('CMP_CAMPAIGN_PVIW', true, function() {
                            var nodeOption = {
		                        "id":  "CMP-" + makeUniqueKey(), 
		                        "title": "<div class='nodeContent'><span class='icon i-20 icon-campaign align-middle'></span><span class='nodeTitle align-middle inline-block'>" + $("#WorkFlowPopup").find(".fieldContaner[field='CAMPAIGN_NM']").val() + "</span></div>", 
		                        "left": "100px", 
		                        "top": "100px",
		                        "width": "200px",
		                        "height": "40px",
		                        "ntype":"CMP",
		                        "key": lastCampaign,
                                "bg": "",
                                "maxConnection" : 99,
		                        "json": "CMP_CAMPAIGN_PVIW"
                            };
                            jsPlumb.detachEveryConnection();
                            jsPlumb.deleteEveryEndpoint();
                            jsPlumb.Defaults.Container.empty();
                            jsPlumb.reset();
                            Plugin.prototype.makeNodeElement(nodeOption);
                            Plugin.prototype.saveWorkFlow(lastCampaign);
                            $('.WorkFlowPopup').dialog("close");

                            MainList.superContaner("List");
                        });
                    });
                } else if ( functionName == 'requestApproval' ) {
                    $(value).click(function() {
                        Plugin.prototype.requestApproval();
                    });
                };
            });
            var Panel = $("<div id='workflowPanel' style='text-align:center;'></div>").css('height', option.bodyHeight - 40).css('overflow', 'auto').appendTo(mainHTML);

            jsPlumb.Defaults.Container = $('#workflowPanel');
            MainList = $("#MainList[jsonname='CMP_CAMPAIGN_TBL']", '.main').addClass('campaignWorkFlow');
            MainView = jsPlumb.Defaults.Container.parent();            
        },




























        // 모든 타입들의 컨텐츠 입력 폼 or View 폼 팝업 생성
        makeViewPopup: function(json, isEdit, callback, key) {
            $(document.body).find('.WorkFlowPopup').remove();
            $(document.body).append("<div class='WorkFlowPopup EditPopUp DivContext'></div>");
            Popup = $('<div id="WorkFlowPopup"></div>').appendTo($(document.body).find('.WorkFlowPopup'));
            $("#WorkFlowPopup").superContaner('superView', json).addClass('campaignWorkFlow');
            if (!isEdit) {     
                $("#WorkFlowPopup").superContaner('Read', key);
                $('.cmdbtn[index="modeChange"]', '#WorkFlowPopup').trigger('click');
            }
            var option = $("#WorkFlowPopup").data('jsonData');
            $(document.body).find('.WorkFlowPopup').dialog({
                autoOpen: false,
                modal: true,
                width: option.bodyWidth ? option.bodyWidth : 1000,
                title: option.title,
                buttons: {
                    "저장": function () {
                        $(this).find('#WorkFlowPopup').superContaner("Save", callback);
                    },
                    "취소": function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(document.body).find('.ShowContentPopUpJson').remove();
                }
            });
            $(document.body).find('.WorkFlowPopup').dialog("open");
        },


















        // 노드 생성 함수
        makeNodeElement: function(option) {
            console.log('make');
            $(option).each(function(index, option) {
                var Node = $("<div class='Node "+option.ntype+"' id='" + option.id + "' ><div class='nodeContent'>"+ option.title + "</div><div class='nodeSubContent' style='text-align:right; margin-top:10px;'></div></div>").appendTo(jsPlumb.Defaults.Container)
                .css('background-color', option.bg)
                .css('left', option.left).css('top', option.top)
                .css('width', option.width).css('height', option.height);

                Node.find('.nodeSubContent').text(option.subTitle ? option.subTitle : 'No Title').css('width', option.width)
                .css('overflow', 'hidden')
                .css('text-overflow', 'ellipsis')
                .css('white-space', 'nowrap');

                Node
                .attr('ntype', option.ntype)
                .attr('key', option.key)
                .attr('json', option.json)
                .attr('campKey', option.campKey ? option.campKey : jsPlumb.Defaults.Container.find('.Node[ntype=CMP]').attr('key'))
                .attr('tarKey', option.tarKey ? option.tarKey : "")
                .attr('maxConnection', option.maxConnection);
                
                Node.find('.nodeTitle')
                .css('width', option.width.substring(0, option.width.indexOf('p')) * 1 - 30)
                .css('overflow', 'hidden')
                .css('text-overflow', 'ellipsis')
                .css('white-space', 'nowrap');
                

                Node.find('.nodeTitle').unbind('click').bind('click', function(e) {
                    var Target = $(e.currentTarget).parents('.Node');
                    var Json = Target.attr('json');
                    var Key = Target.attr('key');
                    Plugin.prototype.makeViewPopup(Json, false, function(){
                        var type = Target.attr('id').substring(0, 3);
                        var updateName; 
                        switch (type) {
                            case 'CMP':
                                updateName = Popup.find('.fieldContaner[field=CAMPAIGN_NM]').val();
                                Target.find('.nodeTitle').text(updateName);
                            break; 
                            
                            case 'TAR':
                                updateName = Popup.find('.fieldContaner[field=TARGET_NM]').val();
                                Target.find('.nodeTitle').text(updateName);
                            break;

                            case 'MDI':

                                var jsonName = Target.attr('json');
                                var mediaType = jsonName.substring(jsonName.indexOf('EXECUTE') + 8, jsonName.indexOf('VIW') - 1);

                                switch (mediaType) {
                                    case 'EMAIL':
                                        updateName = Popup.find('.fieldContaner[field=TITLE]').val();
                                        Target.find('.nodeSubContent').text(updateName);
                                    break;
                                    case 'SMS':
                                        updateName = Popup.find('.fieldContaner[field=TARGET_NM]').val();
                                        Target.find('.nodeSubContent').text(updateName);
                                    break;
                                    case 'LMS':
                                        updateName = Popup.find('.fieldContaner[field=TARGET_NM]').val();
                                        Target.find('.nodeSubContent').text(updateName);
                                    break;
                                    case 'MMS':
                                        updateName = Popup.find('.fieldContaner[field=TARGET_NM]').val();
                                        Target.find('.nodeSubContent').text(updateName);
                                    break;
                                    case 'DM':
                                        updateName = Popup.find('.fieldContaner[field=TARGET_NM]').val();
                                        Target.find('.nodeSubContent').text(updateName);
                                    break;
                                    case 'TM':
                                        updateName = Popup.find('.fieldContaner[field=TARGET_NM]').val();
                                        Target.find('.nodeSubContent').text(updateName);
                                    break;
                                }
                                
                            break;
                        }; 

                        var keyvalue = Target.attr('campkey');
                        Plugin.prototype.saveWorkFlow(keyvalue);
                        Plugin.prototype.loadWorkFlow(keyvalue);
                        $('.WorkFlowPopup').dialog("close");

                        MainList.superContaner('tableRefresh', keyvalue);

                    }, Key);


                    // 수정모드일 때 팝업에서 수정하지 못 하도록 버튼 제공하지 않음.
                    if ( jsPlumb.Defaults.Container.attr('editable') == 'no' ) {
                        Popup.find('.cmdicon[index=modeChange]').parents('.cmdspan').hide();
                        Popup.find('.cmdicon[index=modeChange]').parents('.cmdspan').next().hide();
                    } else {
                        Popup.find('.cmdicon[index=modeChange]').parents('.cmdspan').show();
                        Popup.find('.cmdicon[index=modeChange]').parents('.cmdspan').next().show();
                    }
                });



                if ( Node.attr('ntype') != 'MDI' ) {
                    Hooker = Node;
                }



                if ( Node.attr('ntype') != 'CMP' ) {
                    jsPlumb.makeTarget(Node, {
                        anchor: "ContinuousLeft"
                    });
                }
                
                jsPlumb.makeSource(Node, {
                    filter: ".ep",
                    anchor: "ContinuousRight",
                    connector: "Straight",
                    stub: 200,
                    connectorStyle: { strokeStyle: "#4AAFC9", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
                    maxConnections: option.maxConnection,
                    onMaxConnections: function(info, e) {
                        alert("Maximum connections (" + info.maxConnections + ") reached");
                    }
                });
            });

            

            jsPlumb.Defaults.Container.find('.Node').mousedown(function(e) {
                if ( e.which == 3 ) {
                    jsPlumb.Defaults.Container.on('contextmenu', function() { return false; } );
                    Plugin.prototype.setNodeMenu(e);
                }
            });

            jsPlumb.Defaults.Container.unbind().bind('mouseleave click', function(e) {
                
                if ( $(e.target).attr('id') != 'makeMDI' && $(e.target).parent().attr('id') != 'makeMDI' ) {
                    $('#Tooltip').remove();
                }

            });

        },

        















        // 우클릭시 생성되는 메뉴 생성 함수
        setNodeMenu: function(node) {            
            jsPlumb.Defaults.Container.find(subMenu).remove();
            if ( jsPlumb.Defaults.Container.attr('editable') == 'no' ) {
                return false;
            }
            var Tooltip = $("<div id='Tooltip'></div>")
            .css('left', node.currentTarget.offsetLeft + node.offsetX)
            .css('top', node.currentTarget.offsetTop + node.offsetY)
            .attr('parent', $(node.currentTarget).attr('id'))
            .appendTo(jsPlumb.Defaults.Container);

            var nodetype = $(node.currentTarget).attr('ntype');
            
            function setMenuContents(option) {
                $(option).each(function(index, menu) {
                    var listElement = $("<li></li>").attr('id', menu.id).appendTo(listParent)
                    .css('padding', '12px 6px')
                    .css('float', 'none');

                    $("<div class='menuContent align-middle' style='display:inline-block;'>").text(menu.name)
                    .css('width', '100px')                        
                    .css('height', '20px')
                    .css('line-height', '20px')
                    .appendTo(listElement);

                    $("<div class='icon i-20 align-middle'></div>").addClass(menu.icon)
                    .css('margin-right', '6px')
                    .appendTo(listElement);
                });
            };

            function selectMDIPopup(json, html, e) {
                jsPlumb.Defaults.Container.find('#Tooltip').remove();
                var keyvalue = jsPlumb.Defaults.Container.find('.Node[ntype=CMP]').attr('key');
                Plugin.prototype.makeViewPopup(json, true, function() {
                    var nodeOption = {
		                "id":  "MDI-" + makeUniqueKey(),
                        "title" : html,
		                "left": "900px", 
		                "top": "100px",
		                "width": "100px",
		                "height": "40px",
		                "ntype": "MDI",
		                "key": lastCampaign,
                        "campKey": keyvalue,
                        "tarKey": $(e.target).parents('#Tooltip').attr('parent'),
                        "bg": "",
                        "maxConnection": 0,
		                "json": json
                    };                    
                    Plugin.prototype.makeNodeElement(nodeOption);                    
                    var link = {
                        source : $(e.target).parents('#Tooltip').attr('parent'),
                        target : nodeOption.id
                    }
                    jsPlumb.connect(link);
                    // 이 시점에 팝업에 제목 긁어와서 노드에다가 적용시키면 save 할 때 그 제목으로 적용시킬 수 있을 것임...
                    var nodeTitle = $('.WorkFlowPopup').find('.fieldContaner[field=TITLE]').val();
                    $('#'+nodeOption.id+'').find('.nodeSubContent').text(nodeTitle).css('text-align', 'left');
                    Plugin.prototype.saveWorkFlow(keyvalue);
                    Plugin.prototype.loadWorkFlow(keyvalue);
                    $('.WorkFlowPopup').dialog("close");
                });
                var Id = $(e.currentTarget).parents('#Tooltip').attr('parent');
                var Target = jsPlumb.Defaults.Container.find('#'+Id+'');
                var key = Target.attr('key');
                Popup.attr('parentkeyvalue', key);
            };

            switch (nodetype) {
                case "CMP" : 
                    var listParent = $("<ul id='nodeMenu' style='list-style:none;'></ul>").appendTo(Tooltip);
                    var menus = [
                        { id : 'makeTarget',    name : "타겟 생성",      icon : "icon-target"    },
                        { id : 'editCMP',       name : "캠페인 수정",    icon : "icon-edit"      },
                        { id : 'deleteCMP',     name : "캠페인 삭제",    icon : "icon-cancel"    }
                    ];
                    setMenuContents(menus);
                break;
                    
                case "TAR" :
                    var listParent = $("<ul id='nodeMenu' style='list-style:none;'></ul>").appendTo(Tooltip);
                    var menus = [
                        { id : 'makeMDI',       name : "매체 생성",     icon : "icon-campaign"  },
                        { id : 'selectTarget',  name : "대상 선정",     icon : "icon-company"   },
                        { id : 'editTAR',       name : "타겟 수정",     icon : "icon-edit"      },
                        { id : 'deleteTAR',     name : "타겟 삭제",     icon : "icon-cancel"    }
                    ];
                    setMenuContents(menus);
                    jsPlumb.Defaults.Container.find('#makeMDI').click(function() {
                        jsPlumb.Defaults.Container.find('#Tooltip').find('li').hide(200);
                        var subMDI = [
                            { id : 'makeEMAIL', name : "이메일",    icon : "icon-email" },
                            { id : 'makeSMS',   name : "SMS",       icon : "icon-sms"   },
                            { id : 'makeLMS',   name : "LMS",       icon : "icon-lms"   },
                            { id : 'makeMMS',   name : "MMS",       icon : "icon-mms"   },
                            { id : 'makeDM',    name : "DM",        icon : "icon-mail"  },
                            { id : 'makeTM',    name : "TM",        icon : "icon-tm"    }
                        ];
                        setMenuContents(subMDI);
                    });
                break;

                case "MDI" :
                    var listParent = $("<ul id='nodeMenu' style='list-style:none;'></ul>").appendTo(Tooltip);
                    var menus = [
                        { id : 'editMDI',   name : "매체 수정", icon : "icon-edit"      },
                        { id : 'deleteMDI', name : "매체 삭제", icon : "icon-cancel"    }
                    ];
                    setMenuContents(menus);
                break;
            }















            /* ===============================================================================================
            // setNodeMenu 캠페인 노드에서 메뉴 클릭 이벤트.
            =============================================================================================== */
            jsPlumb.Defaults.Container.find('#makeTarget').click(function() {
                jsPlumb.Defaults.Container.find('#Tooltip').remove();
                var campKey = jsPlumb.Defaults.Container.find('.Node[ntype=CMP]').attr('key');
                Plugin.prototype.makeViewPopup('CMP_CAMPAIGN_TARGET_PVIW', true, function() {
                    var nodeOption = {
		                "id":  "TAR-" + makeUniqueKey(), 
		                "title": "<div class='nodeContent'><span class='icon i-20 icon-target align-middle'></span><span class='nodeTitle align-middle inline-block'>" + $("#WorkFlowPopup").find(".fieldContaner[field='TARGET_NM']").val() + "</span></div>", 
		                "left": "500px", 
		                "top": "100px",
		                "width": "100px",
		                "height": "40px",
		                "ntype":"TAR",
		                "key": lastCampaign,
                        "campKey": campKey,
                        "bg": "",
                        "maxConnection": 99,
		                "json": "CMP_CAMPAIGN_TARGET_PVIW"
                    };
                    Plugin.prototype.makeNodeElement(nodeOption, jsPlumb.Defaults.Container);                    
                    var link = {
                        source : $('.Node[id*=CMP]').attr('id'),
                        target : nodeOption.id
                    }
                    jsPlumb.connect(link);
                    Plugin.prototype.saveWorkFlow(campKey);
                    Plugin.prototype.loadWorkFlow(campKey);
                    $('.WorkFlowPopup').dialog("close");
                });
                Popup.attr('parentKeyvalue', campKey);
            });

            jsPlumb.Defaults.Container.find('#editCMP').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });

            jsPlumb.Defaults.Container.find('#deleteCMP').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });
            













            /* ===============================================================================================
            // setNodeMenu 타겟 노드에서 메뉴 클릭 이벤트.
            =============================================================================================== */
            jsPlumb.Defaults.Container.find('#selectTarget').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });
            
            jsPlumb.Defaults.Container.find('#editTAR').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });
            
            jsPlumb.Defaults.Container.find('#deleteTAR').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });

            $(document).on('click', '#makeEMAIL', function(e) {
                var html = "<span class='icon i-20 icon-email align-middle'></span><span class='nodeTitle align-middle inline-block'>EMAIL</span>";
                selectMDIPopup("CMP_CAMPAIGN_EXECUTE_EMAIL_VIW", html, e);
                $(document).off('click', '#makeEMAIL');
            });

            $(document).on('click', '#makeSMS', function() {
                var html = "<span class='icon i-20 icon-sms align-middle'></span><span class='nodeTitle align-middle inline-block'>SMS</span>";
                selectMDIPopup("CMP_CAMPAIGN_EXECUTE_SMS_VIW", html);
                $(document).off('click', '#makeSMS');
            });
            
            $(document).on('click', '#makeLMS', function() {
                var html = "<span class='icon i-20 icon-lms align-middle'></span><span class='nodeTitle align-middle inline-block'>LMS</span>";
                selectMDIPopup("CMP_CAMPAIGN_EXECUTE_LMS_VIW", html);
                $(document).off('click', '#makeLMS');
            });
            
            $(document).on('click', '#makeMMS', function() {
                var html = "<span class='icon i-20 icon-mms align-middle'></span><span class='nodeTitle align-middle inline-block'>MMS</span>";
                selectMDIPopup("CMP_CAMPAIGN_EXECUTE_MMS_VIW", html);
                $(document).off('click', '#makeMMS');
            });
            
            $(document).on('click', '#makeDM', function() {
                var html = "<span class='icon i-20 icon-dm align-middle'></span><span class='nodeTitle align-middle inline-block'>DM</span>";
                selectMDIPopup("CMP_CAMPAIGN_EXECUTE_DM_VIW", html);
                $(document).off('click', '#makeDM');
            });
            
            $(document).on('click', '#makeTM', function() {
                var html = "<span class='icon i-20 icon-tm align-middle'></span><span class='nodeTitle align-middle inline-block'>TM</span>";
                selectMDIPopup("CMP_CAMPAIGN_EXECUTE_TM_VIW", html);
                $(document).off('click', '#makeTM');
            });









            /* ===============================================================================================
            // setNodeMenu 매체 노드에서 메뉴 클릭 이벤트.
            =============================================================================================== */
            jsPlumb.Defaults.Container.find('#editMDI').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });
            
            jsPlumb.Defaults.Container.find('#deleteMDI').click(function(e) {
                Plugin.prototype.clickNodes(e);
            });
        },







        // 수정/삭제시 실행될 함수
        clickNodes: function(e) {
            var Id = $(e.currentTarget).parents('#Tooltip').attr('parent');
            var Target = jsPlumb.Defaults.Container.find('#'+Id+'');
            var Json = Target.attr('json');
            var Key = Target.attr('key');
                
            if ( e.currentTarget.id.indexOf('edit') >= 0 ) {
                jsPlumb.Defaults.Container.find('#Tooltip').remove();
                Plugin.prototype.makeViewPopup(Json, false, function(){
                    
                    var updateName = Popup.find('.fieldContaner[field=CAMPAIGN_NM]').val();
                    var keyvalue = Popup.attr('keyvalue');
                    if ( Target.attr('ntype') != 'MDI' ) {
                        Target.find('.nodeTitle').text(updateName);
                    } else {
                        Target.find('.nodeSubContent').text(updateName);
                    }

                    if ( keyvalue != Target.attr('campKey') ) {
                        keyvalue = Target.attr('campKey');
                    }
                    Plugin.prototype.saveWorkFlow(keyvalue);
                    Plugin.prototype.loadWorkFlow(keyvalue);
                    $('.WorkFlowPopup').dialog("close");
                
                    MainList.superContaner('tableRefresh', keyvalue);
                
                }, Key);
            } else if ( e.currentTarget.id.indexOf('delete') >= 0 ) {
                jsPlumb.Defaults.Container.find('#Tooltip').remove();
                
                $(document.body).append('<div id="tabledailog"></div>');
                $('#tabledailog').html("캠페인 데이터를 삭제하시겠습니까?");
                $('#tabledailog').dialog({ autoOpen: false, width: 300, height: 200, modal: true, closeOnEscape: false,
                    title: '데이터 삭제',
                    buttons: {
                        "삭제": function() {
                            if ( Id.substring(0, 3) == 'CMP' ) {
                                var pl = new JSONClientParameters();
                                pl.add("service", 'M_CAMPAIGN');
                                pl.add("method", 'DELETE');
                                pl.add('M_CAMPAIGN_NO', Target.attr('key'));
                                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(data) {

                                    $('#tabledailog').remove();
                                    alert('삭제 되었습니다');
                                    MainList.superContaner('List');

                                }, function(response) {
                                    // 삭제 실패..
                                }, _M.aSync.async);
                            };

                            if ( Id.substring(0, 3) == 'TAR' ) {
                                var pl = new JSONClientParameters();
                                pl.add("service", 'M_TARGET');
                                pl.add("method", 'DELETE');
                                pl.add('M_TARGET_NO', Target.attr('key'));
                                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(data) {

                                    $('#tabledailog').remove();
                                    alert('삭제 되었습니다');
                                    var nodes = jsPlumb.getConnections({source:$(Target).attr('id')});
                                    $(nodes).each(function() {
                                        jsPlumb.remove(this.target);
                                    });
                                    jsPlumb.remove(Target);
                                    Plugin.prototype.saveWorkFlow(Target.attr('campKey'));
                                    Plugin.prototype.loadWorkFlow(Target.attr('campKey'));

                                    $('#tabledailog').remove();

                                }, function(response) {
                                    // 삭제 실패..
                                }, _M.aSync.async);
                            };

                            if ( Id.substring(0, 3) == 'MDI' ) {                                
                                var pl = new JSONClientParameters();
                                pl.add("service", 'M_CAMPAIGN_EXECUTE');
                                pl.add("method", 'DELETE');
                                pl.add('M_CAMPAIGN_EXECUTE_NO', Target.attr('key'));
                                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(data) {

                                    $('#tabledailog').remove();
                                    alert('삭제 되었습니다');

                                    jsPlumb.remove(Target);

                                    Plugin.prototype.saveWorkFlow(Target.attr('campKey'));
                                    Plugin.prototype.loadWorkFlow(Target.attr('campKey'));

                                    $('#tabledailog').remove();

                                }, function(response) {
                                    // 삭제 실패..
                                }, _M.aSync.async);

                            };
                        },
                        "취소": function() {
                            $('#tabledailog').remove();
                        }
                    }
                });
                $('#tabledailog').dialog('open');
            }
        },


























        // 워크플로우 화면 및 노드의 속성정보 저장 함수
        saveWorkFlow: function(keyvalue) {
            
            var check = $('#limitFlow');
            if ( check.size() > 0 ) {
                check.remove();
            }

            var doc = { "node": [], "link": [] };

            Plugin.prototype.arrangeNodes();

            $.each(jsPlumb.Defaults.Container.parent().find(".Node"), function(index, value) {
                var data = { 
                    "id": $(value).attr('id'),
                    "title": $(value).find('.nodeContent').html().replace(/"/g, "'"),
                    "subTitle": $(value).find('.nodeSubContent').text(),
                    "left": $(value).css('left'),
                    "top": $(value).css('top'),
                    "width": $(value).css('width'),
                    "height": $(value).css('height'),
                    "ntype": $(value).attr('ntype'),
                    "key": $(value).attr('key'),
                    "tarKey": $(value).attr('tarKey'),
                    "bg": $(value).attr('bg') ? $(value).attr('bg') : "",
                    "maxConnection": $(value).attr('maxConnection'),
                    "json": $(value).attr('json')
                }
                doc.node.push(data);
            });

            $.each(jsPlumb.getConnections(), function(index, value) {
                var data = { 
                    "id": value.id,
                    "source": value.sourceId,
                    "target": value.targetId
                }
                doc.link.push(data);
            });

            var JsonDoc = $.Json2Str(doc);
            
            var option = jsPlumb.Defaults.Container.parent().data("jsonData");
            var pl = new JSONClientParameters();
            pl.add("service", option.service);
            pl.add("method", option.method.Update);
            pl.add("key", keyvalue);
            pl.add(option.keyName, keyvalue);
            pl.add(option.DocName, JsonDoc);
            PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(_data) {
            }, function(response) {                
                alert(response);
            }, _M.aSync.sync);

        },



















        // 워크플로우 화면 정보 기반으로 재생성 함수
        loadWorkFlow: function(keyvalue) {
            jsPlumb.reset();
            jsPlumb.detachEveryConnection();
            jsPlumb.deleteEveryEndpoint();
            jsPlumb.Defaults.Container.empty();

            var option = jsPlumb.Defaults.Container.parent().data('jsonData');
            var doc;
            var pl = new JSONClientParameters();
            pl.add("service", option.service);
            pl.add("method", option.method.Read);
            pl.add("M_CAMPAIGN_NO", keyvalue);
            PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(data) {
                doc = data.resultData[0]["DOC_WORKFLOW"];
            }, function(response) {
                alert(response);
            }, _M.aSync.sync);
            
            doc = $.parseJSON(doc);
            if ( doc != null ) {
                Plugin.prototype.makeNodeElement(doc.node);
                if ( doc.link.length > 0 ) {
                    $(doc.link).each(function(index, link) {
                        jsPlumb.connect(link);
                    });
                } else {
                    // nothing
                }
            } else {
                // 워크플로우 정보가 없다는 메시지 보여줄 수 있음.
                // v
            }

            Plugin.prototype.showAdditionalInfo();

            $('.CMP').css('border-width', '2px').css('border-color', '#4AAFC9');
            $('.TAR').css('border-width', '2px').css('border-color', '#ED19FF');
            $('.MDI').css('border-width', '2px').css('border-color', '#59FF5F');
            
        },


        












        // 워크플로우 노드 배치 함수
        arrangeNodes: function() {

            var connectionInfo = jsPlumb.getConnections();
            var sortedMDI = [];
            var sortedTAR = [];

            jsPlumb.detachEveryConnection();
            jsPlumb.deleteEveryEndpoint();
            
			var panelHeight = MainView.height();
			var panelMiddle = panelHeight / 2;
			var nodeHeight = $('.Node').eq(0).innerHeight();				
			//var actualTop = panelMiddle  - 60 - nodeHeight / 2; // 중앙 배치용 계산
            var actualTop = 100;
			var rememberTop = actualTop;
            var defaultLeft = [ 100, 500, 900 ];
			
			var nodeCount = jsPlumb.Defaults.Container.find('.Node').length;
			var campCount = jsPlumb.Defaults.Container.find('.CMP').length;
			var targCount = jsPlumb.Defaults.Container.find('.TAR').length;
			var mediCount = jsPlumb.Defaults.Container.find('.MDI').length;		
			
			var distance = nodeHeight + 20;
			var targLeverage = parseInt(targCount / 2);
			var mediLeverage = parseInt(mediCount / 2);
			
			if ( targCount % 2 == 0 ) {
				targLeverage = targLeverage - 0.5;
			}
			
			if ( mediCount % 2 == 0 ) {
				mediLeverage = mediLeverage - 0.5;
			}			
            

            // top 벨류 얻어서 integer 로 변환
            function getTopValue(selector) {
                var topString = $(selector).css('top');
                if ( undefined == topString ) topString = "0px";
                var thisMuch = topString.indexOf('p');
                var topInteger = topString.substring(0, thisMuch) * 1;

                return topInteger;
            };


            // 캠페인 노드를 중앙 배치
            function campaignVerticalMiddle() {

                var largest, 
                    smallest, 
                    result;

                var compare = [];

                jsPlumb.Defaults.Container.find('.TAR').each(function(index, target) {
                    compare.push(getTopValue(target));
                });

                largest  = Math.max.apply(Math, compare);
                smallest = Math.min.apply(Math, compare);

                result = ( largest + smallest ) / 2;
                jsPlumb.Defaults.Container.find('.CMP').css('top', result);

            }

            
            // 초기화
			jsPlumb.Defaults.Container.find('.CMP').css('top', actualTop).css('left', defaultLeft[0]);


            // 타겟 노드 순차 배치
			jsPlumb.Defaults.Container.find('.TAR').each(function(index, node) {
				if ( index == 0 ) {
					actualTop = actualTop - distance * targLeverage;
					$(node).css('top', actualTop).css('left', defaultLeft[1]);
				} else {
					actualTop = actualTop + distance;
					$(node).css('top', actualTop).css('left', defaultLeft[1]);
				}
			});
		    
            // 증가된 초기값을 초기화함.
			actualTop = rememberTop;
            

            // 아래의 코드에서 소스, 타겟 정보를 얻어갈 수 있도록 커넥션 맺음.
            $(connectionInfo).each(function(index, node) {
                var items = {
                    source : this.sourceId,
                    target : this.targetId
                }
                jsPlumb.connect(items);
            });



            // 타겟과 맞물린 매체 노드를 그룹화하여...
            jsPlumb.Defaults.Container.find('.TAR').each(function(index, target) {
                jsPlumb.Defaults.Container.find('.MDI').each(function(index, media) {
                    if ( jsPlumb.getConnections({ target : $(media).attr('id') }).length != 0 ) {
                        if ( $(target).attr('id') == jsPlumb.getConnections({ target : $(media).attr('id') })[0].sourceId ) {
                            sortedMDI.push(media);
                        };
                    }
                });
            });
            

            // 그룹화한 매체 노드를 순차 배치.
			$(sortedMDI).each(function(index, mediaNode) {
				if ( index == 0 ) {
					actualTop = actualTop - distance * mediLeverage;
                    jsPlumb.repaint(mediaNode);
					$(mediaNode).css('top', actualTop).css('left', defaultLeft[2]);
				} else {
					actualTop = actualTop + distance;
                    jsPlumb.repaint(mediaNode);
					$(mediaNode).css('top', actualTop).css('left', defaultLeft[2]);
				}
			});
            


            
            // 매체 노드가 워크플로우 영역을 벗어났는지 체크.
            var checkValue = getTopValue($(sortedMDI).eq(0));
            var initialValue = 10;
            if ( checkValue < 10 ) {
                // 무조건 10 부터 시작하여 매체를 다시 그리도록. 
                $(sortedMDI).each(function(index, media) {                       
                    if ( index == 0 ) {
                        $(media).css('top', initialValue);
                    } else {
                        initialValue = initialValue + distance;
                        $(media).css('top', initialValue);
                    }
                });
            }



            // 워크플로우에 매체 노드가 존재하면..
            if ( jsPlumb.Defaults.Container.find('.MDI').size() > 0 ) {
                

                // 이미 매체 노드는 정렬이 완료 되었으므로, 타겟 노드를 매체 노드 기준으로 중앙 배치 시키기 위하여 다시 한 번 배치.
                jsPlumb.Defaults.Container.find('.TAR').each(function(index, target) {
                    var dependency;
                    var topValue;
                    var count = $('.MDI[tarkey='+$(target).attr("id")+']', jsPlumb.Defaults.Container).length;
                    var criteria = parseInt(count/2);


                    // 만약 현재 타겟이 연결된 노드를 지니고 있으면..
                    if ( count > 0 ) {
                        if ( count % 2 == 0 ) {
                            topValue = getTopValue($('.MDI[tarkey='+$(target).attr("id")+']', jsPlumb.Defaults.Container).eq(criteria)) * 1 - nodeHeight / 2;
                            $(target).css('top', topValue).css('left', defaultLeft[1]).addClass('Targeted');
                        } else {
                            topValue = getTopValue($('.MDI[tarkey='+$(target).attr("id")+']', jsPlumb.Defaults.Container).eq(criteria)) * 1;
                            $(target).css('top', topValue).css('left', defaultLeft[1]).addClass('Targeted');
                        }
                    } 
                    
                    
                    // 만약 현재 타겟이 연결된 노드를 지니고 있지 않으면, 따로 분류하여 배열로 보관한다.
                    else {
                        sortedTAR.push(target);
                    }
                });
                


                // 연결된 노드를 지니고 있는 마지막 타겟의 높이 값으로 초기값을 초기화 한다.
                actualTop = getTopValue(jsPlumb.Defaults.Container.find('.Targeted').eq($('.Targeted', jsPlumb.Defaults.Container).length - 1));


                // 따로 분류했던 연결된 매체 노드가 없는 타겟들만, 위 초기값 기준으로 증가값을 적용하여 하단 배치.
                $(sortedTAR).each(function(index, target) {
                    actualTop = actualTop + distance;
                    $(target).css('top', actualTop);
                });
                



                // 캠페인 노드에 적용할 타겟 노드의 중앙 위치를 구하기 위하여 첫번째 타겟과 마지막 타겟의 값을 더한 후 2로 나눈다.
                campaignVerticalMiddle();
            } 
            


            // 워크플로우에 매체 노드가 존재하지 않으면..
            else {


                // 타겟 노드가 워크플로우 영역을 벗어났는지 체크
                var checkValue = getTopValue(jsPlumb.Defaults.Container.find('.TAR:first'));


                // 워크플로우 영역을 벗어났으면..
                if ( checkValue < 10 ) {
                    jsPlumb.Defaults.Container.find('.TAR').each(function(index, target) {
                        

                        // 무조건 10 부터 시작하여 타겟을 다시 그리도록.                        
                        if ( index == 0 ) {
                            actualTop = 10;
                            $(target).css('top', 10);
                        } else {
                            actualTop = actualTop + distance;
                            $(target).css('top', actualTop);
                        }


                        // 캠페인 노드에 적용할 타겟 노드의 중앙 위치를 구하기 위하여 첫번째 타겟과 마지막 타겟의 값을 더한 후 2로 나눈다.
                        campaignVerticalMiddle();
                    });
                } 
                
                
                // 워크플로우 영역을 벗어나지 않았으면..
                else {


                    // 캠페인 노드에 적용할 타겟 노드의 중앙 위치를 구하기 위하여 첫번째 타겟과 마지막 타겟의 값을 더한 후 2로 나눈다.
                    campaignVerticalMiddle();
                }
            }

            


        },





        












        showAdditionalInfo: function() {

            console.log('info');
            var cmpaignStatus;
            var cmpKey = jsPlumb.Defaults.Container.find('.CMP').attr('key');
            
            var pl = new JSONClientParameters();
            pl.add("service", 'M_CAMPAIGN');
            pl.add("method", 'READ');
            pl.add('M_CAMPAIGN_NO', cmpKey);
            PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(data) {
                cmpaignStatus = data.resultData[0].CAMPAIGN_STATUS;
            }, function(response) {
                // 삭제 실패..
            }, _M.aSync.sync);
            
            jsPlumb.Defaults.Container.find('.CMP').find('.nodeSubContent').text("[단계 : " + cmpaignStatus +"]").css('color', '#666666');
            

            MainView.find('#limitFlow').remove();
            jsPlumb.Defaults.Container.attr('editable', 'yes');
            MainView.attr('viewstatus', 'E');
            $(MainView).displayButtons($(MainView));
            if ( cmpaignStatus == '승인요청' || cmpaignStatus == '승인완료'  ) {
                var frame = $("<span id='limitFlow' class='subNode'>"+ cmpaignStatus +" 단계 입니다. 편집이 불가능 합니다. </span>").appendTo(MainView);
                var location = jsPlumb.Defaults.Container.offset();
                frame.css('top', 65).css('left', 25).css('position', 'absolute').css('border-color', '#FF5F5F').css('border-width', '2px').css('border-style', 'solid');
                jsPlumb.Defaults.Container.attr('editable', 'no');
                MainView.attr('viewstatus', 'V');
                $(MainView).displayButtons($(MainView));
                jsPlumb.Defaults.Container.find('.Node').css('opacity', 0.5);
                jsPlumb.Defaults.Container.find('.Node').each(function(index, node) {
                    jsPlumb.unbind(node);
                });
            }


            jsPlumb.Defaults.Container.find('.TAR').each(function(index, target) {
                var tarKey = target.attributes.key.value;
                var targetCustomers;

                var pl = new JSONClientParameters();
                pl.add("service", 'M_TARGET');
                pl.add("method", 'READ');
                pl.add('M_TARGET_NO', tarKey);
                PostJsonData(_M.svcUrl[_M.Webtype].crudUrl, pl, function(data) {
                    targetCustomers = data.resultData[0].TOTAL_CUST_NO;
                }, function(response) {
                    // 삭제 실패..
                }, _M.aSync.sync);
                targetCustomers = targetCustomers ? targetCustomers : 0;
                $(target).find('.nodeSubContent').text("["+ targetCustomers + " 명]").css('color', '#666666');

            });
                        
        },



        





        


















        // 승인요청 버튼 클릭시 실행될 승인요청 처리 함수
        requestApproval: function(something) {
            
        }
        
    }


    $.fn[pluginName] = function (arg, contents) {
        var args, instance;

        if (!(this.data(dataPlugin) instanceof Plugin)) {
            this.data(dataPlugin, new Plugin(this));
        }

        instance = this.data(dataPlugin);
        instance.element = this;

        if (typeof arg === 'undefined' || typeof arg === 'object') {
            if (typeof instance['makePanel'] === 'function') {
                instance.makePanel(option, object, parentKeyValue);
            }
        } else if (typeof arg === 'string' && typeof instance[arg] === 'function') {
            args = Array.prototype.slice.call(arguments, 1);
            return instance[arg].apply(instance, args);
        } else {
            $.error('Method ' + arg + ' does not exist on jQuery.' + pluginName);
        }
    };

} (jQuery, window, document));