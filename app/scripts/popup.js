(function() {
  'use strict';
  var activateStation, dropMarker, embedMap, getEta, infowindow, map, marker, nearestStations, port, showInfoWindow, stationLatLng, youLatLng, zoomToFit;

  map = null;

  marker = null;

  youLatLng = null;

  stationLatLng = null;

  infowindow = null;

  getEta = function(request, $station) {
    var directionsService;
    directionsService = new google.maps.DirectionsService();
    return directionsService.route(request, function(result, status) {
      var duration;
      duration = result.routes[0].legs[0].duration.text;
      return $station.append('<div class="eta">' + duration + '</div>');
    });
  };

  embedMap = function(currentLocation) {
    var mapOptions;
    youLatLng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
    mapOptions = {
      zoom: 15,
      center: youLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
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
    marker = new google.maps.Marker({
      position: stationLatLng,
      map: map,
      title: station.stationName,
      icon: "images/you.png"
    });
    showInfoWindow(station);
    return zoomToFit();
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
    dropMarker(station);
    $('.station').removeClass('active');
    return $('.station' + index).addClass('active');
  };

  nearestStations = [];

  port = chrome.extension.connect({
    name: "Sample Communication"
  });

  port.postMessage("Fetch data");

  port.onMessage.addListener(function(data) {
    var $station, currentLocation, index, request, startPoint, station, _i, _len,
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
        request = {
          origin: startPoint,
          destination: station.latitude + ',' + station.longitude,
          travelMode: google.maps.TravelMode.WALKING
        };
        getEta(request, $station);
      }
      activateStation(nearestStations[0], 0);
      setTimeout(function() {
        return $('.stations .station').first().click();
      }, 300);
    } else {
      $('.station.header .name').text("No bikes near your location");
    }
    return $('.stations .station').click(function(event) {
      marker.setMap(null);
      index = $(this).index();
      return activateStation(nearestStations[index], index);
    });
  });

}).call(this);
