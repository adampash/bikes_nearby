(function() {
  (function(exports, $, distance, log) {
    var bikes;
    bikes = {
      bikeShares: [
        {
          city: 'New York City',
          url: 'http://www.citibikenyc.com/stations/json',
          latitude: 40.7127,
          longitude: -74.0059
        }, {
          city: 'Chicago',
          url: 'http://www.divvybikes.com/stations/json',
          latitude: 41.8819,
          longitude: -87.6278
        }, {
          city: 'San Francisco',
          url: 'https://www.bayareabikeshare.com/stations/json',
          latitude: 37.7833,
          longitude: -122.4167
        }, {
          city: 'Columbus',
          url: 'http://www.cogobikeshare.com/stations/json',
          latitude: 39.9833,
          longitude: -82.9833
        }, {
          city: 'Aspen',
          url: 'https://www.we-cycle.org/pbsc/stations.php',
          latitude: 39.1922,
          longitude: -106.8244
        }, {
          city: 'Chattanooga',
          url: 'http://www.bikechattanooga.com/stations/json',
          latitude: 35.0456,
          longitude: -85.2672
        }
      ],
      simpleDistance: function(coords, station) {
        return Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude);
      },
      findNearestStation: function(coords) {
        var bikeJSON,
          _this = this;
        this.bikeShares.sort(function(city1, city2) {
          return _this.simpleDistance(coords, city1) - _this.simpleDistance(coords, city2);
        });
        bikeJSON = this.bikeShares[0].url;
        log('OMG', bikeJSON);
        return $.ajax({
          url: bikeJSON,
          dataType: 'json',
          crossDomain: true,
          success: function(data) {
            var bikeStations, closestStations, i, station, _i;
            bikeStations = data.stationBeanList;
            bikeStations.sort(function(station1, station2) {
              return _this.simpleDistance(coords, station1) - _this.simpleDistance(coords, station2);
            });
            closestStations = [];
            if (distance.getDistance(bikeStations[0], coords) > 48280) {
              closestStations = false;
            } else {
              for (i = _i = 0; _i <= 4; i = ++_i) {
                station = bikeStations[i];
                station.distanceInMiles = distance.metersToMiles(distance.getDistance(station, coords));
                closestStations.push(station);
              }
            }
            if (_this.callback != null) {
              return _this.callback(bikeStations, coords);
            }
          }
        });
      },
      fetchBikesNear: function(position, callback) {
        if (callback != null) {
          this.callback = callback;
        }
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
  })(typeof exports !== "undefined" && exports !== null ? exports : this, typeof $ !== "undefined" && $ !== null ? $ : require('_helpers').$, typeof distance !== "undefined" && distance !== null ? distance : require('distance').distance, typeof log !== "undefined" && log !== null ? log : require('_helpers').log);

}).call(this);
