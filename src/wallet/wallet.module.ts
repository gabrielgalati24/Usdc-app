import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletGeneratorService } from './wallet-generator.service';
import { DepositMonitorService } from './deposit-monitor.service';
import { User, Transaction } from '../database/entities';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Transaction]),
        ScheduleModule.forRoot(),
        CryptoModule,
    ],
    controllers: [WalletController],
    providers: [WalletService, WalletGeneratorService, DepositMonitorService],
    exports: [WalletService, WalletGeneratorService],
})
export class WalletModule { }
