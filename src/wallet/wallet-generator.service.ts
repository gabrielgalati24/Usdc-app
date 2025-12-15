import { Injectable, Logger } from '@nestjs/common';
import { Wallet } from 'ethers';
import { CryptoService } from '../common/services/crypto.service';

export interface WalletInfo {
    address: string;
    encryptedPrivateKey: string;
}

@Injectable()
export class WalletGeneratorService {
    private readonly logger = new Logger(WalletGeneratorService.name);

    constructor(private readonly cryptoService: CryptoService) { }

    /**
     * Genera una nueva wallet de Ethereum/Polygon
     * Retorna la dirección y la private key ENCRIPTADA
     */
    async generateWallet(): Promise<WalletInfo> {
        try {
            // Generar wallet aleatoria
            const wallet = Wallet.createRandom();

            // Encriptar la private key
            const encryptedPrivateKey = await this.cryptoService.encrypt(
                wallet.privateKey,
            );

            this.logger.log(`Nueva wallet generada: ${wallet.address}`);

            return {
                address: wallet.address,
                encryptedPrivateKey,
            };
        } catch (error) {
            this.logger.error('Error al generar wallet:', error);
            throw error;
        }
    }

    /**
     * Desencripta y retorna un objeto Wallet de ethers
     */
    async getWalletFromEncrypted(encryptedPrivateKey: string): Promise<Wallet> {
        try {
            const privateKey = await this.cryptoService.decrypt(encryptedPrivateKey);
            return new Wallet(privateKey);
        } catch (error) {
            this.logger.error('Error al desencriptar wallet:', error);
            throw error;
        }
    }
}
