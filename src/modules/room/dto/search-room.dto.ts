import { Status } from '@/commons';
import { RoomState } from '@/commons/types/room-state-enum';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class searchRoomDto {
  @IsOptional()
  @IsString()
  searchData: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status | null;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(RoomState)
  state: RoomState | null;
}
