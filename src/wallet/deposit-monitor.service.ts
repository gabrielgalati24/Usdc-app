import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User, Transaction, TransactionType, TransactionStatus } from '../database/entities';
import { UsdcPolygonService } from '../crypto/usdc-polygon.service';

@Injectable()
export class DepositMonitorService {
    private readonly logger = new Logger(DepositMonitorService.name);
    private lastCheckedBlock: number = 0;

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Transaction)
        private readonly txRepo: Repository<Transaction>,
        private readonly usdcService: UsdcPolygonService,
    ) { }

    /**
     * Revisa depósitos cada 5 minutos
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async checkDeposits() {
        this.logger.log('🔍 Iniciando monitoreo de depósitos...');

        try {
            // Obtener todos los usuarios con wallet
            const users = await this.userRepo.find({
                where: { walletAddress: LessThan('null') as any },
                select: ['id', 'email', 'walletAddress', 'usdcBalance'],
            });

            this.logger.log(`📊 Revisando ${users.length} wallets...`);

            for (const user of users) {
                if (!user.walletAddress) continue;

                try {
                    await this.checkUserDeposits(user);
                } catch (error) {
                    this.logger.error(
                        `Error revisando wallet ${user.walletAddress}:`,
                        error,
                    );
                }
            }

            this.logger.log('✅ Monitoreo completado');
        } catch (error) {
            this.logger.error('Error en monitoreo de depósitos:', error);
        }
    }

    private async checkUserDeposits(user: User) {
        const address = user.walletAddress!;

        // Obtener transferencias recientes
        const transfers = await this.usdcService.getRecentTransfers(address, {
            direction: 'incoming',
            blocks: 300, // ~10 minutos en Polygon (reducido para evitar rate limits)
            minConfirmations: 3,
        });

        for (const transfer of transfers) {
            // Verificar si ya procesamos esta transacción
            const existing = await this.txRepo.findOne({
                where: { txHash: transfer.hash },
            });

            if (existing) {
                continue; // Ya procesada
            }

            // Crear transacción y acreditar
            await this.creditDeposit(user, transfer);
        }
    }

    private async creditDeposit(user: User, transfer: any) {
        const amount = parseFloat(transfer.amount);

        this.logger.log(
            `💰 Nuevo depósito detectado: ${amount} USDC para ${user.email}`,
        );

        // Actualizar balance
        const currentBalance = parseFloat(user.usdcBalance);
        const newBalance = currentBalance + amount;

        await this.userRepo.update(user.id, {
            usdcBalance: newBalance.toFixed(6),
        });

        // Registrar transacción
        const tx = this.txRepo.create({
            toUserId: user.id,
            amount: amount.toFixed(6),
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.COMPLETED,
            txHash: transfer.hash,
            externalAddress: transfer.from,
            notes: `Depósito automático desde blockchain (bloque ${transfer.blockNumber})`,
        });

        await this.txRepo.save(tx);

        this.logger.log(
            `✅ Depósito acreditado: ${amount} USDC (nuevo balance: ${newBalance.toFixed(6)})`,
        );
    }
}
