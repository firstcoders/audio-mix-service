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
/**
 * Deals with authorization functionality
 */
class AuthorizationController {
  /**
   * @param {Object} params
   * @param {Object} params.di - Dependency injection
   */
  constructor({ di }) {
    this.di = di;
  }

  /**
   * Authorize with Bearer token
   *
   * @param {Object} event
   * @returns {Promise}
   */
  async authorizeBearerToken(event) {
    const { authorizationToken } = event;
    const token = (authorizationToken || '').replace('Bearer ', '');
    const authorizer = this.di.getTokenAuthorizer();
    return authorizer.authorize({
      event,
      token,
      options: {
        audience: 'api.sound.ws',
      },
    });
  }

  /**
   * Authorizer for signed urls for a job uuid
   *
   * @param {Object} event
   * @returns {Promise}
   */
  async authorizeSignedUrl(event) {
    const { token } = event.queryStringParameters || {};

    return this.di.getTokenAuthorizer().authorize({
      event,
      token,
      options: {
        issuer: 'api.sound.ws', // signed urls are always issued by the service itself
        audience: 'api.sound.ws',
      },
      assert: (decodedToken) =>
        new Promise((resolve) => {
          resolve(decodedToken.jobUuid === event.pathParameters.uuid);
        }),
    });
  }
}

module.exports = AuthorizationController;
