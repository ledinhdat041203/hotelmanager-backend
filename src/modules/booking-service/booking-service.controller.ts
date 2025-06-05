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
import { CreateBookingServiceDto } from './dto/create-booking-service.dto';
import { BookingItem } from './booking-service.entity';
import { BookingItemService } from './booking-service.service';
import { UpdateBookingServiceDto } from './dto/update-booking-service.dto';
import * as dayjs from 'dayjs';
import 'dayjs/locale/vi'; // import tiếng Việt
import { JWTAuthGuard } from '../auth/passport/jwt-auth.guard';

dayjs.locale('vi'); // đặt locale mặc định

@ApiTags('Booking-service')
@Controller('booking-service')
@UseGuards(JWTAuthGuard)
export class BookingItemController {
  constructor(private readonly bookingItemService: BookingItemService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create booking item' })
  async create(
    @Body() createDto: CreateBookingServiceDto,
  ): Promise<CreatedResponse<BookingItem>> {
    console.log('create', createDto);
    const newBooking = await this.bookingItemService.create(createDto);

    return new CreatedResponse({
      message: 'Đặt phòng thành công',
      data: plainToInstance(BookingItem, newBooking),
    });
  }

  @Get('find-by-booking/:id')
  @ApiOperation({ summary: 'Get all booking' })
  async findByBooking(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<BookingItem[]>> {
    const bookings = await this.bookingItemService.findByBooking(id);

    return new SuccessfullyRespose({
      message: 'Lấy danh sách booking thành công',
      data: plainToInstance(BookingItem, bookings),
    });
  }

  // @Get('search')
  // @ApiOperation({ summary: 'search booking' })
  // async search(
  //   @Query() searchBookingDto: SearchBookingDto,
  // ): Promise<SuccessfullyRespose<Booking[]>> {
  //   console.log(searchBookingDto);
  //   const bookings = await this.bookingService.search(searchBookingDto);

  //   return new SuccessfullyRespose({
  //     message: 'Lấy thông tin phòng thành công',
  //     data: plainToInstance(Booking, bookings),
  //   });
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get booking by ID' })
  // async findOne(
  //   @Param('id') id: string,
  // ): Promise<SuccessfullyRespose<Booking>> {
  //   const booking = await this.bookingService.findOne(id);

  //   return new SuccessfullyRespose({
  //     message: 'Lấy thông tin booking thành công',
  //     data: booking,
  //   });
  // }

  @Get('get-count-service-by-type')
  @ApiOperation({ summary: 'Get count booking by channel' })
  async getCountServiceSoldByType(): Promise<SuccessfullyRespose<any>> {
    const todayStart = dayjs().startOf('day').toDate();
    const weekStart = dayjs().startOf('week').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.bookingItemService.countServicesSoldByType(todayStart, new Date()),
      this.bookingItemService.countServicesSoldByType(weekStart, new Date()),
      this.bookingItemService.countServicesSoldByType(monthStart, new Date()),
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

  @Get('get-top5-service')
  @ApiOperation({ summary: 'Get top 5 service' })
  async getTop5Service(): Promise<SuccessfullyRespose<any>> {
    const todayStart = dayjs().startOf('day').toDate();
    const weekStart = dayjs().startOf('week').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.bookingItemService.getTop5ServicesSold(todayStart, new Date()),
      this.bookingItemService.getTop5ServicesSold(weekStart, new Date()),
      this.bookingItemService.getTop5ServicesSold(monthStart, new Date()),
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

  @Get('get-booking-service-by-date')
  @ApiOperation({ summary: 'Get booking service by date' })
  async findBookingByDate(
    @Query('from') from: string,
    @Query('too') too: string,
  ): Promise<SuccessfullyRespose<any>> {
    console.log('from', from);
    console.log('too', too);
    const fromDate = dayjs(from).startOf('day').toDate();
    const toDate = dayjs(too).endOf('day').toDate();
    const bookings = await this.bookingItemService.findBookingServiceByDate(
      fromDate,
      toDate,
    );

    return new SuccessfullyRespose({
      message: 'Lấy thông tin thành công',
      data: plainToInstance(BookingItem, bookings),
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBookingServiceDto,
  ): Promise<SuccessfullyRespose<BookingItem>> {
    const updatedBooking = await this.bookingItemService.update(id, updateDto);

    return new SuccessfullyRespose({
      message: 'Cập nhật booking thành công',
      data: plainToInstance(BookingItem, updatedBooking),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete room by ID' })
  async delete(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<{ changeTotal: number }>> {
    const deleted = await this.bookingItemService.delete(id);

    return new SuccessfullyRespose({
      message: 'Xóa phòng thành công',
      data: deleted,
    });
  }
}
