import mapboxgl from 'mapbox-gl'
import { polygon } from '@turf/helpers'
import turfArea from '@turf/area'
import * as Constants from '../constants'
import Feature from './feature'


const AreaMode = function (ctx, geojson) {
  Feature.call(this, ctx, geojson)
}

AreaMode.prototype.init = function () {
  this.initSources()
  this.initLayers()
  return this
}

AreaMode.prototype.initSources = function () {
  let ctx = this.ctx
  let geijson = {
    data: Constants.geojsonTypes.FEATURE_COLLECTION,
    type: 'geojson'
  }
  ctx.map.addSource('area-points-source', geijson)
  ctx.map.addSource('area-stroke-source', geijson)
}

AreaMode.prototype.initLayers = function () {
  let ctx = this.ctx

  ctx.map.addLayer({
    id: 'area-stroke-fill-layer',
    type: 'fill',
    source: 'area-stroke-source',
    paint: ctx.options.style['area-stroke-fill'],
    filter: ['==', Constants.types.AREA, ['get', 'measureType']]
  })

  ctx.map.addLayer({
    id: 'area-stroke-layer',
    type: 'line',
    source: 'area-stroke-source',
    paint: ctx.options.style['area-stroke'],
    filter: ['==', Constants.types.AREA, ['get', 'measureType']]
  })
  ctx.map.addLayer({
    id: 'area-points-layer',
    type: 'circle',
    source: 'area-points-source',
    paint: ctx.options.style['area-points'],
    filter: ['==', Constants.types.AREA, ['get', 'measureType']]
  })
}

AreaMode.prototype.addPoint = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]
  const pointGeojson = data.pointGeojson

  data.points.push(coords)

  this.addLine(coords)

  pointGeojson.features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords,
    },
    properties: {
      measureType: Constants.types.AREA
    }
  })

  this.ctx.map.getSource('area-points-source').setData(pointGeojson)
}

AreaMode.prototype.addLine = function (coords) {
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
        measureType: Constants.types.AREA
      }
    })
  }
}

AreaMode.prototype.addMeasureResult = function (coords) {
  const map = this.ctx.map
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]

  const ele = this.ctx.ui.addMarkerResult()
  const option = this.ctx.options.markerAnchor.result
  option.element = ele
  ele.innerHTML = this.getArea(coords)

  const marker = new mapboxgl.Marker(option)
    .setLngLat(coords)
    .addTo(map)
  data.markers.push(marker)
  data.points.push(coords)
}

AreaMode.prototype.mousemovePoint = function (coords) {
  let sources = this.ctx.store.sources
  const data = sources[sources.length - 1]
  const pointGeojson = data.pointGeojson
  let len = pointGeojson.features.length

  let ele = this.ctx.store.tempEleResult

  if (len === 0) {
    ele.innerHTML = ''
  } else if (len === 1) {
    ele.innerHTML = Constants.titles.CONTINUE
  } else {
    let pts = data.points.concat([coords])
    pts = pts.concat([data.points[0]])
    let json = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [pts]
      },
      properties: {
        measureType: Constants.types.AREA
      }
    }
    this.ctx.map.getSource('area-stroke-source').setData(json)
    ele.innerHTML = this.getArea(coords)
  
  }

  const option = this.ctx.options.markerAnchor.result
  option.element = ele
  data.tooltip = new mapboxgl.Marker(option)
  .setLngLat(coords)
  .addTo(map)
}

AreaMode.prototype.addEndPoint = function (coords) {
  let sources = this.ctx.store.sources
  const acId = Date.now()
  const inx = sources.length - 1
  const ele = this.ctx.ui.addMarkerResult(Constants.types.AREA, true, acId, inx)
  const option = this.ctx.options.markerAnchor.close
  option.element = ele
  const data = sources[inx]
  if (data.pointGeojson.features.length > 1) {
    this.addPoint(data.pointGeojson.features[0].geometry.coordinates)
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

AreaMode.prototype.getArea = function (coords) {
  let sources = this.ctx.store.sources
  const inx = sources.length - 1
  let data = sources[inx]
  let pts = data.points.concat([coords])
  pts = pts.concat([data.points[0]])
  let _polygon = polygon([pts])
  let area = turfArea(_polygon)
  area = Math.round(area) + 'm²'
  return area
}

AreaMode.prototype.addActiveLayers = function (acId) {
  let ctx = this.ctx
  let map = ctx.map
  let sources = this.ctx.store.sources
  let inx = sources.length - 1

  sources[inx].id = acId
  sources[inx].type = Constants.types.AREA

  map.addSource(`ac-area-points-source-${acId}`, {
    type: 'geojson',
    data: sources[inx].pointGeojson
  })
  map.addSource(`ac-area-stroke-source-${acId}`, {
    type: 'geojson',
    data: sources[inx].lineGeojson
  })

  map.addSource(`ac-area-stroke-fill-source-${acId}`, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [sources[inx].points]
      },
      properties: {
        measureType: Constants.types.AREA
      }
    }
  })

  map.addLayer({
    id: `ac-area-stroke-fill-layer-${acId}`,
    type: 'fill',
    source: `ac-area-stroke-fill-source-${acId}`,
    paint: ctx.options.style['area-stroke-fill'],
    filter: ['==', Constants.types.AREA, ['get', 'measureType']]
  })
  map.addLayer({
    id: `ac-area-stroke-layer-${acId}`,
    type: 'line',
    source: `ac-area-stroke-source-${acId}`,
    paint: ctx.options.style['area-stroke'],
    filter: ['==', Constants.types.AREA, ['get', 'measureType']]
  })
  map.addLayer({
    id: `ac-area-points-layer-${acId}`,
    type: 'circle',
    source: `ac-area-points-source-${acId}`,
    paint: ctx.options.style['area-points'],
    filter: ['==', Constants.types.AREA, ['get', 'measureType']]
  })

}

AreaMode.prototype.clearMeasure = function () {
  let map = this.ctx.map
  let data = Constants.geojsonTypes.FEATURE_COLLECTION
  map.getSource('area-stroke-source').setData(data)
  map.getSource('area-points-source').setData(data)
}

AreaMode.prototype.clearCurFeature = function () {

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

// 删除选择的要素
AreaMode.prototype.deleteFeature = function (fid) {
  let map = this.ctx.map
  let sources = this.ctx.store.sources
  let inx = sources.findIndex(it => it.id === fid)
  map.removeLayer(`ac-area-stroke-fill-layer-${fid}`)
  map.removeLayer(`ac-area-stroke-layer-${fid}`)
  map.removeLayer(`ac-area-points-layer-${fid}`)
  map.removeSource(`ac-area-points-source-${fid}`)
  map.removeSource(`ac-area-stroke-source-${fid}`)
  map.removeSource(`ac-area-stroke-fill-source-${fid}`)

  sources[inx].markers.forEach(mak => {
    mak.remove()
  })
  sources.splice(inx, 1)
}

export default AreaMode