const db = require('./db.config');

module.exports = table => ({
  add: add(table),
  get: get(table),
  getBy: getBy(table),
  update: update(table),
  remove: remove(table),
  cb,
});

const get = table => (id=false) => {
  if (id === false) return db(table);
  return db(table).where({ id }).first();
}

const getBy = table => filter => {
  return db(table).where(filter);
}

const cb = (method) => {
  return method(db);
}

const add = table => (data) => {
  return db(table)
    .insert(data)
    .then(ids => {
      return get(table)(ids[0]);
    });
}

const update = table => (id, data) => {
  return db(table)
    .where({ id })
    .update(data)
    .then(() => {
      return get(table)(id);
    });
}

const remove = table => async (id) => {
  const record = await get(table)(id);
  await db(table)
    .where({ id })
    .del();
  return record;
};
