import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MorganMiddleware.name);

  use(req: any, res: any, next: () => void) {
    morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
      stream: {
        write: (message) => this.logger.log(message.trim()), // Ghi log thông thường
      },
    })(req, res, (err) => {
      if (err) {
        this.logger.error('Error occurred:', err.message);
      }
      next();
    });
  }
}
