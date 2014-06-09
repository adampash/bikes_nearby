((exports, $, log) ->
  places =
    search: (map, input, callback) ->
      # service = new google.maps.places.PlacesService(map)
      # service.nearbySearch(request, callback)
      autocomplete = new google.maps.places.Autocomplete(input)
      autocomplete.bindTo('bounds', map)

      infowindow = new google.maps.InfoWindow()
      marker = new google.maps.Marker
        map: map
        zIndex: 500


      google.maps.event.addListener autocomplete, 'place_changed', ->
        input.blur()
        infowindow.close()
        marker.setVisible(false)
        place = autocomplete.getPlace()
        return if !place.geometry

        if place.geometry.viewport
          map.fitBounds(place.geometry.viewport)
        else
          map.setCenter(place.geometry.location)
          map.setZoom(17)  # Why 17? Because it looks good.

        # marker.setIcon
        #   url: place.icon
        #   size: new google.maps.Size(71, 71)
        #   origin: new google.maps.Point(0, 0)
        #   anchor: new google.maps.Point(17, 34)
        #   scaledSize: new google.maps.Size(35, 35)
        marker.setPosition(place.geometry.location)
        marker.setVisible(true)

        if place.address_components
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ')

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address)
        # infowindow.open(map, marker)

        callback() if callback?


  exports.places = places
)(exports ? @
  $ ? require('_helpers').$
  log ? require('_helpers').log
)
