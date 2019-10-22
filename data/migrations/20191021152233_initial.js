/*

 - Room
   - Title
   - Elevation
   - Terrain
   - Coordinates
   - Description
 - Treasure
   - Name

*/

exports.up = knex => {
  return knex.schema
    .createTable('room', table => {
      table.integer('id')
        .unique()
        .notNullable();
      table.string('title');
      table.string('description');
      table.integer('elevation');
      table.string('terrain');
      table.string('coordinates');
      table.integer('exits');
      table.timestamps(true, true);
    })
    .createTable('treasure', table => {
      table.increments();
      table.string('name')
      .unique()
      .notNullable();
      table.timestamps(true, true);
    })
    .createTable('room_treasure', table => {
      table.integer('room_id')
        .notNullable()
        .references('id')
        .inTable('room')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      table.integer('treasure_id')
        .notNullable()
        .references('id')
        .inTable('treasure')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    });
};

exports.down = knex => {
  return knex.schema
    .dropTableIfExists('room_treasure')
    .dropTableIfExists('treasure')
    .dropTableIfExists('room')
};
