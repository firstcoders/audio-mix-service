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
class StemMixService {
  constructor({ log, spawnSync, config }) {
    this.log = log;
    this.spawnSync = spawnSync;
    this.config = config;
  }

  mixSync(message, saveAs) {
    this.log.debug('Start mixing stems', { message });

    const sources = message.sources.filter((source) => source.volume > 0);

    /*
      ignore_length is needed since ffmpeg was segfaulting when corrupt packages at the end occured:
      ffmpeg -v error \
      -i "https://stems-example-audio.s3.eu-west-2.amazonaws.com/default/drums/wav/106+DRUMS+B_01.5.wav" \
      -i "https://stems-example-audio.s3.eu-west-2.amazonaws.com/default/drums/wav/106+DRUMS+A_02.5.wav" \
      -f null -
      This goes away with the -ignore_length flag
    */
    // eslint-disable-next-line prefer-spread
    const inputs = [].concat.apply(
      [],
      sources.map((source) =>
        // return ['-ignore_length', '1', '-i', source.src];
        // ignore_length causes buzz issue. A newer ffmpeg build git master: built on 20210225 https://johnvansickle.com/ffmpeg/ saved the day
        ['-i', source.src],
      ),
    );

    const weights = sources.map((source) => source.volume).join(' ');

    // https://superuser.com/questions/687660/ffmpeg-amix-dropping-audio-levels
    let options = inputs.concat([
      '-filter_complex',
      `amix=inputs=${sources.length}:duration=longest:weights=${weights}:normalize=false`,
    ]);

    // Embed metadata
    // E.g. of metadata embedding ffmpeg -i input.wav -metadata title="mytitle" output.wav
    const { metadata = [] } = message;
    metadata.push({ key: 'encoded_by', value: 'firstcoders-audio-mix-service' });

    // https://github.com/nodejs/node/issues/34840
    const quote = (s) => `'${s.replace(/'/g, `'"'`)}'`;

    options = [].concat.apply(
      options,
      metadata.map(({ key, value }) => ['-metadata', quote(`${key}=${value}`)]),
    );

    options = options.concat(['-c:a', 'pcm_s24le', '-ac', '2', '-ar', '48000'], saveAs);

    this.log.debug('Running ffmpeg with options', { options });

    const result = this.spawnSync(this.config.FfmpegBinPath, options, {
      // https://stackoverflow.com/questions/35689080/how-to-read-child-process-spawnsync-stdout-with-stdio-option-inherit
      // stdio: "inherit"
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    if (result.error) {
      this.log.error('Could not spawn ffmpeg', { error: result.error.message });
      throw new Error('Could not spawn ffmpeg');
    }

    if (result.status > 0) {
      this.log.error('Failed mixing stems', {
        sources,
        status: result.status,
        output: result.output,
        error: result.error,
      });
      throw new Error(`The stems could not be mixed`);
    }

    this.log.debug('Completed mixing stems', {
      sources,
      saveAs,
      output: result.output,
      stdout: result.stdout,
      error: result.error,
      stderr: result.stderr,
    });
  }
}

module.exports = StemMixService;
