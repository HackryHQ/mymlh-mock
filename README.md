# MyMLH Mock

A mock of [MyMLH](https://my.mlh.io/docs), Major League Hacking's official
authorization platform.

## Installation

```bash
npm install mymlh-mock
```

## Usage

Instantiate a `myMLHMock` instance with a `clientId`, `clientSecret`, and
`callbackURLs`. **These should not be your true MyMLH client id and client
secret.**

```js
const myMLHMock = require('mymlh-mock');

myMLHMock({
  clientId: process.env.MY_MLH_CLIENT_ID,
  clientSecret: process.env.MY_MLH_CLIENT_SECRET,
  callbackURLs: ['http://localhost/callback'],
});
```

The currently mocked routes include:

* OAuth Implicit grant type
* Oauth Authorization Code grant type
* `/user.json`

## Custom Users

On top of the [default users](src/fixtures/users.js), one can specify custom
users with the `authenticatedUsers` and `unauthenticatedUsers` parameters. The
`didPermitScopes` and `willPermitScopes` properties for authenticated users and
unauthenticated users, respectively, contain the
[scopes](https://my.mlh.io/docs#scopes_reference) that will be permitted by the
user and applied to the `/user.json` response. User ids below 100 are restricted
for testing purposes.

```js
myMLHMock({
  ...,
  authenticatedUsers: [
    {
      id: 100,
      email: 'the-art-of-computer-programming@cit.edu',
      created_at: '2015-07-08T18:52:43Z',
      updated_at: '2015-07-27T19:52:28Z',
      first_name: 'Donald',
      last_name: 'Knuth',
      level_of_study: 'Undergraduate',
      major: 'Computer Science',
      shirt_size: 'Unisex - L',
      dietary_restrictions: 'None',
      special_needs: null,
      date_of_birth: '1938-01-10',
      gender: 'Male',
      phone_number: '+1 234 567 8910',
      school: {
        id: 1967,
        name: 'Case Institute of Technology',
      },
      didPermitScopes: ['email', 'event'],
    },
  ],
  unauthenticatedUsers: [
    {
      ...,
      willPermitScopes: ['demographics', 'birthday'],
    },
  ],
});
```

The current user can be changed using the `setCurrentUserId` method. Users may
complete an unlimited amount of OAuth flows. However, be aware their
`access_token` will change upon each completion.

```js
myMLHMock.instance.setCurrentUserId(100);
```

### Authenticated vs. Unauthenticated Users

Authenticated users are those who have already authorized your MyMLH
application. As a result, they are assigned an `access_token` upon
instantiation. Unauthenticated users will only be assigned an `access_token`
after completing the OAuth flow.

All authenticated and unauthenticated users can be accessed using the
`getAuthenticatedUsers` and `getUnauthenticatedUsers` methods, respectively.
These methods return an array of objects containing a user id and access token
(if applicable).

```js
myMLHMock.instance.getAuthenticatedUsers();
// Example output:
[
  {
    id: 1,
    accessToken: 'VSYlMo10x0xzNgEA',
  },
];

myMLHMock.instance.getUnauthenticatedUsers();
// Example output:
[
  {
    id: 2,
  },
];
```
