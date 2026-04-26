#!/bin/sh
set -e

echo "🚀 Starting Indoor Booking Backend..."

# Run Prisma schema sync/migrations automatically.
# If migrations exist, use migrate deploy (production-safe).
# If no migrations exist yet, fallback to db push for first-time setup.
if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations)" ]; then
  echo "📦 Running Prisma migrations..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma
else
  echo "📦 No migrations found. Running Prisma db push..."
  npx prisma db push --schema=./prisma/schema.prisma
fi

echo "✅ Migrations complete. Starting server..."
exec "$@"
