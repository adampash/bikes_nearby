'use strict';

chrome.runtime.onInstalled.addListener (details) ->
    log('previousVersion', details.previousVersion)

setNearest = (station) ->
  chrome.browserAction.setBadgeBackgroundColor color: [0, 0, 255, 255]
  chrome.browserAction.setBadgeText({text: "" + station.availableBikes})

if navigator.geolocation?
  bikes.getBikeData (stations) =>
    setNearest(stations[0])

  setInterval ->
    bikes.getBikeData (stations) =>
      setNearest(stations[0])
  # , 1000
  , 60 * 1000


