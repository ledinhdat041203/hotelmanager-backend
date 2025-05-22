import { Injectable } from '@nestjs/common';
import { Room } from './room.entity';
import { ILike, Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomTypeService } from '../room-type/room-type.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@/commons';
import { UpdateRoomDto } from './dto/update-room.dto';
import { searchRoomDto } from './dto/search-room.dto';
import { RoomType } from '../room-type/room-type.entity';

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

  async findByRoomTypeId(roomTypeId: string, status: number): Promise<Room[]> {
    try {
      console.log(status);
      const rooms = await this.roomRepo.find({
        where: { roomType: { roomTypeId }, status },
        relations: ['roomType'],
      });

      if (!rooms || rooms.length === 0) {
        throw new NotFoundException({
          message: 'Không tìm thấy phòng nào thuộc loại phòng này',
        });
      }
      return rooms;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async findRoomTypeByRoomId(roomId: string): Promise<RoomType> {
    const room = await this.roomRepo.findOne({
      where: { roomId },
      relations: ['roomType'],
      select: ['roomType'],
    });

    return room.roomType;
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

    if (updateRoomDto.status !== undefined) {
      room.status = updateRoomDto.status;
    }

    if (updateRoomDto.state !== undefined) {
      room.state = updateRoomDto.state;
    }

    if (updateRoomDto.clean) {
      room.clean = updateRoomDto.clean;
    }
    console.log(updateRoomDto.clean);
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

  async search(searchRoom: searchRoomDto): Promise<Room[]> {
    const { searchData, status, state } = searchRoom;

    const query = this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .select([
        'room.roomId',
        'room.roomName',
        'room.status',
        'room.clean',
        'room.state',
        'roomType.roomTypeId',
        'roomType.roomTypeName',
        'roomType.priceByDay',
        'roomType.priceByHour',
        'roomType.priceOvernight',
      ])
      .orderBy('room.roomName', 'ASC');

    if (searchData) {
      query.andWhere(
        '(room.roomName ILIKE :searchData OR roomType.roomTypeName ILIKE :searchData)',
        { searchData: `%${searchData}%` },
      );
    }

    if (state) {
      query.andWhere('(room.state::text ILIKE :state)', { state });
    }

    if (status !== undefined && status !== null) {
      query.andWhere('room.status = :status', { status: Number(status) });
    }

    const rooms = await query.getMany();

    if (!rooms || rooms.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy phòng nào',
      });
    }

    return rooms;
  }
}
