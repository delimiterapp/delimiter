const items = [
  {
    label: 'API keys',
    description: 'Never touches your API keys — you create your client, we just wrap it',
  },
  {
    label: 'Requests',
    description: 'Never modifies requests or responses — your calls work identically',
  },
  {
    label: 'Latency',
    description: 'Never adds latency — reporting is async, fire-and-forget',
  },
  {
    label: 'Reliability',
    description: "Never fails loudly — if we're down, your app doesn't notice",
  },
]

export function TrustSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-primary">
            <svg className="h-3 w-3 text-hint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Trust &amp; Safety
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight">
          What it never does
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Zero interference with your production traffic.
        </p>
        <div className="mt-10 space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-surface"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red/10">
                <svg className="h-3 w-3 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm leading-relaxed text-text-primary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
