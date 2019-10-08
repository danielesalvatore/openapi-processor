const moment = require('moment')
const {
  createCloudFormationTemplateFilename,
  createAPIsSpecificationFilename,
  loadOpenAPITemplate,
  loadJS,
  writeOutputFile,
  logSuccess,
  logInfo,
  getConfig,
} = require('./utils')

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

  logSuccess(`\t✓\tCORS`)

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
    logSuccess(`\t✓\tTitle`)
  }

  if (!!version) {
    template.info.version = version
    logSuccess(`\t✓\tVersion`)
  }

  return template
}

function addHost({template, host, basePath}) {
  if (!!host) {
    template.host = host
    logSuccess(`\t✓\tHost`)
  }

  if (!!basePath) {
    template.basePath = basePath
    logSuccess(`\t✓\tBase Path`)
  }

  return template
}

function addSchemes({template, schemes}) {
  if (!schemes) {
    return template
  }

  const split = schemes.split(',')

  template.schemes = split

  logSuccess(`\t✓\tSchemes`)

  return template
}

function applySecuriyDefinition({template, definition}) {
  // Add API Key security definitions
  if (typeof template.securityDefinitions !== 'object') {
    template.securityDefinitions = {}
  }
  template.securityDefinitions = {
    ...template.securityDefinitions,
    ...definition,
  }

  const apyKeyNames = Object.keys(definition)
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

  return template
}

function addApiKeyDefinition({template}) {
  const definition = loadJS({path: '../templates/security-definition-api-key.js'})

  template = applySecuriyDefinition({
    template,
    definition,
  })

  logSuccess(`\t✓\tAPI Key`)

  return template
}

function addCognitoAuthorizer({template}) {
  const definition = loadJS({path: '../templates/security-definition-cognito-authorizer.js'})

  template = applySecuriyDefinition({
    template,
    definition,
  })

  logSuccess(`\t✓\tCognito API Key`)

  return template
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

  logSuccess(`\t✓\tIntegration URI`)

  return template
}

function addTagsDefinition({template, tags}) {
  if (!Array.isArray(template)) {
    template.tags = []
  }

  const split = tags.split(',')
  split.forEach(t => {
    const [key, value] = t.split(':')
    template.tags.push({[key]: value})
  })

  logSuccess(`\t✓\tTags`)

  return template
}

function writeAPIsSpecification(params) {
  const {template} = params
  const filename = createAPIsSpecificationFilename()

  writeOutputFile({
    content: template,
    filename,
  })

  logInfo(`APIs specification in ${filename}`)
}

function writeCloudFormationTemplate(params) {
  const filename = createCloudFormationTemplateFilename()

  let content = loadJS({path: '../templates/cft.js'})
  const {applicationName} = params

  // Alter Description
  content.Description = `${content.Description}${
    !!applicationName ? ` for ${applicationName}` : ''
  }`

  // Alter Metadata.LastUpdate
  content.Metadata.LastUpdate = moment().format('DD-MM-YYYY')

  writeOutputFile({
    content,
    filename,
  })

  logInfo(`CloudFormation template in ${filename}`)
}

function init() {
  const {
    INPUT_OPENAPI_API,
    INFO_VERSION,
    INFO_TITLE,
    HOST,
    BASE_PATH,
    SCHEMES,
    INTEGRATION_FINAL_URI,
    INTEGRATION_URI_TO_REPLACE,
    TAGS,
    addCors,
    addApiKey,
    addCognito,
    addIntegrationURI,
    addTags,
    originalFilename,
    outputFolder,
    keepOriginalFilename,
    applicationName,
  } = getConfig()

  let template = loadOpenAPITemplate({path: INPUT_OPENAPI_API})
  logSuccess(`\t✓\tLoad template`)

  logInfo(`Start processing...`)

  // Add CORS
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
  if (addApiKey) {
    template = addApiKeyDefinition({template})
  }

  // Add Cognito Authorizer
  if (addCognito) {
    template = addCognitoAuthorizer({template})
  }

  // Replace Integration URI
  if (addIntegrationURI) {
    // Validation: both values have to be provided
    if (!INTEGRATION_FINAL_URI || !INTEGRATION_URI_TO_REPLACE) {
      throw new Error(
        `Impossible to replace integration URI: both 'INTEGRATION_URI_TO_REPLACE' and 'INTEGRATION_FINAL_URI' have to be specified in .env file`,
      )
    }

    template = replaceIntegrationURI({
      template,
      searchValue: INTEGRATION_URI_TO_REPLACE,
      newValue: INTEGRATION_FINAL_URI,
    })
  }

  // Add Tags
  if (addTags) {
    template = addTagsDefinition({
      template,
      tags: TAGS,
    })
  }

  // Write Output files
  const params = {
    template,
    originalFilename,
    outputFolder,
    addCors,
    addInfo,
    addHost,
    addSchemes,
    addApiKey,
    addCognito,
    keepOriginalFilename,
    addIntegrationURI,
    addTags,
    applicationName,
  }
  // APIs specification
  writeAPIsSpecification(params)

  // CloudFormation template
  writeCloudFormationTemplate(params)
}

init()
