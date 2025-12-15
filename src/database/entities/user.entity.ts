import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { AgentTask } from './agent-task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  walletAddress?: string;

  @Column({ nullable: true, type: 'text' })
  encryptedPrivateKey?: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  usdcBalance!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Transaction, (tx) => tx.fromUser)
  outgoingTransactions!: Transaction[];

  @OneToMany(() => Transaction, (tx) => tx.toUser)
  incomingTransactions!: Transaction[];

  @OneToMany(() => AgentTask, (task) => task.user)
  agentTasks!: AgentTask[];
}
