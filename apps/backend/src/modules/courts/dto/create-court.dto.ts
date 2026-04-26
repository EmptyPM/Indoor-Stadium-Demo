import { IsString, IsOptional, IsInt, IsBoolean, Min, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourtDto {
  @ApiProperty({ example: 'Court A' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsString()
  stadiumId: string;

  @ApiProperty()
  @IsString()
  sportId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isIndoor?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, example: '06:00', description: 'Opening time in HH:mm format' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Opening time must be in HH:mm format (e.g. 06:00)' })
  openingTime?: string;

  @ApiProperty({ required: false, example: '22:00', description: 'Closing time in HH:mm format' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Closing time must be in HH:mm format (e.g. 22:00)' })
  closingTime?: string;
}
