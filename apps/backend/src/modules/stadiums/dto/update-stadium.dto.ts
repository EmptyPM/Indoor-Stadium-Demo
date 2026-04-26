import { PartialType } from '@nestjs/swagger';
import { CreateStadiumDto } from './create-stadium.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStadiumDto extends PartialType(CreateStadiumDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
