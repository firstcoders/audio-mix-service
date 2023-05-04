/* eslint-disable jest/expect-expect */
import assert from 'assert';
import AuthorizationController from '../../../src/controller/authorization-controller';
import Di from '../../../src/service/dependency-injection-service';
import Config from '../../../src/config';

describe('Authorization Controller', () => {
  let config;
  let di;
  let controller;

  beforeEach(async () => {
    config = await Config.load();
    di = new Di({ config });
    controller = new AuthorizationController({ di });
  });

  it('authorizes with Bearer token', async () => {
    // no token
    const response1 = await controller.authorizeBearerToken({});
    assert.strictEqual(response1.policyDocument.Statement[0].Effect, 'Deny');

    // invalid token
    const response2 = await controller.authorizeBearerToken({
      authorizationToken: 'Bearer blah',
    });
    assert.strictEqual(response2.policyDocument.Statement[0].Effect, 'Deny');

    // valid token
    config.TokenService.secret = 'blah';
    const token = di.getTokenService().generateToken({ a: 1 });
    const response3 = await controller.authorizeBearerToken({
      authorizationToken: `Bearer ${token}`,
    });

    assert.strictEqual(response3.policyDocument.Statement[0].Effect, 'Allow');
  });

  it('authorizes with signed url', async () => {
    // no token
    const response1 = await controller.authorizeSignedUrl({});
    assert.strictEqual(response1.policyDocument.Statement[0].Effect, 'Deny');

    // invalid token
    const response2 = await controller.authorizeSignedUrl({
      queryStringParameters: { token: 'blah' },
    });
    assert.strictEqual(response2.policyDocument.Statement[0].Effect, 'Deny');

    // valid token, wrong uuid
    config.TokenService.secret = 'blah';
    const token = di.getTokenService().generateToken({ jobUuid: 'thisisauuid' });
    const response3 = await controller.authorizeSignedUrl({
      queryStringParameters: { token },
      pathParameters: { uuid: 'thisisanotheruuid' },
    });

    assert.strictEqual(response3.policyDocument.Statement[0].Effect, 'Deny');

    // valid token
    config.TokenService.secret = 'blah';
    const token2 = di.getTokenService().generateToken({ jobUuid: 'thisisauuid' });
    const response4 = await controller.authorizeSignedUrl({
      queryStringParameters: { token: token2 },
      pathParameters: { uuid: 'thisisauuid' },
    });

    assert.strictEqual(response4.policyDocument.Statement[0].Effect, 'Allow');
  });
});
