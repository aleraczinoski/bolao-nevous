import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { KeepAliveModule } from './keep-alive/keep-alive.module';
import { MatchesModule } from './matches/matches.module';
import { PredictionsModule } from './predictions/predictions.module';
import { PrismaModule } from './prisma/prisma.module';
import { RankingModule } from './ranking/ranking.module';
import { ResultsSyncModule } from './results-sync/results-sync.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    MatchesModule,
    PredictionsModule,
    RankingModule,
    ResultsSyncModule,
    AdminModule,
    KeepAliveModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
