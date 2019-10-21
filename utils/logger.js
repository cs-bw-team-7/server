const { createLogger, format, transports } = require('winston');

const hashRef = () => {
  const hash = Math.random().toString(36).substr(2);
  return hash;
};

const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.simple(),
  )
})

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'MM-DD-YYYY HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    consoleTransport,
  ]
});

if (process.env.DB_ENV === 'testing') {
  logger.remove(consoleTransport);
}

const err = async (error, service = 'treasure-api') => {
  const reference = hashRef();
  await logger.log({
    level: 'error',
    reference: reference,
    message: new Error(error),
    service
  });

  return {
    status: 'error',
    message: 'Unknown server error',
    reference,
  };
};

const info = (message, service = 'treasure-api') => {
  logger.log({
    level: 'info',
    message: message,
    service,
  });
};

const warn = (message, service = 'treasure-api') => {
  logger.log({
    level: 'warn',
    message,
    service,
  });
};

const http = ({ body, params, headers, url, method }, service = 'request') => {
  logger.log({
    level: 'info',
    message: `${method} to ${url}`,
    service,
    body,
    params,
    authorization: headers.authorization,
  });
};

const log = {
  err,
  info,
  warn,
  http,
};

module.exports = log;
