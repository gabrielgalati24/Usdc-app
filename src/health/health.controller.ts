import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Estado general del servicio' })
    @ApiResponse({ status: 200, description: 'Servicio operativo' })
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    @Public()
    @Get('db')
    @ApiOperation({ summary: 'Estado de la conexión a base de datos' })
    @ApiResponse({ status: 200, description: 'Conexión DB status' })
    async getDatabaseHealth() {
        try {
            await this.dataSource.query('SELECT 1');
            return {
                status: 'ok',
                database: 'connected',
            };
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
