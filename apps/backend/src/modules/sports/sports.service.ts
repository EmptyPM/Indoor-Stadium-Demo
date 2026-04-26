import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSportDto) {
    const existing = await this.prisma.sport.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Sport "${dto.name}" already exists`);
    return this.prisma.sport.create({ data: dto, include: { _count: { select: { courts: true } } } });
  }

  async findAll(search?: string) {
    return this.prisma.sport.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      include: { _count: { select: { courts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const sport = await this.prisma.sport.findUnique({
      where: { id },
      include: { courts: { where: { isActive: true }, take: 10 }, _count: { select: { courts: true } } },
    });
    if (!sport) throw new NotFoundException('Sport not found');
    return sport;
  }

  async update(id: string, dto: UpdateSportDto) {
    const sport = await this.prisma.sport.findUnique({ where: { id } });
    if (!sport) throw new NotFoundException('Sport not found');
    if (dto.name && dto.name !== sport.name) {
      const conflict = await this.prisma.sport.findUnique({ where: { name: dto.name } });
      if (conflict) throw new ConflictException(`Sport "${dto.name}" already exists`);
    }
    return this.prisma.sport.update({ where: { id }, data: dto, include: { _count: { select: { courts: true } } } });
  }

  async remove(id: string) {
    const sport = await this.prisma.sport.findUnique({ where: { id }, include: { _count: { select: { courts: true } } } });
    if (!sport) throw new NotFoundException('Sport not found');
    if (sport._count.courts > 0) throw new BadRequestException('Cannot delete a sport that is used by courts');
    return this.prisma.sport.delete({ where: { id } });
  }
}
