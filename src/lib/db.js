const random = require('./random');
const urls = require('./urls');
const users = require('../fixtures/users');

const defaultStore = Object.freeze({
  clientId: null,
  clientSecret: null,
  callbackURLs: [],
  // Fake the currently logged in user. Must be an unauthenticated user ID.
  currentUserId: 2,
  // Map user ID to authorization code.
  authorizationCodes: {},
  // Map user ID to access token.
  accessTokens: {}
});

var store = Object.assign({}, defaultStore);

const db = {
  defaultStore: defaultStore,
  get: function () {
    return store;
  },
  reset: function () {
    store = Object.assign({}, defaultStore);
    return store;
  },
  setClient: function (client) {
    store.clientId = client.clientId;
    store.clientSecret = client.clientSecret;
  },
  getClient: function () {
    return {
      clientId: store.clientId,
      clientSecret: store.clientSecret
    };
  },
  setCallbackURLs: function (callbackURLs) {
    store.callbackURLs = callbackURLs;
  },
  getCallbackURLs: function () {
    return store.callbackURLs;
  },
  isValidRedirectURL: isValidRedirectURL = function (redirectURL) {
    const callbackURLRegexes = store.callbackURLs.map(urls.callback.regex);
    return callbackURLRegexes.map(function (callbackURLRegex) {
      return callbackURLRegex.test(redirectURL)
    }).reduce(function (accumulator, test) {
      return accumulator ? true : test;
    }, false);
  },
  setCurrentUserId: setCurrentUserId = function (userId) {
    if (users.getAuthenticatedUserForId(userId) !== null) {
      throw new Error('Current user ID must be for unauthenticated user.');
    }

    if (users.getUnauthenticatedUserForId(userId) === null) {
      throw new Error('Invalid unauthenticated current user ID.');
    }

    store.currentUserId = userId;
  },
  getCurrentUserId: function () {
    return store.currentUserId;
  },
  authorizationCodes: {
    addForUserId: function (userId, { redirectURL, scope } = {}) {
      if (!store.authorizationCodes[userId]) {
        // Redirect URL and scope are required for token request validation and the
        // token response, respectively.
        store.authorizationCodes[userId] = {
          code: random.string(16),
          redirectURL: redirectURL,
          scope: scope
        };
      }

      return store.authorizationCodes[userId].code;
    },
    getForUserId: function (userId) {
      return store.authorizationCodes[userId];
    }
  },
  accessTokens: {
    addForUserId: function (userId, scope) {
      if (!store.accessTokens[userId]) {
        store.accessTokens[userId] = {
          accessToken: random.string(64),
          scope: scope
        }
      }

      return store.accessTokens[userId].accessToken;
    },
    getForUserId: function (userId) {
      return store.accessTokens[userId];
    },
    getUserIdFor: function (accessToken) {
      var userId = null;

      Object.keys(store.accessTokens).forEach(function (key) {
        if (store.accessTokens[key].accessToken === accessToken) {
          userId = key;
        }
      });

      return userId;
    }
  }
};

module.exports = db;
