import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EmailVerifyService } from './verify.service';
import { PasswordResetService } from './reset.service';
import { OTPService } from './otp.service';
import { ApplicatorAuthService } from './applicator-auth.service';
import { ApplicatorAuthController } from './applicator-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApplicatorJwtStrategy } from './strategies/applicator-jwt.strategy';

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
  providers: [
    AuthService,
    TokenService,
    ApplicatorJwtStrategy,
    JwtStrategy,
    EmailVerifyService,
    PasswordResetService,
    OTPService,
    ApplicatorAuthService,
  ],
  controllers: [AuthController, ApplicatorAuthController],
  exports: [AuthService, ApplicatorAuthService]
})
export class AuthModule {}