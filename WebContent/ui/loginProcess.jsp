<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ page import="co.kr.kydbm.core.bean.UserInfo"%>
<%@ page import="co.kr.kydbm.core.bean.ResultInfo"%>
<%@ page import="co.kr.kydbm.common.CommonConst"%>

<%
	ResultInfo resultInfo = (ResultInfo) request.getAttribute(CommonConst.RESULT_INFO);
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport"
	content="width=device-width, initial-scale=0.7, minimum-scale=0.4, maximum-scale=3">

<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta http-equiv="X-FRAME-OPTIONS" content="DENY" />

<link rel="apple-touch-icon" href="MonArch-blue57x57.ico" />
<link rel="shortcut icon" href="favicon.ico" />
<title>::: SERICEO CRM :::</title>
<!-- <link id="CSSlink" type="text/css" href="css/Theme_Redwine.css" rel="stylesheet" /> -->
<link id="CSSlink" type="text/css" href="css/Theme_CEO.css" rel="stylesheet" />
<link type="text/css" href="css/Common.css" rel="stylesheet" />
<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
<script type="text/javascript" src="js/jquery.kdb.MonArch800.js"></script>
<script type="text/javascript" src="js/MonLogin.js"></script>

<script type="text/javascript">
<% 
if ( resultInfo != null ) { 
	if ( resultInfo.getErrorCode() != null && resultInfo.getMessage() != null ) {
%>
		alert("<%= (resultInfo.getErrorCode() != "E0009" ) ? resultInfo.getMessage() : "" %>");
<% 
	}
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
					<a id="Topbg"></a><a href="/monform.htm"><span id="logobg"></span></a><span
						id="top_leaf"></span><span id="rightlogo"></span><span
						id="TopText" class="Top-ft">Specialized in CRM/DB Marketing
						Solution</span>
				</div>
			</div>

			<div class="Topbar behind-bg"></div>

			<div id="TopMenu"></div>
			<div id="SubMenu">
				<a id="Subtab" class="icon-tab"></a><a id="menupin"
					class="unpin-menu"></a><a id="MonArch" class="deco-monarch"></a>
			</div>

			<div class="Holder">

				<div class="Title Title-bg b-t b-r b-b b-l b-co b-co-outer">
					<div class="centering_right">
						<div class="logoutarea">
							<div>
								<span class="ui-username align-middle Title-ft"></span>
							</div>
							<div class="iconset align-middle">
								<span class="icon i-20 opticon opticon-config align-middle"></span>
								<span class="icon i-20 opticon opticon-chrome align-middle"></span>
								<span class="icon i-20 opticon opticon-theme align-middle"></span>
								<span class="icon i-20 opticon opticon-logout align-middle"></span>
								<span class="icon i-20 opticon opticon-help align-middle"></span>
							</div>
						</div>
					</div>
					<div class="centering_left">
						<span class="icon i-20 icon-title align-middle"></span> <span
							id="TbName" class="Title-ft align-middle"></span>
					</div>
				</div>

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
			<span class="align-middle">copyright ⓒ<b>2024 SERICEO.</b> All
				Rights Reserved.
			</span>
		</div>

	</div>

</body>
</html>
