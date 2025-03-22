import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { PrismaService } from 'src/prisma.service';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  private generateToken(user: Partial<SafeUser>, expiresIn: string) {
    const payload = { email: user.email, sub: user.id, roles: user.roles }; // 'sub' olarak kullanıcı ID'sini kullanıyoruz
    return this.jwtService.sign(payload, { expiresIn });
  }

  generateAccessToken(user: Partial<SafeUser>) {
    return this.generateToken(user, '1h');
  }

  generateRefreshToken(user: Partial<SafeUser>) {
    return this.generateToken(user, '7d');
  }

  refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      return this.generateAccessToken({
        email: decoded.email,
        id: decoded.sub,
        roles: decoded.roles,
      });
    } catch (e) {
      throw new HttpException('Refresh token is invalid or expired', 403);
    }
  }

  async deletePasswordResetToken(token: string): Promise<void> {
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

  async verifyPasswordResetToken(token: string): Promise<string> {
    const resetToken = await this.prismaService.token.findFirst({
      where: {
        token: token,
      },
    });

    if (!resetToken || moment().isAfter(resetToken.expires)) {
      throw new HttpException(
        'Geçersiz veya süresi dolmuş token',
        HttpStatus.BAD_REQUEST,
      );
    }
    return resetToken.email;
  }

 


  async cretePasswordResetToken(email: string): Promise<string> {
    const resetToken = uuidv4();
    await this.prismaService.token.create({
      data: {
        id: uuidv4(),
        email: email,
        token: resetToken,
        expires: moment().add(1, 'h').toDate(),
      },
    });

    return resetToken;
  }

  async createVerifyToken(email: string): Promise<string> {
    const verifyToken = uuidv4();
    await this.prismaService.token.create({
      data: {
        id: uuidv4(),
        email: email,
        token: verifyToken,
        expires: moment().add(3, 'day').toDate(),
      },
    });
    return verifyToken; 
  }

}

