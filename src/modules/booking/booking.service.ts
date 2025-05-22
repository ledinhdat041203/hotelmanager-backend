import { Injectable } from '@nestjs/common';
import {
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  BookingStatus,
  NotFoundException,
} from '@/commons';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Room } from '../room/room.entity';
import { RoomService } from '../room/room.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateRoomDto } from '../room/dto/update-room.dto';
import { RoomState } from '@/commons/types/room-state-enum';
import { SearchBookingDto } from './dto/seach-booking.dto';
import { RoomClean } from '@/commons/types/room-clean-enum';
import * as dayjs from 'dayjs';
import 'dayjs/locale/vi'; // import tiếng Việt

dayjs.locale('vi'); // đặt locale mặc định

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    private readonly roomService: RoomService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, unitPrice, quantity, checkInDate, checkOutDate, status } =
      createBookingDto;

    const room = await this.roomService.findOne(roomId);

    // const totalPrice = unitPrice * quantity;

    const booking = this.bookingRepo.create({
      ...createBookingDto,
      room,
    });

    const savedBooking = await this.bookingRepo.save(booking);

    if (!savedBooking) {
      throw new BadRequestException({ message: 'Tạo booking thất bại' });
    }
    if (room.state !== RoomState.IN_USE) {
      const updateRoomDto = new UpdateRoomDto();
      updateRoomDto.state =
        status === 'Đã nhận phòng' ? RoomState.IN_USE : RoomState.PENDING;

      await this.roomService.update(roomId, updateRoomDto);
    }

    return savedBooking;
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
    });

    if (!booking)
      throw new NotFoundException({ message: 'Đơn đặt phòng không tồn tại' });

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    if (
      updateBookingDto.roomId &&
      updateBookingDto.roomId !== booking.room?.roomId
    ) {
      const room = await this.roomService.findOne(updateBookingDto.roomId);
      booking.room = room;
    }

    const { roomId, unitPrice, quantity, ...rest } = updateBookingDto;
    Object.assign(booking, rest);

    if (unitPrice !== undefined) booking.unitPrice = unitPrice;

    const updatedBooking = await this.bookingRepo.save(booking);
    if (!updatedBooking) {
      throw new BadRequestException({ message: 'Cập nhật booking thất bại' });
    }
    return updatedBooking;
  }

  async updateTotalServicePrice(
    id: string,
    addPrice: number,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    booking.totalServicePrice += addPrice;

    const updatedBooking = await this.bookingRepo.save(booking);
    if (!updatedBooking) {
      throw new BadRequestException({ message: 'Cập nhật booking thất bại' });
    }
    return updatedBooking;
  }

  async findBookedTimeSlots(
    roomId: string,
  ): Promise<{ checkInDate: Date; checkOutDate: Date }[]> {
    const currentDate = new Date();

    const bookings = await this.bookingRepo
      .createQueryBuilder('booking')
      // .select(['booking.checkInDate', 'booking.checkOutDate'])
      .where('booking.room.roomId = :roomId', { roomId })
      .andWhere('booking.checkOutDate >= :currentDate', { currentDate })
      .andWhere('booking.status::text != :canceledStatus', {
        canceledStatus: 'Đã hủy',
      })
      .andWhere('booking.status::text != :checkedOutStatus', {
        checkedOutStatus: 'Đã trả phòng',
      })
      .getMany();

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy khung giờ nào đã được đặt cho phòng này',
      });
    }

    // console.log('=======', bookings);

    return bookings.map((booking) => ({
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    }));
  }

  async findBookingByRoom(roomId: string): Promise<Booking[]> {
    const now = new Date();
    const bookings = await this.bookingRepo.find({
      where: {
        room: { roomId },
        checkInDate: MoreThan(now),
        status: BookingStatus.PENDING,
      },
    });

    return bookings;
  }

  async search(seachBookingDto: SearchBookingDto): Promise<Booking[]> {
    const { customerName, roomName, channel, status } = seachBookingDto;
    const now = new Date();

    const query = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.room', 'room')

    if (customerName) {
      query.andWhere(
        '(unaccent(booking.customerName) ILIKE unaccent(:customerName)) \
        OR (booking.cccd ILIKE :customerName) ',
        {
          customerName: `%${customerName}%`,
        },
      );
    }

    if (roomName) {
      query.andWhere('(unaccent(room.roomName) ILIKE unaccent(:roomName))', {
        roomName: `%${roomName}%`,
      });
    }

    if (channel) {
      query.andWhere('(booking.channel::text ILIKE :channel)', {
        channel: `%${channel}%`,
      });
    }

    if (status) {
      query.andWhere('booking.status IN (:...status)', { status });
    }

    const bookings = await query.getMany();

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy đặt phòng nào',
      });
    }

    return bookings;
  }

  async checkin(bookingId: string): Promise<Booking> {
    const booking = await this.findOne(bookingId);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException({ message: 'Không thể nhận phòng lại' });
    }

    const room = booking.room;
    if (room.state === RoomState.IN_USE) {
      throw new BadRequestException({ message: 'Phòng đang được sử dụng' });
    }

    booking.status = BookingStatus.CHECKED_IN;
    const updatedBooking = await this.bookingRepo.save(booking);
    if (updatedBooking) {
      const updateDto = new UpdateRoomDto();
      updateDto.state = RoomState.IN_USE;
      await this.roomService.update(room.roomId, updateDto);

      return updatedBooking;
    } else {
      throw new BadRequestException({ message: 'Nhận phòng thất bại' });
    }
  }

  async payBooking(bookingId: string, customerPaid: number): Promise<Booking> {
    const booking = await this.findOne(bookingId);
    if (booking.status === BookingStatus.CHECKED_OUT) {
      throw new BadRequestException({ message: 'Đơn đã thanh toán' });
    }
    if (
      customerPaid <
      booking.totalPrice + booking.totalServicePrice - booking.depositAmount
    ) {
      throw new BadRequestException({ message: 'Số tiền không đủ' });
    }

    booking.status = BookingStatus.CHECKED_OUT;
    const updatedBooking = await this.bookingRepo.save(booking);
    if (updatedBooking) {
      const room = booking.room;
      const updateDto = new UpdateRoomDto();
      const bookings = await this.findBookingByRoom(room.roomId);
      if (bookings.length === 0) {
        updateDto.state = RoomState.AVAILABLE;
      } else {
        updateDto.state = RoomState.PENDING;
      }

      updateDto.clean = RoomClean.DIRTY;
      await this.roomService.update(room.roomId, updateDto);

      return updatedBooking;
    } else {
      throw new BadRequestException({ message: 'Thanh toán thất bại' });
    }
  }
  async cancelBooking(bookingId: string): Promise<Booking> {
    const booking = await this.findOne(bookingId);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException({ message: 'Không thể hủy đơn này' });
    }

    booking.status = BookingStatus.CANCELED;
    const cancelledBooking = await this.bookingRepo.save(booking);

    if (cancelledBooking) {
      const room = booking.room;
      const updateDto = new UpdateRoomDto();
      const bookings = await this.findBookingByRoom(room.roomId);
      if (bookings.length === 0) {
        updateDto.state = RoomState.AVAILABLE;
      } else {
        updateDto.state = RoomState.PENDING;
      }
      await this.roomService.update(room.roomId, updateDto);
      return cancelledBooking;
    } else {
      throw new BadRequestException({ message: 'Thanh toán thất bại' });
    }
  }

  async getBookingsCount(from: Date, to: Date) {
    const rawRevenue = await this.bookingRepo.query(
      `
      SELECT 
        SUM("totalPrice" + "totalServicePrice") as revenue
      FROM bookings
      WHERE status = 'Đã trả phòng' 
        AND DATE("checkOutDate") BETWEEN $1 AND $2
    `,
      [from, to],
    );

    const rawCountBooking = await this.bookingRepo.query(
      `
      SELECT COUNT(id) as countBooking
      FROM bookings

      WHERE DATE("createdAt") BETWEEN $1 AND $2
    `,
      [from, to],
    );

    const rawCountCancel = await this.bookingRepo.query(
      `
      SELECT COUNT(id) as countBooking
      FROM bookings
      WHERE DATE("updatedAt") BETWEEN $1 AND $2 
        AND status = 'Đã hủy'
    `,
      [from, to],
    );

    const revenue = +rawRevenue[0].revenue;
    const countBooking = +rawCountBooking[0].countbooking;
    const countCancel = +rawCountCancel[0].countbooking;

    return { revenue, countBooking, countCancel };
  }

  async getRevenueLast30Days() {
    // Lấy dữ liệu doanh thu theo ngày từ DB
    const raw = await this.bookingRepo.query(`
      SELECT 
        DATE("checkOutDate") as day, 
        SUM("totalPrice" + "totalServicePrice") as revenue
      FROM bookings
      WHERE status = 'Đã trả phòng' 
        AND "checkOutDate" >= NOW() - INTERVAL '30 days'
      GROUP BY day
    `);

    // Map doanh thu theo ngày dạng 'YYYY-MM-DD'
    const revenueMap = new Map(
      raw.map((item) => [dayjs(item.day).format('YYYY-MM-DD'), +item.revenue]),
    );

    // Tạo danh sách 30 ngày gần nhất
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const date = dayjs().subtract(29 - i, 'day'); // từ 29 ngày trước tới hôm nay
      const key = date.format('YYYY-MM-DD');
      return {
        label: date.format('DD/MM'),
        revenue: revenueMap.get(key) || 0,
      };
    });

    return last30Days;
  }

  async getRevenueThisWeek() {
    const raw = await this.bookingRepo.query(`
      SELECT 
        TO_CHAR("checkOutDate", 'YYYY-MM-DD') as day,
        SUM("totalPrice" + "totalServicePrice") as revenue
      FROM bookings
      WHERE status = 'Đã trả phòng'
        AND "checkOutDate" >= DATE_TRUNC('week', NOW())
        AND "checkOutDate" < DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
      GROUP BY day
      ORDER BY day
    `);

    const startOfWeek = dayjs().startOf('week');

    const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
      const date = startOfWeek.add(index, 'day');
      return {
        day: date.format('YYYY-MM-DD'),
        label: date.format('dddd'),
        revenue: 0,
      };
    });

    // Gán dữ liệu từ raw vào danh sách mặc định
    raw.forEach((item) => {
      const found = daysOfWeek.find((d) => d.day === item.day);
      if (found) {
        found.revenue = +item.revenue;
      }
    });

    return daysOfWeek.map(({ label, revenue }) => ({ label, revenue }));
  }

  async getRevenueThisMonth() {
    const raw = await this.bookingRepo.query(`
      SELECT 
        TO_CHAR("checkOutDate", 'YYYY-MM-DD') as day,
        SUM("totalPrice" + "totalServicePrice") as revenue
      FROM bookings
      WHERE status = 'Đã trả phòng' 
        AND "checkOutDate" >= DATE_TRUNC('month', NOW())
      GROUP BY day
      ORDER BY day
    `);

    const revenueMap = new Map<string, number>();
    raw.forEach((item) => {
      revenueMap.set(item.day, +item.revenue);
    });

    const today = dayjs();
    const daysInMonth = today.daysInMonth();
    const startOfMonth = today.startOf('month');

    const result = Array.from({ length: daysInMonth }, (_, i) => {
      const date = startOfMonth.add(i, 'day');
      const dayStr = date.format('YYYY-MM-DD');
      return {
        label: date.format('DD/MM'),
        revenue: revenueMap.get(dayStr) || 0,
      };
    });

    return result;
  }

  async getRevenueLastMonth() {
    const raw = await this.bookingRepo.query(`
      SELECT 
        TO_CHAR("checkOutDate", 'YYYY-MM-DD') as day,
        SUM("totalPrice" + "totalServicePrice") as revenue
      FROM bookings
      WHERE status = 'Đã trả phòng' 
        AND "checkOutDate" >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
        AND "checkOutDate" < DATE_TRUNC('month', NOW())
      GROUP BY day
      ORDER BY day
    `);

    const revenueMap = new Map<string, number>();
    raw.forEach((item) => {
      revenueMap.set(item.day, +item.revenue);
    });

    const lastMonth = dayjs().subtract(1, 'month');
    const daysInLastMonth = lastMonth.daysInMonth();
    const startOfLastMonth = lastMonth.startOf('month');

    const result = Array.from({ length: daysInLastMonth }, (_, i) => {
      const date = startOfLastMonth.add(i, 'day');
      const dayStr = date.format('YYYY-MM-DD');
      return {
        label: date.format('DD/MM'),
        revenue: revenueMap.get(dayStr) || 0,
      };
    });

    return result;
  }

  async getRevenueThisYear() {
    const raw = await this.bookingRepo.query(`
      SELECT 
        EXTRACT(MONTH FROM "checkOutDate") as month, 
        SUM("totalPrice" + "totalServicePrice") as revenue
      FROM bookings
      WHERE status = 'Đã trả phòng' 
        AND "checkOutDate" >= DATE_TRUNC('year', NOW())
      GROUP BY month
      ORDER BY month
    `);

    const revenueMap = new Map<number, number>();
    raw.forEach((item) => {
      revenueMap.set(+item.month, +item.revenue);
    });

    const result = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        label: `Tháng ${month}`,
        revenue: revenueMap.get(month) || 0,
      };
    });

    return result;
  }

  async getBookingsCountByChannel(from: Date, to: Date) {
    const rawCountBooking = await this.bookingRepo.query(
      `
      SELECT COUNT(id) as count, channel
      FROM bookings
      WHERE DATE("createdAt") BETWEEN $1 AND $2
        AND status = 'Đã trả phòng'
      GROUP BY channel
      `,
      [from, to],
    );

    const result: Record<string, number> = {};
    rawCountBooking.forEach((row) => {
      result[row.channel] = +row.count;
    });

    return result;
  }

  async findBookingByDate(from: Date, to: Date): Promise<Booking[]> {
    const bookings = await this.bookingRepo.find({
      where: {
        checkInDate: MoreThanOrEqual(from),
        checkOutDate: LessThanOrEqual(to),
        status: BookingStatus.CHECKED_OUT,
      },
    });

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy đặt phòng nào',
      });
    }

    return bookings;
  }
}
