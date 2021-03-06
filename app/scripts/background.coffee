'use strict';

nearestStations = []
currentLocation = null
lastUpdated = null
chrome.runtime.onInstalled.addListener (details) ->
    log('previousVersion', details.previousVersion)

setNearest = (station) ->
  # chrome.browserAction.setBadgeBackgroundColor color: [0, 0, 0, 255]
  # chrome.browserAction.setBadgeText({text: "" + station.availableBikes})
  canvas = document.createElement 'canvas'
  canvas.width = 19
  canvas.height = 19
  ctx = canvas.getContext '2d'

  img = new Image()
  img.src = "images/bikes_icon_19.png"
  img.onload = ->
    ctx.drawImage img, 0, 0
    ctx.fontStyle = 'bold'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    numBikes = station.availableBikes + ''
    if numBikes.length is 1
      ctx.font = "10px HelveticaNeue"
    else
      ctx.font = "9px HelveticaNeue"
    ctx.fillText parseInt(numBikes), canvas.width/2, 10

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    chrome.browserAction.setIcon
      imageData: imageData

getStations = (callback) ->
  bikes.getBikeData (stations, location) =>
    currentLocation = location
    if stations
      nearestStations = stations
      lastUpdated = new Date()
      setNearest(stations[0])
      callback() if callback?
    else
      log 'too far away'
      lastUpdated = new Date()
      callback() if callback?
      chrome.browserAction.setIcon
        path: "/images/bikeable_icon_off_19x19.png"

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

