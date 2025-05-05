import { IsUUID, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBookingServiceDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsNumber()
  @Min(1)
  quantity: number = 1;
}
