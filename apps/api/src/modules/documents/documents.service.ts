import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentAiStatus, DocumentCategory, Prisma, Role } from '@prisma/client';
import { createReadStream } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { randomUUID } from 'crypto';
import { AuditService } from '../../audit/audit.service';
import { ALLOWED_MIME_TYPES } from '../../common/constants';
import { paginated } from '../../common/dto/api-response';
import { AuthUser } from '../../common/types/auth';
import { PrismaService } from '../../prisma/prisma.service';
import { AIProviderFactory } from '../ai/providers/ai-provider.factory';
import { DocumentAnalysisResult } from '../ai/providers/ai-provider.interface';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly factory: AIProviderFactory,
    private readonly audit: AuditService,
  ) {}

  uploadDir(): string {
    return path.resolve(this.config.get<string>('UPLOAD_DIR') ?? './uploads');
  }

  async create(user: AuthUser, file: Express.Multer.File | undefined, dto: UploadDocumentDto) {
    if (!file) {
      throw new BadRequestException('Файл обязателен');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException('Этот тип файла не поддерживается');
    }

    const company = await this.prisma.requireCompanyForUser(user.id);
    await mkdir(this.uploadDir(), { recursive: true });

    const ext = path.extname(file.originalname).slice(0, 10);
    const storageKey = `${randomUUID()}${ext}`;
    const dest = path.join(this.uploadDir(), storageKey);

    if (file.buffer) {
      await writeFile(dest, file.buffer);
    } else if (file.path) {
      await pipeline(createReadStream(file.path), createWriteStream(dest));
    } else {
      throw new BadRequestException('Не удалось прочитать файл');
    }

    const document = await this.prisma.document.create({
      data: {
        name: file.originalname,
        category: dto.category,
        mimeType: file.mimetype,
        size: file.size,
        storageKey,
        companyId: company.id,
        userId: user.id,
      },
    });
    return this.toDocument(document);
  }

  async list(user: AuthUser, page: number, limit: number, category?: string) {
    const company = await this.prisma.requireCompanyForUser(user.id);
    const where = {
      companyId: company.id,
      ...(category && Object.values(DocumentCategory).includes(category as DocumentCategory)
        ? { category: category as DocumentCategory }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);
    return paginated(items.map((item) => this.toDocument(item)), page, limit, total);
  }

  async get(user: AuthUser, id: string) {
    const document = await this.findAccessible(user, id);
    return this.toDocument(document);
  }

  async analyze(user: AuthUser, id: string, ip?: string | null) {
    const document = await this.findAccessible(user, id);
    const text = await this.safeExtractText(document.storageKey, document.mimeType, document.name);
    const analysis = await this.factory.get().analyzeDocument({
      text,
      fileName: document.name,
    });
    const aiStatus = statusFromRisk(analysis.riskLevel);
    const saved = await this.prisma.$transaction(async (tx) => {
      const record = await tx.documentAnalysis.create({
        data: {
          documentId: document.id,
          riskLevel: analysis.riskLevel,
          summary: analysis.summary,
          risks: analysis.risks as unknown as Prisma.InputJsonValue,
          obligations: analysis.obligations as unknown as Prisma.InputJsonValue,
          penalties: analysis.penalties as unknown as Prisma.InputJsonValue,
          deadlines: analysis.deadlines as unknown as Prisma.InputJsonValue,
          payments: analysis.payments as unknown as Prisma.InputJsonValue,
          recommendations: analysis.recommendations as unknown as Prisma.InputJsonValue,
        },
      });
      await tx.document.update({
        where: { id: document.id },
        data: { aiStatus },
      });
      return record;
    });

    await this.audit.log({
      userId: user.id,
      action: 'DOCUMENT_ANALYZE',
      entity: 'Document',
      entityId: document.id,
      metadata: { riskLevel: analysis.riskLevel, fileName: document.name },
      ip,
    });

    return this.toAnalysis(saved, analysis);
  }

  async getAnalysis(user: AuthUser, id: string) {
    await this.findAccessible(user, id);
    const analysis = await this.prisma.documentAnalysis.findFirst({
      where: { documentId: id },
      orderBy: { createdAt: 'desc' },
    });
    if (!analysis) {
      throw new NotFoundException('Анализ ещё не выполнен');
    }
    return this.toAnalysis(analysis);
  }

  private async findAccessible(user: AuthUser, id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException('Документ не найден');
    }
    if (user.role === Role.ADMIN) {
      return document;
    }
    const company = await this.prisma.requireCompanyForUser(user.id);
    if (document.companyId !== company.id) {
      throw new ForbiddenException('Нет доступа к документу');
    }
    return document;
  }

  private async safeExtractText(storageKey: string, mimeType: string, fileName: string): Promise<string> {
    if (mimeType.startsWith('text/')) {
      try {
        const raw = await readFile(path.join(this.uploadDir(), storageKey), 'utf8');
        return raw.slice(0, 20_000);
      } catch {
        return `Текстовый файл ${fileName} недоступен для чтения`;
      }
    }
    return `Бинарный файл ${fileName} (${mimeType})`;
  }

  private toDocument(document: {
    id: string;
    name: string;
    category: string;
    mimeType: string;
    size: number;
    storageKey: string;
    aiStatus: DocumentAiStatus;
    companyId: string;
    createdAt: Date;
  }) {
    return {
      id: document.id,
      name: document.name,
      category: document.category,
      mimeType: document.mimeType,
      size: document.size,
      aiStatus: document.aiStatus,
      uploadedAt: document.createdAt.toISOString(),
      companyId: document.companyId,
      url: `/uploads/${document.storageKey}`,
    };
  }

  private toAnalysis(
    record: {
      id: string;
      documentId: string;
      riskLevel: string;
      summary: string;
      risks: Prisma.JsonValue;
      obligations: Prisma.JsonValue;
      penalties: Prisma.JsonValue;
      deadlines: Prisma.JsonValue;
      payments: Prisma.JsonValue;
      recommendations: Prisma.JsonValue;
      createdAt: Date;
    },
    fallback?: DocumentAnalysisResult,
  ) {
    return {
      id: record.id,
      documentId: record.documentId,
      riskLevel: record.riskLevel,
      summary: record.summary,
      risks: record.risks ?? fallback?.risks ?? [],
      obligations: record.obligations ?? fallback?.obligations ?? [],
      penalties: record.penalties ?? fallback?.penalties ?? [],
      deadlines: record.deadlines ?? fallback?.deadlines ?? [],
      payments: record.payments ?? fallback?.payments ?? [],
      recommendations: record.recommendations ?? fallback?.recommendations ?? [],
      createdAt: record.createdAt.toISOString(),
    };
  }
}

function statusFromRisk(level: DocumentAnalysisResult['riskLevel']): DocumentAiStatus {
  if (level === 'HIGH') {
    return DocumentAiStatus.RISKS;
  }
  if (level === 'MEDIUM') {
    return DocumentAiStatus.ATTENTION;
  }
  return DocumentAiStatus.CHECKED;
}
