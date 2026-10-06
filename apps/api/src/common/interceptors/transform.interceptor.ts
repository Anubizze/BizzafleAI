import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiSuccess, PaginationMeta, ok } from '../dto/api-response';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T>> {
    return next.handle().pipe(
      map((body) => {
        if (isWrapped(body)) {
          return body;
        }
        if (isPaginated(body)) {
          return ok(body.data as T, body.meta);
        }
        return ok(body as T);
      }),
    );
  }
}

function isWrapped(body: unknown): body is ApiSuccess<never> {
  return Boolean(body && typeof body === 'object' && 'success' in body);
}

function isPaginated(body: unknown): body is { data: unknown; meta: PaginationMeta } {
  if (!body || typeof body !== 'object' || !('data' in body) || !('meta' in body)) {
    return false;
  }
  const meta = (body as { meta: PaginationMeta }).meta;
  return (
    Boolean(meta) &&
    typeof meta.page === 'number' &&
    typeof meta.limit === 'number' &&
    typeof meta.total === 'number'
  );
}
