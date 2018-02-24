const db = require('../../lib/db');
const nock = require('nock');
const qs = require('qs');
const scopes = require('../../lib/scopes');

nock('https://my.mlh.io')
  .persist()
  .get('/oauth/authorize')
  .query(true)
  .reply((path) => {
    const query = qs.parse(path.split('?')[1]);

    if (query.response_type !== 'code' && query.response_type !== 'token') {
      return [200, 'The authorization server does not support this response type.'];
    } else if (db.getClient().clientId !== query.client_id) {
      return [
        200,
        'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.',
      ];
    } else if (!query.redirect_uri || !db.isValidRedirectURL(query.redirect_uri)) {
      return [200, 'The redirect uri included is not valid.'];
    }

    const currentUserId = db.getCurrentUserId();
    const user = db.users.getUserForId(currentUserId);
    const permittedScope = scopes.match(query.scope, user.willPermitScopes).join('+');

    if (query.response_type === 'token') {
      const accessToken = db.accessTokens.addForUserId(currentUserId, permittedScope);
      return [
        302,
        undefined,
        {
          Location: `${query.redirect_uri}?access_token=${accessToken}`,
        },
      ];
    }

    const code = db.authorizationCodes.addForUserId(currentUserId, {
      redirectURL: query.redirect_uri,
      scope: permittedScope,
    });

    return [
      302,
      undefined,
      {
        Location: `${query.redirect_uri}?code=${code}`,
      },
    ];
  });

nock('https://my.mlh.io')
  .persist()
  .post('/oauth/token')
  .query(true)
  .reply((path) => {
    const query = qs.parse(path.split('?')[1]);

    // The MyMLH API first checks grant_type correctness when present no matter if
    // other parameters are missing.
    if (query.grant_type !== 'authorization_code') {
      return [
        401,
        {
          error: 'unsupported_grant_type',
          error_description:
            'The authorization grant type is not supported by the authorization server.',
        },
      ];
    }

    if (!query.redirect_uri) {
      return [
        401,
        {
          error: 'invalid_request',
          error_description:
            'The request is missing a required parameter, includes an unsupported parameter value, or is otherwise malformed.',
        },
      ];
    }

    const { clientId, clientSecret } = db.getClient();
    if (query.client_id !== clientId || query.client_secret !== clientSecret) {
      return [
        401,
        {
          error: 'invalid_client',
          error_description:
            'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.',
        },
      ];
    }

    const currentUserId = db.getCurrentUserId();
    const { code, scope, redirectURL } = db.authorizationCodes.getForUserId(currentUserId);

    if (query.code !== code || query.redirect_uri !== redirectURL) {
      return [
        401,
        {
          error: 'invalid_grant',
          error_description:
            'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.',
        },
      ];
    }

    return [
      200,
      {
        access_token: db.accessTokens.addForUserId(currentUserId, scope),
        created_at: new Date().toISOString(),
        scope,
        token_type: 'bearer',
      },
    ];
  });
