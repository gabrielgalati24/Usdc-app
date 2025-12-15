import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities';
import { RegisterDto, LoginDto } from './dto';
import { WalletGeneratorService } from '../wallet/wallet-generator.service';

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        usdcBalance: string;
        walletAddress?: string;
    };
}

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly walletGenerator: WalletGeneratorService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Ya existe un usuario con este email.');
        }

        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

        // Generar wallet única para el usuario
        const wallet = await this.walletGenerator.generateWallet();

        const user = this.userRepo.create({
            email: dto.email,
            passwordHash,
            usdcBalance: '0',
            walletAddress: wallet.address,
            encryptedPrivateKey: wallet.encryptedPrivateKey,
        });

        await this.userRepo.save(user);

        return this.createAuthResponse(user);
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas.');
        }

        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Credenciales inválidas.');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Cuenta desactivada.');
        }

        return this.createAuthResponse(user);
    }

    async getProfile(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado.');
        }

        return {
            id: user.id,
            email: user.email,
            usdcBalance: user.usdcBalance,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt,
        };
    }

    private createAuthResponse(user: User): AuthResponse {
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                usdcBalance: user.usdcBalance,
                walletAddress: user.walletAddress,
            },
        };
    }

    async searchUsers(query: string, currentUserId: string, limit = 10) {
        if (!query || query.length < 2) {
            return [];
        }

        const users = await this.userRepo
            .createQueryBuilder('user')
            .where('user.email ILIKE :query', { query: `%${query}%` })
            .andWhere('user.id != :currentUserId', { currentUserId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .select(['user.id', 'user.email'])
            .take(limit)
            .getMany();

        return users.map(u => ({
            id: u.id,
            email: u.email,
        }));
    }
}

