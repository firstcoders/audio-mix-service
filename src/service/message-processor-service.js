const { unlinkSync, statSync } = require('fs');

class MessageProcessor {
  constructor({ log, stemMixer, s3StorageService }) {
    this.log = log;
    this.stemMixer = stemMixer;
    this.s3StorageService = s3StorageService;
  }

  async process(message) {
    this.log.debug('Start processing message', { message });

    const body = JSON.parse(message.body);
    // TODO validate?

    // TODO wav/flac?
    const tmpFilename = `/tmp/${body.uuid}.wav`;

    try {
      this.stemMixer.mixSync(body, tmpFilename);
    } catch (ex) {
      throw new Error(`Could not process the audio due to ${ex.message}`);
    }

    const { size: fileSize } = statSync(tmpFilename);

    try {
      await this.s3StorageService.putFile(body.key, tmpFilename);
      this.log.debug('Completed processing message', { message, fileSize });
    } catch (ex) {
      this.log.error(`Failed uploading ${tmpFilename} to ${body.key}`, { ex: ex.message });
      throw ex;
    }

    // cleanup
    unlinkSync(tmpFilename);

    return { fileSize };
  }
}

module.exports = MessageProcessor;
