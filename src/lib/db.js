const random = require('./random');

const defaultStore = Object.freeze({
  clientId: null,
  clientSecret: null,
  // Map user ID to authorization code.
  authorizationCodes: {},
  // Map user ID to access token.
  accessTokens: {}
});

var store = Object.assign({}, defaultStore);

const setClient = function (client) {
  store.clientId = client.clientId;
  store.clientSecret = client.clientSecret;
};

const getClient = function () {
  return {
    clientId: store.clientId,
    clientSecret: store.clientSecret
  }
};

const addAuthorizationCodeForUserId = function (userId) {
  if (!store.authorizationCodes[userId]) {
    store.authorizationCodes[userId] = random.string(16);
  }

  return store.authorizationCodes[userId];
};

const getAuthorizationCodeForUserId = function (userId) {
  return store.authorizationCodes[userId];
};

const addAccessTokenForUserId = function (userId) {
  if (!store.accessTokens[userId]) {
    store.accessTokens[userId] = random.string(64);
  }

  return store.accessTokens[userId];
};

const getAccessTokenForUserId = function (userId) {
  return store.accessTokens[userId];
};

module.exports = {
  defaultStore: defaultStore,
  get: function () {
    return store;
  },
  reset: function () {
    store = Object.assign({}, defaultStore);
    return store;
  },
  setClient: setClient,
  getClient: getClient,
  authorizationCodes: {
    addForUserId: addAuthorizationCodeForUserId,
    getForUserId: getAuthorizationCodeForUserId
  },
  accessTokens: {
    addForUserId: addAccessTokenForUserId,
    getForUserId: getAccessTokenForUserId
  }
};
