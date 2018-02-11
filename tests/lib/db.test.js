const chai = require('chai');
const expect = chai.expect;
const db = require('../../src/lib/db');
const secrets = require('../secrets');
const users = require('../../src/fixtures/users');

describe('db', function () {
  before(function () {
    db.reset();
  });

  describe('init', function () {
    it('should initialize to default values', function () {
      expect(db.get()).to.eql(db.defaultStore);
    });

    it('should add access tokens for all previously authenticated users', function () {
      users.authenticatedUsers.forEach(function (authenticatedUser) {
        expect(db.accessTokens.getForUserId(authenticatedUser.id)).to.have.lengthOf(64);
      });
    });
  });

  describe('client', function () {
    it('should set the client ID and client secret', function () {
      const client = {
        clientId: 'client_id',
        clientSecret: 'client_secret'
      };
      db.setClient(client);
      expect(db.getClient()).to.eql(client);
    });
  });

  describe('authorization codes', function () {
    const userId = 2018;

    it('should add an authorization code for a user ID', function () {
      const code = db.authorizationCodes.addForUserId(userId);
      expect(code).to.have.lengthOf(16);
      expect(db.authorizationCodes.getForUserId(userId)).to.equal(code);
    });

    it('should not allow for authorization codes to be overwritten', function () {
      const previousCode = db.authorizationCodes.getForUserId(userId);
      const code = db.authorizationCodes.addForUserId(userId);
      expect(code).to.equal(previousCode);
    });
  });

  describe('acccess tokens', function () {
    const userId = 2019;

    it('should add an access token for a user ID', function () {
      const token = db.accessTokens.addForUserId(userId);
      expect(token).to.have.lengthOf(64);
      expect(db.accessTokens.getForUserId(userId)).to.equal(token);
    });

    it('should not allow for access tokens to be overwritten', function () {
      const previousCode = db.accessTokens.getForUserId(userId);
      const code = db.accessTokens.addForUserId(userId);
      expect(code).to.equal(previousCode);
    });
  });

  describe('reset', function () {
    it('should initialize to default values', function () {
      db.accessTokens.addForUserId(2020);
      expect(db.reset()).to.eql(db.defaultStore);
    });
  });

  describe('validate redirect URL', function () {
    it('should test the validity or redirect URLS', function () {
      db.setCallbackURLs(secrets.CALLBACK_URLS);
      secrets.CALLBACK_URLS.forEach(function (callbackURL) {
        expect(db.isValidRedirectURL(callbackURL)).to.be.true;
        expect(db.isValidRedirectURL(callbackURL + '/subpath')).to.be.true;
      });

      [
        'https://hackry.io',
        'https://dasbhoard.hackry.io',
        'https://my.mlh.io'
      ].forEach(function (invalidRedirectURL) {
        expect(db.isValidRedirectURL(invalidRedirectURL)).to.be.false;
        expect(db.isValidRedirectURL(invalidRedirectURL + '/subpath')).to.be.false;
      });
    });
  });

  describe('set current user ID', function () {
    it('should require an unauthenticated user ID', () => {
      expect(function () {
        db.setCurrentUserId(1);
      }).to.throw(Error, 'Current user ID must be for unauthenticated user.');
    });

    it('should require a valid unauthenticated user ID', () => {
      expect(function () {
        db.setCurrentUserId(101);
      }).to.throw(Error, 'Invalid unauthenticated current user ID.');
    });

    it('should set the curren user ID', () => {
      const userId = db.defaultStore.currentUserId;
      db.setCurrentUserId(userId)
      expect(db.getCurrentUserId()).to.equal(userId);
    });
  });
});
