import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCourtDto, requesterId: string, requesterRole: Role) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id: dto.stadiumId } });
    if (!stadium) throw new NotFoundException('Stadium not found');

    if (requesterRole === Role.MANAGER) {
      const s = await this.prisma.stadium.findUnique({ where: { id: dto.stadiumId }, include: { managers: { select: { id: true } } } });
      if (!s?.managers.some(m => m.id === requesterId)) throw new ForbiddenException('You can only manage courts in your stadium');
    }

    const sport = await this.prisma.sport.findUnique({ where: { id: dto.sportId } });
    if (!sport) throw new NotFoundException('Sport not found');

    // Duplicate name check within stadium
    const existing = await this.prisma.court.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' }, stadiumId: dto.stadiumId },
    });
    if (existing) throw new ConflictException(`A court named "${dto.name}" already exists in this stadium`);

    return this.prisma.court.create({
      data: dto,
      include: { stadium: { select: { id: true, name: true } }, sport: { select: { id: true, name: true, icon: true } } },
    });
  }

  async findAll(query: { stadiumId?: string; locationId?: string; sportId?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (query.stadiumId) where.stadiumId = query.stadiumId;
    if (query.sportId) where.sportId = query.sportId;
    if (query.locationId) where.stadium = { locationId: query.locationId };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.court.findMany({
        where, skip, take: limit,
        include: {
          stadium: { select: { id: true, name: true, location: { select: { id: true, name: true } } } },
          sport: { select: { id: true, name: true, icon: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.court.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByStadium(stadiumId: string) {
    return this.prisma.court.findMany({
      where: { stadiumId, isActive: true },
      include: { sport: { select: { id: true, name: true, icon: true } }, pricings: true, _count: { select: { bookings: true } } },
    });
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        stadium: { include: { location: true } },
        sport: true,
        pricings: true,
        _count: { select: { bookings: true } },
      },
    });
    if (!court) throw new NotFoundException('Court not found');
    return court;
  }

  async update(id: string, dto: UpdateCourtDto, requesterId: string, requesterRole: Role) {
    const court = await this.prisma.court.findUnique({ where: { id }, include: { stadium: true } });
    if (!court) throw new NotFoundException('Court not found');

    if (requesterRole === Role.MANAGER) {
      const s = await this.prisma.stadium.findUnique({ where: { id: court.stadiumId }, include: { managers: { select: { id: true } } } });
      if (!s?.managers.some(m => m.id === requesterId)) throw new ForbiddenException('You can only manage courts in your stadium');
    }

    return this.prisma.court.update({
      where: { id }, data: dto,
      include: { sport: { select: { id: true, name: true, icon: true } }, stadium: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, requesterId: string, requesterRole: Role) {
    const court = await this.prisma.court.findUnique({ where: { id }, include: { stadium: true } });
    if (!court) throw new NotFoundException('Court not found');

    if (requesterRole === Role.MANAGER) {
      const s = await this.prisma.stadium.findUnique({ where: { id: court.stadiumId }, include: { managers: { select: { id: true } } } });
      if (!s?.managers.some(m => m.id === requesterId)) throw new ForbiddenException('You can only manage courts in your stadium');
    }

    return this.prisma.court.update({ where: { id }, data: { isActive: false } });
  }

  async getAvailability(courtId: string, date: string) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId }, include: { pricings: true } });
    if (!court) throw new NotFoundException('Court not found');

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    const existingBookings = await this.prisma.booking.findMany({
      where: { courtId, bookingDate, status: { notIn: ['CANCELLED'] } },
      select: { startTime: true, endTime: true },
    });

    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
      const isBooked = existingBookings.some((b) => b.startTime === startTime);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const pricing = court.pricings.find((p) => {
        if (p.isWeekend !== isWeekend) return false;
        return startTime >= p.startTime && startTime < p.endTime;
      });
      slots.push({ startTime, endTime, isAvailable: !isBooked, price: pricing?.pricePerHour || 500 });
    }

    return { courtId, date, slots };
  }
}
