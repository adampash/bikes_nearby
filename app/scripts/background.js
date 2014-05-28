(function() {
  'use strict';
  var setNearest,
    _this = this;

  chrome.runtime.onInstalled.addListener(function(details) {
    return log('previousVersion', details.previousVersion);
  });

  setNearest = function(station) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 255, 255]
    });
    return chrome.browserAction.setBadgeText({
      text: "" + station.availableBikes
    });
  };

  if (navigator.geolocation != null) {
    bikes.getBikeData(function(stations) {
      return setNearest(stations[0]);
    });
    setInterval(function() {
      var _this = this;
      return bikes.getBikeData(function(stations) {
        return setNearest(stations[0]);
      });
    }, 60 * 1000);
  }

}).call(this);
