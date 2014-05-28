'use strict';

chrome.runtime.onInstalled.addListener (details) ->
    console.log('previousVersion', details.previousVersion)

setNearest = (station) ->
  chrome.browserAction.setBadgeBackgroundColor color: [0, 0, 255, 255]
  chrome.browserAction.setBadgeText({text: "" + station.availableBikes})

if navigator.geolocation?
  bikes.getBikeData (station) =>
    setNearest(station)

  setInterval ->
    bikes.getBikeData (station) =>
      setNearest(station)
  # , 1000
  , 60 * 1000


