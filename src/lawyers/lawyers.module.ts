import { Module } from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { LawyersController } from './lawyers.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LawyersController],
  providers: [LawyersService, PrismaService],
})
export class LawyersModule {}
