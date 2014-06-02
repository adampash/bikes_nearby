(function() {
  'use strict';
  var activateStation, drawPath, dropMarker, embedMap, getEta, infowindow, map, marker, nearestStations, path, port, showInfoWindow, stationLatLng, youLatLng, zoomToFit;

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
      $station.append('<div class="eta">' + duration + '</div>');
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
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("mapcanvas"), mapOptions);
    return new google.maps.Marker({
      position: youLatLng,
      map: map,
      title: "You",
      icon: "images/you.png"
    });
  };

  dropMarker = function(station) {
    stationLatLng = new google.maps.LatLng(station.latitude, station.longitude);
    return marker = new google.maps.Marker({
      position: stationLatLng,
      map: map,
      title: station.stationName,
      icon: "images/you.png"
    });
  };

  drawPath = function(index) {
    var directions, lineSymbol;
    directions = nearestStations[index].directions;
    lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4
    };
    path = new google.maps.Polyline({
      path: directions.routes[0].overview_path,
      strokeOpacity: 0,
      icons: [
        {
          icon: lineSymbol,
          offset: '0',
          repeat: '15px'
        }
      ],
      strokeColor: '#0000FF'
    });
    return path.setMap(map);
  };

  showInfoWindow = function(station) {
    infowindow = new google.maps.InfoWindow({
      content: station.availableBikes + ' bikes; ' + station.availableDocks + ' docks'
    });
    return infowindow.open(map, marker);
  };

  zoomToFit = function() {
    var bounds;
    bounds = new google.maps.LatLngBounds();
    bounds.extend(youLatLng);
    bounds.extend(stationLatLng);
    return map.fitBounds(bounds);
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

  Mousetrap.bind(['down', 'j'], function() {
    $('.station.active').removeClass('active').next().addClass('active').click();
    if ($('.station.active').length === 0) {
      return $('.station').last().addClass('active');
    }
  });

  Mousetrap.bind(['up', 'k'], function() {
    $('.station.active').removeClass('active').prev().addClass('active').click();
    if ($('.station.active').length === 0) {
      return $('.stations .station').first().addClass('active');
    }
  });

  nearestStations = [];

  port = chrome.extension.connect({
    name: "Sample Communication"
  });

  port.postMessage("Fetch data");

  port.onMessage.addListener(function(data) {
    var $station, currentLocation, firstCallback, index, request, startPoint, station, _i, _len,
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
        $('.stations').append('<div class="station station' + index + '"></div>');
        $station = $('.station' + index);
        $station.append('<div class="numbikes">' + station.availableBikes + '</div>');
        $station.append('<div class="name">' + station.stationName + '</div>');
        if (index === 0) {
          $station.addClass('active');
        }
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
