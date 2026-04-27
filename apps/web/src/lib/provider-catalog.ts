export type ProviderCapability =
  | 'spend'
  | 'usage'
  | 'configured_limits'
  | 'balance'
  | 'models'

export type ProviderCatalogItem = {
  id: string
  name: string
  shortName: string
  keyType: string
  keyHint: string
  capabilities: ProviderCapability[]
  accent: string
  bg: string
  description: string
  setupSteps: string[]
  securityNote: string
  statusNote?: string
}

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OA',
    keyType: 'Admin API key',
    keyHint: 'Create an Admin API key in OpenAI organization settings.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#111827',
    bg: '#f4f4f5',
    description: 'Sync organization costs, usage by project/key/model, and configured project rate limits.',
    setupSteps: [
      'Open OpenAI organization settings and create an Admin API key.',
      'Use a key dedicated to Delimiter so it can be rotated independently.',
      'Paste the key here. Delimiter encrypts it and uses it only for monitoring APIs.',
    ],
    securityNote: 'OpenAI Admin keys are powerful. Delimiter never uses them for model requests, key creation, or account changes.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    shortName: 'An',
    keyType: 'Admin API key',
    keyHint: 'Create an Admin API key in Claude Console organization settings.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#d97706',
    bg: '#fff7ed',
    description: 'Sync usage, costs, workspace/model breakdowns, and configured org/workspace rate limits.',
    setupSteps: [
      'Open Claude Console and go to organization settings.',
      'Create an Admin API key for Usage, Cost, and Rate Limits APIs.',
      'Paste the key here. Delimiter encrypts it and polls Anthropic reporting endpoints.',
    ],
    securityNote: 'Anthropic Admin keys are required for reporting APIs. Use a dedicated key and delete it anytime.',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    shortName: 'G',
    keyType: 'Google AI / Vertex credential',
    keyHint: 'Use a Gemini API key or a Google Cloud credential with billing/usage visibility.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#2563eb',
    bg: '#eff6ff',
    description: 'Track Gemini/Vertex spend, usage, model breakdowns, and published quota limits.',
    setupSteps: [
      'Use a dedicated Google AI Studio key or a Google Cloud credential scoped to billing/usage reporting.',
      'For Vertex AI, prefer a service account with read-only Billing/Monitoring permissions.',
      'Paste the credential here. Full Gemini polling is staged behind this connection.',
    ],
    securityNote: 'Google support is included in the connection model now; deep billing sync requires a read-only Google Cloud billing integration.',
    statusNote: 'Initial connection stores the credential securely. Full Gemini billing sync is next.',
  },
  {
    id: 'bedrock',
    name: 'AWS Bedrock',
    shortName: 'AWS',
    keyType: 'Read-only IAM role or access JSON',
    keyHint: 'Use a dedicated read-only IAM role/policy for Cost Explorer, CloudWatch, Service Quotas, and Bedrock metadata.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#ff9900',
    bg: '#fff7ed',
    description: 'Track Bedrock spend, CloudWatch usage, model quotas, throttles, and application/profile attribution.',
    setupSteps: [
      'Create a dedicated IAM role or access credential for Delimiter.',
      'Grant read-only access to Cost Explorer, CloudWatch metrics, Service Quotas, and Bedrock model metadata.',
      'Paste the role ARN or credential JSON here. Delimiter stores it encrypted and uses it only for monitoring.',
    ],
    securityNote: 'Never paste AWS root keys. Use a dedicated read-only policy. Bedrock support is a first-class provider.',
    statusNote: 'Initial connection stores the credential securely. Full Bedrock sync follows the IAM policy setup.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    shortName: 'OR',
    keyType: 'API key',
    keyHint: 'Create an OpenRouter API key from account settings.',
    capabilities: ['spend', 'usage', 'balance', 'models'],
    accent: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Sync credit balance, total usage, and multi-model spend from OpenRouter.',
    setupSteps: [
      'Open OpenRouter settings and create a dedicated API key.',
      'Paste the key here to sync credits and usage.',
      'Rotate or delete the key anytime from OpenRouter and Delimiter.',
    ],
    securityNote: 'Delimiter uses this key only for OpenRouter credits and usage endpoints.',
  },
  {
    id: 'xai',
    name: 'xAI',
    shortName: 'xAI',
    keyType: 'Management key',
    keyHint: 'Create a read-only management key in xAI Console.',
    capabilities: ['balance', 'configured_limits'],
    accent: '#111827',
    bg: '#f9fafb',
    description: 'Sync xAI team billing balance and management metadata.',
    setupSteps: [
      'Open xAI Console and create a management key.',
      'Prefer read-only permissions where available.',
      'Paste the key here. Delimiter encrypts it and polls billing endpoints.',
    ],
    securityNote: 'Delimiter never uses xAI management keys for model requests.',
  },
]

export function getProvider(providerId: string): ProviderCatalogItem | undefined {
  return PROVIDER_CATALOG.find((provider) => provider.id === providerId)
}

export function capabilityLabel(capability: ProviderCapability): string {
  switch (capability) {
    case 'configured_limits':
      return 'Rate limits'
    case 'spend':
      return 'Spend'
    case 'usage':
      return 'Usage'
    case 'balance':
      return 'Balance'
    case 'models':
      return 'Models'
  }
}
