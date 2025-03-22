import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { MailService } from "./mail.service";
import { Events } from "../../common/enums/event.enum";

@Injectable()
export class NotificationListener implements OnModuleInit {
  private logger = new Logger(NotificationListener.name);
  constructor(private mailService: MailService, private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.logger.log("Email Listener started");

  }

  @OnEvent(Events.USER_LOGIN)
  async sendWelcomeEmail(payload: { email: string; name: string }) {
    this.logger.warn(`📧 Bir kullanıcı oturum açtı ${payload.email}`);
  }
}
