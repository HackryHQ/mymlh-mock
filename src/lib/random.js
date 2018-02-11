const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module.exports = {
  string: function (length) {
    var string = '';
    for (var i = 0; i < length; i++)
      string += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    return string;
  }
};
