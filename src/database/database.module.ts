import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Transaction, AgentTask } from './entities';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get<string>('DATABASE_URL'),
                entities: [User, Transaction, AgentTask],
                synchronize: config.get<string>('NODE_ENV') !== 'production',
                logging: config.get<string>('NODE_ENV') === 'development',
                ssl: config.get<string>('NODE_ENV') === 'production' ? {
                    rejectUnauthorized: false,
                } : false,
            }),
        }),
        TypeOrmModule.forFeature([User, Transaction, AgentTask]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
