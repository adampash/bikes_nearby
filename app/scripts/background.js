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
    var canvas, ctx, img;
    canvas = document.createElement('canvas');
    canvas.width = 19;
    canvas.height = 19;
    ctx = canvas.getContext('2d');
    img = new Image();
    img.src = "images/bikes_icon_19.png";
    return img.onload = function() {
      var imageData, numBikes;
      ctx.drawImage(img, 0, 0);
      ctx.fontStyle = 'bold';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      numBikes = station.availableBikes + '';
      if (numBikes.length === 1) {
        ctx.font = "10px HelveticaNeue";
      } else {
        ctx.font = "9px HelveticaNeue";
      }
      ctx.fillText(parseInt(numBikes), canvas.width / 2, 10);
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return chrome.browserAction.setIcon({
        imageData: imageData
      });
    };
  };

  getStations = function(callback) {
    var _this = this;
    return bikes.getBikeData(function(stations, location) {
      currentLocation = location;
      if (stations) {
        nearestStations = stations;
        lastUpdated = new Date();
        setNearest(stations[0]);
        if (callback != null) {
          return callback();
        }
      } else {
        log('too far away');
        lastUpdated = new Date();
        if (callback != null) {
          callback();
        }
        return chrome.browserAction.setIcon({
          path: "/images/bikeable_icon_off_19x19.png"
        });
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
    }, 5000);
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
      var _this = this;
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
