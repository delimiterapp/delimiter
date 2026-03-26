#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../apps/web"

echo "=== Delimiter Database Setup ==="
echo ""
echo "Generating Prisma client..."
npx prisma generate

echo ""
echo "Pushing schema to Neon database..."
npx prisma db push

echo ""
echo "=== Done! ==="
echo "Tables created: User, Credential, Project, RateLimitReport, AlertRule, AlertEvent, FallbackChain"
echo ""
echo "Run 'npx prisma studio' to browse your database."
