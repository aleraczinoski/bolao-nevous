import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ResultsSyncService } from '../results-sync/results-sync.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resultsSyncService: ResultsSyncService,
  ) {}

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async updateActive(userId: string, active: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { active },
    });
  }

  async listPredictions() {
    return this.prisma.prediction.findMany({
      include: {
        user: { select: { id: true, email: true, displayName: true } },
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            round: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async syncResults() {
    return this.resultsSyncService.syncCompetitionMatches();
  }
}
