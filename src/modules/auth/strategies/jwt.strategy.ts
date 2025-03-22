import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './../auth.service';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<SafeUser> {
    const user = await this.authService.validateJwtPayload(payload.email);
    if (!user) {
       throw new HttpException(
        'Forbidden',
        HttpStatus.FORBIDDEN,
      );
    }
    return user;
  }
}