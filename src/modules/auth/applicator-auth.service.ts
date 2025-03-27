import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { OTPService } from './otp.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/event.enum';
import { TokenService } from './token.service';
import { ApplicationService } from '../application/application.service';
import { UpdateApplicatorData } from 'src/dtos/applicator.dto';

@Injectable()
export class ApplicatorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OTPService,
    private readonly applicationService: ApplicationService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Generate OTP for applicator authentication
  async generateOTP(telephone: string) {
    return this.otpService.generateOTPToken(telephone);
  }

  // Verify OTP and sign in applicator or create if doesn't exist
  async verifyOTPAndSignIn(telephone: string, token: string) {
    // Verify the OTP token
    const isValid = await this.otpService.verifyOTPToken(telephone, token);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Find or create applicator with application and appointments
    let applicator = await this.prisma.applicator.findUnique({
      where: { telephone },
      include: {
        application: true,
        appointments: true
      }
    });

    if (!applicator) {
      // This might be handled in the OTP service already, but just in case
      const newApplicator = await this.prisma.applicator.create({
        data: {
          telephone,
        },
      });
      
      this.applicationService.createApplication(newApplicator.id);
      // After creation, fetch with related data
      applicator = await this.prisma.applicator.findUnique({
        where: { id: newApplicator.id },
        include: {
          application: true,
          appointments: true
        }
      });
    }

    // Generate tokens with application and appointments data included
    const accessToken = this.generateAccessToken(applicator);
    const refreshToken = this.generateRefreshToken(applicator);

    // Emit login event if needed
    this.eventEmitter.emit(Events.APPLICATOR_LOGIN, { telephone: applicator.telephone });

    return {
      applicator, // This now includes application and appointments
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Generate access token for applicator
  generateAccessToken(applicator: any) {
    // Create a copy of the applicator with only needed fields to keep the token size manageable
    const applicatorData = {
      id: applicator.id,
      telephone: applicator.telephone,
      firstName: applicator.firstName,
      lastName: applicator.lastName,
      email: applicator.email,
      status: applicator.status,
      // Include basic application data
      application: applicator.application ? {
        id: applicator.application.id,
        applicationNumber: applicator.application.applicationNumber,
        status: applicator.application.status
      } : null,
      // Include basic appointment data
      appointments: applicator.appointments ? 
        applicator.appointments.map(app => ({
          id: app.id,
          // Add other essential appointment fields here
        })) : []
    };
    
    const payload = { 
      telephone: applicator.telephone, 
      sub: applicator.id,
      type: 'applicator', // Useful to distinguish between user and applicator tokens
      applicatorData // Add the applicator data with related entities
    };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  // Generate refresh token for applicator
  generateRefreshToken(applicator: any) {
    // For refresh token, we don't need to include all the data
    const payload = { 
      telephone: applicator.telephone, 
      sub: applicator.id,
      type: 'applicator'
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  // Refresh access token using refresh token
  refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      
      // Make sure it's an applicator token
      if (decoded.type !== 'applicator') {
        throw new UnauthorizedException('Invalid token type');
      }
      
      return {
        accessToken: this.jwtService.sign(
          { 
            telephone: decoded.telephone, 
            sub: decoded.sub,
            type: 'applicator'
          },
          { expiresIn: '1h' }
        ),
      };
    } catch (e) {
      throw new HttpException('Refresh token is invalid or expired', 403);
    }
  }

  // Validate applicator from JWT payload (used by strategy)
  async validateApplicator(payload: any) {
    // Make sure it's an applicator token
    if (payload.type !== 'applicator') {
      return null;
    }
    
    const applicator = await this.prisma.applicator.findUnique({
      where: { id: payload.sub },
      include: {
        application: true,
        appointments: true
      }
    });
    
    if (!applicator) {
      throw new UnauthorizedException();
    }
    
    return applicator;
  }


  async updateApplicatorData(applicatorId: string, data: UpdateApplicatorData) {
   return await this.prisma.applicator.update({
      where: { id: applicatorId },
      data:{...data}
    });
  }
}