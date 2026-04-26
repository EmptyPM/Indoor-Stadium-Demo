import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const pwd = await bcrypt.hash('Admin@123!', 12);

  // ── Users ───────────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@indoorbook.com' },
    update: {},
    create: { email: 'admin@indoorbook.com', passwordHash: pwd, name: 'Super Admin', phone: '+94771234567', role: Role.SUPER_ADMIN },
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@indoorbook.com' },
    update: {},
    create: { email: 'manager@indoorbook.com', passwordHash: pwd, name: 'Stadium Manager', phone: '+94779876543', role: Role.MANAGER },
  });
  await prisma.user.upsert({
    where: { email: 'user@indoorbook.com' },
    update: {},
    create: { email: 'user@indoorbook.com', passwordHash: pwd, name: 'John Doe', phone: '+94761234567', role: Role.USER },
  });

  // ── Locations ────────────────────────────────────────────────────────────────
  const colombo = await prisma.location.upsert({
    where: { name: 'Colombo' },
    update: {},
    create: { name: 'Colombo', province: 'Western Province' },
  });
  const kandy = await prisma.location.upsert({
    where: { name: 'Kandy' },
    update: {},
    create: { name: 'Kandy', province: 'Central Province' },
  });
  const galle = await prisma.location.upsert({
    where: { name: 'Galle' },
    update: {},
    create: { name: 'Galle', province: 'Southern Province' },
  });
  await prisma.location.upsert({ where: { name: 'Kurunegala' }, update: {}, create: { name: 'Kurunegala', province: 'North Western Province' } });
  await prisma.location.upsert({ where: { name: 'Matara' }, update: {}, create: { name: 'Matara', province: 'Southern Province' } });
  await prisma.location.upsert({ where: { name: 'Negombo' }, update: {}, create: { name: 'Negombo', province: 'Western Province' } });

  // ── Sports ───────────────────────────────────────────────────────────────────
  const badminton = await prisma.sport.upsert({
    where: { name: 'Badminton' },
    update: {},
    create: { name: 'Badminton', icon: '🏸', description: 'Indoor racket sport' },
  });
  const tennis = await prisma.sport.upsert({
    where: { name: 'Tennis' },
    update: {},
    create: { name: 'Tennis', icon: '🎾', description: 'Racket sport played on court' },
  });
  const cricket = await prisma.sport.upsert({
    where: { name: 'Cricket' },
    update: {},
    create: { name: 'Cricket', icon: '🏏', description: 'Indoor cricket nets' },
  });
  const basketball = await prisma.sport.upsert({
    where: { name: 'Basketball' },
    update: {},
    create: { name: 'Basketball', icon: '🏀', description: 'Full-court basketball' },
  });
  const squash = await prisma.sport.upsert({
    where: { name: 'Squash' },
    update: {},
    create: { name: 'Squash', icon: '🎱', description: 'Glass-backed squash courts' },
  });
  const volleyball = await prisma.sport.upsert({
    where: { name: 'Volleyball' },
    update: {},
    create: { name: 'Volleyball', icon: '🏐', description: 'Indoor volleyball courts' },
  });

  // ── Stadiums ──────────────────────────────────────────────────────────────────
  const colomboStadium = await prisma.stadium.upsert({
    where: { id: 'seed-stadium-01' },
    update: {},
    create: {
      id: 'seed-stadium-01',
      name: 'Colombo Sports Arena',
      description: 'Premier indoor sports facility in the heart of Colombo',
      locationId: colombo.id,
      address: '123 Sports Avenue, Colombo 03',
      phone: '+94112345678',
      email: 'info@colombosports.lk',
      images: ['https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800'],
      latitude: 6.9271,
      longitude: 79.8612,
      managers: { connect: [{ id: manager.id }, { id: superAdmin.id }] },
    },
  });
  const kandyStadium = await prisma.stadium.upsert({
    where: { id: 'seed-stadium-02' },
    update: {},
    create: {
      id: 'seed-stadium-02',
      name: 'Kandy Indoor Courts',
      description: 'Mountain city premium indoor courts',
      locationId: kandy.id,
      address: '45 Peradeniya Road, Kandy',
      phone: '+94812234567',
      email: 'info@kandycourts.lk',
      images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800'],
      latitude: 7.2906,
      longitude: 80.6337,
      managers: { connect: [{ id: superAdmin.id }] },
    },
  });
  await prisma.stadium.upsert({
    where: { id: 'seed-stadium-03' },
    update: {},
    create: {
      id: 'seed-stadium-03',
      name: 'Galle Sports Hub',
      description: 'Southern province sports hub',
      locationId: galle.id,
      address: '12 Lighthouse Street, Galle Fort',
      images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800'],
      managers: { connect: [{ id: superAdmin.id }] },
    },
  });

  // ── Courts ────────────────────────────────────────────────────────────────────
  const courtA = await prisma.court.upsert({
    where: { id: 'seed-court-01' },
    update: {},
    create: { id: 'seed-court-01', name: 'Badminton Court A', sportId: badminton.id, description: 'Professional wooden flooring', capacity: 4, stadiumId: colomboStadium.id },
  });
  await prisma.court.upsert({
    where: { id: 'seed-court-02' },
    update: {},
    create: { id: 'seed-court-02', name: 'Tennis Court 1', sportId: tennis.id, description: 'Hard surface, climate controlled', capacity: 4, stadiumId: colomboStadium.id },
  });
  await prisma.court.upsert({
    where: { id: 'seed-court-03' },
    update: {},
    create: { id: 'seed-court-03', name: 'Basketball Court', sportId: basketball.id, capacity: 10, stadiumId: kandyStadium.id },
  });
  await prisma.court.upsert({
    where: { id: 'seed-court-04' },
    update: {},
    create: { id: 'seed-court-04', name: 'Squash Court 1', sportId: squash.id, capacity: 2, stadiumId: 'seed-stadium-03' },
  });

  // ── Pricings ──────────────────────────────────────────────────────────────────
  await prisma.pricing.upsert({ where: { id: 'seed-pricing-01' }, update: {}, create: { id: 'seed-pricing-01', name: 'Off-Peak', pricePerHour: 500, startTime: '06:00', endTime: '16:00', dayOfWeek: [1,2,3,4,5], courtId: courtA.id } });
  await prisma.pricing.upsert({ where: { id: 'seed-pricing-02' }, update: {}, create: { id: 'seed-pricing-02', name: 'Peak Hours', pricePerHour: 800, startTime: '16:00', endTime: '22:00', dayOfWeek: [1,2,3,4,5], courtId: courtA.id } });
  await prisma.pricing.upsert({ where: { id: 'seed-pricing-03' }, update: {}, create: { id: 'seed-pricing-03', name: 'Weekend', pricePerHour: 1000, startTime: '06:00', endTime: '22:00', isWeekend: true, dayOfWeek: [0,6], courtId: courtA.id } });

  console.log('✅ Seeding complete!\n  Admin: admin@indoorbook.com / Admin@123!\n  User:  user@indoorbook.com / Admin@123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
