import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .addBearerAuth({ in: 'header', type: 'http', bearerFormat: 'JWT' })
  .setVersion('1.0')
  .build();
