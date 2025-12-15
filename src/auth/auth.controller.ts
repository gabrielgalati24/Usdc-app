import { Controller, Post, Get, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../database/entities';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Registrar nuevo usuario', description: 'Crea cuenta y genera wallet única de Polygon automáticamente' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente con wallet única' })
    @ApiResponse({ status: 409, description: 'Email ya registrado' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ status: 200, description: 'Login exitoso, retorna JWT token y dirección wallet' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado', description: 'Incluye dirección de wallet Polygon única' })
    @ApiResponse({ status: 200, description: 'Datos del perfil con walletAddress' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    getProfile(@CurrentUser() user: User) {
        return this.authService.getProfile(user.id);
    }

    @Get('users/search')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Buscar usuarios por email', description: 'Busca usuarios para transferencias internas' })
    @ApiQuery({ name: 'q', required: true, description: 'Texto a buscar en el email (mínimo 2 caracteres)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Máximo de resultados (default: 10)' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios encontrados' })
    searchUsers(
        @CurrentUser() user: User,
        @Query('q') query: string,
        @Query('limit') limit?: string,
    ) {
        return this.authService.searchUsers(
            query,
            user.id,
            limit ? parseInt(limit, 10) : undefined,
        );
    }
}

