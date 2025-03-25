import { Global, Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';

@Global()
@Module({
  providers: [WhatsAppService],
  exports: [WhatsAppService],
  controllers: [WhatsAppController],
})
export class WhatsAppModule {}
