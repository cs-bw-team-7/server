// models
const Player = require('../models/player.model');
const Room = require('../models/room.model');

// utils
const coordsToArray = require('../../utils/coordsToArray');

const wiseExplorer = async (req, res, next) => {
  const { token, body } = req;
  let player = await Player.getBy({ token });

  if (player.length > 0) {
    player = player[0];
    const room = await Room.get(player.room_id);
    const direction = body.direction;
    const coords = coordsToArray(room.coordinates);

    switch (direction) {
      case "n":
        // if direction = n, y +
        coords.y += 1;
        break;
      case "e":
        // if direction = e, x +
        coords.x += 1;
        break;
      case "s":
        // if direction = s, y -
        coords.y -= 1;
        break;
      case "w":
        // if direction = w, x -
        coords.x -= 1;
        break;
      default:
        break;
    }
    
    const coordString = `(${coords.x},${coords.y})`;
    const nextRoom = await Room.getBy({ coordinates: coordString });
    
    if (nextRoom.length > 0) {
      req.body = {
        ...body,
        next_room_id: `${nextRoom[0].id}`,
      };
    }
  }

  next();
}

module.exports = wiseExplorer;
