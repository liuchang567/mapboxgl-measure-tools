# mapboxgl-measure-tool
基于mapboxgl，turf的测量工具

### 截图

支持连续测量

![enter image description here](https://github.com/liuchang567/mapboxgl-measure-tools/blob/master/assets/result.jpg?inline=false)

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

#### options

##### 显示的功能 不需要显示-》false
```
controls: {
  line: true,
  area: true
}
```
##### 按钮的icon
```
controlsSvg: {
  iconLine: svg,
  iconArea: svg,
  iconDel: svg
}
```

##### 测距的样式 style参考mapboxgl的style
```
style: {
  line-stroke-move: style,
  line-stroke: style,
  line-points: style,
  area-stroke-fill: style,
  area-stroke: style,
  area-points: style
}
```
##### 测距的结果显示位置   参考mapboxgl的marker的配置
```
markerAnchor: {
  result: {
    anchor: 'left',
    offset: [8, 0]
  },
  close: {
    anchor: 'bottom-right',
    offset: [25, 25]
  }
}
```

#### api
  disable -切换其他功能是调用，停止绘制
  // todo...