'use strict'

getEta = (request, $station) ->
  directionsService = new google.maps.DirectionsService()
  directionsService.route request, (result, status) ->
    duration = result.routes[0].legs[0].duration.text
    $station.append('<div class="eta">' + duration + '</div>')

nearestStations = []
port = chrome.extension.connect(name: "Sample Communication")
port.postMessage("Fetch data")
port.onMessage.addListener (data) ->
  nearestStations = data.nearestStations
  currentLocation = data.currentLocation

  startPoint = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude)

  $('.stations').html('')
  for station, index in nearestStations
    $('.stations').append('<div class="station station' + index + '"></div>')
    $station = $('.station' + index)
    # $station.text(station.stationName + ': ' + station.availableBikes)
    $station.append('<div class="numbikes">' + station.availableBikes + '</div>')
    $station.append('<div class="name">' + station.stationName + '</div>')

    request =
      origin: startPoint
      destination: station.latitude + ',' + station.longitude
      travelMode: google.maps.TravelMode.WALKING

    getEta(request, $station)


  $('.stations .station').click (event) ->
    index = $(this).index()
    url = 'https://www.google.com/maps/dir/' + currentLocation.latitude + ',' + currentLocation.longitude + '/' + nearestStations[index].latitude + ','+ nearestStations[index].longitude
    window.open url


