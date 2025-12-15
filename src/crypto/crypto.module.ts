import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsdcPolygonService } from './usdc-polygon.service';
import { CryptoController } from './crypto.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [UsdcPolygonService],
  controllers: [CryptoController],
  exports: [UsdcPolygonService],
})
export class CryptoModule {}
