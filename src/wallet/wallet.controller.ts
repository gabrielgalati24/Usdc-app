import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TransferDto, WithdrawDto, DepositDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities';

@ApiTags('Wallet')
@ApiBearerAuth('JWT-auth')
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('balance')
    @ApiOperation({ summary: 'Obtener balance de USDC del usuario' })
    @ApiResponse({ status: 200, description: 'Balance actual' })
    getBalance(@CurrentUser() user: User) {
        return this.walletService.getBalance(user.id);
    }

    @Post('deposit')
    @ApiOperation({ summary: 'Depositar USDC (simular recarga)' })
    @ApiResponse({ status: 201, description: 'Depósito exitoso' })
    @ApiResponse({ status: 400, description: 'Monto inválido' })
    deposit(@CurrentUser() user: User, @Body() dto: DepositDto) {
        return this.walletService.deposit(user.id, dto);
    }

    @Post('transfer')
    @ApiOperation({ summary: 'Transferir USDC a otro usuario (interno)' })
    @ApiResponse({ status: 201, description: 'Transferencia exitosa' })
    @ApiResponse({ status: 400, description: 'Saldo insuficiente o usuario inválido' })
    @ApiResponse({ status: 404, description: 'Usuario destino no encontrado' })
    transfer(@CurrentUser() user: User, @Body() dto: TransferDto) {
        return this.walletService.transfer(user.id, dto);
    }

    @Post('withdraw')
    @ApiOperation({ summary: 'Retirar USDC a wallet externa (on-chain)' })
    @ApiResponse({ status: 201, description: 'Retiro procesado' })
    @ApiResponse({ status: 400, description: 'Saldo insuficiente o dirección inválida' })
    withdraw(@CurrentUser() user: User, @Body() dto: WithdrawDto) {
        return this.walletService.withdraw(user.id, dto);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Obtener historial de transacciones' })
    @ApiQuery({ name: 'limit', required: false, description: 'Máximo de transacciones a retornar' })
    @ApiResponse({ status: 200, description: 'Lista de transacciones' })
    getTransactions(
        @CurrentUser() user: User,
        @Query('limit') limit?: string,
    ) {
        return this.walletService.getTransactions(user.id, limit ? parseInt(limit, 10) : undefined);
    }
}
