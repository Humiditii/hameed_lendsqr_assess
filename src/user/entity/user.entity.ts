import { Knex } from "knex";

export const UsersTable = (knex:Knex) => {
    return knex.schema.createTable('users', (table:Knex.TableBuilder) => {
        table.increments('user_id');
        table.string('email').unique().notNullable();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('password').notNullable();
        table.timestamps(true, true);
    });
};
