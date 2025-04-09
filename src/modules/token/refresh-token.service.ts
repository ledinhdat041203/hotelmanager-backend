import { Injectable } from '@nestjs/common';
import { RefreshToken } from './refresh-token.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerException, UnAuthorizedException } from '@/commons';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
  ) {}

  async create(token: string, userId: string): Promise<RefreshToken> {
    const newToken = this.tokenRepository.create({ userId, token });
    const savedToken = this.tokenRepository.save(newToken);
    if (!savedToken) {
      throw new InternalServerException({
        message: 'Tạo token không thành công',
      });
    }

    return savedToken;
  }

  async findByToken(token: string): Promise<RefreshToken> {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token },
    });
    if (!tokenEntity || tokenEntity.isRevoked) {
      throw new UnAuthorizedException({
        message: 'Người dùng chưa đăng nhập!!',
      });
    }

    return tokenEntity;
  }

  async delete(token: string): Promise<boolean> {
    const result = await this.tokenRepository.delete(token);
    if (result.affected === 0) {
      return false;
    }

    return true;
  }

  async deleteByUserId(userIds: string[]): Promise<boolean> {
    const result = await this.tokenRepository.delete({ userId: In(userIds) });
    console.log('affected::', result.affected);
    if (result.affected === 0) {
      return false;
    }

    return true;
  }
}
