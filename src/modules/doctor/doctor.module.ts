import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [DoctorService],
  controllers: [DoctorController],
  providers: [],
})
export class DoctorModule {}
