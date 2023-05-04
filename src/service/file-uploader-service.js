class FileUploaderService {
  constructor({ log, axios, fs }) {
    this.log = log;
    this.axios = axios;
    this.fs = fs;
  }

  async upload(url, filepath) {
    const file = this.fs.createReadStream(filepath);
    const { size } = this.fs.statSync(filepath);
    const params = {
      headers: {
        'Content-Type': 'binary/octet-stream',
        'Content-Length': `${size}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };

    this.log.debug('Start uploading file', { url, filepath, params });
    await this.axios.put(url, file, params);
    this.log.debug('Completed uploading file', { filepath, size });

    return { fileSize: size };
  }
}

module.exports = FileUploaderService;
