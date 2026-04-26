import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Password can only contain letters and numbers',
  })
  password: string;

  @ApiProperty({ example: '+94771234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
