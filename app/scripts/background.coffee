'use strict';

chrome.runtime.onInstalled.addListener (details) ->
    console.log('previousVersion', details.previousVersion)

setNearest = (stations) ->
  station = stations[0]
  chrome.browserAction.setBadgeBackgroundColor color: [0, 0, 255, 255]
  chrome.browserAction.setBadgeText({text: "" + station.availableBikes})

if navigator.geolocation?
  bikes.getBikeData (stations) =>
    setNearest(stations)

  setInterval ->
    bikes.getBikeData (stations) =>
      setNearest(stations)
  # , 1000
  , 60 * 1000


