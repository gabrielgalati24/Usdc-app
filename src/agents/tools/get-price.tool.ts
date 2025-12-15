import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export interface PriceData {
    symbol: string;
    price: number;
    change24h: number;
}

// Mock function - en producción usar CoinGecko/CoinMarketCap API
const fetchPrice = async (symbol: string): Promise<PriceData> => {
    const prices: Record<string, PriceData> = {
        usdc: { symbol: 'USDC', price: 1.0, change24h: 0.01 },
        btc: { symbol: 'BTC', price: 42500, change24h: 2.5 },
        eth: { symbol: 'ETH', price: 2250, change24h: 1.8 },
        matic: { symbol: 'MATIC', price: 0.85, change24h: -1.2 },
    };

    return prices[symbol.toLowerCase()] || { symbol, price: 0, change24h: 0 };
};

export const createGetPriceTool = () => {
    return new DynamicStructuredTool({
        name: 'get_crypto_price',
        description: 'Obtiene el precio actual de una criptomoneda (BTC, ETH, USDC, MATIC)',
        schema: z.object({
            symbol: z.string().describe('Símbolo de la criptomoneda (ej: BTC, ETH, USDC)'),
        }),
        func: async ({ symbol }) => {
            const data = await fetchPrice(symbol);
            return JSON.stringify(data);
        },
    });
};
