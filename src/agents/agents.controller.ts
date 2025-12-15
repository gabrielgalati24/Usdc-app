import { Controller, Post, Get, Body, Param, Query, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Observable } from 'rxjs';
import { MasterAgentService } from './master-agent.service';
import { CreateTaskDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities';
import { AGENT_QUEUE, AgentJobData } from './agent-worker.processor';

@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@Controller('agents')
export class AgentsController {
    constructor(
        private readonly masterAgent: MasterAgentService,
        @InjectQueue(AGENT_QUEUE)
        private readonly agentQueue: Queue<AgentJobData>,
    ) { }

    @Post('analyze')
    @ApiOperation({ summary: 'Crear tarea de análisis (background)' })
    @ApiResponse({ status: 201, description: 'Tarea encolada para procesamiento' })
    async createAnalysis(
        @CurrentUser() user: User,
        @Body() dto: CreateTaskDto,
    ) {
        const task = await this.masterAgent.createTask(user.id, {
            type: dto.type,
            data: dto.data,
        });

        await this.agentQueue.add({ taskId: task.id }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });

        return {
            taskId: task.id,
            status: 'queued',
            message: 'Tarea encolada para procesamiento en background',
        };
    }

    @Post('analyze/sync')
    @ApiOperation({ summary: 'Crear tarea de análisis (síncrono)' })
    @ApiResponse({ status: 201, description: 'Resultado del análisis' })
    async createAnalysisSync(
        @CurrentUser() user: User,
        @Body() dto: CreateTaskDto,
    ) {
        const task = await this.masterAgent.createTask(user.id, {
            type: dto.type,
            data: dto.data,
        });

        const result = await this.masterAgent.processTask(task.id);
        return result;
    }

    @Get('tasks/:taskId')
    @ApiOperation({ summary: 'Obtener estado de una tarea' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiResponse({ status: 200, description: 'Estado de la tarea' })
    @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
    async getTaskStatus(@Param('taskId') taskId: string) {
        const status = await this.masterAgent.getTaskStatus(taskId);
        if (!status) {
            return { error: 'Tarea no encontrada' };
        }
        return status;
    }

    @Get('tasks')
    @ApiOperation({ summary: 'Listar tareas del usuario' })
    @ApiQuery({ name: 'limit', required: false, description: 'Máximo de tareas a retornar' })
    @ApiResponse({ status: 200, description: 'Lista de tareas' })
    async getUserTasks(
        @CurrentUser() user: User,
        @Query('limit') limit?: string,
    ) {
        const tasks = await this.masterAgent.getUserTasks(
            user.id,
            limit ? parseInt(limit, 10) : undefined,
        );

        return tasks.map((t) => ({
            id: t.id,
            type: t.taskType,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));
    }

    @Post('chat')
    @ApiOperation({ summary: 'Chat con el agente IA', description: 'Envía una pregunta en lenguaje natural y recibe una respuesta del agente' })
    @ApiResponse({ status: 201, description: 'Respuesta del agente' })
    async chat(
        @CurrentUser() user: User,
        @Body() body: { message: string },
    ) {
        return this.masterAgent.chat(user.id, body.message);
    }

    @Sse('chat/stream')
    @ApiOperation({ summary: 'Chat con streaming', description: 'Envía una pregunta y recibe la respuesta en tiempo real usando Server-Sent Events' })
    chatStream(
        @CurrentUser() user: User,
        @Query('message') message: string,
    ): Observable<{ data: any }> {
        return this.masterAgent.chatStream(user.id, message);
    }
}

