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

  // Add access tokens for package-defined user fixtures.
  db.accessTokens.addForAuthenticatedUsers();

  // Add user-defined user fixtures.
  (config.authenticatedUsers || []).forEach(db.users.addAuthenticatedUser);
  (config.unauthenticatedUsers || []).forEach(db.users.addUnauthenticatedUser);

  module.exports.instance = {
    getAuthenticatedUsers() {
      return db.users.getAuthenticatedUsers().map(function (user) {
        return {
          id: user.id,
          accessToken: db.accessTokens.getForUserId(user.id)
        };
      });
    },
    getUnauthenticatedUsers() {
      return db.users.getUnauthenticatedUsers().map(function (user) {
        return {
          id: user.id
        };
      });
    }
  };

  // Load the mocker.
  require('./mocker/v2');

  return module.exports.instance;
}
