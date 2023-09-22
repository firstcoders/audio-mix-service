/**
 * Copyright (C) 2019-2023 First Coders LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
    '/',
  );

  return `${protocol}://${hostAndPath}`;
};
