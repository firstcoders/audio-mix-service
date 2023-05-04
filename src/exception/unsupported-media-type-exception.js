const ErrorCodeConstants = require('./error-code-constants');

class UnsupportedMediaTypeException extends Error {
  constructor(contentType, ...args) {
    super(...args);
    this.contentType = contentType;
    this.code = ErrorCodeConstants.UnsupportedMediaType.code;
    this.description = ErrorCodeConstants.UnsupportedMediaType.description;
  }
}

module.exports = UnsupportedMediaTypeException;
