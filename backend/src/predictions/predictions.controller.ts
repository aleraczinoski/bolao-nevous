import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { PredictionsService } from './predictions.service';

@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  private static getUserId(req: Request) {
    return req.user?.sub;
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreatePredictionDto) {
    const userId = PredictionsController.getUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Token invalido.');
    }
    return this.predictionsService.create(userId, dto);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdatePredictionDto,
  ) {
    const userId = PredictionsController.getUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Token invalido.');
    }
    return this.predictionsService.update(userId, id, dto);
  }

  @Get('me')
  async listMine(@Req() req: Request) {
    const userId = PredictionsController.getUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Token invalido.');
    }
    return this.predictionsService.listByUser(userId);
  }

  @Get('finished')
  async listFinished() {
    return this.predictionsService.listFinished();
  }
}
