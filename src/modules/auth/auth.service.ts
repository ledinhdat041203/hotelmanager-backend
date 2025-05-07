import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import {
  InternalServerException,
  UnAuthorizedException,
  UserPayload,
} from '@/commons';
import { RefreshTokenService } from '../token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly tokenService: RefreshTokenService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.validatePassword(pass, user.password))) {
      return user;
    }
    return null;
  }

  async validatePassword(
    plainPassword: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await argon.verify(hashPassword, plainPassword);
  }

  async createJWTToken(user: any) {
    const currentUser = user.user;

    const payload: UserPayload = {
      userName: currentUser.userName,
      userId: currentUser.userId,
      status: currentUser.status,
      role: currentUser.role?.roleId || null,
      fullName: currentUser.fullName || null,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async createRefreshToken(user: any) {
    const currentUser = user.user;

    const payload: UserPayload = {
      userName: currentUser.userName,
      userId: currentUser.userId,
      status: currentUser.status,
      role: currentUser.role?.roleId || null,
      fullName: currentUser.fullName || null,
    };

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.HM_REFRESH_TOKEN_EXPIRED,
    });

    if (!newRefreshToken) {
      throw new InternalServerException({ message: 'Tạo token thất bại' });
    }

    await this.tokenService.create(newRefreshToken, currentUser.userId);

    return {
      refresh_token: newRefreshToken,
    };
  }

  async refreshToken(token: string): Promise<string> {
    try {
      const refreshToken = await this.tokenService.findByToken(token);
      const payloadAccess = await this.jwtService.verifyAsync(token);
      const { iat, exp, ...payload } = payloadAccess;
      console.log(payload);

      const newAccessToken = await this.jwtService.signAsync(payload);

      return newAccessToken;
    } catch {
      await this.tokenService.delete(token);
      throw new UnAuthorizedException({
        message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      });
    }
  }
}
