import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@/commons';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Room } from '../room/room.entity';
import { RoomService } from '../room/room.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateRoomDto } from '../room/dto/update-room.dto';
import { RoomState } from '@/commons/types/room-state-enum';

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

    const updateRoomDto = new UpdateRoomDto();
    updateRoomDto.state =
      status === 'Đã nhận phòng' ? RoomState.IN_USE :  RoomState.PENDING;

    await this.roomService.update(roomId, updateRoomDto);

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
