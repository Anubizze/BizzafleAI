import { LoggerService } from '@nestjs/common';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'newpassword',
  'oldpassword',
  'refreshtoken',
  'refreshtokenhash',
  'accesstoken',
  'token',
  'authorization',
  'jwt',
  'cookie',
  'cookies',
  'apikey',
  'ravatarapikey',
  'openaiapikey',
  'secret',
  'jwtaccesssecret',
  'jwtrefreshsecret',
  'content',
  'text',
  'filecontent',
  'documentcontent',
  'buffer',
  'raw',
  'file',
]);

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_[\].]/g, '');
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(normalizeKey(key));
}

export function redact(value: unknown, key?: string): unknown {
  if (key && isSensitiveKey(key)) {
    return '[REDACTED]';
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, key));
  }
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [entryKey, entryValue] of Object.entries(value)) {
      output[entryKey] = redact(entryValue, entryKey);
    }
    return output;
  }
  return value;
}

function serializeMessage(message: unknown): unknown {
  if (typeof message === 'string') {
    return message;
  }
  return redact(message);
}

export class AppLogger implements LoggerService {
  constructor(private context = 'App') {}

  setContext(context: string): void {
    this.context = context;
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  child(context: string): AppLogger {
    return new AppLogger(context);
  }

  private write(level: string, message: unknown, optionalParams: unknown[]): void {
    const context =
      typeof optionalParams[optionalParams.length - 1] === 'string'
        ? (optionalParams[optionalParams.length - 1] as string)
        : this.context;
    const extras = optionalParams.filter((param) => param !== context).map((param) => redact(param));

    const line = {
      level,
      time: new Date().toISOString(),
      context,
      message: serializeMessage(message),
      ...(extras.length === 1 && extras[0] && typeof extras[0] === 'object' && !Array.isArray(extras[0])
        ? (extras[0] as Record<string, unknown>)
        : extras.length > 0
          ? { extras }
          : {}),
    };

    const serialized = JSON.stringify(line);
    if (level === 'error') {
      process.stderr.write(`${serialized}\n`);
      return;
    }
    process.stdout.write(`${serialized}\n`);
  }
}
