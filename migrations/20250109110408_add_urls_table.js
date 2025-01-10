/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('urls', (table) => {
    table.increments('id').primary();
    table.text('original_url').notNullable();
    table.string('short_url', 20).unique().notNullable(); //
    table.string('alias', 20).unique(); // user's alias
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at');
    table.integer('click_count').defaultTo(0); // amount of clicks
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('urls');
};
