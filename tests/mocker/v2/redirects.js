const db = require('../../../src/lib/db');
const nock = require('nock');
const qs = require('qs');
const request = require('request');
const url = require('url');

const redirects = {
  mockAuthorizationCodeFlow() {
    const { clientId, clientSecret } = db.getClient();

    db.getCallbackURLs().forEach((callbackURL) => {
      const { protocol, hostname, path } = url.parse(callbackURL);
      nock(`${protocol}//${hostname}`)
        .get(path)
        .query(true)
        .reply((requestPath, body, callback) => {
          const query = qs.parse(requestPath.split('?')[1]);
          request(
            {
              method: 'POST',
              url: 'https://my.mlh.io/oauth/token',
              qs: {
                client_id: clientId,
                client_secret: clientSecret,
                code: query.code,
                redirect_uri: callbackURL,
                grant_type: 'authorization_code',
              },
            },
            (e, r, b) => callback(e, b),
          );
        });
    });
  },
  mockImplicitFlow() {
    db.getCallbackURLs().forEach((callbackURL) => {
      const { protocol, hostname, path } = url.parse(callbackURL);
      nock(`${protocol}//${hostname}`)
        .get(path)
        .query(true)
        .reply((requestPath, body, callback) => {
          const query = qs.parse(requestPath.split('?')[1]);
          callback(null, query);
        });
    });
  },
};

module.exports = redirects;
