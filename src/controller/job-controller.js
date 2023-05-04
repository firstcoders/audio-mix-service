const { STATUS_SUCCESS, STATUS_FAILED } = require('../constants/job-status');

/**
 * Processes the job
 */
class JobController {
  /**
   * @param {Object} params
   * @param {Object} params.config - The config service
   * @param {Object} params.di - Dependency injection
   */
  constructor({ config, di }) {
    this.di = di;
    this.config = config;
  }

  /**
   * Takes a single SQS message and processes the job
   * @param {Object} event
   */
  async consumeJob(event) {
    const processor = this.di.getMessageProcessor();
    const js = this.di.getJobService();
    const log = this.di.getLog();

    // SQS can distribute a batch of messages, however we only set batchSize: 1
    await Promise.all(
      event.Records.map(async (message) => {
        const start = process.hrtime();
        let job;
        let uuid;

        try {
          const body = JSON.parse(message.body);
          uuid = body.uuid;
          job = await js.getJob(uuid);
        } catch (err) {
          log.error('Failed to get job', { cause: err.message });
          throw new Error('Failed to get job', { cause: err.message });
        }

        try {
          const { fileSize } = await processor.process(message);
          const end = process.hrtime(start);

          await js.putJob(uuid, {
            ...job,
            status: STATUS_SUCCESS,
            completedAt: Date.now(),
          });

          log.info('Message processing complete', {
            meta: {
              executionTime: ('%ds %dms', end[0], end[1] / 1000000),
              memoryUsed: process.memoryUsage(),
              fileSize,
            },
          });
        } catch (ex) {
          const error = {
            description: ex.description,
            code: ex.code,
            message: ex.message,
          };
          log.error('Message processing failed', { error });

          await js.putJob(uuid, {
            ...job,
            completedAt: Date.now(),
            status: STATUS_FAILED,
            error,
          });
        }
      })
    );

    log.debug('end');
  }
}

module.exports = JobController;
