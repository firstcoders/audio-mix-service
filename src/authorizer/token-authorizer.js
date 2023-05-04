class TokenAuthorizer {
  constructor({ tokenService, logger }) {
    if (!tokenService) throw new Error('TokenAuthorizer: TokenService is null or undefined');
    this.tokenService = tokenService;
    this.logger = logger || console;
  }

  async authorize({ event, token, options = {}, assert = null }) {
    try {
      this.logger.debug('Start authorizing');

      if (!token) {
        throw new Error('TokenAuthorizer: no token found');
      }

      let decoded;

      try {
        this.logger.debug('Start verifying token ', { options });
        decoded = this.tokenService.verify(token, options);
        this.logger.debug('Completed verifying token');
      } catch (ex) {
        this.logger.debug('Failed verifying token', {
          reason: ex.message,
        });

        throw ex;
      }

      // Execute a custom function e.g. to check additional claims
      if (assert) {
        this.logger.debug('Running custom authorization assert function');

        if (!(await assert(decoded))) {
          throw new Error('TokenAuthorizer: Failed assert function');
        }
        this.logger.debug('PASSED custom authorization assert function');
      }

      this.logger.debug('Completed authorizing');
      return this.createPolicy(event, 'Allow', decoded.sub, decoded);
    } catch (err) {
      this.logger.info(`Failed authorizing due to ${err.message}`);
      return this.createPolicy(event, 'Deny');
    }
  }

  createPolicy(event, effect, principalId, context = {}) {
    const policy = {
      principalId: principalId || 'Unknown',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: event.methodArn,
          },
        ],
      },
      context,
    };

    if (context.apiKey) {
      policy.usageIdentifierKey = context.apiKey;
    }

    return policy;
  }
}

module.exports = TokenAuthorizer;
