import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  MinLength,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(50, { message: 'Tên người dùng không quá 50 kí tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống!!' })
  @Expose()
  userName: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống!!' })
  @Matches(/((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'mật khẩu có ít nhất 1 kí tự viết hoa, 1 kí tự thường, 1 kí tự đặc biệt ',
  })
  @MinLength(8, { message: 'Mật khẩu ít nhất 8 kí tự' })
  @MaxLength(50, { message: 'Mật khẩu không qusá 50 kí tự' })
  password: string;

  @IsNotEmpty({ message: 'tên người dùng không được để trống' })
  @MaxLength(50, { message: 'tên người dùng không quá 50 kí tự' })
  @Expose()
  fullName: string;

  // @IsOptional()
  // @Expose()
  // avatar?: string;

  @IsOptional()
  @Expose()
  status: number;

  @IsOptional()
  role: number;

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
