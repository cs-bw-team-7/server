/*

{
  "name": "player287",
  "cooldown": 1.0,
  "encumbrance": 0,
  "strength": 10,
  "speed": 10,
  "gold": 0,
  "inventory": [],
  "status": [],
  "has_mined": false,
  "errors": [],
  "messages": []
}

*/

exports.up = knex => {
  return knex.schema
    .createTable('player', table => {
      table.increments();
      table.string('token')
        .unique()
        .notNullable();
      // table.string('name');
      table.integer('cooldown');
      // table.integer('encumbrance');
      // table.integer('strength');
      // table.integer('speed');
      // table.integer('gold');
      table.timestamps(true, true);
      table.integer('room_id')
        .references('id')
        .inTable('room')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE')
    });
};

exports.down = knex => {
  return knex.schema
    .dropTableIfExists('player')
};
