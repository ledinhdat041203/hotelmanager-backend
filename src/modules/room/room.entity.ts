import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomType } from '../room-type/room-type.entity';
import { Status } from '@/commons';
import { RoomClean } from '@/commons/types/room-clean-enum';
import { RoomState } from '@/commons/types/room-state-enum';

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

  @Column({ type: 'enum', enum: RoomClean, default: RoomClean.CLEAN })
  clean: RoomClean;

  @Column({ type: 'enum', enum: RoomState, default: RoomState.AVAILABLE })
  state: RoomState;

  @ManyToOne(() => RoomType, { eager: false })
  roomType: RoomType;
}
