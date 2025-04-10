import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BadRequestException } from '@/commons';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(customerData: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(customerData);
    const savedCustommer = await this.customerRepository.save(customer);
    if (!savedCustommer) {
      throw new BadRequestException({
        message: 'Tạo khách hàng thất bại',
      });
    }
    return savedCustommer;
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find();
  }

  async findOne(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
    });
    if (!customer) {
      throw new BadRequestException({
        message: 'Không tìm thấy khách hàng',
      });
    }
    return customer;
  }

  async update(
    customerId: string,
    customerData: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.customerRepository.update(customerId, customerData);
    return this.findOne(customerId);
  }

  async remove(customerId: string): Promise<void> {
    await this.findOne(customerId);
    const result = await this.customerRepository.delete(customerId);

    if (result.affected === 0) {
      throw new BadRequestException({
        message: 'Không tìm thấy khách hàng để xoá',
      });
    }
  }
}
