import { getProvider } from '@/lib/provider-catalog'

const providerIcons: Record<string, React.ReactNode> = {
  openai: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  ),
  anthropic: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.304 3.541h-3.48l6.157 16.918h3.48L17.304 3.541zm-10.61 0L.54 20.459H4.1l1.262-3.467h6.47l1.262 3.467h3.56L10.495 3.541H6.694zm.593 10.665L9.6 8.09l2.313 6.116H7.287z"/>
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12z"/>
    </svg>
  ),
  bedrock: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l-1.5.8v7.5L4 6.5 2.5 7.3v9.4L4 17.5l6.5-3.8v7.5L12 22l1.5-.8v-7.5l6.5 3.8 1.5-.8V7.3L20 6.5l-6.5 3.8V2.8L12 2z"/>
    </svg>
  ),
  openrouter: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 14.5v-3H6.5L13 5.5v5H17l-6 6z"/>
    </svg>
  ),
  xai: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.3 4l7.5 9.2L2 20h1.7l6.8-5.9L16 20h5.7l-7.9-9.7L21 4h-1.7l-6.3 5.5L8 4H2.3zm2.5 1.1h2.6l12.1 13.8h-2.6L4.8 5.1z"/>
    </svg>
  ),
}

const iconSizes: Record<string, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-9 w-9',
}

export function ProviderLogo({
  providerId,
  size = 'md',
}: {
  providerId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const provider = getProvider(providerId)
  const dimensions = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  }[size]

  if (!provider) {
    return (
      <div className={`${dimensions} flex shrink-0 items-center justify-center rounded-xl bg-surface text-xs font-semibold text-text-secondary`}>
        ?
      </div>
    )
  }

  const icon = providerIcons[provider.id]

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-xl border shadow-sm`}
      style={{
        backgroundColor: provider.bg,
        borderColor: `${provider.accent}22`,
        color: provider.accent,
      }}
      aria-label={`${provider.name} logo`}
      title={provider.name}
    >
      {icon ? (
        <div className={iconSizes[size] ?? iconSizes.md}>{icon}</div>
      ) : (
        <span className="text-xs font-semibold tracking-tight">{provider.shortName}</span>
      )}
    </div>
  )
}
