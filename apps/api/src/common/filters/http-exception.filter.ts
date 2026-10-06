import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { MulterError } from 'multer';
import { fail } from '../dto/api-response';
import { AppLogger } from '../logger/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, body } = this.normalize(exception);

    if (status >= 500) {
      this.logger.error({
        msg: 'unhandled_exception',
        status,
        name: exception instanceof Error ? exception.name : 'UnknownError',
      });
    }

    response.status(status).json(body);
  }

  private normalize(exception: unknown): { status: number; body: ReturnType<typeof fail> } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return { status, body: fail(httpCode(status), payload) };
      }
      if (payload && typeof payload === 'object') {
        const record = payload as Record<string, unknown>;
        const rawMessage = record.message;
        const isValidation = Array.isArray(rawMessage);
        return {
          status,
          body: fail(
            isValidation ? 'VALIDATION_ERROR' : httpCode(status),
            isValidation ? 'Ошибка валидации' : stringifyMessage(rawMessage) || exception.message,
            isValidation ? rawMessage : record.details,
          ),
        };
      }
      return { status, body: fail(httpCode(status), exception.message) };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          status: HttpStatus.CONFLICT,
          body: fail('CONFLICT', 'Запись с такими данными уже существует'),
        };
      }
      if (exception.code === 'P2025') {
        return {
          status: HttpStatus.NOT_FOUND,
          body: fail('NOT_FOUND', 'Запись не найдена'),
        };
      }
      return {
        status: HttpStatus.BAD_REQUEST,
        body: fail('DATABASE_ERROR', 'Ошибка базы данных'),
      };
    }

    if (exception instanceof MulterError) {
      if (exception.code === 'LIMIT_FILE_SIZE') {
        return {
          status: HttpStatus.PAYLOAD_TOO_LARGE,
          body: fail('FILE_TOO_LARGE', 'Файл превышает допустимый размер'),
        };
      }
      return {
        status: HttpStatus.BAD_REQUEST,
        body: fail('UPLOAD_ERROR', 'Не удалось загрузить файл'),
      };
    }

    const isProd = process.env.NODE_ENV === 'production';
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: fail(
        'INTERNAL_ERROR',
        isProd ? 'Внутренняя ошибка сервера' : exception instanceof Error ? exception.message : 'Unknown error',
      ),
    };
  }
}

function httpCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 413:
      return 'PAYLOAD_TOO_LARGE';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return status >= 500 ? 'INTERNAL_ERROR' : 'ERROR';
  }
}

function stringifyMessage(message: unknown): string {
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message.map(String).join('; ');
  }
  return '';
}
