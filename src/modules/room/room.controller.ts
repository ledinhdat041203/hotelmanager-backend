import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreatedResponse, SuccessfullyRespose } from '@/commons';
import { Room } from './room.entity';
import { plainToInstance } from 'class-transformer';

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create room' })
  async create(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<CreatedResponse<Room>> {
    const newRoom = await this.roomService.create(createRoomDto);

    return new CreatedResponse({
      message: 'tạo phòng thành công',
      data: plainToInstance(Room, newRoom),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  async findAll(): Promise<SuccessfullyRespose<Room[]>> {
    const rooms = await this.roomService.findAll();

    return new SuccessfullyRespose({
      message: 'Lấy danh sách phòng thành công',
      data: plainToInstance(Room, rooms),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  async findOne(@Param('id') id: string): Promise<SuccessfullyRespose<Room>> {
    const room = await this.roomService.findOne(id);

    return new SuccessfullyRespose({
      message: 'Lấy thông tin phòng thành công',
      data: plainToInstance(Room, room),
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update room by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<SuccessfullyRespose<Room>> {
    const updatedRoom = await this.roomService.update(id, updateRoomDto);

    return new SuccessfullyRespose({
      message: 'Cập nhật phòng thành công',
      data: plainToInstance(Room, updatedRoom),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete room by ID' })
  async delete(@Param('id') id: string): Promise<SuccessfullyRespose<null>> {
    await this.roomService.remove(id);

    return new SuccessfullyRespose({
      message: 'Xóa phòng thành công',
      data: null,
    });
  }
}
