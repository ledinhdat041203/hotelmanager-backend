import { ServiceType, Status } from '@/commons';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ServiceType)
  type: ServiceType;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sellPrice: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  costPrice: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantityInStock?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  description?: string;
}
