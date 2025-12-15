import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { AgentsModule } from './agents/agents.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    CryptoModule,
    WalletModule,
    AgentsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }

