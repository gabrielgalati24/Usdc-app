import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { WalletService } from '../../wallet/wallet.service';

export const createGetHistoryTool = (walletService: WalletService, userId: string) => {
    return new DynamicStructuredTool({
        name: 'get_transaction_history',
        description: 'Obtiene el historial de transacciones del usuario',
        schema: z.object({
            limit: z.number().optional().describe('Número máximo de transacciones a obtener'),
        }),
        func: async ({ limit }) => {
            const transactions = await walletService.getTransactions(userId, limit || 10);
            return JSON.stringify(transactions);
        },
    });
};
