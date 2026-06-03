import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, SendMessageDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.sessionsService.findByUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post(':id/message')
  sendMessage(@Req() req: any, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.sessionsService.sendMessage(id, req.user.sub, dto.message);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.sessionsService.close(id);
  }
}
