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
const fs = require('fs');

class S3StorageService {
  constructor({ di, bucketName, expires }) {
    this.di = di;
    this.bucketName = bucketName;
    this.expires = expires;
  }

  createPutObjectUrl(key, contentType = 'binary/octet-stream') {
    return this.di.getS3Client().getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Expires: this.expires,
      Key: key,
      ContentType: contentType,
    });
  }

  createGetObjectUrl(key, filename = 'my-mixed-audio.wav') {
    return this.di.getS3Client().getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Expires: this.expires,
      Key: key,
      ResponseContentDisposition: `attachment; filename ="${filename}"`,
    });
  }

  async putFile(key, filepath) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    this.di.getLog().debug('Start uploading file to S3', { params, filepath });

    const stream = fs.createReadStream(filepath);

    await new Promise((done, fail) => {
      stream.on('error', (err) => {
        if (err) fail(err);
      });

      this.di
        .getS3Client()
        .putObject({
          ...params,
          Body: stream,
          ContentType: 'binary/octet-stream',
        })
        .promise()
        .then(done, fail);
    });

    this.di.getLog().debug('Completed uploading file to S3', { params, filepath });
  }
}

module.exports = S3StorageService;
