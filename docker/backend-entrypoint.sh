#!/bin/sh
set -e

echo "🚀 Starting Indoor Booking Backend..."

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "✅ Migrations complete. Starting server..."
exec "$@"
