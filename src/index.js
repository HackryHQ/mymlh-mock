const db = require('./lib/db');

module.exports.instance;

module.exports = function (config) {
  if (module.exports.instance) {
    return module.exports.instance;
  }

  config = config || {};

  if (!config.clientId) {
    throw new Error('MyMLH client id is required.')
  }

  if (!config.clientSecret) {
    throw new Error('MyMLH client secret is required.')
  }

  if (!config.callbackURLs) {
    throw new Error('At least one callback URL is required.')
  }

  db.setClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret
  });

  db.setCallbackURLs(config.callbackURLs);

  module.exports.instance = {};

  return module.exports.instance;
}
