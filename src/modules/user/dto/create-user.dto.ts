import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  MinLength,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { GenderEnum } from '@/commons/types/gender-enum';
import { Role } from '@/commons/types/role-enum';
import { Status } from '@/commons';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  // @IsString()
  // @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  // @Matches(/((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 ký tự đặc biệt và 1 số',
  // })
  // @MinLength(8, { message: 'Mật khẩu ít nhất 8 kí tự' })
  // @MaxLength(50, { message: 'Mật khẩu không quá 50 kí tự' })
  // password: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(50, { message: 'Họ tên không quá 50 kí tự' })
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(15, { message: 'Số điện thoại không quá 15 kí tự' })
  phone?: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsEnum(GenderEnum, { message: 'Giới tính không hợp lệ' })
  gender?: GenderEnum;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng yyyy-mm-dd' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @Expose()
  avatar?: string;

  @IsOptional()
  @IsEnum(Status, { message: 'Trạng thái không hợp lệ' })
  status?: Status;

  @IsOptional()
  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  role?: Role;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày không đúng định dạng yyyy-mm-dd' })
  startDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
