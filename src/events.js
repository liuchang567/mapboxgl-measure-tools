export default function(ctx) {
  const events = {}

  let currentStatus = false

  events.click = function(event) {
    let { store, events } = ctx
    clearTimeout(events.timeout)
    events.timeout = setTimeout(() => {
      const coords = [event.lngLat.lng, event.lngLat.lat]
      store.addPoint(coords)
      store.addMeasureResult(coords)
      clearTimeout(events.timeout)
    }, 100)
  }

  events.dblclick = function(event) {
    let { store, events } = ctx
    clearTimeout(events.timeout)
    const coords = [event.lngLat.lng, event.lngLat.lat]
    store.addEndPoint(coords)
  }

  events.mousemove = function(event) {
    const { store } = ctx
    const coords = [event.lngLat.lng, event.lngLat.lat]
    store.mousemovePoint(coords)
  }

  const api = {
    currentMode: null,
    timeout: null,
    addEventListeners() {
      ctx.map.on('click', events.click)
      ctx.map.on('dblclick', events.dblclick)
      ctx.map.on('mousemove', events.mousemove)
    },
    removeEventListeners() {
      ctx.map.off('click', events.click)
      ctx.map.off('dblclick', events.dblclick)
      ctx.map.off('mousemove', events.mousemove)
    },
    start() {
      currentStatus = true
      ctx.map.getCanvas().style.cursor = 'crosshair'
      ctx.map.doubleClickZoom.disable()
      this.addEventListeners()
    },
    stop() {
      currentStatus = false
      this.currentMode = null
      ctx.map.getCanvas().style.cursor = 'default'
      ctx.map.doubleClickZoom.enable()
      this.removeEventListeners()
    },
    // 切换要素
    changeFeature(type) {
      if (currentStatus) {
        this.clearCurFeature(this.currentMode)
        if (this.currentMode !== type) {
          this.currentMode = type
          this.start()
        }
      } else {
        this.currentMode = type
        this.start()
      }
    },
    // 清除当前绘制的
    clearCurFeature(type) {
      ctx.store.clearCurFeature(type)
      this.stop()
    },
    // 清除按钮状态
    clearToolClasses() {
      ctx.store.clearCurFeature(this.currentMode)
      ctx.ui.clearBtnClasses()
    },
    // 删除元素
    deleteFeature(type, fid) {
      ctx.store.deleteFeature(type, fid)
    },

    deleteAll() {
      ctx.store.clearCurFeature(this.currentMode)
      this.stop()
      ctx.ui.clearBtnClasses()
      ctx.store.deleteAll()
    }
  }
  return api
}