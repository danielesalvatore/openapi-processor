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

const _writeJSON = ({content, filename}) => {
  return fs.writeFileSync(Path.resolve(filename), JSON.stringify(content, null, 4))
}
module.exports.writeJSON = _writeJSON

const _writeOutputFile = ({filename, content}) => {
  return _writeJSON({filename, content})
}

module.exports.writeOutputFile = _writeOutputFile

const _logSuccess = text => {
  console.log(chalk.green(text))
}
module.exports.logSuccess = _logSuccess

const _logInfo = text => {
  console.log()
  console.log(chalk.blue(text))
}
module.exports.logInfo = _logInfo

const _logError = text => {
  console.log()
  console.log(chalk.red(text))
}
module.exports.logError = _logError
