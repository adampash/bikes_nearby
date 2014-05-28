(function() {
  (function(exports) {
    var bikes;
    bikes = {
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
            var bikeStations, closestStations, i, station, _i;
            log(data);
            bikeStations = data.stationBeanList;
            bikeStations.sort(function(station1, station2) {
              return _this.simpleDistance(coords, station1) - _this.simpleDistance(coords, station2);
            });
            closestStations = [];
            for (i = _i = 0; _i <= 5; i = ++_i) {
              station = bikeStations[i];
              station.distanceInMiles = distance.metersToMiles(distance.getDistance(station, coords));
              closestStations.push(station);
            }
            log("Nearest station is:", closestStations[0]);
            if (_this.callback != null) {
              return _this.callback(closestStations);
            }
          }
        });
      },
      fetchBikesNear: function(position) {
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
    return exports.bikes = bikes;
  })(typeof exports === 'undefined' ? this : exports);

}).call(this);
