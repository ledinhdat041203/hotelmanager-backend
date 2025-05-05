import { ServiceType, Status } from '@/commons';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SearchServiceDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ServiceType)
  type: ServiceType | null;

  @IsOptional()
  @IsString()
  inventory: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status)
  status: Status | null;
}
