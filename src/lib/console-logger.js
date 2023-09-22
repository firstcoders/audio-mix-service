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
/* eslint-disable no-console */
class Logger {
  constructor({ level = 'warning' }) {
    this.level = level;
  }

  debug(msg, ...args) {
    if (this.level === 'debug') {
      console.debug(this.createStructuredMessage('DEBUG', msg, ...args));
    }
  }

  info(msg, ...args) {
    if (this.level === 'debug' || this.level === 'info') {
      console.info(this.createStructuredMessage('INFO', msg, ...args));
    }
  }

  warning(msg, ...args) {
    if (this.level === 'debug' || this.level === 'info' || this.level === 'debug') {
      console.error(this.createStructuredMessage('WARNING', msg, ...args));
    }
  }

  error(msg, ...args) {
    console.error(this.createStructuredMessage('ERROR', msg, ...args));
  }

  createStructuredMessage(level, msg, data) {
    const [, xrayId] = process.env._X_AMZN_TRACE_ID
      ? process.env._X_AMZN_TRACE_ID.match(/^Root=(.+);Parent=(.+);/)
      : [undefined, undefined];

    return JSON.stringify({
      xrayId,
      level,
      msg,
      data,
    });
  }
}

module.exports = Logger;
