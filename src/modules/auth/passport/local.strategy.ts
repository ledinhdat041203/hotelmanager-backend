import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { BadRequestException, UnAuthorizedException } from '@/commons';
import { use } from 'passport';
import { plainToInstance } from 'class-transformer';
import { User } from '@/modules/user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'userName',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    username: string,
    password: string,
  ): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnAuthorizedException({
        message: 'Tài khoản hoặc mật khẩu không đúng',
      });
    }
    if (user.status === 0) {
      throw new BadRequestException({
        message: 'Tài khoản của bạn chưa được kích hoạt',
      });
    }
    return plainToInstance(User, user);
  }
}
