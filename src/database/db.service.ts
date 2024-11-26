import { Knex } from 'knex';

export const up = async (knex: Knex) => {
    await knex.schema.createTable('users', (table: Knex.TableBuilder) => {
        table.increments('user_id');
        table.string('email').unique().notNullable();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('password').notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable('wallets', (table: Knex.TableBuilder) => {
        table.increments('wallet_id');
        table.integer('user_id').unsigned().references('users.user_id');
        table.decimal('balance', 10, 2).defaultTo(0);
        table.timestamps(true, true);
    });

    await knex.schema.createTable('transactions', (table: Knex.TableBuilder) => {
        table.increments('transaction_id');
        table.integer('wallet_id').unsigned().references('wallets.wallet_id');
        table.string('type').notNullable();
        table.string('status').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.integer('recipient_wallet_id').unsigned().nullable();
        table.timestamps(true, true);
    });
};

export const down = async (knex: Knex) => {
    await knex.schema.dropTableIfExists('transactions');
    await knex.schema.dropTableIfExists('wallets');
    await knex.schema.dropTableIfExists('users');
};
