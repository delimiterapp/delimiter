function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 11 15 8 12" />
    </svg>
  )
}

const pricingPoints = [
  '$20 per month, per workspace',
  'Unlimited providers and apps',
  'Unlimited reports and history',
  'Slack, webhook, and email alerts',
  'Priority support included',
]

export function Pricing() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-primary">
            <svg className="h-3 w-3 text-hint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Pricing
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple pricing. All inclusive.
        </h2>

        <div className="mx-auto mt-10 max-w-lg rounded-xl border border-border bg-surface/50 px-8 py-8">
          <ul className="space-y-5">
            {pricingPoints.map((point) => (
              <li key={point} className="flex items-center justify-center gap-3 text-[15px] font-medium text-text-primary">
                <CheckCircleIcon />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
