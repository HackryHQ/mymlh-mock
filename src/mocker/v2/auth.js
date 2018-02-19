const db = require('../../lib/db');
const nock = require('nock');
const qs = require('qs');
const scopes = require('../../lib/scopes');

const scope = nock('https://my.mlh.io').persist();

scope.get('/oauth/authorize').query(true).reply(function (path) {
  const query = qs.parse(path.split('?')[1]);``

  if (query.response_type !== 'code') {
    return [200, 'The authorization server does not support this response type.'];
  } else if (db.getClient().clientId !== query.client_id) {
    return [200, 'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.']
  } else if (!query.redirect_uri || !db.isValidRedirectURL(query.redirect_uri)) {
    return [200, 'The redirect uri included is not valid.']
  }

  const code = db.authorizationCodes.addForUserId(db.getCurrentUserId(), {
    redirectURL: query.redirect_uri,
    scope: query.scope || scopes.getAllScopes().join('+')
  });

  return [302, undefined, {
    Location: query.redirect_uri + '?code=' + code
  }];
});

scope.post('/oauth/token').query(true).reply(function (path) {
  const query = qs.parse(path.split('?')[1]);

  // The MyMLH API first checks grant_type correctness when present no matter if
  // other parameters are missing.
  if (query.grant_type !== 'authorization_code') {
    return [401, {
      error: 'unsupported_grant_type',
      error_description: 'The authorization grant type is not supported by the authorization server.'
    }];
  }

  if (!query.redirect_uri) {
    return [401, {
      error: 'invalid_request',
      error_description: 'The request is missing a required parameter, includes an unsupported parameter value, or is otherwise malformed.'
    }]
  }

  const { clientId, clientSecret } = db.getClient();
  if (query.client_id !== clientId || query.client_secret !== clientSecret) {
    return [401, {
      error: 'invalid_client',
      error_description: 'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.'
    }]
  }

  const currentUserId = db.getCurrentUserId();
  const authorization = db.authorizationCodes.getForUserId(currentUserId);

  if (query.code !== authorization.code || query.redirect_uri !== authorization.redirectURL) {
    return [401, {
      error: 'invalid_grant',
      error_description: 'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.'
    }]
  }

  return [200, {
    access_token: db.accessTokens.addForUserId(currentUserId),
    created_at: (new Date).toISOString(),
    scope: authorization.scope,
    token_type: 'bearer'
  }]
});
