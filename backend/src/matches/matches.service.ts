import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMatches(userId?: string) {
    const include: Prisma.MatchInclude = {
      homeTeam: true,
      awayTeam: true,
      round: true,
    };

    if (userId) {
      include.predictions = { where: { userId } };
    }

    return this.prisma.match.findMany({
      orderBy: { kickoffAt: 'asc' },
      include,
    });
  }
}
