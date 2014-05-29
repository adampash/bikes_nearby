'use strict'

nearestStations = []
port = chrome.extension.connect(name: "Sample Communication")
port.postMessage("Fetch data")
port.onMessage.addListener (msg) ->
  console.log("message recieved"+ msg)
  nearestStations = msg
  $('.stations').html('')
  for station, index in nearestStations
    $('body').append('<div class="station station' + index + '"></div>')
    $station = $('.station' + index)
    # $station.text(station.stationName + ': ' + station.availableBikes)
    $station.append('<div class="numbikes">' + station.availableBikes + '</div>')
    $station.append('<div class="name">' + station.stationName + '</div>')
    $station.append('<div class="eta">5 min</div>')
