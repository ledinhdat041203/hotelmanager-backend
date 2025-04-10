import { Status } from '@/commons';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  roomTypeName: string;

  @IsNumber()
  @IsNotEmpty()
  priceByDay: number;

  @IsNumber()
  @IsNotEmpty()
  priceByHour: number;

  @IsNumber()
  @IsNotEmpty()
  priceOvernight: number;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}
