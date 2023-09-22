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
const jwt = require('jsonwebtoken');

const audience = 'api.sound.ws';
const issuer = 'api.sound.ws';
// hard coded https://42crunch.com/7-ways-to-avoid-jwt-pitfalls/
const algorithm = 'HS256';

/**
 * Service to generate and verify JWT's
 */
class TokenService {
  /**
   *
   * @param {Object} params
   * @param {String} param.secret The secret
   */
  constructor({ secret }) {
    this.secret = secret;
  }

  /**
   * Generate a token
   *
   * @param {String} url
   * @param {Object} claims
   * @param {Object} options
   * @returns {String} The token
   *
   * @see https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
   */
  generateToken(claims = {}, options = {}) {
    return jwt.sign(
      {
        ...claims,
      },
      this.secret,
      {
        expiresIn: 60 * 5, // 5 minutes
        audience,
        issuer,
        algorithm,
        ...options,
      },
    );
  }

  /**
   * Verify a token
   *
   * @param {String} token
   * @param {Object} options
   * @returns {Object} The payload of the token
   *
   * @see https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
   */
  verify(token, options = {}) {
    return jwt.verify(token, this.secret, {
      audience,
      algorithms: [algorithm],
      ...options,
    });
  }

  /**
   * Create a signed url
   *
   * @param {String} url
   * @param {Object} claims
   * @param {Object} options
   * @param {String} paramName
   * @returns {String} The signed url
   */
  signUrl(url, claims = {}, options = {}, paramName = 'token') {
    return `${url}?${paramName}=${this.generateToken(claims, options)}`;
  }
}

module.exports = TokenService;
