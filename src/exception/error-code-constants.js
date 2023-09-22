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
const ErrorCodeConstants = {
  InternalServerError: {
    code: 'InternalServerError',
    description: 'Internal Server Error',
  },
  LoadConfigError: {
    code: 'LoadConfigError',
    description: 'The service config could not be loaded',
  },
  ResourceNotFound: {
    code: 'ResourceNotFound',
    description: 'Resource Not found.',
  },
  BadRequest: {
    code: 'BadRequest',
    description: 'Bad Request',
  },
  UnsupportedMediaType: {
    code: 'UnsupportedMediaType',
    description: 'Unsupported Media Type',
  },
  BadConfigException: {
    code: 'BadConfigException',
    description: 'Bad Config Exception',
  },
  // UploadError: {
  //   code: 'UploadError',
  //   description: 'Could not upload file to destination',
  // },
  // AudioProcessingError: {
  //   code: 'AudioProcessingError',
  //   description: 'The audio could not be processed',
  // },
};

module.exports = ErrorCodeConstants;
