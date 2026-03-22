'use client'

import { ScrambleButton } from '@/components/ui/scramble-button'

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
