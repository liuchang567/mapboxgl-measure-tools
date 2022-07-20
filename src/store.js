import LineMode from './mode/line'
import AreaMode from './mode/area'
import * as Constants from './constants'

export default function Store(ctx) {
  this.ctx = ctx
  this.LineMode = null
  this.AreaMode = null
  this.tempEleResult = ctx.ui.addTempResult()
  this.tempData = JSON.stringify({
    id: null,
    type: null,
    pointGeojson: Constants.geojsonTypes.FEATURE_COLLECTION,
    lineGeojson: Constants.geojsonTypes.FEATURE_COLLECTION,
    points: [],
    markers: [],
    tooltip: null
  })
  this.sources = []

  this.addPoint = (coords) => {
    if (this.ctx.events.currentMode === Constants.types.LINE) {
      this.LineMode.addPoint(coords)
    } else {
      this.AreaMode.addPoint(coords)
    }
  }

  this.addMeasureResult = (coords) => {
    if (this.ctx.events.currentMode === Constants.types.LINE) {
      this.LineMode.addMeasureResult(coords)
    }
  }

  this.mousemovePoint = (coords) => {
    if (this.ctx.events.currentMode === Constants.types.LINE) {
      this.LineMode.mousemovePoint(coords)
    } else {
      this.AreaMode.mousemovePoint(coords)
    }
  }

  this.addEndPoint = (coords) => {
    if (this.ctx.events.currentMode === Constants.types.LINE) {
      this.LineMode.addEndPoint(coords)
    } else {
      this.AreaMode.addEndPoint(coords)
    }
  }

  this.clearCurFeature = (type) => {
    if (type === Constants.types.LINE) {
      this.LineMode.clearCurFeature()
    } else {
      this.AreaMode.clearCurFeature()
    }
  }

  this.deleteFeature = (type, fid) => {
    if (type === Constants.types.LINE) {
      this.LineMode.deleteFeature(fid)
    } else {
      this.AreaMode.deleteFeature(fid)
    }
  }

  this.deleteAll = () => {
    this.sources.filter(feature => feature.id).forEach((feature) => {
      if (feature.type === Constants.types.LINE) {
        this.LineMode.deleteFeature(feature.id)
      } else {
        this.AreaMode.deleteFeature(feature.id)
      }
    })
  }

  this.init = () => {
    this.sources.push(JSON.parse(this.tempData))
    if (this.ctx.options.controls.line) {
      this.LineMode = new LineMode(this.ctx)
      this.LineMode.init()
    }
    if (this.ctx.options.controls.area) {
      this.AreaMode = new AreaMode(this.ctx)
      this.AreaMode.init()
    }
  }

  this.init()
}