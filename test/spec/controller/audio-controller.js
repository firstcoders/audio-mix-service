import assert from 'assert';
import sinon from 'sinon';
import AudioController from '../../../src/controller/audio-controller';
import Di from '../../../src/service/dependency-injection-service';
import Config from '../../../src/config';

const {
  STATUS_QUEUED,
  STATUS_SUCCESS,
  STATUS_FAILED,
  STATUS_PROCESSING,
} = require('../../../src/constants/job-status');

const validJob = {
  sources: [
    {
      src: 'https://blah.com',
      volume: 1,
    },
    {
      src: 'https://blah.com',
      volume: 1,
    },
  ],
  metadata: [
    {
      key: 'artist',
      // To make sure we don't have a duplicate job
      value: 'My artist',
    },
    {
      key: 'genre',
      value: 'Rock',
    },
  ],
};

describe('Audio Controller', () => {
  let config;
  let di;
  let controller;

  beforeEach(async () => {
    config = await Config.load();
    config.Logger.level = 'error';
    config.TokenService.secret = 'blah';
    di = new Di({ config });
    controller = new AudioController({ di, config });
  });

  describe('Creating a mix', () => {
    it('throws a validation error if the request data is not valid', async () => {
      const assertErrorThrown = async (body, error) => {
        let errorThrown;

        try {
          await controller.createAudioMix({ body });
        } catch (err) {
          errorThrown = err;
        }

        assert.strictEqual(errorThrown.code, error);
      };

      assertErrorThrown('{}', 'BadRequest');
    });

    it('redirects if a duplicate job is found', async () => {
      di.getJobService = () => ({
        findDuplicateJob: sinon.stub().returns({ uuid: 'uuid' }),
        serializeJob: sinon.stub().returns({ uuid: 'uuid' }),
      });

      di.getStorageService = () => ({});

      const response = await controller.createAudioMix({
        body: JSON.stringify(validJob),
        headers: { host: 'www.sound.ws' },
        path: '/get/it/here',
      });

      assert.strictEqual(response.statusCode, 303);

      assert(
        response.headers.Location.indexOf(
          'https://www.sound.ws/get/it/here/mix/status/uuid?token=',
        ) !== -1,
      );
      // assert.strictEqual(response.headers['Access-Control-Expose-Headers'], 'Location');
      // assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');
      // assert.strictEqual(response.headers['Access-Control-Allow-Headers'], 'Authorization');
      assert(response.body.indexOf('Duplicate job found') !== -1);
      // assert(response.body.indexOf('_url":"https') !== -1);
      // assert(response.body.indexOf('"_retryIn":5') !== -1);
    });

    // eslint-disable-next-line jest/expect-expect
    it('generates the mix', async () => {
      const jobService = {
        findDuplicateJob: sinon.stub().returns(false),
        serializeJob: sinon.stub().returns({ uuid: 'uuid' }),
        putJob: sinon.spy(),
        getJob: sinon.stub().returns({ uuid: 'uuid' }),
        publishJob: sinon.spy(),
      };

      const storageService = {
        createPutObjectUrl: sinon.stub().returns('https://put.it.here.com'),
        createGetObjectUrl: sinon.stub().returns('https://get.it.here.com'),
      };

      di.getJobService = () => jobService;
      di.getStorageService = () => storageService;

      const response = await controller.createAudioMix({
        body: JSON.stringify(validJob),
        headers: { host: 'www.sound.ws' },
        path: '/get/it/here',
      });

      // Test urls are auto-generated
      assert(storageService.createGetObjectUrl.calledOnce);
      assert(storageService.createGetObjectUrl.calledOnce);

      // Test the job is stored in the db
      assert(
        jobService.putJob.calledWith(
          sinon.match.any,
          sinon.match(
            (v) =>
              v.sources.length === 2 &&
              v.status === 'STATUS_QUEUED' &&
              v.metadata[0].key === 'artist' &&
              v.metadata[0].value === 'My artist' &&
              typeof v.createdAt === 'number' &&
              typeof v.MD5OfMessageBody === 'string' &&
              v.getObjectUrl === 'https://get.it.here.com',
          ),
        ),
      );

      // Test the job is published
      assert(jobService.publishJob.calledOnceWith({ uuid: 'uuid' }));

      // Test response
      assert.strictEqual(response.statusCode, 303);
      assert(response.headers.Location.indexOf('https://www.sound.ws/get/it/here/status/') !== -1);
      // assert.strictEqual(response.headers['Access-Control-Expose-Headers'], 'Location');
      // assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');
      // assert.strictEqual(response.headers['Access-Control-Allow-Headers'], 'Authorization');
      assert(response.body.indexOf('Request accepted') !== -1);
      // assert(response.body.indexOf('_url":"https') !== -1);
      // assert(response.body.indexOf('"_retryIn":5') !== -1);
    });
  });

  describe('Getting the status of a job', () => {
    const runTest = (status) => {
      di.getJobService = () => ({
        findDuplicateJob: sinon.stub().returns(false),
        serializeJob: sinon.stub().returns({ uuid: 'uuid' }),
        putJob: sinon.spy(),
        getJob: sinon.stub().returns({ uuid: 'uuid', status }),
        publishJob: sinon.spy(),
      });

      return controller.getAudioMixStatus({
        body: JSON.stringify(validJob),
        pathParameters: { uuid: 'uuid' },
        headers: { host: 'www.sound.ws' },
        path: '/get/it/here',
        resource: '/jobs/{uuid}/status',
      });
    };

    it('returns the correct response when the job is queued', async () => {
      const response = await runTest(STATUS_QUEUED);

      // Test response
      assert.strictEqual(response.statusCode, 200);
      // assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');
      assert(response.body.indexOf('The request is pending') !== -1);
      assert(response.body.indexOf('"job":{"uuid":"uuid"') !== -1);
      // assert(
      //   response.body.indexOf(
      //     '{"_url":"https://www.sound.ws/get/it/here/jobs/uuid/status?token='
      //   ) !== -1
      // );
      assert(response.body.indexOf('"_retryIn":5') !== -1);
    });

    it('returns the correct response when the job is processing', async () => {
      const response = await runTest(STATUS_PROCESSING);

      // Test response
      assert.strictEqual(response.statusCode, 200);
      // assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');
      assert(response.body.indexOf('The request is pending') !== -1);
      assert(response.body.indexOf('"job":{"uuid":"uuid"') !== -1);
      // assert(
      //   response.body.indexOf(
      //     '{"_url":"https://www.sound.ws/get/it/here/jobs/uuid/status?token='
      //   ) !== -1
      // );
      assert(response.body.indexOf('"_retryIn":5') !== -1);
    });

    it('returns the correct response when the job has failed', async () => {
      const response = await runTest(STATUS_FAILED);

      assert.strictEqual(response.statusCode, 200);
      // assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');
      assert(
        response.body.indexOf(
          '"message":"Something went wrong while processing your request. Please try again later."',
        ) !== -1,
      );
      assert(response.body.indexOf('"job":{"uuid":"uuid"') !== -1);
    });

    it('returns the correct response when the job has succeeeded', async () => {
      const response = await runTest(STATUS_SUCCESS);

      assert.strictEqual(response.statusCode, 200);
      assert(response.body.indexOf('"message":"The request succeeded."') !== -1);
      assert(response.body.indexOf('"job":{"uuid":"uuid"') !== -1);
    });
  });
});
