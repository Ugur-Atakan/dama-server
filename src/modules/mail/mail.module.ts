import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationListener } from './notification.listener';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [MailService,NotificationListener],
  exports: [MailService],
})
export class MailModule {}
