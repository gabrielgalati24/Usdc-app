import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import {
    AgentTask,
    AgentTaskType,
    AgentTaskStatus,
    User,
    Transaction,
    TransactionType,
} from '../database/entities';

export interface AnalysisRequest {
    type: AgentTaskType;
    data: Record<string, unknown>;
}

export interface AnalysisResult {
    taskId: string;
    type: AgentTaskType;
    status: AgentTaskStatus;
    result?: Record<string, unknown>;
    error?: string;
}

@Injectable()
export class MasterAgentService {
    private readonly logger = new Logger(MasterAgentService.name);
    private readonly llm: BaseChatModel;

    constructor(
        private readonly config: ConfigService,
        @InjectRepository(AgentTask)
        private readonly taskRepo: Repository<AgentTask>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
    ) {
        const ollamaUrl = this.config.get<string>('OLLAMA_BASE_URL');
        const openaiKey = this.config.get<string>('OPENAI_API_KEY');

        if (openaiKey) {
            this.logger.log('Usando OpenAI como LLM');
            this.llm = new ChatOpenAI({
                openAIApiKey: openaiKey,
                modelName: this.config.get<string>('OPENAI_MODEL') || 'gpt-4',
                temperature: 0.1,
            });
        } else if (ollamaUrl) {
            this.logger.log('Usando Ollama como LLM');
            this.llm = new ChatOllama({
                baseUrl: ollamaUrl,
                model: this.config.get<string>('OLLAMA_MODEL') || 'llama3',
                temperature: 0.1,
            });
        } else {
            throw new Error('Debe configurar OLLAMA_BASE_URL o OPENAI_API_KEY');
        }
    }

    async createTask(userId: string, request: AnalysisRequest): Promise<AgentTask> {
        const task = this.taskRepo.create({
            userId,
            taskType: request.type,
            status: AgentTaskStatus.PENDING,
            input: request.data,
        });

        return this.taskRepo.save(task);
    }

    async processTask(taskId: string): Promise<AnalysisResult> {
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task) {
            throw new Error('Tarea no encontrada');
        }

        try {
            await this.taskRepo.update(taskId, { status: AgentTaskStatus.RUNNING });

            const result = await this.delegateToSlave(task);

            await this.taskRepo.update(taskId, {
                status: AgentTaskStatus.COMPLETED,
                result,
            });

            return {
                taskId,
                type: task.taskType,
                status: AgentTaskStatus.COMPLETED,
                result,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            await this.taskRepo.update(taskId, {
                status: AgentTaskStatus.FAILED,
                error: errorMessage,
            });

            return {
                taskId,
                type: task.taskType,
                status: AgentTaskStatus.FAILED,
                error: errorMessage,
            };
        }
    }

    private async delegateToSlave(task: AgentTask): Promise<Record<string, unknown>> {
        const systemPrompt = this.getSystemPrompt(task.taskType);
        const userPrompt = JSON.stringify(task.input, null, 2);

        const response = await this.llm.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ]);

        const content = response.content.toString();

        try {
            return JSON.parse(content);
        } catch {
            return { analysis: content };
        }
    }

    private getSystemPrompt(taskType: AgentTaskType): string {
        const prompts: Record<AgentTaskType, string> = {
            [AgentTaskType.FINANCIAL_ANALYSIS]: `Eres un analista financiero experto en criptomonedas.
Analiza los datos proporcionados y responde en formato JSON con:
{
  "summary": "Resumen ejecutivo",
  "metrics": { ... },
  "recommendations": ["..."],
  "riskLevel": "bajo|medio|alto"
}`,

            [AgentTaskType.MARKET_DATA]: `Eres un experto en datos de mercado de criptomonedas.
Analiza los datos proporcionados y responde en formato JSON con:
{
  "currentTrend": "alcista|bajista|lateral",
  "priceAnalysis": { ... },
  "predictions": ["..."],
  "confidence": 0.0-1.0
}`,

            [AgentTaskType.RISK_ASSESSMENT]: `Eres un experto en evaluación de riesgos financieros.
Analiza los datos proporcionados y responde en formato JSON con:
{
  "riskScore": 0-100,
  "riskFactors": ["..."],
  "mitigations": ["..."],
  "recommendation": "aprobar|revisar|rechazar"
}`,

            [AgentTaskType.PORTFOLIO_REVIEW]: `Eres un asesor de portafolios de criptomonedas.
Analiza los datos proporcionados y responde en formato JSON con:
{
  "diversification": 0-100,
  "performance": { ... },
  "rebalanceRecommendations": ["..."],
  "overallHealth": "excelente|bueno|regular|malo"
}`,
        };

        return prompts[taskType] || 'Analiza los datos proporcionados y responde en formato JSON.';
    }

    async getTaskStatus(taskId: string): Promise<AnalysisResult | null> {
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task) {
            return null;
        }

        return {
            taskId: task.id,
            type: task.taskType,
            status: task.status,
            result: task.result as Record<string, unknown> | undefined,
            error: task.error ?? undefined,
        };
    }

    async getUserTasks(userId: string, limit = 10): Promise<AgentTask[]> {
        return this.taskRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: Math.min(limit, 50),
        });
    }

    async chat(userId: string, message: string): Promise<{ response: string; context?: Record<string, unknown> }> {
        // Fetch user data for context
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Fetch recent transactions (where user is sender OR receiver)
        const transactions = await this.transactionRepo
            .createQueryBuilder('tx')
            .where('tx.fromUserId = :userId', { userId })
            .orWhere('tx.toUserId = :userId', { userId })
            .orderBy('tx.createdAt', 'DESC')
            .take(10)
            .getMany();

        // Calculate stats
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalTransfers = 0;

        transactions.forEach((tx) => {
            const amount = parseFloat(tx.amount);
            if (tx.type === TransactionType.DEPOSIT) {
                totalDeposits += amount;
            } else if (tx.type === TransactionType.WITHDRAW) {
                totalWithdrawals += amount;
            } else if (tx.type === TransactionType.INTERNAL) {
                totalTransfers += amount;
            }
        });

        const context = {
            balance: user.usdcBalance,
            walletAddress: user.walletAddress,
            recentTransactions: transactions.length,
            totalDeposits,
            totalWithdrawals,
            totalTransfers,
        };

        const systemPrompt = `Eres un asistente financiero experto en criptomonedas para una wallet de USDC en la red Polygon.
        
El usuario tiene la siguiente información:
- Balance actual: ${user.usdcBalance} USDC
- Dirección de wallet: ${user.walletAddress || 'No asignada'}
- Transacciones recientes: ${transactions.length}
- Total depositado: ${totalDeposits} USDC
- Total retirado: ${totalWithdrawals} USDC
- Total transferido: ${totalTransfers} USDC

Responde de forma concisa, amigable y profesional en español.
Si te preguntan sobre balance, inversiones, estrategias o análisis financiero, proporciona consejos útiles basados en la información del usuario.
Si no tienes suficiente información, pregunta amablemente por más detalles.
Siempre recuerda que trabajamos con USDC (stablecoin) en la red Polygon.`;

        try {
            const response = await this.llm.invoke([
                new SystemMessage(systemPrompt),
                new HumanMessage(message),
            ]);

            return {
                response: response.content.toString(),
                context,
            };
        } catch (error) {
            this.logger.error('Error en chat:', error);
            return {
                response: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                context,
            };
        }
    }

    chatStream(userId: string, message: string): Observable<{ data: any }> {
        return new Observable((observer) => {
            (async () => {
                try {
                    // Fetch user data for context
                    const user = await this.userRepo.findOne({ where: { id: userId } });
                    if (!user) {
                        observer.next({ data: JSON.stringify({ error: 'Usuario no encontrado' }) } as MessageEvent);
                        observer.complete();
                        return;
                    }

                    // Fetch recent transactions
                    const transactions = await this.transactionRepo
                        .createQueryBuilder('tx')
                        .where('tx.fromUserId = :userId', { userId })
                        .orWhere('tx.toUserId = :userId', { userId })
                        .orderBy('tx.createdAt', 'DESC')
                        .take(10)
                        .getMany();

                    // Calculate stats
                    let totalDeposits = 0;
                    let totalWithdrawals = 0;
                    let totalTransfers = 0;

                    transactions.forEach((tx) => {
                        const amount = parseFloat(tx.amount);
                        if (tx.type === TransactionType.DEPOSIT) {
                            totalDeposits += amount;
                        } else if (tx.type === TransactionType.WITHDRAW) {
                            totalWithdrawals += amount;
                        } else if (tx.type === TransactionType.INTERNAL) {
                            totalTransfers += amount;
                        }
                    });

                    const systemPrompt = `Eres un asistente financiero experto en criptomonedas para una wallet de USDC en la red Polygon.
        
El usuario tiene la siguiente información:
- Balance actual: ${user.usdcBalance} USDC
- Dirección de wallet: ${user.walletAddress || 'No asignada'}
- Transacciones recientes: ${transactions.length}
- Total depositado: ${totalDeposits} USDC
- Total retirado: ${totalWithdrawals} USDC
- Total transferido: ${totalTransfers} USDC

Responde de forma concisa, amigable y profesional en español.
Si te preguntan sobre balance, inversiones, estrategias o análisis financiero, proporciona consejos útiles basados en la información del usuario.
Si no tienes suficiente información, pregunta amablemente por más detalles.
Siempre recuerda que trabajamos con USDC (stablecoin) en la red Polygon.`;

                    // Stream the response
                    const stream = await this.llm.stream([
                        new SystemMessage(systemPrompt),
                        new HumanMessage(message),
                    ]);

                    for await (const chunk of stream) {
                        const content = chunk.content.toString();
                        if (content) {
                            observer.next({ data: { content } });
                        }
                    }

                    // Send completion signal
                    observer.next({ data: { done: true } });
                    observer.complete();

                } catch (error) {
                    this.logger.error('Error en chat stream:', error);
                    observer.next({
                        data: {
                            error: 'Error al procesar el mensaje',
                            content: 'Lo siento, hubo un error. Por favor, intenta de nuevo.'
                        }
                    });
                    observer.complete();
                }
            })();
        });
    }
}

