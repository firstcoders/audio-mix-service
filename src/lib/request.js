// lamdas get headers with inconsistent casing.
exports.getHeader = (key, event = {}) => {
  if (!event.headers) return undefined;

  const keys = Object.keys(event.headers);

  for (let index = 0; index < keys.length; index += 1) {
    if (key.toLowerCase() === keys[index].toLowerCase()) {
      return event.headers[keys[index]];
    }
  }

  return undefined;
};
