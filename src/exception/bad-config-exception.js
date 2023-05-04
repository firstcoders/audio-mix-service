const ErrorCodeConstants = require('./error-code-constants');

class BadConfigException extends Error {
  constructor(...args) {
    super(...args);

    this.code = ErrorCodeConstants.BadConfigException.code;
    this.description = ErrorCodeConstants.BadConfigException.description;
  }
}

module.exports = BadConfigException;
