'use client'

interface UsageBarProps {
  label: string
  current: number | null
  limit: number | null
  unit?: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function UsageBar({ label, current, limit, unit = '' }: UsageBarProps) {
  const hasData = current != null && limit != null && limit > 0
  const percentage = hasData ? (current / limit) * 100 : 0

  const color =
    percentage >= 80 ? 'bg-red' :
    percentage >= 50 ? 'bg-yellow' :
    'bg-green'

  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-tertiary">
          {hasData ? `${formatNumber(current)}${unit} / ${formatNumber(limit)}${unit}` : '— / —'}
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-surface-elevated">
        {hasData && (
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        )}
      </div>
    </div>
  )
}
