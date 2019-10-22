const db = require('../../data/models')('player');

const update = (id, data) => {
  const now = new Date();
  return db.update(id, {
    ...data,
    updated_at: now.toUTCString(),
  });
}


module.exports = {
  ...db,
  update,
};
