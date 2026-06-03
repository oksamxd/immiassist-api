import { Module } from '@nestjs/common';
import { LegalAssociatesService } from './legal-associates.service';
import { LegalAssociatesController } from './legal-associates.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LegalAssociatesController],
  providers: [LegalAssociatesService, PrismaService],
})
export class LegalAssociatesModule {}
