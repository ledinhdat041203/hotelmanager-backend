import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,

} from '@nestjs/common';
import { Response } from 'express';
import { ServiceError } from '../core';

@Catch(ServiceError)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: ServiceError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.status).json({
      success: exception.success,
      statusCode: exception.status,
      message: exception.message,
      code: exception.code,
    });
  }
}
