import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ServiceError } from '../core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof ServiceError
        ? exception.status
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const success =
      exception instanceof ServiceError ? exception.success : false;

    const message =
      exception instanceof ServiceError
        ? exception.message
        : 'Internal server error';
    console.log('message:', exception.message);
    const code =
      exception instanceof ServiceError ? exception.code : 'UNKNOWN_ERROR';

    response.status(status).json({
      success,
      statusCode: status,
      message,
      code,
    });
  }
}
