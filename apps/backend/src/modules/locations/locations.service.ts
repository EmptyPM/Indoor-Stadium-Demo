import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLocationDto) {
    const existing = await this.prisma.location.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Location "${dto.name}" already exists`);
    return this.prisma.location.create({ data: dto, include: { _count: { select: { stadiums: true } } } });
  }

  async findAll(search?: string) {
    return this.prisma.location.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      include: { _count: { select: { stadiums: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const loc = await this.prisma.location.findUnique({
      where: { id },
      include: { stadiums: { where: { isActive: true }, include: { _count: { select: { courts: true } } } }, _count: { select: { stadiums: true } } },
    });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  async update(id: string, dto: UpdateLocationDto) {
    const loc = await this.prisma.location.findUnique({ where: { id } });
    if (!loc) throw new NotFoundException('Location not found');
    if (dto.name && dto.name !== loc.name) {
      const conflict = await this.prisma.location.findUnique({ where: { name: dto.name } });
      if (conflict) throw new ConflictException(`Location "${dto.name}" already exists`);
    }
    return this.prisma.location.update({ where: { id }, data: dto, include: { _count: { select: { stadiums: true } } } });
  }

  async remove(id: string) {
    const loc = await this.prisma.location.findUnique({ where: { id }, include: { _count: { select: { stadiums: true } } } });
    if (!loc) throw new NotFoundException('Location not found');
    if (loc._count.stadiums > 0) throw new BadRequestException('Cannot delete a location that has stadiums');
    return this.prisma.location.delete({ where: { id } });
  }
}
