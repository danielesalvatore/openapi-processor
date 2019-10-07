const {loadOpenAPITemplate, loadJS, writeOutputFile} = require('./utils')
const chalk = require('chalk')

// Env file configuration
require('dotenv').config()

function addOptionsMethods({template}) {
  const {paths} = template

  const keys = Object.keys(paths)
  const {options} = loadJS({path: '../templates/cors-options-method.js'})

  keys.forEach(k => {
    const routeDeclaration = paths[k]
    routeDeclaration.options = options
  })

  logSuccess(`\tCORS \t\t✓`)

  return template
}

function addCorsDefinition({template}) {
  //https://docs.aws.amazon.com/apigateway/latest/developerguide/enable-cors-for-resource-using-swagger-importer-tool.html
  return addOptionsMethods({template})
}

function addInfo({template, title, version}) {
  if (template.info !== 'object') {
    template.info = {}
  }

  if (!!title) {
    template.info.title = title
    logSuccess(`\tTitle \t\t✓`)
  }

  if (!!version) {
    template.info.version = version
    logSuccess(`\tVersion \t✓`)
  }

  return template
}

function addHost({template, host, basePath}) {
  if (!!host) {
    template.host = host
    logSuccess(`\tHost \t\t✓`)
  }

  if (!!basePath) {
    template.basePath = basePath
    logSuccess(`\tBase Path \t✓`)
  }

  return template
}

function addSchemes({template, schemes}) {
  if (!schemes) {
    return template
  }

  const split = schemes.split(',')

  template.schemes = split

  logSuccess(`\tSchemes \t✓`)

  return template
}

function createOutputFilename({originalFilename, addCors, outputFolder}) {
  const filenameWithoutExt = originalFilename
    .split('.')
    .reverse()[1]
    .split('/')
    .reverse()[0]

  const filename = `${outputFolder}/${filenameWithoutExt}${addCors ? '_cors' : ''}.json`
  return filename
}

function logSuccess(text) {
  console.log(chalk.green(text))
}

function logInfo(text) {
  console.log()
  console.log(chalk.blue(text))
}

function init() {
  const {
    INPUT_OPENAPI_API,
    ADD_CORS,
    OUPUT_FOLDER,
    INFO_VERSION,
    INFO_TITLE,
    HOST,
    BASE_PATH,
    SCHEMES,
  } = process.env
  if (!INPUT_OPENAPI_API) {
    throw new Error(
      `Impossible to load OpenAPI template. 'INPUT_OPENAPI_API' not specified in .env file`,
    )
  }

  let template = loadOpenAPITemplate({path: INPUT_OPENAPI_API})
  logSuccess(`\tLoad template \t✓`)

  logInfo(`Start processing...`)

  // Add CORS
  const addCors = ADD_CORS === 'true'
  if (addCors) {
    template = addCorsDefinition({template})
  }

  // Alter info values
  template = addInfo({
    template,
    title: INFO_VERSION,
    version: INFO_TITLE,
  })

  // Alter Host values
  template = addHost({template, host: HOST, basePath: BASE_PATH})

  // Alter Schemes
  template = addSchemes({template, schemes: SCHEMES})

  // Write output file
  const filename = createOutputFilename({
    originalFilename: INPUT_OPENAPI_API,
    outputFolder: OUPUT_FOLDER,
    addCors,
  })

  writeOutputFile({
    filename,
    content: template,
  })

  logInfo(`Write Output: \t\t✓`)
}

init()
