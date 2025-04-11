import { ServiceType, Status } from '@/commons';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('service')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @Column()
  unit: string;

  @Column('decimal', { precision: 12, scale: 2 })
  sellPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  costPrice: number;

  @Column({ type: 'int', nullable: true })
  quantityInStock: number;

  @Column({ type: 'int', nullable: true })
  minimumStock: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({ type: 'text', nullable: true })
  description: string;
}
