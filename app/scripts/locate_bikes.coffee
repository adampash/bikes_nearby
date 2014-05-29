((exports) ->
  bikes =
    simpleDistance: (coords, station) ->
      Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude)

    findNearestStation: (coords) ->
      bikeJSON = 'http://www.citibikenyc.com/stations/json'
      'https://www.bayareabikeshare.com/stations/json'
      'http://www.divvybikes.com/stations/json'
      $.ajax
        url: bikeJSON
        dataType: 'json'
        crossDomain: true
        success: (data) =>
          log data
          bikeStations = data.stationBeanList
          bikeStations.sort (station1, station2) =>
            @simpleDistance(coords, station1) - @simpleDistance(coords, station2)
            # station2.stationName.length - station1.stationName.length
          closestStations = []
          for i in [0..5]
            station = bikeStations[i]
            station.distanceInMiles = distance.metersToMiles(
                distance.getDistance(station, coords)
              )
              closestStations.push station
          log "Nearest station is:", closestStations[0]
          @callback closestStations if @callback?

    fetchBikesNear: (position) ->
      log position
      bikes = @findNearestStation(position.coords)

    getBikeData: (@callback) ->
      navigator.geolocation.getCurrentPosition (position) =>
        @fetchBikesNear(position)

  exports.bikes = bikes
  # debugger
)(if typeof exports == 'undefined' then @ else exports)
