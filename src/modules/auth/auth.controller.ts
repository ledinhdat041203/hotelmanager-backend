import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { SuccessfullyRespose, UnAuthorizedException } from '@/commons';
import { UserService } from '../user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async handleLogin(@Request() req) {
    const access_token = await this.authService.createJWTToken({
      user: req.user,
    });
    const refresh_token = await this.authService.createRefreshToken({
      user: req.user,
    });
    const user = req.user;
    var code = 0;
    if (user.status === 2) code = 3000;
    // const role: Role = user.role;

    return new SuccessfullyRespose({
      data: {
        ...access_token,
        ...refresh_token,
        user: req.user,
      },
      message: 'Đăng nhập thành công',
      code,
    });
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    try {
      const newAccessToken = await this.authService.refreshToken(refreshToken);
      return new SuccessfullyRespose({ data: { accessToken: newAccessToken } });
    } catch (error) {
      throw new UnAuthorizedException({
        message: `Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại`,
        code: 3001,
      });
    }
  }
}
