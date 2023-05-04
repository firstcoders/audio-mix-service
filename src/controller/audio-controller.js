const { v4: createUuid } = require('uuid');
const crypto = require('crypto');
const absoluteUrl = require('../lib/absolute-url');
const parseBody = require('../lib/body-parser');
const ResourceNotFoundException = require('../exception/resource-not-found-exception');
const BadRequestException = require('../exception/bad-request-exception');
const {
  STATUS_QUEUED,
  STATUS_SUCCESS,
  STATUS_FAILED,
  STATUS_PROCESSING,
} = require('../constants/job-status');

const createBadRequestResponse = (errors) => ({
  statusCode: 400,
  body: JSON.stringify({
    errors,
  }),
});

/**
 * Provides all job related crud functionality.
 */
class AudioController {
  /**
   * @param {Object} params
   * @param {Object} params.config - Config service
   * @param {Object} params.di - Dependency injection
   */
  constructor({ config, di }) {
    this.di = di;
    this.config = config;
  }

  /**
   * Create a mix
   * @param {Object} event
   * @returns {Object} - the response
   */
  async createAudioMix(event) {
    const js = this.di.getJobService();
    const data = parseBody(event);

    // ensure data is according to schema
    this.di.getJobValidator().rejectIfNotValid(data);

    // validate allowed audio origins. A claim in the bearer token can override the default;
    const { authorizer } = event?.requestContext || {};

    try {
      const allowedOrigins =
        authorizer?.allowedAudioOrigins?.split(',').map((v) => v.trim()) ||
        this.config.AllowedAudioOrigins;

      if (allowedOrigins !== '*') {
        data.sources.forEach(({ src }) => {
          if (allowedOrigins.find((v) => src.indexOf(v) === 0) === undefined) {
            throw new Error('the sourceUrl origin is not permitted');
          }
        });
      }
    } catch (error) {
      return createBadRequestResponse([
        {
          property: 'sourceUrl',
          message: 'the sourceUrl origin is not permitted',
        },
      ]);
    }

    // Content de-duplication.
    // Look for job with the same hash that is in progress.
    // If we find it, we redirect to it.
    const deduplicationHash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    const duplicateJob = await js.findDuplicateJob(deduplicationHash, STATUS_QUEUED);

    if (duplicateJob) {
      this.di.getLog().debug('Found duplicate job. Redirecting', { duplicateJob });

      return {
        statusCode: 303,
        headers: {
          Location: this.signUrl(`/status/${duplicateJob.uuid}`, duplicateJob, event),
        },
        body: JSON.stringify({
          message: 'Duplicate job found',
        }),
      };
    }

    // We're good. Store job
    const uuid = createUuid();

    data.key = `${this.config.Storage.FolderPrefix}/${uuid}.wav`;
    data.getObjectUrl = this.di.getStorageService().createGetObjectUrl(data.key, data.filename);
    data.status = STATUS_QUEUED;
    data.createdAt = Date.now();
    data.MD5OfMessageBody = deduplicationHash;

    await js.putJob(uuid, { ...data });
    const job = await js.getJob(uuid);

    // publish the job
    await js.publishJob(job);

    return {
      statusCode: 303,
      headers: {
        Location: this.signUrl(`/status/${uuid}`, job, event),
      },
      body: JSON.stringify({
        message: 'Request accepted',
      }),
    };
  }

  async getAudioMixStatus(event) {
    const js = this.di.getJobService();
    const { uuid } = event.pathParameters || {};

    if (!uuid) throw new BadRequestException('Missing uuid');

    const job = await js.getJob(uuid);

    if (!job) throw new ResourceNotFoundException();

    if (job.status === STATUS_QUEUED || job.status === STATUS_PROCESSING) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          _retryIn: this.config.Job.PollDelay,
          // url to "self" since some xhr clients dont seem to be able to determine the eventual url of a redirected request
          _url: this.signUrl(`/status/${uuid}`, job, event),
          message: `The request is pending`,
          job: await js.serializeJob(job),
        }),
      };
    }

    if (job.status === STATUS_FAILED) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Something went wrong while processing your request. Please try again later.',
          job: await js.serializeJob(job),
        }),
      };
    }

    if (job.status === STATUS_SUCCESS) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          _url: job.getObjectUrl,
          message: `The request succeeded.`,
          job: await js.serializeJob(job),
        }),
      };
    }

    throw new Error(`Unknown Job status ${job.status}`);
  }

  signUrl(path, job, event) {
    const url = absoluteUrl(path, event);
    const { authorizer } = event.requestContext || {};

    return this.di.getTokenService().signUrl(
      url,
      {
        jobUuid: job.uuid,
        apiKey: authorizer?.apiKey, // reuse the api key, in case the method is configured to require one
      },
      {
        issuer: 'api.sound.ws',
        audience: 'api.sound.ws',
      }
    );
  }
}

module.exports = AudioController;
