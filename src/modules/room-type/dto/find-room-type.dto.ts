import { Status } from '@/commons';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class searchRoomTypeDto {
  @IsOptional()
  @IsString()
  searchData: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status | null;
}
