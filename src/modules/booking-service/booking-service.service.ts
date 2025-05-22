import { Injectable } from '@nestjs/common';
import { Between, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  BookingStatus,
  NotFoundException,
} from '@/commons';
import { BookingItem } from './booking-service.entity';
import { CreateBookingServiceDto } from './dto/create-booking-service.dto';
import { BookingService } from '../booking/booking.service';
import { ServiceService } from '../service/service.service';
import { UpdateBookingServiceDto } from './dto/update-booking-service.dto';

@Injectable()
export class BookingItemService {
  constructor(
    @InjectRepository(BookingItem)
    private readonly bookingItemRepo: Repository<BookingItem>,
    private readonly bookingService: BookingService,
    private readonly serviceService: ServiceService,
  ) {}

  async create(createDto: CreateBookingServiceDto): Promise<BookingItem> {
    const { bookingId, serviceId, quantity } = createDto;

    const booking = await this.bookingService.findOne(bookingId);
    const service = await this.serviceService.findOne(serviceId);

    const totalPrice = service.sellPrice * quantity;

    await this.serviceService.updateQuantity([
      {
        serviceId: service.id,
        quantity: -quantity,
      },
    ]);
    const bookingItem = this.bookingItemRepo.create({
      booking,
      service,
      quantity,
      unitPrice: service.sellPrice,
      totalPrice,
    });

    const savedBooking = await this.bookingItemRepo.save(bookingItem);

    if (!savedBooking) {
      throw new BadRequestException({ message: 'Tạo booking thất bại' });
    }

    await this.bookingService.updateTotalServicePrice(bookingId, totalPrice);

    return savedBooking;
  }

  async findByBooking(bookingId: string): Promise<BookingItem[]> {
    const bookings = await this.bookingItemRepo.find({
      where: { booking: { id: bookingId } },
      relations: ['service'],
    });

    return bookings;
  }

  async findOne(id: string): Promise<BookingItem> {
    const booking = await this.bookingItemRepo.findOne({
      where: { id },
      relations: ['service', 'booking'],
    });

    if (!booking)
      throw new NotFoundException({ message: 'Đơn đặt không tồn tại' });
    return booking;
  }

  async update(
    id: string,
    updateDto: UpdateBookingServiceDto,
  ): Promise<{ bookingItem: BookingItem; changeTotal: number }> {
    const booking = await this.findOne(id);
    const oldQuantity = booking.quantity;

    const { quantity } = updateDto;
    const changeQuantity = oldQuantity - quantity;

    if (quantity !== undefined) booking.quantity = quantity;
    const oldPrice = booking.totalPrice;
    const newPrice = quantity * booking.unitPrice;
    booking.totalPrice = newPrice;

    const updatedService = await this.serviceService.updateQuantity([
      {
        serviceId: booking.service.id,
        quantity: changeQuantity,
      },
    ]);
    const updatedBooking = await this.bookingItemRepo.save(booking);
    if (!updatedBooking) {
      throw new BadRequestException({ message: 'Cập nhật booking thất bại' });
    }
    await this.bookingService.updateTotalServicePrice(
      booking.booking.id,
      newPrice - oldPrice,
    );
    const responeBooking = await this.findOne(updatedBooking.id);
    return {
      bookingItem: { ...responeBooking },
      changeTotal: newPrice - oldPrice,
    };
  }

  async delete(id: string): Promise<{ changeTotal: number }> {
    const bookingItem = await this.findOne(id);
    if (!bookingItem) {
      throw new BadRequestException({
        message: 'Không tìm thấy booking item để xóa',
      });
    }

    await this.serviceService.updateQuantity([
      {
        serviceId: bookingItem.service.id,
        quantity: bookingItem.quantity,
      },
    ]);

    await this.bookingItemRepo.remove(bookingItem);
    await this.bookingService.updateTotalServicePrice(
      bookingItem.booking.id,
      -bookingItem.totalPrice,
    );

    return { changeTotal: -bookingItem.totalPrice };
  }

  async countServicesSoldByType(from: Date, to: Date) {
    const raw = await this.bookingItemRepo.query(
      `
      SELECT 
        s.type AS serviceType,
        SUM(bsi.quantity) AS totalSold
      FROM booking_service_item bsi
      JOIN service s ON s.id = bsi."serviceId"
      JOIN bookings b ON b.id = bsi."bookingId"
      WHERE b.status = 'Đã trả phòng'
        AND DATE(bsi."createdAt") BETWEEN $1 AND $2
      GROUP BY s.type
      ORDER BY totalSold DESC;
    `,
      [from, to],
    );

    return raw.map((item) => ({
      serviceType: item.servicetype,
      totalSold: +item.totalsold,
    }));
  }

  async getTop5ServicesSold(from: Date, to: Date) {
    const raw = await this.bookingItemRepo.query(
      `
      SELECT 
        s.name AS serviceName,
        SUM(bsi.quantity) AS totalSold
      FROM booking_service_item bsi
      JOIN service s ON s.id = bsi."serviceId"
      JOIN bookings b ON b.id = bsi."bookingId"
      WHERE b.status = 'Đã trả phòng'
        AND DATE(bsi."createdAt") BETWEEN $1 AND $2
      GROUP BY s.name
      ORDER BY totalSold DESC
      LIMIT 5;
      `,
      [from, to],
    );

    return raw.map((item) => ({
      serviceName: item.servicename,
      totalSold: +item.totalsold,
    }));
  }

  async findBookingServiceByDate(from: Date, to: Date): Promise<any> {
    const bookings = await this.bookingItemRepo
      .createQueryBuilder('booking_service')
      .leftJoinAndSelect('booking_service.service', 'service')
      .where('booking_service.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('service.id')
      .select([
        'service.name',
        'Sum(booking_service.quantity) AS totalBookings',
        'Sum(booking_service.totalPrice) AS totalPrice',
      ])
      .getRawMany();

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException({
        message: 'Không tìm thấy đặt phòng nào',
      });
    }

    return bookings;
  }
}
