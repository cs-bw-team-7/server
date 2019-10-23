
exports.up = function(knex) {
  return knex.schema.alterTable('room', table => {
    table.text('title').alter();
    table.text('description').alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('room', table => {
    table.string('title').alter();
    // TODO: This is actually going to fail on postgres if any text is over 255
    table.string('description').alter();
  });
};
