const fs = require('fs')
const Path = require('path')
const chalk = require('chalk')

const _loadLocalFile = ({path}) => {
  const resolvedPath = Path.resolve(path)
  try {
    fs.existsSync(resolvedPath)
  } catch (err) {
    _logError(err)
    throw new Error(`Input file doesn't exists! ${resolvedPath} seems to be an invalid file path`)
  }

  return fs.readFileSync(resolvedPath, 'utf8')
}
module.exports.loadLocalFile = _loadLocalFile

const _loadJSON = ({path}) => {
  let content = _loadLocalFile({path})

  try {
    result = JSON.parse(content)
  } catch (err) {
    _logError(err)
    throw new Error(`Input is not a valid JSON! ${resolvedPath} seems to be an invalid JSON file`)
  }

  return result
}
module.exports.loadJSON = _loadJSON

const _loadOpenAPITemplate = ({path}) => {
  // TODO add validation
  return _loadJSON({path})
}
module.exports.loadOpenAPITemplate = _loadOpenAPITemplate

const _loadJS = ({path}) => {
  return require(path)
}
module.exports.loadJS = _loadJS

const _writeJSON = ({filename, content}) => {
  return fs.writeFileSync(Path.resolve(filename), content)
}
module.exports.writeJSON = _writeJSON

const _writeOutputFile = ({filename, content}) => {
  return _writeJSON({filename, content: JSON.stringify(content, null, 4)})
}

module.exports.writeOutputFile = _writeOutputFile

const _logSuccess = text => {
  console.log(chalk.green(text))
}
module.exports.logSuccess = _logSuccess

const _logInfo = text => {
  console.log(chalk.blue(text))
}
module.exports.logInfo = _logInfo

const _logError = text => {
  console.log(chalk.red(text))
}
module.exports.logError = _logError

function _createOutputFilename(params = {}) {
  const {prefix, extension = 'json', excludeOutputFolder} = params
  const {originalFilename, keepOriginalFilename, outputFolder} = (features = _getConfig())

  const filenameWithoutExt = originalFilename
    .split('.')
    .reverse()[1]
    .split('/')
    .reverse()[0]

  const postfix = createPostfix({features, keepOriginalFilename})

  const pref = `${excludeOutputFolder ? '' : `${outputFolder}/`}`
  const filenamePref = !!prefix ? prefix : ''
  const filename = `${pref}${filenamePref}${filenameWithoutExt}${postfix}.${extension}`

  return filename

  function createPostfix({features, keepOriginalFilename}) {
    if (keepOriginalFilename) {
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
module.exports.createOutputFilename = _createOutputFilename

function _createCloudFormationTemplateFilename(params) {
  return _createOutputFilename({...params, prefix: 'CFT_'})
}
module.exports.createCloudFormationTemplateFilename = _createCloudFormationTemplateFilename

function _createAPIsSpecificationFilename(params) {
  return _createOutputFilename({...params})
}
module.exports.createAPIsSpecificationFilename = _createAPIsSpecificationFilename

function _getConfig() {
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
    OUTPUT_KEEP_ORIGINAL_FILENAME,
    INTEGRATION_FINAL_URI,
    INTEGRATION_URI_TO_REPLACE,
    TAGS,
    APPLICATION_NAME,
    ADD_COGNITO_AUTHORIZER,
  } = process.env

  if (!INPUT_OPENAPI_API) {
    throw new Error(
      `Impossible to load OpenAPI API file. 'INPUT_OPENAPI_API' not specified in .env file`,
    )
  }

  return {
    ...process.env,
    addCors: ADD_CORS === 'true',
    addApiKey: ADD_API_KEY === 'true',
    addIntegrationURI: !!INTEGRATION_FINAL_URI || !!INTEGRATION_URI_TO_REPLACE,
    addTags: !!TAGS,
    originalFilename: INPUT_OPENAPI_API,
    outputFolder: OUPUT_FOLDER,
    addInfo: !!INFO_VERSION || !!INFO_TITLE,
    addHost: !!HOST || !!BASE_PATH,
    addSchemes: !!SCHEMES,
    addCognito: ADD_COGNITO_AUTHORIZER === 'true',
    keepOriginalFilename: OUTPUT_KEEP_ORIGINAL_FILENAME === 'true',
    applicationName: APPLICATION_NAME,
  }
}
module.exports.getConfig = _getConfig
