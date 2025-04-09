import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnAuthorizedException, UserPayload } from '@/commons';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('HM_TOKEN_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: UserPayload): Promise<UserPayload> {
    if (req.url !== '/api/v1/user/change-password' && payload.status === 2) {
      throw new UnAuthorizedException({
        message: 'first login',
        code: 3000,
      });
    }
    return {
      userId: payload.userId,
      userName: payload.userName,
      fullName: payload.fullName,
      status: payload.status,
      role: payload.role,
    };
  }
}
