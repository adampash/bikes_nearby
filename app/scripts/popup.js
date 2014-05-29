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
    $('body').html('');
    _results = [];
    for (index = _i = 0, _len = nearestStations.length; _i < _len; index = ++_i) {
      station = nearestStations[index];
      $('body').append('<div class="station' + index + '"></div>');
      $station = $('.station' + index);
      _results.push($station.text(station.stationName + ': ' + station.availableBikes));
    }
    return _results;
  });

}).call(this);
