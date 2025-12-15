import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MasterAgentService } from './master-agent.service';

export const AGENT_QUEUE = 'agent-tasks';

export interface AgentJobData {
    taskId: string;
}

@Processor(AGENT_QUEUE)
export class AgentWorkerProcessor {
    private readonly logger = new Logger(AgentWorkerProcessor.name);

    constructor(private readonly masterAgent: MasterAgentService) { }

    @Process()
    async processAgentTask(job: Job<AgentJobData>) {
        this.logger.log(`Procesando tarea ${job.data.taskId}`);

        try {
            const result = await this.masterAgent.processTask(job.data.taskId);
            this.logger.log(`Tarea ${job.data.taskId} completada: ${result.status}`);
            return result;
        } catch (error) {
            this.logger.error(`Error en tarea ${job.data.taskId}:`, error);
            throw error;
        }
    }
}
