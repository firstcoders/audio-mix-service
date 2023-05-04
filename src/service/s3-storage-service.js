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
