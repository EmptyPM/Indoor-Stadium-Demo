import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ── Admin: create user ───────────────────────────────────────────────────────
  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, role: dto.role ?? Role.USER, phone: dto.phone },
      select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
    });
  }

  // ── List users ───────────────────────────────────────────────────────────────
  async findAll(query: { page?: number; limit?: number; search?: string; role?: Role }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        select: {
          id: true, email: true, name: true, phone: true, role: true,
          isActive: true, lastLoginAt: true, createdAt: true,
          managedStadiums: { select: { id: true, name: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Single user ──────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true,
        managedStadiums: { select: { id: true, name: true, location: { select: { id: true, name: true } } } },
        bookings: {
          take: 5, orderBy: { createdAt: 'desc' },
          include: { court: { include: { sport: { select: { id: true, name: true, icon: true } }, stadium: { select: { id: true, name: true } } } } },
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ── Update user ──────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (requesterId !== id && requesterRole === Role.USER) throw new ForbiddenException('Cannot update other users');

    return this.prisma.user.update({
      where: { id }, data: dto,
      select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, updatedAt: true },
    });
  }

  // ── Change role ───────────────────────────────────────────────────────────────
  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({ where: { id }, data: { role } });

    // Auto-connect ALL stadiums when promoted to SUPER_ADMIN
    if (role === Role.SUPER_ADMIN) {
      const allStadiums = await this.prisma.stadium.findMany({ select: { id: true } });
      await this.prisma.user.update({
        where: { id },
        data: { managedStadiums: { connect: allStadiums.map(s => ({ id: s.id })) } },
      });
    }

    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true,
        managedStadiums: { select: { id: true, name: true } },
      },
    });
  }

  // ── Assign multiple stadiums to a user (connect, not replace) ────────────────
  async assignStadiums(userId: string, stadiumIds: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const stadiums = await this.prisma.stadium.findMany({ where: { id: { in: stadiumIds } } });
    if (stadiums.length !== stadiumIds.length) throw new NotFoundException('One or more stadiums not found');

    // Connect (add) — doesn't remove existing assignments
    await this.prisma.user.update({
      where: { id: userId },
      data: { managedStadiums: { connect: stadiumIds.map(id => ({ id })) } },
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        managedStadiums: { select: { id: true, name: true, location: { select: { name: true } } } },
      },
    });
  }

  // ── Activate / Deactivate ────────────────────────────────────────────────────
  async setActive(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { isActive }, select: { id: true, email: true, isActive: true } });
  }

  async deactivate(id: string) { return this.setActive(id, false); }
  async activate(id: string)   { return this.setActive(id, true); }

  // ── Reset password (admin) ───────────────────────────────────────────────────
  async resetPassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return this.prisma.user.update({ where: { id }, data: { passwordHash }, select: { id: true, email: true } });
  }

  // ── Get all managers (for stadium assignment) ────────────────────────────────
  async getManagers() {
    return this.prisma.user.findMany({
      where: { role: { in: [Role.MANAGER, Role.SUPER_ADMIN] }, isActive: true },
      select: {
        id: true, name: true, email: true, role: true,
        managedStadiums: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
