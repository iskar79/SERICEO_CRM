/* jQuery grid plugin:
* version 2.0 2026-11-10
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

/**
 * MonArch CRM 지도(SuperMap) 렌더링 및 마커 제어 코어 모듈
 *
 * [모듈 개요]
 * - 기존 jquery.kdb.superContaner.js 내부에 포함되어 있던 지도(Google Maps v3 연동) 관련
 *   메서드 11종을 독립 모듈(js/core/jquery.kdb.core.superMap.js)로 분리한 파일이다.
 * - $.fn.superContaner.mapMethods 네임스페이스에 메서드를 등록하며,
 *   호출 시 superContaner 본체 디스패처에서 본 모듈의 메서드로 위임(apply) 실행된다.
 *
 * [제공 메서드 목록 (총 11종)]
 * 1. superMap           : 지도 컨테이너(SuperMap) 초기 레이아웃, 카테고리 체크박스 및 Google Map 인스턴스 생성
 * 2. MapList            : 체크된 지도 카테고리별 백엔드 목록 조회(MAPLIST) 및 주소 기반 마커 일괄 렌더링
 * 3. MapGetGeocoder     : 주소 문자열을 Google Geocoder API로 변환하여 위·경도 좌표(LatLng) 콜백 반환
 * 4. MapAddressSetMark  : 주소 문자열을 지오코딩한 후 해당 위치에 마커(MapAddMarker) 생성
 * 5. MapXyAddMarker     : 위도(x)·경도(y) 수치 좌표를 기반으로 즉시 마커 생성
 * 6. MapAddMarker       : 지도 객체에 커스텀 아이콘/ 그림자 마커를 추가하고 클릭 시 상세 InfoWindow 이벤트 바인딩
 * 7. mapOpenInfoWindow  : 마커 클릭 시 말풍선(InfoWindow) 팝업 내부에 superView 상세 화면을 동적으로 렌더링
 * 8. MapSetAll          : 보관 중인 마커 배열을 전체 또는 특정 mapId 기준으로 지도에 다시 표시
 * 9. MapClearOverlays   : 마커 배열 데이터는 유지한 채 지도 화면상의 오버레이(마커)만 숨김 처리
 * 10. MapDeleteOverlays : 특정 mapId(또는 전체) 마커를 지도에서 숨기고 내부 마커 배열에서도 제거
 * 11. MapDeleteMark     : 현재 컨테이너의 마커 배열 참조 상태를 재동기화
 */
// 20261110 khma : superContaner.js 지도(superMap) 컴포넌트 모듈 분리 추출 및 상세 주석 보강
(function ($) {
  // 20261110 khma : 상위 플러그인(superContaner) 선행 로드 여부 검증
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superMap.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  // 20261110 khma : 지도 전용 메서드 네임스페이스 초기화
  if (!$.fn.superContaner.mapMethods) {
    $.fn.superContaner.mapMethods = {};
  }

  $.extend($.fn.superContaner.mapMethods, {
    /**
     * 지도 컨테이너(SuperMap) 폼을 초기화하고 카테고리 필터 영역 및 Google Maps 캔버스를 생성한다.
     *
     * @param {string|Object} option 화면 구조체 JSON 명칭 또는 구조체 옵션 객체
     * @param {number} [px] 초기 중심 위도 (미지정 시 서울 기본 좌표 37.525201 적용)
     * @param {number} [py] 초기 중심 경도 (미지정 시 서울 기본 좌표 127.027152 적용)
     * @param {string} [ptitle] 초기 마커 타이틀
     */
    superMap: function (option, px, py, ptitle) {
      var _Obj = $(this);
      var _jsonName = option;

      // 1. 문자열 형태로 구조체명이 전달된 경우 서버/캐시에서 JSON 설정 객체를 로드한다.
      if (typeof _jsonName == "string") {
        option = GETJSON(_jsonName);
        $(this).attr("jsonName", _jsonName);
      }
      if (option == undefined) {
        option = eval(_jsonName);
      }
      if (option == undefined) {
        option = viewOption;
      }

      // 2. 컨테이너 DOM에 구조체 옵션을 바인딩하고 SuperMap 표준 클래스를 부여한다.
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperMap");

      // 3. 상단 헤더(.head) 및 작업 버튼 영역(.jobArea)을 생성한다.
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      var _jobArea = $("<div class='jobArea jobArea-bg'></div>").appendTo(
        _head
      );
      var _Btnset = $("<div class='buttonset'></div>").appendTo(_jobArea);
      _Obj.makeButtons(_jobArea);

      // 4. 본문 영역(.body)을 생성하고 화면 높이(bodyHeight 또는 브라우저 창 높이 기준 최소 800px)를 설정한다.
      var _body = $("<div class='body body-bg'></div>").appendTo(_Obj);
      if (option.bodyHeight != undefined) {
        _body.css("min-height", option.bodyHeight);
      } else {
        var _bdyheight = $(window).height();
        if (_bdyheight * 1 < 800) {
          _bdyheight = 800;
        }
        _body.css("height", _bdyheight);
      }

      // 5. 좌측 지도 카테고리 선택 영역(.mapChkArea) 및 개별 카테고리 체크박스를 구성한다.
      var _mapchkArea = $("<div class='mapChkArea'></div>").appendTo(_body);
      $("<div class='mapTitle mapDiv'>Map Category</div>").appendTo(
        _mapchkArea
      );

      $.each(option.maps, function (index, value) {
        if (value == undefined) return;
        checkBoxid = "mapcheck" + formCID++;
        var _mapChkSpan = $("<div class='selectArea'></div>").appendTo(
          _mapchkArea
        );
        var mapChkBox = $(
          "<input type='checkbox' value='1' id='" +
            checkBoxid +
            "'  /><label style='color:white' for='" +
            checkBoxid +
            "'>" +
            value.name +
            "</label>"
        )
          .appendTo(_mapChkSpan)
          .css("width", "auto");

        // 카테고리 체크박스 상태 변경 시: 체크되면 해당 카테고리 마커를 조회하고, 해제되면 지도에서 제거한다.
        mapChkBox.change(function () {
          if ($(this).is(":checked")) {
            _Obj.superContaner("MapList", $(this).attr("mapId"));
          } else {
            _Obj.superContaner("MapDeleteOverlays", $(this).attr("mapId"));
          }
        });

        // 카테고리별 CRUD 서비스/메서드 메타데이터를 체크박스 속성(attr)에 바인딩한다.
        mapChkBox.attr("service", value.service);
        if (value.method.Create != undefined) {
          mapChkBox.attr("methodCreate", value.method.Create);
        }
        if (value.method.List != undefined) {
          mapChkBox.attr("methodList", value.method.List);
        }
        if (value.method.Read != undefined) {
          mapChkBox.attr("methodRead", value.method.Read);
        }
        if (value.method.Update != undefined) {
          mapChkBox.attr("methodUpdate", value.method.Update);
        }
        if (value.method.Delete != undefined) {
          mapChkBox.attr("methodDelete", value.method.Delete);
        }
        if (value.isMoveCenter != undefined) {
          mapChkBox.attr("isMoveCenter", value.isMoveCenter);
        }

        // 마커 색상 이미지(red-dot, blue-dot 등)에 맞춰 카테고리 라벨 배경색을 설정한다.
        if (undefined != value.css) {
          if (undefined != value.css.image) {
            mapChkBox.attr("image", value.css.image);

            switch (value.css.image) {
              case "red-dot":
                _mapChkSpan.css("background-color", "#ff7a6b");
                break;
              case "pink-dot":
                _mapChkSpan.css("background-color", "#e661ac");
                break;
              case "blue-dot":
                _mapChkSpan.css("background-color", "#6e98ff");
                break;
              case "green-dot":
                _mapChkSpan.css("background-color", "#00e64d");
                break;
              case "ltblue-dot":
                _mapChkSpan.css("background-color", "#67dddd");
                break;
              case "yellow-dot":
                _mapChkSpan.css("background-color", "#FFD700");
                break;
              case "purple-dot":
                _mapChkSpan.css("background-color", "#8e67fd");
                break;
              case "orange-dot":
                _mapChkSpan.css("background-color", "#ff9900");
                break;
              default:
                _mapChkSpan.css("background-color", "#ff7a6b");
                break;
            }
          }
          if (undefined != value.css.shadow) {
            mapChkBox.attr("shadow", value.css.shadow);
          }
        }

        mapChkBox.attr("service", value.service);
        mapChkBox.attr("name", value.name);
        mapChkBox.attr("isShowInfoWindow", value.isShowInfoWindow);
        mapChkBox.attr("mapId", value.mapId);

        // 초기 기본 선택 여부(defaultValue == "1") 적용
        if (value.defaultValue == "1") {
          mapChkBox.attr("checked", "checked");
        }
        // 마커 클릭 시 말풍선(InfoWindow)에 띄울 상세 뷰(viewJson) 및 팝업 크기 정보를 저장한다.
        if (undefined != value.viewJson) {
          if (undefined != value.viewJson.jsonName)
            mapChkBox.attr("viewJson", value.viewJson.jsonName);
          if (undefined != value.viewJson.height)
            mapChkBox.attr("infoWindowHeight", value.viewJson.height);
          if (undefined != value.viewJson.width)
            mapChkBox.attr("infoWindowWidth", value.viewJson.width);
        }
      });

      // 6. 실제 지도가 그려질 캔버스(#map_canvas)를 생성하고 가로·세로 크기를 계산한다.
      var _map = $("<div  id='map_canvas'></div>").appendTo(_body);

      if (option.bodyHeight != undefined) {
        _map.css("min-height", option.bodyHeight - 10);
      } else {
        var _bdyheight = _map.parent().height();
        _map.css("height", _bdyheight - 10);
      }
      if (option.bodyWidth != undefined) {
        _map.css("width", option.bodyWidth - 84);
      } else {
        var _bdyWidth = _map.parent().width();
        if (option.isShowMapChkArea) {
          _map.css("width", _bdyWidth - 212);
        } else {
          _map.css("width", _bdyWidth - 84);
        }
      }

      // 브라우저 창 크기 조절 시 지도 캔버스 너비·높이를 반응형으로 재조정한다.
      $(window).resize(function () {
        if (option.bodyHeight != undefined) {
          _map.css("min-height", option.bodyHeight - 10);
        } else {
          var _bdyheight = _map.parent().height();
          _map.css("height", _bdyheight - 10);
        }
        if (option.bodyWidth != undefined) {
          _map.css("width", option.bodyWidth);
        } else {
          var _bdyWidth = _map.parent().width();
          if (option.isShowMapChkArea) {
            _map.css("width", _bdyWidth - 212);
          } else {
            _map.css("width", _bdyWidth - 84);
          }
        }
      });

      // 7. 초기 중심 좌표 설정 (전달된 위·경도가 없으면 서울 기본 좌표 적용)
      if (px == undefined || py == undefined) {
        px = 37.525201; // 서울 기본 위도
        py = 127.027152; // 서울 기본 경도
      }

      var myLatlng = new google.maps.LatLng(px, py);
      var myOptions = {
        zoom: 11,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      // Google Maps 인스턴스를 초기화하고 컨테이너 data 영역에 지도 객체와 마커 배열을 저장한다.
      map = new google.maps.Map(
        document.getElementById("map_canvas"),
        myOptions
      );

      var markers = [];
      _Obj.data("map", map);
      _Obj.data("markers", markers);

      // 8. 하단 상태 표시줄(.status) 생성 및 옵션에 따른 각 영역 노출 여부 제어
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".mapChkArea", _Obj).toggle(
        option.isShowMapChkArea == undefined ? true : option.isShowMapChkArea
      );
      $(".status", _Obj).toggle(option.isShowStatus);
      $(".AddressFind", _Obj).toggle(option.isShowAddressFind);

      // 9. 초기 체크된 카테고리에 대한 마커 목록을 조회하여 지도에 표시한다.
      _Obj.superContaner("MapList");
    },

    /**
     * 체크된 지도 카테고리별로 백엔드 데이터를 조회(MAPLIST)하여 지도 위에 마커를 표시한다.
     *
     * @param {string} [mapId] 특정 지도 카테고리 ID (지정 여부와 관계없이 현재 체크된 카테고리를 순회 조회)
     */
    MapList: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");

      // 지도 빈 영역 클릭 시 열려 있는 말풍선(InfoWindow)을 닫도록 이벤트를 등록한다.
      var infoWindow = new google.maps.InfoWindow();
      google.maps.event.addListener(_map, "click", function () {
        infoWindow.close();
      });

      // 좌측 카테고리 체크박스 중 선택된 항목마다 비동기 목록 조회를 수행한다.
      $(".mapChkArea input[type='checkbox']", _Obj).each(function (
        index,
        value
      ) {
        if ($(this).is(":checked")) {
          var pl = new JSONClientParameters();
          pl.add("service", $(this).attr("service"));
          pl.add("method", $(this).attr("methodList"));
          pl.add("appType", option.appType);
          pl.add("pFormNo", option.pFormNo);
          pl.add("mapTargetFieldId", $(this).attr("mapId"));
          pl.add("execType", "MAPLIST");

          // 개별 카테고리의 마커 스타일 및 상세 팝업(InfoWindow) 설정 정보를 구성한다.
          var markerParam = {
            mapId: $(this).attr("mapId"),
            mapname: $(this).attr("name"),
            isMoveCenter: $(this).attr("isMoveCenter"),
            image: $(this).attr("image"),
            shadow: $(this).attr("shadow"),
            viewJson: $(this).attr("viewJson"),
            infowindowHeight: $(this).attr("infowindowHeight"),
            infowindowWidth: $(this).attr("infowindowWidth"),
            isShowInfoWindow: $(this).attr("isShowInfoWindow"),
          };

          // 백엔드 CRUD 엔드포인트로 지도 데이터 목록을 요청한다.
          PostJsonData(
            _M.svcUrl[_M.Webtype].crudUrl,
            pl,
            function (_data) {
              if (_data.resultData.length > 0) {
                // 조회된 각 행의 주소(address)를 기반으로 지오코딩 후 마커를 생성한다.
                $.each(_data.resultData, function (index, row) {
                  var address = row["address"];
                  var title = row["title"] + "\n" + row["fullAddress"];
                  var keyValue = row["keyValue"];
                  _Obj.superContaner(
                    "MapAddressSetMark",
                    address,
                    title,
                    keyValue,
                    markerParam,
                    infoWindow,
                    function (vposition) {}
                  );
                });
                // 목록 조회 후 후처리 콜백(afterListCallBack)이 정의되어 있으면 실행한다.
                if (_json.afterListCallBack != undefined) {
                  if (_json.appType == "monpaas") {
                    var afterListCallback = eval(
                      "(" + _json.afterListCallBack + ")"
                    );
                    afterListCallback(_Obj);
                  } else {
                    eval(_json.afterListCallBack)(_Obj);
                  }
                }
              }
            },
            function (response) {
              alert(response.Message);
            },
            _M.aSync.async
          );
        }
      });
    },

    /**
     * 주소 문자열을 Google Maps Geocoder로 조회하여 위·경도 위치 객체(geometry.location)를 콜백으로 반환한다.
     *
     * @param {string} address 조회할 주소 문자열
     * @param {string} title 마커 타이틀 문자열
     * @param {Function} callback 변환된 좌표(vposition)를 전달받을 콜백 함수 (실패 시 빈 문자열 전달)
     */
    MapGetGeocoder: function (address, title, callback) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = $(".body", _Obj).data("map");

      var geocoder = new google.maps.Geocoder();
      address = decodeURI(address);
      title = decodeURI(title);

      geocoder.geocode(
        {
          address: address,
        },
        function (results, status) {
          if (results != null) {
            var vposition = results[0].geometry.location;
            callback(vposition);
          } else {
            callback("");
          }
        }
      );
    },

    /**
     * 주소 문자열을 지오코딩하여 위·경도 좌표로 변환한 뒤 지도에 마커를 추가한다.
     *
     * @param {string} address 표시할 주소
     * @param {string} title 마커 툴팁 타이틀
     * @param {string} keyValue 마커 클릭 시 상세 조회(Read)에 사용할 레코드 키값
     * @param {Object} markerParam 마커 아이콘·그림자·InfoWindow 설정 객체
     * @param {Object} infoWindow Google Maps InfoWindow 인스턴스
     * @param {Function} [callbackFn] 후처리 콜백 함수
     */
    MapAddressSetMark: function (
      address,
      title,
      keyValue,
      markerParam,
      infoWindow,
      callbackFn
    ) {
      _Obj = $(this);
      _Obj.superContaner(
        "MapGetGeocoder",
        address,
        title,
        function (vposition) {
          if (vposition == "") return;
          _Obj.superContaner(
            "MapAddMarker",
            vposition,
            title,
            keyValue,
            markerParam,
            infoWindow
          );
        }
      );
    },

    /**
     * 위도(x)와 경도(y) 수치 좌표를 기반으로 Google Maps LatLng 객체를 생성하여 마커를 추가한다.
     *
     * @param {number} x 위도(Latitude)
     * @param {number} y 경도(Longitude)
     * @param {string} title 마커 툴팁 타이틀
     * @param {string} keyValue 상세 조회용 레코드 키값
     * @param {Object} markerParam 마커 스타일 및 팝업 설정 객체
     * @param {Object} infoWindow Google Maps InfoWindow 인스턴스
     */
    MapXyAddMarker: function (x, y, title, keyValue, markerParam, infoWindow) {
      _Obj = $(this);

      var location = new google.maps.LatLng(x, y);

      _Obj.superContaner(
        "MapAddMarker",
        location,
        title,
        keyValue,
        markerParam,
        infoWindow
      );
    },

    /**
     * 지도 인스턴스에 마커(Marker)를 생성하여 추가하고, 클릭 시 상세 InfoWindow 오픈 이벤트를 연결한다.
     *
     * @param {Object} location Google Maps LatLng 위치 객체
     * @param {string} title 마커 툴팁 타이틀
     * @param {string} keyValue 상세 화면 조회 키값
     * @param {Object} markerParam 마커 아이콘, 그림자, 중심 이동 여부, 연결 viewJson 정보
     * @param {Object} infoWindow Google Maps InfoWindow 인스턴스
     */
    MapAddMarker: function (
      location,
      title,
      keyValue,
      markerParam,
      infoWindow
    ) {
      _Obj = $(".SuperMap");
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");

      // 단일 클릭 마커 모드(isClickMarker)인 경우 기존 오버레이를 먼저 초기화한다.
      if (
        null != _json &&
        undefined != _json.isClickMarker &&
        _json.isClickMarker
      ) {
        _Obj.superContaner("MapDeleteOverlays");
      }

      // 1. 마커 아이콘 및 그림자 이미지 파일명을 결정한다 (기본값: red-dot.png / msmarker.shadow.png).
      var imageName = "red-dot.png";
      var shadowName = "msmarker.shadow.png";

      if (undefined != markerParam) {
        if (undefined != markerParam.image) {
          imageName = markerParam.image + ".png";
        }
        if (undefined != markerParam.shadow) {
          shadowName = markerParam.shadow + ".png";
        }
      }

      // 2. 마커 이미지 및 그림자 규격(Size, Point) 객체를 생성한다.
      var image = new google.maps.MarkerImage(
        "image/map/" + imageName,
        new google.maps.Size(30, 32),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 32)
      );
      var shadow = new google.maps.MarkerImage(
        "image/map/" + shadowName,
        new google.maps.Size(37, 32),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 32)
      );

      // 3. Google Maps Marker 인스턴스를 생성하고 마커 배열(_markers)에 추가한다.
      _markers = _Obj.data("markers");
      marker = new google.maps.Marker({
        position: location,
        map: _map,
        draggable: _json.isDrag == undefined ? false : _json.isDrag,
        title: title,
        mapId: markerParam != undefined ? markerParam.mapId : null,
        mapname: markerParam != undefined ? markerParam.mapname : null,
        icon: image,
        shadow: shadow,
        keyValue: keyValue,
        viewJson: markerParam != undefined ? markerParam.viewJson : null,
        infowindowHeight:
          markerParam != undefined ? markerParam.infowindowHeight : null,
        infowindowWidth:
          markerParam != undefined ? markerParam.infowindowWidth : null,
        json: _json,
      });

      _markers.push(marker);

      // 4. InfoWindow 표시 옵션(isShowInfoWindow == "true")이 켜져 있으면 마커 클릭 이벤트를 바인딩한다.
      if (markerParam != undefined) {
        if (
          markerParam.isShowInfoWindow != undefined &&
          markerParam.isShowInfoWindow == "true"
        ) {
          google.maps.event.addListener(marker, "click", function () {
            _Obj.superContaner(
              "mapOpenInfoWindow",
              _map,
              _Obj,
              $(this)[0],
              infoWindow
            );
          });
        }
      }

      // 5. 중심 이동 옵션(isMoveCenter)이 활성화된 경우 해당 마커 좌표로 지도 중심을 이동한다.
      if (markerParam == undefined || markerParam.isMoveCenter == true) {
        _map.setCenter(location);
      }
      _Obj.data("markers", _markers);

      if (null != _json && _json.isDrag) {
        google.maps.event.addListener(marker, "dragend", function () {});
      }
    },

    /**
     * 마커 클릭 시 말풍선(InfoWindow)을 열고 내부 컨테이너(#mapinfo)에 연결된 superView 상세 화면을 렌더링한다.
     *
     * @param {Object} map Google Maps 인스턴스
     * @param {jQuery} obj SuperMap 컨테이너 jQuery 객체
     * @param {Object} marker 클릭된 Marker 인스턴스 (viewJson 및 keyValue 보유)
     * @param {Object} infoWindow Google Maps InfoWindow 인스턴스
     */
    mapOpenInfoWindow: function (map, obj, marker, infoWindow) {
      var iWndWidth = 600;
      var iWndHeight = 400;
      if (marker.infowindowWidth != undefined)
        iWndWidth = marker.infowindowWidth;
      if (marker.infowindowHeight != undefined)
        iWndHeight = marker.infowindowHeight;

      // 기존 InfoWindow 이벤트 리스너를 정리하고 새 영역(#mapinfo)을 설정하여 오픈한다.
      google.maps.event.clearInstanceListeners(infoWindow);
      infoWindow.close();
      infoWindow.setContent(
        "<div id='mapinfo' style='width:" +
          iWndWidth +
          "px; height:" +
          iWndHeight +
          "px;'></div>"
      );
      infoWindow.open(map, marker);

      // 말풍선 DOM이 준비(domready)되면 superView 폼을 생성하고 마커의 keyValue로 단건 조회(Read)를 수행한다.
      google.maps.event.addListener(infoWindow, "domready", function () {
        $("#mapinfo").empty();
        $("#mapinfo").superContaner("superView", marker.viewJson);
        $("#mapinfo").superContaner("Read", marker.keyValue);
      });
    },

    /**
     * 보관 중인 마커 배열에서 전체 또는 특정 mapId에 해당하는 마커들을 지도 위에 다시 표시한다.
     *
     * @param {string} [mapId] 표시할 지도 카테고리 ID (미지정 시 전체 마커 표시)
     */
    MapSetAll: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");

      for (var i = 0; i < _markers.length; i++) {
        // mapId가 지정되지 않았거나 마커의 mapId와 일치하는 경우 지도 객체를 다시 연결한다.
        if (mapId == undefined || mapId == _markers[i].mapId) {
          _markers[i].setMap(_map);
        }
      }
    },

    /**
     * 마커 배열 데이터는 유지하면서 지도 화면상의 마커 오버레이만 숨김 처리(setMap(null))한다.
     *
     * @param {string} [mapId] 숨길 지도 카테고리 ID (미지정 시 전체 마커 숨김)
     */
    MapClearOverlays: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      for (var i = 0; i < _markers.length; i++) {
        if (mapId == undefined || mapId == _markers[i].mapId) {
          _markers[i].setMap(null);
        }
      }
    },

    /**
     * 특정 mapId(또는 전체)에 해당하는 마커를 지도 화면에서 숨기고 내부 마커 배열에서도 완전 삭제한다.
     *
     * @param {string} [mapId] 삭제할 지도 카테고리 ID (미지정 시 전체 마커 삭제)
     */
    MapDeleteOverlays: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      _newMarkers = new Array();

      // 1. 먼저 지도 화면에서 대상 마커 오버레이를 숨긴다.
      _Obj.superContaner("MapClearOverlays", mapId);
      _newMarkers.length = 0;
      cnt = 0;

      // 2. 삭제 대상이 아닌 다른 카테고리의 마커만 새 배열(_newMarkers)로 이관하여 보존한다.
      for (var i = 0; i < _markers.length; i++) {
        if (mapId != undefined && mapId != _markers[i].mapId) {
          _newMarkers[cnt] = _markers[i];
          cnt++;
        }
      }
      _Obj.data("markers", _newMarkers);
    },

    /**
     * 현재 컨테이너의 마커 배열 참조 상태를 재동기화한다.
     */
    MapDeleteMark: function () {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      _Obj.data("markers", _markers);
    },
  });
})(jQuery);
