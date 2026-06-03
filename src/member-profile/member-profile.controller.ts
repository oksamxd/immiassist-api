import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { MemberProfileService } from './member-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('member-profile')
@UseGuards(JwtAuthGuard)
export class MemberProfileController {
  constructor(private readonly memberProfileService: MemberProfileService) {}

  @Get()
  getProfile(@Request() req: any) {
    return this.memberProfileService.getProfile(req.user.userId);
  }

  @Patch()
  updateProfile(@Request() req: any, @Body() dto: any) {
    return this.memberProfileService.updateProfile(req.user.userId, dto);
  }
}
