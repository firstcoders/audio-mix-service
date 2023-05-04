import assert from 'assert';
import sinon from 'sinon';
import ErrorHandler from '../../../src/lib/error-handler';
import ResourceNotFoundException from '../../../src/exception/resource-not-found-exception';
import BadRequestException from '../../../src/exception/bad-request-exception';
import ValidationException from '../../../src/exception/validation-exception';
import UnsupportedMediaTypeException from '../../../src/exception/unsupported-media-type-exception';

const logger = { error: sinon.spy() };

const createErrorHandler = (debug) => {
  return new ErrorHandler({
    logger,
    config: { Debug: debug },
  });
};

describe('error-hander', () => {
  it('returns a 404 for a ResourceNotFoundException', () => {
    const response = createErrorHandler().createResponseForException(
      new ResourceNotFoundException()
    );
    assert.strictEqual(404, response.statusCode);
    assert.strictEqual(
      '{"error":{"description":"Resource Not found.","code":"ResourceNotFound"}}',
      response.body
    );
  });

  it('returns a 400 for a BadRequestException', () => {
    const response = createErrorHandler().createResponseForException(new BadRequestException());
    assert.strictEqual(400, response.statusCode);
    assert.strictEqual(
      '{"error":{"description":"Bad Request","code":"BadRequest"}}',
      response.body
    );
  });

  it('returns a 400 with errors for a ValidationException', () => {
    const response = createErrorHandler().createResponseForException(
      new ValidationException([new Error('error1'), 'error2'])
    );
    assert.strictEqual(400, response.statusCode);
    assert.strictEqual(
      '{"error":{"description":"Bad Request","code":"BadRequest"},"errors":[{"name":"Error","message":"error1"},{"message":"error2"}]}',
      response.body
    );
  });

  it('returns a 400 for a UnsupportedMediaTypeException', () => {
    const response = createErrorHandler().createResponseForException(
      new UnsupportedMediaTypeException()
    );
    assert.strictEqual(415, response.statusCode);
    assert.strictEqual(
      '{"error":{"description":"Unsupported Media Type","code":"UnsupportedMediaType"}}',
      response.body
    );
  });

  it('returns a 500 for a Error', () => {
    const response = createErrorHandler().createResponseForException(new Error('blah'));
    assert.strictEqual(500, response.statusCode);
    assert.strictEqual(
      '{"error":{"code":"INTERNAL_SERVER_ERROR","description":"Something has gone wrong"}}',
      response.body
    );
  });

  it('includes debug when this is turned on in the config', () => {
    const response = createErrorHandler(true).createResponseForException(new Error('blah'));
    assert.strictEqual(500, response.statusCode);
    assert.strictEqual(
      '{"error":{"code":"INTERNAL_SERVER_ERROR","description":"Something has gone wrong","message":"blah"}}',
      response.body
    );
  });
});
