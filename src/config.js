module.exports = {
  /**
   * Gets config, loaded asynchronously
   * NOTE currently async isn't needed yet, but in the future we may  want
   * to load stuff from the secretsmanager
   *
   * @returns {Object}
   */
  async load(event) {
    let context = {};

    // Decoded token is contained in the requestContext (but not for an authorizer lambda)
    try {
      context = event.requestContext.authorizer || {};
    } catch (e) {
      // do nothing
    }

    return {
      Debug: context.SWS_DEBUG || process.env.NODE_ENV === 'development',
      Logger: {
        level: process.env.LOG_LEVEL,
      },
      TokenService: {
        secret: process.env.SWS_SECRET,
      },
      DynamoDb: {
        endpoint: process.env.DYNAMODB_ENDPOINT,
        JobTableName: process.env.DYNAMODB_TABLE_JOB,
        AccountTableName: process.env.DYNAMODB_TABLE_ACCOUNT,
        jobTTL: 60 * 15, // keep job documents for 15 minutes
      },
      Job: {
        PollDelay: 5,
        PollRate: 5,
        Timeout: 5,
      },
      Sqs: {
        Endpoints: {
          JobQueue:
            process.env.NODE_ENV !== 'development'
              ? process.env.SQS_JOB_QUEUE_URL
              : `${process.env.SQS_DEV_ENDPOINT}/queue/dev-soundws-amix-JobQueue`,
        },
      },
      Storage: {
        bucketName: process.env.DEV_AUDIO_BUCKET_NAME || process.env.AUDIO_BUCKET_NAME,
        expires: 1000, // signed url expiration
        Endpoint: process.env.S3_ENDPOINT,
        FolderPrefix: 'sound-ws/audio-mix-srv/audio',
      },
      Uploads: {
        Timeout: process.env.UPLOADS_TIMEOUT || 0,
      },
      FfmpegBinPath: process.env.FFMPEG_BIN_PATH,
      Metadata: {
        EncodedBy: 'www.sound.ws',
      },
      Cors: {
        AllowedOrigins: (process.env.CORS_ALLOWED_ORIGIN || '').split(',').map((x) => x.trim()),
      },
      // Other services allow setting this via env, but that functionality will probably be removed in
      // the future in favor of only allowing setting this value via claims in the bearer token.
      AllowedAudioOrigins: '*',
    };
  },
};
