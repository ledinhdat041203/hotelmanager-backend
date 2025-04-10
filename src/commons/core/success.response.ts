import { HttpStatus } from '@nestjs/common';
import { HttpReason } from './reasonPhrases';

export class ServiceSuccess<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;
  code: number;

  constructor({
    message = HttpReason.OK,
    statusCode = HttpStatus.OK,
    data,
    code = 0,
  }: {
    message?: string;
    statusCode?: number;
    data?: T;
    code?: number;
  }) {
    this.message = message;
    this.statusCode = statusCode;
    this.success = true;
    this.data = data;
    this.code = code;
  }
}

export class SuccessfullyRespose<T> extends ServiceSuccess<T> {
  constructor({
    message = HttpReason.OK,
    data,
    code,
  }: {
    message?: string;
    data?: T;
    code?: number;
  }) {
    super({ message, data, code });
  }
}

export class CreatedResponse<T> extends ServiceSuccess<T> {
  constructor({
    message = HttpReason.CREATED,
    data,
    code = 0,
  }: {
    message?: string;
    data: T;
    code?: number;
  }) {
    super({ message, statusCode: HttpStatus.CREATED, data, code });
  }
}

