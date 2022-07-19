import * as Constants from './constants'

export default function(ctx) {
  const buttonElements = {}
  let activeButton = null

  function clearBtnClasses() {
    activeButton = null
    if ( buttonElements.line) buttonElements.line.classList.remove(Constants.classes.ON)
    if ( buttonElements.area) buttonElements.area.classList.remove(Constants.classes.ON)
  }

  function createControlButton(id, options = {}) {
    const button = document.createElement('button')
    button.className = options.className
    button.setAttribute('title', options.title)
    button.innerHTML = options.icon
    options.container.appendChild(button)

    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (id !== Constants.types.DEL) {
        const clickedButton = e.target
        if (clickedButton === activeButton) {
          deactivateButtons()
          options.onDeactivate()
          return
        }
        setActiveButton(id) 
      }
      options.onActivate()
    }, true)

    return button
  }

  function deactivateButtons() {
    if (!activeButton) return;
    activeButton.classList.remove(Constants.classes.ON)
    activeButton = null
  }

  function setActiveButton(id) {
    deactivateButtons()

    const button = buttonElements[id]
    if (!button) return

    if (button) {
      button.classList.add(Constants.classes.ON)
      activeButton = button
    }
  }

  function addButtons() {
    
    const controls = ctx.options.controls
    const controlsSvg = ctx.options.controlsSvg
    const controlGroup = document.createElement('div')
    controlGroup.className = Constants.classes.TOOL_GROUP

    if (!controls) return controlGroup

    if (controls.line) {
      buttonElements.line = createControlButton(Constants.types.LINE, {
        container: controlGroup,
        className: Constants.classes.TOOL_lINE,
        title: Constants.titles.LINE,
        icon: controlsSvg.iconLine,
        onActivate: () => ctx.events.changeFeature(Constants.types.LINE),
        onDeactivate: () => ctx.events.clearCurFeature(Constants.types.LINE)
      })
    }
    if (controls.area) {
      buttonElements.area = createControlButton(Constants.types.AREA, {
        container: controlGroup,
        className: Constants.classes.TOOL_AREA,
        title: Constants.titles.AREA,
        icon: controlsSvg.iconArea,
        onActivate: () => ctx.events.changeFeature(Constants.types.AREA),
        onDeactivate: () => ctx.events.clearCurFeature(Constants.types.AREA)
      })
    }

    buttonElements.del = createControlButton(Constants.types.DEL, {
      container: controlGroup,
      className: Constants.classes.TOOL_DEL,
      title: Constants.titles.DEL,
      icon: controlsSvg.iconDel,
      onActivate: () => ctx.events.deleteAll()
    })

    return controlGroup
  }

  function addMarkerResult(type, isClose = false, fid){
    const ele = document.createElement('div')
    ele.setAttribute('class', Constants.classes.RESULT)
    if (isClose) {
      ele.classList.add(Constants.classes.CLOSE)
      ele.setAttribute('data-id', fid)
      ele.innerHTML = 'X'
    }
    ele.onclick = (e)  => {
      e.preventDefault()
      e.stopPropagation()
      ctx.events.deleteFeature(type, fid)
    }
    return ele
  }

  function addTempResult(){
    const ele = document.createElement('div')
    ele.setAttribute('class', Constants.classes.RESULT)
    return ele
  }

  return {
    addButtons,
    addMarkerResult,
    addTempResult,
    clearBtnClasses
  }
}