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
