import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(WhatsAppService.name);
  qrCode: string | null = null;

  constructor(private eventEmitter: EventEmitter2) {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }

  onModuleInit() {
    this.client.on('qr', (qr) => {
      this.logger.log('QR Kodu alındı, taramak için arayüzü kontrol edin.');
      this.eventEmitter.emit('qr', qr);
      this.qrCode = qr;
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp istemcisi hazır!');
    });

    this.client.on('message', (msg) => {
      this.logger.log(`Mesaj alındı:${JSON.stringify(msg)}, ${msg.body}`);
      if (msg.body === '!ping') {
        msg.reply('pong');
      }
    });

    this.client.initialize();
  }

  async sendMessage(number: string, message: string) {
    const chatId = `${number}@c.us`;
    await this.client.sendMessage(chatId, message);
  }

  async getQrCode() {
    return this.qrCode;
  }
}
