import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Transaction, TransactionType, TransactionStatus } from '../database/entities';
import { UsdcPolygonService } from '../crypto/usdc-polygon.service';
import { TransferDto, WithdrawDto, DepositDto } from './dto';

@Injectable()
export class WalletService {
    private readonly GAS_RESERVE_USDC = 0.01;
    private readonly MIN_WITHDRAW_AMOUNT = 0.01;

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Transaction)
        private readonly txRepo: Repository<Transaction>,
        private readonly dataSource: DataSource,
        private readonly usdcService: UsdcPolygonService,
    ) { }

    async getBalance(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        const totalBalance = parseFloat(user.usdcBalance);
        const availableBalance = Math.max(0, totalBalance - this.GAS_RESERVE_USDC);

        return {
            userId: user.id,
            email: user.email,
            usdcBalance: user.usdcBalance,
            totalBalance: totalBalance.toFixed(6),
            availableBalance: availableBalance.toFixed(6),
            gasReserve: this.GAS_RESERVE_USDC.toFixed(6),
            walletAddress: user.walletAddress,
        };
    }

    /**
     * Estima las comisiones para un retiro
     */
    async estimateWithdrawFee(userId: string, amount: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        const balance = parseFloat(user.usdcBalance);
        const gasFee = this.GAS_RESERVE_USDC;
        const totalRequired = amount + gasFee;
        const maxWithdrawable = Math.max(0, balance - gasFee);
        const isValid = balance >= totalRequired && amount >= this.MIN_WITHDRAW_AMOUNT;

        return {
            amount: amount.toFixed(6),
            gasFee: gasFee.toFixed(6),
            totalRequired: totalRequired.toFixed(6),
            currentBalance: balance.toFixed(6),
            maxWithdrawable: maxWithdrawable.toFixed(6),
            remainingAfterWithdraw: isValid ? (balance - totalRequired).toFixed(6) : '0.000000',
            isValid,
            minAmount: this.MIN_WITHDRAW_AMOUNT.toFixed(6),
            message: !isValid
                ? balance < totalRequired
                    ? `Saldo insuficiente. Necesitas ${totalRequired.toFixed(6)} USDC (${amount.toFixed(6)} + ${gasFee.toFixed(6)} de gas)`
                    : `El monto mínimo de retiro es ${this.MIN_WITHDRAW_AMOUNT} USDC`
                : null,
        };
    }

    async deposit(userId: string, dto: DepositDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager.findOne(User, {
                where: { id: userId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!user) {
                throw new NotFoundException('Usuario no encontrado.');
            }

            const newBalance = parseFloat(user.usdcBalance) + dto.amount;
            user.usdcBalance = newBalance.toFixed(6);
            await queryRunner.manager.save(user);

            const tx = queryRunner.manager.create(Transaction, {
                toUserId: userId,
                amount: dto.amount.toFixed(6),
                type: TransactionType.DEPOSIT,
                status: TransactionStatus.COMPLETED,
                notes: 'Depósito manual',
            });
            await queryRunner.manager.save(tx);

            await queryRunner.commitTransaction();

            return {
                success: true,
                transactionId: tx.id,
                newBalance: user.usdcBalance,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async transfer(fromUserId: string, dto: TransferDto) {
        if (fromUserId === dto.toUserId) {
            throw new BadRequestException('No puedes transferir a ti mismo.');
        }

        const fromUserCheck = await this.userRepo.findOne({ where: { id: fromUserId } });
        if (!fromUserCheck) {
            throw new NotFoundException('Usuario origen no encontrado.');
        }

        const toUserCheck = await this.userRepo.findOne({ where: { id: dto.toUserId } });
        if (!toUserCheck) {
            throw new NotFoundException('Usuario destino no encontrado.');
        }

        const currentBalance = parseFloat(fromUserCheck.usdcBalance);
        if (currentBalance < dto.amount) {
            throw new BadRequestException(
                `Saldo insuficiente. Tienes ${currentBalance.toFixed(6)} USDC pero intentas enviar ${dto.amount.toFixed(6)} USDC.`
            );
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const [fromUser, toUser] = await Promise.all([
                queryRunner.manager.findOne(User, {
                    where: { id: fromUserId },
                    lock: { mode: 'pessimistic_write' },
                }),
                queryRunner.manager.findOne(User, {
                    where: { id: dto.toUserId },
                    lock: { mode: 'pessimistic_write' },
                }),
            ]);

            if (!fromUser || !toUser) {
                throw new NotFoundException('Usuario no encontrado.');
            }

            const fromBalance = parseFloat(fromUser.usdcBalance);
            if (fromBalance < dto.amount) {
                throw new BadRequestException('Saldo insuficiente.');
            }

            fromUser.usdcBalance = (fromBalance - dto.amount).toFixed(6);
            toUser.usdcBalance = (parseFloat(toUser.usdcBalance) + dto.amount).toFixed(6);

            await queryRunner.manager.save([fromUser, toUser]);

            const tx = queryRunner.manager.create(Transaction, {
                fromUserId,
                toUserId: dto.toUserId,
                amount: dto.amount.toFixed(6),
                type: TransactionType.INTERNAL,
                status: TransactionStatus.COMPLETED,
                notes: dto.notes,
            });
            await queryRunner.manager.save(tx);

            await queryRunner.commitTransaction();

            return {
                success: true,
                transactionId: tx.id,
                fromBalance: fromUser.usdcBalance,
                toUser: {
                    id: toUser.id,
                    email: toUser.email,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async withdraw(userId: string, dto: WithdrawDto) {
        // ==========================================
        // PASO 1: Validaciones ANTES de la transacción
        // ==========================================

        // Validar monto mínimo
        if (dto.amount < this.MIN_WITHDRAW_AMOUNT) {
            throw new BadRequestException(
                `El monto mínimo de retiro es ${this.MIN_WITHDRAW_AMOUNT} USDC.`
            );
        }

        // Obtener usuario y validar saldo
        const userCheck = await this.userRepo.findOne({ where: { id: userId } });
        if (!userCheck) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        const currentBalance = parseFloat(userCheck.usdcBalance);
        const totalRequired = dto.amount + this.GAS_RESERVE_USDC;

        if (currentBalance < totalRequired) {
            throw new BadRequestException(
                `Saldo insuficiente. Tienes ${currentBalance.toFixed(6)} USDC pero necesitas ${totalRequired.toFixed(6)} USDC (${dto.amount.toFixed(6)} + ${this.GAS_RESERVE_USDC.toFixed(6)} de comisión de gas).`
            );
        }

        // Validar dirección de wallet
        if (!dto.toAddress || !dto.toAddress.startsWith('0x') || dto.toAddress.length !== 42) {
            throw new BadRequestException('Dirección de wallet inválida.');
        }

        // ==========================================
        // PASO 2: Iniciar transacción DB (solo si pasó validaciones)
        // ==========================================
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager.findOne(User, {
                where: { id: userId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!user) {
                throw new NotFoundException('Usuario no encontrado.');
            }

            const balance = parseFloat(user.usdcBalance);
            if (balance < totalRequired) {
                throw new BadRequestException('Saldo insuficiente.');
            }

            const newBalance = balance - totalRequired;
            user.usdcBalance = newBalance.toFixed(6);
            await queryRunner.manager.save(user);

            // Crear la transacción en estado pending
            const tx = queryRunner.manager.create(Transaction, {
                fromUserId: userId,
                externalAddress: dto.toAddress,
                amount: dto.amount.toFixed(6),
                type: TransactionType.WITHDRAW,
                status: TransactionStatus.PENDING,
                notes: `Retiro on-chain. Gas: ${this.GAS_RESERVE_USDC} USDC`,
            });
            await queryRunner.manager.save(tx);

            await queryRunner.commitTransaction();

            // ==========================================
            // ==========================================
            try {
                const result = await this.usdcService.transferUsdc(
                    dto.toAddress,
                    dto.amount.toString(),
                );

                await this.txRepo.update(tx.id, {
                    status: TransactionStatus.COMPLETED,
                    txHash: result.hash,
                });

                return {
                    success: true,
                    transactionId: tx.id,
                    txHash: result.hash,
                    amount: dto.amount.toFixed(6),
                    gasFee: this.GAS_RESERVE_USDC.toFixed(6),
                    newBalance: newBalance.toFixed(6),
                };
            } catch (cryptoError) {
                // Revertir balance si falla el envío crypto
                await this.userRepo.update(userId, {
                    usdcBalance: balance.toFixed(6),
                });
                await this.txRepo.update(tx.id, {
                    status: TransactionStatus.FAILED,
                    notes: `Error: ${cryptoError instanceof Error ? cryptoError.message : 'Unknown error'}`,
                });
                throw cryptoError;
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getTransactions(userId: string, limit = 20) {
        const transactions = await this.txRepo.find({
            where: [{ fromUserId: userId }, { toUserId: userId }],
            order: { createdAt: 'DESC' },
            take: Math.min(limit, 50),
            relations: ['fromUser', 'toUser'],
        });

        return transactions.map((tx) => ({
            id: tx.id,
            type: tx.type,
            status: tx.status,
            amount: tx.amount,
            from: tx.fromUser ? { id: tx.fromUser.id, email: tx.fromUser.email } : null,
            to: tx.toUser ? { id: tx.toUser.id, email: tx.toUser.email } : null,
            externalAddress: tx.externalAddress,
            txHash: tx.txHash,
            notes: tx.notes,
            createdAt: tx.createdAt,
        }));
    }
}
