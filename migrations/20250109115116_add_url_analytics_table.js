/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('url_analytics', (table) => {
    table.increments('id').primary();
    table
      .integer('url_id')
      .unsigned()
      .references('id')
      .inTable('urls')
      .onDelete('CASCADE');
    table.timestamp('clicked_at').defaultTo(knex.fn.now());
    table.specificType('ip_address', 'inet').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('url_analytics');
};
