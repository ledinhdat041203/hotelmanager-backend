import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomType } from '../room-type/room-type.entity';
import { Status } from '@/commons';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  roomId: string;

  @Column()
  roomName: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @ManyToOne(() => RoomType, { eager: false })
  roomType: RoomType;
}
