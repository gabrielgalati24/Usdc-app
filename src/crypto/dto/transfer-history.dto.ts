import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class TransferHistoryDto {
  @IsOptional()
  @IsIn(['incoming', 'outgoing', 'all'])
  direction?: 'incoming' | 'outgoing' | 'all';

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @IsPositive()
  @Max(5000)
  blocks?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  fromBlock?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @IsPositive()
  @Max(50)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  minConfirmations?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  maxConfirmations?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @IsPositive()
  confirmationThreshold?: number;
}
