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
import { plainToInstance } from 'class-transformer';
import { CreatedResponse, SuccessfullyRespose } from '@/commons';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './service.entity';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create service' })
  async create(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<CreatedResponse<Service>> {
    const newService = await this.serviceService.create(createServiceDto);

    return new CreatedResponse({
      message: 'tạo loại phòng thành công',
      data: plainToInstance(Service, newService),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all service' })
  async findAll(): Promise<SuccessfullyRespose<Service[]>> {
    const services = await this.serviceService.findAll();
    return new SuccessfullyRespose({
      data: plainToInstance(Service, services),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<Service>> {
    const service = await this.serviceService.findOne(id);
    return new SuccessfullyRespose({
      data: plainToInstance(Service, service),
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<SuccessfullyRespose<Service>> {
    const updatedService = await this.serviceService.update(id, dto);
    return new SuccessfullyRespose({
      message: 'cập nhật loại phòng thành công',
      data: plainToInstance(Service, updatedService),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  async remove(@Param('id') id: string): Promise<SuccessfullyRespose<any>> {
    await this.serviceService.remove(id);
    return new SuccessfullyRespose({ message: 'Xoá dịch vụ thành công' });
  }
}
