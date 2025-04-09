import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreatedResponse,
  CustomValidationPipe,
  IsPublic,
  NotFoundException,
  SuccessfullyRespose,
  UserPayload,
} from '@/commons';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JWTAuthGuard } from '../auth/passport/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { User } from './user.entity';

@ApiTags('user')
@Controller('user')
// @UseGuards(JWTAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UsePipes(new CustomValidationPipe())
  @ApiOperation({ summary: 'create new User' })
  async create(
    @Body() createUser: CreateUserDto,
    @Req() req: { user: UserPayload },
  ): Promise<CreatedResponse<User>> {
    const currentUser = req.user;

    // createUser.createdBy = currentUser.userId;
    const newUser = await this.userService.create(createUser);
    const userInstance = plainToInstance(User, newUser);
    return new CreatedResponse({
      data: userInstance,
      message: 'Tạo người dùng thành công',
    });
  }

  @Get('find-by-id')
  @ApiOperation({ summary: 'find user by id' })
  async findById(
    @Query('userId') userId: string,
  ): Promise<SuccessfullyRespose<User>> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException({ message: 'Không tìm thấy người dùng' });
    }

    return new SuccessfullyRespose({ data: user });
  }

  @Post('checkUserName')
  @IsPublic()
  @ApiOperation({ summary: 'check username exitsts' })
  async isExistsUserName(
    @Body('userName') userName: string,
  ): Promise<SuccessfullyRespose<boolean>> {
    const isExistsUserName =
      await this.userService.checkUserNameExist(userName);
    return new SuccessfullyRespose({ data: isExistsUserName });
  }
}
