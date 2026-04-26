# 🏟️ IndoorBook — Indoor Sports Court Booking System

A full-stack web application for managing and booking indoor sports courts.  
Admins manage stadiums, courts, users and payments. Users browse and book courts online.

---

## 📁 Project Structure

```
indoor-booking-system/
├── apps/
│   ├── backend/        ← NestJS API (port 4000)
│   └── frontend/       ← Next.js website (port 3000)
├── packages/
│   └── types/          ← Shared TypeScript types
├── docker/             ← Docker config files
└── docker-compose.yml  ← Runs everything with one command
```

---

## 🚀 Quick Start (Local Development)

### 1. Requirements

Make sure you have these installed:
- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) running locally **OR** [Docker](https://www.docker.com/)

---

### 2. Clone & Install

```bash
git clone https://github.com/EmptyPM/Indoor-Stadium-Demo.git
cd Indoor-Stadium-Demo
npm install
```

---

### 3. Set Up Environment Variables

**Backend** — copy and edit:
```bash
# File: apps/backend/.env
DATABASE_URL=postgresql://booking_user:booking_pass@localhost:5432/indoor_booking
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
BACKEND_PORT=4000
NODE_ENV=development
```

**Frontend** — copy and edit:
```bash
# File: apps/frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=IndoorBook
```

---

### 4. Start the Database

**Option A — Docker (easiest):**
```bash
docker-compose up -d db
```

**Option B — Local PostgreSQL:**
Create a database named `indoor_booking` with the credentials above.

---

### 5. Set Up the Database Schema

```bash
cd apps/backend
npx prisma db push       # creates all tables
npx prisma db seed       # adds sample data (sports, locations, etc.)
```

---

### 6. Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd apps/backend
npm run dev
# → Running at http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd apps/frontend
npm run dev
# → Running at http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## 🐳 Run with Docker (All-in-One)

```bash
docker-compose up --build
```

This starts the database, backend, and frontend together.

---

## 👤 Default Login

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@indoorbook.com` | `Admin@123` |
| Manager | `manager@indoorbook.com` | `Manager@123` |

---

## 📱 Pages & Features

### 👥 User Side
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with venue search |
| Browse Venues | `/stadiums` | List all stadiums |
| Venue Detail | `/stadium/:id` | Courts & pricing |
| Book a Court | `/booking` | Step-by-step booking flow |
| My Bookings | `/dashboard` | View & cancel bookings |
| Payment History | `/dashboard/payments` | All transactions |
| My Profile | `/dashboard/profile` | Edit name, phone |

### 🔧 Admin Side (`/admin`)
| Section | Description |
|---------|-------------|
| Overview | Stats and recent bookings |
| Users | Add/edit users, assign roles |
| Stadiums | Add/edit stadiums, assign managers |
| Courts | Add courts with sport, hours, pricing |
| Bookings | View all bookings per stadium, confirm/cancel |
| Payments | Full payment history, mark paid, refund |
| Locations | Manage city/area locations |
| Sports | Manage sport types with icons |
| Settings | Payment methods, bank accounts, password |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) |
| State | Zustand |
| Data fetching | TanStack Query (React Query) |

---

## 🔑 User Roles

| Role | What they can do |
|------|-----------------|
| `SUPER_ADMIN` | Full access — all stadiums, users, settings |
| `MANAGER` | Manage assigned stadiums and their courts/bookings |
| `USER` | Browse venues, book courts, view own history |

---

## 📡 API

The backend API runs at `http://localhost:4000`

**Swagger docs:** `http://localhost:4000/api`

Key endpoints:
```
POST   /auth/login          → Login
POST   /auth/register       → Register
GET    /stadiums            → List stadiums
GET    /courts              → List courts
POST   /bookings            → Create booking
GET    /bookings/my         → My bookings
GET    /payments            → All payments (admin)
```

---

## 🗃️ Database

View and edit data visually:
```bash
cd apps/backend
npx prisma studio
# Opens at http://localhost:5555
```

Make schema changes:
```bash
# After editing apps/backend/prisma/schema.prisma
npx prisma db push
npx prisma generate
```

---

## 📦 Build for Production

```bash
# Backend
cd apps/backend
npm run build

# Frontend
cd apps/frontend
npm run build
npm run start
```

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "feat: describe your change"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

> Built with ❤️ for indoor sports communities.
