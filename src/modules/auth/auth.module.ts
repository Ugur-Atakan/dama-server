import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EmailVerifyService } from './verify.service';
import { PasswordResetService } from './reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OTPService } from './otp.service';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
  providers: [AuthService, TokenService,JwtStrategy,EmailVerifyService,PasswordResetService,OTPService],
  controllers: [AuthController],
})
export class AuthModule {}
