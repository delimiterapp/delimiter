/**
 * One-time migration: mark all existing users as onboarding-complete
 * so they skip the new onboarding flow.
 *
 * Run with: npx tsx scripts/migrate-existing-users.ts
 */
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const db = new PrismaClient({ adapter })

async function main() {
  const result = await db.user.updateMany({
    where: { onboardingComplete: false },
    data: { onboardingComplete: true, plan: 'pro' },
  })
  console.log(`Migrated ${result.count} existing users to onboardingComplete=true, plan=pro`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
