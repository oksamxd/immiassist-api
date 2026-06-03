import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lawyers')
@UseGuards(JwtAuthGuard)
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Get()
  findAll() {
    return this.lawyersService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.lawyersService.findAvailable();
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.lawyersService.getProfile(req.user.userId);
  }

  @Patch('availability')
  updateAvailability(@Request() req: any, @Body('available') available: boolean) {
    return this.lawyersService.updateAvailability(req.user.userId, available);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: any) {
    return this.lawyersService.updateProfile(req.user.userId, dto);
  }
}
