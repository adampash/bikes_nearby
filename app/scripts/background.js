(function() {
  'use strict';
  var fetchBikesNear, findNearestStation, getBikeData, getDistance, setNearest;

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

  getDistance = function(coords, station) {
    return Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude);
  };

  findNearestStation = function(coords) {
    var bikeJSON;
    bikeJSON = 'http://www.citibikenyc.com/stations/json';
    return $.ajax({
      url: bikeJSON,
      dataType: 'json',
      crossDomain: true,
      success: function(data) {
        var bikeStations, nearest, newDistance, station, _i, _len;
        log(data);
        bikeStations = data.stationBeanList;
        nearest = {
          distance: null,
          station: null
        };
        for (_i = 0, _len = bikeStations.length; _i < _len; _i++) {
          station = bikeStations[_i];
          newDistance = getDistance(coords, station);
          if (newDistance < nearest.distance || nearest.distance === null) {
            nearest.distance = newDistance;
            nearest.station = station;
            log("New nearest station is:", nearest.station.stAddress1);
            log("New distance is:", nearest.distance);
          }
        }
        log("Nearest station is:", nearest);
        return setNearest(nearest.station);
      }
    });
  };

  fetchBikesNear = function(position) {
    var bikes;
    log(position);
    return bikes = findNearestStation(position.coords);
  };

  getBikeData = function() {
    return navigator.geolocation.getCurrentPosition(function(position) {
      return fetchBikesNear(position);
    });
  };

  if (navigator.geolocation != null) {
    getBikeData();
    setInterval(function() {
      return getBikeData();
    }, 60 * 1000);
  }

}).call(this);
