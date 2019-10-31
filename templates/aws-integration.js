module.exports = {
  responses: {
    default: {
      statusCode: '200',
    },
  },
  passthroughBehavior: 'when_no_match',
  type: 'http_proxy',
}
