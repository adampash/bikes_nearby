(function() {
  window.bikes = {
    simpleDistance: function(coords, station) {
      return Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude);
    },
    findNearestStation: function(coords) {
      var bikeJSON,
        _this = this;
      bikeJSON = 'http://www.citibikenyc.com/stations/json';
      'https://www.bayareabikeshare.com/stations/json';
      'http://www.divvybikes.com/stations/json';
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
            newDistance = _this.simpleDistance(coords, station);
            if (newDistance < nearest.distance || nearest.distance === null) {
              nearest.distance = newDistance;
              nearest.distanceInMiles = distance.metersToMiles(distance.getDistance(station, coords));
              nearest.station = station;
              log("New nearest station is:", nearest.station.stAddress1);
              log("New distance is:", nearest.distance);
            }
          }
          log("Nearest station is:", nearest);
          if (_this.callback != null) {
            return _this.callback(nearest.station);
          }
        }
      });
    },
    fetchBikesNear: function(position) {
      var bikes;
      log(position);
      return bikes = this.findNearestStation(position.coords);
    },
    getBikeData: function(callback) {
      var _this = this;
      this.callback = callback;
      return navigator.geolocation.getCurrentPosition(function(position) {
        return _this.fetchBikesNear(position);
      });
    }
  };

}).call(this);
