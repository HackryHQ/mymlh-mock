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
  unauthenticatedUsers: userFixtures.unauthenticatedUsers,
};

let store = JSON.parse(JSON.stringify(defaultStore));

const getUserForId = userId =>
  store.authenticatedUsers
    .concat(store.unauthenticatedUsers)
    .filter(user => user.id === userId)[0] || null;

const checkUserId = (userId) => {
  if (userId === undefined || userId === null) {
    throw new Error('All users must have an id.');
  }

  if (userId < userFixtures.MAX_RESERVED_USER_ID) {
    throw new Error(`User ids below ${userFixtures.MAX_RESERVED_USER_ID} are restricted.`);
  }

  if (getUserForId(userId) !== null) {
    throw new Error(`Duplicate user id: ${userId}`);
  }
};

const addAccessTokenForUserId = (userId, scope) => {
  store.accessTokens[userId] = {
    accessToken: random.string(64),
    scope,
  };

  return store.accessTokens[userId].accessToken;
};

const users = {
  getAuthenticatedUserForId(userId) {
    return store.authenticatedUsers.filter(user => user.id === userId)[0] || null;
  },
  getUnauthenticatedUserForId(userId) {
    return store.unauthenticatedUsers.filter(user => user.id === userId)[0] || null;
  },
  getUserForId,
  addAuthenticatedUser(user = {}) {
    checkUserId(user.id);
    const didPermitScopes = (user.didPermitScopes || scopes.getAllScopes()).join('+');
    addAccessTokenForUserId(user.id, didPermitScopes);
    store.authenticatedUsers.push({
      ...user,
      didPermitScopes,
    });
  },
  addUnauthenticatedUser(user = {}) {
    checkUserId(user.id);
    store.unauthenticatedUsers.push({
      ...user,
      willPermitScopes: (user.willPermitScopes || scopes.getAllScopes()).join('+'),
    });
  },
  getAuthenticatedUsers() {
    return store.authenticatedUsers;
  },
  getUnauthenticatedUsers() {
    return store.unauthenticatedUsers;
  },
};

const addAuthenticatedUserAccessTokens = () => {
  users.getAuthenticatedUsers().forEach((authenticatedUser) => {
    addAccessTokenForUserId(authenticatedUser.id, authenticatedUser.didPermitScopes.join('+'));
  });
};

const db = {
  defaultStore,
  get() {
    return store;
  },
  reset() {
    store = JSON.parse(JSON.stringify(defaultStore));
    return store;
  },
  setClient(client) {
    store.clientId = client.clientId;
    store.clientSecret = client.clientSecret;
  },
  getClient() {
    return {
      clientId: store.clientId,
      clientSecret: store.clientSecret,
    };
  },
  setCallbackURLs(callbackURLs) {
    store.callbackURLs = callbackURLs;
  },
  getCallbackURLs() {
    return store.callbackURLs;
  },
  isValidRedirectURL(redirectURL) {
    const callbackURLRegexes = store.callbackURLs.map(urls.callback.regex);
    return callbackURLRegexes
      .map(callbackURLRegex => callbackURLRegex.test(redirectURL))
      .reduce((accumulator, test) => (accumulator ? true : test), false);
  },
  redirectURIForCode(code) {
    return Object.keys(store.authorizationCodes).reduce((map, userId) => {
      const authorizationCode = store.authorizationCodes[userId];
      return {
        ...map,
        [authorizationCode.code]: authorizationCode,
      };
    }, {})[code].redirectURL;
  },
  setCurrentUserId(userId) {
    if (users.getAuthenticatedUserForId(userId) !== null) {
      throw new Error('Current user ID must be for unauthenticated user.');
    }

    if (users.getUnauthenticatedUserForId(userId) === null) {
      throw new Error('Invalid unauthenticated current user ID.');
    }

    store.currentUserId = userId;
  },
  getCurrentUserId() {
    return store.currentUserId;
  },
  authorizationCodes: {
    addForUserId(userId, data = {}) {
      // Redirect URL and scope are required for token request validation and the
      // token response, respectively.
      store.authorizationCodes[userId] = {
        code: random.string(16),
        redirectURL: data.redirectURL,
        scope: data.scope,
      };

      return store.authorizationCodes[userId].code;
    },
    getForUserId(userId) {
      return store.authorizationCodes[userId];
    },
  },
  accessTokens: {
    addForAuthenticatedUsers: addAuthenticatedUserAccessTokens,
    addForUserId: addAccessTokenForUserId,
    getForUserId(userId) {
      return store.accessTokens[userId];
    },
    getUserIdFor(accessToken) {
      let userId = null;

      Object.keys(store.accessTokens).forEach((key) => {
        if (store.accessTokens[`${key}`].accessToken === accessToken) {
          userId = key;
        }
      });
      if (userId === null) return userId;
      return Number.isNaN(userId) ? userId : Number(userId);
    },
  },
  users,
};

module.exports = db;
