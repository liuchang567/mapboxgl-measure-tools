
import mapboxgl from 'mapbox-gl'
import { lineString } from '@turf/helpers'
import turfLength from '@turf/length'
import * as Constants from '../constants'
import Feature from './feature'

const LineMode = function (ctx, geojson) {
  Feature.call(this, ctx, geojson)
}

LineMode.prototype.init = function () {
  this.initSources()
  this.initLayers()
  return this
}

LineMode.prototype.initSources = function () {
  let ctx = this.ctx
  let geijson = {
    data: Constants.geojsonTypes.FEATURE_COLLECTION,
    type: 'geojson'
  }
  ctx.map.addSource('line-points-source', geijson)
  ctx.map.addSource('line-stroke-source', geijson)
  ctx.map.addSource('line-stroke-move-source', geijson)
}

LineMode.prototype.initLayers = function () {
  let ctx = this.ctx

  ctx.map.addLayer({
    id: 'line-points-layer',
    type: 'circle',
    source: 'line-points-source',
    paint: ctx.options.style['line-points'],
    filter: ['==', Constants.types.LINE, ['get', 'measureType']]
  })

  ctx.map.addLayer({
    id: 'line-stroke-move-layer',
    type: 'line',
    source: 'line-stroke-move-source',
    paint: ctx.options.style['line-stroke-move'],
  })

  ctx.map.addLayer({
    id: 'line-stroke-layer',
    type: 'line',
    source: 'line-stroke-source',
    paint: ctx.options.style['line-stroke'],
    filter: ['==', Constants.types.LINE, ['get', 'measureType']]
  })
}

LineMode.prototype.addPoint = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]
  const pointGeojson = data.pointGeojson

  this.addLine(coords)

  pointGeojson.features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords,
    },
    properties: {
      measureType: Constants.types.LINE
    }
  })

  this.ctx.map.getSource('line-points-source').setData(pointGeojson)
}

LineMode.prototype.addLine = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]
  const pointGeojson = data.pointGeojson
  const lineGeojson = data.lineGeojson

  if (pointGeojson.features.length > 0) {
    const prev = pointGeojson.features[pointGeojson.features.length - 1]
    lineGeojson.features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [prev.geometry.coordinates, coords]
      },
      properties: {
        measureType: Constants.types.LINE
      }
    })
    this.ctx.map.getSource('line-stroke-source').setData(lineGeojson)
  }
}

LineMode.prototype.addMeasureResult = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]

  if (data.markers.length > 0) {
    let lastMarker = data.markers[data.markers.length - 1]
    let lastMarLnglat = lastMarker.getLngLat()
    if (lastMarLnglat.lng === coords[0] && lastMarLnglat.lat === coords[1]) return
  }

  const ele = this.ctx.ui.addMarkerResult()
  const option = this.ctx.options.markerAnchor.result
  option.element = ele
  ele.innerHTML = data.points.length === 0 ? Constants.titles.SPOINT : this.getLength(coords)

  const marker = new mapboxgl.Marker(option)
    .setLngLat(coords)
    .addTo(this.ctx.map)
  data.markers.push(marker)
  data.points.push(coords)
}

LineMode.prototype.mousemovePoint = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]
  const pointGeojson = data.pointGeojson
  if (pointGeojson.features.length > 0) {
    const prev = pointGeojson.features[pointGeojson.features.length - 1]
    const json = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [prev.geometry.coordinates, coords]
      },
      properties: {
        measureType: Constants.types.LINE
      }
    }
    this.ctx.map.getSource('line-stroke-move-source').setData(json)

    this.ctx.store.tempEleResult.innerHTML = this.getLength(coords)
    const option = this.ctx.options.markerAnchor.result
    option.element = this.ctx.store.tempEleResult
    data.tooltip = new mapboxgl.Marker(option)
      .setLngLat(coords)
      .addTo(this.ctx.map)
  }
}

LineMode.prototype.addEndPoint = function (coords) {
  let sources = this.ctx.store.sources
  const acId = Date.now()
  const inx = sources.length - 1
  const ele = this.ctx.ui.addMarkerResult(Constants.types.LINE, true, acId, inx)
  const option = this.ctx.options.markerAnchor.close
  option.element = ele
  const data = sources[inx]
  if (data.pointGeojson.features.length > 1) {
    this.addPoint(coords)
    this.addMeasureResult(coords)
    data.tooltip.remove()
    this.addActiveLayers(acId)
    data.markers.push(new mapboxgl.Marker(option).setLngLat(coords).addTo(this.ctx.map))
  } else {
    data.markers[0].remove()
  }

  this.clearMeasure()
  sources.push(JSON.parse(this.ctx.store.tempData))
  this.ctx.store.tempEleResult.innerHTML = ''
}

LineMode.prototype.getLength = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]
  const _points = data.points.concat([coords])
  const line = lineString(_points)
  let len = turfLength(line)
  if (len < 1) {
    len = `${Math.round(len * 1000)}m`
  } else {
    len = `${len.toFixed(2)}km`
  }
  return len
}

LineMode.prototype.addActiveLayers = function (acId) {
  let ctx = this.ctx
  let map = ctx.map
  let sources = this.ctx.store.sources
  let inx = sources.length - 1

  sources[inx].id = acId
  sources[inx].type = Constants.types.LINE

  map.addSource(`ac-line-points-source-${acId}`, {
    type: 'geojson',
    data: sources[inx].pointGeojson
  })
  map.addSource(`ac-line-stroke-source-${acId}`, {
    type: 'geojson',
    data: sources[inx].lineGeojson
  })

  map.addLayer({
    id: `ac-line-stroke-layer-${acId}`,
    type: 'line',
    source: `ac-line-stroke-source-${acId}`,
    paint: ctx.options.style['line-stroke'],
    filter: ['==', Constants.types.LINE, ['get', 'measureType']]
  })
  map.addLayer({
    id: `ac-line-points-layer-${acId}`,
    type: 'circle',
    source: `ac-line-points-source-${acId}`,
    paint: ctx.options.style['line-points'],
    filter: ['==', Constants.types.LINE, ['get', 'measureType']]
  })

}

LineMode.prototype.clearMeasure = function () {
  let map =  this.ctx.map
  let data = Constants.geojsonTypes.FEATURE_COLLECTION
  map.getSource('line-points-source').setData(data)
  map.getSource('line-stroke-move-source').setData(data)
  map.getSource('line-stroke-source').setData(data)
}

LineMode.prototype.clearCurFeature = function () {
  this.clearMeasure()
  let sources = this.ctx.store.sources
  let inx = sources.length - 1
  sources[inx].markers.forEach(mak => {
    mak.remove()
  })
  sources.splice(inx, 1)
  this.ctx.store.tempEleResult.innerHTML = ''
  sources.push(JSON.parse(this.ctx.store.tempData))
}

LineMode.prototype.deleteFeature = function (fid) {
  let map = this.ctx.map
  let sources = this.ctx.store.sources
  let inx = sources.findIndex(it => it.id === fid)
  map.removeLayer(`ac-line-points-layer-${fid}`)
  map.removeLayer(`ac-line-stroke-layer-${fid}`)
  map.removeSource(`ac-line-points-source-${fid}`)
  map.removeSource(`ac-line-stroke-source-${fid}`)
 
  sources[inx].markers.forEach(mak => {
    mak.remove()
  })
  sources.splice(inx, 1)
}  

export default LineMode