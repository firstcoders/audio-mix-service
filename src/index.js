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
const ErrorHandler = require('./lib/error-handler');
const ErrorCodeConstants = require('./exception/error-code-constants');
const generatePolicy = require('./lib/generate-policy');
const Config = require('./config');
const DependencyInjectionService = require('./service/dependency-injection-service');
const JobController = require('./controller/job-controller');
const AudioController = require('./controller/audio-controller');
const AuthorizationController = require('./controller/authorization-controller');

/**
 * Creates a request handler, for a given controller method, by setting its
 * di, and config dependencies. Provides basic error handling augmentation.
 *
 * @param Controller
 * @param method
 * @param args
 * @returns {Promise<*>}
 */
// eslint-disable-next-line consistent-return
const createHandler = async (Controller, method, event, context) => {
  let config;

  try {
    config = await Config.load(event, context);
  } catch (ex) {
    console.error('Failed to load config', { ex });

    // when dealing with authorizer we need a different response
    if (Controller === AuthorizationController) {
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        description: ErrorCodeConstants.LoadConfigError.description,
        code: ErrorCodeConstants.LoadConfigError.code,
      }),
    };
  }

  const di = new DependencyInjectionService({ config });

  let response;

  try {
    di.getLog().debug('Received request', { event });
    const controller = new Controller({ config, di });
    response = await controller[method].call(controller, event, context);
    di.getLog().info('Sending response', { response });
  } catch (ex) {
    const errorHandler = new ErrorHandler({ config, logger: di.getLog() });
    response = errorHandler.createResponseForException(ex);
  }

  if (response) {
    if (Controller !== AuthorizationController) {
      // Add CORS headers to response, if a response is returned by the controller
      const origin = event.headers.origin || event.headers.Origin;
      if (
        config.Cors.AllowedOrigins.indexOf('*') !== -1 ||
        config.Cors.AllowedOrigins.indexOf(origin) !== -1
      ) {
        response.headers = {
          'Access-Control-Allow-Headers': 'Authorization',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Max-Age': 86400,
          ...response.headers,
        };
      }
    }

    di.getLog().debug('Sending response', { response });
    return response;
  }

  // Dont throw an error - some handlers may not return a response (e.g. non http invoked lambdas)
  // throw new Error('Handler failed');
};

module.exports = {
  createAudioMix: async (...args) => createHandler(AudioController, 'createAudioMix', ...args),
  getAudioMix: async (...args) => createHandler(AudioController, 'getAudioMix', ...args),
  getAudioMixStatus: async (...args) =>
    createHandler(AudioController, 'getAudioMixStatus', ...args),
  authorizeBearerToken: async (...args) =>
    createHandler(AuthorizationController, 'authorizeBearerToken', ...args),
  authorizeSignedUrl: async (...args) =>
    createHandler(AuthorizationController, 'authorizeSignedUrl', ...args),
  consumeJob: async (...args) => createHandler(JobController, 'consumeJob', ...args),
};
