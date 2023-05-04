import qs from 'querystring';
import assert from 'assert';
import parseBody from '../../../src/lib/body-parser';

describe('body-parser', async () => {
  it('parses the request body using the content-type', () => {
    assert.strictEqual(parseBody(), undefined);
    assert.strictEqual(parseBody({}), undefined);
    assert.deepStrictEqual(parseBody({ body: '{"a":"1"}' }), { a: '1' }); // assumes application/json
    assert.deepStrictEqual(
      parseBody({
        body: qs.encode({ json: '{"a":"1"}' }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
      { a: '1' }
    );

    const assertException = (event, code) => {
      // corrupt jkson
      let errorThrown;
      try {
        parseBody(event);
      } catch (err) {
        errorThrown = err;
      }
      assert.strictEqual(errorThrown.code, code);
    };

    assertException({ body: '{"a":"1"' }, 'BadRequest');
    assertException(
      { body: '{"a":"1"}', headers: { 'Content-Type': 'text/html' } },
      'UnsupportedMediaType'
    );
  });
});
