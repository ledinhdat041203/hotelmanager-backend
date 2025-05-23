import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { AllExceptionsFilter } from './commons';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './configs';
import AppDataSource from './configs/db.config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.HM_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // chỉ giữ các field có trong DTO
  //     // forbidNonWhitelisted: true, // ném lỗi nếu có field lạ
  //     // transform: true, // tự động convert type
  //   }),
  // );

  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    });

  await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS unaccent;');

  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  const port = process.env.HM_PORT || 3000;
  await app.listen(port, () => {
    Logger.log(`==== http://localhost:${port}/ ====`);
    Logger.log(
      `==== Swagger Docs: http://localhost:${port}/api/v1/api-docs ====`,
    );
  });
}
bootstrap();
