import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatedResponse, SuccessfullyRespose } from '@/commons';
import { plainToInstance } from 'class-transformer';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './booking.entity';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SearchBookingDto } from './dto/seach-booking.dto';

import * as dayjs from 'dayjs';
import 'dayjs/locale/vi'; // import tiếng Việt
import { from } from 'form-data';
import { JWTAuthGuard } from '../auth/passport/jwt-auth.guard';

dayjs.locale('vi'); // đặt locale mặc định

@ApiTags('Booking')
@Controller('booking')
@UseGuards(JWTAuthGuard)
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
    console.log('========', bookedTimeSlots);
    return new SuccessfullyRespose({
      message: 'Lấy danh sách khung giờ đã được đặt thành công',
      data: bookedTimeSlots,
    });
  }

  @Get('get-revenue')
  @ApiOperation({ summary: 'Get revenue' })
  async getOverview(): Promise<SuccessfullyRespose<any>> {
    const revenueLast30Days = await this.bookingService.getRevenueLast30Days();
    const revenueThisWeek = await this.bookingService.getRevenueThisWeek();
    const revenueThisYear = await this.bookingService.getRevenueThisYear();
    const revenueThisMonth = await this.bookingService.getRevenueThisMonth();
    const revenueLastMonth = await this.bookingService.getRevenueLastMonth();
    return new SuccessfullyRespose({
      message: 'Lấy thông tin thành công',
      data: {
        revenueLast30Days,
        revenueThisWeek,
        revenueThisYear,
        revenueThisMonth,
        revenueLastMonth,
      },
    });
  }

  @Get('get-count-booking')
  @ApiOperation({ summary: 'Get count booking' })
  async getCountBooking(): Promise<SuccessfullyRespose<any>> {
    const todayStart = dayjs().startOf('day').toDate();
    const weekStart = dayjs().startOf('week').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.bookingService.getBookingsCount(todayStart, new Date()),
      this.bookingService.getBookingsCount(weekStart, new Date()),
      this.bookingService.getBookingsCount(monthStart, new Date()),
    ]);

    return new SuccessfullyRespose({
      message: 'Lấy thông tin thành công',
      data: {
        today: todayStats,
        week: weekStats,
        month: monthStats,
      },
    });
  }

  @Get('get-count-by-channel')
  @ApiOperation({ summary: 'Get count booking by channel' })
  async getCountBookingByChannel(): Promise<SuccessfullyRespose<any>> {
    const todayStart = dayjs().startOf('day').toDate();
    const weekStart = dayjs().startOf('week').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.bookingService.getBookingsCountByChannel(todayStart, new Date()),
      this.bookingService.getBookingsCountByChannel(weekStart, new Date()),
      this.bookingService.getBookingsCountByChannel(monthStart, new Date()),
    ]);

    return new SuccessfullyRespose({
      message: 'Lấy thông tin thành công',
      data: {
        today: todayStats,
        week: weekStats,
        month: monthStats,
      },
    });
  }

  @Get('get-booking-by-date')
  @ApiOperation({ summary: 'Get booking by date' })
  async findBookingByDate(
    @Query('from') from: string,
    @Query('too') too: string,
  ): Promise<SuccessfullyRespose<Booking[]>> {
    console.log('from', from);
    console.log('too', too);
    const fromDate = dayjs(from).startOf('day').toDate();
    const toDate = dayjs(too).endOf('day').toDate();
    const bookings = await this.bookingService.findBookingByDate(
      fromDate,
      toDate,
    );

    return new SuccessfullyRespose({
      message: 'Lấy thông tin thành công',
      data: plainToInstance(Booking, bookings),
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
      data: booking,
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

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Checkin Booking' })
  async checkinBooking(
    @Param('id') bookingId: string,
  ): Promise<SuccessfullyRespose<Booking>> {
    const booking = await this.bookingService.checkin(bookingId);

    return new SuccessfullyRespose({
      message: 'Nhận phòng thành công',
      data: booking,
    });
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Booking payment' })
  async payBooking(
    @Param('id') bookingId: string,
    @Body('customerPaid') customerPaid: number,
  ): Promise<SuccessfullyRespose<Booking>> {
    console.log('create', customerPaid);
    const booking = await this.bookingService.payBooking(
      bookingId,
      customerPaid,
    );

    return new SuccessfullyRespose({
      message: 'Thanh toán thành công',
      data: booking,
    });
  }

  @Delete(':id/cancel')
  async cancelBooking(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<Booking>> {
    const cancelled = await this.bookingService.cancelBooking(id);
    return new SuccessfullyRespose({
      message: 'Hủy đơn thành công',
      data: cancelled,
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
