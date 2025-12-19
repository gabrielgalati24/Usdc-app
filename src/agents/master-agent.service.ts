import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage } from '@langchain/core/messages';
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
    private readonly llm: BaseChatModel | null = null;
    private geminiModel: any = null;
    private useGemini: boolean = false;
    private geminiKey: string | undefined;

    // Model candidates in order of preference (most capable/cheapest first)
    private readonly GEMINI_CANDIDATES = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-latest',
        'gemini-1.0-pro',
        'gemini-pro',
        'gemini-2.0-flash-exp'
    ];
    private selectedGeminiModelName: string | null = null;

    constructor(
        private readonly config: ConfigService,
        @InjectRepository(AgentTask)
        private readonly taskRepo: Repository<AgentTask>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
    ) {
        const geminiKey = this.config.get<string>('GEMINI_API_KEY');
        const openaiKey = this.config.get<string>('OPENAI_API_KEY');
        const ollamaUrl = this.config.get<string>('OLLAMA_BASE_URL');

        if (geminiKey) {
            this.logger.log('Inicializando Google Gemini (API directa)...');
            this.geminiKey = geminiKey;
            this.useGemini = true;
            // Initialization happens lazily on first use or background
            this.initializeGemini();
        } else if (openaiKey) {
            this.logger.log('Usando OpenAI como LLM');
            (this as any).llm = new ChatOpenAI({
                openAIApiKey: openaiKey,
                modelName: this.config.get<string>('OPENAI_MODEL') || 'gpt-4',
                temperature: 0.1,
            });
        } else if (ollamaUrl) {
            this.logger.log('Usando Ollama como LLM');
            (this as any).llm = new ChatOllama({
                baseUrl: ollamaUrl,
                model: this.config.get<string>('OLLAMA_MODEL') || 'llama3',
                temperature: 0.1,
            });
        } else {
            throw new Error('Debe configurar GEMINI_API_KEY, OPENAI_API_KEY o OLLAMA_BASE_URL');
        }
    }

    private async initializeGemini() {
        if (!this.geminiKey) return;

        const configuredModel = this.config.get<string>('GEMINI_MODEL');
        const candidates = configuredModel ? [configuredModel, ...this.GEMINI_CANDIDATES] : this.GEMINI_CANDIDATES;

        const genAI = new GoogleGenerativeAI(this.geminiKey);

        for (const modelName of candidates) {
            try {
                this.logger.log(`Probando modelo Gemini: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                // Test call
                await model.generateContent('Hi');

                this.geminiModel = model;
                this.selectedGeminiModelName = modelName;
                this.logger.log(`✅ Modelo Gemini seleccionado y funcionando: ${modelName}`);
                return;
            } catch (error: any) {
                this.logger.warn(`❌ Falló modelo ${modelName}: ${error.message || JSON.stringify(error)}`);
                // Continue to next candidate
            }
        }

        this.logger.error('❌ Ningún modelo Gemini funcionó. Verifica tu API Key y región.');
    }

    private async getWorkingModel() {
        if (this.geminiModel) return this.geminiModel;

        // If not initialized yet (race condition), wait a bit
        if (this.useGemini && !this.geminiModel) {
            this.logger.log('Esperando inicialización de Gemini...');
            // Simple wait logic
            for (let i = 0; i < 5; i++) {
                await new Promise(r => setTimeout(r, 1000));
                if (this.geminiModel) return this.geminiModel;
            }
            throw new Error('Gemini no se pudo inicializar correctamente (ningún modelo disponible)');
        }
        return null;
    }

    private async invokeModel(prompt: string): Promise<string> {
        if (this.useGemini) {
            const model = await this.getWorkingModel();
            if (!model) throw new Error('Gemini no disponible');

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } else if (this.llm) {
            const response = await this.llm.invoke([new HumanMessage(prompt)]);
            return response.content.toString();
        }
        throw new Error('No hay modelo LLM configurado');
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
        const combinedPrompt = `${systemPrompt}\n\nInput JSON:\n${userPrompt}`;

        const content = await this.invokeModel(combinedPrompt);

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
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const transactions = await this.transactionRepo
            .createQueryBuilder('tx')
            .where('tx.fromUserId = :userId', { userId })
            .orWhere('tx.toUserId = :userId', { userId })
            .orderBy('tx.createdAt', 'DESC')
            .take(10)
            .getMany();

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

        const prompt = `Eres un asistente financiero experto en criptomonedas para una wallet de USDC en la red Polygon.
        
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
Siempre recuerda que trabajamos con USDC (stablecoin) en la red Polygon.

Usuario: ${message}`;

        try {
            const response = await this.invokeModel(prompt);
            return { response, context };
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
                    const user = await this.userRepo.findOne({ where: { id: userId } });
                    if (!user) {
                        observer.next({ data: { error: 'Usuario no encontrado' } });
                        observer.complete();
                        return;
                    }

                    const transactions = await this.transactionRepo
                        .createQueryBuilder('tx')
                        .where('tx.fromUserId = :userId', { userId })
                        .orWhere('tx.toUserId = :userId', { userId })
                        .orderBy('tx.createdAt', 'DESC')
                        .take(10)
                        .getMany();

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

                    const prompt = `Eres un asistente financiero experto en criptomonedas para una wallet de USDC en la red Polygon.
        
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
Siempre recuerda que trabajamos con USDC (stablecoin) en la red Polygon.

Usuario: ${message}`;

                    // Usar streaming nativo de Gemini si está disponible
                    if (this.useGemini) {
                        const model = await this.getWorkingModel();
                        if (model) {
                            const result = await model.generateContentStream(prompt);

                            for await (const chunk of result.stream) {
                                const text = chunk.text();
                                if (text) {
                                    observer.next({ data: { content: text } });
                                }
                            }
                        } else {
                            throw new Error('Gemini no inicializado');
                        }
                    } else {
                        // Fallback para otros modelos
                        const fullContent = await this.invokeModel(prompt);
                        const words = fullContent.split(' ');
                        for (const word of words) {
                            observer.next({ data: { content: word + ' ' } });
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    }

                    observer.next({ data: { done: true } });
                    observer.complete();

                } catch (error) {
                    this.logger.error('Error en chat stream:', error);
                    observer.next({
                        data: {
                            error: 'Error al procesar el mensaje',
                            content: 'Lo siento, no pude conectar con Gemini. Verifica los logs del servidor para ver qué modelos fallaron.'
                        }
                    });
                    observer.complete();
                }
            })();
        });
    }
}
