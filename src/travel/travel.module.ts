import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TravelController],
  providers: [TravelService, PrismaService],
  exports: [TravelService],
})
export class TravelModule {}
