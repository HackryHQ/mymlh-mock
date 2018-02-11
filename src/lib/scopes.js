// See https://my.mlh.io/docs#scopes_reference.
const DEFAULT_FIELDS = [
  'id',
  'first_name',
  'last_name',
  'created_at',
  'updated_at'
];

const EMAIL_FIELDS = [
  'email'
];

const PHONE_NUMER_FIELDS = [
  'phone_number'
];

const DEMOGRAPHIC_FIELDS = [
  'gender'
];

const BIRTHDAY_FIELDS = [
  'birthday'
];

const EDUCATION_FIELDS = [
  'level_of_study',
  'major',
  'school'
];

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

  scopes.includes('email') && addFields(EMAIL_FIELDS);
  scopes.includes('phone_number') && addFields(PHONE_NUMER_FIELDS);
  scopes.includes('demographics') && addFields(DEMOGRAPHIC_FIELDS);
  scopes.includes('birthday') && addFields(BIRTHDAY_FIELDS);
  scopes.includes('education') && addFields(EDUCATION_FIELDS);
  scopes.includes('event') && addFields(EVENT_FIELDS);

  return user;
};

module.exports = {
  applyScopesToUser: applyScopesToUser
};
