import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Courts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get() @Public()
  @ApiQuery({ name: 'stadiumId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'sportId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: any) { return this.courtsService.findAll(query); }

  @Get('stadium/:stadiumId') @Public()
  findByStadium(@Param('stadiumId') stadiumId: string) { return this.courtsService.findByStadium(stadiumId); }

  @Get(':id') @Public()
  findOne(@Param('id') id: string) { return this.courtsService.findOne(id); }

  @Get(':id/availability') @Public()
  @ApiQuery({ name: 'date', required: true })
  getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.courtsService.getAvailability(id, date);
  }

  @Post() @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  create(@Body() dto: CreateCourtDto, @CurrentUser() user: any) {
    return this.courtsService.create(dto, user.id, user.role);
  }

  @Patch(':id') @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCourtDto, @CurrentUser() user: any) {
    return this.courtsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id') @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.courtsService.remove(id, user.id, user.role);
  }
}
