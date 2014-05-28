(function() {
  'use strict';
  var setNearest,
    _this = this;

  chrome.runtime.onInstalled.addListener(function(details) {
    return console.log('previousVersion', details.previousVersion);
  });

  setNearest = function(stations) {
    var station;
    station = stations[0];
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 255, 255]
    });
    return chrome.browserAction.setBadgeText({
      text: "" + station.availableBikes
    });
  };

  if (navigator.geolocation != null) {
    bikes.getBikeData(function(stations) {
      return setNearest(stations);
    });
    setInterval(function() {
      var _this = this;
      return bikes.getBikeData(function(stations) {
        return setNearest(stations);
      });
    }, 60 * 1000);
  }

}).call(this);
