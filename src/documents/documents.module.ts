import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [MulterModule.register({ storage: undefined }), RealtimeModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
