const db = require('./lib/db');
const users = require('./fixtures/users');

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

  users.authenticatedUsers.forEach(function (authenticatedUser) {
    db.accessTokens.addForUserId(authenticatedUser.id);
  });

  module.exports.instance = {
    getAuthenticatedUsers() {
      return users.authenticatedUsers.map(function (user) {
        return {
          id: user.id,
          accessToken: db.accessTokens.getForUserId(user.id)
        };
      });
    }
  };

  // Load the mocker.
  require('./mocker/v2');

  return module.exports.instance;
}
