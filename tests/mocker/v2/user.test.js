const chai = require('chai');
const db = require('../../../src/lib/db');
const expect = chai.expect;
const myMLHMock = require('../../../src');
const nock = require('nock');
const qs = require('qs');
const request = require('request');
const scopes = require('../../../src/lib/scopes');
const secrets = require('../../secrets');
const url = require('url');
const users = require('../../../src/fixtures/users');

const USER_URL = 'https://my.mlh.io/api/v2/user.json';

describe('user', function () {
  before(function () {
    myMLHMock.instance = null;
    myMLHMock({
      clientId: secrets.MY_MLH_CLIENT_ID,
      clientSecret: secrets.MY_MLH_CLIENT_SECRET,
      callbackURLs: secrets.CALLBACK_URLS
    });
  });

  after(function () {
    myMLHMock.instance = null;
  });

  it('should require a valid access token', function (done) {
    request({
      url: USER_URL,
      json: true,
      qs: {
        access_token: 'invalid_access_token'
      }
    }, function (error, response, body) {
      expect(response).to.have.property('statusCode').equal(401);
      expect(body).to.deep.equal({
        status: 'error',
        error: {
          code: 401,
          message: 'A valid access_token is required to request this resource.'
        }
      });
      done();
    });
  });

  it('should return user for an access token', function (done) {
    const userId = 1;

    request({
      url: USER_URL,
      json: true,
      qs: {
        access_token: db.accessTokens.getForUserId(userId).accessToken
      }
    }, function (error, response, body) {
      expect(response).to.have.property('statusCode').equal(200);
      const user = scopes.applyScopesToUser(scopes.getAllScopes(), users.getUserForId(userId));
      expect(body).to.deep.equal(user)
      done();
    });
  });
})
