const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module.exports = {
  string(length) {
    let string = '';
    for (let i = 0; i < length; i += 1) {
      string += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return string;
  },
};
