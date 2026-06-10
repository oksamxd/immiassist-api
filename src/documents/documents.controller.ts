import {
  Controller, Post, Get, Patch, Param, Query, Body,
  UseGuards, Req, UploadedFile, UseInterceptors, Res, Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import * as path from 'path';
import * as mime from 'mime-types';

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

  /**
   * Legal team: view all pending documents awaiting verification.
   */
  @Get('pending')
  findPending(@Req() req: any) {
    // Only lawyers/associates can see pending docs
    return this.documentsService.findPendingForLegalTeam();
  }

  /**
   * Legal team: verify or reject a document.
   * Body: { status: 'VERIFIED' | 'REJECTED' | 'NEEDS_RESUBMISSION', notes?: string }
   */
  @Patch(':id/verify')
  verifyDocument(
    @Param('id') id: string,
    @Body() body: { status: 'VERIFIED' | 'REJECTED' | 'NEEDS_RESUBMISSION'; notes?: string },
    @Req() req: any,
  ) {
    return this.documentsService.verifyDocument(id, body.status, body.notes, req.user.sub);
  }

  /**
   * Download / view a document file.
   */
  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.findOne(id);
    const fileName = path.basename(doc.fileUrl);
    const mimeType = doc.mimeType || mime.lookup(fileName) || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType as string);
    res.setHeader('Content-Disposition', `inline; filename="${doc.fileName || fileName}"`);

    const stream = this.documentsService.getDocumentStream(doc.fileUrl);
    stream.getStream().pipe(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }
}
