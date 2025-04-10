import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dbConfig } from './configs';
import { AuthModule } from './modules/auth/auth.module';
import { MorganMiddleware } from './commons';
import { RoomTypeModule } from './modules/room-type/room-type.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    RoomTypeModule,
    ConfigModule.forRoot({
      load: [dbConfig],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [registerAs('typeorm', dbConfig)],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('typeorm'),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
