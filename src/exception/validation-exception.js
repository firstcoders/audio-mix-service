const ErrorCodeConstants = require('./error-code-constants');

class ValidationException extends Error {
  constructor(errors, ...args) {
    super(...args);

    this.errors = errors;
    this.code = ErrorCodeConstants.BadRequest.code;
    this.description = ErrorCodeConstants.BadRequest.description;
  }

  getErrors() {
    return this.errors.map((e) => {
      if (typeof e === 'string') {
        return {
          message: e,
        };
      }

      const { property, message, argument, name } = e;
      return {
        property,
        argument,
        name,
        message,
      };
    });
  }
}

module.exports = ValidationException;
