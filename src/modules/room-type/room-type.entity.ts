import { Status } from '@/commons';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
