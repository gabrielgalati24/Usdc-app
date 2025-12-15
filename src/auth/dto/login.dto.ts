import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Email del usuario' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'MiPassword123', description: 'Contraseña' })
    @IsString()
    password!: string;
}
