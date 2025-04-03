import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {  OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../common/enums/event.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class NotificationListener implements OnModuleInit {
  private logger = new Logger(NotificationListener.name);
  constructor(
    private readonly httpService: HttpService
  ) {}

  onModuleInit() {
    this.logger.log('Email Listener started');
  }

  @OnEvent(Events.USER_LOGIN)
  async sendWelcomeEmail(payload: { email: string; name: string }) {
    this.logger.warn(`📧 Bir kullanıcı oturum açtı ${payload.email}`);
  }

  @OnEvent(Events.OTP_REQUESTED)
  async sendOTP(payload: { telephone: string; code: string }) {
    this.logger.log(`📧 OTP kodu gönderiliyor ${payload.telephone}`)
      await firstValueFrom(
    this.httpService.post(process.env.WHATSAPP_URL, {
      number: payload.telephone,
      message: `Merhaba, OTP kodunuz: ${payload.code}`,
    }));
    this.logger.log(`📧 OTP kodu gönderildi ${payload.telephone}`);
  }
}
