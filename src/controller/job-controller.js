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
      }),
    );

    log.debug('end');
  }
}

module.exports = JobController;
