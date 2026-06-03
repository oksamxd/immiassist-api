import {
  Controller, Post, Get, Param, Query,
  UseGuards, Req, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('caseId') caseId: string,
    @Query('type') docType: string,
  ) {
    return this.documentsService.upload(req.user.sub, caseId, docType, file);
  }

  @Post('onboarding')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadOnboarding(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') docType: string,
  ) {
    return this.documentsService.uploadOnboarding(req.user.sub, docType, file);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.documentsService.findByCase(caseId);
  }

  @Get('my')
  findMine(@Req() req: any) {
    return this.documentsService.findAllByUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }
}
