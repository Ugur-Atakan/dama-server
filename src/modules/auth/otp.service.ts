import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { PrismaService } from 'src/prisma.service';

// Generate a 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate a unique application number
function generateApplicationNumber(): string {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `APP-${timestamp}-${random}`;
}

@Injectable()
export class OTPService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Generate OTP token for the telephone number
  async generateOTPToken(telephone: string) {
    const now = new Date();
    // Check for existing token
    const existingOtp = await this.prisma.oTPToken.findUnique({
      where: { telephone },
    });

    if (existingOtp) {
      // If token is still valid, reject creating a new one
      if (existingOtp.expire > now) {
        throw new BadRequestException(
          'Önceden gönderilen OTP token hala geçerli, lütfen bekleyin.',
        );
      }

      // Delete expired token
      await this.prisma.oTPToken.delete({ where: { id: existingOtp.id } });
    }

    // Create new OTP token
    const token = generateOTP();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 10); // 10 minutes validity

    // Emit event for OTP generation
    this.eventEmitter.emit(Events.OTP_REQUESTED, {
      telephone,
      code: token,
    });
    // SMS integration can be added here
    return 'OTP sent successfully';
  }

  // Verify OTP token and create/update applicator
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

    // Delete the token once verified
    await this.prisma.oTPToken.delete({ where: { id: otpToken.id } });

  return true;
  }
}