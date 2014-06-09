(function() {
  (function(exports, $, log) {
    var places;
    places = {
      search: function(map, input, callback) {
        var autocomplete, infowindow, marker;
        autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        infowindow = new google.maps.InfoWindow();
        marker = new google.maps.Marker({
          map: map,
          zIndex: 500
        });
        return google.maps.event.addListener(autocomplete, 'place_changed', function() {
          var address, place;
          input.blur();
          infowindow.close();
          marker.setVisible(false);
          place = autocomplete.getPlace();
          if (!place.geometry) {
            return;
          }
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }
          marker.setPosition(place.geometry.location);
          marker.setVisible(true);
          if (place.address_components) {
            address = [place.address_components[0] && place.address_components[0].short_name || '', place.address_components[1] && place.address_components[1].short_name || '', place.address_components[2] && place.address_components[2].short_name || ''].join(' ');
          }
          infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
          if (callback != null) {
            return callback();
          }
        });
      }
    };
    return exports.places = places;
  })(typeof exports !== "undefined" && exports !== null ? exports : this, typeof $ !== "undefined" && $ !== null ? $ : require('_helpers').$, typeof log !== "undefined" && log !== null ? log : require('_helpers').log);

}).call(this);
