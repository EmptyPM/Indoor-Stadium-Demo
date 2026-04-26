import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePricingDto) {
    const court = await this.prisma.court.findUnique({ where: { id: dto.courtId } });
    if (!court) throw new NotFoundException('Court not found');

    return this.prisma.pricing.create({
      data: dto,
      include: { court: { select: { id: true, name: true } } },
    });
  }

  async findByCourt(courtId: string) {
    return this.prisma.pricing.findMany({
      where: { courtId },
      orderBy: [{ isWeekend: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const pricing = await this.prisma.pricing.findUnique({
      where: { id },
      include: { court: { include: { stadium: true } } },
    });

    if (!pricing) throw new NotFoundException('Pricing not found');
    return pricing;
  }

  async update(id: string, dto: UpdatePricingDto) {
    const pricing = await this.prisma.pricing.findUnique({ where: { id } });
    if (!pricing) throw new NotFoundException('Pricing not found');

    return this.prisma.pricing.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const pricing = await this.prisma.pricing.findUnique({ where: { id } });
    if (!pricing) throw new NotFoundException('Pricing not found');

    return this.prisma.pricing.delete({ where: { id } });
  }
}
