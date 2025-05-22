import { ServiceType, Status } from '@/commons';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class ImportServiceDto {
  @IsUUID()
  serviceId: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity?: number;
}
