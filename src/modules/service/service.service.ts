import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@/commons';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateCustomerDto } from '../customer/dto/update-customer.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepo.create(createServiceDto);
    const serviceSaved = await this.serviceRepo.save(service);

    if (!serviceSaved) {
      throw new BadRequestException({ message: 'Thêm dịch vụ thất bại' });
    }
    return serviceSaved;
  }

  async findAll(): Promise<Service[]> {
    return await this.serviceRepo.find();
  }

  async findOne(id: string): Promise<Service> {
    const found = await this.serviceRepo.findOneBy({ id });
    if (!found)
      throw new NotFoundException({ message: 'Không tìm thấy phòng' });
    return found;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    // await this.findOne(id);
    await this.serviceRepo.update(id, updateServiceDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.serviceRepo.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException({
          message: 'Không tìm dịch vụ để xoá',
        });
      }
    } catch (error) {
      throw new NotFoundException({
        message: 'Không tìm thấy dịch vụ để xoá',
      });
    }
  }
}
