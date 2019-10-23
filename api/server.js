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

server.locals.Room = (room) => {
  const directions = ["w", "s", "e", "n"]
  const exits = [];
  const coordinates = {
    x: Number(room.coordinates.replace(/\(|\)/g, '').split(',')[0]),
    y: Number(room.coordinates.replace(/\(|\)/g, '').split(',')[1]),
  };

  for (let i = 0; i < 4; i++) {
    const direction = (room.exits >> i) & 1;
    if (direction) {
      exits.push(directions[i]);
    }
  }

  const neighbors = [];

  exits.forEach(exit => {
    const neighbor = {}
    switch (exit) {
      case "n":
        neighbor.direction = "n";
        neighbor.coordinates = {
          x: coordinates.x,
          y: coordinates.y + 1
        }
        break;
      case "e":
        neighbor.direction = "e";
        neighbor.coordinates = {
          x: coordinates.x + 1,
          y: coordinates.y
        }
        break;
      case "s":
        neighbor.direction = "s";
        neighbor.coordinates = {
          x: coordinates.x,
          y: coordinates.y - 1
        }
        break;
      case "w":
        neighbor.direction = "w";
        neighbor.coordinates = {
          x: coordinates.x - 1,
          y: coordinates.y
        }
        break;
      default:
        break;
    }
    neighbors.push(neighbor);
  });

  return {
    ...room,
    exits,
    coordinates,
    neighbors
  }
}

server.locals.Map = (rooms) => {
  // return a map array with rooms at map[y][x]
  // 100 x 100 room
  const map = Array(100);
  for (let i = 0; i < map.length; i++) {
    map[i] = Array(100);
  }

  rooms.forEach(room => {
    map[room.coordinates.y][room.coordinates.x] = room
  });

  return map;
}

// next_room = queue.shift()
// current_room = map[next_room.y][next_room.x]
// current_path = previous_room.path + next_room.direction

// POST getPath
server.post('/getPath', auth, async (req, res) => {
  try {
    const { token, body } = req;
    const playerExists = await Player.getBy({ token });
    let path = [];

    if (playerExists.length <= 0) return res.status(400).json({
      status: 'error',
      message: 'Who are you? Invalid token.',
    });

    const player = playerExists[0];
    // start location
    let location = await Room.get(player['room_id']);
    location = location.coordinates;

    const destination = body.destination ? body.destination : '(60, 60)'; // default to start room

    // Start will be current location
    // Get target coords off body

    const roomData = await Room.get()
    const rooms = [];
    roomData.forEach(room => {
      rooms.push(req.app.locals.Room(room));
    });

    const map = req.app.locals.Map(rooms);

    const destCoords = {
      x: Number(destination.replace(/\(|\)/g, '').split(',')[0]),
      y: Number(destination.replace(/\(|\)/g, '').split(',')[1])
    }
    const destRoom = map[destCoords.y][destCoords.x];
    const destinationId = destRoom.id;

    // Get all rooms
    // loop over each room, storing it as Room
    // Loop over all Rooms doing BFT Traversal

    // TODO: Can update this to a proper queue later if there is time
    const queue = [];  // For now queue.shift and queue.push
    const tracked = {};
    const visited = {};

    queue.push({
      coords: {
        x: Number(location.replace(/\(|\)/g, '').split(',')[0]),
        y: Number(location.replace(/\(|\)/g, '').split(',')[1])
      },
      path: [],
    });

    while (queue.length > 0) {
      const next_room = queue.shift(); // { coords: {x: 60, y: 60}, path: ['n', 's']}
      const current_room = map[next_room.coords.y][next_room.coords.x];
      const current_path = next_room.path;

      if (current_room.id == destinationId) {
        path = current_path;
        break;
      }

      const coordString = `(${current_room.coordinates.x},${current_room.coordinates.y})`;

      if (visited[coordString]) {
        continue;
      }

      // visited['(x,y)'] = {...current_room, current_path}
      visited[coordString] = {...current_room, current_path};

      current_room.neighbors.forEach(neighbor => {
        const coordString = `(${neighbor.coordinates.x},${neighbor.coordinates.y})`;
        if (!tracked[coordString]) {
          queue.push({
            coords: neighbor.coordinates,
            path: [...current_path, neighbor.direction],
          });
          tracked[coordString] = true;
        }
      });
    }

    res.json({
      status: 'success',
      path,
    });
  } catch (error) {
    res.status(500).json(await log.err(error));
  }
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
    res.status(500).json(await log.err(error));
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

server.post('/roomids', auth, async (req, res) => {
  try {
    const { token, body } = req;
    const ids = [];
    const roomPromises = [];

    body.coords.forEach(coordinates => {
      roomPromises.push(Room.getBy({ coordinates }));
    });

    const rooms = await Promise.all(roomPromises);

    rooms.forEach(room => {
      if (room.length === 0) return res.status(404).json({
        status: 'error',
        message: 'Room coords not found.',
      });
      ids.push(room[0].id)
    });

    const player = await Player.getBy({ token });

    if (player.length <= 0) return res.status(400).json({
      status: 'error',
      message: 'Who are you? Invalid token.',
    });

    currentRoom = await Room.get(player[0]['room_id'])
    console.log(player[0])
    console.log(currentRoom)
    
    res.json({
      status: 'success',
      coordinates: {
        x: Number(currentRoom.coordinates.replace(/\(|\)/g, '').split(',')[0]),
        y: Number(currentRoom.coordinates.replace(/\(|\)/g, '').split(',')[1]),
      },
      ids,
    });
  } catch (error) {
    res.status(500).json(await log.err(error));
  }
})

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
