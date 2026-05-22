import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async getRanking() {
    const users = await this.prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        displayName: true,
      },
    });

    const totals = await this.prisma.prediction.groupBy({
      by: ['userId'],
      _sum: { points: true },
    });

    const totalsMap = new Map(
      totals.map((entry) => [entry.userId, entry._sum.points ?? 0]),
    );

    return users
      .map((user) => ({
        userId: user.id,
        displayName: user.displayName,
        points: totalsMap.get(user.id) ?? 0,
      }))
      .sort((a, b) => b.points - a.points);
  }
}
