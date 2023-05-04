const { getHeader } = require('./request');

module.exports = (url, event) => {
  const host = getHeader('X-Forwarded-Host', event) || getHeader('host', event);
  const { path, pathParameters, resource, requestContext } = event;
  let protocol = 'https';
  let basepath = '';

  if (!host) throw new Error('Missing host header in event object');

  if (process.env.NODE_ENV === 'development') {
    // localhost
    protocol = 'http';
    basepath = 'dev';
  } else if (host.indexOf('execute-api') !== -1) {
    // execute-api url
    basepath = requestContext.stage;
  } else {
    if (!path) throw new Error('Missing path property in event object');

    // custom domain
    // we need to determine the apigateway mapping path
    let resourcePath = resource || '';

    if (pathParameters) {
      const keys = Object.keys(pathParameters);
      keys.forEach((key) => {
        resourcePath = resourcePath.replace(new RegExp(`{${key}}`), pathParameters[key]);
      });
    }

    basepath = path.replace(resourcePath, '');
  }

  const hostAndPath = `${host}/${basepath.replace(/\/$/, '')}/${url.replace(/^\//, '')}`.replace(
    /\/+/g,
    '/'
  );

  return `${protocol}://${hostAndPath}`;
};
