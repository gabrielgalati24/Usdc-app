import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { WalletService } from '../../wallet/wallet.service';

export const createGetBalanceTool = (walletService: WalletService, userId: string) => {
    return new DynamicStructuredTool({
        name: 'get_balance',
        description: 'Obtiene el balance de USDC del usuario actual',
        schema: z.object({}),
        func: async () => {
            const result = await walletService.getBalance(userId);
            return JSON.stringify(result);
        },
    });
};
