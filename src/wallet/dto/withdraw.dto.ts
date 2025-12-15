import { IsString, IsPositive, IsNumber, Min, IsEthereumAddress } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
    @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f...', description: 'Dirección Ethereum/Polygon destino' })
    @IsEthereumAddress()
    toAddress!: string;

    @ApiProperty({ example: 50.0, description: 'Monto en USDC a retirar (mínimo 0.01)' })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @IsPositive()
    @Min(0.01, { message: 'El monto mínimo de retiro es 0.01 USDC.' })
    amount!: number;
}
