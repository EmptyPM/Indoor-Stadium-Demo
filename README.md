# 🏟️ IndoorBook – Indoor Sports Booking System

A production-ready **monorepo** for an Indoor Sports Court Booking System built with NestJS, Next.js, PostgreSQL, Prisma, and Docker.

---

## 📁 Project Structure

```
indoor-booking-system/
├── apps/
│   ├── backend/                  # NestJS API (port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── seed.ts           # Seed data
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/         # JWT authentication
│   │       │   ├── users/        # User management
│   │       │   ├── stadiums/     # Venue management
│   │       │   ├── courts/       # Court management + availability
│   │       │   ├── bookings/     # Booking logic
│   │       │   ├── payments/     # Payment tracking
│   │       │   └── pricing/      # Dynamic pricing rules
│   │       ├── common/
│   │       │   ├── guards/       # JWT + Roles guards
│   │       │   └── decorators/   # CurrentUser, Roles, Public
│   │       ├── prisma/           # PrismaService
│   │       ├── main.ts
│   │       └── app.module.ts
│   │
│   └── frontend/                 # Next.js App Router (port 3000)
│       └── src/
│           ├── app/
│           │   ├── page.tsx           # Landing page
│           │   ├── (auth)/
│           │   │   ├── login/         # Login page
│           │   │   └── register/      # Register page
│           │   ├── dashboard/         # User dashboard
│           │   ├── stadiums/          # Venues listing
│           │   ├── stadium/[id]/      # Venue detail
│           │   ├── booking/           # Multi-step booking wizard
│           │   └── admin/             # Admin panel
│           ├── components/
│           │   └── providers.tsx      # React Query provider
│           ├── hooks/                 # React Query hooks
│           ├── lib/
│           │   ├── axios.ts           # Axios + JWT interceptors
│           │   └── utils.ts           # Utilities
│           └── store/
│               └── auth.store.ts      # Zustand auth store
│
├── packages/
│   └── types/                    # Shared TypeScript types
│
├── docker/
│   ├── backend.Dockerfile        # Multi-stage Node 20 build
│   ├── frontend.Dockerfile       # Standalone Next.js build
│   ├── backend-entrypoint.sh     # Runs migrations then starts server
│   └── init.sql                  # PostgreSQL initialization
│
├── docker-compose.yml            # All services
├── .env.example                  # Environment template
└── README.md
```

---

## 🚀 Quick Start with Docker

### 1. Clone and configure

```bash
git clone <repo-url>
cd indoor-booking-system

# Copy env file
cp .env.example .env

# Edit your secrets
nano .env
```

### 2. Run everything

```bash
docker-compose up --build
```

| Service  | URL                             |
|----------|---------------------------------|
| Frontend | http://localhost:3000           |
| Backend  | http://localhost:3001/api/v1    |
| Swagger  | http://localhost:3001/api/docs  |

---

## 💻 Local Development

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker (for PostgreSQL)

### 1. Start PostgreSQL only

```bash
docker-compose up db -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup backend

```bash
cd apps/backend
cp ../../.env.example .env
# Update DATABASE_URL to point to localhost:5432

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start dev server
npm run dev
```

### 4. Setup frontend

```bash
cd apps/frontend
cp ../../.env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3001

npm run dev
```

---

## 🗄️ Database

### Prisma Commands

```bash
# From apps/backend directory or workspace root

# Generate Prisma client after schema changes
npm run prisma:generate --workspace=apps/backend

# Create a new migration
npm run prisma:migrate --workspace=apps/backend

# Deploy migrations (production)
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

# Open Prisma Studio (GUI)
npm run prisma:studio --workspace=apps/backend

# Seed database with sample data
npm run prisma:seed --workspace=apps/backend
```

### Schema Models

| Model   | Description                              |
|---------|------------------------------------------|
| User    | Accounts with roles (SUPER_ADMIN, MANAGER, USER) |
| Stadium | Sports venues with manager assignment    |
| Court   | Individual courts within stadiums        |
| Booking | Reservations with time slots             |
| Payment | Payment records linked to bookings       |
| Pricing | Time-based pricing rules per court       |

---

## 🔑 Authentication

- **JWT Bearer tokens** (access + refresh)
- **Role-based access control** (RBAC)
- Roles: `SUPER_ADMIN`, `MANAGER`, `USER`

### Demo Credentials (after seeding)

| Role        | Email                      | Password    |
|-------------|----------------------------|-------------|
| Super Admin | admin@indoorbook.com       | Admin@123!  |
| Manager     | manager@indoorbook.com     | Admin@123!  |
| User        | user@indoorbook.com        | Admin@123!  |

---

## 🌐 API Endpoints

### Auth
| Method | Path                    | Auth     | Description        |
|--------|-------------------------|----------|--------------------|
| POST   | /api/v1/auth/register   | Public   | Register user      |
| POST   | /api/v1/auth/login      | Public   | Login              |
| GET    | /api/v1/auth/me         | JWT      | Get profile        |
| POST   | /api/v1/auth/refresh    | JWT      | Refresh token      |

### Stadiums
| Method | Path                    | Auth             | Description        |
|--------|-------------------------|------------------|--------------------|
| GET    | /api/v1/stadiums        | Public           | List stadiums      |
| GET    | /api/v1/stadiums/:id    | Public           | Get stadium        |
| POST   | /api/v1/stadiums        | MANAGER+         | Create stadium     |
| PATCH  | /api/v1/stadiums/:id    | MANAGER+         | Update stadium     |
| DELETE | /api/v1/stadiums/:id    | SUPER_ADMIN      | Delete stadium     |

### Courts
| Method | Path                              | Auth     | Description           |
|--------|-----------------------------------|----------|-----------------------|
| GET    | /api/v1/courts/stadium/:stadiumId | Public   | Courts by stadium     |
| GET    | /api/v1/courts/:id                | Public   | Court details         |
| GET    | /api/v1/courts/:id/availability   | Public   | Available time slots  |
| POST   | /api/v1/courts                    | MANAGER+ | Create court          |

### Bookings
| Method | Path                     | Auth | Description          |
|--------|--------------------------|------|----------------------|
| GET    | /api/v1/bookings         | JWT  | List bookings        |
| POST   | /api/v1/bookings         | JWT  | Create booking       |
| GET    | /api/v1/bookings/:id     | JWT  | Get booking          |
| PATCH  | /api/v1/bookings/:id/cancel | JWT | Cancel booking    |
| PATCH  | /api/v1/bookings/:id/confirm | MANAGER+ | Confirm booking |

### Payments
| Method | Path                      | Auth     | Description     |
|--------|---------------------------|----------|-----------------|
| GET    | /api/v1/payments          | MANAGER+ | List payments   |
| GET    | /api/v1/payments/stats    | MANAGER+ | Stats           |
| PATCH  | /api/v1/payments/:id/pay  | MANAGER+ | Mark as paid    |
| PATCH  | /api/v1/payments/:id/refund | SUPER_ADMIN | Refund     |

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose up --build backend
```

---

## 🏗️ Tech Stack

### Backend
- **NestJS** – Scalable Node.js framework
- **Prisma** – Type-safe ORM
- **PostgreSQL** – Relational database
- **Passport.js + JWT** – Authentication
- **class-validator** – Request validation
- **Swagger** – API documentation

### Frontend
- **Next.js 14** – App Router
- **TailwindCSS** – Utility-first CSS
- **shadcn/ui** – Component library (Radix UI)
- **React Query** – Server state management
- **Zustand** – Client state management
- **React Hook Form + Zod** – Form validation
- **Axios** – HTTP client with interceptors

### DevOps
- **Docker + docker-compose** – Containerization
- **Multi-stage Dockerfiles** – Optimized images
- **PostgreSQL 15** – Production database

---

## 🧩 Key Features

- ✅ **Multi-step booking wizard** with real-time availability
- ✅ **Role-based access control** (Super Admin / Manager / User)
- ✅ **Dynamic pricing** based on time of day and weekends
- ✅ **Conflict detection** – prevents double bookings
- ✅ **JWT auth** with auto-refresh via interceptors
- ✅ **Payment tracking** with paid/refund flow
- ✅ **Prisma migrations** auto-run on container start
- ✅ **Swagger API docs** in development mode
- ✅ **Seed script** with demo data

---

## 📝 Environment Variables

See `.env.example` for the full list. Key variables:

```env
DATABASE_URL=postgresql://user:pass@db:5432/indoor_booking
JWT_SECRET=your_very_long_secret_here
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> ⚠️ Never commit `.env` to version control. Always use `.env.example` as template.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License © 2025 IndoorBook Team
