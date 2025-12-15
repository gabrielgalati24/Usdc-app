import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
    @ApiProperty({ example: 100.0, description: 'Monto en USDC a depositar (mínimo 0.01)' })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @IsPositive()
    @Min(0.01, { message: 'El monto mínimo de depósito es 0.01 USDC.' })
    amount!: number;
}
