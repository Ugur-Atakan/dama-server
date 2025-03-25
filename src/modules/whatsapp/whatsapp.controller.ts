import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { SendMessageDto } from 'src/dtos/whatsapp.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('bot')
export class WhatsAppController {

  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Public()
  @Post('send-message')
  async sendMessage(@Body() body:SendMessageDto) {
    const { number, message } = body;
    await this.whatsAppService.sendMessage(number, message);
    return { status: 'Mesaj gönderildi' };
  }

  @Public()
  @Get('qr-code')
  async getQrCode(@Res() res: Response) {
   const qr= await this.whatsAppService.getQrCode();
    res.setHeader('Content-Type', 'image/png');
    QRCode.toFileStream(res, qr);
  }

}
