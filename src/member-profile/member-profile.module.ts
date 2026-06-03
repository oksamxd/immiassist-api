import { Module } from '@nestjs/common';
import { MemberProfileService } from './member-profile.service';
import { MemberProfileController } from './member-profile.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MemberProfileController],
  providers: [MemberProfileService, PrismaService],
})
export class MemberProfileModule {}
