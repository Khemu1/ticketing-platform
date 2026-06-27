import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings } from './entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookings])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
