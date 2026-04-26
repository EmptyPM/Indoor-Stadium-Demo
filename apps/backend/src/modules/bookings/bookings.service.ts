import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBookingDto, userId: string) {
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      include: { pricings: true },
    });

    if (!court) throw new NotFoundException('Court not found');
    if (!court.isActive) throw new BadRequestException('Court is not available');

    const bookingDate = new Date(dto.bookingDate);

    // Check for conflicts
    const conflict = await this.prisma.booking.findFirst({
      where: {
        courtId: dto.courtId,
        bookingDate,
        startTime: dto.startTime,
        status: { notIn: [BookingStatus.CANCELLED] },
      },
    });

    if (conflict) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Calculate price
    const dayOfWeek = bookingDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const pricing = court.pricings.find((p) => {
      if (p.isWeekend !== isWeekend) return false;
      return dto.startTime >= p.startTime && dto.startTime < p.endTime;
    });

    const pricePerHour = pricing?.pricePerHour || 500;
    const totalHours = this.calculateHours(dto.startTime, dto.endTime);
    const totalPrice = pricePerHour * totalHours;

    const booking = await this.prisma.booking.create({
      data: {
        bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        totalHours,
        totalPrice,
        notes: dto.notes,
        courtId: dto.courtId,
        userId,
      },
      include: {
        court: { include: { stadium: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Auto-create pending payment
    await this.prisma.payment.create({
      data: {
        amount: totalPrice,
        method: dto.paymentMethod || 'CASH',
        bookingId: booking.id,
      },
    });

    return booking;
  }

  async findMyBookings(userId: string, query: { page?: number; limit?: number; status?: BookingStatus }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, skip, take: limit,
        include: {
          court: {
            include: {
              sport: { select: { id: true, name: true, icon: true } },
              stadium: { include: { location: { select: { id: true, name: true } } } },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      status?: BookingStatus;
      courtId?: string;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    requesterId: string,
    requesterRole: Role,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admins can only see their own bookings
    if (requesterRole === Role.USER) {
      where.userId = requesterId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) where.status = query.status;
    if (query.courtId) where.courtId = query.courtId;
    if (query.dateFrom || query.dateTo) {
      where.bookingDate = {};
      if (query.dateFrom) where.bookingDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.bookingDate.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          court: { include: { stadium: { select: { id: true, name: true, location: { select: { id: true, name: true } } } } } },
          user: { select: { id: true, name: true, email: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, requesterId: string, requesterRole: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        court: { include: { stadium: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (
      requesterRole === Role.USER &&
      booking.userId !== requesterId
    ) {
      throw new ForbiddenException('Cannot access this booking');
    }

    return booking;
  }

  async cancel(id: string, requesterId: string, requesterRole: Role, reason?: string) {
    const booking = await this.findOne(id, requesterId, requesterRole);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });
  }

  async confirm(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
    });
  }

  private calculateHours(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM - (startH * 60 + startM)) / 60;
  }
}
