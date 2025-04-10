import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customerId: string;

  @Column()
  customerName: string;

  @Column()
  phone: string;

  @Column()
  cccd: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;
}
