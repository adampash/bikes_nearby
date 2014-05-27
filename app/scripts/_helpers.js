(function() {
  $(function() {
    window.dev = true;
    window.log = function(args) {
      if (dev) {
        return console.log.apply(console, arguments);
      }
    };
    if (dev) {
      return $('body').append($('<script src="//localhost:35729/livereload.js"></script>'));
    }
  });

}).call(this);
