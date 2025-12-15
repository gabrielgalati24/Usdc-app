import { IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentTaskType } from '../../database/entities';

export class CreateTaskDto {
    @ApiProperty({
        enum: AgentTaskType,
        example: 'financial_analysis',
        description: 'Tipo de análisis: financial_analysis, market_data, risk_assessment, portfolio_review',
    })
    @IsEnum(AgentTaskType)
    type!: AgentTaskType;

    @ApiProperty({
        example: { portfolio: ['BTC', 'ETH', 'USDC'], amounts: [0.5, 2, 1000] },
        description: 'Datos para el análisis',
    })
    @IsObject()
    data!: Record<string, unknown>;
}
