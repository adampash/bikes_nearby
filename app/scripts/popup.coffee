'use strict'

map = null
marker = null
youLatLng = null
stationLatLng = null
infowindow = null
path = null

mapStyle = [
  {
    featureType: "poi.school"
    elementType: "geometry.fill"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "poi.park"
    stylers: [color: "#B5B4B3"]
  }
  {
    featureType: "poi.attraction"
    elementType: "labels.text.fill"
    stylers: [color: "#969696"]
  }
  {
    featureType: "poi"
    elementType: "labels.text.fill"
    stylers: [color: "#969696"]
  }
  {
    featureType: "road"
    elementType: "geometry"
    stylers: [color: "#FAFAFA"]
  }
  {
    featureType: "poi.sports_complex"
    elementType: "geometry.fill"
    stylers: [color: "#B5B4B3"]
  }
  {
    elementType: "labels.text.stroke"
    stylers: [
      {
        color: "#000000"
      }
      {
        visibility: "off"
      }
    ]
  }
  {
    featureType: "landscape.man_made"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "poi.medical"
    elementType: "geometry.fill"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "poi.government"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "administrative"
    elementType: "geometry.fill"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "poi.place_of_worship"
    elementType: "geometry.fill"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "landscape.natural"
    elementType: "geometry.fill"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "poi.attraction"
    elementType: "geometry.fill"
    stylers: [color: "#D6D6D6"]
  }
  {
    featureType: "water"
    elementType: "geometry.fill"
    stylers: [color: "#9C89AD"]
  }
  {
    featureType: "transit.line"
    stylers: [visibility: "off"]
  }
  {
    elementType: "labels.text.fill"
    stylers: [color: "#5f5f5f"]
  }
  {
    featureType: "transit.station.airport"
    elementType: "geometry.fill"
    stylers: [color: "#B5B4B3"]
  }
]

getEta = (request, $station, index, callback) ->
  directionsService = new google.maps.DirectionsService()
  directionsService.route request, (result, status) ->
    duration = result.routes[0].legs[0].duration.text
    $station.find('.eta').text(duration)
    nearestStations[index].directions = result
    callback() if callback?


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
    icon: "images/you_icon.png"

dropMarker = (station) ->
  stationLatLng = new google.maps.LatLng(station.latitude, station.longitude)
  marker = new google.maps.Marker
    position: stationLatLng
    map: map
    title: station.stationName
    icon: "images/bike_station.png"

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
    # icons: [
    #   icon: lineSymbol
    #   offset: '0'
    #   repeat: '15px'
    # ]
    strokeColor: '#8100ec'
    strokeWeight: 5
  path.setMap(map)

showInfoWindow = (station) ->
  # boxOptions =
  #   content: "#{station.availableBikes}  bikes #{station.availableDocks} docks"
     # fontSize: "14px"
      # color: 'white'
      # width: '150px'
    # pixelOffset: new google.maps.Size(-60, -40)
    # position: new google.maps.LatLng(station.latitude, station.longitude)


#   `
#     var myOptions = {
#      content: "HI THERE"
#   ,boxStyle: {
#      border: "1px solid black"
#     ,textAlign: "center"
#     ,fontSize: "8pt"
#     ,width: "50px"
#    }
#   ,disableAutoPan: true
#   ,pixelOffset: new google.maps.Size(-25, 0)
#   ,position: new google.maps.LatLng(station.latitude, station.longitude)
#   ,closeBoxURL: ""
#   ,isHidden: false
#   ,pane: "mapPane"
#   ,enableEventPropagation: true
#   };
# `


  # infobox = new InfoBox boxOptions
  # infobox.open(map,marker)
  infowindow = new google.maps.InfoWindow
    content: station.availableBikes + ' bikes ' + station.availableDocks + ' docks'
  infowindow.open(map,marker)

zoomToFit = ->
  bounds = new google.maps.LatLngBounds()
  bounds.extend(youLatLng)
  bounds.extend(stationLatLng)
  map.fitBounds(bounds)
  map.setZoom(map.getZoom() - 1)

activateStation = (station, index) ->
  console.log 'activate station ' + index
  dropMarker(station)
  showInfoWindow(station)
  zoomToFit()
  drawPath(index)
  $('.station').removeClass('active')
  $('.station' + index).addClass('active')

animateTo = ($station) ->
  scrollTo = $station.offset().top - $('.stations').offset().top + $('.stations').scrollTop() - 60

  # $('.stations').scrollTop(scrollTo)
  $('.stations').animate
    scrollTop: scrollTo
  , 70

Mousetrap.bind ['down', 'j'], ->
  $('.station.active')
    .removeClass('active')
    .next().addClass('active').click()
  if $('.station.active').length is 0
    $('.station').last().addClass('active')
  animateTo $('.station.active')
  false

Mousetrap.bind ['up', 'k'], ->
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
        <div class="station station#{index}">
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
