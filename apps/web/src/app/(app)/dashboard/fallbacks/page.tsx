'use client'

import { useEffect, useState, useRef } from 'react'
import { useApp } from '@/components/app/app-context'

type ChainItem = { provider: string; models: string[] }
type FallbackConfig = { chain: ChainItem[]; threshold: number; enabled: boolean }
type ProviderHealth = { provider: string; overallUsage: number }

const ALL_PROVIDERS = [
  'openai', 'anthropic', 'google', 'mistral', 'cohere', 'groq',
  'deepseek', 'xai', 'perplexity', 'together', 'fireworks', 'replicate',
  'azure-openai', 'bedrock', 'openrouter',
]

export default function FallbacksPage() {
  const { activeProject } = useApp()
  const [config, setConfig] = useState<FallbackConfig>({ chain: [], threshold: 80, enabled: false })
  const [health, setHealth] = useState<ProviderHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  useEffect(() => {
    if (!activeProject) return
    Promise.all([
      fetch(`/api/fallbacks?projectId=${activeProject.id}`).then((r) => r.json()),
      fetch(`/api/dashboard/overview?projectId=${activeProject.id}`).then((r) => r.json()),
    ]).then(([fb, overview]) => {
      setConfig(fb.chain)
      setHealth(overview.providers || [])
      setLoading(false)
    })
  }, [activeProject?.id])

  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return
    const items = [...config.chain]
    const dragged = items.splice(dragItem.current, 1)[0]
    items.splice(dragOverItem.current, 0, dragged)
    setConfig({ ...config, chain: items })
    dragItem.current = null
    dragOverItem.current = null
  }

  function addProvider(provider: string) {
    setConfig({
      ...config,
      chain: [...config.chain, { provider, models: [] }],
    })
  }

  function removeProvider(index: number) {
    setConfig({
      ...config,
      chain: config.chain.filter((_, i) => i !== index),
    })
  }

  async function save() {
    if (!activeProject) return
    setSaving(true)
    await fetch('/api/fallbacks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: activeProject.id, ...config }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const usedProviders = new Set(config.chain.map((c) => c.provider))
  const available = ALL_PROVIDERS.filter((p) => !usedProviders.has(p))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Fallback Chain</h1>
          <p className="mt-1 text-sm text-text-secondary">
            When a provider approaches its rate limit, requests route to the next provider in this chain.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            <span className="text-text-secondary">Enabled</span>
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Threshold config */}
      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Switch threshold</label>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={config.threshold}
            onChange={(e) => setConfig({ ...config, threshold: parseInt(e.target.value) })}
            className="flex-1 accent-accent"
          />
          <span className="w-12 text-right text-sm font-mono font-medium">{config.threshold}%</span>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          When remaining capacity drops below {config.threshold}%, the next request routes to the next provider.
        </p>
      </div>

      {/* Chain */}
      <div className="space-y-2">
        {config.chain.map((item, index) => {
          const h = health.find((p) => p.provider === item.provider)
          const usage = h?.overallUsage ?? 0
          const dot =
            usage >= 80 ? 'bg-red' :
            usage >= 50 ? 'bg-yellow' :
            usage > 0 ? 'bg-green' :
            'bg-border'

          return (
            <div
              key={item.provider}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 cursor-grab active:cursor-grabbing"
            >
              {/* Drag handle */}
              <svg className="h-4 w-4 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>

              {/* Order number */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium text-text-secondary">
                {index + 1}
              </span>

              {/* Health dot */}
              <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />

              {/* Provider name */}
              <span className="flex-1 text-sm font-medium capitalize">{item.provider}</span>

              {/* Usage */}
              {usage > 0 && (
                <span className="text-xs text-text-tertiary">{Math.round(usage)}% used</span>
              )}

              {/* Remove */}
              <button
                onClick={() => removeProvider(index)}
                className="text-text-tertiary transition-colors hover:text-red"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Add provider */}
      {available.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {available.map((p) => (
              <button
                key={p}
                onClick={() => addProvider(p)}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="capitalize">{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {config.chain.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-text-tertiary">
            Add providers above to build your fallback chain.
          </p>
        </div>
      )}
    </div>
  )
}
