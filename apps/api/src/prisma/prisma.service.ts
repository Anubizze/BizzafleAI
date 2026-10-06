import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Company, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async findCompanyForUser(userId: string): Promise<Company | null> {
    const owned = await this.company.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });
    if (owned) {
      return owned;
    }
    const membership = await this.companyMember.findFirst({
      where: { userId },
      include: { company: true },
      orderBy: { createdAt: 'asc' },
    });
    return membership?.company ?? null;
  }

  async requireCompanyForUser(userId: string): Promise<Company> {
    const company = await this.findCompanyForUser(userId);
    if (!company) {
      throw new NotFoundException('Сначала завершите онбординг компании');
    }
    return company;
  }
}
