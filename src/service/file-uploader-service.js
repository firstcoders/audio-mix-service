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
