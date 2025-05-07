import { Status } from '@/commons';
import { Role } from '@/commons/types/role-enum';

import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  userName: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status | null;

  @IsOptional()
  @IsEnum(Role)
  role: Role | null;
}
