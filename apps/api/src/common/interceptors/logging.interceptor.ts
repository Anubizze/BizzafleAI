import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppLogger } from '../logger/logger';
import { RequestWithUser } from '../types/auth';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithUser>();
    const started = Date.now();
    const { method, originalUrl } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = http.getResponse<{ statusCode: number }>();
          this.logger.log({
            msg: 'http_request',
            method,
            path: originalUrl,
            statusCode: response.statusCode,
            durationMs: Date.now() - started,
            userId: request.user?.id,
          });
        },
        error: () => {
          this.logger.warn({
            msg: 'http_request_failed',
            method,
            path: originalUrl,
            durationMs: Date.now() - started,
            userId: request.user?.id,
          });
        },
      }),
    );
  }
}
