((exports) ->
  bikes =
    bikeShares: [
      city: 'New York City'
      url: 'http://www.citibikenyc.com/stations/json'
      latitude: 40.7127
      longitude: 74.0059
    ,
      city: 'Chicago'
      url: 'http://www.divvybikes.com/stations/json'
      latitude: 41.8819
      longitude: 87.6278
    ,
      city: 'San Francisco'
      url: 'https://www.bayareabikeshare.com/stations/json'
      latitude: 37.7833
      longitude: 122.4167
    ]
    simpleDistance: (coords, station) ->
      Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude)

    findNearestStation: (coords) ->
      # coords =
      #   latitude: 41.6547
      #   longitude: 95.3219
      @bikeShares.sort (city1, city2) =>
        @simpleDistance(coords, city1) - @simpleDistance(coords, city2)

      bikeJSON = @bikeShares[0].url

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
          if distance.getDistance(bikeStations[0], coords) > 48280
            closestStations = false
          else
            for i in [0..5]
              station = bikeStations[i]
              station.distanceInMiles = distance.metersToMiles(
                  distance.getDistance(station, coords)
                )
                closestStations.push station
          log "Nearest station is:", closestStations[0]

          # if you're over 30 miles (48280.3m) from the closest station return false
          @callback closestStations, coords if @callback?

    fetchBikesNear: (position) ->
      log position
      bikes = @findNearestStation(position.coords)

    getBikeData: (@callback) ->
      navigator.geolocation.getCurrentPosition (position) =>
        @fetchBikesNear(position)

  exports.bikes = bikes
  # debugger
)(if typeof exports == 'undefined' then @ else exports)
