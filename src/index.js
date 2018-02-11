module.exports.instance;

module.exports = function (config) {
  if (module.exports.instance) {
    return module.exports.instance;
  }

  config = config || {};

  if (!config.clientId) {
    throw new Error('MyMLH client id is required.')
  }

  if (!config.clientSecret) {
    throw new Error('MyMLH client secret is required.')
  }

  module.exports.instance = {};

  return module.exports.instance;
}
