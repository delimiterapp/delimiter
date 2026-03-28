'use client'

interface HealthRingProps {
  percentage: number | null
  size?: number
  strokeWidth?: number
  label?: string
}

export function HealthRing({ percentage, size = 80, strokeWidth = 6, label }: HealthRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const hasData = percentage != null
  const pct = percentage ?? 0
  const filled = (pct / 100) * circumference
  const offset = circumference - filled

  const color = !hasData
    ? 'var(--color-text-tertiary)'
    : pct >= 80 ? 'var(--color-red)'
    : pct >= 50 ? 'var(--color-yellow)'
    : 'var(--color-green)'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth={strokeWidth}
        />
        {hasData && pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        )}
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-semibold" style={{ color }}>
          {hasData ? `${Math.round(pct)}%` : '—'}
        </div>
        {label && <div className="text-[10px] text-text-tertiary">{label}</div>}
      </div>
    </div>
  )
}
