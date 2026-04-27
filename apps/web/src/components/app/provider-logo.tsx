import { getProvider } from '@/lib/provider-catalog'

export function ProviderLogo({
  providerId,
  size = 'md',
}: {
  providerId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const provider = getProvider(providerId)
  const dimensions = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-sm',
    xl: 'h-20 w-20 text-base',
  }[size]

  if (!provider) {
    return (
      <div className={`${dimensions} flex shrink-0 items-center justify-center rounded-xl bg-surface font-semibold text-text-secondary`}>
        ?
      </div>
    )
  }

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-xl border font-semibold tracking-tight shadow-sm`}
      style={{
        backgroundColor: provider.bg,
        borderColor: `${provider.accent}22`,
        color: provider.accent,
      }}
      aria-label={`${provider.name} logo`}
      title={provider.name}
    >
      {provider.shortName}
    </div>
  )
}
