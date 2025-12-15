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

        return {
            userId: user.id,
            email: user.email,
            usdcBalance: user.usdcBalance,
            walletAddress: user.walletAddress,
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

            if (!fromUser) {
                throw new NotFoundException('Usuario origen no encontrado.');
            }
            if (!toUser) {
                throw new NotFoundException('Usuario destino no encontrado.');
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
            if (balance < dto.amount) {
                throw new BadRequestException('Saldo insuficiente.');
            }

            // Crear la transacción en estado pending
            const tx = queryRunner.manager.create(Transaction, {
                fromUserId: userId,
                externalAddress: dto.toAddress,
                amount: dto.amount.toFixed(6),
                type: TransactionType.WITHDRAW,
                status: TransactionStatus.PENDING,
            });
            await queryRunner.manager.save(tx);

            // Actualizar balance
            user.usdcBalance = (balance - dto.amount).toFixed(6);
            await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();

            // Enviar on-chain (fuera de la transacción DB)
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
                    newBalance: user.usdcBalance,
                };
            } catch (cryptoError) {
                // Revertir balance si falla el envío crypto
                await this.userRepo.update(userId, {
                    usdcBalance: balance.toFixed(6),
                });
                await this.txRepo.update(tx.id, {
                    status: TransactionStatus.FAILED,
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
