import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Contract,
  JsonRpcProvider,
  Wallet,
  parseUnits,
  formatUnits,
  getAddress,
} from 'ethers';
import type { EventLog, Log } from 'ethers';

const MIN_ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export type TransferDirection = 'incoming' | 'outgoing' | 'self';
export type TransferStatus = 'pending' | 'confirming' | 'confirmed';

export interface TransferActivity {
  hash: string;
  logIndex: number;
  blockNumber: number;
  timestamp?: number;
  confirmations: number;
  from: string;
  to: string;
  amount: string;
  amountRaw: string;
  direction: TransferDirection;
  status: TransferStatus;
}

export interface TransferHistoryOptions {
  direction?: 'incoming' | 'outgoing' | 'all';
  blocks?: number;
  fromBlock?: number;
  limit?: number;
  minConfirmations?: number;
  maxConfirmations?: number;
  confirmationThreshold?: number;
}

@Injectable()
export class UsdcPolygonService {
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;
  private readonly contract: Contract;
  private decimalsCache?: number;
  private decimalsPromise?: Promise<number>;

  constructor(private readonly config: ConfigService) {
    const rpcUrl = this.requireEnv('ETH_RPC_URL');
    const privateKey = this.normalizePrivateKey(this.requireEnv('ETH_PRIVATE_KEY'));
    const tokenAddress = this.normalizeAddress(this.requireEnv('USDC_EVM_ADDRESS'), 'USDC_EVM_ADDRESS');

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider);
    this.contract = new Contract(tokenAddress, MIN_ERC20_ABI, this.wallet);
  }

  async getUsdcBalance(addr: string) {
    const to = getAddress(addr);
    const [decimals, raw] = await Promise.all([
      this.getDecimals(),
      this.contract.balanceOf(to),
    ]);

    return {
      address: to,
      balance: formatUnits(raw, decimals),
      decimals,
    };
  }

  async getMaticBalance(addr?: string) {
    const who = getAddress(addr ?? this.wallet.address);
    const wei = await this.provider.getBalance(who);

    return {
      address: who,
      matic: formatUnits(wei, 18),
    };
  }

  async transferUsdc(to: string, amount: string) {
    const toAddr = getAddress(to);
    const decimals = await this.getDecimals();
    const value = parseUnits(amount, decimals);

    const gasBalWei = await this.provider.getBalance(this.wallet.address);
    if (gasBalWei === 0n) {
      throw new Error('Tu cuenta no tiene MATIC para pagar gas en Polygon.');
    }

    const tx = await this.contract.transfer(toAddr, value);
    const receipt = await tx.wait();

    return {
      hash: receipt?.hash ?? tx.hash,
      status: receipt?.status,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
    };
  }

  getFromAddress() {
    return this.wallet.address;
  }

  async getRecentTransfers(address: string, options?: TransferHistoryOptions): Promise<TransferActivity[]> {
    const target = getAddress(address);
    const {
      direction = 'all',
      blocks = 2000,
      fromBlock,
      limit = 20,
      minConfirmations,
      maxConfirmations,
      confirmationThreshold = 12,
    } = options ?? {};

    const latestBlock = await this.provider.getBlockNumber();
    const endBlock = latestBlock;
    const startBlock = fromBlock ?? Math.max(endBlock - blocks, 0);
    const cappedLimit = Math.min(Math.max(limit, 1), 50);

    const aggregated = new Map<string, { log: EventLog; direction: TransferDirection }>();

    const registerLogs = (logs: Array<EventLog | Log>, dir: TransferDirection) => {
      for (const log of logs) {
        if (!('args' in log)) {
          continue;
        }

        const eventLog = log as EventLog;
        const key = `${eventLog.blockHash ?? eventLog.transactionHash}:${eventLog.index}`;
        const existing = aggregated.get(key);
        if (existing) {
          aggregated.set(key, { log: eventLog, direction: 'self' });
        } else {
          aggregated.set(key, { log: eventLog, direction: dir });
        }
      }
    };

    if (direction === 'incoming' || direction === 'all') {
      const filterIn = this.contract.filters.Transfer(null, target);
      const incoming = await this.contract.queryFilter(filterIn, startBlock, endBlock);
      registerLogs(incoming, 'incoming');
    }

    if (direction === 'outgoing' || direction === 'all') {
      const filterOut = this.contract.filters.Transfer(target, null);
      const outgoing = await this.contract.queryFilter(filterOut, startBlock, endBlock);
      registerLogs(outgoing, 'outgoing');
    }

    if (aggregated.size === 0) {
      return [];
    }

    const decimals = await this.getDecimals();
    const events = Array.from(aggregated.values())
      .sort((a, b) => {
        if (a.log.blockNumber === b.log.blockNumber) {
          return b.log.index - a.log.index;
        }
        return b.log.blockNumber - a.log.blockNumber;
      })
      .slice(0, cappedLimit);

    const uniqueBlocks = Array.from(new Set(events.map((entry) => entry.log.blockNumber)));
    const blockTimestamps = new Map<number, number>();
    await Promise.all(
      uniqueBlocks.map(async (blockNumber) => {
        const block = await this.provider.getBlock(blockNumber);
        if (block) {
          blockTimestamps.set(blockNumber, block.timestamp);
        }
      }),
    );

    const activities: TransferActivity[] = [];
    for (const { log, direction: dir } of events) {
      const { from, to, value } = log.args as unknown as {
        from: string;
        to: string;
        value: bigint;
      };

      const confirmations = Math.max(0, latestBlock - log.blockNumber);

      if (minConfirmations !== undefined && confirmations < minConfirmations) {
        continue;
      }

      if (maxConfirmations !== undefined && confirmations > maxConfirmations) {
        continue;
      }

      const status: TransferStatus = confirmations === 0
        ? 'pending'
        : confirmations < confirmationThreshold
          ? 'confirming'
          : 'confirmed';

      activities.push({
        hash: log.transactionHash,
        logIndex: log.index,
        blockNumber: log.blockNumber,
        timestamp: blockTimestamps.get(log.blockNumber),
        confirmations,
        from,
        to,
        amount: formatUnits(value, decimals),
        amountRaw: value.toString(),
        direction: dir,
        status,
      });
    }

    return activities;
  }

  private async getDecimals(): Promise<number> {
    if (this.decimalsCache !== undefined) {
      return this.decimalsCache;
    }

    if (!this.decimalsPromise) {
      this.decimalsPromise = this.contract.decimals().then((value: number) => {
        this.decimalsCache = Number(value);
        return this.decimalsCache;
      });
    }

    return this.decimalsPromise;
  }

  private requireEnv(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`Falta configurar la variable de entorno ${key}.`);
    }

    return value.trim();
  }

  private normalizePrivateKey(value: string): string {
    const normalized = value.startsWith('0x') ? value : `0x${value}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
      throw new Error('ETH_PRIVATE_KEY debe ser una clave hex de 32 bytes con prefijo 0x.');
    }

    return normalized;
  }

  private normalizeAddress(value: string, key: string): string {
    try {
      return getAddress(value);
    } catch (error) {
      throw new Error(`${key} no es una dirección EVM válida.`);
    }
  }
}
