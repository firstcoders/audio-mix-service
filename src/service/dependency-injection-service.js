// const AWSXRay = require('aws-xray-sdk');
// const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const S3 = require('aws-sdk/clients/s3');
const SQS = require('aws-sdk/clients/sqs');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const axios = require('axios');
const { spawnSync } = require('child_process');
const { Validator } = require('jsonschema');
const LogFactory = require('../factory/console-logger-factory');
const TokenAuthorizer = require('../authorizer/token-authorizer');
const TokenService = require('../services/token-service');
const JobService = require('./job-service');
const JobValidator = require('./job-validator');
const schema = require('../models/job-model');
const S3StorageService = require('./s3-storage-service');
const MessageProcessor = require('./message-processor-service');
const StemMixer = require('./stem-mix-service');

// XRAY
// https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-httpclients.html
// https://stackoverflow.com/questions/52716949/how-can-we-trace-axios-http-requests-with-aws-x-ray
// AWSXRay.captureHTTPsGlobal(require('https'));

class DependencyInjection {
  constructor({ config } = {}) {
    this.config = config;
  }

  getConfig() {
    return this.config;
  }

  getLog() {
    return LogFactory.getLogMechanism({ config: this.config.Logger });
  }

  getJobService() {
    return new JobService({
      log: this.getLog(),
      config: this.config,
      ddb: this.getDynamoDbClient(),
      sqsClient: this.getSqsClient(),
    });
  }

  getJobValidator() {
    return new JobValidator({
      schema,
      log: this.getLog(),
      validator: new Validator(),
    });
  }

  getDynamoDbClient() {
    const config = {
      apiVersion: '2012-08-10',
    };

    if (this.config.DynamoDb.endpoint) {
      config.endpoint = this.config.DynamoDb.endpoint;
    }

    return new DynamoDB.DocumentClient(config);
  }

  getTokenService() {
    return new TokenService({
      secret: this.config.TokenService.secret,
    });
  }

  getStorageService() {
    if (!this.storageService) {
      this.storageService = new S3StorageService({ di: this, ...this.config.Storage });
    }

    return this.storageService;
  }

  getTokenAuthorizer() {
    if (!this.TokenAuthorizer) {
      this.tokenAuthorizer = new TokenAuthorizer({
        tokenService: this.getTokenService(),
        logger: this.getLog(),
      });
    }

    return this.tokenAuthorizer;
  }

  getS3Client() {
    if (!this.s3) {
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html
      // AWS.config.update({
      //   signatureVersion: 'v4',
      //   // not sure why this is needed, but for some reason som signed urls didn't have the correct region
      //   region: process.env.AWS_DEFAULT_REGION,
      //   httpOptions: { timeout: 1000 * 3 },
      // });

      // the endpoint is for dev + the test suite
      this.s3 = new S3(
        this.config.Storage.Endpoint
          ? {
              endpoint: this.config.Storage.Endpoint,
              signatureVersion: 'v4',
              s3ForcePathStyle: true,
              // not sure why this is needed, but for some reason som signed urls didn't have the correct region
              region: process.env.AWS_DEFAULT_REGION,
            }
          : {}
      );
    }

    return this.s3;
  }

  getMessageProcessor() {
    return new MessageProcessor({
      log: this.getLog(),
      stemMixer: this.getStemMixer(),
      s3StorageService: this.getStorageService(),
      // fileUploader: this.getFileUploader(),
    });
  }

  getStemMixer() {
    return new StemMixer({
      log: this.getLog(),
      spawnSync,
      config: this.config,
    });
  }

  // getFileUploader() {
  //   return new FileUploader({
  //     log: this.getLog(),
  //     axios: this.getAxiosClient(),
  //     fs,
  //     config: this.config,
  //   });
  // }

  getSqsClient() {
    return new SQS({ apiVersion: '2012-11-05' });
  }

  getAxiosClient() {
    const httpClient = axios.create();
    httpClient.defaults.timeout = this.config.Uploads.Timeout;
    return httpClient;
  }
}

module.exports = DependencyInjection;
