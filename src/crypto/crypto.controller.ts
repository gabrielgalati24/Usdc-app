import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsdcPolygonService } from './usdc-polygon.service';
import { SendUsdcDto } from './dto/send-usdc.dto';
import { TransferHistoryDto } from './dto/transfer-history.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly usdc: UsdcPolygonService) { }

  @Public()
  @Get('usdc/address')
  @ApiOperation({ summary: 'Obtener dirección del wallet del servidor' })
  @ApiResponse({ status: 200, description: 'Dirección Ethereum' })
  getFrom() {
    return { from: this.usdc.getFromAddress() };
  }

  @Get('usdc/balance/:address')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener balance USDC de una dirección' })
  @ApiParam({ name: 'address', description: 'Dirección Ethereum/Polygon' })
  @ApiResponse({ status: 200, description: 'Balance USDC' })
  getUsdcBalance(@Param('address') address: string) {
    return this.usdc.getUsdcBalance(address);
  }

  @Get('matic/balance/:address')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener balance MATIC de una dirección' })
  @ApiParam({ name: 'address', description: 'Dirección Ethereum/Polygon' })
  @ApiResponse({ status: 200, description: 'Balance MATIC' })
  getMaticBalance(@Param('address') address: string) {
    return this.usdc.getMaticBalance(address);
  }

  @Get('usdc/history/:address')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener historial de transferencias USDC' })
  @ApiParam({ name: 'address', description: 'Dirección Ethereum/Polygon' })
  @ApiResponse({ status: 200, description: 'Lista de transferencias' })
  getUsdcHistory(
    @Param('address') address: string,
    @Query() query: TransferHistoryDto,
  ) {
    return this.usdc.getRecentTransfers(address, query);
  }

  @Post('usdc/send')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enviar USDC on-chain' })
  @ApiResponse({ status: 201, description: 'Transacción enviada' })
  @ApiResponse({ status: 400, description: 'Error en la transacción' })
  sendUsdc(@Body() dto: SendUsdcDto) {
    return this.usdc.transferUsdc(dto.to, dto.amount);
  }
}
