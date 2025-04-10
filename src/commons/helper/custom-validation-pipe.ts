import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { BadRequestException } from '../core';

export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      const obj = plainToInstance(metadata.metatype, value);
      const errors = await validate(obj, { whitelist: true });

      if (errors.length > 0) {
        const firstError = Object.values(errors[0].constraints)[0];
        throw new BadRequestException({
          message: firstError,
        });
        // throw new BadRequestException({ message: `Yêu cầu nhập đủ dữ liệu` });
      }

      return obj;
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }
}
