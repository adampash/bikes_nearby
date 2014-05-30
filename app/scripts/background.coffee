'use strict';

nearestStations = []
currentLocation = null
chrome.runtime.onInstalled.addListener (details) ->
    log('previousVersion', details.previousVersion)

setNearest = (station) ->
  chrome.browserAction.setBadgeBackgroundColor color: [0, 0, 255, 255]
  chrome.browserAction.setBadgeText({text: "" + station.availableBikes})

getStations = ->
  bikes.getBikeData (stations, location) =>
    nearestStations = stations
    currentLocation = location
    setNearest(stations[0])

if navigator.geolocation?
  getStations()
  setInterval ->
    getStations()
  # , 1000
  , 60 * 1000

chrome.extension.onConnect.addListener (port) ->
  log("Connected .....")
  port.onMessage.addListener (msg) ->
        log("message recieved "+ msg)
        data =
          nearestStations: nearestStations
          currentLocation: currentLocation
        port.postMessage(data)
