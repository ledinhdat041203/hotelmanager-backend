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
import { RoomModule } from './modules/room/room.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ServiceModule } from './modules/service/service.module';
import { Booking } from './modules/booking/booking.entity';
import { BookingModule } from './modules/booking/booking.module';
import { BookingItemModule } from './modules/booking-service/booking-service.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    RoomTypeModule,
    RoomModule,
    CustomerModule,
    ServiceModule,
    BookingModule,
    BookingItemModule,
    CloudinaryModule,
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
