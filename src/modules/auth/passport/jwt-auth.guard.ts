import {
  BadRequestException,
  IS_PUBLIC_KEY,
  UnAuthorizedException,
} from '@/commons';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnAuthorizedException({ message: 'jwt expired' });
      } else if (err && err.message === 'first login') {
        throw new BadRequestException({
          message: 'yêu cầu đổi mật khẩu trong lần đầu tiên đăng nhập!',
          code: 3000,
        });
      }

      throw new UnAuthorizedException({
        message: 'Đã hết phiên hoạt động. Vui lòng đăng nhập lại',
      });
    }
    return user;
  }
}
