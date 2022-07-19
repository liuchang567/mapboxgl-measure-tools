# mapboxgl-measure-tool
基于mapboxgl，turf的测量工具

#### 模块化安装
```
  npm install mapboxgl-measure-tool
```
```js
  import MapboxglMeasureTools from 'mapboxgl-measure-tools'
  import 'mapboxgl-measure-tools/dist/mapboxgl-measure-tools.css'

  // **避免出现测量图层被其他业务图层遮盖，需要在其他业务图层添加之后，再实例化测量控件**
  map.on('style.load', () => {
    map.addControl(new MapboxglMeasureTools(), 'top-right')
  })
  // 或者
  map.on('load', () => {
    map.addControl(new MapboxglMeasureTools(), 'top-right')
  })

```