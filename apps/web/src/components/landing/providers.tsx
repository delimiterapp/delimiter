const providers = [
  // Row 1
  {
    name: 'OpenAI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
  },
  {
    name: 'Anthropic',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.304 3.541h-3.48l6.157 16.918h3.48L17.304 3.541zm-10.61 0L.54 20.459H4.1l1.262-3.467h6.47l1.262 3.467h3.56L10.495 3.541H6.694zm.593 10.665L9.6 8.09l2.313 6.116H7.287z"/>
      </svg>
    ),
  },
  {
    name: 'Google Gemini',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12z"/>
      </svg>
    ),
  },
  {
    name: 'Mistral',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <rect x="0" y="0" width="4.5" height="4.5"/>
        <rect x="9.75" y="0" width="4.5" height="4.5"/>
        <rect x="19.5" y="0" width="4.5" height="4.5"/>
        <rect x="0" y="4.875" width="4.5" height="4.5"/>
        <rect x="4.875" y="4.875" width="4.5" height="4.5"/>
        <rect x="9.75" y="4.875" width="4.5" height="4.5"/>
        <rect x="14.625" y="4.875" width="4.5" height="4.5"/>
        <rect x="19.5" y="4.875" width="4.5" height="4.5"/>
        <rect x="0" y="9.75" width="4.5" height="4.5"/>
        <rect x="9.75" y="9.75" width="4.5" height="4.5"/>
        <rect x="19.5" y="9.75" width="4.5" height="4.5"/>
        <rect x="0" y="14.625" width="4.5" height="4.5"/>
        <rect x="4.875" y="14.625" width="4.5" height="4.5"/>
        <rect x="9.75" y="14.625" width="4.5" height="4.5"/>
        <rect x="14.625" y="14.625" width="4.5" height="4.5"/>
        <rect x="19.5" y="14.625" width="4.5" height="4.5"/>
        <rect x="0" y="19.5" width="4.5" height="4.5"/>
        <rect x="9.75" y="19.5" width="4.5" height="4.5"/>
        <rect x="19.5" y="19.5" width="4.5" height="4.5"/>
      </svg>
    ),
  },
  // Row 2
  {
    name: 'DeepSeek',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fillOpacity="0" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z"/>
      </svg>
    ),
  },
  {
    name: 'Meta Llama',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V7h2v10zm4 0h-2V7h2v10z" fillOpacity="0.9"/>
      </svg>
    ),
  },
  {
    name: 'Cohere',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/>
      </svg>
    ),
  },
  { name: 'Groq' },
  // Row 3
  { name: 'xAI' },
  { name: 'Perplexity' },
  { name: 'Together AI' },
  { name: 'Fireworks AI' },
  // Row 4
  { name: 'Replicate' },
  { name: 'AI21 Labs' },
  { name: 'Stability AI' },
  { name: 'Hugging Face' },
  // Row 5
  { name: 'OpenRouter' },
  { name: 'Azure OpenAI' },
  { name: 'Amazon Bedrock' },
  { name: 'Cerebras' },
  // Row 6 (these fade out)
  { name: 'SambaNova' },
  { name: 'Lepton AI' },
  { name: 'Anyscale' },
  { name: 'Baseten' },
  // Row 7 (heavily faded)
  { name: 'Modal' },
  { name: 'Voyage AI' },
  { name: 'Reka' },
  { name: 'Writer' },
] as const

function ProviderCard({ provider }: { provider: { name: string; icon?: React.ReactNode } }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 transition-all hover:border-border/80 hover:shadow-sm">
      {provider.icon ? (
        <div className="text-text-secondary">{provider.icon}</div>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-surface text-[10px] font-bold text-text-tertiary">
          {provider.name.split(' ')[0].slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium">{provider.name}</span>
    </div>
  )
}

export function Providers() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Works with every provider
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-text-secondary">
          If it makes an HTTP request to an AI API, Delimiter sees it.
          No plugins. No configuration. Auto-detected at the network layer.
        </p>

        <div className="relative mt-10">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {providers.map((provider) => (
              <ProviderCard key={provider.name} provider={provider} />
            ))}
          </div>

          {/* Fade-out gradient at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>

        <p className="mt-2 text-center text-sm text-text-tertiary">
          ...and any provider that speaks HTTP
        </p>
      </div>
    </section>
  )
}
