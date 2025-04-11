import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@/commons';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Room } from '../room/room.entity';
import { RoomService } from '../room/room.service';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    private readonly roomService: RoomService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, unitPrice, quantity } = createBookingDto;

    const room = await this.roomService.findOne(roomId);

    const total = unitPrice * quantity;

    const booking = this.bookingRepo.create({
      ...createBookingDto,
      total,
      room,
    });

    const savedBooking = await this.bookingRepo.save(booking);

    if (!savedBooking) {
      throw new BadRequestException({ message: 'Tạo booking thất bại' });
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
    if (quantity !== undefined) booking.quantity = quantity;

    if (booking.unitPrice != null && booking.quantity != null) {
      booking.total = booking.unitPrice * booking.quantity;
    }

    const updatedBooking = await this.bookingRepo.save(booking);
    if (!updatedBooking) {
      throw new BadRequestException({ message: 'Cập nhật booking thất bại' });
    }
    return updatedBooking;
  }

  // async remove(roomId: string): Promise<void> {
  //   try {
  //     const result = await this.roomRepo.delete(roomId);

  //     if (result.affected === 0) {
  //       throw new NotFoundException({
  //         message: 'Không tìm thấy phòng để xoá',
  //       });
  //     }
  //   } catch (error) {
  //     throw new NotFoundException({
  //       message: 'Không tìm thấy phòng để xoá',
  //     });
  //   }
  // }
}
