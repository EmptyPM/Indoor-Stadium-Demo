import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaymentStatus, Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  findAll(@Query() query: { page?: number; limit?: number; status?: PaymentStatus }) {
    return this.paymentsService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get payment statistics' })
  getStats() {
    return this.paymentsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payment by booking ID' })
  findByBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Patch(':id/pay')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Mark payment as paid' })
  markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentsService.markAsPaid(id, dto);
  }

  @Patch(':id/refund')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Refund a payment (Super Admin only)' })
  refund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.paymentsService.refund(id, reason);
  }
}
