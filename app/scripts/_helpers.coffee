((exports) ->
  dev = true
  log = (args) ->
    if dev
      console.log.apply console,  arguments

  exports.log = log
)(exports ? @)
