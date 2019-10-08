const {
  logSuccess,
  logInfo,
  loadLocalFile,
  getConfig,
  createAPIsSpecificationFilename,
  createCloudFormationTemplateFilename,
  loadJSON,
} = require('./utils')
const AWS = require('aws-sdk')

AWS.config.apiVersions = {
  cloudformation: '2010-05-15',
}

// Env file configuration
require('dotenv').config()

function createS3Key({applicationName, environment}) {
  const filename = createAPIsSpecificationFilename({excludeOutputFolder: true})
  return `${applicationName}/${environment}/${filename}`
}

async function uploadToS3({bucket, file, Key}) {
  const S3 = new AWS.S3()

  const params = {
    Bucket: bucket,
    Key,
    Body: file,
  }

  await S3.putObject(params).promise()
}

async function uploadAPISpecififcationsToS3({bucket, applicationName, environment}) {
  const path = createAPIsSpecificationFilename({excludeOutputFolder: false})
  const file = loadLocalFile({path})
  const Key = createS3Key({applicationName, environment})

  await uploadToS3({bucket, file, Key})

  logSuccess(`\t✓\tCFT to S3`)
}

async function createCFT() {
  const {APPLICATION_NAME, ENVIRONMENT, S3_BUCKET, ENDPOINT_TYPE} = getConfig()
  const CF = new AWS.CloudFormation()

  const Parameters = [
    {
      ParameterKey: 'ApplicationName',
      ParameterValue: APPLICATION_NAME,
    },
    {
      ParameterKey: 'Environment',
      ParameterValue: ENVIRONMENT,
    },
    {
      ParameterKey: 'S3Bucket',
      ParameterValue: S3_BUCKET,
    },
    {
      ParameterKey: 'SwaggerFile',
      ParameterValue: createAPIsSpecificationFilename({excludeOutputFolder: true}),
    },
    {
      ParameterKey: 'EndpointType',
      ParameterValue: ENDPOINT_TYPE,
    },
  ]

  const Key = createS3Key({
    environment: ENVIRONMENT,
    applicationName: APPLICATION_NAME,
  })

  const path = createCloudFormationTemplateFilename()
  const template = await loadJSON({path})

  const params = {
    StackName: `API-Gateway${!!APPLICATION_NAME ? `-${APPLICATION_NAME}` : ''}`,
    Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'],
    OnFailure: 'ROLLBACK',
    Parameters,
    TemplateBody: JSON.stringify(template),
  }

  await CF.createStack(params).promise()

  logSuccess(`\t✓\tCFT Created`)
}
async function init() {
  logInfo(`Start deployment...`)

  const {AWS_PROFILE, S3_BUCKET, ENVIRONMENT, APPLICATION_NAME} = getConfig()

  // Load credentials if AWS_PROFILE is provided
  if (!!AWS_PROFILE) {
    const credentials = new AWS.SharedIniFileCredentials({profile: AWS_PROFILE})
    AWS.config.credentials = credentials
    logSuccess(`\t✓\tAWS Profile: ${AWS_PROFILE}`)
  }

  // Upload API Specifications to S3
  await uploadAPISpecififcationsToS3({
    bucket: S3_BUCKET,
    environment: ENVIRONMENT,
    applicationName: APPLICATION_NAME,
  })

  // Create CloudFormation template
  await createCFT({
    bucket: S3_BUCKET,
    environment: ENVIRONMENT,
    applicationName: APPLICATION_NAME,
  })
}

init()
