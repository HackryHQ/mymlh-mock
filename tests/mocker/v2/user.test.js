const chai = require('chai');
const db = require('../../../src/lib/db');
const myMLHMock = require('../../../src');
const redirects = require('./redirects');
const request = require('request');
const scopes = require('../../../src/lib/scopes');
const secrets = require('../../secrets');

const { expect } = chai;
const USER_URL = 'https://my.mlh.io/api/v2/user.json';

describe('users', () => {
  before(() => {
    db.reset();
    myMLHMock.instance = null;
    myMLHMock({
      clientId: secrets.MY_MLH_CLIENT_ID,
      clientSecret: secrets.MY_MLH_CLIENT_SECRET,
      callbackURLs: secrets.CALLBACK_URLS,
    });

    redirects.mockAuthorizationCodeFlow();
  });

  after(() => {
    myMLHMock.instance = null;
  });

  it('should require a valid access token', (done) => {
    request(
      {
        url: USER_URL,
        json: true,
        qs: {
          access_token: 'invalid_access_token',
        },
      },
      (error, response, body) => {
        expect(response)
          .to.have.property('statusCode')
          .equal(401);
        expect(body).to.deep.equal({
          status: 'error',
          error: {
            code: 401,
            message: 'A valid access_token is required to request this resource.',
          },
        });
        done();
      },
    );
  });

  it('should return user for an access token', (done) => {
    const userId = myMLHMock.instance.getAuthenticatedUsers()[0].id;
    request(
      {
        url: USER_URL,
        json: true,
        qs: {
          access_token: db.accessTokens.getForUserId(userId).accessToken,
        },
      },
      (error, response, body) => {
        expect(response)
          .to.have.property('statusCode')
          .equal(200);
        const user = scopes.applyScopesToUser(scopes.getAllScopes(), db.users.getUserForId(userId));
        expect(body).to.deep.equal(user);
        done();
      },
    );
  });

  it('should filter authenticated users scopes with `didPermitScopes`', (done) => {
    const userId = 101;
    db.users.addAuthenticatedUser({
      ...db.users.getUserForId(1),
      id: userId,
      didPermitScopes: ['email', 'event'],
    });

    request(
      {
        url: USER_URL,
        json: true,
        qs: {
          access_token: db.accessTokens.getForUserId(userId).accessToken,
        },
      },
      (error, response, body) => {
        expect(response)
          .to.have.property('statusCode')
          .equal(200);
        const user = scopes.applyScopesToUser(['email', 'event'], db.users.getUserForId(userId));
        expect(body).to.deep.equal(user);
        done();
      },
    );
  });

  it('should only provide scope properties', (done) => {
    const { clientId } = db.getClient();
    const requestedScopes = ['email', 'event'];

    redirects.mockAuthorizationCodeFlow();

    request(
      {
        url: 'https://my.mlh.io/oauth/authorize',
        json: true,
        qs: {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: db.getCallbackURLs()[0],
          scope: requestedScopes.join(' '),
        },
      },
      (error, response, body) => {
        const currentUserId = db.getCurrentUserId();
        request(
          {
            url: USER_URL,
            json: true,
            qs: {
              access_token: body.access_token,
            },
          },
          (error2, response2, body2) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(200);
            const user = scopes.applyScopesToUser(
              requestedScopes,
              db.users.getUserForId(currentUserId),
            );
            expect(body2).to.deep.equal(user);
            done();
          },
        );
      },
    );
  });
});
