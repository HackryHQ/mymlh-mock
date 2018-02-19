const authenticatedUsers = [
  {
    id: 1,
    email: 'test@example.com',
    created_at: '2015-07-08T18:52:43Z',
    updated_at: '2015-07-27T19:52:28Z',
    first_name: 'John',
    last_name: 'Doe',
    level_of_study: 'Undergraduate',
    major: 'Computer Science',
    shirt_size: 'Unisex - L',
    dietary_restrictions: 'None',
    special_needs: 'None',
    date_of_birth: '1985-10-18',
    gender: 'Male',
    phone_number: '+1 555 555 5555',
    school: {
      'id': 1,
      'name': 'Rutgers University'
    },
    scopes: [
      'email', 'phone_number', 'demographics', 'birthday', 'education', 'event'
    ]
  }
];

const unauthenticatedUsers = [
  {
    id: 2,
    email: 'test2@example.com',
    created_at: '2015-07-08T18:52:43Z',
    updated_at: '2015-07-27T19:52:28Z',
    first_name: 'Jane',
    last_name: 'Doe',
    level_of_study: 'Undergraduate',
    major: 'Computer Science',
    shirt_size: 'Women\'s - L',
    dietary_restrictions: 'None',
    special_needs: null,
    date_of_birth: '1985-10-18',
    gender: 'Female',
    phone_number: '+1 555 555 5555',
    school: {
      'id': 2,
      'name': 'Stony Brook University'
    }
  }
];

module.exports = {
  getAuthenticatedUserForId: function (userId) {
    return authenticatedUsers.filter(function (user) {
      return user.id == userId;
    })[0] || null;
  },
  getUnauthenticatedUserForId: function (userId) {
    return unauthenticatedUsers.filter(function (user) {
      return user.id == userId;
    })[0] || null;
  },
  getUserForId: function(userId) {
    return authenticatedUsers.concat(unauthenticatedUsers).filter(function (user) {
      return user.id == userId;
    })[0] || null;
  },
  authenticatedUsers: authenticatedUsers,
  unauthenticatedUsers: unauthenticatedUsers
}
