module.exports = {
  responseParameters: {
    'method.response.header.Access-Control-Allow-Headers':
      "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Fao-Key'",
    'method.response.header.Access-Control-Allow-Methods': "'*'",
    'method.response.header.Access-Control-Allow-Origin': "'*'",
  },
  parameters: [
    {
      in: 'header',
      name: 'Access-Control-Allow-Headers',
      schema: {
        type: 'string',
      },
    },
    {
      in: 'header',
      name: 'Access-Control-Allow-Methods',
      schema: {
        type: 'string',
      },
    },
    {
      in: 'header',
      name: 'Access-Control-Allow-Origin',
      schema: {
        type: 'string',
      },
    },
    {
      in: 'header',
      name: 'X-Fao-Key',
      schema: {
        type: 'string',
      },
    },
  ],
}
