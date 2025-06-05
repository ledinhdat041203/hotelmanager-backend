import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException, ServiceType } from '@/commons';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateCustomerDto } from '../customer/dto/update-customer.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { SearchServiceDto } from './dto/search-service.dto';
import { ImportServiceDto } from './dto/import-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    console.log(createServiceDto);

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

  async updateQuantity(
    importServiceDto: ImportServiceDto[],
  ): Promise<Service[]> {
    const updatedServices = await Promise.all(
      importServiceDto.map(async (item) => {
        const service = await this.findOne(item.serviceId);
        service.quantityInStock += item.quantity;
        if (
          service.quantityInStock < 0 &&
          service.type !== ServiceType.SERVICE
        ) {
          throw new BadRequestException({
            message: 'Hết hàng trong kho',
          });
        }
        return await this.serviceRepo.save(service);
      }),
    );

    return updatedServices;
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

  async search(searchDto: SearchServiceDto): Promise<Service[]> {
    const { name, type, inventory, status } = searchDto;

    const query = this.serviceRepo.createQueryBuilder('service');

    if (name) {
      query.andWhere('(unaccent(service.name) ILIKE unaccent(:name))', {
        name: `%${name}%`,
      });
    }

    if (type) {
      query.andWhere('(service.type::text ILIKE :type)', { type });
    }

    if (status !== undefined && status !== null) {
      query.andWhere('service.status = :status', { status: Number(status) });
    }

    if (inventory === 'Còn hàng trong kho') {
      query.andWhere('service.quantityInStock >0');
    } else if (inventory === 'Hết hàng trong kho') {
      query.andWhere('service.quantityInStock <= 0');
    } else if (inventory === 'Dưới định mức') {
      query.andWhere('service.quantityInStock < service.minimumStock');
    }
    const services = await query.getMany();

    if (!services || services.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy dịch vụ nào',
      });
    }

    return services;
  }
}
