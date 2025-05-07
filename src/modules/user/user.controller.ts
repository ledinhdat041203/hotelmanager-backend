import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Get,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  Put,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  CreatedResponse,
  CustomValidationPipe,
  fileTypeValidation,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('user')
@Controller('user')
// @UseGuards(JWTAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  @UsePipes(new CustomValidationPipe())
  @ApiOperation({ summary: 'create new User' })
  async create(
    @Body() createUser: CreateUserDto,
    // @Req() req: { user: UserPayload },
  ): Promise<CreatedResponse<any>> {
    // const currentUser = req.user;

    // createUser.createdBy = currentUser.userId;
    const newUser = await this.userService.create(createUser);
    const userInstance = plainToInstance(User, newUser);

    return new CreatedResponse({
      data: userInstance,
      message: 'Tạo người dùng thành công',
    });
  }

  @Put(':id')
  @UsePipes(new CustomValidationPipe())
  @ApiOperation({ summary: 'update User' })
  async update(
    @Body() updateDto: UpdateUserDto,
    @Param('id') userId: string,
    // @Req() req: { user: UserPayload },
  ): Promise<SuccessfullyRespose<any>> {
    // const currentUser = req.user;

    // createUser.createdBy = currentUser.userId;
    const updatedUser = await this.userService.update(userId, updateDto);
    const userInstance = plainToInstance(User, updatedUser);

    return new SuccessfullyRespose({
      data: userInstance,
      message: 'Cập nhật thành công',
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
    const isExistsUserName = await this.userService.checkEmailExist(userName);
    return new SuccessfullyRespose({ data: isExistsUserName });
  }

  @Get('search')
  @ApiOperation({ summary: 'search users' })
  async search(
    @Query() searchDto: SearchUserDto,
  ): Promise<SuccessfullyRespose<User[]>> {
    const users = await this.userService.search(searchDto);
    return new SuccessfullyRespose({
      data: plainToInstance(User, users),
    });
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fieldNameSize: 1024 * 100 },
      // fileFilter: fileTypeValidation,
    }),
  )
  async uploadAvata(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log(file);
      if (!file) {
        throw new BadRequestException({ message: 'Không thấy file yêu cầu' });
      }
      const folderName = 'avatars';
      const response = await this.cloudinaryService.uploadFile(
        file,
        folderName,
      );
      return new SuccessfullyRespose({ data: { url: response.secure_url } });
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
}
