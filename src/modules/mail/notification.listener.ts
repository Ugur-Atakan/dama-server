import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {  OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../common/enums/event.enum';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class NotificationListener implements OnModuleInit {
  private readonly whatsappService: WhatsAppService;
  private logger = new Logger(NotificationListener.name);
  constructor(
  ) {}

  onModuleInit() {
    this.logger.log('Email Listener started');
  }

  @OnEvent(Events.USER_LOGIN)
  async sendWelcomeEmail(payload: { email: string; name: string }) {
    this.logger.warn(`📧 Bir kullanıcı oturum açtı ${payload.email}`);
  }

  @OnEvent(Events.OTP_REQUESTED)
  async sendOTP(payload: { phone: string; code: string }) {
    await this.whatsappService.sendMessage(
      payload.phone,
      `Your OTP code is ${payload.code}`,
    );
    this.logger.warn(`📧 Bir kullanıcı oturum açtı ${payload}`);
  }
}
