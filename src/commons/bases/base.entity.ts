import { Exclude } from 'class-transformer';
import { IsUUID, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  constructor(baseEntity?: Partial<BaseEntity>) {
    const keys = [
      'createdBy',
      'createdAt',
      'updatedBy',
      'updatedAt',
      'deletedBy',
      'deletedAt',
    ];
    baseEntity &&
      keys.forEach((key) => {
        baseEntity[key] !== undefined && (this[key] = baseEntity[key]);
      });
  }

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  @Exclude()
  createdBy: string;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  @Exclude()
  updatedBy: string;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  deletedBy: string;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;
}
