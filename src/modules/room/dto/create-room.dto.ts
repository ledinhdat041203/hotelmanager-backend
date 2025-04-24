import { Status } from '@/commons';
import { RoomClean } from '@/commons/types/room-clean-enum';
import { RoomState } from '@/commons/types/room-state-enum';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  roomName: string;

  @IsUUID()
  roomTypeId: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsEnum(RoomClean)
  clean: RoomClean;

  @IsOptional()
  @IsEnum(RoomState)
  state: RoomState;
}
