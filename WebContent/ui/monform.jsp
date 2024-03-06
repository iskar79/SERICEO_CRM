<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<%
request.setCharacterEncoding("UTF-8");
%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport"
	content="width=device-width, initial-scale=0.7, minimum-scale=0.4, maximum-scale=3">

<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta http-equiv="X-FRAME-OPTIONS" content="DENY" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="apple-touch-icon" href="MonArch-blue57x57.ico" />
<link rel="shortcut icon" href="favicon.ico" />
<title>::: SERICEO CRM :::</title>
<!-- <link id="CSSlink" type="text/css" href="css/Theme_Redwine.css" rel="stylesheet" /> -->
<link id="CSSlink" type="text/css" href="css/Theme_CEO.css" rel="stylesheet" />
<link type="text/css" href="css/Common.css" rel="stylesheet" />
<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
<script type="text/javascript" src="js/jquery.kdb.MonArch800.js"></script>
<script type="text/javascript" src="js/MonArch.js"></script>
<script type="text/javascript">
	$(document).ready(function() {

		$(window).hashchange(function(e) { //histroyback catch처리
			historyBackProc();
		});
		$(window).hashchange();

		$('.opticon-theme').click(function(e) {
			$.blockUI({
				message : $('.Themewindow')
			});
			$('.Themewindow, .Themebody').show();
		});

		$('.Themeli').click(function() {
			var className = $(this).attr('class');
			var css = className.substring(8, className.length);
			if (css == 'Thebuttons') {
				$('.cmdspan').css('border', '1px solid #B0B0B0');
			} else {
				$('.cmdspan').css('border', '1px solid transparent');
			}
			var cssUrl = '../css/Theme_' + css + '.css';
			changeTheme(cssUrl); //테마변경
			$('.Themewindow').hide();
			$.unblockUI();
			$('.qtip').remove();
		});

		$(".Themeli").each(function() {
			$(this).qtip({
				content : $(this).attr("themeId"),
				position : {
					corner : {
						target : 'bottomMiddle',
						tooltip : 'topMiddle'
					}
				},
				style : {
					tip : 'topMiddle',
					width : 200,
					padding : 5,
					background : '#333333',
					color : '#FFFFFF',
					textAlign : 'center',
					border : {
						width : 7,
						radius : 5,
						color : '#333333'
					}
				},
				show : {
					solo : true
				}
			//hide: 'mouseout'
			});
		});

		$('.icon-cancel', '.Themewindow').click(function() {
			$('.Themewindow').hide();
			$.unblockUI();
			$('.qtip').remove();
		});

	});
	<%
	String authValue = (String)session.getAttribute("authValue");
	if ( authValue == null ) {
	%>
		window.location.href = "http://" + window.location.host + "/"; //해쉬URL정보 클리어
	<%
	}
	else {
	%>
		sessionStorage.setItem("authValue", "<%= authValue %>");
	<%
	}
	%>
</script>

</head>
<body class="behind-bg">
	<div class="Themewindow"
		style="display: none; text-align: left; cursor: default;">
		<div class="Themetop">
			<span class="icon i-20 opticon opticon-theme align-middle"
				style="margin-right: 6px;"></span>테마 선택<span
				class="icon i-20 icon-cancel align-middle float-r sp"
				style="cursor: pointer; margin: 10px 6px 0px 0px"></span>
		</div>
		<div class="Themebody" style="display: none;">
			<ul class="Themelist" style="cursor: pointer">
				<li class="Themeli Redwine" themeId="Redwine"><span id="lg"></span></li>
				<li class="Themeli Professionalblue" themeId="Professional Blue"><span
					id="cdn"></span></li>
				<li class="Themeli Thebuttons" themeId="The buttons"><span
					id="pts"></span></li>
				<li class="Themeli Cloudy" themeId="Cloudy"><span id="t820"></span></li>
			</ul>
		</div>
	</div>

	<div class="Mon">

		<div class="Box navi-bg">
			<div id="head">
				<div id="Top">
					<!--
					<a id="Topbg"></a><a href="/index.mon"><span id="logobg"></span></a><span
						id="top_leaf"></span><span id="rightlogo"></span><span
						id="TopText" class="Top-ft">Specialized in CRM/DB Marketing
						Solution</span>
					2024.02.15 삭제 -->
					<div class=logo-wrap>
						<a href="/"><h1 class="logo"><em class="blind">SERICEO</em></h1></a>
						<span class="ui-site"></span>
					</div>
					<div class="logoutarea">
						<span class="ui-username"></span>
						<a href="#" class="icon s-20 settings opticon-config"></a>
<!-- 					<span class="icon i-20 opticon opticon-chrome align-middle"></span> -->
<!-- 					<span class="icon i-20 opticon opticon-theme align-middle"></span> -->
						<a href="#" class="icon s-20 logout opticon-logout"></a>
<!-- 					<span class="icon i-20 opticon opticon-help align-middle"></span> -->
					</div>
				</div>
			</div>

			<div class="Topbar behind-bg"></div>

			<div id="TopMenu"></div>
			
			<div class="Holder">

				<!-- 2024.02.20 삭제
				<div class="Title Title-bg b-t b-r b-b b-l b-co b-co-outer">
					
					<div class="centering_left">
						<span class="icon i-20 icon-title align-middle"></span> <span
							id="TbName" class="Title-ft align-middle"></span>
					</div>
				</div> -->

				<div id="Flowtop"></div>

				<div class="Content">
					<div class="left left-padding">
						<div id="LeftTopList"></div>
						<div id="LeftMainList"></div>
						<div id="LeftMainView"></div>
						<div id="LeftBottomView"></div>
					</div>

					<div class="Wraper Wraper-padding">
						<div class="main">
							<div id="TopList"></div>
							<div id="MainList"></div>
							<div id="MainView"></div>
							<div id="BottomView"></div>
						</div>
					</div>
				</div>

			</div>
		</div>

		<div id="Footer" class="Footer-bg Footer-ft">
			<!-- <span class="align-middle">copyright ⓒ<b>2024 공영DBM.</b> All Rights Reserved.</span> -->
			<span class="align-middle">copyright ⓒ<b>2024 SERICEO.</b> All Rights Reserved.</span>
		</div>

	</div>

</body>
</html>
