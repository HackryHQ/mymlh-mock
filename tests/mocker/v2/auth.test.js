const chai = require('chai');
const db = require('../../../src/lib/db');
const myMLHMock = require('../../../src');
const redirects = require('./redirects');
const request = require('request');
const secrets = require('../../secrets');

const { expect } = chai;

describe('MyMLH OAuth', () => {
  const AUTHORIZE_URL = 'https://my.mlh.io/oauth/authorize';
  const TOKEN_URL = 'https://my.mlh.io/oauth/token';

  describe('Authorization Code Flow', () => {
    before(() => {
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

    describe('authorize', () => {
      it('should require a valid response type', (done) => {
        request(
          {
            url: AUTHORIZE_URL,
            response_type: 'invalid_response_type',
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(200);
            expect(body).to.equal('The authorization server does not support this response type.');
            done();
          },
        );
      });

      it('should require a valid client ID', (done) => {
        request(
          {
            url: AUTHORIZE_URL,
            qs: {
              response_type: 'code',
              client_id: 'invalid_client_id',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(200);
            expect(body).to.equal('Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.');
            done();
          },
        );
      });

      it('should require a valid redirect uri', (done) => {
        const { clientId } = db.getClient();
        request(
          {
            url: AUTHORIZE_URL,
            qs: {
              response_type: 'code',
              client_id: clientId,
              redirect_uri: 'https://invalid.redirect/uri',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(200);
            expect(body).to.equal('The redirect uri included is not valid.');
            done();
          },
        );
      });

      it('should authorize a client', (done) => {
        const { clientId } = db.getClient();
        request(
          {
            url: AUTHORIZE_URL,
            qs: {
              response_type: 'code',
              client_id: clientId,
              redirect_uri: `${db.getCallbackURLs()[0]}?param=value`,
            },
          },
          done,
        );
      });
    });

    describe('access token', () => {
      it('should require a supported grant type', (done) => {
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'invalid_grant_type',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(401);
            expect(body).to.deep.equal({
              error: 'unsupported_grant_type',
              error_description:
                'The authorization grant type is not supported by the authorization server.',
            });
            done();
          },
        );
      });

      it('should disallow missing redirect URI', (done) => {
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'authorization_code',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(401);
            expect(body).to.deep.equal({
              error: 'invalid_request',
              error_description:
                'The request is missing a required parameter, includes an unsupported parameter value, or is otherwise malformed.',
            });
            done();
          },
        );
      });

      it('should require a valid client ID', (done) => {
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'authorization_code',
              redirect_uri: db.getCallbackURLs()[0],
              client_id: 'invalid_client_id',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(401);
            expect(body).to.deep.equal({
              error: 'invalid_client',
              error_description:
                'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.',
            });
            done();
          },
        );
      });

      it('should require a valid client secret', (done) => {
        const { clientId } = db.getClient();
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'authorization_code',
              redirect_uri: db.getCallbackURLs()[0],
              client_id: clientId,
              client_secret: 'invalid_client_secret',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(401);
            expect(body).to.deep.equal({
              error: 'invalid_client',
              error_description:
                'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.',
            });
            done();
          },
        );
      });

      it('should require a valid code', (done) => {
        const { clientId, clientSecret } = db.getClient();
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'authorization_code',
              redirect_uri: db.getCallbackURLs()[0],
              client_id: clientId,
              client_secret: clientSecret,
              code: 'invalid_code',
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(401);
            expect(body).to.deep.equal({
              error: 'invalid_grant',
              error_description:
                'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.',
            });
            done();
          },
        );
      });

      it('should require a valid redirect URI', (done) => {
        const { clientId, clientSecret } = db.getClient();
        const { code } = db.authorizationCodes.getForUserId(db.getCurrentUserId());
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'authorization_code',
              redirect_uri: 'https://invalid.redirect/uri',
              client_id: clientId,
              client_secret: clientSecret,
              code,
            },
          },
          (error, response, body) => {
            expect(response)
              .to.have.property('statusCode')
              .equal(401);
            expect(body).to.deep.equal({
              error: 'invalid_grant',
              error_description:
                'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.',
            });
            done();
          },
        );
      });

      it('should return an access token for the current user', (done) => {
        const { clientId, clientSecret } = db.getClient();
        const { code, scope } = db.authorizationCodes.getForUserId(db.getCurrentUserId());
        request(
          {
            url: TOKEN_URL,
            method: 'POST',
            json: true,
            qs: {
              grant_type: 'authorization_code',
              redirect_uri: db.redirectURIForCode(code),
              client_id: clientId,
              client_secret: clientSecret,
              code,
            },
          },
          (error, response, body) => {
            const { accessToken } = db.accessTokens.getForUserId(db.getCurrentUserId());
            expect(response)
              .to.have.property('statusCode')
              .equal(200);
            expect(body)
              .to.have.property('access_token')
              .to.equal(accessToken);
            expect(body).to.have.property('created_at');
            expect(body)
              .to.have.property('scope')
              .equal(scope);
            expect(body)
              .to.have.property('token_type')
              .equal('bearer');
            done();
          },
        );
      });
    });
  });

  describe('Implicit Flow', () => {
    before(() => {
      myMLHMock.instance = null;
      myMLHMock({
        clientId: secrets.MY_MLH_CLIENT_ID,
        clientSecret: secrets.MY_MLH_CLIENT_SECRET,
        callbackURLs: secrets.CALLBACK_URLS,
      });

      redirects.mockImplicitFlow();
    });

    after(() => {
      myMLHMock.instance = null;
    });

    describe('authorize and access token', () => {
      it('should return an access token for the current user', (done) => {
        const { clientId } = db.getClient();
        request(
          {
            url: AUTHORIZE_URL,
            json: true,
            qs: {
              response_type: 'token',
              redirect_uri: db.getCallbackURLs()[0],
              client_id: clientId,
            },
          },
          (error, response, query) => {
            const currentUserId = db.getCurrentUserId();
            const { accessToken } = db.accessTokens.getForUserId(currentUserId);
            expect(query)
              .to.have.property('access_token')
              .equal(accessToken);
            done();
          },
        );
      });
    });
  });
});
