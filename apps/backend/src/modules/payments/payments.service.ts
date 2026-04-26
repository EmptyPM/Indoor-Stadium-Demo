import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: PaymentStatus }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = query.status ? { status: query.status } : {};

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              court: { include: { stadium: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            court: { include: { stadium: true } },
          },
        },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByBooking(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true },
    });
  }

  async markAsPaid(id: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment is already marked as paid');
    }

    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.PAID,
          method: dto.method || payment.method,
          transactionId: dto.transactionId,
          notes: dto.notes,
          paidAt: new Date(),
        },
      }),
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      }),
    ]);

    return updatedPayment;
  }

  async refund(id: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Can only refund paid payments');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        notes: reason || 'Refunded',
        refundedAt: new Date(),
      },
    });
  }

  async getStats() {
    const [total, paid, pending, refunded] = await Promise.all([
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.REFUNDED },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalRevenue: paid._sum.amount || 0,
      totalTransactions: paid._count,
      pendingAmount: pending._sum.amount || 0,
      pendingCount: pending._count,
      refundedAmount: refunded._sum.amount || 0,
      refundedCount: refunded._count,
    };
  }
}
