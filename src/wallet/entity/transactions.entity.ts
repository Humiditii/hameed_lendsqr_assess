import { Knex } from "knex";

export const TransactionsTable = (knex:Knex) => {
    return knex.schema.createTable('transactions', (table:Knex.TableBuilder) => {
        table.increments('transaction_id');
        table.integer('wallet_id').unsigned().references('wallets.wallet_id');
        table.string('type').notNullable();
        table.string('status').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.integer('recipient_wallet_id').unsigned().nullable();
        table.timestamps(true, true);
    });
};