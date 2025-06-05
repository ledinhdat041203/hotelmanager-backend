import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatedResponse, SuccessfullyRespose } from '@/commons';
import { Customer } from './customer.entity';
import { plainToInstance } from 'class-transformer';
import { JWTAuthGuard } from '../auth/passport/jwt-auth.guard';

@ApiTags('Customer')
@Controller('customer')
@UseGuards(JWTAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create customer' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CreatedResponse<Customer>> {
    const newCustomer = await this.customerService.create(createCustomerDto);

    return new CreatedResponse({
      message: 'Tạo khách hàng thành công',
      data: plainToInstance(Customer, newCustomer),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  async findAll(): Promise<SuccessfullyRespose<Customer[]>> {
    const customers = await this.customerService.findAll();

    return new SuccessfullyRespose({
      message: 'Lấy danh sách khách hàng thành công',
      data: plainToInstance(Customer, customers),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessfullyRespose<Customer>> {
    const customer = await this.customerService.findOne(id);

    return new SuccessfullyRespose({
      message: 'Lấy thông tin khách hàng thành công',
      data: plainToInstance(Customer, customer),
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<SuccessfullyRespose<Customer>> {
    const updatedCustomer = await this.customerService.update(
      id,
      updateCustomerDto,
    );

    return new SuccessfullyRespose({
      message: 'Cập nhật khách hàng thành công',
      data: plainToInstance(Customer, updatedCustomer),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer by ID' })
  async delete(@Param('id') id: string): Promise<SuccessfullyRespose<null>> {
    await this.customerService.remove(id);

    return new SuccessfullyRespose({
      message: 'Xóa khách hàng thành công',
      data: null,
    });
  }
}
