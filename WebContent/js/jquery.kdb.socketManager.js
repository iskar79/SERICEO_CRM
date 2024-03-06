
var kdbSocketManager = {
    ksock: '',
    connect: function () {
        var stdInfo = new JSONClientParameters();
        var socket = io.connect('http://xxx.xxx.xxx.xxx:3000', {
            query: stdInfo.toGetString()
            //'reconnect': true,
            // 'reconnection delay': 500,//default 500
            //'max reconnection attempts': 10
        });
        kdbSocketManager.ksock = socket;

        socket.on('connect', function () {
            //todo 인증성공시
            console.log('=======================================연결성공!!=====================================');

            //인증 성공시 유저리스트 받아옴.
            kdbSocketManager.ksock.emit('getMyFriends');
            //$('#Footer').chat('placeNotificationPopup');
        });
        socket.on('error', function (reason) {
            //todo 인증 실패시 처리
            console.log('=======================================연결실패!!=====================================');
        });
        socket.on('disconnect', function () {
            //todo 인증 실패시 처리
            //socket.emit('logout', {});
            //ert('접속 끊김!!');
            // $('#Footer').chat('placeNotificationPopup');
        });

        socket.on('new message', function (data) {
            //alert(data.msg);
            $('#Footer').chat('setNotificationPopupContents', data.msg);
        });

        socket.on('showMyFriends', function (type, data) {
            console.log(data);
            $('#Footer').chat("setChattingWindowContents", type, data);
        });

        socket.on('searchUser', function (type, data) {
            $('#Footer').chat("setChattingUserList", type, data);
        });

        socket.on('changeUserState', function (data) {
            //todo 사용자 정보가 변경됩니다.
            $('#Footer').chat("setChattingUserStatus", data);
        });


        socket.on('showShareBox', function (data) {
            //todo params = {type:'jsonView',uid:'', targetUserId:'', jsonName:'', searchKey:''}
            //todo 받은 sharebox정보를 분석하여 그에 따른 처리를 행한다.
            console.log(data);
            $('#Footer').chat('setConfirmPopupContents', data);
        });

        socket.on('chatMessage', function (data) {
            $('#Footer').chat('setChattingBoxContents', data);
        });

        /* socket.emit('auth', {key: _M.UserInfo.key, userName: _M.UserInfo.name}, function(rst){
        console.log(rst);
        }); */

        /* socket.on('new notification', function (result) {
        console.log(_M.UserInfo.key +'/'+ result.key);
        if(_M.UserInfo.key == result.key){
        alert(result.msg);
        }
        }); */

        //        socket.on('new message', function (result) {
        //            alert(result);
        //        });

        /* socket.on('test perform', function (result) {
        console.log('test perform:'+ result);
        //$('#performCnt')
        });		 */
        //			pl.add("service", 'MON_COMMON');
        //			pl.add("method", 'USER_MENUCODE_LIST');
        //			socket.emit('testCrmService', {params:pl.toJson(1)},function(rst){
        //				//
        //			});

        return this;
    },
    disconnect: function () {
        //disconnection처리시
        this.ksock.disconnect();
    },
    sendMessage: function (pMsg, pTargetId) {
        //sendMessage 메시지를 출력한다.
        this.ksock.emit('sendMessage', { msg: pMsg, targetId: pTargetId });
    },
    getMyFriends: function (callback) {
        //현재 라이브 상태인 유저목록을 취득한다.
        //this.ksock.emit('getLoginUserList', {}, function (data) {
        this.ksock.emit('getMyFriends', {}, function (data) {
            //todo 취득한 사용자 목록을 반환한다.
            console.log(data);
            //callback(data);
        });

    },
    sendShareBox: function (params) {
        //원하는 대상에게 shareBox호출
        //params = {type:'jsonView',params:{uid:'', targetUserId:'', jsonName:'', searchKey:''}}
        this.ksock.emit('sendShareBox', params);
    },
    showManager: function () {
        //todo 메니져를 표시한다.  
    },
    hideManager: function () {
        //todo 메니져를 숨긴다.  
    }
};
