import { PartialType } from '@nestjs/swagger';
import { CreateSportDto } from './create-sport.dto';
import { IsBoolean, IsOptional } from 'class-validator';
export class UpdateSportDto extends PartialType(CreateSportDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
