const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./middleware/logger');

const middleware = [
  express.json(),
  cors(),
  helmet(),
  logger,
];

const server = express();
server.use(middleware);

server.get('/', (req, res) => {
  res.json({
    message: 'API is up and running',
  });
});

module.exports = server;
