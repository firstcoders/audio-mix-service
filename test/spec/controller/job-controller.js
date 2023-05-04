import assert from 'assert';
import sinon from 'sinon';
import JobController from '../../../src/controller/job-controller';
import Di from '../../../src/service/dependency-injection-service';
import Config from '../../../src/config';

describe('Job Controller', () => {
  let config;
  let di;
  let controller;

  beforeEach(async () => {
    config = await Config.load();
    config.Logger.level = 'error';
    config.TokenService.secret = 'blah';
    di = new Di({ config });
    controller = new JobController({ di, config });
  });

  it('processes a job message and updates the job', async () => {
    const jobService = {
      getJob(uuid) {
        return { uuid };
      },
      putJob: sinon.spy(),
    };

    const messageProcessor = {
      process: sinon.stub().returns({ fileSize: 1000 }),
    };

    di.getJobService = () => jobService;
    di.getMessageProcessor = () => messageProcessor;

    const event = {
      Records: [{ body: JSON.stringify({ uuid: 'anuuid' }) }],
    };

    await controller.consumeJob(event);

    assert(messageProcessor.process.called);

    assert(
      jobService.putJob.calledWith(
        'anuuid',
        sinon.match((v) => {
          return (
            v.status === 'STATUS_SUCCESS' && v.uuid === 'anuuid' && !Number.isNaN(v.completedAt)
          );
        })
      )
    );
  });
});
