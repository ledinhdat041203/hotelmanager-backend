import { HttpStatus } from '@nestjs/common';
import { HttpReason } from './reasonPhrases';

export class ServiceError extends Error {
  status: number;
  message: string;
  success: false;
  code: number;

  constructor(message: string, status: number, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class BadRequestException extends ServiceError {
  constructor({
    message = HttpReason.BAD_REQUEST,
    status = HttpStatus.BAD_REQUEST,
    code = null,
  }) {
    super(message, status, code);
  }
}

export class NotFoundException extends ServiceError {
  constructor({
    message = HttpReason.NOT_FOUND,
    status = HttpStatus.NOT_FOUND,
    code = null,
  }) {
    super(message, status, code);
  }
}

export class NotAcceptableException extends ServiceError {
  constructor({
    message = HttpReason.NOT_ACCEPTABLE,
    status = HttpStatus.NOT_ACCEPTABLE,
    code = null,
  }) {
    super(message, status, code);
  }
}

export class InternalServerException extends ServiceError {
  constructor({
    message = HttpReason.INTERNAL_SERVER_ERROR,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    code = null,
  }) {
    super(message, status, code);
  }
}

export class ForBiddenException extends ServiceError {
  constructor({
    message = HttpReason.FORBIDDEN,
    status = HttpStatus.FORBIDDEN,
    code = null,
  }) {
    super(message, status, code);
  }
}

export class UnAuthorizedException extends ServiceError {
  constructor({
    message = HttpReason.UNAUTHORIZED,
    status = HttpStatus.UNAUTHORIZED,
    code = null,
  }) {
    super(message, status, code);
  }
}

export class ConflictException extends ServiceError {
  constructor({
    message = HttpReason.CONFLICT,
    status = HttpStatus.CONFLICT,
    code = null,
  }) {
    super(message, status, code);
  }
}
