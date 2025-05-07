import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  BaseService,
  NotFoundException,
} from 'src/commons';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { use } from 'passport';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // private readonly tokenService: RefreshTokenService,
  ) {
    super(userRepository, (data) => new User(data));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    // Kiểm tra email đã tồn tại
    const isEmailTaken = await this.checkEmailExist(email);
    if (isEmailTaken) {
      throw new BadRequestException({
        message: 'Email đã tồn tại',
      });
    }

    // Tạo user
    const user = this.userRepository.create({
      ...createUserDto,

      password: process.env.HM_PASSWORD_DEFAULT,
    });

    const savedUser = await this.userRepository.save(user);

    if (!savedUser) {
      throw new BadRequestException({ message: 'Tạo người dùng thất bại' });
    }

    return savedUser;
  }

  async update(userId: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);

    Object.assign(user, updateDto);

    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
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

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user) {
      return user;
    }

    return null;
  }

  async checkEmailExist(email: string): Promise<boolean> {
    if (!email) return false;
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      return true;
    }
    return false;
  }

  async search(searchDto: SearchUserDto): Promise<User[]> {
    const { userName, role, status } = searchDto;

    const query = this.userRepository.createQueryBuilder('users');

    if (userName) {
      query.andWhere('(unaccent(users.userName) ILIKE unaccent(:userName))', {
        searchData: `%${userName}%`,
      });
    }

    if (role) {
      query.andWhere('(users.role::text ILIKE :role)', { role });
    }

    if (status !== undefined && status !== null) {
      query.andWhere('users.status = :status', { status: Number(status) });
    }

    const users = await query.getMany();

    if (!users || users.length === 0) {
      throw new NotFoundException({
        message: 'Không có thông tin',
      });
    }

    return users;
  }
}
