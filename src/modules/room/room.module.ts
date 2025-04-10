import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomTypeModule } from '../room-type/room-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), RoomTypeModule],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
