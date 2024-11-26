import { Knex } from "knex";

export const WalletsTable = (knex:Knex) => {
    return knex.schema.createTable('wallets', (table:Knex.TableBuilder) => {
        table.increments('wallet_id');
        table.integer('user_id').unsigned().references('users.user_id');
        table.decimal('balance', 10, 2).defaultTo(0);
        table.timestamps(true, true);
    });
};
