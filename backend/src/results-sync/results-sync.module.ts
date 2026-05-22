import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResultsSyncService } from './results-sync.service';

@Module({
  imports: [PrismaModule],
  providers: [ResultsSyncService],
  exports: [ResultsSyncService],
})
export class ResultsSyncModule {}
