import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { LegalAssociatesService } from './legal-associates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('legal-associates')
@UseGuards(JwtAuthGuard)
export class LegalAssociatesController {
  constructor(private readonly legalAssociatesService: LegalAssociatesService) {}

  @Get()
  findAll() {
    return this.legalAssociatesService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.legalAssociatesService.findAvailable();
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.legalAssociatesService.getProfile(req.user.userId);
  }

  @Patch('availability')
  updateAvailability(@Request() req: any, @Body('available') available: boolean) {
    return this.legalAssociatesService.updateAvailability(req.user.userId, available);
  }
}
