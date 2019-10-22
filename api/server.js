const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

const logger = require('./middleware/logger');
const log = require('../utils/logger');
const auth = require('./middleware/auth');

const middleware = [
  express.json(),
  cors(),
  helmet(),
  logger,
];

const server = express();
const endpoint = 'https://lambda-treasure-hunt.herokuapp.com/api/adv';

server.use(middleware);

server.get('/', (req, res) => {
  res.json({
    message: 'API is up and running',
  });
});

// POST init
server.post('/init', auth, async (req, res) => {
  try {
    const { token } = req;
    const route = `${endpoint}/init/`;

    const { data } = await axios.get(route);

    // Save or Update Room Data

    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    res.status(500).json(await log.err(error));
  }
});

// POST move
  server.post('/move', auth, async (req, res) => {
    const route = `${endpoint}/move/`;
    const { body } = req;
    const { data } = await axios.post(route, body);

    // Save or Update Room Data

    res.json({
      status: 'success',
      data
    });
  });
  
// POST getPath
  server.post('/getPath', auth, async (req, res) => {
    res.json({
      message: 'getPath endpoint'
    })
  });

module.exports = server;
