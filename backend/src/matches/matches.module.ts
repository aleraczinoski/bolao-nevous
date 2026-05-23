import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <-- Importe aqui em cima
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
