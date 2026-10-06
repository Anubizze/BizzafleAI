import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Company, Role } from '@prisma/client';
import { AuthUser } from '../../common/types/auth';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findFirst({ where: { ownerId: user.id } });
    if (existing) {
      throw new ConflictException('Компания уже создана');
    }

    const company = await this.prisma.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          type: dto.type,
          name: dto.name,
          binIin: dto.binIin,
          industry: dto.industry,
          taxRegime: dto.taxRegime,
          employeeCount: dto.employeeCount ?? 1,
          primaryGoal: dto.primaryGoal,
          ownerId: user.id,
        },
      });
      await tx.companyMember.create({
        data: {
          companyId: created.id,
          userId: user.id,
          role: Role.COMPANY_ADMIN,
        },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });
      return created;
    });

    return this.toCompany(company);
  }

  async current(userId: string) {
    const company = await this.prisma.findCompanyForUser(userId);
    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }
    return this.toCompany(company);
  }

  async update(user: AuthUser, companyId: string, dto: UpdateCompanyDto) {
    await this.assertCanManage(user, companyId);
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...dto,
        registeredAt: dto.registeredAt ? new Date(dto.registeredAt) : undefined,
      },
    });
    return this.toCompany(company);
  }

  async assertCanManage(user: AuthUser, companyId: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Компания не найдена');
    }
    if (user.role === Role.ADMIN || company.ownerId === user.id) {
      return company;
    }
    const member = await this.prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId: user.id } },
    });
    if (member?.role === Role.COMPANY_ADMIN || member?.role === Role.ADMIN) {
      return company;
    }
    throw new ForbiddenException('Недостаточно прав для изменения компании');
  }

  toCompany(company: Company) {
    return {
      id: company.id,
      name: company.name,
      type: company.type,
      binIin: company.binIin,
      industry: company.industry,
      taxRegime: company.taxRegime,
      employeeCount: company.employeeCount,
      registeredAt: company.registeredAt?.toISOString() ?? null,
      primaryGoal: company.primaryGoal,
      ownerId: company.ownerId,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };
  }
}
