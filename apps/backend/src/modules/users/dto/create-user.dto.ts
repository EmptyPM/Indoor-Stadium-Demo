import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'John Silva' })
  @IsString() @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pass1234' })
  @IsString() @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, default: Role.USER })
  @IsOptional() @IsEnum(Role)
  role?: Role;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  phone?: string;
}
