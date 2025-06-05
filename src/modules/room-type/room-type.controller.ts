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
import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { plainToInstance } from 'class-transformer';
import { RoomType } from './room-type.entity';
import { CreatedResponse, SuccessfullyRespose } from '@/commons';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { searchRoomTypeDto } from './dto/find-room-type.dto';
import { JWTAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Room Type')
@Controller('room-type')
@UseGuards(JWTAuthGuard)
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create room type' })
  async create(
    @Body() createRoomTypeDto: CreateRoomTypeDto,
  ): Promise<CreatedResponse<RoomType>> {
    const newRoomType = await this.roomTypeService.create(createRoomTypeDto);

    return new CreatedResponse({
      message: 'tạo loại phòng thành công',
      data: plainToInstance(RoomType, newRoomType),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all room types' })
  async findAll(): Promise<SuccessfullyRespose<RoomType[]>> {
    const roomTypes = await this.roomTypeService.findAll();
    return new SuccessfullyRespose({
      data: plainToInstance(RoomType, roomTypes),
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'search room type' })
  async search(
    @Query() searchRoomType: searchRoomTypeDto,
  ): Promise<SuccessfullyRespose<RoomType[]>> {
    console.log('searchRoomType', searchRoomType);
    const roomTypes = await this.roomTypeService.search(searchRoomType);
    return new SuccessfullyRespose({
      data: plainToInstance(RoomType, roomTypes),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room type by ID' })
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<RoomType>> {
    console.log('id', id);
    const roomType = await this.roomTypeService.findOne(id);
    return new SuccessfullyRespose({
      data: plainToInstance(RoomType, roomType),
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update room type' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomTypeDto,
  ): Promise<SuccessfullyRespose<RoomType>> {
    const updatedRoomType = await this.roomTypeService.update(id, dto);
    return new SuccessfullyRespose({
      message: 'cập nhật loại phòng thành công',
      data: plainToInstance(RoomType, updatedRoomType),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete room type' })
  async remove(@Param('id') id: string): Promise<SuccessfullyRespose<any>> {
    await this.roomTypeService.remove(id);
    return new SuccessfullyRespose({ message: 'Xoá loại phòng thành công' });
  }
}
