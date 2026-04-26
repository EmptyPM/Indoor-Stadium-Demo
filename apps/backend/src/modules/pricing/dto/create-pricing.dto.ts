import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsArray,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingDto {
  @ApiProperty({ example: 'Peak Hours' })
  @IsString()
  name: string;

  @ApiProperty({ example: 800 })
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isWeekend?: boolean;

  @ApiProperty({ example: [1, 2, 3, 4, 5], required: false })
  @IsOptional()
  @IsArray()
  dayOfWeek?: number[];

  @ApiProperty({ example: 'uuid-of-court' })
  @IsUUID()
  courtId: string;
}
