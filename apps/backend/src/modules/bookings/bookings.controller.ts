import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingStatus, Role } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingsService.create(dto, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  findMy(
    @Query() query: any,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingsService.findMyBookings(userId, query);
  }

  @Get()
  @ApiOperation({ summary: 'Get bookings (filtered by role)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'courtId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query() query: any,
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    return this.bookingsService.findAll(query, requesterId, requesterRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    return this.bookingsService.findOne(id, requesterId, requesterRole);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    return this.bookingsService.cancel(id, requesterId, requesterRole, reason);
  }

  @Patch(':id/confirm')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Confirm a booking (Manager/Admin)' })
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.confirm(id);
  }
}
