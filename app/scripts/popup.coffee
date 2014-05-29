'use strict'

nearestStations = []
port = chrome.extension.connect(name: "Sample Communication")
port.postMessage("Fetch data")
port.onMessage.addListener (msg) ->
  console.log("message recieved"+ msg)
  nearestStations = msg
  $('body').html('')
  for station, index in nearestStations
    $('body').append('<div class="station' + index + '"></div>')
    $station = $('.station' + index)
    $station.text(station.stationName + ': ' + station.availableBikes)
