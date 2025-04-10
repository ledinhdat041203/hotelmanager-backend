import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  roomName: string;

  @IsUUID()
  roomTypeId: string;
}
