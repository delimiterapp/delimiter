import { describe, it, expect } from 'vitest'
import { detectProvider, detectProviderFromClient } from '../providers'

describe('detectProvider', () => {
  const cases: [string, string | null][] = [
    ['https://api.openai.com/v1/chat/completions', 'openai'],
    ['https://api.anthropic.com/v1/messages', 'anthropic'],
    ['https://generativelanguage.googleapis.com/v1/models', 'google'],
    ['https://api.mistral.ai/v1/chat', 'mistral'],
    ['https://api.cohere.com/v1/generate', 'cohere'],
    ['https://api.groq.com/openai/v1/chat/completions', 'groq'],
    ['https://api.deepseek.com/v1/chat/completions', 'deepseek'],
    ['https://api.x.ai/v1/chat/completions', 'xai'],
    ['https://api.perplexity.ai/chat/completions', 'perplexity'],
    ['https://api.together.xyz/v1/chat/completions', 'together'],
    ['https://api.fireworks.ai/inference/v1/chat/completions', 'fireworks'],
    ['https://api.replicate.com/v1/predictions', 'replicate'],
    ['https://my-resource.openai.azure.com/openai/deployments/gpt-4/chat/completions', 'azure-openai'],
    ['https://bedrock-runtime.us-east-1.amazonaws.com/model/invoke', 'bedrock'],
    ['https://openrouter.ai/api/v1/chat/completions', 'openrouter'],
    ['https://api.openrouter.ai/api/v1/chat/completions', 'openrouter'],
    // Non-AI URLs
    ['https://example.com/api/v1/chat', null],
    ['https://google.com', null],
    // Invalid URLs
    ['not-a-url', null],
    ['', null],
  ]

  for (const [url, expected] of cases) {
    it(`detects "${expected}" from ${url || '(empty)'}`, () => {
      expect(detectProvider(url)).toBe(expected)
    })
  }
})

describe('detectProviderFromClient', () => {
  it('detects OpenAI client shape', () => {
    const client = { chat: { completions: {} }, models: {} }
    expect(detectProviderFromClient(client)).toBe('openai')
  })

  it('detects Anthropic client shape', () => {
    const client = { messages: { create: () => {} } }
    expect(detectProviderFromClient(client)).toBe('anthropic')
  })

  it('detects Google client shape', () => {
    const client = { getGenerativeModel: () => {} }
    expect(detectProviderFromClient(client)).toBe('google')
  })

  it('returns unknown for unrecognized objects', () => {
    expect(detectProviderFromClient({})).toBe('unknown')
    expect(detectProviderFromClient({ foo: 'bar' })).toBe('unknown')
  })

  it('returns unknown for non-objects', () => {
    expect(detectProviderFromClient(null)).toBe('unknown')
    expect(detectProviderFromClient(undefined)).toBe('unknown')
    expect(detectProviderFromClient('string')).toBe('unknown')
    expect(detectProviderFromClient(42)).toBe('unknown')
  })
})
