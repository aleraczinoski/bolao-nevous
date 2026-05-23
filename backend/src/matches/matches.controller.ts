import { Controller, Get, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // Rota para o React listar os jogos na tela
  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  // Rota para puxar os dados mais recentes da API externa
  @Post('sync')
  syncMatches() {
    return this.matchesService.syncExternalMatches();
  }
}
