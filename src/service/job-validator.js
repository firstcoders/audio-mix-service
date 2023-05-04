const ValidationException = require('../exception/validation-exception');

class JobValidator {
  constructor({ schema, validator, log }) {
    this.schema = schema;
    this.validator = validator;
    this.log = log || console;
  }

  validate(model) {
    const errors = this.validator.validate(model || {}, this.schema);
    return errors;
  }

  rejectIfNotValid(model) {
    const result = this.validate(model);

    if (!result.valid) {
      this.log.debug('Job model is not valid', { model, errors: result.errors });
      throw new ValidationException(result.errors);
    }
  }
}

module.exports = JobValidator;
