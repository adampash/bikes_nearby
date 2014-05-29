(function() {
  'use strict';
  var nearestStations, port;

  nearestStations = [];

  port = chrome.extension.connect({
    name: "Sample Communication"
  });

  port.postMessage("Fetch data");

  port.onMessage.addListener(function(msg) {
    var $station, index, station, _i, _len, _results;
    console.log("message recieved" + msg);
    nearestStations = msg;
    $('.stations').html('');
    _results = [];
    for (index = _i = 0, _len = nearestStations.length; _i < _len; index = ++_i) {
      station = nearestStations[index];
      $('body').append('<div class="station station' + index + '"></div>');
      $station = $('.station' + index);
      $station.append('<div class="numbikes">' + station.availableBikes + '</div>');
      $station.append('<div class="name">' + station.stationName + '</div>');
      _results.push($station.append('<div class="eta">5 min</div>'));
    }
    return _results;
  });

}).call(this);
