module.exports = {
  options: {
    summary: 'CORS support',
    description: 'Enable CORS by returning correct headers\n',
    tags: ['CORS'],
    'x-amazon-apigateway-integration': {
      type: 'mock',
      requestTemplates: {
        'application/json': '{\n  "statusCode" : 200\n}\n',
      },
      responses: {
        default: {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers':
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Fao-Key'",
            'method.response.header.Access-Control-Allow-Methods': "'*'",
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          },
          responseTemplates: {
            'application/json': '{}\n',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Default response for CORS method',
        headers: {
          'Access-Control-Allow-Headers': {
            schema: {
              type: 'string',
            },
          },
          'Access-Control-Allow-Methods': {
            schema: {
              type: 'string',
            },
          },
          'Access-Control-Allow-Origin': {
            schema: {
              type: 'string',
            },
          },
          'X-Fao-Key': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  },
}
