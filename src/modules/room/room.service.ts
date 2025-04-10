import { Injectable } from '@nestjs/common';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomTypeService } from '../room-type/room-type.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@/commons';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,

    private readonly roomTypeService: RoomTypeService,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const roomType = await this.roomTypeService.findOne(
      createRoomDto.roomTypeId,
    );

    if (!roomType)
      throw new NotFoundException({ message: 'Loại phòng không tồn tại' });

    const room = this.roomRepo.create({
      roomName: createRoomDto.roomName,
      roomType,
    });

    const roomSaved = await this.roomRepo.save(room);

    if (!roomSaved) {
      throw new BadRequestException({ message: 'Tạo phòng thất bại' });
    }

    return roomSaved;
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepo.find({ relations: ['roomType'] });
  }

  async findOne(roomId: string): Promise<Room> {
    const room = await this.roomRepo.findOne({
      where: { roomId },
      relations: ['roomType'],
    });

    if (!room) throw new NotFoundException({ message: 'Phòng không tồn tại' });

    return room;
  }

  async update(roomId: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(roomId);

    if (updateRoomDto.roomName) {
      room.roomName = updateRoomDto.roomName;
    }

    if (updateRoomDto.roomTypeId) {
      const roomType = await this.roomTypeService.findOne(
        updateRoomDto.roomTypeId,
      );
      if (!roomType)
        throw new NotFoundException({ message: 'Loại phòng không tồn tại' });
      room.roomType = roomType;
    }

    const updatedRoom = await this.roomRepo.save(room);
    if (!updatedRoom) {
      throw new BadRequestException({ message: 'Cập nhật thất bại' });
    }

    return updatedRoom;
  }

  async remove(roomId: string): Promise<void> {
    try {
      const result = await this.roomRepo.delete(roomId);

      if (result.affected === 0) {
        throw new NotFoundException({
          message: 'Không tìm thấy phòng để xoá',
        });
      }
    } catch (error) {
      throw new NotFoundException({
        message: 'Không tìm thấy phòng để xoá',
      });
    }
  }
}
