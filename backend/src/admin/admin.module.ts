import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResultsSyncModule } from '../results-sync/results-sync.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, ResultsSyncModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
