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
    $station.find('.eta').text(duration)
    nearestStations[index].directions = result
    callback() if index is 0


embedMap = (currentLocation) ->
  youLatLng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
  mapOptions =
    zoom: 15
    center: youLatLng
    mapTypeId: google.maps.MapTypeId.ROADMAP
    streetViewControl: false
    mapTypeControl: false
    # disableDefaultUI: true

  map = new google.maps.Map(document.getElementById("mapcanvas"),
    mapOptions)
  map.setOptions({styles: mapStyle})
  new google.maps.Marker
    position: youLatLng
    map: map
    title:"You"
    icon: "images/you.png"
    zIndex: 1000

dropMarker = (station) ->
  stationLatLng = new google.maps.LatLng(station.latitude, station.longitude)
  new_marker = new google.maps.Marker
    position: stationLatLng
    map: map
    title: station.stationName
    icon: "images/station_off.png"
    id: station.id
  google.maps.event.addListener new_marker, 'click', ->
    infowindow.setMap(null) if infowindow?
    infowindow = constructInfoWindow(station)
    infowindow.open(map, new_marker)
    # new_marker.icon = "images/station_off.png"
    # scrollTo(station)
    # activateStation(station, 0, false)
    # $(".stations ##{new_marker.id}").click()
    # TODO select related station in stations div and scroll to it
  new_marker

drawPath = (index) ->
  directions = nearestStations[index].directions
  return unless directions?.routes?
  lineSymbol =
    path: 'M 0,-1 0,1'
    strokeOpacity: 1
    scale: 4
  path = new google.maps.Polyline
    path: directions.routes[0].overview_path
    # geodesic: true
    strokeOpacity: 0.5
    strokeColor: '#ff3700'
    strokeWeight: 5
  path.setMap(map)

constructInfoWindow = (station, show=true) ->
  infowindow = new google.maps.InfoWindow
    content: "<b>#{station.availableBikes} bikes #{station.availableDocks} docks</b>"

zoomToFit = ->
  bounds = new google.maps.LatLngBounds()
  bounds.extend(youLatLng)
  bounds.extend(stationLatLng)
  map.fitBounds(bounds)
  map.setZoom(map.getZoom() - 1)

activateStation = (station, index, trigger=true) ->
  console.log 'activate station ' + index
  marker = dropMarker(station)
  zoomToFit()
  # google.maps.event.trigger(marker, 'click')
  setTimeout ->
    google.maps.event.trigger(marker, 'click')
  , 5
  drawPath(index)
  $('.station').removeClass('active')
  $('.station' + index).addClass('active')

scrollTo = (station) ->
  # console.log 'scroll to', station
  # $('.station').removeClass('active')
  # $('#' + station.id).addClass('active')


allMarkers = []
showAll = (bool) ->
  if bool
    if map.getZoom() > 16
      map.setZoom(map.getZoom() - 2)
    for station in nearestStations
      allMarkers.push dropMarker(station)
    marker.setMap(null) if marker?
    path.setMap(null) if path?
    $('.stations .station').removeClass 'active'
  else
    for mark in allMarkers
      mark.setMap(null)
    allMarkers = []
    # TODO activate selected station

animateTo = ($station) ->
  scrollTo = $station.offset().top - $('.stations').offset().top + $('.stations').scrollTop() - 60

  # $('.stations').scrollTop(scrollTo)
  $('.stations').animate
    scrollTop: scrollTo
  , 150

Mousetrap.bind ['down', 'j'], ->
  animateTo $('.station.active').next()
  $('.station.active')
    .removeClass('active')
    .next().addClass('active').click()
  if $('.station.active').length is 0
    $('.station').last().addClass('active')
  false

Mousetrap.bind ['up', 'k'], ->
  animateTo $('.station.active').prev()
  $('.station.active')
    .removeClass('active')
    .prev().addClass('active').click()
  if $('.station.active').length is 0
    $('.stations .station').first().addClass('active')
  animateTo $('.station.active')
  false


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
      html = """
        <div class="station station#{index}" id="#{station.id}">
          <div class="numbikes"></div>
          <div class="name"></div>
          <div class="eta"></div>
        </div>
      """
      $('.stations').append(html)
      $station = $('.station' + index)
      $station.find('.numbikes').text(station.availableBikes)
      $station.find('.name').text(station.stationName)
      $station.addClass('active') if index is 0

    for station, index in nearestStations[0..4]
      $station = $('.station' + index)
      request =
        origin: startPoint
        destination: station.latitude + ',' + station.longitude
        travelMode: google.maps.TravelMode.WALKING

      if index == 0
        # console.log 'it is happening'
        firstCallback = =>
          # activateStation(nearestStations[0], 0)
          $('.stations .station').first().click()
            # infowindow = constructInfoWindow(nearestStations[0])
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

$ ->
  $('.toggle_all').click ->
    if $(@).hasClass('all')
      showAll(false)
      $(@).text("Show all")
      activateStation(nearestStations[0], 0)
    else
      showAll(true)
      $(@).text("Show closest")
    $(@).toggleClass('all')

mapStyle = [
    "featureType": "landscape.man_made"
    "elementType": "geometry.stroke"
  ,
    "featureType": "water"
    "elementType": "labels.text.stroke"
    "stylers": [
      "color": "#2A5082"
      "visibility": "off"
    ]
  ,
    "featureType": "poi.park"
    "elementType": "geometry.fill"
    "stylers": [
      "color": "#D6E0CC"
    ]
  ,
    "featureType": "landscape.natural.landcover"
    "elementType": "geometry"
    "stylers": [
      "color": "#D6E0CC"
    ]
  ,
    "featureType": "landscape.man_made"
    "elementType": "geometry.fill"
    "stylers": [
      "color": "#EEE7DD"
      "visibility": "on"
    ]
  ,
    "featureType": "poi.attraction"
    "elementType": "labels.text.stroke"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.attraction"
    "elementType": "geometry.fill"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.attraction"
    "elementType": "labels.text.fill"
    "stylers": [
      "color": "#574400"
    ]
  ,
    "featureType": "poi.business"
    "elementType": "geometry.fill"
    "stylers": [
      "color": "#808080"
      "visibility": "off"
    ]
  ,
    "featureType": "poi.government"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.medical"
    "elementType": "geometry.fill"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.place_of_worship"
    "elementType": "geometry.fill"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.school"
    "elementType": "geometry.fill"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.sports_complex"
    "elementType": "geometry"
    "stylers": [
      "color": "#808080"
      "visibility": "off"
    ]
  ,
    "featureType": "road"
    "elementType": "geometry.stroke"
    "stylers": [
      "visibility": "on"
      "color": "#E0D9CF"
    ]
  ,
    "featureType": "road.highway"
    "elementType": "geometry.fill"
    "stylers": [
      "color": "#EED18F"
    ]
  ,
    "featureType": "road.highway"
    "elementType": "geometry.stroke"
    "stylers": [
      "color": "#D6BA7A"
    ]
  ,
    "featureType": "poi"
    "elementType": "labels.text.stroke"
    "stylers": [
      "color": "#808080"
      "visibility": "off"
    ]
  ,
    "featureType": "poi"
    "elementType": "labels.text.fill"
    "stylers": [
      "color": "#808080"
    ]
  ,
    "featureType": "road"
    "elementType": "geometry"
    "stylers": [
      "color": "#ffffff"
    ]
  ,
    "elementType": "labels.text.stroke"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "road"
    "elementType": "labels.text.fill"
    "stylers": [
      "color": "#808080"
    ]
  ,
    "featureType": "road"
    "elementType": "labels.text.stroke"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "road"
    "elementType": "geometry.stroke"
    "stylers": [
      "color": "#E0D9CF"
    ]
  ,
    "featureType": "transit.station.rail"
    "elementType": "labels.text.fill"
    "stylers": [
      "color": "#000000"
    ]
  ,
    "featureType": "transit.station"
    "elementType": "labels.text.stroke"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "transit.line"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi"
    "elementType": "geometry"
    "stylers": [
      "color": "#D6E0CC"
    ]
  ,
    "featureType": "poi.attraction"
    "elementType": "geometry"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.attraction"
    "elementType": "geometry.fill"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.business"
    "elementType": "labels.icon"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "poi.school"
    "elementType": "labels.icon"
    "stylers": [
      "color": "#808080"
      "visibility": "off"
    ]
  ,
    "featureType": "poi"
    "elementType": "labels.icon"
    "stylers": [
      "visibility": "off"
    ]
  ,
    "featureType": "landscape"
    "elementType": "labels.text"
    "stylers": [
      "color": "#808080"
    ]
  ,
    "featureType": "road.highway"
    "elementType": "labels.icon"
    "stylers": [
      "saturation": -100
      "visibility": "on"
      "lightness": 38
    ]
  ,
    "featureType": "water"
    "elementType": "geometry.fill"
    "stylers": [
      "color": "#CDE5F1"
    ]
  ,
    "featureType": "landscape"
]

