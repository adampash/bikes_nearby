(function() {
  'use strict';
  var getStations, nearestStations, setNearest;

  nearestStations = [];

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

  getStations = function() {
    var _this = this;
    return bikes.getBikeData(function(stations) {
      log(stations);
      nearestStations = stations;
      return setNearest(stations[0]);
    });
  };

  if (navigator.geolocation != null) {
    getStations();
    setInterval(function() {
      return getStations();
    }, 60 * 1000);
  }

  chrome.extension.onConnect.addListener(function(port) {
    log("Connected .....");
    return port.onMessage.addListener(function(msg) {
      log("message recieved " + msg);
      return port.postMessage(nearestStations);
    });
  });

}).call(this);
