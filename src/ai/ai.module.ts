import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { VoiceController } from './voice.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [VoiceController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
