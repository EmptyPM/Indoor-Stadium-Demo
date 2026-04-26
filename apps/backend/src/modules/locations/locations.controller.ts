import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get() @Public() @ApiOperation({ summary: 'List all locations' })
  findAll(@Query('search') search?: string) { return this.locationsService.findAll(search); }

  @Get(':id') @Public() @ApiOperation({ summary: 'Get location by ID' })
  findOne(@Param('id') id: string) { return this.locationsService.findOne(id); }

  @Post() @Roles(Role.SUPER_ADMIN) @ApiOperation({ summary: 'Create location' })
  create(@Body() dto: CreateLocationDto) { return this.locationsService.create(dto); }

  @Patch(':id') @Roles(Role.SUPER_ADMIN) @ApiOperation({ summary: 'Update location' })
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) { return this.locationsService.update(id, dto); }

  @Delete(':id') @Roles(Role.SUPER_ADMIN) @ApiOperation({ summary: 'Delete location' })
  remove(@Param('id') id: string) { return this.locationsService.remove(id); }
}
