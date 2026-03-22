'use client'

import { CodeBlock } from '@/components/ui/code-block'
import { AnimatedBorderPill } from '@/components/ui/animated-border-pill'
import { ScrambleButton } from '@/components/ui/scramble-button'

const snippet = `import { delimiter } from '@delimiter/sdk'

delimiter.init('dlm_your_project_key')

// That's it. Every AI API call is now monitored.`

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <AnimatedBorderPill className="mb-5 text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          Open source &middot; MIT licensed
        </AnimatedBorderPill>
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          Rate limit monitoring
          <br />
          <span className="text-text-secondary">for AI apps.</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Two lines of code. Every provider. One dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ScrambleButton
            as="a"
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-text-primary/90 hover:shadow-md"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          >
            Unlock
          </ScrambleButton>
          <ScrambleButton
            as="a"
            href="/docs"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            }
          >
            Read the docs
          </ScrambleButton>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-xl">
        <CodeBlock code={snippet} language="typescript" filename="app.ts" />
      </div>
    </section>
  )
}
