(function() {
  'use strict';
  var getEta, nearestStations, port;

  getEta = function(request, $station) {
    var directionsService;
    directionsService = new google.maps.DirectionsService();
    return directionsService.route(request, function(result, status) {
      var duration;
      duration = result.routes[0].legs[0].duration.text;
      return $station.append('<div class="eta">' + duration + '</div>');
    });
  };

  nearestStations = [];

  port = chrome.extension.connect({
    name: "Sample Communication"
  });

  port.postMessage("Fetch data");

  port.onMessage.addListener(function(data) {
    var $station, currentLocation, index, request, startPoint, station, _i, _len;
    nearestStations = data.nearestStations;
    currentLocation = data.currentLocation;
    startPoint = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
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
    return $('.stations .station').click(function(event) {
      var url;
      index = $(this).index();
      url = 'https://www.google.com/maps/dir/' + currentLocation.latitude + ',' + currentLocation.longitude + '/' + nearestStations[index].latitude + ',' + nearestStations[index].longitude;
      return window.open(url);
    });
  });

}).call(this);
