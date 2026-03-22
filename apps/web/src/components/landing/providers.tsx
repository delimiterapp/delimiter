const providers = [
  {
    name: 'OpenAI',
    status: 'supported' as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
  },
  {
    name: 'Anthropic',
    status: 'supported' as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 2L2 19h20L12 2z" />
      </svg>
    ),
  },
  {
    name: 'Google Gemini',
    status: 'coming soon' as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    name: 'Mistral',
    status: 'coming soon' as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
  },
]

export function Providers() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Supported providers
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border p-6 transition-all hover:border-border/80 hover:shadow-sm"
            >
              <div className="text-text-secondary transition-colors group-hover:text-text-primary">
                {provider.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{provider.name}</p>
                {provider.status === 'supported' ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-green">
                    <span className="h-1 w-1 rounded-full bg-green" />
                    Supported
                  </span>
                ) : (
                  <span className="mt-1 inline-block text-xs text-text-tertiary">
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
