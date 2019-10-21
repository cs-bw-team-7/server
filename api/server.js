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

// GET init
server.get('/init', (req, res) => {
  res.json({
    message: 'init endpoint'
  })
});

// POST move
  server.post('/move', (req, res) => {
    res.json({
      message: 'init endpoint'
    })
  });
  
// POST getPath
  server.post('/getPath', (req, res) => {
    res.json({
      message: 'init endpoint'
    })
  });

module.exports = server;
