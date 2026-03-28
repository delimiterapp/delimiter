import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { pollBillingData } from '@/lib/billing'

/**
 * POST /api/connections/poll — poll billing data for a connected provider.
 *
 * Fetches latest balance/spend from the provider's billing API
 * via Pipedream Connect Proxy, updates the connection record,
 * and creates UsageCredit snapshots + alert events if thresholds crossed.
 */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, provider } = await request.json()
  if (!projectId || !provider) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const project = await db.project.findFirst({ where: { id: projectId, userId: session.userId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const connection = await db.providerConnection.findUnique({
    where: { projectId_provider: { projectId, provider } },
  })
  if (!connection) return NextResponse.json({ error: 'Provider not connected' }, { status: 404 })
  if (!connection.pipedreamAccountId) {
    return NextResponse.json({ error: 'No Pipedream account linked' }, { status: 400 })
  }

  try {
    const snapshot = await pollBillingData(
      provider,
      session.userId,
      connection.pipedreamAccountId,
    )

    // Update connection record
    await db.providerConnection.update({
      where: { id: connection.id },
      data: {
        balance: snapshot.balance,
        creditLimit: snapshot.creditLimit,
        periodSpend: snapshot.periodSpend,
        periodStart: snapshot.periodStart,
        lastPolledAt: new Date(),
        lastError: null,
        status: 'connected',
      },
    })

    // Store a UsageCredit snapshot for historical tracking
    if (snapshot.balance != null || snapshot.periodSpend != null) {
      await db.usageCredit.create({
        data: {
          projectId,
          provider,
          app: 'billing-api',
          creditsLimit: snapshot.creditLimit,
          creditsRemaining: snapshot.balance,
          requestCost: null,
        },
      })
    }

    // Check alert rules for credit depletion
    if (snapshot.balance != null && snapshot.creditLimit != null && snapshot.creditLimit > 0) {
      const spent = snapshot.creditLimit - snapshot.balance
      const pct = (spent / snapshot.creditLimit) * 100

      const rules = await db.alertRule.findMany({
        where: {
          projectId,
          enabled: true,
          OR: [{ provider: null }, { provider }],
        },
      })

      for (const rule of rules) {
        if (pct >= rule.criticalAt) {
          await db.alertEvent.create({
            data: {
              projectId,
              provider,
              app: 'billing-api',
              metric: 'credits',
              threshold: rule.criticalAt,
              current: spent,
              limit: snapshot.creditLimit,
              percentage: pct,
            },
          })
        } else if (pct >= rule.warnAt) {
          await db.alertEvent.create({
            data: {
              projectId,
              provider,
              app: 'billing-api',
              metric: 'credits',
              threshold: rule.warnAt,
              current: spent,
              limit: snapshot.creditLimit,
              percentage: pct,
            },
          })
        }
      }
    }

    return NextResponse.json({ snapshot, polledAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    await db.providerConnection.update({
      where: { id: connection.id },
      data: { lastError: message, status: 'error' },
    })

    return NextResponse.json({ error: message }, { status: 502 })
  }
}
