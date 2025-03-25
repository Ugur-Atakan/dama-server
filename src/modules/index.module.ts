import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { MailModule } from './mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CaslModule } from 'src/authorization/casl/casl.module';
import { AppointmentModule } from './appointment/appointment.module';
import { FormSchemaModule } from './form/form-schema.module';
import { FormSubmissionsModule } from './form/form-submissions.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';


@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AppointmentModule,
    CaslModule,
    PrismaModule,
    AuthModule,
    UserModule,
    FileManagerModule,
    MailModule,
    AdminModule,
    HttpModule,
    FormSchemaModule,
    FormSubmissionsModule,
    WhatsAppModule,
  ],
  exports: [
    AuthModule,
    UserModule,
    FileManagerModule,
    MailModule,
    AdminModule,
  ],
})
export class MainModule {}
