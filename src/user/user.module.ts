import { Module } from "@nestjs/common";
import { UsersController } from "./user.controller";
import { UsersService } from "./user.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatabaseModule } from "src/database/database.module";
import { WalletModule } from "src/wallet/wallet.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports:[
        WalletModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                global: true
            }),
            inject: [ConfigService],
        }), 
        DatabaseModule
    ]
})
export class UserModule {}