import { Status } from '@/commons';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../room/room.entity';

@Entity('room_types')
export class RoomType {
  @PrimaryGeneratedColumn('uuid')
  roomTypeId: string;

  @Column()
  roomTypeName: string;

  @Column('decimal')
  priceByDay: number;

  @Column('decimal')
  priceByHour: number;

  @Column('decimal')
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
