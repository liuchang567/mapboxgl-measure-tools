export default function (ctx, api) {

  api.disable = function() {
    ctx.events.clearToolClasses()
    ctx.events.stop()
    return api
  }

  api.enable = function() {
    ctx.events.start()
    return api
  }

  api.getALLLayers = function() {
    console.log('todo...')
  }

  return api
}
