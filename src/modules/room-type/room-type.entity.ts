import { Status } from '@/commons';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../room/room.entity';
import { Transform } from 'class-transformer';

@Entity('room_types')
export class RoomType {
  @PrimaryGeneratedColumn('uuid')
  roomTypeId: string;

  @Column()
  roomTypeName: string;

  @Column('decimal')
  @Transform(({ value }) => parseInt(value))
  priceByDay: number;

  @Column('decimal')
  @Transform(({ value }) => parseInt(value))
  priceByHour: number;

  @Column('decimal')
  @Transform(({ value }) => parseInt(value))
  priceOvernight: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}
