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
// const ErrorCodeConstants = require('/shared/exception/error-code-constants');
// const BadRequestException = require('@shared/exception/bad-request-exception');
// const UpstreamServiceException = require('@shared/exception/upstream-service-exception');
// const ConstraintViolationException = require('@shared/exception/constraint-violation-exception');
const ResourceNotFoundException = require('../exception/resource-not-found-exception');
const ValidationException = require('../exception/validation-exception');
const UnsupportedMediaTypeException = require('../exception/unsupported-media-type-exception');
const BadRequestException = require('../exception/bad-request-exception');

/**
 * Provides Error handler to deal with exceptions
 */
class ErrorHandler {
  constructor({ logger, config }) {
    this.config = config;
    this.logger = logger;
  }

  createResponseForException(ex) {
    this.logger.error('An exception occurred.', {
      ex: {
        message: ex.message,
        description: ex.description,
        code: ex.code,
        fileName: ex.fileName,
        lineNumber: ex.lineNumber,
        stack: ex.stack,
      },
    });

    // Always return these
    const response = {
      body: {
        error: {
          description: ex.description,
          code: ex.code,
        },
      },
    };

    if (ex instanceof ResourceNotFoundException) {
      response.statusCode = 404;
    } else if (ex instanceof BadRequestException) {
      response.statusCode = 400;
    } else if (ex instanceof ValidationException) {
      response.statusCode = 400;
      response.body.errors = ex.getErrors();
    } else if (ex instanceof UnsupportedMediaTypeException) {
      response.statusCode = 415;
    } else {
      response.statusCode = 500;
      // prevent leaking info for unhandled exceptions by overwriting body
      // (there may be info contained in the "code", or "description" fields)
      response.body = {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          description: 'Something has gone wrong',
        },
      };
    }

    // Only return this when debug is set
    if (this.config.Debug) {
      response.body = {
        ...response.body,
        error: {
          ...response.body.error,
          message: ex.message,
        },
      };
    }

    response.body = JSON.stringify(response.body);

    return response;
  }
}

module.exports = ErrorHandler;
