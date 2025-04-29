import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { BookingStatus, BookingType, Channel } from '@/commons';

export class SearchBookingDto {
  @IsString()
  @IsOptional()
  customerName: string;

  @IsString()
  @IsOptional()
  roomName: string;

  @IsEnum(Channel)
  @IsOptional()
  channel?: Channel;

  @IsOptional()
  status: BookingStatus[];
}
