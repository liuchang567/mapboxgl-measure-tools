import ui from './ui'
import events from './events'
import Store from './store'

export default function (ctx) {
  let controlContainer = null
  const setup = {
    onRemove() {
      ctx.api.disable()
      ctx.map = null
      ctx.events = null
      ctx.container = null
      ctx.ui = null
      ctx.store = null
      if (controlContainer && controlContainer.parentNode) controlContainer.parentNode.removeChild(controlContainer)
      controlContainer = null
      return this
    },
    onAdd(map) {
      ctx.map = map
      ctx.events = events(ctx)
      ctx.ui = ui(ctx)
      ctx.store = new Store(ctx)
      controlContainer = ctx.ui.addButtons()
      return controlContainer
    },
    addLayers() {}
  }
  ctx.setup = setup
  return setup
}
