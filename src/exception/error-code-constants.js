const ErrorCodeConstants = {
  InternalServerError: {
    code: 'InternalServerError',
    description: 'Internal Server Error',
  },
  LoadConfigError: {
    code: 'LoadConfigError',
    description: 'The service config could not be loaded',
  },
  ResourceNotFound: {
    code: 'ResourceNotFound',
    description: 'Resource Not found.',
  },
  BadRequest: {
    code: 'BadRequest',
    description: 'Bad Request',
  },
  UnsupportedMediaType: {
    code: 'UnsupportedMediaType',
    description: 'Unsupported Media Type',
  },
  BadConfigException: {
    code: 'BadConfigException',
    description: 'Bad Config Exception',
  },
  // UploadError: {
  //   code: 'UploadError',
  //   description: 'Could not upload file to destination',
  // },
  // AudioProcessingError: {
  //   code: 'AudioProcessingError',
  //   description: 'The audio could not be processed',
  // },
};

module.exports = ErrorCodeConstants;
