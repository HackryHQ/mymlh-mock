const chai = require('chai');
const db = require('../../src/lib/db');
const scopes = require('../../src/lib/scopes');

const { expect } = chai;

const DEFAULT_FIELDS = ['id', 'first_name', 'last_name', 'created_at', 'updated_at'];

const SCOPES = [
  {
    name: 'email',
    fields: ['email'],
  },
  {
    name: 'phone_number',
    fields: ['phone_number'],
  },
  {
    name: 'demographics',
    fields: ['gender'],
  },
  {
    name: 'birthday',
    fields: ['date_of_birth'],
  },
  {
    name: 'education',
    fields: ['level_of_study', 'major', 'school'],
  },
  {
    name: 'event',
    fields: ['shirt_size', 'dietary_restrictions', 'special_needs'],
  },
];

const user = db.users.getUnauthenticatedUserForId(db.currentUserId);

describe('scopes', () => {
  describe('apply scopes to user', () => {
    it('should return default fields if no scopes are specified', () => {
      expect(scopes.applyScopesToUser([], user)).to.have.keys(DEFAULT_FIELDS);
    });

    it('should only return fields for the specified scopes', () => {
      SCOPES.forEach((scope) => {
        const KEYS = DEFAULT_FIELDS.concat(scope.fields);
        expect(scopes.applyScopesToUser([scope.name], user)).to.have.keys(KEYS);
      });
    });

    it('should return fields for the multiple scopes', () => {
      const allScopes = SCOPES.map(scope => scope.name);

      const allFields = SCOPES.reduce(
        (accumulator, scope) => accumulator.concat(scope.fields),
        DEFAULT_FIELDS,
      );

      expect(scopes.applyScopesToUser(allScopes, user)).to.have.keys(allFields);
    });
  });

  describe('match', () => {
    it('should use all scopes if no scope provided', () => {
      expect(scopes.match()).to.deep.equal(scopes.getAllScopes());
    });

    it('should use all scopes as existing scopes if not provided', () => {
      expect(scopes.match('email birthday')).to.deep.equal(['email', 'birthday']);
    });

    it('should match against existing scopes', () => {
      expect(scopes.match('email birthday', ['phone_number', 'demographics', 'birthday', 'education'])).to.deep.equal(['birthday']);
    });

    it('should return an empty array if none are', () => {
      expect(scopes.match('email birthday', ['phone_number', 'demographics', 'education'])).to.deep.equal([]);
    });
  });
});
