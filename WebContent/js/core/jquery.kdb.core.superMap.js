/* jQuery grid plugin:
* version 2.0 2026-11-10
* Requires jQuery v1.12.4 or later
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* Authors: Ma KyoungHo
* Company : KYDBM
*/

// 20261110 khma : superContaner.js 지도(superMap) 컴포넌트 모듈 분리 추출 (js/core 표준 구조 적용)
(function ($) {
  if (!$.fn.superContaner) {
    if (window.console && console.error) {
      console.error(
        "[ERROR] jquery.kdb.superContaner 플러그인이 로드되지 않았습니다. jquery.kdb.core.superMap.js는 superContaner.js 이후에 로드되어야 합니다."
      );
    }
    return;
  }

  if (!$.fn.superContaner.mapMethods) {
    $.fn.superContaner.mapMethods = {};
  }

  $.extend($.fn.superContaner.mapMethods, {
    /*
     * ------------------------------------------------------- Map
     * --------------------------------------------------------
     */
    superMap: function (option, px, py, ptitle) {
      var _Obj = $(this);
      // _Obj.html('');
      var _jsonName = option;
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
      _Obj
        .data("jsonData", option)
        .removeClass()
        .addClass("SuperContaner SuperMap");
      /* ----------------------------------------------------------------------------- */
      // 외곽디자인 구성
      /* ----------------------------------------------------------------------------- */
      var _head = $("<div class='head'></div>").appendTo(_Obj);
      /* ----------------------------------------------------------------------------- */
      // 작업버턴영역 생성
      /* ----------------------------------------------------------------------------- */
      var _jobArea = $("<div class='jobArea jobArea-bg'></div>").appendTo(
        _head
      );
      var _Btnset = $("<div class='buttonset'></div>").appendTo(_jobArea);
      _Obj.makeButtons(_jobArea);
      /*
       * //20140926 jwkim start var _jobArea = $("<div class='jobArea
       * jobArea-bg'><div class='buttonset'></div></div>").appendTo(_head);
       * $.each(option.jobs, function(index, value) { if (value ==
       * undefined) return; $("<span class='cmdicon icon i-20 '></span>").appendTo(_cmdspan).addClass(value.css).attr("index",
       * value.index); $("<input type='button' class='cmdbtn cmdspan-ft'
       * />").appendTo(_cmdspan) .attr("value", value.name) .attr("index",
       * value.index) .attr("inComm", value.inComm != undefined ?
       * value.inComm : ""); });
       */ // 20140926 jwkim end
      /* ----------------------------------------------------------------------------- */
      // Body생성
      /* ----------------------------------------------------------------------------- */
      /*
       * var _AddressFind = $("<div class='AddressFind'></div>").appendTo(_Obj);
       * var _img = $("<span class='icon i-20 icon-search '></span>").appendTo(_AddressFind);
       * var _span = $("<span class='pinset'></span>").appendTo(_AddressFind);
       * _span.css('width', '100%');
       *
       * var _o = $("<a>find : </a><input class='input-bg input-ft b-t
       * b-r b-b b-l b-co b-co-basic' type='text' value=''
       * />").appendTo(_span); _img.click(function(e) { var _adf =
       * $(this).parents('.AddressFind'); var _addData = $("input",
       * _adf).val(); _Obj.superContaner("MapAddressSetMark", _addData,
       * "찾기");
       *
       * });
       */
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

      // if (option.mapmode == 'listview') {
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
        // 체크박스가 변경될때 새로 검색하도록 액션을 넣는다.

        mapChkBox.change(function () {
          if ($(this).is(":checked")) {
            // 해당하는 맵을 표시할것
            _Obj.superContaner("MapList", $(this).attr("mapId"));
          } else {
            // 해당하는 맵을 숨길것
            // _Obj.superContaner("MapDeleteOverlays",
            // $(this).attr("name"));
            _Obj.superContaner("MapDeleteOverlays", $(this).attr("mapId"));
          }
        });

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

        // 디폴트 체크 기능 표시
        if (value.defaultValue == "1") {
          mapChkBox.attr("checked", "checked");
        }
        // 맵 상세정보 표시 뷰JSON
        if (undefined != value.viewJson) {
          if (undefined != value.viewJson.jsonName)
            mapChkBox.attr("viewJson", value.viewJson.jsonName);
          if (undefined != value.viewJson.height)
            mapChkBox.attr("infoWindowHeight", value.viewJson.height);
          if (undefined != value.viewJson.width)
            mapChkBox.attr("infoWindowWidth", value.viewJson.width);
        }
      });
      // }
      /* ----------------------------------------------------------------------------- */
      // Map생성
      /* ----------------------------------------------------------------------------- */
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

      if (px == undefined || py == undefined) {
        px = 37.525201; // 서울
        py = 127.027152;
        // px = 35.0645741953;
        // py = 127.746749878;
      }
      /*
       * 위치좌표가 현재 타이밍에서 취득이 안됨.//TODO if ( navigator.geolocation ) {
       * navigator.geolocation.getCurrentPosition(function(position){ posX =
       * position.coords.latitude; posY = position.coords.longitude;
       * alert(posX+"/"+posY + ": 현위치"); });
       *  }
       */
      var myLatlng = new google.maps.LatLng(px, py);
      var myOptions = {
        zoom: 11, // 12
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      map = new google.maps.Map(
        document.getElementById("map_canvas"),
        myOptions
      );

      var markers = [];
      _Obj.data("map", map);
      _Obj.data("markers", markers);

      /*
       * if (option.isClickMarker) { google.maps.event.addListener(map,
       * 'click', function(event) { _Obj.superContaner("MapAddMarker",
       * event.latLng, "추가");
       *
       * }); }
       *
       *
       * if (ptitle != undefined) { _Obj.superContaner("MapXyAddMarker",
       * px, py, ptitle); }
       */

      /* ----------------------------------------------------------------------------- */
      // status생성
      /* ----------------------------------------------------------------------------- */
      var _status = $("<div class='status'>status</div>").appendTo(_Obj);

      // 필터표시여부 결정
      $(".jobArea", _Obj).toggle(
        option.isShowjobArea == undefined ? true : option.isShowjobArea
      );
      $(".mapChkArea", _Obj).toggle(
        option.isShowMapChkArea == undefined ? true : option.isShowMapChkArea
      );
      $(".status", _Obj).toggle(option.isShowStatus);
      $(".AddressFind", _Obj).toggle(option.isShowAddressFind);

      _Obj.superContaner("MapList");
    },
    MapList: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");

      var infoWindow = new google.maps.InfoWindow();
      google.maps.event.addListener(_map, "click", function () {
        infoWindow.close();
      });

      // 맵수만큼 반복하여 표시함
      $(".mapChkArea input[type='checkbox']", _Obj).each(function (
        index,
        value
      ) {
        // 맵의 경우는 최초 맵을 모두 가져옴
        // if (mapname == undefined || mapname ==
        // $(this).attr("name")) {
        if ($(this).is(":checked")) {
          // alert('맵수만큼 반복!!! : ' +
          // $(this).attr("name"));
          var pl = new JSONClientParameters();
          pl.add("service", $(this).attr("service"));
          pl.add("method", $(this).attr("methodList"));
          pl.add("appType", option.appType);
          pl.add("pFormNo", option.pFormNo);
          pl.add("mapTargetFieldId", $(this).attr("mapId"));
          pl.add("execType", "MAPLIST");

          /*
           * var markerParam = new
           * JSONClientParameters();
           * markerParam.add("mapId",
           * $(this).attr("mapId"));
           * markerParam.add("mapname",
           * $(this).attr("name"));
           * markerParam.add("isMoveCenter",
           * $(this).attr("isMoveCenter"));
           *
           * markerParam.add("image",
           * $(this).attr("image"));
           * markerParam.add("shadow",
           * $(this).attr("shadow"));
           * markerParam.add("viewJson",
           * $(this).attr("viewJson"));
           * markerParam.add("infowindowHeight",
           * $(this).attr("infowindowHeight"));
           * markerParam.add("infowindowWidth",
           * $(this).attr("infowindowWidth"));
           * markerParam.add("isShowInfoWindow",
           * $(this).attr("isShowInfoWindow"));
           */
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

          PostJsonData(
            _M.svcUrl[_M.Webtype].crudUrl,
            pl,
            function (_data) {
              // alert(_data.Table.Rows.length);

              if (_data.resultData.length > 0) {
                $.each(_data.resultData, function (index, row) {
                  // alert(index+":"+
                  // row['address']);
                  // 좌표를
                  // 가지고
                  // 마커를
                  // 표시한다.
                  // _Obj.superContaner("MapAddressSetMark",
                  // row['address'],
                  // row['title']
                  // + ':'
                  // +
                  // row['address']);
                  /*
                   * refactoring
                   * start
                   */

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
              } else {
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

    // 주소를 가지고 위치정보를 파악해서 콜백처리한다
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
    // 주소를 가지고 마크를 표시한다.
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

    // 좌표를 가지고 마크를 표시한다.
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
    MapAddMarker: function (
      location,
      title,
      keyValue,
      markerParam,
      infoWindow
    ) {
      // _Obj = $(this);
      _Obj = $(".SuperMap");
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      if (
        null != _json &&
        undefined != _json.isClickMarker &&
        _json.isClickMarker
      ) {
        _Obj.superContaner("MapDeleteOverlays");
      }
      // Create our "tiny" marker icon
      var imageName = "red-dot.png"; // 디폴트 빨강 마커
      var shadowName = "msmarker.shadow.png"; // 디폴트 마커쉐도우

      if (undefined != markerParam) {
        if (undefined != markerParam.image) {
          imageName = markerParam.image + ".png";
        }
        if (undefined != markerParam.shadow) {
          shadowName = markerParam.shadow + ".png";
        }
      }

      var image = new google.maps.MarkerImage(
        "image/map/" + imageName,
        // This marker is 20 pixels wide by 32 pixels tall.
        new google.maps.Size(30, 32),
        // The origin for this image is 0,0.
        new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at 0,32.
        new google.maps.Point(0, 32)
      );
      var shadow = new google.maps.MarkerImage(
        "image/map/" + shadowName,
        // The shadow image is larger in the horizontal dimension
        // while the position and offset are the same as for the main image.
        new google.maps.Size(37, 32),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 32)
      );

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

      // if(markerParam != undefined && markerParam.isMoveCenter == true){
      if (markerParam == undefined || markerParam.isMoveCenter == true) {
        _map.setCenter(location);
      }
      _Obj.data("markers", _markers);

      if (null != _json && _json.isDrag) {
        google.maps.event.addListener(marker, "dragend", function () {
          // alert('Drag ended');
          // geocodePosition(marker.getPosition());
        });
      }
    },

    mapOpenInfoWindow: function (map, obj, marker, infoWindow) {
      var iWndWidth = 600;
      var iWndHeight = 400;
      if (marker.infowindowWidth != undefined)
        iWndWidth = marker.infowindowWidth;
      if (marker.infowindowHeight != undefined)
        iWndHeight = marker.infowindowHeight;

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
      google.maps.event.addListener(infoWindow, "domready", function () {
        $("#mapinfo").empty();
        $("#mapinfo").superContaner("superView", marker.viewJson);
        $("#mapinfo").superContaner("Read", marker.keyValue);
      });
    },

    MapSetAll: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");

      for (var i = 0; i < _markers.length; i++) {
        // 맵네임이 파라메터로 제공되지 않을경우는 전체맵을 클리어하고, 제공되어있는 경우는 제공된 맵네임만 클리어
        if (mapId == undefined || mapId == _markers[i].mapId) {
          _markers[i].setMap(_map);
        }
      }
    },
    // Removes the overlays from the map, but keeps them in the array.
    MapClearOverlays: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      for (var i = 0; i < _markers.length; i++) {
        // 맵네임이 파라메터로 제공되지 않을경우는 전체맵을 클리어하고, 제공되어있는 경우는 제공된 맵네임만 클리어
        if (mapId == undefined || mapId == _markers[i].mapId) {
          _markers[i].setMap(null);
        }
      }
    },
    // Deletes all markers in the array by removing references to them.
    MapDeleteOverlays: function (mapId) {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      _newMarkers = new Array();
      _Obj.superContaner("MapClearOverlays", mapId);
      _newMarkers.length = 0;
      cnt = 0;
      for (var i = 0; i < _markers.length; i++) {
        // 맵네임이 파라메터로 제공되지 않을경우는 전체맵을 클리어하고, 제공되어있는 경우는 제공된 맵네임만 클리어
        if (mapId != undefined && mapId != _markers[i].mapId) {
          _newMarkers[cnt] = _markers[i];
          cnt++;
        }
      }
      _Obj.data("markers", _newMarkers);
    },
    MapDeleteMark: function () {
      _Obj = $(this);
      _json = _Obj.data("jsonData");
      _map = _Obj.data("map");
      _markers = _Obj.data("markers");
      _Obj.data("markers", _markers);
    },
  });
})(jQuery);
