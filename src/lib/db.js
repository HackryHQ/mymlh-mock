const random = require('./random');
const scopes = require('./scopes');
const urls = require('./urls');
const userFixtures = require('../fixtures/users');

const defaultStore = {
  clientId: null,
  clientSecret: null,
  callbackURLs: [],
  // Fake the currently logged in user. Must be an unauthenticated user ID.
  currentUserId: 2,
  // Map user ID to authorization code.
  authorizationCodes: {},
  // Map user ID to access token.
  accessTokens: {},
  authenticatedUsers: userFixtures.authenticatedUsers,
  unauthenticatedUsers: userFixtures.unauthenticatedUsers
};

var store = JSON.parse(JSON.stringify(defaultStore));

const getUserForId = function(userId) {
  return store.authenticatedUsers.concat(store.unauthenticatedUsers).filter(function (user) {
    return user.id == userId;
  })[0] || null;
};

const checkUserId = function (userId) {
  if (userId === undefined || userId === null) {
    throw new Error('All users must have an id.');
  }

  if (userId < userFixtures.MAX_RESERVED_USER_ID) {
    throw new Error('User ids below ' + userFixtures.MAX_RESERVED_USER_ID + ' are restricted.');
  }

  if (getUserForId(userId) !== null) {
    throw new Error('Duplicate user id: ' + userId);
  }
}

const addAccessTokenForUserId = function (userId, scope) {
  store.accessTokens[userId] = {
    accessToken: random.string(64),
    scope: scope
  };

  return store.accessTokens[userId].accessToken;
};

const addAuthenticatedUserAccessTokens = function () {
  users.getAuthenticatedUsers().forEach(function (authenticatedUser) {
    addAccessTokenForUserId(authenticatedUser.id, authenticatedUser.didPermitScopes.join('+'));
  });
};

const users = {
  getAuthenticatedUserForId: function (userId) {
    return store.authenticatedUsers.filter(function (user) {
      return user.id == userId;
    })[0] || null;
  },
  getUnauthenticatedUserForId: function (userId) {
    return store.unauthenticatedUsers.filter(function (user) {
      return user.id == userId;
    })[0] || null;
  },
  getUserForId,
  addAuthenticatedUser: function (user = {}) {
    checkUserId(user.id);
    user.didPermitScopes = user.didPermitScopes || scopes.getAllScopes();
    addAccessTokenForUserId(user.id, user.didPermitScopes);
    store.authenticatedUsers.push(user);
  },
  addUnauthenticatedUser: function (user = {}) {
    checkUserId(user.id);
    user.willPermitScopes = user.willPermitScopes || scopes.getAllScopes();
    store.unauthenticatedUsers.push(user);
  },
  getAuthenticatedUsers: function () {
    return store.authenticatedUsers;
  },
  getUnauthenticatedUsers: function () {
    return store.unauthenticatedUsers;
  }
};

const db = {
  defaultStore: defaultStore,
  get: function () {
    return store;
  },
  reset: function () {
    store = JSON.parse(JSON.stringify(defaultStore));
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
    addForUserId: function (userId, data = {}) {
      // Redirect URL and scope are required for token request validation and the
      // token response, respectively.
      store.authorizationCodes[userId] = {
        code: random.string(16),
        redirectURL: data.redirectURL,
        scope: data.scope
      };

      return store.authorizationCodes[userId].code;
    },
    getForUserId: function (userId) {
      return store.authorizationCodes[userId];
    }
  },
  accessTokens: {
    addForAuthenticatedUsers: addAuthenticatedUserAccessTokens,
    addForUserId: addAccessTokenForUserId,
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
  },
  users
};

module.exports = db;
