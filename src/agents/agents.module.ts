import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MasterAgentService } from './master-agent.service';
import { AgentsController } from './agents.controller';
import { AgentWorkerProcessor, AGENT_QUEUE } from './agent-worker.processor';
import { AgentTask, User, Transaction } from '../database/entities';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AgentTask, User, Transaction]),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const redisUrl = config.get<string>('REDIS_URL') || 'redis://localhost:6379';
                const useSSL = redisUrl.startsWith('rediss://');

                if (useSSL) {
                    // Parse the URL and add TLS configuration
                    return {
                        redis: {
                            url: redisUrl,
                            tls: {
                                rejectUnauthorized: false,
                            },
                        },
                    };
                }

                return {
                    redis: redisUrl,
                };
            },
        }),
        BullModule.registerQueue({
            name: AGENT_QUEUE,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        }),
        WalletModule,
    ],
    controllers: [AgentsController],
    providers: [MasterAgentService, AgentWorkerProcessor],
    exports: [MasterAgentService],
})
export class AgentsModule { }
