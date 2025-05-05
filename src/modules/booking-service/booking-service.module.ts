import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingItem } from './booking-service.entity';
import { BookingItemService } from './booking-service.service';
import { BookingItemController } from './booking-service.controller';
import { BookingModule } from '../booking/booking.module';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingItem]),
    BookingModule,
    ServiceModule,
  ],
  providers: [BookingItemService],
  controllers: [BookingItemController],
  exports: [BookingItemService],
})
export class BookingItemModule {}
