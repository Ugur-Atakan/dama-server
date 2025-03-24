import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [FormsService],
  controllers: [FormsController],
})
export class FormsModule {}
