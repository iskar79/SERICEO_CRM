<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ page import="co.kr.kydbm.core.bean.ResultInfo"%>
<%@ page import="co.kr.kydbm.common.CommonConst"%>

<%
	ResultInfo resultInfo = (ResultInfo) request.getAttribute(CommonConst.RESULT_INFO);
%>

<!-- 20261030 khma : 보안 취약점 개선을 위해 jQuery 1.10.2 -> 1.12.4로 업그레이드 -->
<!-- <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script> -->
<script type="text/javascript" src="js/jquery-1.12.4.min.js"></script>

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
// 로그아웃 요청 처리 및 로그인 화면 리다이렉트
$(document).ready(function () {
	$.ajax({
        type: "POST",
        url: "logoutProcess.mon",
        data: "",
        success: function (data) {
        	alert("로그아웃 되었습니다.");
            window.location.href = "http://" + window.location.host + "/"; // 해시 URL 클리어 및 로그인 화면 이동
        },
        error: function (data) {
        	alert(data.resultInfo.message);
        }
    });
});
</script>
