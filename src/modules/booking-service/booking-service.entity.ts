import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from '../booking/booking.entity';
import { Service } from '../service/service.entity';
import { BaseEntity } from '@/commons';

@Entity('booking_service_item')
export class BookingItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.services, {
    onDelete: 'CASCADE',
  })
  booking: Booking;

  @ManyToOne(() => Service)
  service: Service;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  unitPrice: number;

  @Column({ type: 'int' })
  totalPrice: number;
}
