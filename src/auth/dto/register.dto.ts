import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Email del usuario' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'MiPassword123', description: 'Contraseña (mínimo 8 caracteres)' })
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    password!: string;
}
