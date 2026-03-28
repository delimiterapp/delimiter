import type { DelimiterConfig } from './types'
import { sendReport } from './reporter'

/**
 * Map of common environment variable names to provider identifiers.
 * Only checks existence (typeof !== 'undefined'), never reads values.
 */
const ENV_PROVIDER_HINTS: Array<{ envVars: string[]; provider: string }> = [
  { envVars: ['OPENAI_API_KEY'], provider: 'openai' },
  { envVars: ['ANTHROPIC_API_KEY'], provider: 'anthropic' },
  { envVars: ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY'], provider: 'google' },
  { envVars: ['XAI_API_KEY'], provider: 'xai' },
  { envVars: ['DEEPSEEK_API_KEY'], provider: 'deepseek' },
  { envVars: ['GROQ_API_KEY'], provider: 'groq' },
  { envVars: ['MISTRAL_API_KEY'], provider: 'mistral' },
  { envVars: ['COHERE_API_KEY', 'CO_API_KEY'], provider: 'cohere' },
  { envVars: ['TOGETHER_API_KEY', 'TOGETHER_AI_API_KEY'], provider: 'together' },
  { envVars: ['FIREWORKS_API_KEY'], provider: 'fireworks' },
  { envVars: ['REPLICATE_API_TOKEN', 'REPLICATE_API_KEY'], provider: 'replicate' },
  { envVars: ['PERPLEXITY_API_KEY'], provider: 'perplexity' },
  { envVars: ['OPENROUTER_API_KEY'], provider: 'openrouter' },
  { envVars: ['BEDROCK_API_KEY', 'AWS_BEARER_TOKEN_BEDROCK'], provider: 'bedrock' },
  { envVars: ['AZURE_OPENAI_API_KEY'], provider: 'azure-openai' },
]

/**
 * Scan process.env for known AI provider env vars and send provider hints.
 * Only checks existence — never reads or transmits values.
 * Fire-and-forget, runs once on init().
 */
export function sendProviderHints(config: DelimiterConfig): void {
  if (typeof process === 'undefined' || !process.env) return

  const detected: string[] = []

  for (const { envVars, provider } of ENV_PROVIDER_HINTS) {
    for (const envVar of envVars) {
      if (process.env[envVar]) {
        detected.push(provider)
        break
      }
    }
  }

  if (config.debug) {
    console.log('[delimiter] detected providers from env vars:', detected)
  }

  if (detected.length === 0) return

  const nullLimits = {
    requests_limit: null,
    requests_remaining: null,
    tokens_limit: null,
    tokens_remaining: null,
    reset_requests_ms: null,
    reset_tokens_ms: null,
  }

  for (const provider of detected) {
    sendReport(config, {
      app: config.app,
      provider,
      model: null,
      timestamp: new Date().toISOString(),
      limits: nullLimits,
    })
  }
}
