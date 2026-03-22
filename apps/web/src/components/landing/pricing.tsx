function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 11 15 8 12" />
    </svg>
  )
}

const features = [
  'Unlimited providers and apps',
  'Unlimited reports',
  'Slack, webhook, and email alerts',
  '90-day history',
]

export function Pricing() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Pricing
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          Simple pricing. All inclusive.
        </h2>

        <div className="mx-auto mt-10 max-w-lg rounded-xl border border-border bg-surface/50 px-8 py-10">
          <div className="flex flex-col items-center gap-6">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <CheckIcon />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-4xl font-bold">
          $20
          <span className="text-lg font-normal text-text-tertiary">/mo</span>
        </p>
        <p className="mt-1 text-sm text-text-tertiary">Per workspace</p>

        <a
          href="/sign-up"
          className="mt-6 inline-block rounded-lg bg-accent px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Get started
        </a>
      </div>
    </section>
  )
}
