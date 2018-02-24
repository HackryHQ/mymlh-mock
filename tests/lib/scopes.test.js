const chai = require('chai');
const db = require('../../src/lib/db');
const expect = chai.expect;
const scopes = require('../../src/lib/scopes');
const users = require('../../src/fixtures/users');

const DEFAULT_FIELDS = ['id', 'first_name', 'last_name', 'created_at', 'updated_at'];

const SCOPES = [{
  name: 'email',
  fields: ['email']
}, {
  name: 'phone_number',
  fields: ['phone_number']
}, {
  name: 'demographics',
  fields: ['gender']
}, {
  name: 'birthday',
  fields: ['date_of_birth']
}, {
  name: 'education',
  fields: ['level_of_study', 'major', 'school']
}, {
  name: 'event',
  fields: ['shirt_size', 'dietary_restrictions', 'special_needs']
}];

const user = users.getUnauthenticatedUserForId(db.currentUserId);

describe('scopes', function () {
  describe('apply scopes to user', function () {
    it('should return default fields if no scopes are specified', function () {
      expect(scopes.applyScopesToUser([], user)).to.have.keys(DEFAULT_FIELDS);
    });

    it('should only return fields for the specified scopes', function () {
      SCOPES.forEach(function (scope) {
        const KEYS = DEFAULT_FIELDS.concat(scope.fields);
        expect(scopes.applyScopesToUser([scope.name], user)).to.have.keys(KEYS);
      });
    });

    it('should return fields for the multiple scopes', function () {
      const allScopes = SCOPES.map(function (scope) {
        return scope.name;
      });

      const allFields = SCOPES.reduce(function (accumulator, scope) {
        return accumulator.concat(scope.fields);
      }, DEFAULT_FIELDS);

      expect(scopes.applyScopesToUser(allScopes, user)).to.have.keys(allFields);
    });
  });

  describe('match', function () {
    it('should use all scopes if no scope provided', function () {
      expect(scopes.match()).to.deep.equal(scopes.getAllScopes());
    });

    it('should use all scopes as existing scopes if not provided', function () {
      expect(scopes.match('email+birthday')).to.deep.equal(['email', 'birthday']);
    });

    it('should match against existing scopes', function () {
      expect(scopes.match('email+birthday', [
        'phone_number',
        'demographics',
        'birthday',
        'education'
      ])).to.deep.equal(['birthday']);
    });

    it('should return an empty array if none are', function () {
      expect(scopes.match('email+birthday', [
        'phone_number',
        'demographics',
        'education'
      ])).to.deep.equal([]);
    });
  });
});
