export type ProviderCapability =
  | 'spend'
  | 'usage'
  | 'configured_limits'
  | 'balance'
  | 'models'

export type ProviderCategory = 'ai' | 'delivery' | 'financial' | 'identity' | 'search' | 'infra'

export const PROVIDER_CATEGORIES: { id: ProviderCategory; label: string }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'financial', label: 'Financial' },
  { id: 'identity', label: 'Identity' },
  { id: 'search', label: 'Search' },
  { id: 'infra', label: 'Infra' },
]

export function categoryLabel(category: ProviderCategory): string {
  return PROVIDER_CATEGORIES.find((c) => c.id === category)?.label ?? category
}

export type ProviderCatalogItem = {
  id: string
  name: string
  shortName: string
  category: ProviderCategory
  keyType: string
  keyHint: string
  capabilities: ProviderCapability[]
  accent: string
  bg: string
  description: string
  setupSteps: string[]
  securityNote: string
  statusNote?: string
  iamPolicy?: string
}

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OA',
    category: 'ai',
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
    category: 'ai',
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
    category: 'ai',
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
    category: 'ai',
    keyType: 'Read-only IAM credential JSON',
    keyHint: 'Dedicated read-only credential scoped to Bedrock spend, models, and quotas. Never use root keys.',
    capabilities: ['spend', 'usage', 'configured_limits', 'models'],
    accent: '#ff9900',
    bg: '#fff7ed',
    description: 'Track Bedrock-only spend via Cost Explorer, model invocation metrics from CloudWatch, Bedrock quota limits, available models, and account budget.',
    setupSteps: [
      'In AWS IAM, create a new policy — copy the JSON below and name it DelimiterBedrockReadOnly.',
      'Create a new IAM user (e.g. delimiter-monitor) with no console access. Attach the policy you just created.',
      'Open the user\'s Security credentials tab, create an access key, and paste the credential JSON here.',
    ],
    securityNote: 'Never paste AWS root keys. Delimiter queries only Bedrock spend and metadata — not other AWS services. Use a dedicated IAM user you can revoke anytime.',
    statusNote: 'Initial connection stores the credential securely. Full Bedrock sync follows the IAM policy setup.',
    iamPolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'BedrockSpendViaCostExplorer',
          Effect: 'Allow',
          Action: [
            'ce:GetCostAndUsage',
            'ce:GetCostForecast',
            'ce:GetDimensionValues',
          ],
          Resource: '*',
        },
        {
          Sid: 'BedrockCloudWatchMetrics',
          Effect: 'Allow',
          Action: [
            'cloudwatch:GetMetricData',
            'cloudwatch:GetMetricStatistics',
            'cloudwatch:ListMetrics',
          ],
          Resource: '*',
        },
        {
          Sid: 'BedrockQuotas',
          Effect: 'Allow',
          Action: [
            'servicequotas:GetServiceQuota',
            'servicequotas:ListServiceQuotas',
          ],
          Resource: '*',
        },
        {
          Sid: 'BedrockModelMetadata',
          Effect: 'Allow',
          Action: [
            'bedrock:ListFoundationModels',
            'bedrock:GetFoundationModel',
            'bedrock:ListProvisionedModelThroughputs',
            'bedrock:GetProvisionedModelThroughput',
            'bedrock:ListInferenceProfiles',
            'bedrock:GetInferenceProfile',
          ],
          Resource: '*',
        },
      ],
    }, null, 2),
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    shortName: 'OR',
    category: 'ai',
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
    category: 'ai',
    keyType: 'API key',
    keyHint: 'Create an API key from xAI Console. Management keys unlock billing sync.',
    capabilities: ['balance', 'configured_limits'],
    accent: '#111827',
    bg: '#f9fafb',
    description: 'Connect xAI with an API key or management key. Set a credit balance to track remaining credits.',
    setupSteps: [
      'Open xAI Console and create an API key.',
      'For billing sync, use a management key instead.',
      'Paste the key here. Delimiter encrypts it and validates the connection.',
    ],
    securityNote: 'Delimiter never uses xAI keys for model requests.',
  },
  {
    id: 'increase',
    name: 'Increase',
    shortName: 'Inc',
    category: 'financial',
    keyType: 'API key',
    keyHint: 'Create a read-only API key from your Increase dashboard.',
    capabilities: ['spend', 'balance'],
    accent: '#0f172a',
    bg: '#f8fafc',
    description: 'Monitor account balances, transaction volume, and fees across your Increase banking accounts.',
    setupSteps: [
      'Open your Increase dashboard and navigate to API keys.',
      'Create a read-only key scoped to account and transaction data.',
      'Paste the key here. Delimiter uses it only to read balances and transaction history.',
    ],
    securityNote: 'Use a read-only key. Delimiter never initiates transactions or modifies account settings.',
  },
  {
    id: 'nash',
    name: 'Nash',
    shortName: 'Na',
    category: 'delivery',
    keyType: 'API key',
    keyHint: 'Create an API key from your Nash dashboard.',
    capabilities: ['spend', 'usage'],
    accent: '#6d28d9',
    bg: '#f5f3ff',
    description: 'Track delivery spend, job volume, and carrier routing costs across your Nash delivery orchestration.',
    setupSteps: [
      'Open your Nash dashboard and navigate to API settings.',
      'Create a key or use your existing API key.',
      'Paste the key here. Delimiter uses it to read delivery history and costs.',
    ],
    securityNote: 'Delimiter reads delivery history and cost data only. It never creates or modifies jobs.',
    statusNote: 'Initial connection stores the credential securely. Full delivery cost sync is next.',
  },
  {
    id: 'senpex',
    name: 'Senpex',
    shortName: 'Sx',
    category: 'delivery',
    keyType: 'Client credentials',
    keyHint: 'Use your Senpex client ID and secret.',
    capabilities: ['spend', 'usage'],
    accent: '#0284c7',
    bg: '#f0f9ff',
    description: 'Track last-mile delivery costs, job volume, and delivery status from Senpex.',
    setupSteps: [
      'Locate your Senpex client ID and secret from your account settings.',
      'Paste both values here (comma-separated: clientId,secret).',
      'Delimiter uses these to read delivery history and invoiced costs.',
    ],
    securityNote: 'Delimiter reads delivery records only. It never creates deliveries or modifies account settings.',
    statusNote: 'Initial connection stores credentials securely. Delivery cost sync is next.',
  },
  {
    id: 'uber_direct',
    name: 'Uber Direct',
    shortName: 'UD',
    category: 'delivery',
    keyType: 'OAuth client credentials',
    keyHint: 'Use your Uber Direct client ID and secret.',
    capabilities: ['spend', 'usage'],
    accent: '#000000',
    bg: '#f4f4f5',
    description: 'Track delivery spend, trip costs, and volume from Uber Direct.',
    setupSteps: [
      'Open your Uber Developer dashboard and locate your Direct API credentials.',
      'Paste client ID and secret here (comma-separated: clientId,secret).',
      'Delimiter uses these to read trip costs and delivery history.',
    ],
    securityNote: 'Delimiter reads delivery data only. It never creates deliveries or charges your account.',
    statusNote: 'Initial connection stores credentials securely. Trip cost sync is next.',
  },
  {
    id: 'serper',
    name: 'Serper',
    shortName: 'Se',
    category: 'search',
    keyType: 'API key',
    keyHint: 'Copy your API key from the Serper dashboard.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#059669',
    bg: '#ecfdf5',
    description: 'Monitor search API credit balance, usage volume, and remaining quota from Serper.',
    setupSteps: [
      'Open your Serper dashboard and copy your API key.',
      'Paste it here. Delimiter checks your credit balance and usage.',
      'Rotate or delete the key anytime from Serper.',
    ],
    securityNote: 'Delimiter uses this key only to check credit balance and usage stats.',
  },
  {
    id: 'parallel',
    name: 'Parallel Markets',
    shortName: 'PM',
    category: 'identity',
    keyType: 'API key',
    keyHint: 'Create an API key from your Parallel Markets dashboard.',
    capabilities: ['spend', 'usage'],
    accent: '#1e40af',
    bg: '#eff6ff',
    description: 'Track KYC/identity verification volume and costs from Parallel Markets.',
    setupSteps: [
      'Open your Parallel Markets dashboard and create an API key.',
      'Paste it here. Delimiter reads verification counts and billing data.',
      'Rotate the key anytime from Parallel Markets.',
    ],
    securityNote: 'Delimiter reads billing and verification counts only. It never accesses user PII or triggers verifications.',
    statusNote: 'Initial connection stores the credential securely. Verification cost sync is next.',
  },
  {
    id: 'neon',
    name: 'Neon',
    shortName: 'Ne',
    category: 'infra',
    keyType: 'API key',
    keyHint: 'Create an API key from your Neon account settings.',
    capabilities: ['spend', 'usage', 'balance'],
    accent: '#00e699',
    bg: '#ecfff7',
    description: 'Monitor database compute hours, storage, and billing from your Neon Postgres projects.',
    setupSteps: [
      'Open Neon console and go to Account Settings > API Keys.',
      'Create a new API key for Delimiter.',
      'Paste it here. Delimiter reads project usage and billing data.',
    ],
    securityNote: 'Delimiter reads billing and usage metrics only. It never modifies databases or project settings.',
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
