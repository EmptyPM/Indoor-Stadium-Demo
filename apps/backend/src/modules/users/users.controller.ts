import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Admin: list ──────────────────────────────────────────────────────────────
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  findAll(@Query() query: { page?: number; limit?: number; search?: string; role?: Role }) {
    return this.usersService.findAll(query);
  }

  // ── Admin: get managers list (for stadium assign dropdown) ───────────────────
  @Get('managers')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all managers and admins' })
  getManagers() { return this.usersService.getManagers(); }

  // ── Single user ──────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  // ── Admin: create user ───────────────────────────────────────────────────────
  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create user (Super Admin only)' })
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  // ── Update profile ───────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, dto, user.id, user.role);
  }

  // ── Admin: change role (auto-assigns all stadiums if SUPER_ADMIN) ─────────────
  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role — promotes to SUPER_ADMIN auto-assigns all stadiums' })
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  // ── Admin: bulk-assign stadiums to a manager ─────────────────────────────────
  @Patch(':id/assign-stadiums')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign multiple stadiums to a manager' })
  assignStadiums(@Param('id') id: string, @Body('stadiumIds') stadiumIds: string[]) {
    return this.usersService.assignStadiums(id, stadiumIds);
  }

  // ── Admin: activate ──────────────────────────────────────────────────────────
  @Patch(':id/activate')
  @Roles(Role.SUPER_ADMIN)
  activate(@Param('id') id: string) { return this.usersService.activate(id); }

  // ── Admin: deactivate ────────────────────────────────────────────────────────
  @Patch(':id/deactivate')
  @Roles(Role.SUPER_ADMIN)
  deactivate(@Param('id') id: string) { return this.usersService.deactivate(id); }

  // ── Admin: reset password ────────────────────────────────────────────────────
  @Patch(':id/reset-password')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reset user password (Super Admin only)' })
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.resetPassword(id, password);
  }
}
