module.exports = {
  CognitoAuthorizer: {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
    'x-amazon-apigateway-authtype': 'cognito_user_pools',
    'x-amazon-apigateway-authorizer': {
      providerARNs: [],
      type: 'cognito_user_pools',
    },
  },
}
