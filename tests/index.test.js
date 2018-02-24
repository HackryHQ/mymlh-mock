const chai = require('chai');
const db = require('../src/lib/db');
const myMLHMock = require('../src');
const secrets = require('./secrets');
const userFixtures = require('../src/fixtures/users');

const { expect } = chai;
const MY_MLH_MOCK_KEYS = ['getAuthenticatedUsers', 'getUnauthenticatedUsers'];

describe('myMLHMock', () => {
  describe('init', () => {
    it('should require a MyMLH client ID.', () => {
      expect(myMLHMock).to.throw(Error, 'MyMLH client id is required.');
    });

    it('should require a MyMLH client secret.', () => {
      expect(() => {
        myMLHMock({
          clientId: secrets.MY_MLH_CLIENT_ID,
        });
      }).to.throw(Error, 'MyMLH client secret is required.');
    });

    it('should require a MyMLH client secret.', () => {
      expect(() => {
        myMLHMock({
          clientId: secrets.MY_MLH_CLIENT_ID,
          clientSecret: secrets.MY_MLH_CLIENT_SECRET,
        });
      }).to.throw(Error, 'At least one callback URL is required.');
    });

    it('should return the instance of myMLHMock and store the client', () => {
      const client = {
        clientId: secrets.MY_MLH_CLIENT_ID,
        clientSecret: secrets.MY_MLH_CLIENT_SECRET,
      };
      const config = Object.assign({}, client);
      config.callbackURLs = secrets.CALLBACK_URLS;
      expect(myMLHMock(config)).to.have.keys(MY_MLH_MOCK_KEYS);
      expect(db.getClient()).to.eql(client);
    });

    it("should populate the modules's instance export", () => {
      expect(myMLHMock.instance).to.have.keys(MY_MLH_MOCK_KEYS);
      expect(myMLHMock()).to.have.keys(MY_MLH_MOCK_KEYS);
    });

    it('should populate authenticated and unauthenticated users', () => {
      myMLHMock.instance = null;
      myMLHMock({
        clientId: secrets.MY_MLH_CLIENT_ID,
        clientSecret: secrets.MY_MLH_CLIENT_SECRET,
        callbackURLs: secrets.CALLBACK_URLS,
        authenticatedUsers: [
          {
            id: 101,
          },
          {
            id: 102,
          },
        ],
        unauthenticatedUsers: [
          {
            id: 103,
          },
          {
            id: 104,
          },
          {
            id: 105,
          },
        ],
      });

      // Must account for fixtures loaded
      const a = 2 + userFixtures.authenticatedUsers.length;
      const u = 3 + userFixtures.unauthenticatedUsers.length;

      expect(myMLHMock.instance.getAuthenticatedUsers()).to.have.lengthOf(a);
      expect(myMLHMock.instance.getUnauthenticatedUsers()).to.have.lengthOf(u);
    });
  });

  describe('get authenticated users', () => {
    it('should return an array of user ID, access Token tuples', () => {
      myMLHMock({
        clientId: secrets.MY_MLH_CLIENT_ID,
        clientSecret: secrets.MY_MLH_CLIENT_SECRET,
        callbackURLs: secrets.CALLBACK_URLS,
      });

      const tuples = myMLHMock.instance.getAuthenticatedUsers();
      expect(tuples).to.eql(db.users.getAuthenticatedUsers().map(user => ({
        id: user.id,
        accessToken: db.accessTokens.getForUserId(user.id),
      })));
    });
  });

  describe('get unauthenticated users', () => {
    it('should return an array of user ID, access Token tuples', () => {
      myMLHMock({
        clientId: secrets.MY_MLH_CLIENT_ID,
        clientSecret: secrets.MY_MLH_CLIENT_SECRET,
        callbackURLs: secrets.CALLBACK_URLS,
      });

      const tuples = myMLHMock.instance.getUnauthenticatedUsers();
      expect(tuples).to.eql(db.users.getUnauthenticatedUsers().map(user => ({
        id: user.id,
      })));
    });
  });
});
