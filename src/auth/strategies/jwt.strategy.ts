import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';

export interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly config: ConfigService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET debe estar configurado en las variables de entorno.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { id: payload.sub, isActive: true },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado o inactivo.');
        }

        return user;
    }
}
