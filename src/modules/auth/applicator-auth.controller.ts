import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ApplicatorAuthService } from './applicator-auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicatorJwtAuthGuard } from './guards/applicator-jwt-auth.guard';
import { GetApplicator } from 'src/common/decorators/applicator.decorator';
import { IsString } from 'class-validator';
import { ApplicatorRoute } from 'src/common/decorators/applicator-route.decorator';
import { UpdateApplicatorData } from 'src/dtos/applicator.dto';

// Create DTOs for applicator authentication
class VerifyOTPDto {
  @IsString()
  telephone: string;
  @IsString()
  token: string;
}

class GenerateOTPDto {
  @IsString()
  telephone: string;
}
class RefreshTokenDto {
  refreshToken: string;
}

@ApiTags('Applicator Authentication')
@Controller('applicator/auth')
export class ApplicatorAuthController {
  constructor(private readonly applicatorAuthService: ApplicatorAuthService) {}

  @ApiOperation({ summary: 'Generate OTP for applicator' })
  @Public()
  @Post('generate-otp')
  @HttpCode(HttpStatus.OK)
  async generateOTP(@Body() data: GenerateOTPDto) {
    const otp = await this.applicatorAuthService.generateOTP(data.telephone);
    return { message: 'OTP has been sent', otp };
  }

  @ApiOperation({ summary: 'Verify OTP and sign in applicator' })
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    const result = await this.applicatorAuthService.verifyOTPAndSignIn(
      verifyOTPDto.telephone,
      verifyOTPDto.token,
    );
    return {
      ...result,
    };
  }

  @ApiOperation({ summary: 'Refresh access token for applicator' })
  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() data: RefreshTokenDto) {
    const newToken = await this.applicatorAuthService.refreshAccessToken(
      data.refreshToken,
    );
    return {
      ...newToken,
      message: 'Token refreshed',
      code: HttpStatus.OK,
    };
  }

  @ApiOperation({ summary: 'Get current applicator profile' })
  // Artık sadece ApplicatorJwtAuthGuard kullanabiliriz, JwtAuthGuard bizi durdurmaz
  @UseGuards(ApplicatorJwtAuthGuard)
  // ApplicatorRoute decorator'ını ekliyoruz (controller seviyesinde eklenmemişse)
  @ApplicatorRoute()
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetApplicator() applicator) {
    return {
      ...applicator,
    };
  }

  @UseGuards(ApplicatorJwtAuthGuard)
  @ApplicatorRoute()
  @Patch('update-profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @GetApplicator() applicator,
    @Body() data: UpdateApplicatorData,
  ) {
    return await this.applicatorAuthService.updateApplicatorData(
      applicator.id,
      data,
    );
  }
}
