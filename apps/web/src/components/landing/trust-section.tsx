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
