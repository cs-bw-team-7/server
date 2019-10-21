const log = require('../../utils/logger');

const logger = (req, res, next) => {
  const { body, headers, params, url, method } = req;

  log.http({
    body,
    headers,
    params,
    url,
    method,
  }, 'requests');

  next();
};

module.exports = logger;
