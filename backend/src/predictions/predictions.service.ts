import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePredictionDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
    });

    if (!match) {
      throw new NotFoundException('Partida nao encontrada.');
    }

    this.assertMatchOpen(match.kickoffAt);

    const existing = await this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId: dto.matchId } },
    });

    if (existing) {
      throw new ConflictException('Palpite ja registrado para esta partida.');
    }

    return this.prisma.prediction.create({
      data: {
        userId,
        matchId: dto.matchId,
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        points: null,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdatePredictionDto) {
    const prediction = await this.prisma.prediction.findUnique({
      where: { id },
      include: { match: true },
    });

    if (!prediction) {
      throw new NotFoundException('Palpite nao encontrado.');
    }

    if (prediction.userId !== userId) {
      throw new ForbiddenException('Nao e permitido editar este palpite.');
    }

    this.assertMatchOpen(prediction.match.kickoffAt);

    return this.prisma.prediction.update({
      where: { id },
      data: {
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        points: null,
      },
    });
  }

  async listFinished() {
    return this.prisma.prediction.findMany({
      where: { match: { status: 'FINISHED' } },
      include: {
        user: { select: { id: true, displayName: true } },
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            round: true,
          },
        },
      },
      orderBy: { match: { kickoffAt: 'desc' } },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.prediction.findMany({
      where: { userId },
      include: {
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

  private assertMatchOpen(kickoffAt: Date) {
    if (Date.now() >= kickoffAt.getTime()) {
      throw new ForbiddenException('Palpites bloqueados: a partida ja comecou.');
    }
  }
}
