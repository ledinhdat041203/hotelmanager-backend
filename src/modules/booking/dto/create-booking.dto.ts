import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { BookingStatus, BookingType } from '@/commons';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsString()
  @IsNotEmpty()
  cccd?: string;

  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @IsDateString()
  @IsNotEmpty()
  checkOutDate: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsEnum(BookingType)
  @IsOptional()
  type?: BookingType = BookingType.BY_HOUR;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus = BookingStatus.PENDING;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;
}
