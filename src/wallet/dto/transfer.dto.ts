import { IsString, IsPositive, IsNumber, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDto {
    @ApiProperty({ example: 'uuid-del-usuario-destino', description: 'ID del usuario destino' })
    @IsString()
    toUserId!: string;

    @ApiProperty({ example: 10.5, description: 'Monto en USDC a transferir' })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @IsPositive()
    @Min(0.000001, { message: 'El monto mínimo es 0.000001 USDC.' })
    amount!: number;

    @ApiPropertyOptional({ example: 'Pago por servicios', description: 'Nota opcional' })
    @IsOptional()
    @IsString()
    notes?: string;
}
