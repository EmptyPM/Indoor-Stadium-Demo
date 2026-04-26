import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { StadiumsService } from './stadiums.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Stadiums')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stadiums')
export class StadiumsController {
  constructor(private readonly stadiumsService: StadiumsService) {}

  // ── Public: list & detail ──────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all stadiums with filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'sportId', required: false })
  findAll(@Query() query: { page?: number; limit?: number; search?: string; locationId?: string; sportId?: string }) {
    return this.stadiumsService.findAll(query);
  }

  @Get('locations')
  @Public()
  @ApiOperation({ summary: 'Get all distinct locations' })
  getLocations() {
    return this.stadiumsService.getLocations();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get stadium by ID with courts' })
  findOne(@Param('id') id: string) {
    return this.stadiumsService.findOne(id);
  }

  // ── Protected: create/update/delete ───────────────────────────────────────

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new stadium (Admin/Manager)' })
  create(
    @Body() dto: CreateStadiumDto,
    @CurrentUser() user: any,
  ) {
    return this.stadiumsService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update stadium (Admin or own Manager)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStadiumDto,
    @CurrentUser() user: any,
  ) {
    return this.stadiumsService.update(id, dto, user.id, user.role);
  }

  @Patch(':id/add-manager')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add a manager to a stadium (many managers allowed)' })
  addManager(@Param('id') id: string, @Body('managerId') managerId: string) {
    return this.stadiumsService.addManager(id, managerId);
  }

  @Patch(':id/remove-manager')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove a manager from a stadium' })
  removeManager(@Param('id') id: string, @Body('managerId') managerId: string) {
    return this.stadiumsService.removeManager(id, managerId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete stadium (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.stadiumsService.remove(id);
  }
}
