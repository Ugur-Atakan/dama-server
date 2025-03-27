import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ApplicatorAuthService } from '../applicator-auth.service';

@Injectable()
export class ApplicatorJwtStrategy extends PassportStrategy(Strategy, 'applicator-jwt') {
  constructor(private readonly applicatorAuthService: ApplicatorAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('ApplicatorJwtStrategy payload', payload);
    // First check if this is an applicator token
    if (payload.type !== 'applicator') {
      throw new HttpException('Invalid token type', HttpStatus.FORBIDDEN);
    }
    
    const applicator = await this.applicatorAuthService.validateApplicator(payload);
    if (!applicator) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return applicator;
  }
}