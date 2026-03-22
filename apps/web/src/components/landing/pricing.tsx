'use client'

import { ScrambleButton } from '@/components/ui/scramble-button'

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
            <ScrambleButton
              as="a"
              href="/sign-up"
              className="mt-7 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-center text-sm font-medium transition-colors hover:bg-surface"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
            >
              Unlock
            </ScrambleButton>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-xl border-2 border-text-primary p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Pro</h3>
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-text-primary">
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
            <ScrambleButton
              as="a"
              href="/sign-up?plan=pro"
              className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-text-primary py-2 text-center text-sm font-medium text-white transition-colors hover:bg-text-primary/90"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
            >
              Unlock
            </ScrambleButton>
          </div>
        </div>
      </div>
    </section>
  )
}
