<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ page import="co.kr.kydbm.core.bean.ResultInfo"%>
<%@ page import="co.kr.kydbm.common.CommonConst"%>

<%
	ResultInfo resultInfo = (ResultInfo) request.getAttribute(CommonConst.RESULT_INFO);
%>

<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>

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
$(document).ready(function () {
	$.ajax({
        type: "POST",
        url: "logoutProcess.mon",
        data: "",
        success: function (data) {
        	alert("로그아웃 되었습니다.");
            window.location.href = "http://" + window.location.host + "/"; //해쉬URL정보 클리어
        },
        error: function (data) {
        	alert(data.resultInfo.message);
        }
    });
});
</script>