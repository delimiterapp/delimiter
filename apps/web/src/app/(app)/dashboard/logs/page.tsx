'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app/app-context'

type LogEntry = {
  id: string
  app: string
  provider: string
  model: string | null
  timestamp: string
  limits: Record<string, number | null>
}

export default function LogsPage() {
  const { activeProject } = useApp()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [filterProvider, setFilterProvider] = useState('')
  const [filterApp, setFilterApp] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  function fetchLogs(cursor?: string) {
    if (!activeProject) return
    const params = new URLSearchParams({ projectId: activeProject.id })
    if (filterProvider) params.set('provider', filterProvider)
    if (filterApp) params.set('app', filterApp)
    if (cursor) params.set('cursor', cursor)

    fetch(`/api/dashboard/logs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (cursor) {
          setLogs((prev) => [...prev, ...data.items])
        } else {
          setLogs(data.items)
        }
        setNextCursor(data.nextCursor)
        setLoading(false)
      })
  }

  useEffect(() => {
    setLoading(true)
    fetchLogs()
  }, [activeProject?.id, filterProvider, filterApp])

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Logs</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            placeholder="Filter provider..."
            className="rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            placeholder="Filter app..."
            className="rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-white">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-text-tertiary">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow" />
              Waiting for first event...
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3">App</th>
                <th className="px-5 py-3">RPM</th>
                <th className="px-5 py-3">TPM</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const l = log.limits
                const rpmUsed = l.requests_limit && l.requests_remaining != null ? l.requests_limit - l.requests_remaining : null
                const tpmUsed = l.tokens_limit && l.tokens_remaining != null ? l.tokens_limit - l.tokens_remaining : null
                const isExpanded = expanded === log.id

                return (
                  <tr
                    key={log.id}
                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/50"
                  >
                    <td className="px-5 py-3 text-xs text-text-secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm capitalize">{log.provider}</td>
                    <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.model || '—'}</td>
                    <td className="px-5 py-3 text-sm">{log.app}</td>
                    <td className="px-5 py-3 text-sm font-mono">
                      {rpmUsed != null && l.requests_limit ? `${rpmUsed}/${l.requests_limit}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono">
                      {tpmUsed != null && l.tokens_limit ? `${tpmUsed}/${l.tokens_limit}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {nextCursor && (
            <div className="border-t border-border px-5 py-3 text-center">
              <button
                onClick={() => fetchLogs(nextCursor)}
                className="text-sm text-text-secondary transition-colors hover:text-accent"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
