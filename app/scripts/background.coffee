'use strict';

chrome.runtime.onInstalled.addListener (details) ->
    console.log('previousVersion', details.previousVersion)

setNearest = (station) ->
  chrome.browserAction.setBadgeBackgroundColor color: [0, 0, 255, 255]
  chrome.browserAction.setBadgeText({text: "" + station.availableBikes})


getDistance = (coords, station) ->
  Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude)

findNearestStation = (coords) ->
  bikeJSON = 'http://www.citibikenyc.com/stations/json'
  # bikeJSON = '/bikes.json'
  $.ajax
    url: bikeJSON
    dataType: 'json'
    crossDomain: true
    success: (data) ->
      log data
      bikeStations = data.stationBeanList
      nearest =
        distance: null
        station: null
      for station in bikeStations
        newDistance = getDistance(coords, station)
        if newDistance < nearest.distance or nearest.distance is null
          nearest.distance = newDistance
          nearest.distanceInMiles = distance.metersToMiles(
            distance.getDistance(station, coords)
          )
          nearest.station = station
          log "New nearest station is:", nearest.station.stAddress1
          log "New distance is:", nearest.distance
      log "Nearest station is:", nearest
      setNearest nearest.station

fetchBikesNear = (position) ->
  log position
  bikes = findNearestStation(position.coords)

getBikeData = ->
  navigator.geolocation.getCurrentPosition (position) ->
    fetchBikesNear(position)

if navigator.geolocation?
  getBikeData()

  setInterval ->
    getBikeData()
  # , 1000
  , 60 * 1000

