import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatedResponse, SuccessfullyRespose } from '@/commons';
import { plainToInstance } from 'class-transformer';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './booking.entity';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SearchBookingDto } from './dto/seach-booking.dto';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create booking' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<CreatedResponse<Booking>> {
    console.log('create', createBookingDto);
    const newBooking = await this.bookingService.create(createBookingDto);

    return new CreatedResponse({
      message: 'Đặt phòng thành công',
      data: plainToInstance(Booking, newBooking),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all booking' })
  async findAll(): Promise<SuccessfullyRespose<Booking[]>> {
    const booking = await this.bookingService.findAll();

    return new SuccessfullyRespose({
      message: 'Lấy danh sách booking thành công',
      data: plainToInstance(Booking, booking),
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'search booking' })
  async search(
    @Query() searchBookingDto: SearchBookingDto,
  ): Promise<SuccessfullyRespose<Booking[]>> {
    console.log(searchBookingDto);
    const bookings = await this.bookingService.search(searchBookingDto);

    return new SuccessfullyRespose({
      message: 'Lấy thông tin phòng thành công',
      data: plainToInstance(Booking, bookings),
    });
  }

  @Get('booked-time-slots/:roomId')
  @ApiOperation({ summary: 'Get booked time slots for a room' })
  async findBookedTimeSlots(
    @Param('roomId') roomId: string,
  ): Promise<SuccessfullyRespose<{ checkInDate: Date; checkOutDate: Date }[]>> {
    const bookedTimeSlots =
      await this.bookingService.findBookedTimeSlots(roomId);

    return new SuccessfullyRespose({
      message: 'Lấy danh sách khung giờ đã được đặt thành công',
      data: bookedTimeSlots,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<Booking>> {
    const booking = await this.bookingService.findOne(id);

    return new SuccessfullyRespose({
      message: 'Lấy thông tin booking thành công',
      data: plainToInstance(Booking, booking),
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<SuccessfullyRespose<Booking>> {
    const updatedBooking = await this.bookingService.update(
      id,
      updateBookingDto,
    );

    return new SuccessfullyRespose({
      message: 'Cập nhật booking thành công',
      data: plainToInstance(Booking, updatedBooking),
    });
  }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete room by ID' })
  // async delete(@Param('id') id: string): Promise<SuccessfullyRespose<null>> {
  //   await this.roomService.remove(id);

  //   return new SuccessfullyRespose({
  //     message: 'Xóa phòng thành công',
  //     data: null,
  //   });
  // }
}
