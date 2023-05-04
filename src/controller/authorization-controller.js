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
