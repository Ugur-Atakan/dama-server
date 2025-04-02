import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationListener } from './notification.listener';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Global()
@Module({
  providers: [MailService,NotificationListener,WhatsAppService],
  exports: [MailService],
})
export class MailModule {}
