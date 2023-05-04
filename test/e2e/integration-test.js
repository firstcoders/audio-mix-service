/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-env node, mocha */

// TODO rewrite to use SDK?

import assert from 'assert';
import axios from 'axios';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line import/no-extraneous-dependencies
import { S3 } from 'aws-sdk';
import { v1 as uuidv1 } from 'uuid';

const SERVICE_ENDPOINT = 'http://localhost:8080/dev';
const S3_ENDPOINT = 'http://www.s3.local:8000';
const S3_BUCKET_NAME = 'media-local';
const SWS_SECRET = '94961ef040d60996b3668577b26a2231e958815a35be22dfd493b02a2c59cd59';
const POLL_DELAY = 50;
const POLL_SPEED = 100;
const SAMPLE_WAV = 'http://www.s3.local:8000/media-local/106%20BELL_05.3.wav';

const createToken = (tokenExpiry) => {
  return jwt.sign(
    {
      aud: 'api.sound.ws',
    },
    SWS_SECRET,
    { expiresIn: tokenExpiry }
  );
};

const authenticatedRequest = async ({
  url = `${SERVICE_ENDPOINT}/create-mix`,
  data = {},
  options = {},
  token = null,
  tokenExpiry = 60,
} = {}) => {
  return axios.post(url, data, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token || createToken(tokenExpiry)}`,
    },
  });
};

const pollJob = (jobUrl) => {
  return new Promise((done, fail) => {
    const poll = async (url) => {
      let resp;

      try {
        resp = await axios.get(url);
        // console.log(resp);
      } catch (err) {
        return fail(err);
      }

      if (resp.data.job.status === 'STATUS_QUEUED') {
        setTimeout(() => poll(url), POLL_SPEED);
      } else if (resp.data.job.status === 'STATUS_SUCCESS') {
        done(resp);
      } else {
        console.log('FAIL', resp.data.job.error);
        fail();
      }
    };

    setTimeout(() => poll(jobUrl), POLL_DELAY);
  });
};

describe('Download Service Tests', () => {
  beforeEach(() => {});

  describe('Authentication', () => {
    it('returns a 401 when no auth token is present', async () => {
      let response;

      try {
        await axios.post(`${SERVICE_ENDPOINT}/create-mix`);
      } catch (e) {
        response = e.response;
      }

      // for some reason serverless local returns a 403 and apigw a 401
      if (process.env.IS_DOCKER) {
        assert.strictEqual(response.status, 403);
        assert.strictEqual(response.statusText, 'Forbidden');
      } else {
        assert.strictEqual(response.status, 401);
        assert.strictEqual(response.statusText, 'Unauthorized');
      }
    });

    it('returns a 403 when an invalid auth token is present', async () => {
      let response;

      try {
        await authenticatedRequest({ token: 'thisisnotatoken' });
      } catch (e) {
        response = e.response;
      }

      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.statusText, 'Forbidden');
    });

    it('returns a 403 when an expired token is present', async () => {
      let response;

      try {
        await authenticatedRequest({ tokenExpiry: 0 });
      } catch (e) {
        response = e.response;
      }

      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.statusText, 'Forbidden');
    });

    it('passes the authorizer with bearer token', async () => {
      let response;

      try {
        await authenticatedRequest();
      } catch (e) {
        response = e.response;
      }

      // if we get a 400, we have passed the authorizer
      assert.strictEqual(response.status, 400);
    });
  });

  describe('Validation', () => {
    it('returns a 400 when invalid data is sent', async () => {
      let response;

      try {
        await authenticatedRequest();
      } catch (e) {
        response = e.response;
      }

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.statusText, 'Bad Request');
    });
  });

  describe('Mixing', () => {
    it('returns a 202 when valid data is sent followed by a 201 with Location header when the mix is ready', async () => {
      let response;

      const s3 = new S3({
        endpoint: S3_ENDPOINT,
        signatureVersion: 'v4',
        s3ForcePathStyle: true,
      });

      const key = `tests/generated-files/${uuidv1()}.wav`;

      // Generate a signed url to allow service to post back the generated file to
      const callbackUrl = s3.getSignedUrl('putObject', {
        Expires: 10000,
        Key: key,
        ContentType: 'binary/octet-stream',
        Bucket: S3_BUCKET_NAME,
      });

      // // Generate a get url to eventually trigger the download
      const getObjectUrl = s3.getSignedUrl('getObject', {
        Bucket: S3_BUCKET_NAME,
        Expires: 1000,
        Key: key,
      });

      const sources = [SAMPLE_WAV, SAMPLE_WAV].map((file) => {
        return {
          src: file,
          volume: 0.5,
        };
      });

      const data = {
        callbackUrl,
        getObjectUrl,
        sources,
        metadata: [
          {
            key: 'artist',
            // To make sure we don't have a duplicate job
            value: `My artist ${Date.now()}`,
          },
          {
            key: 'genre',
            value: 'Rock',
          },
        ],
      };

      try {
        response = await authenticatedRequest({ data });
      } catch (e) {
        response = e.response;
      }

      assert.strictEqual(response.status, 202);
      assert.strictEqual(response.data.job.status, 'STATUS_QUEUED');
      assert(
        response.data._url.match(
          /http.*\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}\/status\?token=/
        ) !== null
      );
      assert(response.headers['access-control-expose-headers'].indexOf('Location') !== -1);
      assert(response.headers.location.match(/http.*/));

      // Poll the job until it's done
      const eventualResponse = await pollJob(response.data._url);
      const { job } = eventualResponse.data;

      // the object has been created and a redirect is
      assert.strictEqual(eventualResponse.status, 201);
      assert.strictEqual(eventualResponse.headers.location, getObjectUrl);
      assert.strictEqual(job.status, 'STATUS_SUCCESS');
      assert.strictEqual(new Date(job.createdAt).toUTCString(), job.createdAt);
      assert.strictEqual(new Date(job.completedAt).toUTCString(), job.completedAt);
      assert(job.timeTaken > 0);
    });

    // The same as the previousjob, but with the callbackUrl and objectUrl omitted
    it('works without callbackurl and signedobjecturl', async () => {
      let response;

      const sources = [SAMPLE_WAV, SAMPLE_WAV].map((file) => {
        return {
          src: file,
          volume: 0.5,
        };
      });

      const data = {
        sources,
        metadata: [
          {
            key: 'artist',
            // To make sure we don't have a duplicate job
            value: `My artist ${Date.now()}`,
          },
          {
            key: 'genre',
            value: 'Rock',
          },
        ],
      };

      try {
        response = await authenticatedRequest({ data });
      } catch (e) {
        response = e.response;
        console.log(response);
      }

      assert.strictEqual(response.status, 202);
      assert.strictEqual(response.data.job.status, 'STATUS_QUEUED');
      assert(
        response.data._url.match(
          /http.*\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}\/status\?token=/
        ) !== null
      );
      assert(response.headers['access-control-expose-headers'].indexOf('Location') !== -1);
      assert(response.headers.location.match(/http.*/));

      const eventualResponse = await pollJob(response.data._url);
      const { job } = eventualResponse.data;

      assert.strictEqual(eventualResponse.status, 201);
      assert(eventualResponse.headers.location.match(/http/));
      assert.strictEqual(job.status, 'STATUS_SUCCESS');
      assert.strictEqual(new Date(job.createdAt).toUTCString(), job.createdAt);
      assert.strictEqual(new Date(job.completedAt).toUTCString(), job.completedAt);
      assert(job.timeTaken > 0);
    });
  });

  // it deduplicates jobs
  // it returns 400 when corrupt json is sent
});
