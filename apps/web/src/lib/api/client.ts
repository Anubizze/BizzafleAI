import type { ApiResponse } from "@bizaffle/types";
import { useAuthStore } from "@/stores/auth-store";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status = 500, code = "UNKNOWN", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function friendlyMessage(status: number, fallback?: string) {
  if (fallback) return fallback;
  if (status === 0) return "Сервер недоступен. Проверьте соединение и повторите.";
  if (status === 401) return "Сессия истекла. Войдите снова.";
  if (status === 403) return "Недостаточно прав для этого действия.";
  if (status === 404) return "Запрошенные данные не найдены.";
  if (status === 422) return "Проверьте введённые данные.";
  if (status >= 500) return "Сервис временно недоступен. Попробуйте позже.";
  return "Не удалось выполнить запрос.";
}

async function parseBody(res: Response): Promise<ApiResponse<unknown> | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    return null;
  }
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const body = await parseBody(res);
    if (!res.ok || !body || !body.success) return false;
    const data = body.data as { accessToken?: string; user?: unknown };
    if (data.accessToken) {
      useAuthStore.getState().setToken(data.accessToken);
      if (data.user && typeof data.user === "object") {
        useAuthStore.getState().setUser(data.user as never);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, retry = true, headers, ...init } = options;
  const token = useAuthStore.getState().accessToken;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const reqHeaders = new Headers(headers);
  reqHeaders.set("Accept", "application/json");
  if (!isForm && body !== undefined) reqHeaders.set("Content-Type", "application/json");
  if (auth && token) reqHeaders.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: reqHeaders,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(friendlyMessage(0), 0, "NETWORK");
  }

  if (res.status === 401 && auth && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return api<T>(path, { ...options, retry: false });
    }
    useAuthStore.getState().logout();
    throw new ApiError(friendlyMessage(401), 401, "UNAUTHORIZED");
  }

  const parsed = await parseBody(res);

  if (!res.ok) {
    const err = parsed && !parsed.success ? parsed.error : undefined;
    throw new ApiError(
      friendlyMessage(res.status, err?.message),
      res.status,
      err?.code ?? "HTTP",
      err?.details,
    );
  }

  if (parsed && !parsed.success) {
    throw new ApiError(parsed.error.message, res.status, parsed.error.code, parsed.error.details);
  }

  if (parsed && parsed.success) {
    return parsed.data as T;
  }

  return undefined as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => api<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    api<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    api<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    api<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    api<T>(path, { ...options, method: "DELETE" }),
};
