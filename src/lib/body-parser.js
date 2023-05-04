const qs = require('querystring');
const UnsupportedMediaTypeException = require('../exception/unsupported-media-type-exception');
const BadRequestHttpException = require('../exception/bad-request-exception');
const { getHeader } = require('./request');

module.exports = (event) => {
  // Don't do anything if we don't have a body
  if (!event || !event.body) return undefined;

  const { body } = event;
  const contentType = getHeader('Content-Type', event) || 'application/json';

  if (contentType.indexOf('application/json') !== -1) {
    try {
      return JSON.parse(body);
    } catch (err) {
      throw new BadRequestHttpException(err.message, err);
    }
  } else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
    const data = qs.parse(body);

    if (data.json) {
      try {
        return JSON.parse(data.json);
      } catch (err) {
        throw new BadRequestHttpException(err.message, err);
      }
    }

    return data;
  }

  throw new UnsupportedMediaTypeException();
};
