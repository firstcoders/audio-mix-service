const ErrorCodeConstants = require('./error-code-constants');

class ResourceNotFoundException extends Error {
  constructor(...args) {
    super(...args);

    this.code = ErrorCodeConstants.ResourceNotFound.code;
    this.description = ErrorCodeConstants.ResourceNotFound.description;
  }
}

module.exports = ResourceNotFoundException;
