// Cache the log mechanism.
let logMechanism;

const ConsoleLogger = require('../lib/console-logger');

class LogFactory {
  /**
   * Construct or return an already instantiated winston logger.
   *
   * @param config
   * @returns {*}
   */
  static getLogMechanism({ config }) {
    if (!logMechanism) {
      logMechanism = new ConsoleLogger({ ...config });
    }

    return logMechanism;
  }
}

module.exports = LogFactory;
