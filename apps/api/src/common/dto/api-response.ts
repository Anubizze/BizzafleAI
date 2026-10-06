export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export function ok<T>(data: T, meta?: PaginationMeta): ApiSuccess<T> {
  if (meta) {
    return { success: true, data, meta };
  }
  return { success: true, data };
}

export function fail(
  code: string,
  message: string,
  details?: unknown,
): ApiErrorBody {
  if (details === undefined) {
    return { success: false, error: { code, message } };
  }
  return { success: false, error: { code, message, details } };
}

export interface Paginated<T> {
  data: T;
  meta: PaginationMeta;
}

export function paginated<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
): Paginated<T> {
  return { data, meta: { page, limit, total } };
}
