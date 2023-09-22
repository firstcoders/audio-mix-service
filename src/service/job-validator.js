/**
 * Copyright (C) 2019-2023 First Coders LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
