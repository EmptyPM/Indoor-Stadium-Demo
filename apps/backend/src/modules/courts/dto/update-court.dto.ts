import { PartialType } from '@nestjs/swagger';
import { CreateCourtDto } from './create-court.dto';
import { IsBoolean, IsOptional } from 'class-validator';
export class UpdateCourtDto extends PartialType(CreateCourtDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
