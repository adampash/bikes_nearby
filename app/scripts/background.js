(function() {
  'use strict';
  var checkTime, currentLocation, getStations, lastUpdated, nearestStations, sendData, setNearest;

  nearestStations = [];

  currentLocation = null;

  lastUpdated = null;

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

  getStations = function(callback) {
    var _this = this;
    return bikes.getBikeData(function(stations, location) {
      nearestStations = stations;
      currentLocation = location;
      lastUpdated = new Date();
      setNearest(stations[0]);
      if (callback != null) {
        return callback();
      }
    });
  };

  checkTime = function() {
    if ((new Date() - lastUpdated) / 1000 > 60) {
      return getStations();
    }
  };

  if (navigator.geolocation != null) {
    getStations();
    setInterval(function() {
      return getStations();
    }, 60 * 1000);
    setInterval(function() {
      return checkTime();
    }, 1000);
  }

  sendData = function(port) {
    var data;
    data = {
      nearestStations: nearestStations,
      currentLocation: currentLocation
    };
    return port.postMessage(data);
  };

  chrome.extension.onConnect.addListener(function(port) {
    log("Connected .....");
    return port.onMessage.addListener(function(msg) {
      log("message recieved " + msg);
      if (nearestStations.length === 0) {
        return getStations(function() {
          return sendData(port);
        });
      } else {
        return sendData(port);
      }
    });
  });

}).call(this);
