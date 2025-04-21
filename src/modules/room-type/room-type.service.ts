import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RoomType } from './room-type.entity';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { BadRequestException, NotFoundException } from '@/commons';

import { searchRoomTypeDto } from './dto/find-room-type.dto';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepo: Repository<RoomType>,
  ) {}

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    const roomType = this.roomTypeRepo.create(createRoomTypeDto);
    const roomTypeSaved = await this.roomTypeRepo.save(roomType);
    if (!roomTypeSaved) {
      throw new BadRequestException({ message: 'Tạo loại phòng thất bại' });
    }
    return roomTypeSaved;
  }

  async findAll(): Promise<RoomType[]> {
    return await this.roomTypeRepo.find();
  }

  async findOne(roomTypeId: string): Promise<RoomType> {
    const found = await this.roomTypeRepo.findOneBy({ roomTypeId });
    if (!found)
      throw new NotFoundException({ message: 'Không tìm thấy dịch vụ' });
    return found;
  }

  async update(
    id: string,
    updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    await this.findOne(id);
    await this.roomTypeRepo.update(id, updateRoomTypeDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.roomTypeRepo.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException({
          message: 'Không tìm thấy loại phòng để xoá',
        });
      }
    } catch (error) {
      throw new NotFoundException({
        message: 'Không tìm thấy loại phòng để xoá',
      });
    }
  }

  async search(searchRoomType: searchRoomTypeDto): Promise<RoomType[]> {
    const { searchData, status } = searchRoomType;

    const where: any = {};
    if (searchData) {
      where.roomTypeName = ILike(`%${searchData}%`);
    }
    if (status) {
      where.status = Number(status);
    }

    console.log('where', where);
    const roomTypes = await this.roomTypeRepo.find({ where });

    if (!roomTypes || roomTypes.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy loại phòng nào',
      });
    }

    console.log('roomTypes', roomTypes.length);

    return roomTypes;
  }
}
