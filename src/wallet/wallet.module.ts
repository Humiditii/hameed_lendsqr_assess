import { Module } from "@nestjs/common";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { DatabaseModule } from "src/database/database.module";

@Module({
    controllers:[WalletController],
    providers:[WalletService],
    imports: [DatabaseModule],
    exports:[WalletService]
})

export class WalletModule {}