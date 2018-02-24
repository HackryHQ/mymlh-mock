// See https://my.mlh.io/docs#scopes_reference.
const DEFAULT_FIELDS = [
  'id',
  'first_name',
  'last_name',
  'created_at',
  'updated_at'
];

const EMAIL_SCOPE = 'email';
const EMAIL_FIELDS = [
  'email'
];

const PHONE_NUMBER_SCOPE = 'phone_number';
const PHONE_NUMBER_FIELDS = [
  'phone_number'
];

const DEMOGRAPHICS_SCOPE = 'demographics';
const DEMOGRAPHIC_FIELDS = [
  'gender'
];

const BIRTHDAY_SCOPE = 'birthday';
const BIRTHDAY_FIELDS = [
  'date_of_birth'
];

const EDUCATION_SCOPE = 'education';
const EDUCATION_FIELDS = [
  'level_of_study',
  'major',
  'school'
];

const EVENT_SCOPE = 'event';
const EVENT_FIELDS = [
  'shirt_size',
  'dietary_restrictions',
  'special_needs'
];

const applyScopesToUser = function (scopes, completeUser) {
  const userCopy = Object.assign({}, completeUser);
  const user = {};

  const addFields = function (fields) {
    fields.forEach(function (field) {
      user[field] = userCopy[field];
    });
  }

  addFields(DEFAULT_FIELDS);

  scopes.includes(EMAIL_SCOPE) && addFields(EMAIL_FIELDS);
  scopes.includes(PHONE_NUMBER_SCOPE) && addFields(PHONE_NUMBER_FIELDS);
  scopes.includes(DEMOGRAPHICS_SCOPE) && addFields(DEMOGRAPHIC_FIELDS);
  scopes.includes(BIRTHDAY_SCOPE) && addFields(BIRTHDAY_FIELDS);
  scopes.includes(EDUCATION_SCOPE) && addFields(EDUCATION_FIELDS);
  scopes.includes(EVENT_SCOPE) && addFields(EVENT_FIELDS);

  return user;
};

const getAll = function () {
  return [
    EMAIL_SCOPE,
    PHONE_NUMBER_SCOPE,
    DEMOGRAPHICS_SCOPE,
    BIRTHDAY_SCOPE,
    EDUCATION_SCOPE,
    EVENT_SCOPE
  ]
};

const match = function (scope, existingScopes) {
  if (!existingScopes) {
    existingScopes = getAll();
  }

  const scopes = scope ? scope.split('+') : getAll()
  const permittedScopes = scopes.reduce(function (permitted, scope) {
    if (existingScopes.includes(scope)) {
      permitted.push(scope);
    }

    return permitted;
  }, []);
  return permittedScopes;
}

module.exports = {
  applyScopesToUser: applyScopesToUser,
  getAllScopes: getAll,
  match: match
};
