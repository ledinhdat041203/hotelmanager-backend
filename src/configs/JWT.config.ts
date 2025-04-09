import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('HM_TOKEN_SECRET_KEY'),
  signOptions: {
    expiresIn: configService.get<string>('HM_TOKEN_EXPIRED'),
  },
});
