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

  @Column({ type: 'int', nullable: true })
  sellPrice: number;

  @Column({ type: 'int', nullable: true })
  costPrice: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  quantityInStock: number;

  @Column({ type: 'int', nullable: true, default: 0 })
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
