const {loadOpenAPITemplate, loadJS, writeOutputFile, logSuccess, logInfo} = require('./utils')

// Env file configuration
require('dotenv').config()

function addOptionsMethods({template}) {
  const {paths} = template

  const keys = Object.keys(paths)
  const {options} = loadJS({path: '../templates/cors-options-method.js'})

  keys.forEach(k => {
    const routeDeclaration = paths[k]
    routeDeclaration.options = {...options}
  })

  logSuccess(`\tCORS \t\t✓`)

  return template
}

function addCorsDefinition({template}) {
  //https://docs.aws.amazon.com/apigateway/latest/developerguide/enable-cors-for-resource-using-swagger-importer-tool.html
  return addOptionsMethods({template})
}

function addInfo({template, title, version}) {
  if (typeof template.info !== 'object') {
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

function addApiKeyDefinition({template}) {
  const {securityDefinitions} = loadJS({path: '../templates/api-key.js'})

  // Add security definitions
  template.securityDefinitions = {...securityDefinitions}
  const apyKeyNames = Object.keys(securityDefinitions)
  const methodSecurityDefinition = apyKeyNames.map(k => ({[k]: []}))

  // Add x-amazon-apigateway-api-key-source Property
  // https://docs.aws.amazon.com/en_pv/apigateway/latest/developerguide/api-gateway-swagger-extensions-api-key-source.html
  template['x-amazon-apigateway-api-key-source'] = 'HEADER'

  // Add API key to each path
  const {paths} = template
  const resources = Object.keys(paths)

  resources.forEach(r => {
    const resourceDefinition = paths[r]
    const methods = Object.keys(resourceDefinition)

    methods.forEach(m => {
      const definition = resourceDefinition[m]

      if (!Array.isArray(definition.security)) {
        definition.security = []
      }
      definition.security = definition.security.concat(methodSecurityDefinition.slice(0))
    })
  })

  logSuccess(`\tAPI Key \t✓`)

  return template
}

function createOutputFilename(params) {
  const {originalFilename, keepFilenameSimple, outputFolder} = params
  const filenameWithoutExt = originalFilename
    .split('.')
    .reverse()[1]
    .split('/')
    .reverse()[0]

  const postfix = createPostfix({features: params, keepFilenameSimple})
  const filename = `${outputFolder}/${filenameWithoutExt}${postfix}.json`

  return filename

  function createPostfix({features, keepFilenameSimple}) {
    if (keepFilenameSimple) {
      return ''
    }
    let prostfix = ''
    const keys = Object.keys(features)
    keys.forEach(f => {
      if (!!features[f] && f.startsWith('add')) {
        const cleaned = f.replace('add', '')
        prostfix = `${prostfix}_${cleaned.toLowerCase()}`
      }
    })

    return prostfix
  }
}

function replaceIntegrationURI({template, searchValue, newValue}) {
  // Add API key to each path
  const {paths} = template
  const resources = Object.keys(paths)

  resources.forEach(r => {
    const resourceDefinition = paths[r]
    const methods = Object.keys(resourceDefinition)
    const integrationField = 'x-amazon-apigateway-integration'
    methods.forEach(m => {
      const definition = resourceDefinition[m]

      if (!!definition[integrationField] && !!definition[integrationField].uri) {
        definition[integrationField].uri = definition[integrationField].uri.replace(
          searchValue,
          newValue,
        )
      }
    })
  })

  logSuccess(`\tIntegration URI \t✓`)

  return template
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
    ADD_API_KEY,
    SIMPLIFIED_OUTPUT_FILENAME,
    PROXY_FINAL_URI,
    PROXY_URI_TO_REPLACE,
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

  // Add API Key
  const addApiKey = ADD_API_KEY === 'true'
  if (addApiKey) {
    template = addApiKeyDefinition({template})
  }

  // Replace Integration URI
  const addIntegrationURI = !!PROXY_FINAL_URI || !!PROXY_URI_TO_REPLACE
  if (addIntegrationURI) {
    // Validation: both values have to be provided
    if (!PROXY_FINAL_URI || !PROXY_URI_TO_REPLACE) {
      throw new Error(
        `Impossible to replace integration URI: both 'PROXY_URI_TO_REPLACE' and 'PROXY_FINAL_URI' have to be specified in .env file`,
      )
    }

    template = replaceIntegrationURI({
      template,
      searchValue: PROXY_URI_TO_REPLACE,
      newValue: PROXY_FINAL_URI,
    })
  }

  // Write output file
  const filename = createOutputFilename({
    originalFilename: INPUT_OPENAPI_API,
    outputFolder: OUPUT_FOLDER,
    addCors,
    addInfo: !!INFO_VERSION || !!INFO_TITLE,
    addHost: !!HOST || !!BASE_PATH,
    addSchemes: !!SCHEMES,
    addApiKey,
    keepFilenameSimple: SIMPLIFIED_OUTPUT_FILENAME === 'true',
    addIntegrationURI,
  })

  writeOutputFile({
    filename,
    content: template,
  })

  logInfo(`Output in ${filename}`)
}

init()
