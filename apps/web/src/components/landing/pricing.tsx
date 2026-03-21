function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-green"
    >
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
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Pricing
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="mt-2 text-4xl font-bold">$0</p>
            <p className="mt-1 text-sm text-text-secondary">
              Forever, no credit card
            </p>
            <ul className="mt-8 flex-1 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/sign-up"
              className="mt-8 block rounded-lg border border-border py-2.5 text-center text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              Get started
            </a>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-xl border-2 border-accent bg-white p-8">
            <h3 className="text-lg font-semibold text-accent">Pro</h3>
            <p className="mt-2 text-4xl font-bold">
              $20
              <span className="text-base font-normal text-text-secondary">
                /month
              </span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Per workspace, billed monthly
            </p>
            <ul className="mt-8 flex-1 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/sign-up?plan=pro"
              className="mt-8 block rounded-lg bg-accent py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Start free trial
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
