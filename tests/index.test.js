const chai = require('chai');
const db = require('../src/lib/db');
const expect = chai.expect;
const myMLHMock = require('../src');
const secrets = require('./secrets');

describe('myMLHMock', function () {
  describe('init', function () {
    it('should require a MyMLH client ID.', function () {
      expect(myMLHMock).to.throw(Error, 'MyMLH client id is required.');
    });

    it('should require a MyMLH client secret.', function () {
      expect(function () {
        myMLHMock({
          clientId: secrets.MY_MLH_CLIENT_ID
        });
      }).to.throw(Error, 'MyMLH client secret is required.');
    });

    it('should require a MyMLH client secret.', function () {
      expect(function () {
        myMLHMock({
          clientId: secrets.MY_MLH_CLIENT_ID,
          clientSecret: secrets.MY_MLH_CLIENT_SECRET
        });
      }).to.throw(Error, 'At least one callback URL is required.');
    });

    it('should return the instance of myMLHMock and store the client', function () {
      const client = {
        clientId: secrets.MY_MLH_CLIENT_ID,
        clientSecret: secrets.MY_MLH_CLIENT_SECRET
      };
      const config = Object.assign({}, client);
      config.callbackURLs = secrets.CALLBACK_URLS;
      expect(myMLHMock(config)).to.eql({});
      expect(db.getClient()).to.eql(client);
    });

    it('should populate the modules\'s instance export', function () {
      expect(myMLHMock.instance).to.eql({});
      expect(myMLHMock()).to.eql({});
    });
  });
});
