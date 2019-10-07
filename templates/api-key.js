module.exports = {
  securityDefinitions: {
    api_key: {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
    },
  },
}
