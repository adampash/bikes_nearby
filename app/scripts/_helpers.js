(function() {
  (function(exports) {
    var dev, log;
    dev = true;
    log = function(args) {
      if (dev) {
        return console.log.apply(console, arguments);
      }
    };
    return exports.log = log;
  })(typeof exports !== "undefined" && exports !== null ? exports : this);

}).call(this);
