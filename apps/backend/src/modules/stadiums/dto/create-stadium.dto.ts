import { IsString, IsOptional, IsArray, IsNumber, IsEmail, MinLength, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStadiumDto {
  @ApiProperty({ example: 'Kandy Sports Arena' })
  @IsString() @MinLength(3)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-of-location' })
  @IsString()
  locationId: string;

  @ApiProperty({ example: '123 Peradeniya Road, Kandy' })
  @IsString()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsNumber()
  longitude?: number;
}
