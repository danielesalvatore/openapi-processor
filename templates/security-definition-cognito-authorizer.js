module.exports = {
    "CognitoAuthorizer": {
      "type": "apiKey",
      "name": "Authorization",
      "in": "header",
      "x-amazon-apigateway-authtype": "cognito_user_pools",
      "x-amazon-apigateway-authorizer": {
        "providerARNs": [
          "arn:aws:cognito-idp:region:accNum:userpool/poolId"
        ],
        "type": "cognito_user_pools"
      }
    }
}
