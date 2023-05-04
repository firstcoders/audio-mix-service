import assert from 'assert';
import TokenService from '../../../src/services/token-service';

describe('token-service', async () => {
  it('generates a token with claims and options', async () => {
    const tokenService = new TokenService({ secret: 'blah' });
    const token = tokenService.generateToken({ a: 1, b: 2 });
    assert(token.split('.').length === 3);

    const { a, b } = tokenService.verify(token);
    assert.strictEqual(a, 1);
    assert.strictEqual(b, 2);
  });

  it('signs a url', async () => {
    const tokenService = new TokenService({ secret: 'blah' });
    const url = tokenService.signUrl('https://sound.ws/blah', { a: 1, b: 2 });

    assert(url.indexOf('?token=') !== -1);
  });

  it('verifies a token with claims and options', () => {
    const runVerifyTest = (options, error) => {
      const tokenService = new TokenService({ secret: 'blah' });
      const token = tokenService.generateToken(
        { a: 1, b: 2 },
        { subject: '123', issuer: 'memyselfandi' }
      );
      assert(token.split('.').length === 3);

      let errorThrown;
      try {
        tokenService.verify(token, options);
      } catch (err) {
        errorThrown = err;
      }

      if (error) {
        assert(errorThrown instanceof Error);
        assert(errorThrown.name === 'JsonWebTokenError');
      }
    };

    runVerifyTest({ subject: '123' }, false);
    runVerifyTest({ subject: '234' }, true);
    runVerifyTest({ subject: '123', issuer: 'memyselfandi' }, false);
    runVerifyTest({ subject: '123', issuer: 'youyourselfandyou' }, true);
  });
});
