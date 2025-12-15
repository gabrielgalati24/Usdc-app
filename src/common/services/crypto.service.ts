import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32;
    private readonly ivLength = 16;
    private readonly saltLength = 32;
    private readonly tagLength = 16;

    constructor(private readonly config: ConfigService) { }

    /**
     * Encripta un texto usando AES-256-GCM
     * Formato: salt:iv:tag:encryptedData (todo en hex)
     */
    async encrypt(plainText: string): Promise<string> {
        const encryptionKey = this.getEncryptionKey();

        // Generar salt e IV aleatorios
        const salt = randomBytes(this.saltLength);
        const iv = randomBytes(this.ivLength);

        // Derivar key usando scrypt
        const key = (await scryptAsync(encryptionKey, salt, this.keyLength)) as Buffer;

        // Crear cipher
        const cipher = createCipheriv(this.algorithm, key, iv);

        // Encriptar
        const encrypted = Buffer.concat([
            cipher.update(plainText, 'utf8'),
            cipher.final(),
        ]);

        // Obtener authentication tag
        const tag = cipher.getAuthTag();

        // Retornar todo concatenado en hex
        return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    /**
     * Desencripta un texto encriptado con encrypt()
     */
    async decrypt(encryptedText: string): Promise<string> {
        const encryptionKey = this.getEncryptionKey();

        // Separar componentes
        const [saltHex, ivHex, tagHex, encryptedHex] = encryptedText.split(':');

        if (!saltHex || !ivHex || !tagHex || !encryptedHex) {
            throw new Error('Formato de datos encriptados inválido');
        }

        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        // Derivar la misma key
        const key = (await scryptAsync(encryptionKey, salt, this.keyLength)) as Buffer;

        // Crear decipher
        const decipher = createDecipheriv(this.algorithm, key, iv);
        decipher.setAuthTag(tag);

        // Desencriptar
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    }

    private getEncryptionKey(): string {
        const key = this.config.get<string>('ENCRYPTION_KEY');

        if (!key || key.length < 32) {
            throw new Error(
                'ENCRYPTION_KEY debe tener al menos 32 caracteres. Configúrala en .env',
            );
        }

        return key;
    }
}
