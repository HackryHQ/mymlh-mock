const db = require('../../lib/db');
const nock = require('nock');
const qs = require('qs');
const scopes = require('../../lib/scopes');

nock('https://my.mlh.io')
  .persist()
  .get('/api/v2/user.json')
  .query(true)
  .reply((path) => {
    const query = qs.parse(path.split('?')[1]);
    const userId = db.accessTokens.getUserIdFor(query.access_token);

    if (!userId) {
      return [
        401,
        {
          status: 'error',
          error: {
            code: 401,
            message: 'A valid access_token is required to request this resource.',
          },
        },
      ];
    }

    const { scope } = db.accessTokens.getForUserId(userId);
    const user = db.users.getUserForId(userId);

    // Prioritize user fixture "scopes" key.
    return [
      200,
      {
        status: 'OK',
        data: scopes.applyScopesToUser(scope.split('+'), user),
      },
    ];
  });
