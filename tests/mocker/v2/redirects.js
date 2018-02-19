const db = require('../../../src/lib/db');
const nock = require('nock');
const qs = require('qs');
const request = require('request');
const url = require('url');

const redirects ={
  mockAuthorizationCodeFlow: function () {
    const { clientId, clientSecret } = db.getClient();

    db.getCallbackURLs().forEach(function (callbackURL) {
      const { protocol, hostname, path } = url.parse(callbackURL);
      nock(protocol + '//' + hostname).get(path).query(true).reply(function (path, body, callback) {
        const query = qs.parse(path.split('?')[1]);
        request({
          method: 'POST',
          url: 'https://my.mlh.io/oauth/token',
          qs: {
            client_id: clientId,
            client_secret: clientSecret,
            code: query.code,
            redirect_uri: callbackURL,
            grant_type: 'authorization_code'
          }
        }, function (error, response, body) {
          return callback(error, body)
        });
      });
    });
  },
  mockImplicitFlow: function () {
    db.getCallbackURLs().forEach(function (callbackURL) {
      const { protocol, hostname, path } = url.parse(callbackURL);
      nock(protocol + '//' + hostname).get(path).query(true).reply(function (path, body, callback) {
        const query = qs.parse(path.split('?')[1]);
        callback(null, query);
      });
    });
  }
};

module.exports = redirects;
