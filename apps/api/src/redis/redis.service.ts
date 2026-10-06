import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppLogger } from '../common/logger/logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger('Redis');
  private client: Redis | null = null;
  status: 'ok' | 'degraded' = 'degraded';

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('REDIS_URL');
    if (!url || process.env.NODE_ENV === 'development') {
      this.status = 'degraded';
      this.logger.warn('Redis skipped in local development');
      return;
    }

    const redis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 1500,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    });

    redis.on('error', () => {
      this.status = 'degraded';
    });

    try {
      await redis.connect();
      this.client = redis;
      this.status = 'ok';
      this.logger.log('Redis connected');
    } catch {
      this.status = 'degraded';
      this.client = null;
      redis.disconnect();
      this.logger.warn('Redis is unavailable, app continues without cache');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }

  get isReady(): boolean {
    return this.status === 'ok' && this.client !== null;
  }

  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    try {
      const result = await this.client.ping();
      this.status = result === 'PONG' ? 'ok' : 'degraded';
      return this.status === 'ok';
    } catch {
      this.status = 'degraded';
      return false;
    }
  }
}
