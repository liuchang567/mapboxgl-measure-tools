import runSetup from './src/setup'
import setupOptions from './src/options'
import setupAPI from './src/api'
// import * as Constants from './src/constants';

const setupMeasureTools = function(options, api) {
  options = setupOptions(options)

  const ctx = {
    options
  }

  api = setupAPI(ctx, api)
  ctx.api = api

  const setup = runSetup(ctx)

  api.onAdd = setup.onAdd
  api.onRemove = setup.onRemove
  api.options = options

  return api
}

function MapboxglMeasureTools(options) {
  setupMeasureTools(options, this)
}

export default MapboxglMeasureTools