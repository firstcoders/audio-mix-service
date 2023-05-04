/* eslint-disable jest/expect-expect */
import assert from 'assert';
import Config from '../../src/config';

describe('Config', () => {
  it('configures', async () => {
    process.env.LOG_LEVEL = 'a';
    process.env.SWS_SECRET = 'b';
    process.env.DYNAMODB_ENDPOINT = 'c';
    process.env.DYNAMODB_TABLE_JOB = 'd';
    process.env.DYNAMODB_TABLE_ACCOUNT = 'e';
    process.env.SQS_JOB_QUEUE_URL = 'f';
    process.env.AUDIO_BUCKET_NAME = 'g';
    process.env.S3_ENDPOINT = 'h';
    process.env.UPLOADS_TIMEOUT = 'i';
    process.env.FFMPEG_BIN_PATH = 'j';
    process.env.CORS_ALLOWED_ORIGIN = 'get-it-here.com';

    const config = await Config.load();

    assert.deepStrictEqual(config, {
      Debug: false,
      Logger: { level: 'a' },
      TokenService: { secret: 'b' },
      DynamoDb: {
        endpoint: 'c',
        JobTableName: 'd',
        AccountTableName: 'e',
        jobTTL: 900,
      },
      Job: { PollDelay: 5, PollRate: 5, Timeout: 5 },
      Sqs: { Endpoints: { JobQueue: 'f' } },
      Storage: {
        bucketName: 'g',
        expires: 1000,
        Endpoint: 'h',
        FolderPrefix: 'sound-ws/audio-mix-srv/audio',
      },
      Uploads: { Timeout: 'i' },
      FfmpegBinPath: 'j',
      Metadata: { EncodedBy: 'www.sound.ws' },
      Cors: {
        AllowedOrigins: ['get-it-here.com'],
      },
      AllowedAudioOrigins: '*',
    });
  });
});
