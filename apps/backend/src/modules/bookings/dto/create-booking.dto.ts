import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-court' })
  @IsUUID()
  courtId: string;

  @ApiProperty({ example: '2025-02-15', description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '09:00', description: 'Start time HH:mm' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'End time HH:mm' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'CASH', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
