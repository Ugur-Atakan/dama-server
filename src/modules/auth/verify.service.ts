// password-reset/password-reset.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EmailVerifyService {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  // E-posta doğrulama isteği kontrolü
  async checkVerifyRequest(email: string): Promise<any> {
    const verifyRequest = await this.prismaService.token.findFirst({
      where: {
        email: email,
      },
    });
    if (verifyRequest && moment().isBefore(verifyRequest.expires)) {
      return true;
    } else {
      return false;
    }
  }

  // E-posta doğrulama isteği gönderme
  async requestUserVerification(email: string): Promise<any> {
    const user = await this.userService.findOne(email);
    const checkResetRequest = await this.checkVerifyRequest(email);
    if (checkResetRequest) {
      throw new HttpException(
        'E-posta doğrulama isteği zaten gönderildi',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user) {
      const verifyToken = uuidv4();
      const verifyLink = `${process.env.SITE_URL}account/verify-email?token=${verifyToken}`;
      const fullName = user.firstName + ' ' + user.lastName;
      await this.prismaService.token.create({
        data: {
          id: uuidv4(),
          email: email,
          token: verifyToken,
          expires: moment().add(30, 'day').toDate(),
        },
      });
      // Kullanıcıya e-posta gönderme işlemini burada gerçekleştirin
      await this.mailService.sendEmailVerifyMail(
        user.email,
        fullName,
        verifyLink,
      );
      return {
        message: 'OK',
        status: 200,
      };
    } else {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }
  }
  // Doğrulama kodu geçerliliğini kontrol etme
  async verifyToken(token: string): Promise<string> {
    const verificationToken = await this.prismaService.token.findFirst({
      where: {
        token: token,
      },
    });

    if (!verificationToken || moment().isAfter(verificationToken.expires)) {
      throw new HttpException(
        'Geçersiz veya süresi dolmuş token',
        HttpStatus.BAD_REQUEST,
      );
    }
    return verificationToken.email;
  }
  // Doğrulama kodunu silme
  async deleteVerifyToken(token: string): Promise<void> {
    const resetToken = await this.prismaService.token.findFirst({
      where: {
        token: token,
      },
    });

    if (resetToken) {
      await this.prismaService.token.delete({
        where: {
          id: resetToken.id,
        },
      });
    }
  }

  // E-posta doğrulama
  async VerificationEmail(email: string, token: string): Promise<any> {
    if (token.length < 1) {
      throw new HttpException('Geçersiz token', HttpStatus.BAD_REQUEST);
    }
    const tokenEmail = await this.verifyToken(token);
    const user = await this.userService.findOne(email);
    if (user && user.email === tokenEmail) {
      await this.userService.verifyUserEmail(user.email);
      await this.deleteVerifyToken(token);
      return {
        message: 'E-posta başarıyla doğrulandı',
        status: 200,
      };
    } else {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }
  }

  async checkEmailisExist(email: string): Promise<{ exists: boolean; message: string }> {
    const user = await this.userService.findOne(email);
    if (user) {
      return { exists: true, message: 'Email is already registered.'};
    } else {
      return { exists: false, message: 'Email is available.' };
    }
  }
}
