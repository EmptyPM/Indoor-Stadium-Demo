import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Colombo' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Western Province', required: false })
  @IsOptional()
  @IsString()
  province?: string;
}
