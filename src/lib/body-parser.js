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
const qs = require('querystring');
const UnsupportedMediaTypeException = require('../exception/unsupported-media-type-exception');
const BadRequestHttpException = require('../exception/bad-request-exception');
const { getHeader } = require('./request');

module.exports = (event) => {
  // Don't do anything if we don't have a body
  if (!event || !event.body) return undefined;

  const { body } = event;
  const contentType = getHeader('Content-Type', event) || 'application/json';

  if (contentType.indexOf('application/json') !== -1) {
    try {
      return JSON.parse(body);
    } catch (err) {
      throw new BadRequestHttpException(err.message, err);
    }
  } else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
    const data = qs.parse(body);

    if (data.json) {
      try {
        return JSON.parse(data.json);
      } catch (err) {
        throw new BadRequestHttpException(err.message, err);
      }
    }

    return data;
  }

  throw new UnsupportedMediaTypeException();
};
