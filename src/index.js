// import mapboxgl from 'mapbox-gl'
export class Measure {
  constructor() {
    // 测量状态
    this.isMeasure = false
    // 测量类型
    this.measureType = ''
    // 数据变量
    this.tempJson =JSON.stringify({
      pointJson: {
        'type': 'FeatureCollection',
        'features': []
      },
      lineJson: {
        'type': 'FeatureCollection',
        'features': []
      },
      points: [],
      markers: []
    })
    // 测量数据
    this.measureData = []
    this.timeout = null
    this.mapOnClick = this.mapOnClick.bind(this)
    this.mapOnMousemove = this.mapOnMousemove.bind(this)
    this.mapDblclick = this.mapDblclick.bind(this)
  }
  onAdd(map) {
    this._map = map

    // 初始化按钮
    this.initMeasureToolControl()
    // 
    const ele = document.createElement('div');
    ele.setAttribute('class', 'measure-result')
    this.tempEleResult = ele

    this.measureData.push(JSON.parse(this.tempJson))

    // 初始化数据源跟图层
    this.addTempMeasureSources()
    this.addMeasureLayers()

    // 测距按钮点击事件
    this.lineButton.addEventListener('click', () => {
      if (this.measureType === 'line' || this.measureType === '') {
        if (this.isMeasure) {
          this.isMeasure = false
          this.measureType = ''
          this.lineButton.classList.remove('on')
          this.removeMapEvent()
          this.clearMeasure()
          this.clearData()
        } else {
          this.isMeasure = true
          this.measureType = 'line'
          this.lineButton.classList.add('on')
          this.addMapEvent()
        }
      } else {
        this.measureType = 'line'
        this.areaButton.classList.remove('on')
        this.lineButton.classList.add('on')
        this.removeMapEvent()
        this.clearMeasure()
        this.clearData()
        this.addMapEvent()
      }
    })

    // 测面按钮点击事件
    this.areaButton.addEventListener('click', () => {
      if (this.measureType === 'area' || this.measureType === '') {
        if (this.isMeasure) {
          this.isMeasure = false
          this.measureType = ''
          this.areaButton.classList.remove('on')
          this.removeMapEvent()
          this.clearMeasure()
          this.clearData()
        } else {
          this.isMeasure = true
          this.measureType = 'area'
          this.areaButton.classList.add('on')
          this.addMapEvent()
        }
      } else {
        this.measureType = 'area'
        this.lineButton.classList.remove('on')
        this.areaButton.classList.add('on')
        this.removeMapEvent()
        this.clearMeasure()
        this.clearData()
        this.addMapEvent()
      }
    })

    return this.container
  }
  onRemove() {
    this.container.parentNode.removeChild(this.container)
    this._map = null
  }
  disable() {
    this.isMeasure = false
    this._map.getCanvas().style.cursor = 'default'
  }
  enable() {
    this.isMeasure = true
    this._map.getCanvas().style.cursor = 'crosshair'
  }
  addMapEvent() {
    const map = this._map
    map.doubleClickZoom.disable()
    map.getCanvas().style.cursor = 'crosshair'
    map.on('click', this.mapOnClick)
    map.on('mousemove', this.mapOnMousemove)
    map.on('dblclick', this.mapDblclick)
  }
  removeMapEvent(){
    const map = this._map
    map.doubleClickZoom.enable()
    map.getCanvas().style.cursor = 'default'
    map.off('click', this.mapOnClick)
    map.off('mousemove', this.mapOnMousemove)
    map.off('dblclick', this.mapDblclick)
  }
  clearData(){
    this.tempEleResult.innerHTML = ''

    let data = this.measureData[this.measureData.length - 1]
    data.tooltip.remove()
    data.markers.forEach(mak => {
      mak.remove()
    })
    this.measureData[this.measureData.length - 1] = JSON.parse(this.tempJson)
  }
  initMeasureToolControl() {
    const iconRuler = '<svg t="1575453922172" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5140" width="25" height="30"><path d="M64 335.8v352c0 8.8 6.9 16 15.4 16h865.1c8.5 0 15.4-7.2 15.4-16v-352c0-8.8-6.9-16-15.4-16h-865c-8.6 0-15.5 7.2-15.5 16z m833.2 304H128.8v-256h768.4v256z" p-id="5141"></path><path d="M202.5 577.6h30v62h-30zM320.3 485.3h30v154h-30zM438.1 577.6h30v62h-30zM555.9 485.3h30v154h-30zM673.7 577.6h30v62h-30zM791.5 485.3h30v154h-30z" p-id="5142"></path></svg>'
    const iconArea = '<svg t="1575453274789" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4964" width="25" height="25"><path d="M947.93351 255.639285c16.063496 0 29.06104-12.998035 29.06104-29.059849L976.99455 73.015967c0-16.062837-12.997545-29.060873-29.06104-29.060873L794.334073 43.955094c-16.034842 0-29.060017 12.998035-29.060017 29.060873L765.274056 120.750131l-94.33837 0c-2.937009-0.451278-5.928256-0.451278-8.864241 0L258.72799 120.750131 258.72799 73.015967c0-16.062837-13.027222-29.060873-29.062063-29.060873L76.067513 43.955094c-16.063496 0-29.062063 12.998035-29.062063 29.060873l0 153.563468c0 16.062837 12.998568 29.059849 29.062063 29.059849l47.737143 0 0 506.581594L76.067513 762.220878c-16.063496 0-29.062063 12.997012-29.062063 29.059849l0 153.563468c0 16.062837 12.998568 29.059849 29.062063 29.059849l153.598414 0c16.034842 0 29.062063-12.997012 29.062063-29.059849l0-47.735188 506.545043 0 0 47.735188c0 16.062837 13.026198 29.059849 29.060017 29.059849l153.599437 0c16.063496 0 29.06104-12.997012 29.06104-29.059849L976.993527 791.281751c0-16.062837-12.997545-29.059849-29.06104-29.059849l-47.737143 0L900.195344 354.582761c0.050144-0.984421 0.050144-1.970888 0-2.955308l0-95.988168L947.93351 255.639285zM823.39716 102.07684l95.473264 0 0 95.441723-95.473264 0L823.39716 102.07684zM181.928783 459.920878c1.707968-1.102101 3.328951-2.394537 4.825086-3.89061l277.168724-277.158391 132.079449 0L181.928783 592.929194 181.928783 459.920878zM105.129576 102.07684l95.473264 0 0 46.62797c-0.014327 0.367367-0.02763 0.734734-0.02763 1.106194s0.014327 0.738827 0.02763 1.106194l0 46.601364-95.473264 0L105.129576 102.07684zM229.665927 255.639285c16.034842 0 29.062063-12.998035 29.062063-29.059849l0-47.707558 123.003375 0L181.928783 378.666272 181.928783 255.639285 229.665927 255.639285zM181.928783 675.116031l496.265511-496.244154 87.079762 0 0 35.606962L217.509574 762.220878l-35.580791 0L181.928783 675.116031zM105.129576 915.784346l0-95.441723 95.473264 0 0 46.600341c-0.014327 0.367367-0.02763 0.735757-0.02763 1.106194s0.014327 0.738827 0.02763 1.106194l0 46.62797L105.129576 915.783323zM842.071217 553.748846 563.784997 832.022641c-2.10912 2.109034-3.823229 4.460592-5.148464 6.965645L426.365717 838.988286l415.7055-415.688467L842.071217 553.748846zM918.870424 915.784346l-95.473264 0 0-95.441723 95.473264 0L918.870424 915.784346zM794.334073 762.220878c-16.034842 0-29.060017 12.997012-29.060017 29.059849l0 47.706535L639.011318 838.987263l203.060922-203.051579 0 126.284171L794.334073 762.219855zM842.071217 341.111958 344.174489 838.988286l-85.446499 0 0-35.795251 547.576186-547.552727 35.76704 0L842.071217 341.111958z" p-id="4965"></path></svg>'

    this.container = document.createElement('div')
    this.container.classList.add('mapboxgl-ctrl')
    this.container.classList.add('mapboxgl-ctrl-group')

    // 测距
    this.lineButton = document.createElement('button')
    this.lineButton.classList.add('mapboxgl-ctrl-measure-line-tool')
    this.lineButton.title = '测距'
    this.lineButton.innerHTML = iconRuler
    this.container.appendChild(this.lineButton)

    // 测面
    this.areaButton = document.createElement('button')
    this.areaButton.classList.add('mapboxgl-ctrl-measure-area-tool')
    this.areaButton.title = '测面'
    this.areaButton.innerHTML = iconArea
    this.container.appendChild(this.areaButton)
  }
  addActiveMeasure(acId){
    let map = this._map
    let measureInx = this.measureData.length - 1
    map.addSource(`ac-sour-points-${acId}`, {
      type: 'geojson',
      data: this.measureData[measureInx].pointJson
    })
    map.addSource(`ac-sour-line-${acId}`, {
      type: 'geojson',
      data: this.measureData[measureInx].lineJson
    })
    map.addLayer({
      id: `ac-line-${acId}`,
      type: 'line',
      source: `ac-sour-line-${acId}`,
      paint: {
        'line-color': '#fbb03b',
        'line-width': 2,
        'line-opacity': 0.65
      },
      filter: ['==', 'line', ['get', 'measureType']]
    })
    map.addLayer({
      id: `ac-points-${acId}`,
      type: 'circle',
      source: `ac-sour-points-${acId}`,
      paint: {
        'circle-color': '#ffffff',
        'circle-radius': 3,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fbb03b'
      },
      filter: ['==', 'line', ['get', 'measureType']]
    })

    map.addSource(`ac-sour-points-area-${acId}`, {
      type: 'geojson',
      data: this.measureData[measureInx].pointJson
    })
    map.addSource(`ac-sour-line-area-${acId}`, {
      type: 'geojson',
      data: this.measureData[measureInx].lineJson
    })

    map.addSource(`ac-sour-line-area-fill-${acId}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: this.measureType === 'area' ? [this.measureData[measureInx].points] : []
        },
        properties: {
          measureType: this.measureType
        }
      }
    })

    map.addLayer({
      id: `ac-line-area-${acId}`,
      type: 'fill',
      source: `ac-sour-line-area-fill-${acId}`,
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.1
      },
      filter: ['==', 'area', ['get', 'measureType']]
    })
    map.addLayer({
      id: `ac-line-area-stroke-${acId}`,
      type: 'line',
      source: `ac-sour-line-area-${acId}`,
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
        'line-opacity': 0.65
      },
      filter: ['==', 'area', ['get', 'measureType']]
    })
    map.addLayer({
      id: `ac-points-area-${acId}`,
      type: 'circle',
      source: `ac-sour-points-area-${acId}`,
      paint: {
        'circle-color': '#ffffff',
        'circle-radius': 3,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ff0000'
      },
      filter: ['==', 'area', ['get', 'measureType']]
    })
  }
  addTempMeasureSources() {
    let data = this.measureData[this.measureData.length-1]
    let map = this._map
    map.addSource('points', {
      type: 'geojson',
      data: data.pointJson
    })
    map.addSource('line', {
      type: 'geojson',
      data: data.lineJson
    })
    map.addSource('lineMove', {
      type: 'geojson',
      data: data.lineJson
    })

    map.addSource('points-area', {
      type: 'geojson',
      data: data.pointJson
    })
    map.addSource('line-area', {
      type: 'geojson',
      data: data.lineJson
    })
  }
  addMeasureLayers(){
    let map = this._map
    map.addLayer({
      id: 'lineMove',
      type: 'line',
      source: 'lineMove',
      paint: {
        'line-color': '#fbb03b',
        'line-width': 2,
        'line-dasharray': [0.5, 5]
      }
    })
    map.addLayer({
      id: 'line',
      type: 'line',
      source: 'line',
      paint: {
        'line-color': '#fbb03b',
        'line-width': 2,
        'line-opacity': 0.65
      },
      filter: ['==', 'line', ['get', 'measureType']]
    })
    map.addLayer({
      id: 'points',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-color': '#fff',
        'circle-radius': 3,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fbb03b'
      },
      filter: ['==', 'line', ['get', 'measureType']]
    })

    map.addLayer({
      id: 'line-area',
      type: 'fill',
      source: 'line-area',
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.1
      },
      filter: ['==', 'area', ['get', 'measureType']]
    })
    map.addLayer({
      id: 'line-area-stroke',
      type: 'line',
      source: 'line-area',
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
        'line-opacity': 0.65
      },
      filter: ['==', 'area', ['get', 'measureType']]
    })
    map.addLayer({
      id: 'points-area',
      type: 'circle',
      source: 'points-area',
      paint: {
        'circle-color': '#fff',
        'circle-radius': 3,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ff0000'
      },
      filter: ['==', 'area', ['get', 'measureType']]
    })
  }
  addPoint(coords){
    const map = this._map
    let data = this.measureData[this.measureData.length - 1]
    let pointJson = data.pointJson
    let lineJson = data.lineJson
    if(pointJson.features.length > 0) {
      const prevPoint = pointJson.features[pointJson.features.length - 1]
      lineJson.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [prevPoint.geometry.coordinates, coords]
        },
        properties: {
          measureType: this.measureType
        }
      })
      if (this.measureType === 'line') map.getSource('line').setData(lineJson)
    }
    pointJson.features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coords,
      },
      properties: {
        measureType: this.measureType
      }
    })

    if (this.measureType === 'area') {
      map.getSource('points-area').setData(pointJson)
    } else {
      map.getSource('points').setData(pointJson)
    }
  }
  addMeasureRes(coords) {
    let map = this._map
    let data = this.measureData[this.measureData.length - 1]
    if (data.markers.length > 0) {
      let lastMarker = data.markers[data.markers.length - 1]
      let lastMarLnglat = lastMarker.getLngLat()
      if (lastMarLnglat.lng === coords[0] && lastMarLnglat.lat === coords[1] && this.measureType === 'line') return
    }
    const ele = document.createElement('div')
    ele.setAttribute('class', 'measure-result')
    const option = {
      element: ele,
      anchor: 'left',
      offset: [8, 0]
    }
    if (this.measureType === 'line') {
      ele.innerHTML = data.points.length === 0 ? '起点' : this.getLength(coords)
    } else {
      ele.innerHTML = this.getArea(coords)
    }
    const marker = new mapboxgl.Marker(option)
            .setLngLat(coords)
            .addTo(map)
    data.markers.push(marker)
  }
  getLength(coords) {
    let data = this.measureData[this.measureData.length - 1]
    let _points = data.points.concat([coords])
    let line = turf.lineString(_points)
    let len = turf.length(line)
    if(len < 1) {
      len = Math.round(len * 1000) + 'm'
    } else {
      len = len.toFixed(2) + 'km'
    }
    return len
  }
  getArea(coords) {
    let data = this.measureData[this.measureData.length - 1]
    let pts = data.points.concat([coords])
    pts = pts.concat([data.points[0]])
    let polygon = turf.polygon([pts])
    let area = turf.area(polygon)
    area = Math.round(area) + 'm²'
    return area;
  }
  clearMeasure(){
    let map = this._map
    let json = {
      'type': 'FeatureCollection',
      'features': []
    }
    map.getSource('points').setData(json)
    map.getSource('lineMove').setData(json)
    map.getSource('line').setData(json)

    map.getSource('line-area').setData(json)
    map.getSource('points-area').setData(json)
  }
  mapOnClick(e){
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      if (this.isMeasure) {
        const coords = [e.lngLat.lng, e.lngLat.lat]
        this.addPoint(coords)
        if (this.measureType === 'line') {
          this.addMeasureRes(coords)
        }
        let data = this.measureData[this.measureData.length - 1]
        data.points.push(coords)
        clearTimeout(this.timeout)
      }
    }, 100)
  }
  mapOnMousemove(e){
    if(this.isMeasure) {
      let ele = this.tempEleResult
      let map = this._map
      let data = this.measureData[this.measureData.length - 1]
      const coords = [e.lngLat.lng, e.lngLat.lat]
      let pointJson = data.pointJson
      if (this.measureType === 'line') {
        if (pointJson.features.length > 0) {
          let prev = pointJson.features[pointJson.features.length - 1]
          let json = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [prev.geometry.coordinates, coords]
            },
            properties: {
              measureType: this.measureType
            }
          }
          map.getSource('lineMove').setData(json)
          ele.innerHTML = this.getLength(coords)
        }
      } else {
        let len = pointJson.features.length
        if (len === 0) {
          ele.innerHTML = ''
        } else if (len ===1) {
          ele.innerHTML = '点击地图继续绘制'
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
              measureType: this.measureType
            }
          }
          map.getSource('line-area').setData(json)
          ele.innerHTML = this.getArea(coords)
        }
      }
      
      data['tooltip'] = new mapboxgl.Marker({
        element: ele,
        anchor: 'left',
        offset: [8, 0]
      }).setLngLat(coords)
        .addTo(map)
    }
  }
  mapDblclick(e){
    clearTimeout(this.timeout)
    if(this.isMeasure) {
      const coords = [e.lngLat.lng, e.lngLat.lat]
      let map = this._map
      let data = this.measureData[this.measureData.length - 1]
      
      const ele = document.createElement('div')
      ele.setAttribute('class', 'measure-result close')
      let acId =  Date.now()
      ele.setAttribute('data-id', acId)
      ele.setAttribute('data-inx', this.measureData.length - 1)
      ele.innerHTML = 'x'
      ele.onclick = (__e)  => {
        __e.stopPropagation()
        let inx = __e.srcElement.getAttribute('data-inx')
        let acId = __e.srcElement.getAttribute('data-id')
        map.removeLayer(`ac-points-${acId}`)
        map.removeLayer(`ac-line-${acId}`)
        map.removeSource(`ac-sour-points-${acId}`)
        map.removeSource(`ac-sour-line-${acId}`)
        map.removeLayer(`ac-line-area-${acId}`)
        map.removeLayer(`ac-line-area-stroke-${acId}`)
        map.removeLayer(`ac-points-area-${acId}`)
        map.removeSource(`ac-sour-points-area-${acId}`)
        map.removeSource(`ac-sour-line-area-${acId}`)
        map.removeSource(`ac-sour-line-area-fill-${acId}`)
        data.markers.forEach(mak => {
          mak.remove()
        })
        this.measureData.splice(inx, 1)
      }
      const option = {
        element: ele,
        anchor: 'bottom-right',
        offset: [25, 25]
      }

      if (this.measureType === 'line') {
        if (data.pointJson.features.length > 1) {
          this.addPoint(coords)
          this.addMeasureRes(coords)
          data.tooltip.remove()
          this.addActiveMeasure(acId)
          data.markers.push(new mapboxgl.Marker(option).setLngLat(coords).addTo(map))
        } else {
          data.markers[0].remove()
        }
      } else {
        if (data.pointJson.features.length > 2) {
          this.addPoint(data.pointJson.features[0].geometry.coordinates)
          this.addMeasureRes(coords)
          data.points.push(coords)
          data.tooltip.remove()
          this.addActiveMeasure(acId)
          data.markers.push(new mapboxgl.Marker(option).setLngLat(coords).addTo(map))
        }
      }
      this.clearMeasure()
      this.measureData.push(JSON.parse(this.tempJson))
      this.tempEleResult.innerHTML = ''
    }
  }
}