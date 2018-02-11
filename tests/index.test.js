const account = require('./account');
const chai = require('chai');
const expect = chai.expect;
const myMLHMock = require('../src');

describe('myMLHMock', function () {
  describe('init', function () {
    it('should require a MyMLH client ID.', function () {
      expect(myMLHMock).to.throw(Error, 'MyMLH client id is required.');
    });

    it('should require a MyMLH client secret.', function () {
      expect(function () {
        myMLHMock({
          clientId: account.MY_MLH_CLIENT_ID
        });
      }).to.throw(Error, 'MyMLH client secret is required.');
    });

    it('should return the instance of myMLHMock', function () {
      expect(myMLHMock({
        clientId: account.MY_MLH_CLIENT_ID,
        clientSecret: account
      })).to.eql({});
    });

    it('should populate the modules\'s instance export', function () {
      expect(myMLHMock.instance).to.eql({});
      expect(myMLHMock()).to.eql({});
    });
  });
});
