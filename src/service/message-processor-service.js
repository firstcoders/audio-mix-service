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
