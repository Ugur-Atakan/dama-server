import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { PrismaService } from 'src/prisma.service';

// Basit bir 4 haneli OTP üreten fonksiyon
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

@Injectable()
export class OTPService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Belirtilen telefon numarası için OTP token oluşturur
  async generateOTPToken(telephone: string) {
    const now = new Date();
    // Aynı telefon numarasıyla daha önce oluşturulmuş tokenı kontrol ediyoruz
    const existingOtp = await this.prisma.oTPToken.findUnique({
      where: { telephone },
    });

    if (existingOtp) {
      // Eğer token süresi henüz dolmamışsa, yeni token oluşturmayı reddediyoruz
      if (existingOtp.expire > now) {
        throw new BadRequestException(
          'Önceden gönderilen OTP token hala geçerli, lütfen bekleyin.',
        );
      }

      // Süresi dolmuşsa, önceki tokenı siliyoruz
      await this.prisma.oTPToken.delete({ where: { id: existingOtp.id } });
    }

    // Yeni OTP token oluşturuyoruz
    const token = generateOTP();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 10); // OTP 10 dakika geçerli

    const otpToken = await this.prisma.oTPToken.create({
      data: {
        telephone,
        token,
        expire: expireTime,
      },
    });

    this.eventEmitter.emit(Events.OTP_REQUESTED, { phone: telephone, code: token });

    // SMS entegrasyonu burada eklenebilir
    return otpToken;
  }

  // Girilen token’ın doğruluğunu kontrol eder
  async verifyOTPToken(telephone: string, token: string): Promise<boolean> {
    const otpToken = await this.prisma.oTPToken.findUnique({
      where: { telephone },
    });

    if (!otpToken) {
      throw new BadRequestException('OTP token bulunamadı');
    }
    if (otpToken.token !== token) {
      throw new BadRequestException('Geçersiz OTP token');
    }
    if (otpToken.expire < new Date()) {
      throw new BadRequestException('OTP token süresi dolmuş');
    }

    // Doğrulama başarılı ise token'ı silebilirsin
    await this.prisma.oTPToken.delete({ where: { id: otpToken.id } });
    return true;
  }
}
