const regexForCallbackURL = function (callbackURL) {
  const exact = '^' + callbackURL + '$';
  const subpath = '^' + callbackURL + '/';
  return new RegExp(exact + '|' + subpath);
};

module.exports = {
  callback: {
    regex: regexForCallbackURL
  }
};
