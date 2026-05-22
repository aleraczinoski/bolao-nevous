import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  private static getUserId(req: Request) {
    return req.user?.sub;
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async list(@Req() req: Request) {
    const userId = MatchesController.getUserId(req);
    return this.matchesService.listMatches(userId);
  }
}
