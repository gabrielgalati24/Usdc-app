import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

export enum AgentTaskType {
    FINANCIAL_ANALYSIS = 'financial_analysis',
    MARKET_DATA = 'market_data',
    RISK_ASSESSMENT = 'risk_assessment',
    PORTFOLIO_REVIEW = 'portfolio_review',
}

export enum AgentTaskStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('agent_tasks')
export class AgentTask {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    @Index()
    userId!: string;

    @ManyToOne(() => User, (user) => user.agentTasks)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ type: 'enum', enum: AgentTaskType })
    taskType!: AgentTaskType;

    @Column({ type: 'enum', enum: AgentTaskStatus, default: AgentTaskStatus.PENDING })
    @Index()
    status!: AgentTaskStatus;

    @Column({ type: 'jsonb', nullable: true })
    input?: Record<string, unknown>;

    @Column({ type: 'jsonb', nullable: true })
    result?: Record<string, unknown>;

    @Column({ type: 'text', nullable: true })
    error?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
