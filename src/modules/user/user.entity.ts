import { BaseEntity } from 'src/commons';
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

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  userName: string;

  // @Column({ nullable: true })
  // email: string;

  @Column()
  @Exclude()
  password: string;

  // @Column({ nullable: true })
  // phone: string;

  @Column()
  fullName: string;

  // @Column({ nullable: true })
  // @IsEnum(GenderEnum)
  // gender: string;

  // @Column({ nullable: true, type: 'date' })
  // dateOfBirth: Date;

  // @Column({
  //   nullable: true,
  //   default:
  //     'https://res.cloudinary.com/dfx1kzavc/image/upload/v1729527211/avatars/yx6h61wlbwxfscuqzjpk.jpg',
  // })
  // avatar: string;

  @Column({ default: 1 })
  status: number;

  @Column({ nullable: true })
  role: number;

  @OneToMany(
    () => RefreshToken,
    (refreshToken: RefreshToken) => refreshToken.user,
  )
  refreshTokens: RefreshToken[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}
