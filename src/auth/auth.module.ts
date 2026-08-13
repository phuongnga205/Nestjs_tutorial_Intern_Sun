import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenBlacklistService, REDIS_CLIENT } from './token-blacklist.service';
import { Redis } from 'ioredis';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'intern_sun_phuongnga05',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRATION') || '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'USERS_REPOSITORY',
      useExisting: getRepositoryToken(User),
    },
    {
      provide: 'TOKEN_BLACKLIST_SERVICE',
      useClass: TokenBlacklistService,
    },
    AuthService, 
    JwtStrategy, 
    TokenBlacklistService,
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule { }