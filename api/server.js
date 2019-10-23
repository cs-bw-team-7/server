const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

// middleware
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const cooldownProtection = require('./middleware/cooldownProtection');
const wiseExplorer = require('./middleware/wiseExplorer');

// Models
const Room = require('./models/room.model');
const Player = require('./models/player.model');

// Utils
const log = require('../utils/logger');
const coordsToArray = require('../utils/coordsToArray');
const exitstoBits = require('../utils/exitsToBits');

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

const roomData = data => {
  const {
    room_id: id,
    title,
    description,
    coordinates,
    terrain,
    elevation,
    exits,
  } = data;

  
  const exitBits = exitstoBits(exits);

  const room = {
    id,
    title,
    description,
    coordinates,
    terrain,
    elevation,
    exits: exitBits,
  };

  return room;
};

// POST init
server.post('/init', auth, cooldownProtection, async (req, res) => {
  try {
    const { token } = req;
    const route = `${endpoint}/init/`;

    const { data } = await axios.get(route);

    const {
      cooldown,
      items,
      room_id,
      coordinates,
    } = data;

    const coordArray = coordsToArray(coordinates);

    // Save or Update Room Data
    const room = roomData(data);
    const roomExists = await Room.get(room.id);

    if (!roomExists) {
      await Room.add(room);
    } else {
      // TODO: This will be required later for items (I think)
      await Room.update(room.id, room);
    }

    const player = {
      token,
      cooldown,
      room_id,
     };
 
     const playerExists = await Player.getBy({ token });
   
     if (playerExists.length <= 0) {
      const now = new Date();
      await Player.add({
        ...player,
        updated_at: now.toUTCString(),
      });
     } else {
       await Player.update(playerExists[0].id, player);
     }

    // TODO: Also send status request for our response

    res.json({
      status: 'success',
      data: {
        ...data,
        coordinates: coordArray,
      },
    });
  } catch (error) {
    res.status(500).json(await log.err(error));
  }
});

// POST move
server.post('/move', auth, cooldownProtection, wiseExplorer, async (req, res) => {
  try {
    const route = `${endpoint}/move/`;
    const { body, token } = req;

    const { data } = await axios.post(route, body);
    const {
      room_id,
      cooldown,
      coordinates,
    } = data;

    // Save or Update Room Data
    const room = roomData(data);
    const exists = await Room.get(room.id);
    
    if (!exists) {
      await Room.add(room);
    } else {
      await Room.update(room.id, room);
    }

    const player = {
      token,
      cooldown,
      room_id,
    };

    const playerExists = await Player.getBy({ token });
    
    if (playerExists.length <= 0) {
      const now = new Date();
      await Player.add({
        ...player,
        updated_at: now.toUTCString(),
      });
    } else {
      await Player.update(playerExists[0].id, player);
    }

    const coordArray = coordsToArray(coordinates);

    res.json({
      status: 'success',
      data: {
        ...data,
        coordinates: coordArray
      }
    });
  } catch (error) {
    console.log(error.response)
    res.status(500).json(await log.err(error));
  }
});
  
// POST getPath
server.post('/getPath', auth, async (req, res) => {
  res.json({
    message: 'getPath endpoint not implemented yet',
  });
});

server.post('/map', auth, async (req, res) => {
  try {
    const rooms = await Room.get();

    res.json({
      status: 'success',
      rooms: rooms.map(room => ({
        ...room,
        coordinates: {
          x: room.coordinates.replace(/\(|\)/g, '').split(',')[0],
          y: room.coordinates.replace(/\(|\)/g, '').split(',')[1]
        }
      }))
    })
  } catch (error) {
    
  }
});

// TEMP GET rooms
server.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.get();
    res.json({
      status: 'success',
      rooms
    });
  } catch (error) {
    res.status(500).json(await log.err(error));
  }
});

server.post('/update', auth, async (req, res) => {
  try {
    const { token, body } = req;
 
    const playerExists = await Player.getBy({ token });

    if (playerExists.length > 0) {
      await Player.update(playerExists[0].id, {...playerExists[0], cooldown: body.cooldown});
    }

    res.json({message: 'success'})

  } catch (error) {
    res.status(500).json(await log.err(error));
  }
})

module.exports = server;
