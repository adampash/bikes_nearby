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
          nearest =
            distance: null
            station: null
          for station in bikeStations
            newDistance = @simpleDistance(coords, station)
            if newDistance < nearest.distance or nearest.distance is null
              nearest.distance = newDistance
              nearest.distanceInMiles = distance.metersToMiles(
                distance.getDistance(station, coords)
              )
              nearest.station = station
              log "New nearest station is:", nearest.station.stAddress1
              log "New distance is:", nearest.distance
          log "Nearest station is:", nearest
          @callback nearest.station if @callback?
          # setNearest nearest.station

    fetchBikesNear: (position) ->
      log position
      bikes = @findNearestStation(position.coords)

    getBikeData: (@callback) ->
      navigator.geolocation.getCurrentPosition (position) =>
        @fetchBikesNear(position)

  exports.bikes = bikes
  # debugger
)(if typeof exports == 'undefined' then @ else exports)
