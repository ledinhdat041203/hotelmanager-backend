import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsPhoneNumber('VN')
  phone: string;

  @IsString()
  @IsNotEmpty()
  cccd: string;

  @IsDateString()
  dateOfBirth: string;
}
