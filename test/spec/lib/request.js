import assert from 'assert';
import { getHeader } from '../../../src/lib/request';

describe('absolute-url', async () => {
  it('gets the headers from the request object', () => {
    assert.strictEqual(getHeader('Content-Type'), undefined);
    assert.strictEqual(getHeader('Content-Type', {}), undefined);
    assert.strictEqual(getHeader('Content-Type', { headers: 'blah' }), undefined);
    assert.strictEqual(getHeader('Content-Type', { headers: {} }), undefined);
    assert.strictEqual(getHeader('Content-Type', { headers: { 'Content-Type': 'blah' } }), 'blah');
    assert.strictEqual(getHeader('Content-Type', { headers: { 'content-type': 'blah' } }), 'blah');
    assert.strictEqual(getHeader('content-type', { headers: { 'content-type': 'blah' } }), 'blah');
    assert.strictEqual(getHeader('content-type', { headers: { 'Content-Type': 'blah' } }), 'blah');
  });
});
