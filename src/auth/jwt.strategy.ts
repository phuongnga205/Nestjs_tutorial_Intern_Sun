import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('TOKEN_BLACKLIST_SERVICE')
    private readonly cacheService: {
      isTokenRevoked: (token: string) => Promise<boolean>;
    },
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Sử dụng ConfigService để lấy secret thay vì hardcode chuỗi để pass C067
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { id: number; username: string }) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const isBlacklisted = await this.cacheService.isTokenRevoked(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Unauthorized');
      }
    }
    return { id: payload.id, username: payload.username };
  }
}
