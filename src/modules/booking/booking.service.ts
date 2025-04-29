import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
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

  async findBookedTimeSlots(
    roomId: string,
  ): Promise<{ checkInDate: Date; checkOutDate: Date }[]> {
    const currentDate = new Date();

    const bookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .select(['booking.checkInDate', 'booking.checkOutDate'])
      .where('booking.room.roomId = :roomId', { roomId })
      .andWhere('booking.checkOutDate >= :currentDate', { currentDate })
      .getMany();

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy khung giờ nào đã được đặt cho phòng này',
      });
    }

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
      .leftJoinAndSelect('booking.room', 'room');

    if (customerName) {
      query.andWhere(
        '(unaccent(booking.customerName) ILIKE unaccent(:customerName))',
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
    if (customerPaid < booking.totalPrice - booking.depositAmount) {
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
}
