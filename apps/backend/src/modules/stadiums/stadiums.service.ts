import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';

// Shared include: managers + courts count
const stadiumInclude = {
  location: { select: { id: true, name: true } },
  managers: { select: { id: true, name: true, email: true, role: true } },
  _count: { select: { courts: true } },
} as const;

@Injectable()
export class StadiumsService {
  constructor(private prisma: PrismaService) {}

  // ── Create ───────────────────────────────────────────────────────────────────
  async create(dto: CreateStadiumDto, creatorId: string) {
    const location = await this.prisma.location.findUnique({ where: { id: dto.locationId } });
    if (!location) throw new NotFoundException('Location not found');

    const existing = await this.prisma.stadium.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' }, locationId: dto.locationId },
    });
    if (existing) throw new ConflictException(`Stadium "${dto.name}" already exists in ${location.name}`);

    // Creator is auto-added as first manager
    return this.prisma.stadium.create({
      data: {
        name: dto.name, description: dto.description, address: dto.address,
        locationId: dto.locationId, images: dto.images ?? [],
        phone: dto.phone, email: dto.email, latitude: dto.latitude, longitude: dto.longitude,
        managers: { connect: { id: creatorId } },
      },
      include: stadiumInclude,
    });
  }

  // ── List ─────────────────────────────────────────────────────────────────────
  async findAll(query: { page?: number; limit?: number; search?: string; locationId?: string; sportId?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.locationId) where.locationId = query.locationId;
    if (query.sportId) where.courts = { some: { sportId: query.sportId, isActive: true } };

    const [data, total] = await Promise.all([
      this.prisma.stadium.findMany({ where, skip, take: limit, include: stadiumInclude, orderBy: { createdAt: 'desc' } }),
      this.prisma.stadium.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Single ───────────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const stadium = await this.prisma.stadium.findUnique({
      where: { id },
      include: {
        location: true,
        managers: { select: { id: true, name: true, email: true, phone: true, role: true } },
        courts: {
          where: { isActive: true },
          include: { sport: true, pricings: true, _count: { select: { bookings: true } } },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { courts: true } },
      },
    });
    if (!stadium) throw new NotFoundException('Stadium not found');
    return stadium;
  }

  // ── Update ───────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateStadiumDto, requesterId: string, requesterRole: Role) {
    const stadium = await this.prisma.stadium.findUnique({
      where: { id }, include: { managers: { select: { id: true } } },
    });
    if (!stadium) throw new NotFoundException('Stadium not found');

    // Manager can only update if they're in the stadium's managers list
    if (requesterRole === Role.MANAGER && !stadium.managers.some(m => m.id === requesterId)) {
      throw new ForbiddenException('You can only update your own stadiums');
    }

    return this.prisma.stadium.update({
      where: { id }, data: dto, include: stadiumInclude,
    });
  }

  // ── Add manager to stadium ───────────────────────────────────────────────────
  async addManager(stadiumId: string, managerId: string) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) throw new NotFoundException('Stadium not found');

    const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
    if (!manager) throw new NotFoundException('User not found');
    if (manager.role === 'USER') throw new BadRequestException('User must be MANAGER or SUPER_ADMIN');

    return this.prisma.stadium.update({
      where: { id: stadiumId },
      data: { managers: { connect: { id: managerId } } },
      include: stadiumInclude,
    });
  }

  // ── Remove manager from stadium ──────────────────────────────────────────────
  async removeManager(stadiumId: string, managerId: string) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) throw new NotFoundException('Stadium not found');

    return this.prisma.stadium.update({
      where: { id: stadiumId },
      data: { managers: { disconnect: { id: managerId } } },
      include: stadiumInclude,
    });
  }

  // ── Deactivate ───────────────────────────────────────────────────────────────
  async remove(id: string) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');
    return this.prisma.stadium.update({ where: { id }, data: { isActive: false } });
  }

  async getLocations(): Promise<string[]> {
    const results = await this.prisma.location.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } });
    return results.map(r => r.name);
  }
}
