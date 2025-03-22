import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StripeService } from '../stripe/stripe.service';

@Module({
  providers: [UserService,StripeService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
