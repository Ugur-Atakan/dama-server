// mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
   
    private readonly mailerService: MailerService;
    private resendMailer:Resend;
    constructor(
      private readonly configService: ConfigService
    ) {
      this.resendMailer = new Resend(
        this.configService.get<string>('RESEND_API_KEY')
      );
    }

  async sendMail(receiver_email: string, email_subject: string, email_body: string) {
    await this.resendMailer.emails.send({
      from: 'Regisate <notify@m.registate.com>',
      to: [receiver_email],
      subject: email_subject,
      html: email_body,
    });
  }

  async sendPasswordResetEmail(email: string, fullName: string, resetLink: string) {
    await this.resendMailer.emails.send({
      from: 'Regisate <notify@m.registate.com>',
      to: [email],
      subject: 'Password Reset Request',
      html: `Hello ${fullName}, <br> Your Password reset link <a href="${resetLink}"> click this</a>`,
    });
  }

  async sendEmailVerifyMail(email: string, fullName: string, verificationLink: string) {
    await this.resendMailer.emails.send({
      from: 'Regisate <help@m.registate.com>',
      to: [email],
      subject: 'Email Verification',
      html: `Hello ${fullName}, <br> Your Email verification link <a href="${verificationLink}"> click this</a>`,
    });
  }

}
