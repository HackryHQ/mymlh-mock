module.exports = {
  callback: {
    regex: (callbackURL) => {
      const exact = `^${callbackURL}$`;
      const subpath = `^${callbackURL}/`;
      return new RegExp(`${exact}|${subpath}`);
    },
  },
};
