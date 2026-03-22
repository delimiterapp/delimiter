'use client'

function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 11 15 8 12" />
    </svg>
  )
}

const pricingPoints = [
  'Free for auth-only and free plans',
  '5% + $0.50 per charge on paid plans',
  'Includes payment processing fees',
]

const useCases = [
  {
    title: 'AI Agent Web Access',
    description:
      'Give any AI agent eyes on the live web. Use scrape and markdown endpoints to read, parse, and reason over any page in real time.',
  },
  {
    title: 'RAG & Knowledge Pipelines',
    description:
      'Crawl sitemaps, extract clean markdown, and feed your LLM knowledge base with structured, up-to-date web content; automatically.',
  },
]

export function Pricing() {
  return (
    <>
      {/* Pricing */}
      <section className="relative px-6 py-20">
        {/* Ruler lines on both sides */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Left ruler */}
          <div className="absolute top-0 bottom-0 left-8 hidden w-px border-l border-dashed border-border lg:block" />
          <div className="absolute top-0 bottom-0 left-16 hidden w-px border-l border-dashed border-border/50 lg:block" />
          {/* Right ruler */}
          <div className="absolute top-0 bottom-0 right-8 hidden w-px border-r border-dashed border-border lg:block" />
          <div className="absolute top-0 bottom-0 right-16 hidden w-px border-r border-dashed border-border/50 lg:block" />
          {/* Horizontal tick marks - left */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`left-${i}`}
              className="absolute left-8 hidden h-px w-4 bg-border lg:block"
              style={{ top: `${12 + i * 10}%` }}
            />
          ))}
          {/* Horizontal tick marks - right */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`right-${i}`}
              className="absolute right-8 hidden h-px w-4 bg-border lg:block"
              style={{ top: `${12 + i * 10}%` }}
            />
          ))}
          {/* Corner marks */}
          <div className="absolute top-12 left-8 hidden h-3 w-3 border-t border-l border-border lg:block" />
          <div className="absolute top-12 right-8 hidden h-3 w-3 border-t border-r border-border lg:block" />
          <div className="absolute bottom-12 left-8 hidden h-3 w-3 border-b border-l border-border lg:block" />
          <div className="absolute bottom-12 right-8 hidden h-3 w-3 border-b border-r border-border lg:block" />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
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

      {/* Use Cases */}
      <section className="relative px-6 py-20">
        {/* Ruler lines on both sides */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 bottom-0 left-8 hidden w-px border-l border-dashed border-border lg:block" />
          <div className="absolute top-0 bottom-0 left-16 hidden w-px border-l border-dashed border-border/50 lg:block" />
          <div className="absolute top-0 bottom-0 right-8 hidden w-px border-r border-dashed border-border lg:block" />
          <div className="absolute top-0 bottom-0 right-16 hidden w-px border-r border-dashed border-border/50 lg:block" />
          {/* Tick marks */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`left-uc-${i}`}
              className="absolute left-8 hidden h-px w-4 bg-border lg:block"
              style={{ top: `${12 + i * 10}%` }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`right-uc-${i}`}
              className="absolute right-8 hidden h-px w-4 bg-border lg:block"
              style={{ top: `${12 + i * 10}%` }}
            />
          ))}
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-primary">
              <svg className="h-3 w-3 text-[#4f6ef7]" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" />
              </svg>
              Use Cases
            </span>
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            What can you
            <br />
            do with{' '}
            <span className="text-[#4f6ef7]">delimiter</span>?
          </h2>
          <p className="mt-4 max-w-xl text-lg text-text-secondary">
            See how real-time rate limit monitoring powers AI agents, enrichment
            pipelines, personalization, and intelligent automation.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="rounded-xl border border-border bg-white p-8 transition-shadow hover:shadow-sm"
              >
                <h3 className="text-lg font-bold">{useCase.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
