function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const freeFeatures = [
  '1 provider',
  '1 app',
  '1,000 reports/day',
  'Email alerts',
  '7-day history',
]

const proFeatures = [
  'Unlimited providers & apps',
  'Unlimited reports',
  'Slack + webhook alerts',
  '90-day history',
]

export function Pricing() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Pricing
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Start free, upgrade when you need to.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-xl border border-border p-7 transition-shadow hover:shadow-sm">
            <h3 className="text-sm font-semibold text-text-secondary">Free</h3>
            <p className="mt-3 text-3xl font-bold">$0</p>
            <p className="mt-1 text-xs text-text-tertiary">
              Forever, no credit card
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/sign-up"
              className="mt-7 block rounded-lg border border-border py-2 text-center text-sm font-medium transition-colors hover:bg-surface"
            >
              Get started
            </a>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-xl border-2 border-accent p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-accent">Pro</h3>
              <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-[11px] font-medium text-accent">
                Popular
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold">
              $20
              <span className="text-sm font-normal text-text-tertiary">
                /mo
              </span>
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Per workspace, billed monthly
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/sign-up?plan=pro"
              className="mt-7 block rounded-lg bg-accent py-2 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Start free trial
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
