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
<link rel="apple-touch-icon" href="MonArch-blue57x57.ico" />
<title>::: SERICEO CRM :::</title>

<!-- 테마 및 공통 스타일시트 -->
<link id="CSSlink" type="text/css" href="/css/Theme_CEO.css" rel="stylesheet" />
<link type="text/css" href="/css/Common.css" rel="stylesheet" />

<!-- 20261030 khma : 보안 취약점 개선을 위해 jQuery 1.10.2 -> 1.12.4로 업그레이드 -->
<!-- <script type="text/javascript" src="/js/jquery-1.10.2.min.js"></script> -->
<script type="text/javascript" src="/js/jquery-1.12.4.min.js"></script>

<!-- 로그인 처리 전용 스크립트 -->
<script type="text/javascript" src="/js/MonLogin.js"></script>

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
	<div class="login">
		<form id="loginForm" name="loginForm" method="post"></form>
		<div class="logo-img">
			<img src="/image/logo_CEO.png" alt="SERICEO Logo" />
			<p>CRM Login</p>
		</div>
		<div class="form">
			<input type="text" class="loginID" placeholder="아이디를 입력해 주세요">
			<input type="password" class="loginPS error" placeholder="비밀번호를 입력해 주세요">
			<p class="text error">※ 비밀번호는 대소문자를 구분합니다.</p>
		</div>
		<a href="#" class="loginBTN btn-login">로그인 하기</a>
		<span class="checkbox"><input type="checkbox" id="chk-save"><label for="chk-save">아이디 저장</label></span>
	</div>
</body>
</html>
