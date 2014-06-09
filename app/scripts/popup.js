(function() {
  'use strict';
  var activateStation, allMarkers, allOn, animateTo, constructInfoWindow, drawPath, dropMarker, embedMap, getEta, infowindow, map, mapStyle, marker, nearestStations, path, places_marker, port, prev_marker, scrollTo, setupSearch, showAll, stationLatLng, youLatLng, zoomToFit;

  map = null;

  marker = null;

  youLatLng = null;

  stationLatLng = null;

  infowindow = null;

  path = null;

  getEta = function(request, $station, index, callback) {
    var directionsService;
    directionsService = new google.maps.DirectionsService();
    return directionsService.route(request, function(result, status) {
      var duration;
      duration = result.routes[0].legs[0].duration.text;
      $station.find('.eta').text(duration);
      nearestStations[index].directions = result;
      if (index === 0) {
        return callback();
      }
    });
  };

  places_marker = null;

  setupSearch = function() {
    var input,
      _this = this;
    input = $('input')[0];
    return places.search(map, input, function(pl_marker) {
      places_marker = marker;
      if ($('.toggle_all').text().indexOf('all') > -1) {
        return $('.toggle_all').click();
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
      icon: "images/you.png",
      zIndex: 1000
    });
  };

  prev_marker = null;

  dropMarker = function(station, active) {
    var icon, new_marker;
    if (active == null) {
      active = false;
    }
    stationLatLng = new google.maps.LatLng(station.latitude, station.longitude);
    if (active) {
      icon = "images/station_on.png";
    } else {
      icon = "images/station_off.png";
    }
    new_marker = new google.maps.Marker({
      position: stationLatLng,
      map: map,
      title: station.stationName,
      icon: icon,
      id: station.id
    });
    google.maps.event.addListener(new_marker, 'click', function() {
      if (infowindow != null) {
        infowindow.setMap(null);
      }
      infowindow = constructInfoWindow(station);
      infowindow.open(map, new_marker);
      if (prev_marker != null) {
        prev_marker.setIcon("images/station_off.png");
      }
      new_marker.setIcon("images/station_on.png");
      scrollTo(station);
      prev_marker = new_marker;
      return setTimeout(function() {
        return map.panBy(0, -40);
      }, 10);
    });
    return new_marker;
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
      strokeColor: '#ff3700',
      strokeWeight: 5
    });
    return path.setMap(map);
  };

  constructInfoWindow = function(station, show) {
    if (show == null) {
      show = true;
    }
    return infowindow = new google.maps.InfoWindow({
      content: "<b>" + station.availableBikes + " bikes " + station.availableDocks + " docks</b>"
    });
  };

  zoomToFit = function() {
    var bounds;
    bounds = new google.maps.LatLngBounds();
    bounds.extend(youLatLng);
    bounds.extend(stationLatLng);
    map.fitBounds(bounds);
    return map.setZoom(map.getZoom() - 1);
  };

  activateStation = function(station, index, trigger) {
    if (trigger == null) {
      trigger = true;
    }
    console.log('activate station ' + index);
    marker = dropMarker(station, true);
    zoomToFit();
    setTimeout(function() {
      return google.maps.event.trigger(marker, 'click');
    }, 100);
    drawPath(index);
    $('.station').removeClass('active');
    return $('.station' + index).addClass('active');
  };

  scrollTo = function(station) {
    var $station;
    console.log('scroll to', station);
    $('.station').removeClass('active');
    $station = $('#' + station.id);
    $station.addClass('active');
    return animateTo($station);
  };

  allMarkers = [];

  allOn = false;

  showAll = function(bool) {
    var mark, station, _i, _j, _len, _len1;
    if (bool) {
      if (map.getZoom() > 16) {
        map.setZoom(map.getZoom() - 2);
      }
      for (_i = 0, _len = nearestStations.length; _i < _len; _i++) {
        station = nearestStations[_i];
        allMarkers.push(dropMarker(station));
      }
      $('.stations .station').removeClass('active');
    } else {
      for (_j = 0, _len1 = allMarkers.length; _j < _len1; _j++) {
        mark = allMarkers[_j];
        mark.setMap(null);
      }
      allMarkers = [];
      if (places_marker != null) {
        debugger;
        places_marker.setVisible(false);
        places_marker.setMap(null);
      }
    }
    if (path != null) {
      path.setMap(null);
    }
    if (marker != null) {
      marker.setMap(null);
    }
    return allOn = bool;
  };

  animateTo = function($station) {
    var position;
    position = $station.offset().top - $('.stations').offset().top + $('.stations').scrollTop() - 60;
    return $('.stations').animate({
      scrollTop: position
    }, 150);
  };

  Mousetrap.bind(['/'], function() {
    $('input').select();
    return false;
  });

  Mousetrap.bind(['down', 'j'], function() {
    animateTo($('.station.active').next());
    $('.station.active').removeClass('active').next().addClass('active').click();
    if ($('.station.active').length === 0) {
      $('.station').last().addClass('active');
    }
    return false;
  });

  Mousetrap.bind(['up', 'k'], function() {
    animateTo($('.station.active').prev());
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
        html = "<div class=\"station station" + index + "\" id=\"" + station.id + "\">\n  <div class=\"numbikes\"></div>\n  <div class=\"name\"></div>\n  <div class=\"eta\"></div>\n</div>";
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
            return $('.stations .station').first().click();
          };
        }
        getEta(request, $station, index, firstCallback);
      }
    } else {
      $('.station.header .name').text("No bikes near your location");
    }
    setupSearch();
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

  $(function() {
    setTimeout(function() {
      return $('input').blur();
    }, 180);
    $('input').on('focus', function() {
      return $('input').select();
    });
    $('input').on('mouseup', function() {
      return false;
    });
    return $('.toggle_all').click(function() {
      if ($(this).hasClass('all')) {
        showAll(false);
        $(this).text("Show all");
        activateStation(nearestStations[0], 0);
      } else {
        showAll(true);
        $(this).text("Show closest");
      }
      return $(this).toggleClass('all');
    });
  });

  mapStyle = [
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.stroke"
    }, {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#2A5082",
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#D6E0CC"
        }
      ]
    }, {
      "featureType": "landscape.natural.landcover",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#D6E0CC"
        }
      ]
    }, {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#EEE7DD",
          "visibility": "on"
        }
      ]
    }, {
      "featureType": "poi.attraction",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.attraction",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.attraction",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#574400"
        }
      ]
    }, {
      "featureType": "poi.business",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#808080",
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.government",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.medical",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.place_of_worship",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.school",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.sports_complex",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#808080",
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "visibility": "on",
          "color": "#E0D9CF"
        }
      ]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#EED18F"
        }
      ]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#D6BA7A"
        }
      ]
    }, {
      "featureType": "poi",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#808080",
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#808080"
        }
      ]
    }, {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    }, {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#808080"
        }
      ]
    }, {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#E0D9CF"
        }
      ]
    }, {
      "featureType": "transit.station.rail",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    }, {
      "featureType": "transit.station",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "transit.line",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#D6E0CC"
        }
      ]
    }, {
      "featureType": "poi.attraction",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.attraction",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.business",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi.school",
      "elementType": "labels.icon",
      "stylers": [
        {
          "color": "#808080",
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "poi",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "landscape",
      "elementType": "labels.text",
      "stylers": [
        {
          "color": "#808080"
        }
      ]
    }, {
      "featureType": "road.highway",
      "elementType": "labels.icon",
      "stylers": [
        {
          "saturation": -100,
          "visibility": "on",
          "lightness": 38
        }
      ]
    }, {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#CDE5F1"
        }
      ]
    }, {
      "featureType": "landscape"
    }
  ];

}).call(this);
