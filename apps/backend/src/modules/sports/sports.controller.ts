import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SportsService } from './sports.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Sports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get() @Public() @ApiOperation({ summary: 'List all sports' })
  findAll(@Query('search') search?: string) { return this.sportsService.findAll(search); }

  @Get(':id') @Public() @ApiOperation({ summary: 'Get sport by ID' })
  findOne(@Param('id') id: string) { return this.sportsService.findOne(id); }

  @Post() @Roles(Role.SUPER_ADMIN) @ApiOperation({ summary: 'Create sport' })
  create(@Body() dto: CreateSportDto) { return this.sportsService.create(dto); }

  @Patch(':id') @Roles(Role.SUPER_ADMIN) @ApiOperation({ summary: 'Update sport' })
  update(@Param('id') id: string, @Body() dto: UpdateSportDto) { return this.sportsService.update(id, dto); }

  @Delete(':id') @Roles(Role.SUPER_ADMIN) @ApiOperation({ summary: 'Delete sport' })
  remove(@Param('id') id: string) { return this.sportsService.remove(id); }
}
