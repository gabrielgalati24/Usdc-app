import { IsEthereumAddress, IsString, Matches } from 'class-validator';

export class SendUsdcDto {
  @IsEthereumAddress()
  to!: string;

  @IsString()
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'amount debe ser número decimal con punto.',
  })
  amount!: string;
}
