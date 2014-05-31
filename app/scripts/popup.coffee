'use strict'

map = null
marker = null
youLatLng = null
stationLatLng = null
infowindow = null

getEta = (request, $station) ->
  directionsService = new google.maps.DirectionsService()
  directionsService.route request, (result, status) ->
    duration = result.routes[0].legs[0].duration.text
    $station.append('<div class="eta">' + duration + '</div>')

embedMap = (currentLocation) ->
  youLatLng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
  mapOptions =
    zoom: 15
    center: youLatLng
    mapTypeId: google.maps.MapTypeId.ROADMAP
    disableDefaultUI: true

  map = new google.maps.Map(document.getElementById("mapcanvas"),
    mapOptions)

  new google.maps.Marker
    position: youLatLng
    map: map
    title:"You"
    icon: "images/you.png"

dropMarker = (station) ->
  stationLatLng = new google.maps.LatLng(station.latitude, station.longitude)
  marker = new google.maps.Marker
    position: stationLatLng
    map: map
    title: station.stationName
    icon: "images/you.png"
  showInfoWindow(station)
  zoomToFit()

showInfoWindow = (station) ->
  infowindow = new google.maps.InfoWindow
    content: station.availableBikes + ' bikes; ' + station.availableDocks + ' docks'
  infowindow.open(map,marker)

zoomToFit = ->
  bounds = new google.maps.LatLngBounds()
  bounds.extend(youLatLng)
  bounds.extend(stationLatLng)
  map.fitBounds(bounds)

activateStation = (station, index) ->
  dropMarker(station)
  $('.station').removeClass('active')
  $('.station' + index).addClass('active')

nearestStations = []
port = chrome.extension.connect(name: "Sample Communication")
port.postMessage("Fetch data")
port.onMessage.addListener (data) ->
  nearestStations = data.nearestStations
  currentLocation = data.currentLocation
  console.log currentLocation
  embedMap(currentLocation)
  startPoint = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
  if nearestStations.length > 0
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

    activateStation(nearestStations[0], 0)
    setTimeout =>
      $('.stations .station').first().click()
    , 300
  else
    $('.station.header .name').text "No bikes near your location"


  $('.stations .station').click (event) ->
    marker.setMap(null)
    index = $(this).index()
    activateStation(nearestStations[index], index)
