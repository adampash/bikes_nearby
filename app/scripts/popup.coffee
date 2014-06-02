'use strict'

map = null
marker = null
youLatLng = null
stationLatLng = null
infowindow = null
path = null

getEta = (request, $station, index, callback) ->
  directionsService = new google.maps.DirectionsService()
  directionsService.route request, (result, status) ->
    duration = result.routes[0].legs[0].duration.text
    $station.append('<div class="eta">' + duration + '</div>')
    nearestStations[index].directions = result
    callback() if callback?


embedMap = (currentLocation) ->
  youLatLng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
  mapOptions =
    zoom: 15
    center: youLatLng
    mapTypeId: google.maps.MapTypeId.ROADMAP
    # disableDefaultUI: true

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

drawPath = (index) ->
  directions = nearestStations[index].directions
  lineSymbol =
    path: 'M 0,-1 0,1'
    strokeOpacity: 1
    scale: 4
  path = new google.maps.Polyline
    path: directions.routes[0].overview_path
    # geodesic: true
    strokeOpacity: 0
    icons: [
      icon: lineSymbol
      offset: '0'
      repeat: '15px'
    ]
    strokeColor: '#0000FF'
    # strokeWeight: 2
  path.setMap(map)

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
  console.log 'activate station ' + index
  dropMarker(station)
  showInfoWindow(station)
  zoomToFit()
  drawPath(index)
  $('.station').removeClass('active')
  $('.station' + index).addClass('active')

Mousetrap.bind ['down', 'j'], ->
  $('.station.active')
    .removeClass('active')
    .next().addClass('active').click()
  if $('.station.active').length is 0
    $('.station').last().addClass('active')

Mousetrap.bind ['up', 'k'], ->
  $('.station.active')
    .removeClass('active')
    .prev().addClass('active').click()
  if $('.station.active').length is 0
    $('.stations .station').first().addClass('active')


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
      $station.addClass('active') if index is 0

      request =
        origin: startPoint
        destination: station.latitude + ',' + station.longitude
        travelMode: google.maps.TravelMode.WALKING

      if index == 0
        firstCallback = =>
          # activateStation(nearestStations[0], 0)
          setTimeout =>
            $('.stations .station').first().click()
          , 300
      getEta(request, $station, index, firstCallback)

  else
    $('.station.header .name').text "No bikes near your location"


  $('.stations .station').click (event) ->
    marker.setMap(null) if marker?
    marker = null
    path.setMap(null) if path?
    path = null
    index = $(this).index()
    activateStation(nearestStations[index], index)
