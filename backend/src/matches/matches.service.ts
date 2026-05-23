import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  // 1. Busca na API Externa e salva no seu Banco
  async syncExternalMatches() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'http://api.football-data.org/v4/competitions/WC/matches',
          {
            headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY },
          },
        ),
      );

      const externalMatches = response.data.matches;

      for (const match of externalMatches) {
        if (!match.homeTeam?.name || !match.awayTeam?.name) {
          continue; // Se não tem time definido, pula pro próximo jogo!
        }
        // Garante que o Time A existe no banco
        const homeTeam = await this.prisma.team.upsert({
          where: { code: match.homeTeam.tla || match.homeTeam.name },
          update: { crestUrl: match.homeTeam.crest },
          create: {
            name: match.homeTeam.name,
            code: match.homeTeam.tla,
            crestUrl: match.homeTeam.crest,
          },
        });

        // Garante que o Time B existe no banco
        const awayTeam = await this.prisma.team.upsert({
          where: { code: match.awayTeam.tla || match.awayTeam.name },
          update: { crestUrl: match.awayTeam.crest },
          create: {
            name: match.awayTeam.name,
            code: match.awayTeam.tla,
            crestUrl: match.awayTeam.crest,
          },
        });

        // Garante que a Rodada existe
        const round = await this.prisma.round.upsert({
          where: { key: match.stage },
          update: {},
          create: {
            key: match.stage,
            name: match.stage,
            startAt: new Date(match.utcDate),
          },
        });

        // Finalmente, salva ou atualiza o Jogo
        await this.prisma.match.upsert({
          where: { externalId: match.id },
          update: {
            status: match.status,
            homeScore: match.score?.fullTime?.home,
            awayScore: match.score?.fullTime?.away,
          },
          create: {
            externalId: match.id,
            kickoffAt: new Date(match.utcDate),
            status: match.status,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            roundId: round.id,
          },
        });
      }

      return { message: 'Jogos sincronizados com sucesso!' };
    } catch (error) {
      this.logger.error('Erro na sincronização', error);
      throw error;
    }
  }

  // 2. Entrega os dados prontos para o React
  async findAll() {
    return this.prisma.match.findMany({
      orderBy: { kickoffAt: 'asc' },
      include: {
        homeTeam: true, // OBRIGATÓRIO: Traz os dados do time A junto
        awayTeam: true, // OBRIGATÓRIO: Traz os dados do time B junto
        round: true,
      },
    });
  }
}
