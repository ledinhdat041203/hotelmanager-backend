import { BaseEntity, Status } from 'src/commons';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Exclude } from 'class-transformer';
import { RefreshToken } from '../token/refresh-token.entity';
import { GenderEnum } from '@/commons/types/gender-enum';
import { IsEnum } from 'class-validator';
import { Role } from '@/commons/types/role-enum';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @Column({ nullable: true, type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true, type: 'date', default: () => 'CURRENT_DATE' })
  startDate: Date;

  @Column({
    nullable: true,
    default:
      'https://res.cloudinary.com/dfx1kzavc/image/upload/v1729527211/avatars/yx6h61wlbwxfscuqzjpk.jpg',
  })
  avatar: string;
  
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({ type: 'enum', enum: Role, default: Role.RECEPTIONIST })
  role: Role;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  address: string;

  // @OneToMany(
  //   () => RefreshToken,
  //   (refreshToken: RefreshToken) => refreshToken.user,
  // )
  // refreshTokens: RefreshToken[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}
