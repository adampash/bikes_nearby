(function() {
  'use strict';
  var setNearest,
    _this = this;

  chrome.runtime.onInstalled.addListener(function(details) {
    return console.log('previousVersion', details.previousVersion);
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
    bikes.getBikeData(function(station) {
      return setNearest(station);
    });
    setInterval(function() {
      var _this = this;
      return bikes.getBikeData(function(station) {
        return setNearest(station);
      });
    }, 60 * 1000);
  }

}).call(this);
