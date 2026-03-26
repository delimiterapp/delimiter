import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const SQL = `
-- User
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Credential
CREATE TABLE IF NOT EXISTS "Credential" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "credentialId" TEXT NOT NULL,
  "publicKey" BYTEA NOT NULL,
  "counter" BIGINT NOT NULL DEFAULT 0,
  "transports" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Credential_credentialId_key" ON "Credential"("credentialId");
CREATE INDEX IF NOT EXISTS "Credential_userId_idx" ON "Credential"("userId");

-- Project
CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Project_key_key" ON "Project"("key");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");

-- RateLimitReport
CREATE TABLE IF NOT EXISTS "RateLimitReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "app" TEXT NOT NULL DEFAULT 'default',
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "limits" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimitReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "RateLimitReport_projectId_timestamp_idx" ON "RateLimitReport"("projectId", "timestamp");
CREATE INDEX IF NOT EXISTS "RateLimitReport_projectId_provider_idx" ON "RateLimitReport"("projectId", "provider");

-- AlertRule
CREATE TABLE IF NOT EXISTS "AlertRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "provider" TEXT,
  "warnAt" INTEGER NOT NULL DEFAULT 70,
  "criticalAt" INTEGER NOT NULL DEFAULT 90,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "AlertRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "AlertRule_projectId_provider_key" ON "AlertRule"("projectId", "provider");

-- AlertEvent
CREATE TABLE IF NOT EXISTS "AlertEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "app" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "threshold" INTEGER NOT NULL,
  "current" DOUBLE PRECISION NOT NULL,
  "limit" DOUBLE PRECISION NOT NULL,
  "percentage" DOUBLE PRECISION NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AlertEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AlertEvent_projectId_timestamp_idx" ON "AlertEvent"("projectId", "timestamp");

-- FallbackChain
CREATE TABLE IF NOT EXISTS "FallbackChain" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "chain" JSONB NOT NULL,
  "threshold" INTEGER NOT NULL DEFAULT 80,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "FallbackChain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "FallbackChain_projectId_key" ON "FallbackChain"("projectId");
`

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }

  const pool = new Pool({ connectionString: url })

  try {
    await pool.query(SQL)

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    const tables = result.rows.map((r) => r.table_name)

    await pool.end()

    return NextResponse.json({
      ok: true,
      message: 'All tables created successfully',
      tables,
    })
  } catch (err) {
    await pool.end()
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
