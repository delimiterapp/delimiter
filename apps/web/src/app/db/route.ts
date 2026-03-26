import { NextResponse } from 'next/server'
import { Pool } from 'pg'

/**
 * Idempotent database migration.
 *
 * - CREATE TABLE IF NOT EXISTS: creates tables on first run
 * - ALTER TABLE ADD COLUMN IF NOT EXISTS: adds new columns to existing tables
 * - CREATE INDEX IF NOT EXISTS: adds missing indexes
 * - DO/EXCEPTION blocks: adds foreign keys + constraints without failing if they exist
 *
 * Safe to hit repeatedly. Handles both fresh setup and schema evolution.
 */
const SQL = `

-- ============================================================
-- 1. TABLES (create if not exists with only PK)
-- ============================================================

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Credential" (
  "id" TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "RateLimitReport" (
  "id" TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "AlertRule" (
  "id" TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "AlertEvent" (
  "id" TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "FallbackChain" (
  "id" TEXT NOT NULL PRIMARY KEY
);

-- ============================================================
-- 2. COLUMNS (add if not exists — handles migrations)
-- ============================================================

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Credential
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "credentialId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "publicKey" BYTEA NOT NULL DEFAULT ''::BYTEA;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "counter" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "transports" TEXT[] DEFAULT '{}';
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "key" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- RateLimitReport
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "projectId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "app" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT '';
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "limits" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "RateLimitReport" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlertRule
ALTER TABLE "AlertRule" ADD COLUMN IF NOT EXISTS "projectId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AlertRule" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "AlertRule" ADD COLUMN IF NOT EXISTS "warnAt" INTEGER NOT NULL DEFAULT 70;
ALTER TABLE "AlertRule" ADD COLUMN IF NOT EXISTS "criticalAt" INTEGER NOT NULL DEFAULT 90;
ALTER TABLE "AlertRule" ADD COLUMN IF NOT EXISTS "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlertEvent
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "projectId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "app" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "metric" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "threshold" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "current" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "limit" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "AlertEvent" ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- FallbackChain
ALTER TABLE "FallbackChain" ADD COLUMN IF NOT EXISTS "projectId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FallbackChain" ADD COLUMN IF NOT EXISTS "chain" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "FallbackChain" ADD COLUMN IF NOT EXISTS "threshold" INTEGER NOT NULL DEFAULT 80;
ALTER TABLE "FallbackChain" ADD COLUMN IF NOT EXISTS "enabled" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 3. INDEXES (create if not exists)
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "Credential_credentialId_key" ON "Credential"("credentialId");
CREATE INDEX IF NOT EXISTS "Credential_userId_idx" ON "Credential"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "Project_key_key" ON "Project"("key");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");

CREATE INDEX IF NOT EXISTS "RateLimitReport_projectId_timestamp_idx" ON "RateLimitReport"("projectId", "timestamp");
CREATE INDEX IF NOT EXISTS "RateLimitReport_projectId_provider_idx" ON "RateLimitReport"("projectId", "provider");

CREATE UNIQUE INDEX IF NOT EXISTS "AlertRule_projectId_provider_key" ON "AlertRule"("projectId", "provider");

CREATE INDEX IF NOT EXISTS "AlertEvent_projectId_timestamp_idx" ON "AlertEvent"("projectId", "timestamp");

CREATE UNIQUE INDEX IF NOT EXISTS "FallbackChain_projectId_key" ON "FallbackChain"("projectId");

-- ============================================================
-- 4. FOREIGN KEYS (add if not exists via exception handling)
-- ============================================================

DO $$ BEGIN
  ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "RateLimitReport" ADD CONSTRAINT "RateLimitReport_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "FallbackChain" ADD CONSTRAINT "FallbackChain_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

`

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }

  const pool = new Pool({ connectionString: url })
  const applied: string[] = []

  try {
    await pool.query(SQL)
    applied.push('tables', 'columns', 'indexes', 'foreign_keys')

    // Report current state
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `)

    const columns = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)

    const schema: Record<string, string[]> = {}
    for (const row of columns.rows) {
      if (!schema[row.table_name]) schema[row.table_name] = []
      schema[row.table_name].push(row.column_name)
    }

    await pool.end()

    return NextResponse.json({
      ok: true,
      message: 'Database migrated successfully',
      applied,
      tables: tables.rows.map((r) => r.table_name),
      schema,
    })
  } catch (err) {
    await pool.end()
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      applied,
    }, { status: 500 })
  }
}
