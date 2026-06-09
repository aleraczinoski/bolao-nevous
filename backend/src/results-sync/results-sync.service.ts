import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePoints } from '../predictions/points';

const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org';

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  matchday: number | null;
  homeTeam: {
    name: string;
    tla: string | null;
    crest: string | null;
  };
  awayTeam: {
    name: string;
    tla: string | null;
    crest: string | null;
  };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

@Injectable()
export class ResultsSyncService {
  private readonly logger = new Logger(ResultsSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCompetitionMatches() {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      throw new HttpException('FOOTBALL_API_KEY nao configurado.', 500);
    }

    const response = await fetch(
      `${FOOTBALL_DATA_BASE_URL}/v4/competitions/WC/matches`,
      {
        headers: { 'X-Auth-Token': apiKey },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new HttpException(
        `Erro ao buscar jogos: ${response.status} - ${text}`,
        response.status,
      );
    }

    const payload = (await response.json()) as { matches: FootballDataMatch[] };
    let updatedMatches = 0;

    for (const match of payload.matches) {
      const homeTeam = await this.upsertTeam(match.homeTeam);
      const awayTeam = await this.upsertTeam(match.awayTeam);
      const kickoffAt = new Date(match.utcDate);
      const round = await this.upsertRound(
        match.stage,
        match.matchday,
        kickoffAt,
      );

      const status = this.mapStatus(match.status);
      const homeScore = match.score.fullTime.home;
      const awayScore = match.score.fullTime.away;

      const savedMatch = await this.prisma.match.upsert({
        where: { externalId: match.id },
        update: {
          kickoffAt,
          status,
          homeScore,
          awayScore,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          roundId: round.id,
        },
        create: {
          externalId: match.id,
          kickoffAt,
          status,
          homeScore,
          awayScore,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          roundId: round.id,
        },
      });

      if (
        status === MatchStatus.FINISHED &&
        homeScore !== null &&
        awayScore !== null
      ) {
        await this.recalculateMatchPoints(savedMatch.id, homeScore, awayScore);
      }

      updatedMatches += 1;
    }

    return { updatedMatches };
  }

  private mapStatus(status: string): MatchStatus {
    switch (status) {
      case 'IN_PLAY':
      case 'PAUSED':
        return MatchStatus.IN_PLAY;
      case 'FINISHED':
        return MatchStatus.FINISHED;
      case 'POSTPONED':
        return MatchStatus.POSTPONED;
      case 'CANCELLED':
      case 'CANCELED':
        return MatchStatus.CANCELED;
      default:
        return MatchStatus.SCHEDULED;
    }
  }

  private buildRoundKey(stage: string, matchday: number | null): string {
    const normalized = stage.trim().replace(/\s+/g, '_').toUpperCase();
    return matchday ? `${normalized}_${matchday}` : normalized;
  }

  private buildRoundName(stage: string, matchday: number | null): string {
    return matchday ? `${stage} - Rodada ${matchday}` : stage;
  }

  private async upsertRound(
    stage: string,
    matchday: number | null,
    kickoffAt: Date,
  ) {
    const key = this.buildRoundKey(stage, matchday);
    const name = this.buildRoundName(stage, matchday);
    const existing = await this.prisma.round.findUnique({ where: { key } });

    if (!existing) {
      return this.prisma.round.create({
        data: {
          key,
          name,
          order: matchday ?? undefined,
          startAt: kickoffAt,
        },
      });
    }

    if (kickoffAt.getTime() < existing.startAt.getTime()) {
      return this.prisma.round.update({
        where: { id: existing.id },
        data: { startAt: kickoffAt, name },
      });
    }

    if (existing.name !== name) {
      return this.prisma.round.update({
        where: { id: existing.id },
        data: { name },
      });
    }

    return existing;
  }

  private async upsertTeam(team: FootballDataMatch['homeTeam']) {
    if (team.tla) {
      return this.prisma.team.upsert({
        where: { code: team.tla },
        update: { name: team.name, crestUrl: team.crest ?? undefined },
        create: {
          name: team.name,
          code: team.tla,
          crestUrl: team.crest ?? undefined,
        },
      });
    }

    const existing = await this.prisma.team.findFirst({
      where: { name: team.name },
    });

    if (existing) {
      return this.prisma.team.update({
        where: { id: existing.id },
        data: { crestUrl: team.crest ?? undefined },
      });
    }

    return this.prisma.team.create({
      data: {
        name: team.name,
        crestUrl: team.crest ?? undefined,
      },
    });
  }

  private async recalculateMatchPoints(
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) {
    const predictions = await this.prisma.prediction.findMany({
      where: { matchId },
      select: { id: true, homeScore: true, awayScore: true },
    });

    if (predictions.length === 0) {
      return;
    }

    const updates = predictions.map((prediction) =>
      this.prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          points: calculatePoints(
            homeScore,
            awayScore,
            prediction.homeScore,
            prediction.awayScore,
          ),
        },
      }),
    );

    try {
      await this.prisma.$transaction(updates);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        'Falha ao recalcular pontos.',
        err?.stack ?? String(error),
      );
    }
  }
}
