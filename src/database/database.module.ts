import { Module } from '@nestjs/common';
import Knex from 'knex';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'KNEX_CONNECTION',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return Knex({
                    client: 'mysql2',
                    connection: configService.get<string>('DATABASE_URL')
                });
            },
        },
    ],
    exports: ['KNEX_CONNECTION'],
})
export class DatabaseModule { } 
