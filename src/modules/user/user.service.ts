import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, BaseService } from 'src/commons';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // private readonly tokenService: RefreshTokenService,
  ) {
    super(userRepository, (data) => new User(data));
  }

  async create(createUser: CreateUserDto): Promise<User> {
    const { userName } = createUser;
    if (await this.checkUserNameExist(userName)) {
      throw new BadRequestException({
        message: 'Tên người dùng đã tồn tại',
      });
    }

    // let avatar: string = createUser.avatar;
    // if (!createUser.avatar) avatar = process.env.HM_AVATAR_DEFAULT;

    const user = this.userRepository.create({
      ...createUser,
    });
    const savedUser = await this.userRepository.save(user);

    if (!savedUser) {
      throw new BadRequestException({ message: 'Tạo người dùng thất bại' });
    }

    return savedUser;
  }

  async findById(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException({
        message: 'Không có thông tin người dùng',
      });
    }
    const user = await this.userRepository.findOne({
      where: { userId },
    });
    if (user) {
      return user;
    }

    return null;
  }

  async findByUserName(userName: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userName },
    });
    if (user) {
      return user;
    }

    return null;
  }

  async checkUserNameExist(userName: string): Promise<boolean> {
    if (!userName) return false;
    const user = await this.userRepository.findOne({ where: { userName } });
    if (user) {
      return true;
    }
    return false;
  }
}
