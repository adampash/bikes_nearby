(function() {
  'use strict';
  var activateStation, animateTo, drawPath, dropMarker, embedMap, getEta, infowindow, map, mapStyle, marker, nearestStations, path, port, showInfoWindow, stationLatLng, youLatLng, zoomToFit;

  map = null;

  marker = null;

  youLatLng = null;

  stationLatLng = null;

  infowindow = null;

  path = null;

  mapStyle = [
    {
      featureType: "poi.school",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "poi.park",
      stylers: [
        {
          color: "#B5B4B3"
        }
      ]
    }, {
      featureType: "poi.attraction",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#969696"
        }
      ]
    }, {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#969696"
        }
      ]
    }, {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#FAFAFA"
        }
      ]
    }, {
      featureType: "poi.sports_complex",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#B5B4B3"
        }
      ]
    }, {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#000000"
        }, {
          visibility: "off"
        }
      ]
    }, {
      featureType: "landscape.man_made",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "poi.medical",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "poi.government",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "administrative",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "poi.place_of_worship",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "landscape.natural",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "poi.attraction",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#D6D6D6"
        }
      ]
    }, {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#9C89AD"
        }
      ]
    }, {
      featureType: "transit.line",
      stylers: [
        {
          visibility: "off"
        }
      ]
    }, {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#5f5f5f"
        }
      ]
    }, {
      featureType: "transit.station.airport",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#B5B4B3"
        }
      ]
    }
  ];

  getEta = function(request, $station, index, callback) {
    var directionsService;
    directionsService = new google.maps.DirectionsService();
    return directionsService.route(request, function(result, status) {
      var duration;
      duration = result.routes[0].legs[0].duration.text;
      $station.find('.eta').text(duration);
      nearestStations[index].directions = result;
      if (callback != null) {
        return callback();
      }
    });
  };

  embedMap = function(currentLocation) {
    var mapOptions;
    youLatLng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
    mapOptions = {
      zoom: 15,
      center: youLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById("mapcanvas"), mapOptions);
    map.setOptions({
      styles: mapStyle
    });
    return new google.maps.Marker({
      position: youLatLng,
      map: map,
      title: "You",
      icon: "images/you_icon.png"
    });
  };

  dropMarker = function(station) {
    stationLatLng = new google.maps.LatLng(station.latitude, station.longitude);
    return marker = new google.maps.Marker({
      position: stationLatLng,
      map: map,
      title: station.stationName,
      icon: "images/bike_station.png"
    });
  };

  drawPath = function(index) {
    var directions, lineSymbol;
    directions = nearestStations[index].directions;
    if ((directions != null ? directions.routes : void 0) == null) {
      return;
    }
    lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4
    };
    path = new google.maps.Polyline({
      path: directions.routes[0].overview_path,
      strokeOpacity: 0.5,
      strokeColor: '#8100ec',
      strokeWeight: 5
    });
    return path.setMap(map);
  };

  showInfoWindow = function(station) {
    infowindow = new google.maps.InfoWindow({
      content: station.availableBikes + ' bikes ' + station.availableDocks + ' docks'
    });
    return infowindow.open(map, marker);
  };

  zoomToFit = function() {
    var bounds;
    bounds = new google.maps.LatLngBounds();
    bounds.extend(youLatLng);
    bounds.extend(stationLatLng);
    map.fitBounds(bounds);
    return map.setZoom(map.getZoom() - 1);
  };

  activateStation = function(station, index) {
    console.log('activate station ' + index);
    dropMarker(station);
    showInfoWindow(station);
    zoomToFit();
    drawPath(index);
    $('.station').removeClass('active');
    return $('.station' + index).addClass('active');
  };

  animateTo = function($station) {
    var scrollTo;
    scrollTo = $station.offset().top - $('.stations').offset().top + $('.stations').scrollTop() - 60;
    return $('.stations').animate({
      scrollTop: scrollTo
    }, 70);
  };

  Mousetrap.bind(['down', 'j'], function() {
    $('.station.active').removeClass('active').next().addClass('active').click();
    if ($('.station.active').length === 0) {
      $('.station').last().addClass('active');
    }
    animateTo($('.station.active'));
    return false;
  });

  Mousetrap.bind(['up', 'k'], function() {
    $('.station.active').removeClass('active').prev().addClass('active').click();
    if ($('.station.active').length === 0) {
      $('.stations .station').first().addClass('active');
    }
    animateTo($('.station.active'));
    return false;
  });

  nearestStations = [];

  port = chrome.extension.connect({
    name: "Sample Communication"
  });

  port.postMessage("Fetch data");

  port.onMessage.addListener(function(data) {
    var $station, currentLocation, firstCallback, html, index, request, startPoint, station, _i, _j, _len, _len1, _ref,
      _this = this;
    nearestStations = data.nearestStations;
    currentLocation = data.currentLocation;
    console.log(currentLocation);
    embedMap(currentLocation);
    startPoint = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
    if (nearestStations.length > 0) {
      $('.stations').html('');
      for (index = _i = 0, _len = nearestStations.length; _i < _len; index = ++_i) {
        station = nearestStations[index];
        html = "<div class=\"station station" + index + "\">\n  <div class=\"numbikes\"></div>\n  <div class=\"name\"></div>\n  <div class=\"eta\"></div>\n</div>";
        $('.stations').append(html);
        $station = $('.station' + index);
        $station.find('.numbikes').text(station.availableBikes);
        $station.find('.name').text(station.stationName);
        if (index === 0) {
          $station.addClass('active');
        }
      }
      _ref = nearestStations.slice(0, 5);
      for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
        station = _ref[index];
        $station = $('.station' + index);
        request = {
          origin: startPoint,
          destination: station.latitude + ',' + station.longitude,
          travelMode: google.maps.TravelMode.WALKING
        };
        if (index === 0) {
          firstCallback = function() {
            return setTimeout(function() {
              return $('.stations .station').first().click();
            }, 300);
          };
        }
        getEta(request, $station, index, firstCallback);
      }
    } else {
      $('.station.header .name').text("No bikes near your location");
    }
    return $('.stations .station').click(function(event) {
      if (marker != null) {
        marker.setMap(null);
      }
      marker = null;
      if (path != null) {
        path.setMap(null);
      }
      path = null;
      index = $(this).index();
      return activateStation(nearestStations[index], index);
    });
  });

}).call(this);
