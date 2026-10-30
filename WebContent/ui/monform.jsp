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
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="apple-touch-icon" href="MonArch-blue57x57.ico" />
<title>::: SERICEO CRM :::</title>

<!-- 테마 및 공통 스타일시트 -->
<link id="CSSlink" type="text/css" href="css/Theme_CEO.css" rel="stylesheet" />
<link type="text/css" href="css/Common.css" rel="stylesheet" />

<!-- 20261030 khma : 보안 취약점 개선 및 화면 엔진(superContaner.js) 렌더링 호환성을 위해 jQuery 1.10.2 -> 1.12.4로 업그레이드 -->
<!-- <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script> -->
<script type="text/javascript" src="js/jquery-1.12.4.min.js"></script>

<!-- CRM 공통 베이스 라이브러리 및 인증/유틸 -->
<script type="text/javascript" src="js/jquery.kdb.MonArch800.js"></script>

<!-- CRM 전역 네비게이션, 테마 및 SPA 라우팅 제어 -->
<script type="text/javascript" src="js/MonArch.js"></script>

<script type="text/javascript">
	$(document).ready(function() {

		// 브라우저 해시 변경 감지 및 SPA 히스토리 뒤로가기/앞으로가기 처리
		$(window).hashchange(function(e) {
			historyBackProc();
		});
		$(window).hashchange();

		// 테마 선택 창 토글
		$('.opticon-theme').click(function(e) {
			$.blockUI({
				message : $('.Themewindow')
			});
			$('.Themewindow, .Themebody').show();
		});

		// 테마 변경 이벤트
		$('.Themeli').click(function() {
			var className = $(this).attr('class');
			var css = className.substring(8, className.length);
			if (css == 'Thebuttons') {
				$('.cmdspan').css('border', '1px solid #B0B0B0');
			} else {
				$('.cmdspan').css('border', '1px solid transparent');
			}
			var cssUrl = '../css/Theme_' + css + '.css';
			changeTheme(cssUrl); // 테마 변경 실행
			$('.Themewindow').hide();
			$.unblockUI();
			$('.qtip').remove();
		});

		// 테마 툴팁 초기화
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
			});
		});

		// 테마 창 닫기
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
		window.location.href = "http://" + window.location.host + "/"; // 세션 만료 시 해시 URL 클리어 및 로그인 이동
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
	<!-- 테마 선택 레이어 팝업 -->
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

	<!-- CRM SPA 메인 컨테이너 -->
	<div class="Mon">

		<div class="Box navi-bg">
			<!-- 상단 헤더 영역 (로고, 사용자 정보, 환경설정, 로그아웃) -->
			<div id="head">
				<div id="Top">
					<div class="logo-wrap">
						<a href="/"><h1 class="logo"><em class="blind">SERICEO</em></h1></a>
						<span class="ui-site"></span>
						<span class="ui-top-label"></span>
						<span class="ui-corp"></span>
						<span class="ui-corpsave"></span>
					</div>
					<div class="logoutarea">
						<span class="ui-username"></span>
						<a href="#" class="icon s-20 settings opticon-config" title="환경설정"></a>
						<a href="#" class="icon s-20 logout opticon-logout" title="로그아웃"></a>
					</div>
				</div>
			</div>

			<div class="Topbar behind-bg"></div>

			<!-- 상단 대메뉴 네비게이션 바 -->
			<div id="TopMenu"></div>
			
			<!-- 메인 업무 화면 컨테이너 (좌측/중앙 9대 레이아웃 분할 구조) -->
			<div class="Holder">

				<div id="Flowtop"></div>

				<div class="Content">
					<!-- 좌측 패널 (트리/목록/뷰) -->
					<div class="left left-padding">
						<div id="LeftTopList"></div>
						<div id="LeftMainList"></div>
						<div id="LeftMainView"></div>
						<div id="LeftBottomView"></div>
					</div>

					<!-- 중앙 메인 패널 (그리드/상세폼/하단뷰) -->
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

		<!-- 하단 푸터 영역 -->
		<div id="Footer" class="Footer-bg Footer-ft">
			<span class="align-middle">copyright ⓒ<b>2024 SERICEO.</b> All Rights Reserved.</span>
		</div>

	</div>

</body>
</html>
