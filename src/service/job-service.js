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
const { STATUS_FAILED } = require('../constants/job-status');

class JobService {
  constructor({ ddb, sqsClient, log, config }) {
    this.ddb = ddb;
    this.sqsClient = sqsClient;
    this.log = log;
    this.config = config;
  }

  async getJob(uuid) {
    this.log.debug('Start getting job', { uuid });

    const record = await this.ddb
      .get({
        TableName: this.config.DynamoDb.JobTableName,
        Key: {
          uuid,
        },
      })
      .promise();

    this.log.debug('Completed getting job', { uuid });

    return record.Item;
  }

  async putJob(uuid, { ...data }) {
    this.log.debug('Start persisting job', { uuid, data });

    const params = {
      TableName: this.config.DynamoDb.JobTableName,
      Item: {
        uuid,
        ...data,
        // set ttl for job records, after which they will be deleted
        // https://www.reddit.com/r/aws/comments/e66txh/setting_the_ttl_attribute_in_dynamodb_using_nodejs/
        ttl: Math.floor(new Date() / 1000) + this.config.DynamoDb.jobTTL,
      },
    };

    try {
      await this.ddb.put(params).promise();
      this.log.debug('Completed persisting job', { uuid });
    } catch (ex) {
      this.log.error('Failed persisting job', { uuid, ex: ex.message });
      // TODO throw custom error?
      throw ex;
    }
  }

  async publishJob(job) {
    const params = {
      MessageBody: JSON.stringify(job),
      QueueUrl: this.config.Sqs.Endpoints.JobQueue,
    };

    try {
      this.log.debug('Start publishing job to SQS', { ...params });
      await this.sqsClient.sendMessage(params).promise();
      this.log.debug('Completed publishing job to SQS', { ...params });
    } catch (ex) {
      this.log.debug('Failed publishing job to SQS', { ...params });
      throw ex; // TODO throw something else?
    }
  }

  async findDuplicateJob(MD5OfMessageBody, status) {
    const query = {
      TableName: this.config.DynamoDb.JobTableName,
      IndexName: 'MD5OfMessageBodyIndex',
      KeyConditionExpression: 'MD5OfMessageBody = :MD5OfMessageBody and #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':MD5OfMessageBody': MD5OfMessageBody,
        ':status': status,
      },
    };

    this.log.debug('Start searching for duplicate job', { MD5OfMessageBody, query });
    const record = await this.ddb.query(query).promise();
    const uuids = record.Items.map((r) => r.uuid);
    this.log.debug('Completed searching for duplicate job', { MD5OfMessageBody, uuids });

    if (uuids.length) {
      if (uuids.length > 1) {
        this.log.info('Multiple jobs found with the same MD5OfMessageBody and status', {
          MD5OfMessageBody,
          status,
          uuids,
        });
      }
      return this.getJob(uuids[0]);
    }

    return false;
  }

  async serializeJob(_job) {
    const job = { ..._job };

    const timeoutAt = new Date(job.createdAt);
    timeoutAt.setTime(timeoutAt.getTime() + this.config.Job.Timeout * 1000 * 60);
    if (timeoutAt < new Date()) {
      job.status = STATUS_FAILED;
    }

    const data = {
      uuid: job.uuid,
      status: job.status,
      createdAt: new Date(job.createdAt).toISOString(),
      completedAt: job.completedAt ? new Date(job.completedAt).toISOString() : null,
      timeTaken: job.completedAt ? job.completedAt - job.createdAt : null,
      // MD5OfMessageBody: job.MD5OfMessageBody,
    };

    const { error } = job;

    if (error) {
      data.error = {
        code: error.code,
        description: error.description,
      };

      if (this.config.Debug) {
        data.error.message = error.message;
      }
    }

    return data;
  }
}

module.exports = JobService;
