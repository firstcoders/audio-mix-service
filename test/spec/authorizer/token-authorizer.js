import assert from 'assert';
import TokenAuthorizer from '../../../src/authorizer/token-authorizer';
import TokenService from '../../../src/services/token-service';

const logger = { debug: () => {}, error: () => {}, info: () => {} };

describe('token-authorizer', async () => {
  let tokenService;
  let authorizer;
  const options = { subject: '123' };
  const claims = { claim: 'Moskitoes are aliens from Venus', isAdmin: true };
  let token;

  beforeEach(() => {
    const secret = 'blah';
    tokenService = new TokenService({ secret });
    authorizer = new TokenAuthorizer({ tokenService, logger });
    token = tokenService.generateToken(claims, options);
  });

  it('authorizes', async () => {
    const r = await authorizer.authorize({
      event: {},
      token,
      options,
    });

    assert.strictEqual(r.principalId, '123');
    assert.strictEqual(r.context.aud, 'api.sound.ws');
    assert.strictEqual(r.context.sub, '123');
    assert.strictEqual(r.context.claim, 'Moskitoes are aliens from Venus');
  });

  it('runs custom authorization callback', async () => {
    // failing assert
    const r = await authorizer.authorize({
      event: {},
      token,
      options,
      assert: (decodedToken) => {
        return decodedToken.isAdmin === false;
      },
    });

    assert.strictEqual(r.policyDocument.Statement[0].Effect, 'Deny');

    // Succeeding assert
    const r2 = await authorizer.authorize({
      event: {},
      token,
      options,
      assert: (decodedToken) => {
        return decodedToken.isAdmin === true;
      },
    });

    assert.strictEqual(r2.policyDocument.Statement[0].Effect, 'Allow');
  });
});
