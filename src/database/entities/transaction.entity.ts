import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
    INTERNAL = 'internal',
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

export enum TransactionStatus {
    PENDING = 'pending',
    CONFIRMING = 'confirming',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    fromUserId?: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    toUserId?: string;

    @ManyToOne(() => User, (user) => user.outgoingTransactions, { nullable: true })
    @JoinColumn({ name: 'fromUserId' })
    fromUser?: User;

    @ManyToOne(() => User, (user) => user.incomingTransactions, { nullable: true })
    @JoinColumn({ name: 'toUserId' })
    toUser?: User;

    @Column({ type: 'decimal', precision: 18, scale: 6 })
    amount!: string;

    @Column({ type: 'enum', enum: TransactionType })
    type!: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status!: TransactionStatus;

    @Column({ nullable: true })
    txHash?: string;

    @Column({ nullable: true })
    externalAddress?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    @Index()
    createdAt!: Date;
}
