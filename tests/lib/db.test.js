const chai = require('chai');
const expect = chai.expect;
const db = require('../../src/lib/db');
const scopes = require('../../src/lib/scopes');
const secrets = require('../secrets');

describe('db', function () {
  before(function () {
    db.reset();
  });

  after(function () {
    db.reset();
  });

  describe('init', function () {
    it('should initialize to default values', function () {
      expect(db.get()).to.deep.equal(db.defaultStore);
    });

    it('should add access tokens for all previously authenticated users', function () {
      db.accessTokens.addForAuthenticatedUsers();
      db.users.getAuthenticatedUsers().forEach(function (authenticatedUser) {
        expect(db.accessTokens.getForUserId(authenticatedUser.id).accessToken).to.have.lengthOf(64);
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
      expect(db.authorizationCodes.getForUserId(userId).code).to.equal(code);
    });

    it('should allow for authorization codes to be overwritten', function () {
      const previousAuthorization = db.authorizationCodes.getForUserId(userId);
      const code = db.authorizationCodes.addForUserId(userId);
      expect(code).to.not.equal(previousAuthorization.code);
    });
  });

  describe('acccess tokens', function () {
    const userId = 2019;

    it('should add an access token for a user ID', function () {
      const token = db.accessTokens.addForUserId(userId);
      expect(token).to.have.lengthOf(64);
      expect(db.accessTokens.getForUserId(userId).accessToken).to.equal(token);
    });

    it('should allow for access tokens to be overwritten', function () {
      const previousAccessToken = db.accessTokens.getForUserId(userId).accessToken;
      const accessToken = db.accessTokens.addForUserId(userId);
      expect(accessToken).to.not.equal(previousAccessToken);
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

  describe('users', function () {
    describe('get user by ID', function () {
      it('should return null for invalid user IDs', function () {
        expect(db.users.getAuthenticatedUserForId(2)).to.be.null;
        expect(db.users.getAuthenticatedUserForId(101)).to.be.null
        expect(db.users.getUnauthenticatedUserForId(1)).to.be.null;
        expect(db.users.getUnauthenticatedUserForId(101)).to.be.null
        expect(db.users.getUserForId(101)).to.be.null
      });

      it('should return the user fixture for the specified user ID', function () {
        expect(db.users.getAuthenticatedUserForId(1)).to.have.property('id').equal(1);
        expect(db.users.getUnauthenticatedUserForId(2)).to.have.property('id').equal(2);
        expect(db.users.getUserForId(1)).to.have.property('id').equal(1);
        expect(db.users.getUserForId(2)).to.have.property('id').equal(2);
      });
    });

    describe('add user', function () {
      it('should require a user id', function () {
        const error = 'All users must have an id.';
        expect(function () {
          db.users.addAuthenticatedUser();
        }).to.throw(Error, error);
        expect(function () {
          db.users.addUnauthenticatedUser();
        }).to.throw(Error, error);
      });

      it('should disallow reserved user ids', function () {
        const error = 'User ids below 100 are restricted';
        expect(function () {
          db.users.addAuthenticatedUser({ id: 99 });
        }).to.throw(Error, error);
        expect(function () {
          db.users.addUnauthenticatedUser({ id: 99 });
        }).to.throw(Error, error);
      });

      it('should add a user to the in-memory list', function () {
        db.users.addAuthenticatedUser({ id: 101 });
        db.users.getAuthenticatedUsers().map(function (user) {
          return user.id
        }).includes(101);

        db.users.addUnauthenticatedUser({ id: 102 });
        db.users.getAuthenticatedUsers().map(function (user) {
          return user.id
        }).includes(102);
      });

      it('should disallow duplicate user ids', function () {
        let error = 'Duplicate user id: 103';
        db.users.addAuthenticatedUser({ id: 103 });
        expect(function () {
          db.users.addAuthenticatedUser({ id: 103 });
        }).to.throw(Error, error);
        expect(function () {
          db.users.addUnauthenticatedUser({ id: 103 });
        }).to.throw(Error, error);

        error = 'Duplicate user id: 104';
        db.users.addUnauthenticatedUser({ id: 104 });
        expect(function () {
          db.users.addAuthenticatedUser({ id: 104 });
        }).to.throw(Error, error);
        expect(function () {
          db.users.addUnauthenticatedUser({ id: 104 });
        }).to.throw(Error, error);
      });

      it('should add access tokens for authenticated users', function () {
        db.users.addAuthenticatedUser({ id: 105 });
        let accessToken = db.accessTokens.getForUserId(105)
        expect(accessToken).to.have.property('accessToken');
        expect(accessToken).to.have.property('scope').deep.equal(scopes.getAllScopes());

        db.users.addAuthenticatedUser({ id: 106, didPermitScopes: ['email'] });
        accessToken = db.accessTokens.getForUserId(106)
        expect(accessToken).to.have.property('accessToken');
        expect(accessToken).to.have.property('scope').deep.equal(['email']);
      });
    });
  });
});
