import { CodeBlock } from '@/components/ui/code-block'

const snippet = `import { delimiter } from '@delimiter/sdk'
delimiter.init('dlm_your_project_key')
const openai = delimiter.wrap(new OpenAI({ apiKey: process.env.OPENAI_KEY }))`

export function Hero() {
  return (
    <section className="px-6 pb-16 pt-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl">
          Know your AI rate limits before your app does.
        </h1>
        <p className="mt-6 text-xl text-text-secondary">
          Three lines of code. Every provider. One dashboard.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <CodeBlock code={snippet} language="typescript" />
      </div>

      <div className="mt-8 text-center">
        <a
          href="/sign-up"
          className="inline-block rounded-lg bg-accent px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Get started — it&apos;s free
        </a>
      </div>
    </section>
  )
}
