import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class TokenBlacklistService implements OnModuleDestroy {
    constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

    async revokeToken(token: string, ttl: number): Promise<void> {
        if (!this.redisClient) return;
        await this.redisClient.set(`bl_${token}`, 'true', 'EX', ttl);
    }

    async isTokenRevoked(token: string): Promise<boolean> {
        if (!this.redisClient) return false;
        const result = await this.redisClient.get(`bl_${token}`);
        return result === 'true';
    }

    onModuleDestroy() {
        if (this.redisClient) {
            this.redisClient.disconnect();
        }
    }
}
