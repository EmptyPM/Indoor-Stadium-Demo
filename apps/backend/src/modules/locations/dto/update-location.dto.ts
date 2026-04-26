import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';
import { IsBoolean, IsOptional } from 'class-validator';
export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
