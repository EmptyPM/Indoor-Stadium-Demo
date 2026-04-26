import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSportDto {
  @ApiProperty({ example: 'Badminton' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '🏸', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 'Indoor racket sport', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
