import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationListener } from './notification.listener';

@Global()
@Module({
  providers: [MailService,NotificationListener],
  exports: [MailService],
})
export class MailModule {}
