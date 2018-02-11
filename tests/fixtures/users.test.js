const chai = require('chai');
const expect = chai.expect;
const users = require('../../src/fixtures/users');

describe('user fixtures', function () {
  describe('get user by ID', function () {
    it('should return null for invalid user IDs', function () {
      expect(users.getAuthenticatedUserForId(2)).to.be.null;
      expect(users.getAuthenticatedUserForId(101)).to.be.null
      expect(users.getUnauthenticatedUserForId(1)).to.be.null;
      expect(users.getUnauthenticatedUserForId(101)).to.be.null
    });

    it('should return the user fixture for the specified user ID', function () {
      expect(users.getAuthenticatedUserForId(1)).to.have.property('id').equal(1);
      expect(users.getUnauthenticatedUserForId(2)).to.have.property('id').equal(2);
    });
  });
});
