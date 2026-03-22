import { CodeBlock } from '@/components/ui/code-block'

const snippet = `import { delimiter } from '@delimiter/sdk'

delimiter.init('dlm_your_project_key')

const openai = delimiter.wrap(
  new OpenAI({ apiKey: process.env.OPENAI_KEY })
)`

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          Open source &middot; MIT licensed
        </div>
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          Know your AI rate limits
          <br />
          <span className="text-text-secondary">before your app does.</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Three lines of code. Every provider. One dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-hover hover:shadow-md"
          >
            Get started free
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
          >
            Read the docs
          </a>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-xl">
        <CodeBlock code={snippet} language="typescript" filename="app.ts" />
      </div>
    </section>
  )
}
