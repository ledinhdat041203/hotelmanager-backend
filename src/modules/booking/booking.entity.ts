import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../room/room.entity';
import { BookingStatus, BookingType, Channel } from '@/commons';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column()
  cccd: string;

  @Column({ type: 'timestamp' })
  checkInDate: Date;

  @Column({ type: 'timestamp' })
  checkOutDate: Date;

  @ManyToOne(() => Room, { eager: true })
  room: Room;

  @Column({
    type: 'enum',
    enum: BookingType,
    default: BookingType.BY_HOUR,
  })
  type: BookingType;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column() unitPrice: number;
  @Column() totalPrice: number;
  @Column({ nullable: true }) depositAmount: number;

  @Column({
    type: 'enum',
    enum: Channel,
    default: Channel.DIRECT,
  })
  channel: Channel;

  //   @OneToMany(() => BookingServiceItem, (item) => item.booking, {
  //     cascade: true,
  //   })
  //   serviceItems: BookingServiceItem[];
}
