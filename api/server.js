const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./middleware/logger');
const auth = require('./middleware/auth');

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

// POST init
server.post('/init', auth, async (req, res) => {
  res.json({
    message: 'init endpoint'
  })
});

// POST move
  server.post('/move', auth, async (req, res) => {
    res.json({
      message: 'move endpoint'
    })
  });
  
// POST getPath
  server.post('/getPath', auth, async (req, res) => {
    res.json({
      message: 'getPath endpoint'
    })
  });

module.exports = server;
