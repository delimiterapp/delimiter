'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app/app-context'

type AlertRule = {
  id: string
  provider: string | null
  warnAt: number
  criticalAt: number
  enabled: boolean
}

type AlertEvent = {
  id: string
  provider: string
  app: string
  metric: string
  threshold: number
  current: number
  limit: number
  percentage: number
  timestamp: string
}

export default function AlertsPage() {
  const { activeProject } = useApp()
  const [tab, setTab] = useState<'rules' | 'history'>('rules')
  const [rules, setRules] = useState<AlertRule[]>([])
  const [events, setEvents] = useState<AlertEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Editing state
  const [editProvider, setEditProvider] = useState('')
  const [editWarn, setEditWarn] = useState(70)
  const [editCritical, setEditCritical] = useState(90)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    Promise.all([
      fetch(`/api/alerts?projectId=${activeProject.id}`).then((r) => r.json()),
      fetch(`/api/alerts/history?projectId=${activeProject.id}`).then((r) => r.json()),
    ]).then(([rulesData, eventsData]) => {
      setRules(rulesData.rules || [])
      setEvents(eventsData.items || [])
      setLoading(false)
    })
  }, [activeProject?.id])

  async function saveRule() {
    if (!activeProject) return
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: activeProject.id,
        provider: editProvider || null,
        warnAt: editWarn,
        criticalAt: editCritical,
        enabled: true,
      }),
    })
    // Refresh
    const res = await fetch(`/api/alerts?projectId=${activeProject.id}`)
    const data = await res.json()
    setRules(data.rules || [])
    setAdding(false)
    setEditProvider('')
    setEditWarn(70)
    setEditCritical(90)
  }

  async function toggleRule(rule: AlertRule) {
    if (!activeProject) return
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: activeProject.id,
        provider: rule.provider,
        warnAt: rule.warnAt,
        criticalAt: rule.criticalAt,
        enabled: !rule.enabled,
      }),
    })
    setRules(rules.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-lg font-semibold">Alerts</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-surface p-1">
        <button
          onClick={() => setTab('rules')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'rules' ? 'bg-white text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Rules
        </button>
        <button
          onClick={() => setTab('history')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-white text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          History
          {events.length > 0 && (
            <span className="ml-1.5 rounded-full bg-red/10 px-1.5 py-0.5 text-[10px] font-medium text-red">
              {events.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'rules' && (
        <div>
          <div className="rounded-xl border border-border bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Warning</th>
                  <th className="px-5 py-3">Critical</th>
                  <th className="px-5 py-3">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-sm capitalize">{rule.provider || 'All providers'}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-yellow/10 px-2 py-0.5 text-xs font-medium text-yellow">
                        {rule.warnAt}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-red/10 px-2 py-0.5 text-xs font-medium text-red">
                        {rule.criticalAt}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleRule(rule)}
                        className={`h-5 w-9 rounded-full transition-colors ${rule.enabled ? 'bg-green' : 'bg-border'}`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-text-tertiary">
                      No alert rules configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add rule */}
          {adding ? (
            <div className="mt-4 rounded-xl border border-border bg-white p-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary">Provider</label>
                  <input
                    type="text"
                    value={editProvider}
                    onChange={(e) => setEditProvider(e.target.value)}
                    placeholder="Leave empty for all"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Warning at</label>
                  <input
                    type="number"
                    value={editWarn}
                    onChange={(e) => setEditWarn(parseInt(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Critical at</label>
                  <input
                    type="number"
                    value={editCritical}
                    onChange={(e) => setEditCritical(parseInt(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveRule}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Save rule
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add rule
            </button>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="rounded-xl border border-border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">App</th>
                <th className="px-5 py-3">Metric</th>
                <th className="px-5 py-3">Usage</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isCritical = event.percentage >= 90
                return (
                  <tr key={event.id} className={`border-b border-border last:border-0 ${isCritical ? 'bg-red/5' : 'bg-yellow/5'}`}>
                    <td className="px-5 py-3 text-xs text-text-secondary">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm capitalize">{event.provider}</td>
                    <td className="px-5 py-3 text-sm">{event.app}</td>
                    <td className="px-5 py-3 text-sm capitalize">{event.metric}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        isCritical ? 'bg-red/10 text-red' : 'bg-yellow/10 text-yellow'
                      }`}>
                        {Math.round(event.percentage)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-tertiary">
                    No alerts have fired yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
