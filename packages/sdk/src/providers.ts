/** Provider domain patterns. Order matters — first match wins. */
const PROVIDERS: Array<{ name: string; match: (hostname: string) => boolean }> = [
  { name: 'openai', match: (h) => h === 'api.openai.com' },
  { name: 'anthropic', match: (h) => h === 'api.anthropic.com' },
  { name: 'google', match: (h) => h === 'generativelanguage.googleapis.com' },
  { name: 'mistral', match: (h) => h === 'api.mistral.ai' },
  { name: 'cohere', match: (h) => h === 'api.cohere.com' },
  { name: 'groq', match: (h) => h === 'api.groq.com' },
  { name: 'deepseek', match: (h) => h === 'api.deepseek.com' },
  { name: 'xai', match: (h) => h === 'api.x.ai' },
  { name: 'perplexity', match: (h) => h === 'api.perplexity.ai' },
  { name: 'together', match: (h) => h === 'api.together.xyz' },
  { name: 'fireworks', match: (h) => h === 'api.fireworks.ai' },
  { name: 'replicate', match: (h) => h === 'api.replicate.com' },
  { name: 'azure-openai', match: (h) => h.endsWith('.openai.azure.com') },
  { name: 'bedrock', match: (h) => h.startsWith('bedrock-runtime.') && h.endsWith('.amazonaws.com') },
  { name: 'openrouter', match: (h) => h === 'openrouter.ai' || h === 'api.openrouter.ai' },
]

/**
 * Detect the AI provider from a URL string.
 * Returns the provider name or null if unrecognized.
 */
export function detectProvider(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    for (const provider of PROVIDERS) {
      if (provider.match(hostname)) {
        return provider.name
      }
    }
  } catch {
    // Invalid URL — not an AI provider
  }
  return null
}

/**
 * Detect provider from a client object shape (for wrap() mode).
 * Returns the provider name or 'unknown'.
 */
export function detectProviderFromClient(client: unknown): string {
  if (!client || typeof client !== 'object') return 'unknown'

  const obj = client as Record<string, unknown>

  // OpenAI: has chat.completions
  if (obj.chat && typeof obj.chat === 'object' && 'completions' in (obj.chat as object)) {
    return 'openai'
  }

  // Anthropic: has messages
  if (obj.messages && typeof obj.messages === 'object') {
    return 'anthropic'
  }

  // Google: has generativeAI or models
  if ('getGenerativeModel' in obj) {
    return 'google'
  }

  return 'unknown'
}
