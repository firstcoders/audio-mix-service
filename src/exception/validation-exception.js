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
