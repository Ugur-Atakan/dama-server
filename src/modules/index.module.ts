import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { MailModule } from './mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { SupportModule } from './support/support.module';
import { TaskModule } from './task/task.module';
import { PrismaModule } from 'src/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CaslModule } from 'src/authorization/casl/casl.module';


@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CaslModule,
    PrismaModule,
    AuthModule,
    UserModule,
    FileManagerModule,
    MailModule,
    AdminModule,
    HttpModule,
    SupportModule,
    TaskModule,
  ],
  exports: [
    AuthModule,
    UserModule,
    SupportModule,
    FileManagerModule,
    MailModule,
    AdminModule,
    TaskModule,
  ],
})
export class MainModule {}
