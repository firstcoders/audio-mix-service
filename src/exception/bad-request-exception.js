const ErrorCodeConstants = require('./error-code-constants');

class BadRequestException extends Error {
  constructor(message, originalException) {
    super(message);

    this.code = ErrorCodeConstants.BadRequest.code;
    this.description = ErrorCodeConstants.BadRequest.description;
    this.originalException = originalException;
  }
}

module.exports = BadRequestException;
