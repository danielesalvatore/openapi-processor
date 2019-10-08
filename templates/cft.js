module.exports = {
  AWSTemplateFormatVersion: '2010-09-09',
  Description: 'CloudFormation template for API Gateway',
  Metadata: {
    LastUpdate: '04-10-2019',
  },
  Parameters: {
    ApplicationName: {
      Description: 'Name of the application',
      Type: 'String',
    },
    Environment: {
      Description: 'Environment',
      Type: 'String',
      AllowedValues: ['Development', 'QA', 'Production'],
      Default: 'Development',
    },
    CodeS3Bucket: {
      Description: 'S3 bucket where the swagger file file is stored',
      Type: 'String',
      Default: 'fao-aws-configuration-files',
    },
    SwaggerFile: {
      Description: 'Swagger File Name',
      Type: 'String',
    },
    EndpointType: {
      Description: 'List of endpoint types of an API or its custom domain name',
      Type: 'String',
      AllowedValues: ['EDGE', 'REGIONAL', 'PRIVATE'],
    },
  },
  Resources: {
    RestApi: {
      Type: 'AWS::ApiGateway::RestApi',
      Properties: {
        Name: '!Ref ApplicationName',
        EndpointConfiguration: {
          Types: ['!Ref EndpointType'],
        },
        FailOnWarnings: 'true',
        Body: {
          'Fn::Transform': {
            Name: 'AWS::Include',
            Parameters: {
              Location: {
                'Fn::Sub': 's3://${CodeS3Bucket}/${ApplicationName}/${SwaggerFile}',
              },
            },
          },
        },
      },
    },
  },
}
