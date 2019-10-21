module.exports = {
  responseParameters: {
    'method.response.header.Access-Control-Allow-Headers':
      "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    'method.response.header.Access-Control-Allow-Methods': "'*'",
    'method.response.header.Access-Control-Allow-Origin': "'*'",
  },
  headers: {
    'Access-Control-Allow-Headers': {
      type: 'string',
    },
    'Access-Control-Allow-Methods': {
      type: 'string',
    },
    'Access-Control-Allow-Origin': {
      type: 'string',
    },
  },
}
