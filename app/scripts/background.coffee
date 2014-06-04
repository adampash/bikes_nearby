'use strict';

nearestStations = []
currentLocation = null
lastUpdated = null
chrome.runtime.onInstalled.addListener (details) ->
    log('previousVersion', details.previousVersion)

setNearest = (station) ->
  chrome.browserAction.setBadgeBackgroundColor color: [129, 0, 236, 255]
  chrome.browserAction.setBadgeText({text: "" + station.availableBikes})

getStations = (callback) ->
  bikes.getBikeData (stations, location) =>
    currentLocation = location
    if stations
      nearestStations = stations
      lastUpdated = new Date()
      setNearest(stations[0])
      callback() if callback?
      # chrome.browserAction.setIcon
      #   path: "/images/icon-19.png"
    else
      log 'too far away'
      lastUpdated = new Date()
      callback() if callback?
      # chrome.browserAction.setIcon
      #   path: "/images/icon-19-inactive.png"

checkTime = ->
  if (new Date() - lastUpdated)/1000 > 60
    getStations()

if navigator.geolocation?
  getStations()
  setInterval ->
    getStations()
  # , 1000
  , 60 * 1000
  setInterval ->
    checkTime()
  , 5000

sendData = (port) ->
  data =
    nearestStations: nearestStations
    currentLocation: currentLocation
  port.postMessage(data)

chrome.extension.onConnect.addListener (port) ->
  log("Connected .....")
  port.onMessage.addListener (msg) ->
    log("message recieved "+ msg)
    if nearestStations.length is 0
      # fetch nearest and then postMessage
      getStations =>
        sendData(port)
    else
      sendData(port)

