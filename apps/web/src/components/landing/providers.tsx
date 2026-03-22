const providers = [
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
  {
    name: 'DeepSeek',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.2 14.4a4.8 4.8 0 0 1-6.785 0 4.8 4.8 0 0 1 0-6.785L12 6l3.6 3.6a4.815 4.815 0 0 1-.4 6.8z"/>
      </svg>
    ),
  },
  {
    name: 'Meta Llama',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.8 2 8.2 3.7 7.2 5.8 5.7 8.8 5 12.6 5 15.4c0 1.6.3 3 1 4 .8 1.2 2 1.8 3.2 1.8 1 0 1.7-.4 2.3-.8.4-.3.7-.5 1-.5h1c.3 0 .6.2 1 .5.6.4 1.3.8 2.3.8 1.2 0 2.4-.6 3.2-1.8.7-1 1-2.4 1-4 0-2.8-.7-6.6-2.2-9.6C16.8 3.7 15.2 2 13 2h-1z"/>
      </svg>
    ),
  },
  {
    name: 'Cohere',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.51 17.2c1.63 0 3.18-.6 4.39-1.65l.37-.33c.3-.27.65-.43 1.02-.43h2.56c2.08 0 4.14-.71 5.68-2.13A7.12 7.12 0 0 0 23 8.2 6.4 6.4 0 0 0 16.73 2H8.64A6.82 6.82 0 0 0 2 8.94a8.12 8.12 0 0 0 4.51 8.26z"/>
      </svg>
    ),
  },
  {
    name: 'Groq',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 14.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/>
        <circle cx="12" cy="12" r="1.5"/>
      </svg>
    ),
  },
  {
    name: 'xAI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.3 4l7.5 9.2L2 20h1.7l6.8-5.9L16 20h5.7l-7.9-9.7L21 4h-1.7l-6.3 5.5L8 4H2.3zm2.5 1.1h2.6l12.1 13.8h-2.6L4.8 5.1z"/>
      </svg>
    ),
  },
  {
    name: 'Perplexity',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 7v5l8 5 8-5V7l-8-5zm0 2.2L17.8 7.7 12 11.2 6.2 7.7 12 4.2zM5.5 8.8l5.5 3.1v6.3l-5.5-3.4V8.8zm7 9.4v-6.3l5.5-3.1v6l-5.5 3.4z"/>
      </svg>
    ),
  },
  {
    name: 'Together AI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="8" r="3"/>
        <circle cx="16" cy="8" r="3"/>
        <circle cx="8" cy="16" r="3"/>
        <circle cx="16" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    name: 'Fireworks AI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.5 6.5L20 7l-5 4 3 6-5-3-2 6-2-6-5 3 3-6-5-4 6.5 1.5z"/>
      </svg>
    ),
  },
  {
    name: 'Replicate',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16v3H4V4zm0 5h13v3H4V9zm0 5h10v3H4v-3zm0 5h7v3H4v-3z"/>
      </svg>
    ),
  },
  {
    name: 'AI21 Labs',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h3v16H4V4zm6 0h3v16h-3V4zm9 0h3v16h-3V4zM13 4h3v8h-3V4z"/>
      </svg>
    ),
  },
  {
    name: 'Stability AI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
      </svg>
    ),
  },
  {
    name: 'Hugging Face',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM8.5 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm7 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM7.5 15.5c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2 0 1.66-2.01 3-4.5 3s-4.5-1.34-4.5-3z"/>
      </svg>
    ),
  },
  {
    name: 'OpenRouter',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 14.5v-3H6.5L13 5.5v5H17l-6 6z"/>
      </svg>
    ),
  },
  {
    name: 'Azure OpenAI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 5.5L11.5 3v8.5H2V5.5zM2 18.5V12.5h9.5V21L2 18.5zM12.5 21V12.5H22V18.5L12.5 21zM12.5 11.5V3L22 5.5v6h-9.5z"/>
      </svg>
    ),
  },
  {
    name: 'Amazon Bedrock',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l-1.5.8v7.5L4 6.5 2.5 7.3v9.4L4 17.5l6.5-3.8v7.5L12 22l1.5-.8v-7.5l6.5 3.8 1.5-.8V7.3L20 6.5l-6.5 3.8V2.8L12 2z"/>
      </svg>
    ),
  },
  {
    name: 'Cerebras',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
      </svg>
    ),
  },
  {
    name: 'SambaNova',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zm-10 10h8v8H3v-8zm10 2h8v6h-8v-6z"/>
      </svg>
    ),
  },
  {
    name: 'Lepton AI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    name: 'Anyscale',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 6v4l8 4 8-4V6l-8-4zm0 10l-8-4v4l8 4 8-4v-4l-8 4zm0 4l-8-4v4l8 4 8-4v-4l-8 4z"/>
      </svg>
    ),
  },
  {
    name: 'Baseten',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.7 12 11.22 5.64 7.7 12 4.18z"/>
      </svg>
    ),
  },
  {
    name: 'Modal',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="3" fillOpacity="0" stroke="currentColor" strokeWidth="2"/>
        <rect x="7" y="7" width="10" height="10" rx="1.5"/>
      </svg>
    ),
  },
  {
    name: 'Voyage AI',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7l3-7z"/>
      </svg>
    ),
  },
  {
    name: 'Reka',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 0 1 7 7h-3.5a3.5 3.5 0 0 0-7 0H5a7 7 0 0 1 7-7z"/>
      </svg>
    ),
  },
  {
    name: 'Writer',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h2v16H4V4zm4 4h2v12H8V8zm4-2h2v14h-2V6zm4 3h2v11h-2V9zm4-1h2v12h-2V8z"/>
      </svg>
    ),
  },
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
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-primary">
            <svg className="h-3 w-3 text-hint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Providers
          </span>
        </div>
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
